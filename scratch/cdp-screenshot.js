const { spawn, execSync } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const URL = 'http://localhost:3000';
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
    return new Promise((resolve, reject) => {
      const id = ++this.id;
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  close() {
    this.ws.close();
  }
}

async function main() {
  console.log('Spawning Chrome with remote debugging...');
  const chromeProcess = spawn(
    CHROME,
    [
      `--remote-debugging-port=${DEBUG_PORT}`,
      '--headless=new',
      '--disable-gpu',
      '--no-sandbox',
      '--hide-scrollbars',
      'about:blank',
    ],
    { stdio: 'ignore' }
  );

  // Wait for DevTools port
  let targets = null;
  for (let i = 0; i < 20; i++) {
    await sleep(400);
    try {
      targets = await fetchJson(`http://127.0.0.1:${DEBUG_PORT}/json`);
      if (targets && targets.length > 0) break;
    } catch {}
  }

  if (!targets || targets.length === 0) {
    throw new Error('Failed to connect to Chrome DevTools port');
  }

  const pageTarget = targets.find((t) => t.type === 'page') || targets[0];
  console.log('Connecting to target:', pageTarget.webSocketDebuggerUrl);

  const client = new CDPClient(pageTarget.webSocketDebuggerUrl);
  await client.connect();
  console.log('CDP Connected!');

  await client.send('Page.enable');
  await client.send('Runtime.enable');

  const sections = ['cuber', 'story', 'interests', 'goals'];
  const viewports = [
    { name: 'desktop-1440', width: 1440, height: 900, dpr: 1 },
    { name: 'mobile-390', width: 390, height: 844, dpr: 2 },
  ];

  for (const vp of viewports) {
    console.log(`\nConfiguring viewport: ${vp.name} (${vp.width}x${vp.height})...`);
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: vp.width,
      height: vp.height,
      deviceScaleFactor: vp.dpr,
      mobile: vp.name.includes('mobile'),
    });

    console.log(`Navigating to ${URL}...`);
    await client.send('Page.navigate', { url: URL });
    await sleep(2500); // Allow full hydration & image decoding

    for (const sec of sections) {
      console.log(`Scrolling to #${sec} on ${vp.name}...`);
      await client.send('Runtime.evaluate', {
        expression: `
          (function() {
            const el = document.getElementById('${sec}');
            if (el) {
              el.scrollIntoView({ behavior: 'instant', block: 'start' });
            }
          })()
        `,
      });
      await sleep(1000); // Wait for transition & render

      const screenshot = await client.send('Page.captureScreenshot', {
        format: 'png',
      });

      const buffer = Buffer.from(screenshot.data, 'base64');
      const filename = `${sec}-${vp.name}.png`;
      const outPath = path.join(artifactDir, filename);
      fs.writeFileSync(outPath, buffer);
      console.log(`Saved screenshot: ${filename} (${buffer.length} bytes)`);
    }
  }

  client.close();
  try {
    chromeProcess.kill();
  } catch {}
  console.log('\nAll section screenshots captured successfully!');
}

main().catch((err) => {
  console.error('CDP screenshot failed:', err);
  process.exit(1);
});
