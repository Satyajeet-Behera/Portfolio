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

async function verifyAll() {
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

  // 1. Desktop 1440x900
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });

  await cdp.send('Page.navigate', { url: 'http://localhost:3000/' });
  await sleep(3500);

  // Wheel down to #projects
  const targetY = await cdp.send('Runtime.evaluate', {
    expression: `
      (() => {
        const sec = document.querySelector('#projects');
        return sec ? sec.getBoundingClientRect().top + window.scrollY : 7095;
      })()
    `,
    returnByValue: true,
  });

  const pTop = targetY.result.value;
  console.log('Scrolling to projects at Y =', pTop);

  // Wheel scroll to trigger ScrollTrigger smoothly
  await cdp.send('Runtime.evaluate', {
    expression: `window.scrollTo(0, ${pTop + 50});`,
  });
  await sleep(1200);

  const rects1440 = await cdp.send('Runtime.evaluate', {
    expression: `
      (() => {
        const articles = Array.from(document.querySelectorAll('#projects article'));
        const a0 = articles[0] ? articles[0].getBoundingClientRect() : null;
        const a1 = articles[1] ? articles[1].getBoundingClientRect() : null;
        const btn0 = articles[0] ? articles[0].querySelector('[class*="primaryLink"]').getBoundingClientRect() : null;
        return {
          card0Width: a0 ? Math.round(a0.width) : null,
          card1Width: a1 ? Math.round(a1.width) : null,
          card1VisiblePx: a1 ? Math.round(1440 - a1.left) : null,
          card1PctVisible: a1 ? ((1440 - a1.left) / a1.width * 100).toFixed(1) + '%' : null,
          btnVisible: btn0 ? (btn0.bottom <= 900 && btn0.top >= 0) : null,
          btnBottom: btn0 ? Math.round(btn0.bottom) : null
        };
      })()
    `,
    returnByValue: true,
  });
  console.log('1440x900 Pinned check:', JSON.stringify(rects1440.result.value, null, 2));

  let shot1440 = await cdp.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, 'projects-1-and-half-desktop.png'), Buffer.from(shot1440.data, 'base64'));
  console.log('Saved projects-1-and-half-desktop.png');

  // 2. Laptop 1366x768
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: 1366,
    height: 768,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await cdp.send('Page.navigate', { url: 'http://localhost:3000/' });
  await sleep(3000);

  const targetYLaptop = await cdp.send('Runtime.evaluate', {
    expression: `
      (() => {
        const sec = document.querySelector('#projects');
        return sec ? sec.getBoundingClientRect().top + window.scrollY : 7095;
      })()
    `,
    returnByValue: true,
  });

  await cdp.send('Runtime.evaluate', {
    expression: `window.scrollTo(0, ${targetYLaptop.result.value + 50});`,
  });
  await sleep(1200);

  const rects1366 = await cdp.send('Runtime.evaluate', {
    expression: `
      (() => {
        const articles = Array.from(document.querySelectorAll('#projects article'));
        const a0 = articles[0] ? articles[0].getBoundingClientRect() : null;
        const a1 = articles[1] ? articles[1].getBoundingClientRect() : null;
        const btn0 = articles[0] ? articles[0].querySelector('[class*="primaryLink"]').getBoundingClientRect() : null;
        return {
          card0Width: a0 ? Math.round(a0.width) : null,
          card1Width: a1 ? Math.round(a1.width) : null,
          card1VisiblePx: a1 ? Math.round(1366 - a1.left) : null,
          card1PctVisible: a1 ? ((1366 - a1.left) / a1.width * 100).toFixed(1) + '%' : null,
          btnVisible: btn0 ? (btn0.bottom <= 768 && btn0.top >= 0) : null,
          btnBottom: btn0 ? Math.round(btn0.bottom) : null
        };
      })()
    `,
    returnByValue: true,
  });
  console.log('1366x768 Pinned check:', JSON.stringify(rects1366.result.value, null, 2));

  let shot1366 = await cdp.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, 'projects-1-and-half-laptop.png'), Buffer.from(shot1366.data, 'base64'));
  console.log('Saved projects-1-and-half-laptop.png');

  cdp.close();
  chromeProcess.kill();
  console.log('All verification captures completed successfully.');
}

verifyAll().catch(console.error);
