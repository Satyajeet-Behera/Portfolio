const { spawn, execSync } = require('child_process');
const http = require('http');

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9222;

async function run() {
  console.log('Launching Chrome with remote debugging on port ' + PORT + '...');
  const chrome = spawn(
    CHROME,
    [
      '--headless=new',
      `--remote-debugging-port=${PORT}`,
      '--disable-gpu',
      '--no-sandbox',
      'http://localhost:3000',
    ],
    { stdio: 'ignore' }
  );

  try {
    // Wait for Chrome DevTools endpoint
    let wsUrl = null;
    for (let i = 0; i < 20; i++) {
      await new Promise((r) => setTimeout(r, 400));
      try {
        const list = await new Promise((resolve, reject) => {
          http.get(`http://127.0.0.1:${PORT}/json/list`, (res) => {
            let body = '';
            res.on('data', (c) => (body += c));
            res.on('end', () => resolve(JSON.parse(body)));
          }).on('error', reject);
        });
        if (list && list.length > 0 && list[0].webSocketDebuggerUrl) {
          wsUrl = list[0].webSocketDebuggerUrl;
          break;
        }
      } catch {}
    }

    console.log('Debugger WebSocket URL:', wsUrl);

    // Let's connect WebSocket using native Node.js or simple script
  } finally {
    try {
      execSync(`taskkill /F /T /PID ${chrome.pid}`);
    } catch {
      chrome.kill();
    }
  }
}

run().catch(console.error);
