const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const faviconDir = path.resolve('public/favicon');
const iconsDir = path.resolve('public/icons');
if (!fs.existsSync(faviconDir)) fs.mkdirSync(faviconDir, { recursive: true });
if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir, { recursive: true });

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="64" rx="14" fill="#08080A"/>
  <rect x="1" y="1" width="62" height="62" rx="13" fill="none" stroke="#C5A059" stroke-width="2" stroke-opacity="0.4"/>
  <text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="700" font-size="26" fill="#DFBA75" letter-spacing="1">SB</text>
</svg>`;

fs.writeFileSync('public/favicon.svg', svg);
fs.writeFileSync('public/favicon/icon.svg', svg);

sharp(Buffer.from(svg))
  .resize(32, 32)
  .png()
  .toFile('public/favicon.ico')
  .then(() => {
    return sharp(Buffer.from(svg)).resize(180, 180).png().toFile('public/apple-touch-icon.png');
  })
  .then(() => {
    return sharp(Buffer.from(svg)).resize(192, 192).png().toFile('public/icons/icon-192.png');
  })
  .then(() => {
    console.log('Favicons and touch icons successfully generated.');
  })
  .catch(err => {
    console.error('Favicon generation error:', err);
    process.exit(1);
  });
