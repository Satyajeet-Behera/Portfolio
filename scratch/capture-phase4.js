const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const DEBUG_PORT = 9222;

const artifactDir = 'C:\\Users\\r6768\\.gemini\\antigravity\\brain\\b9e0c139-b10e-45c8-9714-608765325ab8\\screenshots';
if (!fs.existsSync(artifactDir)) fs.mkdirSync(artifactDir, { recursive: true });

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
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
  console.log('Launching headless Chrome for Phase 4 screenshots...');
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
  if (!pageTarget) throw new Error('No page target found');

  const cdp = new CDPClient(pageTarget.webSocketDebuggerUrl);
  await cdp.connect();
  console.log('Connected to Chrome DevTools Protocol.');

  await cdp.send('Page.enable');
  await cdp.send('DOM.enable');

  const captures = [
    // 1. Projects Section (Desktop)
    {
      name: 'projects-desktop-1440',
      url: 'http://localhost:3000/#projects',
      width: 1440,
      height: 900,
      selector: '#projects',
    },
    // 2. Projects Section (Mobile)
    {
      name: 'projects-mobile-390',
      url: 'http://localhost:3000/#projects',
      width: 390,
      height: 844,
      selector: '#projects',
    },
    // 3. Contact Form (Desktop)
    {
      name: 'contact-form-desktop-1440',
      url: 'http://localhost:3000/#contact',
      width: 1440,
      height: 900,
      selector: '#contact',
    },
    // 4. Contact Form (Mobile)
    {
      name: 'contact-form-mobile-390',
      url: 'http://localhost:3000/#contact',
      width: 390,
      height: 844,
      selector: '#contact',
    },
    // 5. Final Contact / Connect (Desktop)
    {
      name: 'final-connect-desktop-1440',
      url: 'http://localhost:3000/#connect',
      width: 1440,
      height: 900,
      selector: '#connect',
    },
    // 6. Footer (Desktop)
    {
      name: 'footer-desktop-1440',
      url: 'http://localhost:3000/#connect',
      width: 1440,
      height: 900,
      selector: 'footer',
    },
    // 7. Blog Listing (Desktop)
    {
      name: 'blog-index-desktop-1440',
      url: 'http://localhost:3000/blog',
      width: 1440,
      height: 900,
      selector: 'main',
    },
    // 8. Blog Single Post (Desktop)
    {
      name: 'blog-post-desktop-1440',
      url: 'http://localhost:3000/blog/building-magix-autonomous-ai-assistant',
      width: 1440,
      height: 900,
      selector: 'article',
    },
  ];

  for (const item of captures) {
    console.log(`\nCapturing ${item.name} (${item.width}x${item.height})...`);

    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: item.width,
      height: item.height,
      deviceScaleFactor: 1,
      mobile: item.width < 768,
    });

    await cdp.send('Page.navigate', { url: item.url });
    await sleep(1500);

    // Scroll to target element
    if (item.selector) {
      await cdp.send('Runtime.evaluate', {
        expression: `
          (() => {
            const el = document.querySelector('${item.selector}');
            if (el) {
              el.scrollIntoView({ behavior: 'instant', block: 'start' });
            }
          })()
        `,
      });
      await sleep(1000);
    }

    const { data } = await cdp.send('Page.captureScreenshot', {
      format: 'png',
    });

    const filename = `${item.name}.png`;
    const outputPath = path.join(artifactDir, filename);
    fs.writeFileSync(outputPath, Buffer.from(data, 'base64'));
    console.log(`Saved screenshot -> ${outputPath}`);
  }

  cdp.close();
  chromeProcess.kill();
  console.log('\nAll Phase 4 screenshots successfully generated!');
}

capture().catch((err) => {
  console.error(err);
  process.exit(1);
});
