const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const URL = 'http://localhost:3000';
const scratchDir = path.resolve('scratch');
const mobileJson = path.join(scratchDir, 'phase3-lh-mobile.json');
const desktopJson = path.join(scratchDir, 'phase3-lh-desktop.json');

console.log('--- RUNNING LIGHTHOUSE DESKTOP AUDIT ---');
try {
  execSync(
    `npx lighthouse ${URL} --output=json --output-path="${desktopJson}" --preset=desktop --chrome-flags="--headless=new --no-sandbox" --only-categories=performance,accessibility,best-practices,seo`,
    { stdio: 'inherit' }
  );
} catch (err) {
  console.log('Desktop audit completed with notes');
}

console.log('--- RUNNING LIGHTHOUSE MOBILE AUDIT ---');
try {
  execSync(
    `npx lighthouse ${URL} --output=json --output-path="${mobileJson}" --chrome-flags="--headless=new --no-sandbox" --only-categories=performance,accessibility,best-practices,seo`,
    { stdio: 'inherit' }
  );
} catch (err) {
  console.log('Mobile audit completed with notes');
}

// Parse scores
function reportScores(name, filePath) {
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const categories = data.categories;
    console.log(`\n=== LIGHTHOUSE SCORES: ${name.toUpperCase()} ===`);
    console.log(`Performance:    ${Math.round(categories.performance.score * 100)}`);
    console.log(`Accessibility:  ${Math.round(categories.accessibility.score * 100)}`);
    console.log(`Best Practices: ${Math.round(categories['best-practices'].score * 100)}`);
    console.log(`SEO:            ${Math.round(categories.seo.score * 100)}`);
  } else {
    console.log(`Could not find ${filePath}`);
  }
}

reportScores('desktop', desktopJson);
reportScores('mobile', mobileJson);
