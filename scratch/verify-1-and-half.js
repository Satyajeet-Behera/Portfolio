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

async function verify() {
  console.log('Launching headless Chrome...');
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
    } catch (e) {
      // retry
    }
  }
  const pageTarget = targets.find((t) => t.type === 'page');
  const cdp = new CDPClient(pageTarget.webSocketDebuggerUrl);
  await cdp.connect();

  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');

  const viewports = [
    { name: 'desktop-1440x900', w: 1440, h: 900 },
    { name: 'laptop-1366x768', w: 1366, h: 768 },
    { name: 'desktop-1920x1080', w: 1920, h: 1080 },
  ];

  for (const vp of viewports) {
    console.log(`\n--- Testing ${vp.name} ---`);
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: vp.w,
      height: vp.h,
      deviceScaleFactor: 1,
      mobile: false,
    });

    await cdp.send('Page.navigate', { url: 'http://localhost:3000/' });
    await sleep(3500);

    // Scroll to #projects
    const pos = await cdp.send('Runtime.evaluate', {
      expression: `
        (() => {
          const sec = document.querySelector('#projects');
          return sec ? sec.getBoundingClientRect().top + window.scrollY : 7000;
        })()
      `,
      returnByValue: true,
    });
    await cdp.send('Runtime.evaluate', {
      expression: `window.scrollTo(0, ${pos.result.value});`,
    });
    await sleep(1000);

    const metrics = await cdp.send('Runtime.evaluate', {
      expression: `
        (() => {
          const cards = Array.from(document.querySelectorAll('#projects article'));
          const c0 = cards[0] ? cards[0].getBoundingClientRect() : null;
          const c1 = cards[1] ? cards[1].getBoundingClientRect() : null;
          const img0 = cards[0] ? cards[0].querySelector('img').getBoundingClientRect() : null;
          const act0 = cards[0] ? cards[0].querySelector('[class*="actionRow"]').getBoundingClientRect() : null;
          
          return {
            windowW: window.innerWidth,
            windowH: window.innerHeight,
            card0: c0 ? { left: c0.left, right: c0.right, width: c0.width, height: c0.height, visiblePct: 100 } : null,
            card1: c1 ? { 
              left: c1.left, 
              right: c1.right, 
              width: c1.width, 
              visibleWidth: Math.max(0, window.innerWidth - c1.left),
              visiblePct: Math.round(Math.max(0, window.innerWidth - c1.left) / c1.width * 100) 
            } : null,
            image0: img0 ? { width: img0.width, height: img0.height, ratio: (img0.width/img0.height).toFixed(2) } : null,
            actionButtonsVisible: act0 ? (act0.bottom <= window.innerHeight && act0.top >= 0) : false,
            bottomClearance: act0 ? Math.round(window.innerHeight - act0.bottom) : null
          };
        })()
      `,
      returnByValue: true,
    });

    console.log(`Metrics for ${vp.name}:`, JSON.stringify(metrics.result.value, null, 2));

    const shot = await cdp.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, `projects-1-and-half-${vp.name}.png`), Buffer.from(shot.data, 'base64'));
    console.log(`Saved projects-1-and-half-${vp.name}.png`);
  }

  cdp.close();
  chromeProcess.kill();
  console.log('Verification finished.');
}

verify().catch((err) => {
  console.error(err);
  process.exit(1);
});
