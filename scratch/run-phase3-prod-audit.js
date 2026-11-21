const { spawn, execSync } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3008;
const URL = `http://127.0.0.1:${PORT}`;
const scratchDir = path.resolve('scratch');
const mobileJson = path.join(scratchDir, 'phase3-lh-mobile-prod.json');
const desktopJson = path.join(scratchDir, 'phase3-lh-desktop-prod.json');

async function waitForServer(url, timeoutMs = 25000) {
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
    console.log(`Production server is responding at ${URL}`);

    console.log('\n--- RUNNING LIGHTHOUSE DESKTOP PROD AUDIT ---');
    try {
      execSync(
        `npx lighthouse ${URL} --output=json --output-path="${desktopJson}" --preset=desktop --chrome-flags="--headless=new --no-sandbox" --only-categories=performance,accessibility,best-practices,seo`,
        { stdio: 'inherit' }
      );
    } catch (e) {
      console.log('Desktop audit notice:', e.message);
    }

    console.log('\n--- RUNNING LIGHTHOUSE MOBILE PROD AUDIT ---');
    try {
      execSync(
        `npx lighthouse ${URL} --output=json --output-path="${mobileJson}" --chrome-flags="--headless=new --no-sandbox" --only-categories=performance,accessibility,best-practices,seo`,
        { stdio: 'inherit' }
      );
    } catch (e) {
      console.log('Mobile audit notice:', e.message);
    }

    function printReport(name, p) {
      if (fs.existsSync(p)) {
        const data = JSON.parse(fs.readFileSync(p, 'utf8'));
        const cats = data.categories;
        console.log(`\n=== OFFICIAL PRODUCTION LIGHTHOUSE: ${name.toUpperCase()} ===`);
        console.log(`Performance:    ${Math.round(cats.performance.score * 100)}`);
        console.log(`Accessibility:  ${Math.round(cats.accessibility.score * 100)}`);
        console.log(`Best Practices: ${Math.round(cats['best-practices'].score * 100)}`);
        console.log(`SEO:            ${Math.round(cats.seo.score * 100)}`);
      }
    }

    printReport('desktop', desktopJson);
    printReport('mobile', mobileJson);
  } finally {
    try {
      execSync(`taskkill /F /T /PID ${server.pid}`);
    } catch {
      server.kill();
    }
  }
}

run().catch((err) => {
  console.error('Audit run failed:', err);
  process.exit(1);
});
