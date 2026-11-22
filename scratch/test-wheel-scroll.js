const { spawn } = require('child_process');
const http = require('http');

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const DEBUG_PORT = 9222;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

class CDPClient {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.id = 0;
    this.pending = new Map();
  }
  async connect() {
    return new Promise((resolve, reject) => {
      this.ws.onopen = resolve;
      this.ws.onerror = reject;
      this.ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.id && this.pending.has(msg.id)) {
          const { resolve, reject } = this.pending.get(msg.id);
          this.pending.delete(msg.id);
          if (msg.error) reject(new Error(msg.error.message));
          else resolve(msg.result);
        }
      };
    });
  }
  send(method, params = {}) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }
  close() {
    this.ws.close();
  }
}

async function run() {
  const chromeProcess = spawn(CHROME, [
    '--headless=new',
    `--remote-debugging-port=${DEBUG_PORT}`,
    '--disable-gpu',
    '--no-sandbox',
    'about:blank',
  ]);
  await sleep(2000);

  const targets = await fetchJson(`http://127.0.0.1:${DEBUG_PORT}/json`);
  const pageTarget = targets.find((t) => t.type === 'page');
  const cdp = new CDPClient(pageTarget.webSocketDebuggerUrl);
  await cdp.connect();

  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');

  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });

  await cdp.send('Page.navigate', { url: 'http://localhost:3000/' });
  await sleep(3500);

  const docInfo = await cdp.send('Runtime.evaluate', {
    expression: `
      (() => {
        return {
          docScrollHeight: document.documentElement.scrollHeight,
          bodyScrollHeight: document.body.scrollHeight,
          docOffsetHeight: document.documentElement.offsetHeight,
          windowH: window.innerHeight,
          scrollY: window.scrollY,
        };
      })()
    `,
    returnByValue: true,
  });
  console.log('Doc info before scroll:', JSON.stringify(docInfo.result.value, null, 2));

  // Now let's try using Input.dispatchMouseEvent to simulate wheel scrolling!
  console.log('Simulating mouse wheel scroll down...');
  for (let i = 0; i < 30; i++) {
    await cdp.send('Input.dispatchMouseEvent', {
      type: 'mouseWheel',
      x: 720,
      y: 450,
      deltaX: 0,
      deltaY: 300,
    });
    await sleep(50);
  }
  await sleep(1000);

  const afterWheel = await cdp.send('Runtime.evaluate', {
    expression: `
      (() => {
        const sec = document.querySelector('#projects');
        const track = sec ? sec.querySelector('[role="list"]') : null;
        return {
          scrollY: window.scrollY,
          trackTransform: track ? window.getComputedStyle(track).transform : null,
          trackStyleTransform: track ? track.style.transform : null,
        };
      })()
    `,
    returnByValue: true,
  });
  console.log('After 30 wheel events:', JSON.stringify(afterWheel.result.value, null, 2));

  cdp.close();
  chromeProcess.kill();
}

run().catch(console.error);
