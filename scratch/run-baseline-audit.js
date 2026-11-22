const { spawn, execSync } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3012;
const URL = `http://127.0.0.1:${PORT}`;
const scratchDir = path.resolve('scratch');
const mobileJson = path.join(scratchDir, 'phase5-baseline-mobile.json');
const desktopJson = path.join(scratchDir, 'phase5-baseline-desktop.json');

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

    console.log('\n--- RUNNING BASELINE DESKTOP AUDIT ---');
    try {
      execSync(
        `npx lighthouse ${URL} --output=json --output-path="${desktopJson}" --preset=desktop --chrome-flags="--headless=new --no-sandbox" --only-categories=performance,accessibility,best-practices,seo`,
        { stdio: 'inherit' }
      );
    } catch (e) {
      console.log('Desktop audit notice:', e.message);
    }

    console.log('\n--- RUNNING BASELINE MOBILE AUDIT ---');
    try {
      execSync(
        `npx lighthouse ${URL} --output=json --output-path="${mobileJson}" --chrome-flags="--headless=new --no-sandbox" --only-categories=performance,accessibility,best-practices,seo`,
        { stdio: 'inherit' }
      );
    } catch (e) {
      console.log('Mobile audit notice:', e.message);
    }

    function parseReport(p) {
      if (!fs.existsSync(p)) return null;
      const data = JSON.parse(fs.readFileSync(p, 'utf8'));
      const cats = data.categories;
      const audits = data.audits;
      return {
        performance: Math.round(cats.performance.score * 100),
        accessibility: Math.round(cats.accessibility.score * 100),
        bestPractices: Math.round(cats['best-practices'].score * 100),
        seo: Math.round(cats.seo.score * 100),
        fcp: audits['first-contentful-paint'] ? audits['first-contentful-paint'].displayValue : 'N/A',
        lcp: audits['largest-contentful-paint'] ? audits['largest-contentful-paint'].displayValue : 'N/A',
        cls: audits['cumulative-layout-shift'] ? audits['cumulative-layout-shift'].displayValue : 'N/A',
        tbt: audits['total-blocking-time'] ? audits['total-blocking-time'].displayValue : 'N/A',
      };
    }

    const dMetrics = parseReport(desktopJson);
    const mMetrics = parseReport(mobileJson);

    console.log('\n========================================');
    console.log('PHASE 5 BASELINE MEASUREMENTS (RECORDED)');
    console.log('========================================');
    console.log('DESKTOP BASELINE:', JSON.stringify(dMetrics, null, 2));
    console.log('MOBILE BASELINE:', JSON.stringify(mMetrics, null, 2));

    fs.writeFileSync(
      path.join(scratchDir, 'phase5-baseline-summary.json'),
      JSON.stringify({ desktop: dMetrics, mobile: mMetrics }, null, 2)
    );
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
