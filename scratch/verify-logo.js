const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const DEBUG_PORT = 9345;
const artifactDir = 'C:\\Users\\r6768\\.gemini\\antigravity\\brain\\b9e0c139-b10e-45c8-9714-608765325ab8\\screenshots';
const tempProfile = path.join(os.tmpdir(), 'chrome-logo-' + Date.now());

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
  const chromeProcess = spawn(
    CHROME,
    [
      `--remote-debugging-port=${DEBUG_PORT}`,
      `--user-data-dir=${tempProfile}`,
      '--headless=new',
      '--disable-gpu',
      '--no-sandbox',
      '--window-size=1440,1080',
    ],
    { stdio: 'ignore' }
  );

  let cdp = null;
  try {
    let version = null;
    for (let i = 0; i < 30; i++) {
      try {
        version = await fetchJson(`http://127.0.0.1:${DEBUG_PORT}/json/version`);
        if (version) break;
      } catch (e) {
        await sleep(200);
      }
    }
    if (!version) throw new Error('Chrome failed to start');

    const targets = await fetchJson(`http://127.0.0.1:${DEBUG_PORT}/json/list`);
    const pageTarget = targets.find((t) => t.type === 'page') || targets[0];
    cdp = new CDPClient(pageTarget.webSocketDebuggerUrl);
    await cdp.connect();

    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 1080,
      deviceScaleFactor: 1,
      mobile: false,
    });

    await cdp.send('Page.navigate', { url: 'http://localhost:3000/' });
    await sleep(2500);

    // 1. Capture Header Logo
    const headerShot = await cdp.send('Page.captureScreenshot', {
      format: 'png',
      clip: { x: 0, y: 0, width: 1440, height: 120, scale: 1 },
    });
    fs.writeFileSync(
      path.join(artifactDir, 'header-logo-closeup.png'),
      Buffer.from(headerShot.data, 'base64')
    );
    console.log('Saved header-logo-closeup.png');

    // 2. Scroll to footer and capture
    await cdp.send('Runtime.evaluate', {
      expression: `window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' });`,
    });
    await sleep(1000);

    const footerRect = await cdp.send('Runtime.evaluate', {
      expression: `
        (() => {
          const footer = document.querySelector('footer');
          if (!footer) return null;
          const rect = footer.getBoundingClientRect();
          return { x: rect.left, y: rect.top, width: rect.width, height: rect.height };
        })()
      `,
      returnByValue: true,
    });

    const footerShot = await cdp.send('Page.captureScreenshot', {
      format: 'png',
      clip: {
        x: 0,
        y: Math.max(0, footerRect.result.value ? footerRect.result.value.y : 500),
        width: 1440,
        height: Math.min(580, footerRect.result.value ? footerRect.result.value.height : 580),
        scale: 1,
      },
    });
    fs.writeFileSync(
      path.join(artifactDir, 'footer-logo-closeup.png'),
      Buffer.from(footerShot.data, 'base64')
    );
    console.log('Saved footer-logo-closeup.png');
  } catch (err) {
    console.error('Error in capture:', err);
  } finally {
    if (cdp) cdp.close();
    chromeProcess.kill('SIGKILL');
    try {
      fs.rmSync(tempProfile, { recursive: true, force: true });
    } catch (e) {}
  }
}

run();
