const { spawn, execSync } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3009;
const URL = `http://127.0.0.1:${PORT}`;

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
      await new Promise((r) => setTimeout(r, 500));
    }
  }
  throw new Error('Server did not start within timeout');
}

async function run() {
  console.log(`Starting Next.js production server on port ${PORT}...`);
  const server = spawn('npx', ['next', 'start', '-p', String(PORT), '-H', '127.0.0.1'], {
    shell: true,
    stdio: 'inherit',
  });

  try {
    await waitForServer(URL);
    console.log(`Server is responding at ${URL}`);

    const scratchDir = path.resolve('scratch');
    if (!fs.existsSync(scratchDir)) fs.mkdirSync(scratchDir, { recursive: true });

    const mobileJson = path.join(scratchDir, 'lighthouse-mobile.json');
    const desktopJson = path.join(scratchDir, 'lighthouse-desktop.json');

    console.log('\n--- RUNNING LIGHTHOUSE MOBILE AUDIT ---');
    execSync(
      `npx lighthouse ${URL} --output=json --output-path="${mobileJson}" --chrome-flags="--headless=new --no-sandbox" --only-categories=performance,accessibility,best-practices,seo`,
      { stdio: 'inherit' }
    );

    console.log('\n--- RUNNING LIGHTHOUSE DESKTOP AUDIT ---');
    execSync(
      `npx lighthouse ${URL} --preset=desktop --output=json --output-path="${desktopJson}" --chrome-flags="--headless=new --no-sandbox" --only-categories=performance,accessibility,best-practices,seo`,
      { stdio: 'inherit' }
    );

    const parseReport = (file, label) => {
      const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
      const cats = data.categories;
      const audits = data.audits;

      console.log(`\n========================================`);
      console.log(`LIGHTHOUSE RESULTS: ${label.toUpperCase()}`);
      console.log(`========================================`);
      console.log(`Performance:    ${Math.round((cats.performance?.score || 0) * 100)} / 100`);
      console.log(`Accessibility:  ${Math.round((cats.accessibility?.score || 0) * 100)} / 100`);
      console.log(`Best Practices: ${Math.round((cats['best-practices']?.score || 0) * 100)} / 100`);
      console.log(`SEO:            ${Math.round((cats.seo?.score || 0) * 100)} / 100`);
      console.log(`----------------------------------------`);
      console.log(`LCP (Largest Contentful Paint): ${audits['largest-contentful-paint']?.displayValue}`);
      console.log(`CLS (Cumulative Layout Shift):  ${audits['cumulative-layout-shift']?.displayValue}`);
      console.log(`TBT (Total Blocking Time):      ${audits['total-blocking-time']?.displayValue}`);
      console.log(`FCP (First Contentful Paint):    ${audits['first-contentful-paint']?.displayValue}`);
      console.log(`Speed Index:                    ${audits['speed-index']?.displayValue}`);
      console.log(`========================================\n`);

      return {
        label,
        performance: Math.round((cats.performance?.score || 0) * 100),
        accessibility: Math.round((cats.accessibility?.score || 0) * 100),
        bestPractices: Math.round((cats['best-practices']?.score || 0) * 100),
        seo: Math.round((cats.seo?.score || 0) * 100),
        lcp: audits['largest-contentful-paint']?.displayValue,
        cls: audits['cumulative-layout-shift']?.displayValue,
        tbt: audits['total-blocking-time']?.displayValue,
        fcp: audits['first-contentful-paint']?.displayValue,
      };
    };

    const mobileSummary = parseReport(mobileJson, 'Mobile');
    const desktopSummary = parseReport(desktopJson, 'Desktop');

    fs.writeFileSync(
      path.join(scratchDir, 'audit-summary.json'),
      JSON.stringify({ mobile: mobileSummary, desktop: desktopSummary }, null, 2)
    );
  } finally {
    console.log('Stopping production server...');
    // Kill the server process tree on Windows
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
