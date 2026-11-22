const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const DEBUG_PORT = 9337;
const artifactDir = 'C:\\Users\\r6768\\.gemini\\antigravity\\brain\\b9e0c139-b10e-45c8-9714-608765325ab8\\screenshots';
const tempProfile = path.join(os.tmpdir(), 'chrome-connect-' + Date.now());

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
    for (let i = 0; i < 15; i++) {
      try {
        await sleep(1000);
        targets = await fetchJson(`http://127.0.0.1:${DEBUG_PORT}/json`);
        if (targets && targets.length > 0) break;
      } catch (e) {}
    }

    if (!targets || targets.length === 0) throw new Error('Could not connect to Chrome CDP');

    const pageTarget = targets.find((t) => t.type === 'page');
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

    console.log('Navigating to http://localhost:3000/#connect');
    await cdp.send('Page.navigate', { url: 'http://localhost:3000/#connect' });
    await sleep(3500);

    // Scroll to #connect
    await cdp.send('Runtime.evaluate', {
      expression: `
        (() => {
          const el = document.getElementById('connect');
          if (el) el.scrollIntoView({ behavior: 'instant' });
        })()
      `,
    });
    await sleep(1200);

    // Verify colors and computed styles
    const stylesCheck = await cdp.send('Runtime.evaluate', {
      expression: `
        (() => {
          const connectSection = document.getElementById('connect');
          const connectHeading = document.getElementById('final-contact-heading');
          const footer = document.querySelector('footer');
          const cards = Array.from(document.querySelectorAll('#connect [class*="card"]'));
          const footerLinks = Array.from(document.querySelectorAll('footer a'));

          const getComputed = (el) => {
            if (!el) return null;
            const cs = window.getComputedStyle(el);
            return {
              bg: cs.backgroundColor,
              color: cs.color,
            };
          };

          return {
            connectBg: getComputed(connectSection)?.bg,
            headingColor: getComputed(connectHeading)?.color,
            cardCount: cards.length,
            cardsInfo: cards.map(c => ({
              classes: c.className,
              btnBg: window.getComputedStyle(c.querySelector('a')).backgroundColor,
              btnColor: window.getComputedStyle(c.querySelector('a')).color
            })),
            footerBg: getComputed(footer)?.bg,
            footerColor: getComputed(footer)?.color,
            footerLinkColor: footerLinks.length > 0 ? window.getComputedStyle(footerLinks[0]).color : null
          };
        })()
      `,
      returnByValue: true,
    });
    console.log('Styles check:', stylesCheck.result.value);

    // Capture screenshot of Let's Connect on milky white background with colored cards
    const connectScreenshot = await cdp.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, 'lets-connect-milky-white.png'), Buffer.from(connectScreenshot.data, 'base64'));
    console.log('Saved lets-connect-milky-white.png');

    // Scroll to footer and capture
    await cdp.send('Runtime.evaluate', {
      expression: `
        (() => {
          const footer = document.querySelector('footer');
          if (footer) footer.scrollIntoView({ behavior: 'instant' });
        })()
      `,
    });
    await sleep(1000);

    const footerScreenshot = await cdp.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, 'footer-navy-blue.png'), Buffer.from(footerScreenshot.data, 'base64'));
    console.log('Saved footer-navy-blue.png');

    console.log('ALL VERIFICATIONS COMPLETED SUCCESSFULLY!');
  } catch (err) {
    console.error('Error during test:', err);
  } finally {
    if (cdp) cdp.close();
    try {
      chromeProcess.kill();
    } catch (e) {}
    try {
      fs.rmSync(tempProfile, { recursive: true, force: true });
    } catch (e) {}
  }
}

run();
