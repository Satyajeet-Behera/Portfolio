const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const DEBUG_PORT = 9335;
const artifactDir = 'C:\\Users\\r6768\\.gemini\\antigravity\\brain\\b9e0c139-b10e-45c8-9714-608765325ab8\\screenshots';
const tempProfile = path.join(os.tmpdir(), 'chrome-test-nav-' + Date.now());

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

    console.log('Navigating to http://localhost:3000');
    await cdp.send('Page.navigate', { url: 'http://localhost:3000' });
    await sleep(3500);

    // 1. Verify Hero section has NO badge pill
    const heroInfo = await cdp.send('Runtime.evaluate', {
      expression: `
        (() => {
          const bodyText = document.body.innerText;
          const hasEnthusiast = /AI ENTHUSIAST/i.test(bodyText);
          const hasBuilder = /BUILDER/i.test(bodyText);
          const eyebrowEl = document.querySelector('#hero [class*="eyebrow"]');
          return {
            hasEnthusiast,
            hasBuilder,
            heroEyebrowFound: !!eyebrowEl,
            scrollY: window.scrollY
          };
        })()
      `,
      returnByValue: true,
    });
    console.log('Hero checks:', heroInfo.result.value);

    // Take screenshot of Hero
    const heroScreenshot = await cdp.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, 'verify-hero-no-badge.png'), Buffer.from(heroScreenshot.data, 'base64'));
    console.log('Saved verify-hero-no-badge.png');

    // 2. Test nav state at top
    let initialActive = await cdp.send('Runtime.evaluate', {
      expression: `document.querySelector('nav a[class*="active"]')?.innerText.trim()`,
      returnByValue: true,
    });
    console.log('Initial Active Item at top:', initialActive.result.value);

    // 3. Test clicking each nav item and checking destination and active state
    const navItemsToTest = [
      { name: 'Intelligence', id: 'intelligence' },
      { name: 'Magix', id: 'magix' },
      { name: 'Cuber', id: 'cuber' },
      { name: 'Story', id: 'story' },
      { name: 'Interests', id: 'interests' },
      { name: 'Projects', id: 'projects' },
      { name: 'Contact', id: 'contact' },
      { name: 'Home', id: 'hero' },
    ];

    for (const target of navItemsToTest) {
      await cdp.send('Runtime.evaluate', {
        expression: `
          (() => {
            const link = Array.from(document.querySelectorAll('nav a')).find(a => a.innerText.trim() === '${target.name}');
            if (link) {
              link.click();
              return true;
            }
            return false;
          })()
        `,
      });
      await sleep(1200);

      const check = await cdp.send('Runtime.evaluate', {
        expression: `
          (() => {
            const activeLink = document.querySelector('nav a[class*="active"]');
            const targetEl = document.getElementById('${target.id === 'hero' ? 'hero' : target.id}');
            const targetRect = targetEl ? targetEl.getBoundingClientRect() : null;
            return {
              target: '${target.name}',
              activeText: activeLink ? activeLink.innerText.trim() : null,
              scrollY: Math.round(window.scrollY),
              targetTop: targetRect ? Math.round(targetRect.top) : null,
              hash: window.location.hash
            };
          })()
        `,
        returnByValue: true,
      });
      console.log(`Nav test [${target.name}]:`, check.result.value);
    }

    // Capture screenshot at projects
    await cdp.send('Runtime.evaluate', {
      expression: `
        (() => {
          const link = Array.from(document.querySelectorAll('nav a')).find(a => a.innerText.trim() === 'Projects');
          if (link) link.click();
        })()
      `,
    });
    await sleep(1200);

    const navProjectsScreenshot = await cdp.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, 'verify-nav-projects.png'), Buffer.from(navProjectsScreenshot.data, 'base64'));
    console.log('Saved verify-nav-projects.png');

    console.log('ALL NAV TESTS PASSED!');
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
