const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const DEBUG_PORT = 9222;
const artifactDir = 'C:\\Users\\r6768\\.gemini\\antigravity\\brain\\b9e0c139-b10e-45c8-9714-608765325ab8\\screenshots';

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
  console.log('Launching headless Chrome...');
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
  await cdp.send('DOM.enable');

  const vps = [
    { name: 'laptop-1366x768', width: 1366, height: 768 },
    { name: 'desktop-1440x900', width: 1440, height: 900 },
    { name: 'desktop-1920x1080', width: 1920, height: 1080 }
  ];

  for (const vp of vps) {
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: vp.width,
      height: vp.height,
      deviceScaleFactor: 1,
      mobile: false,
    });

    await cdp.send('Page.navigate', { url: 'http://localhost:3000/#projects' });
    await sleep(2000);

    // Get bounding client rect of #projects and action row
    const info = await cdp.send('Runtime.evaluate', {
      expression: `
        (() => {
          const sec = document.querySelector('#projects');
          const card = document.querySelector('.ProjectsSection_projectCard__L41lZ') || document.querySelector('article');
          const actionRow = document.querySelector('.ProjectsSection_actionRow__s9Gz1') || document.querySelector('[class*="actionRow"]');
          const secRect = sec ? sec.getBoundingClientRect() : null;
          const cardRect = card ? card.getBoundingClientRect() : null;
          const actionRect = actionRow ? actionRow.getBoundingClientRect() : null;
          return {
            windowH: window.innerHeight,
            windowW: window.innerWidth,
            secRect,
            cardRect,
            actionRect,
          };
        })()
      `,
      returnByValue: true,
    });
    console.log(`Viewport ${vp.name} rects:`, JSON.stringify(info.result.value, null, 2));

    const shot = await cdp.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, `eval-${vp.name}.png`), Buffer.from(shot.data, 'base64'));
    console.log(`Saved eval-${vp.name}.png`);
  }

  cdp.close();
  chromeProcess.kill();
  console.log('Done');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
