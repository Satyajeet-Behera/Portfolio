const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const DEBUG_PORT = 9348;
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
    try {
      this.ws.close();
    } catch (e) {}
  }
}

async function run() {
  const chromeProcess = spawn(
    CHROME,
    [
      '--headless=new',
      `--remote-debugging-port=${DEBUG_PORT}`,
      `--user-data-dir=${tempProfile}`,
      '--disable-gpu',
      '--no-sandbox',
      'about:blank',
    ]
  );

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

    if (!targets || targets.length === 0) throw new Error('Could not connect to Chrome CDP');

    const pageTarget = targets.find((t) => t.type === 'page') || targets[0];
    cdp = new CDPClient(pageTarget.webSocketDebuggerUrl);
    await cdp.connect();

    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false,
    });

    console.log('Navigating to http://localhost:3000');
    await cdp.send('Page.navigate', { url: 'http://localhost:3000' });
    await sleep(3500);

    // Verify logo in header
    const headerCheck = await cdp.send('Runtime.evaluate', {
      expression: `
        (() => {
          const header = document.querySelector('header');
          const headerImg = header ? header.querySelector('img[src*="logo"]') : null;
          return {
            headerFound: !!header,
            headerImgFound: !!headerImg,
            src: headerImg ? headerImg.currentSrc : null,
            naturalWidth: headerImg ? headerImg.naturalWidth : 0,
            naturalHeight: headerImg ? headerImg.naturalHeight : 0,
            renderedWidth: headerImg ? headerImg.offsetWidth : 0,
            renderedHeight: headerImg ? headerImg.offsetHeight : 0,
          };
        })()
      `,
      returnByValue: true,
    });
    console.log('Header Logo Check:', JSON.stringify(headerCheck.result.value, null, 2));

    // Capture Header screenshot
    const headerShot = await cdp.send('Page.captureScreenshot', {
      format: 'png',
      clip: { x: 0, y: 0, width: 1440, height: 120, scale: 1 },
    });
    fs.writeFileSync(
      path.join(artifactDir, 'header-logo-closeup.png'),
      Buffer.from(headerShot.data, 'base64')
    );
    console.log('Saved header-logo-closeup.png');

    // Scroll to footer directly
    await cdp.send('Runtime.evaluate', {
      expression: `
        (() => {
          const footer = document.querySelector('footer');
          if (footer) footer.scrollIntoView({ behavior: 'instant', block: 'start' });
        })()
      `,
    });
    await sleep(2000);

    // Verify logo in footer and get exact document coordinates
    const footerCheck = await cdp.send('Runtime.evaluate', {
      expression: `
        (() => {
          const footer = document.querySelector('footer');
          const footerImg = footer ? footer.querySelector('img[src*="logo"]') : null;
          const rect = footer ? footer.getBoundingClientRect() : null;
          return {
            footerFound: !!footer,
            footerImgFound: !!footerImg,
            src: footerImg ? footerImg.currentSrc : null,
            naturalWidth: footerImg ? footerImg.naturalWidth : 0,
            naturalHeight: footerImg ? footerImg.naturalHeight : 0,
            renderedWidth: footerImg ? footerImg.offsetWidth : 0,
            renderedHeight: footerImg ? footerImg.offsetHeight : 0,
            docY: rect ? Math.round(rect.top + window.scrollY) : 0,
            width: rect ? Math.round(rect.width) : 1440,
            height: rect ? Math.round(rect.height) : 400
          };
        })()
      `,
      returnByValue: true,
    });
    console.log('Footer Logo Check:', JSON.stringify(footerCheck.result.value, null, 2));

    const fVal = footerCheck.result.value;
    if (fVal) {
      const footerShot = await cdp.send('Page.captureScreenshot', {
        format: 'png',
        captureBeyondViewport: true,
        clip: {
          x: 0,
          y: fVal.docY,
          width: 1440,
          height: Math.min(500, fVal.height),
          scale: 1,
        },
      });
      fs.writeFileSync(
        path.join(artifactDir, 'footer-logo-closeup.png'),
        Buffer.from(footerShot.data, 'base64')
      );
      console.log('Saved footer-logo-closeup.png at docY=' + fVal.docY);
    }
  } catch (err) {
    console.error('Error during test:', err);
  } finally {
    if (cdp) cdp.close();
    chromeProcess.kill('SIGKILL');
    try {
      fs.rmSync(tempProfile, { recursive: true, force: true });
    } catch (e) {}
  }
}

run();
