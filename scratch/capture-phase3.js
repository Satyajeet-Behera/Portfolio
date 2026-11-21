const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const URL = 'http://localhost:3000';
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const shotsDir = path.resolve('scratch/screenshots');
if (!fs.existsSync(shotsDir)) fs.mkdirSync(shotsDir, { recursive: true });

const artifactDir = 'C:\\Users\\r6768\\.gemini\\antigravity\\brain\\b9e0c139-b10e-45c8-9714-608765325ab8\\screenshots';
if (!fs.existsSync(artifactDir)) fs.mkdirSync(artifactDir, { recursive: true });

const targets = [
  // Full page viewports
  { name: 'desktop-1920', url: URL, width: 1920, height: 1080 },
  { name: 'desktop-1440', url: URL, width: 1440, height: 900 },
  { name: 'laptop-1024', url: URL, width: 1024, height: 768 },
  { name: 'tablet-768', url: URL, width: 768, height: 1024 },
  { name: 'mobile-430', url: URL, width: 430, height: 932 },
  { name: 'mobile-390', url: URL, width: 390, height: 844 },
  { name: 'mobile-360', url: URL, width: 360, height: 740 },
  // Phase 3 Sections
  { name: 'cuber-desktop-1440', url: `${URL}#cuber`, width: 1440, height: 900 },
  { name: 'cuber-mobile-390', url: `${URL}#cuber`, width: 390, height: 844 },
  { name: 'story-desktop-1440', url: `${URL}#story`, width: 1440, height: 900 },
  { name: 'story-mobile-390', url: `${URL}#story`, width: 390, height: 844 },
  { name: 'interests-desktop-1440', url: `${URL}#interests`, width: 1440, height: 900 },
  { name: 'interests-mobile-390', url: `${URL}#interests`, width: 390, height: 844 },
  { name: 'goals-desktop-1440', url: `${URL}#goals`, width: 1440, height: 900 },
  { name: 'goals-mobile-390', url: `${URL}#goals`, width: 390, height: 844 },
];

console.log('Capturing screenshots for Phase 3...');

for (const t of targets) {
  const outPath = path.join(shotsDir, `${t.name}.png`);
  try {
    const cmd = `"${CHROME}" --headless=new --disable-gpu --no-sandbox --window-size=${t.width},${t.height} --screenshot="${outPath}" "${t.url}"`;
    execSync(cmd, { stdio: 'ignore' });
    const stats = fs.statSync(outPath);
    console.log(`Captured ${t.name} (${t.width}x${t.height}): ${stats.size} bytes`);
    fs.copyFileSync(outPath, path.join(artifactDir, `${t.name}.png`));
  } catch (err) {
    console.error(`Failed ${t.name}:`, err.message);
  }
}

console.log('All screenshots captured and copied to artifact directory!');
