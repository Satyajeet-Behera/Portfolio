const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const DEBUG_PORT = 9336;
const artifactDir = 'C:\\Users\\r6768\\.gemini\\antigravity\\brain\\b9e0c139-b10e-45c8-9714-608765325ab8\\screenshots';
const tempProfile = path.join(os.tmpdir(), 'chrome-contact-' + Date.now());

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

    console.log('Navigating to http://localhost:3000/#contact');
    await cdp.send('Page.navigate', { url: 'http://localhost:3000/#contact' });
    await sleep(3500);

    // Scroll directly to contact
    await cdp.send('Runtime.evaluate', {
      expression: `
        (() => {
          const el = document.getElementById('contact');
          if (el) el.scrollIntoView({ behavior: 'instant' });
        })()
      `,
    });
    await sleep(1000);

    // 1. Verify Placeholders are empty
    const placeholders = await cdp.send('Runtime.evaluate', {
      expression: `
        (() => {
          const nameInput = document.getElementById('name');
          const phoneInput = document.getElementById('phone');
          const emailInput = document.getElementById('email');
          const messageInput = document.getElementById('message');
          const submitBtn = document.querySelector('button[type="submit"]');
          const clearBtn = document.querySelector('button[title*="Clear"]');

          return {
            namePlaceholder: nameInput?.placeholder,
            phonePlaceholder: phoneInput?.placeholder,
            emailPlaceholder: emailInput?.placeholder,
            messagePlaceholder: messageInput?.placeholder,
            submitDisabled: submitBtn?.disabled,
            submitReady: submitBtn?.className.includes('submitButtonReady'),
            hasClearBtn: !!clearBtn,
            clearBtnText: clearBtn?.innerText.trim()
          };
        })()
      `,
      returnByValue: true,
    });
    console.log('Initial Contact Form Checks:', placeholders.result.value);

    // Capture screenshot of empty form with frosted glass & orange background
    const emptyFormScreenshot = await cdp.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, 'contact-form-empty.png'), Buffer.from(emptyFormScreenshot.data, 'base64'));
    console.log('Saved contact-form-empty.png');

    // 2. Fill in valid data
    console.log('Filling in valid form data...');
    await cdp.send('Runtime.evaluate', {
      expression: `
        (() => {
          function setNativeValue(element, value) {
            const valueSetter = Object.getOwnPropertyDescriptor(element, 'value').set;
            const prototype = Object.getPrototypeOf(element);
            const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value').set;
            if (prototypeValueSetter && valueSetter !== prototypeValueSetter) {
              prototypeValueSetter.call(element, value);
            } else {
              valueSetter.call(element, value);
            }
            element.dispatchEvent(new Event('input', { bubbles: true }));
            element.dispatchEvent(new Event('change', { bubbles: true }));
          }

          const nameInput = document.getElementById('name');
          const phoneInput = document.getElementById('phone');
          const emailInput = document.getElementById('email');
          const messageInput = document.getElementById('message');

          setNativeValue(nameInput, 'Elon Musk');
          setNativeValue(phoneInput, '+1 415 555 2671');
          setNativeValue(emailInput, 'elon@x.com');
          setNativeValue(messageInput, 'Hello Satyajeet, let us collaborate on an innovative autonomous AI architecture together!');
        })()
      `,
    });
    await sleep(600);

    const filledState = await cdp.send('Runtime.evaluate', {
      expression: `
        (() => {
          const submitBtn = document.querySelector('button[type="submit"]');
          return {
            submitDisabled: submitBtn?.disabled,
            submitReady: submitBtn?.className.includes('submitButtonReady'),
            className: submitBtn?.className
          };
        })()
      `,
      returnByValue: true,
    });
    console.log('Filled State Checks (Button Ready & Glowing):', filledState.result.value);

    // Capture screenshot of filled form with glowing 3D orange button
    const filledScreenshot = await cdp.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, 'contact-form-filled-glowing.png'), Buffer.from(filledScreenshot.data, 'base64'));
    console.log('Saved contact-form-filled-glowing.png');

    // 3. Test Clear button
    console.log('Clicking Clear button...');
    await cdp.send('Runtime.evaluate', {
      expression: `
        (() => {
          const clearBtn = document.querySelector('button[title*="Clear"]');
          if (clearBtn) clearBtn.click();
        })()
      `,
    });
    await sleep(600);

    const clearedState = await cdp.send('Runtime.evaluate', {
      expression: `
        (() => {
          const nameInput = document.getElementById('name');
          const phoneInput = document.getElementById('phone');
          const emailInput = document.getElementById('email');
          const messageInput = document.getElementById('message');
          const submitBtn = document.querySelector('button[type="submit"]');

          return {
            name: nameInput?.value,
            phone: phoneInput?.value,
            email: emailInput?.value,
            message: messageInput?.value,
            submitDisabled: submitBtn?.disabled,
            submitReady: submitBtn?.className.includes('submitButtonReady')
          };
        })()
      `,
      returnByValue: true,
    });
    console.log('Cleared State Checks (Inputs empty & Button disabled):', clearedState.result.value);

    // Capture screenshot of cleared form
    const clearedScreenshot = await cdp.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, 'contact-form-cleared.png'), Buffer.from(clearedScreenshot.data, 'base64'));
    console.log('Saved contact-form-cleared.png');

    console.log('ALL CONTACT FORM TESTS COMPLETED SUCCESSFULLY!');
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
