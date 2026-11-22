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
  const chromeProcess = spawn(CHROME, [
    '--headless=new',
    `--remote-debugging-port=${DEBUG_PORT}`,
    '--disable-gpu',
    '--no-sandbox',
    'about:blank',
  ]);

  let targets = null;
  for (let i = 0; i < 10; i++) {
    try {
      await sleep(1000);
      targets = await fetchJson(`http://127.0.0.1:${DEBUG_PORT}/json`);
      if (targets && targets.length > 0) break;
    } catch (e) {}
  }

  const pageTarget = targets.find((t) => t.type === 'page');
  const cdp = new CDPClient(pageTarget.webSocketDebuggerUrl);
  await cdp.connect();

  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');

  // Test 1440x900
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });

  await cdp.send('Page.navigate', { url: 'http://localhost:3000/#projects' });
  await sleep(3500);

  const check = await cdp.send('Runtime.evaluate', {
    expression: `
      (() => {
        const sec = document.querySelector('#projects');
        const articles = Array.from(document.querySelectorAll('article'));
        const a0 = articles[0] ? articles[0].getBoundingClientRect() : null;
        const a1 = articles[1] ? articles[1].getBoundingClientRect() : null;
        const img0 = articles[0] ? articles[0].querySelector('img').getBoundingClientRect() : null;
        const btn0 = articles[0] ? articles[0].querySelector('[class*="primaryLink"]').getBoundingClientRect() : null;
        
        return {
          scrollY: window.scrollY,
          articleCount: articles.length,
          a0: a0 ? { left: a0.left, right: a0.right, width: a0.width, height: a0.height, top: a0.top, bottom: a0.bottom } : null,
          a1: a1 ? { 
            left: a1.left, 
            right: a1.right, 
            width: a1.width, 
            visibleWidthInScreen: Math.max(0, 1440 - a1.left),
            pctVisible: ((1440 - a1.left) / a1.width * 100).toFixed(1) + '%'
          } : null,
          img0: img0 ? { width: img0.width, height: img0.height, ratio: (img0.width/img0.height).toFixed(2) } : null,
          btn0: btn0 ? { top: btn0.top, bottom: btn0.bottom, isVisible: btn0.bottom <= 900 } : null,
        };
      })()
    `,
    returnByValue: true,
  });

  console.log('1440x900 Evaluation result:', JSON.stringify(check.result.value, null, 2));

  const shot = await cdp.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, 'projects-1-and-half-proof.png'), Buffer.from(shot.data, 'base64'));
  console.log('Saved projects-1-and-half-proof.png, size:', shot.data.length);

  cdp.close();
  chromeProcess.kill();
}

run().catch(console.error);
