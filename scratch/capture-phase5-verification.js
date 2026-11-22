const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const DEBUG_PORT = 9366;
const artifactDir = path.join(__dirname, '..', 'screenshots', 'phase5-final');
const tempProfile = path.join(os.tmpdir(), 'chrome-phase5-verif-' + Date.now());

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
    try {
      this.ws.close();
    } catch (e) {}
  }
}

async function capture(cdp, filename) {
  const shot = await cdp.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactDir, filename), Buffer.from(shot.data, 'base64'));
  console.log(`Saved ${filename}`);
}

async function run() {
  if (!fs.existsSync(artifactDir)) {
    fs.mkdirSync(artifactDir, { recursive: true });
  }

  // Start Next.js production server
  const server = spawn('node', ['node_modules/next/dist/bin/next', 'start', '-p', '3014'], {
    stdio: 'ignore',
  });

  await sleep(3000);

  const chromeProcess = spawn(CHROME, [
    '--headless=new',
    `--remote-debugging-port=${DEBUG_PORT}`,
    `--user-data-dir=${tempProfile}`,
    '--disable-gpu',
    '--no-sandbox',
    'about:blank',
  ]);

  let cdp;
  try {
    let targets = null;
    for (let i = 0; i < 20; i++) {
      try {
        await sleep(500);
        targets = await fetchJson(`http://127.0.0.1:${DEBUG_PORT}/json`);
        if (targets && targets.length > 0) break;
      } catch (e) {}
    }

    const pageTarget = targets.find((t) => t.type === 'page');
    cdp = new CDPClient(pageTarget.webSocketDebuggerUrl);
    await cdp.connect();
    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');

    // 1. Desktop Mode (1440x900)
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 900,
      deviceScaleFactor: 2,
      mobile: false,
    });

    await cdp.send('Page.navigate', { url: 'http://127.0.0.1:3014' });
    await sleep(2500);

    // Capture Desktop Hero
    await capture(cdp, '01-desktop-hero.png');

    // Scroll to Tony Stark Section
    await cdp.send('Runtime.evaluate', {
      expression: `document.getElementById('intelligence')?.scrollIntoView({ behavior: 'instant', block: 'start' });`,
    });
    await sleep(1000);
    await capture(cdp, '02-desktop-tony-stark-state1.png');

    // Cursor Mask Simulation: Move pointer over Tony Stark canvas center
    const evalCanvas = await cdp.send('Runtime.evaluate', {
      expression: `
        (() => {
          const c = document.querySelector('canvas');
          if (!c) return null;
          const rect = c.getBoundingClientRect();
          return { x: rect.left + rect.width * 0.45, y: rect.top + rect.height * 0.38 };
        })()
      `,
      returnByValue: true,
    });

    if (evalCanvas.result?.value) {
      const { x, y } = evalCanvas.result.value;
      await cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y });
      await sleep(500);
      await capture(cdp, '03-desktop-tony-stark-cursor-mask.png');
    }

    // Scroll through Tony Stark Scroll transformation states
    await cdp.send('Runtime.evaluate', {
      expression: `window.scrollBy({ top: 650, behavior: 'instant' });`,
    });
    await sleep(800);
    await capture(cdp, '04-desktop-tony-stark-scroll-state3.png');

    await cdp.send('Runtime.evaluate', {
      expression: `window.scrollBy({ top: 900, behavior: 'instant' });`,
    });
    await sleep(800);
    await capture(cdp, '05-desktop-tony-stark-scroll-state5.png');

    // Scroll to Projects Section
    await cdp.send('Runtime.evaluate', {
      expression: `document.getElementById('projects')?.scrollIntoView({ behavior: 'instant', block: 'start' });`,
    });
    await sleep(1000);
    await capture(cdp, '06-desktop-projects-showcase.png');

    // Horizontal glide in projects
    await cdp.send('Runtime.evaluate', {
      expression: `window.scrollBy({ top: 950, behavior: 'instant' });`,
    });
    await sleep(800);
    await capture(cdp, '07-desktop-projects-horizontal-glide.png');

    // Scroll to Contact Form
    await cdp.send('Runtime.evaluate', {
      expression: `document.getElementById('contact')?.scrollIntoView({ behavior: 'instant', block: 'start' });`,
    });
    await sleep(1000);
    await capture(cdp, '08-desktop-contact-form.png');

    // Scroll to Let's Connect & Footer
    await cdp.send('Runtime.evaluate', {
      expression: `document.getElementById('connect')?.scrollIntoView({ behavior: 'instant', block: 'start' });`,
    });
    await sleep(1000);
    await capture(cdp, '09-desktop-final-connect-footer.png');

    // 2. Mobile Mode (390x844)
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true,
      hasTouch: true,
    });

    await cdp.send('Page.navigate', { url: 'http://127.0.0.1:3014' });
    await sleep(2000);
    await capture(cdp, '10-mobile-hero.png');

    await cdp.send('Runtime.evaluate', {
      expression: `document.getElementById('projects')?.scrollIntoView({ behavior: 'instant', block: 'start' });`,
    });
    await sleep(1000);
    await capture(cdp, '11-mobile-projects.png');

    await cdp.send('Runtime.evaluate', {
      expression: `document.getElementById('connect')?.scrollIntoView({ behavior: 'instant', block: 'start' });`,
    });
    await sleep(1000);
    await capture(cdp, '12-mobile-connect-footer.png');

    console.log('--- ALL VERIFICATION SCREENSHOTS CAPTURED SUCCESSFULLY ---');
  } finally {
    if (cdp) cdp.close();
    chromeProcess.kill();
    server.kill();
    try {
      fs.rmSync(tempProfile, { recursive: true, force: true });
    } catch (e) {}
  }
}

run().catch((err) => {
  console.error('Error running verification:', err);
  process.exit(1);
});
