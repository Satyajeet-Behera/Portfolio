const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function convert() {
  const input = path.join(__dirname, '..', 'public', 'images', 'logo.jpg');
  const outWebp = path.join(__dirname, '..', 'public', 'images', 'logo.webp');
  const outPng = path.join(__dirname, '..', 'public', 'images', 'logo.png');
  const outFavicon = path.join(__dirname, '..', 'public', 'apple-touch-icon.png');
  const outIcon192 = path.join(__dirname, '..', 'public', 'icons', 'icon-192.png');
  const outFaviconSvgDir = path.join(__dirname, '..', 'public', 'favicon', 'icon.png');

  console.log('Generating logo.webp...');
  await sharp(input)
    .webp({ quality: 95 })
    .toFile(outWebp);

  console.log('Generating logo.png...');
  await sharp(input)
    .png({ quality: 100 })
    .toFile(outPng);

  console.log('Generating apple-touch-icon.png (180x180)...');
  await sharp(input)
    .resize(180, 180)
    .png()
    .toFile(outFavicon);

  console.log('Generating icon-192.png (192x192)...');
  await sharp(input)
    .resize(192, 192)
    .png()
    .toFile(outIcon192);

  console.log('Generating favicon icon.png (64x64)...');
  await sharp(input)
    .resize(64, 64)
    .png()
    .toFile(outFaviconSvgDir);

  console.log('All logo assets generated successfully!');
}

convert().catch(console.error);
