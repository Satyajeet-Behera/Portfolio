const { spawn, execSync } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3010;
const URL = `http://127.0.0.1:${PORT}`;
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const viewports = [
  { name: 'mobile-360', width: 360, height: 740 },
  { name: 'mobile-390', width: 390, height: 844 },
  { name: 'mobile-430', width: 430, height: 932 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'laptop-1024', width: 1024, height: 768 },
  { name: 'desktop-1440', width: 1440, height: 900 },
  { name: 'desktop-1920', width: 1920, height: 1080 },
];

async function waitForServer(url, timeoutMs = 20000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      await new Promise((resolve, reject) => {
        const req = http.get(url, (res) => {
          if (res.statusCode === 200) resolve();
          else reject(new Error('Status: ' + res.statusCode));
        });
        req.on('error', reject);
        req.setTimeout(1000, () => req.destroy());
      });
      return true;
    } catch {
      await new Promise((r) => setTimeout(r, 400));
    }
  }
  throw new Error('Server did not start within timeout');
}

async function run() {
  console.log(`Starting Next.js production server on port ${PORT}...`);
  const server = spawn('npx', ['next', 'start', '-p', String(PORT), '-H', '127.0.0.1'], {
    shell: true,
    stdio: 'ignore',
  });

  try {
    await waitForServer(URL);
    console.log(`Server responding at ${URL}. Capturing screenshots...`);

    const shotsDir = path.resolve('scratch/screenshots');
    if (!fs.existsSync(shotsDir)) fs.mkdirSync(shotsDir, { recursive: true });

    for (const vp of viewports) {
      const outPath = path.join(shotsDir, `${vp.name}.png`);
      const cmd = `"${CHROME}" --headless=new --disable-gpu --no-sandbox --window-size=${vp.width},${vp.height} --screenshot="${outPath}" ${URL}`;
      execSync(cmd, { stdio: 'ignore' });
      const stats = fs.statSync(outPath);
      console.log(`Captured ${vp.name} (${vp.width}x${vp.height}): ${stats.size} bytes`);
    }

    // Capture Phase 2 Sections
    const sectionTargets = [
      { name: 'stark-desktop-1440', url: `${URL}/#intelligence`, width: 1440, height: 900 },
      { name: 'stark-mobile-390', url: `${URL}/#intelligence`, width: 390, height: 844 },
      { name: 'magix-desktop-1440', url: `${URL}/#magix`, width: 1440, height: 900 },
      { name: 'magix-mobile-390', url: `${URL}/#magix`, width: 390, height: 844 },
    ];

    for (const st of sectionTargets) {
      const outPath = path.join(shotsDir, `${st.name}.png`);
      const cmd = `"${CHROME}" --headless=new --disable-gpu --no-sandbox --window-size=${st.width},${st.height} --screenshot="${outPath}" "${st.url}"`;
      execSync(cmd, { stdio: 'ignore' });
      const stats = fs.statSync(outPath);
      console.log(`Captured ${st.name} (${st.width}x${st.height}): ${stats.size} bytes`);
    }

    // Copy to artifact directory
    const artifactDir = 'C:\\Users\\r6768\\.gemini\\antigravity\\brain\\b9e0c139-b10e-45c8-9714-608765325ab8\\screenshots';
    if (!fs.existsSync(artifactDir)) fs.mkdirSync(artifactDir, { recursive: true });

    for (const file of fs.readdirSync(shotsDir)) {
      if (file.endsWith('.png')) {
        fs.copyFileSync(path.join(shotsDir, file), path.join(artifactDir, file));
      }
    }
    console.log(`Copied screenshots to artifact directory: ${artifactDir}`);
    console.log('All viewports and sections successfully verified and captured.');
  } finally {
    try {
      execSync(`taskkill /F /T /PID ${server.pid}`);
    } catch {
      server.kill();
    }
  }
}

run().catch((err) => {
  console.error('Viewport verification failed:', err);
  process.exit(1);
});
