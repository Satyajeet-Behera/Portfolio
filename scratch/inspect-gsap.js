const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');

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
    '--hide-scrollbars',
    'about:blank',
  ]);
  await sleep(1500);

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

  await cdp.send('Page.navigate', { url: 'http://localhost:3000/#projects' });
  await sleep(2000);

  const res = await cdp.send('Runtime.evaluate', {
    expression: `
      (() => {
        const sec = document.querySelector('#projects');
        const track = sec.querySelector('[class*="track"]');
        const cards = sec.querySelectorAll('article');
        
        // Find GSAP animation on track if any
        let animInfo = null;
        if (track) {
          animInfo = {
            scrollWidth: track.scrollWidth,
            clientWidth: track.clientWidth,
            offsetWidth: track.offsetWidth,
            windowW: window.innerWidth,
            transform: window.getComputedStyle(track).transform,
            styleTransform: track.style.transform,
            cardsCount: cards.length,
            cardWidths: Array.from(cards).map(c => c.offsetWidth)
          };
        }
        return animInfo;
      })()
    `,
    returnByValue: true,
  });

  console.log('Track details:', JSON.stringify(res.result.value, null, 2));

  // Try scrolling 1000px down
  await cdp.send('Runtime.evaluate', {
    expression: `window.scrollBy({ top: 1500, behavior: 'instant' });`,
  });
  await sleep(1000);

  const afterRes = await cdp.send('Runtime.evaluate', {
    expression: `
      (() => {
        const sec = document.querySelector('#projects');
        const track = sec.querySelector('[class*="track"]');
        return {
          scrollY: window.scrollY,
          transform: track ? window.getComputedStyle(track).transform : null,
          styleTransform: track ? track.style.transform : null,
          styleCssText: track ? track.style.cssText : null,
        };
      })()
    `,
    returnByValue: true,
  });
  console.log('After scroll:', JSON.stringify(afterRes.result.value, null, 2));

  cdp.close();
  chromeProcess.kill();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
