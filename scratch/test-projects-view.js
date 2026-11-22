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

  const testViewports = [
    { name: 'projects-fix-1440x900', width: 1440, height: 900 },
    { name: 'projects-fix-1366x768', width: 1366, height: 768 },
  ];

  for (const vp of testViewports) {
    console.log(`Setting viewport ${vp.name} (${vp.width}x${vp.height})...`);
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: vp.width,
      height: vp.height,
      deviceScaleFactor: 1,
      mobile: false,
    });

    await cdp.send('Page.navigate', { url: 'http://localhost:3000/#projects' });
    await sleep(2000);

    // Scroll directly to #projects
    await cdp.send('Runtime.evaluate', {
      expression: `
        (() => {
          const el = document.querySelector('#projects');
          if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
        })()
      `,
    });
    await sleep(1200);

    // Capture initial start
    let { data } = await cdp.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, `${vp.name}-start.png`), Buffer.from(data, 'base64'));
    console.log(`Saved ${vp.name}-start.png`);

    // Scroll slightly into the horizontal track to view middle cards
    await cdp.send('Runtime.evaluate', {
      expression: `window.scrollBy({ top: 450, behavior: 'instant' });`,
    });
    await sleep(800);

    let scrolled = await cdp.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, `${vp.name}-mid.png`), Buffer.from(scrolled.data, 'base64'));
    console.log(`Saved ${vp.name}-mid.png`);
  }

  cdp.close();
  chromeProcess.kill();
  console.log('Capture completed.');
}

run().catch(console.error);
