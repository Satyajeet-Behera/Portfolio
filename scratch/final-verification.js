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

async function capture() {
  console.log('Launching headless Chrome for final verification...');
  const chromeProcess = spawn(CHROME, [
    '--headless=new',
    `--remote-debugging-port=${DEBUG_PORT}`,
    '--disable-gpu',
    '--no-sandbox',
    'about:blank',
  ]);
  await sleep(2500);

  const targets = await fetchJson(`http://127.0.0.1:${DEBUG_PORT}/json`);
  const pageTarget = targets.find((t) => t.type === 'page');
  const cdp = new CDPClient(pageTarget.webSocketDebuggerUrl);
  await cdp.connect();

  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');

  // 1. Desktop 1440x900
  console.log('Testing 1440x900...');
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });

  await cdp.send('Page.navigate', { url: 'http://localhost:3000/' });
  await sleep(3500);

  // Scroll smoothly down to #projects
  const projectsPos = await cdp.send('Runtime.evaluate', {
    expression: `
      (() => {
        const sec = document.querySelector('#projects');
        return sec ? sec.getBoundingClientRect().top + window.scrollY : 7000;
      })()
    `,
    returnByValue: true,
  });
  const pTop = projectsPos.result.value;
  console.log('Projects section starts at Y =', pTop);

  // Position at projects top
  await cdp.send('Runtime.evaluate', {
    expression: `window.scrollTo(0, ${pTop});`,
  });
  await sleep(1000);

  let shot1 = await cdp.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, 'projects-golden-hour-1440-start.png'), Buffer.from(shot1.data, 'base64'));
  console.log('Captured projects-golden-hour-1440-start.png');

  // Wheel scroll forward by 12 wheel ticks (mid-scroll)
  for (let i = 0; i < 12; i++) {
    await cdp.send('Input.dispatchMouseEvent', {
      type: 'mouseWheel',
      x: 720,
      y: 450,
      deltaX: 0,
      deltaY: 250,
    });
    await sleep(60);
  }
  await sleep(1000);

  let shot2 = await cdp.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, 'projects-golden-hour-1440-mid.png'), Buffer.from(shot2.data, 'base64'));
  console.log('Captured projects-golden-hour-1440-mid.png');

  // Wheel scroll forward to end cards
  for (let i = 0; i < 18; i++) {
    await cdp.send('Input.dispatchMouseEvent', {
      type: 'mouseWheel',
      x: 720,
      y: 450,
      deltaX: 0,
      deltaY: 250,
    });
    await sleep(60);
  }
  await sleep(1000);

  let shot3 = await cdp.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, 'projects-golden-hour-1440-end.png'), Buffer.from(shot3.data, 'base64'));
  console.log('Captured projects-golden-hour-1440-end.png');

  // 2. Laptop 1366x768
  console.log('Testing 1366x768...');
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: 1366,
    height: 768,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await cdp.send('Page.navigate', { url: 'http://localhost:3000/' });
  await sleep(3000);

  const pPosLaptop = await cdp.send('Runtime.evaluate', {
    expression: `
      (() => {
        const sec = document.querySelector('#projects');
        return sec ? sec.getBoundingClientRect().top + window.scrollY : 7000;
      })()
    `,
    returnByValue: true,
  });
  await cdp.send('Runtime.evaluate', {
    expression: `window.scrollTo(0, ${pPosLaptop.result.value});`,
  });
  await sleep(1000);

  let shotLaptop = await cdp.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, 'projects-golden-hour-1366-start.png'), Buffer.from(shotLaptop.data, 'base64'));
  console.log('Captured projects-golden-hour-1366-start.png');

  // 3. Mobile 390x844
  console.log('Testing mobile 390x844...');
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true,
  });
  await cdp.send('Page.navigate', { url: 'http://localhost:3000/#projects' });
  await sleep(2500);

  let shotMobile = await cdp.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, 'projects-golden-hour-mobile-390.png'), Buffer.from(shotMobile.data, 'base64'));
  console.log('Captured projects-golden-hour-mobile-390.png');

  cdp.close();
  chromeProcess.kill();
  console.log('All verification captures completed successfully!');
}

capture().catch((err) => {
  console.error('Capture error:', err);
  process.exit(1);
});
