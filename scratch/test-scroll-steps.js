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

  // Test standard laptop 1366x768 and desktop 1440x900
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });

  await cdp.send('Page.navigate', { url: 'http://localhost:3000/' });
  await sleep(2500);

  // Measure start and position of #projects
  const initialInfo = await cdp.send('Runtime.evaluate', {
    expression: `
      (() => {
        const sec = document.querySelector('#projects');
        const st = window.ScrollTrigger ? window.ScrollTrigger.getAll().map(s => ({
          trigger: s.trigger ? s.trigger.tagName + '.' + s.trigger.className.slice(0, 30) : 'none',
          start: s.start,
          end: s.end,
          pin: !!s.pin,
        })) : [];
        const rect = sec.getBoundingClientRect();
        return {
          projectsTop: rect.top + window.scrollY,
          triggers: st
        };
      })()
    `,
    returnByValue: true,
  });

  console.log('Initial ScrollTriggers and Projects top:', JSON.stringify(initialInfo.result.value, null, 2));

  // Now scroll directly to projectsTop - 100, then into projectsTop, then in increments of 500
  const pTop = initialInfo.result.value.projectsTop;
  const scrollSteps = [
    pTop - 200,
    pTop,
    pTop + 500,
    pTop + 1500,
    pTop + 3000,
  ];

  for (let i = 0; i < scrollSteps.length; i++) {
    const targetY = scrollSteps[i];
    await cdp.send('Runtime.evaluate', {
      expression: `window.scrollTo({ top: ${targetY}, behavior: 'instant' });`,
    });
    await sleep(600);

    const stepInfo = await cdp.send('Runtime.evaluate', {
      expression: `
        (() => {
          const sec = document.querySelector('#projects');
          const track = sec.querySelector('[class*="track"]');
          const card = sec.querySelector('article');
          const actionRow = card ? card.querySelector('[class*="actionRow"]') : null;
          const rect = sec.getBoundingClientRect();
          const cardRect = card ? card.getBoundingClientRect() : null;
          const actRect = actionRow ? actionRow.getBoundingClientRect() : null;
          const computedTrack = track ? window.getComputedStyle(track).transform : 'none';
          return {
            scrollY: window.scrollY,
            secRect: { top: rect.top, bottom: rect.bottom, height: rect.height },
            cardRect: cardRect ? { top: cardRect.top, bottom: cardRect.bottom, height: cardRect.height } : null,
            actRect: actRect ? { top: actRect.top, bottom: actRect.bottom, isVisible: actRect.bottom <= window.innerHeight && actRect.top >= 0 } : null,
            trackTransform: computedTrack,
          };
        })()
      `,
      returnByValue: true,
    });

    console.log(`Step ${i} (targetY ${targetY}):`, JSON.stringify(stepInfo.result.value, null, 2));

    const shot = await cdp.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, `scroll-step-${i}.png`), Buffer.from(shot.data, 'base64'));
  }

  cdp.close();
  chromeProcess.kill();
  console.log('Scroll step test complete.');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
