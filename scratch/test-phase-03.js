const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const screenshotDir = 'C:/Users/r6768/.gemini/antigravity/brain/b9e0c139-b10e-45c8-9714-608765325ab8/screenshots';
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

async function run() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  
  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  page.on('pageerror', (err) => {
    consoleErrors.push(err.message);
  });

  const viewports = [
    { width: 1440, height: 900, name: 'desktop-1440' },
    { width: 390, height: 844, name: 'mobile-390' },
  ];

  for (const vp of viewports) {
    console.log(`Testing viewport ${vp.name}...`);
    await page.setViewport({ width: vp.width, height: vp.height, deviceScaleFactor: 2 });
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 30000 });

    // Check horizontal overflow
    const hasOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    console.log(`Viewport ${vp.name} horizontal overflow: ${hasOverflow}`);

    // Capture sections
    const sections = ['cuber', 'story', 'interests', 'goals'];
    for (const sec of sections) {
      const el = await page.$(`#${sec}`);
      if (el) {
        await page.evaluate((s) => {
          document.getElementById(s).scrollIntoView({ behavior: 'instant' });
        }, sec);
        await new Promise((r) => setTimeout(r, 600));
        await el.screenshot({
          path: path.join(screenshotDir, `phase3-${sec}-${vp.name}.png`),
        });
        console.log(`Saved screenshot: phase3-${sec}-${vp.name}.png`);
      } else {
        console.error(`Section #${sec} not found on page!`);
      }
    }
  }

  console.log(`Console Errors count: ${consoleErrors.length}`);
  if (consoleErrors.length > 0) {
    console.log('Errors:', consoleErrors);
  }

  await browser.close();
  console.log('Testing completed successfully!');
}

run().catch((err) => {
  console.error('Test run failed:', err);
  process.exit(1);
});
