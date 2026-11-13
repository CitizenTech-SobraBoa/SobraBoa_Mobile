const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');
async function main() {
  const assets = path.resolve(__dirname, '../assets/images');
  const svg = fs.readFileSync(path.join(assets, 'brand.svg'), 'utf8');
  await sharp(Buffer.from(svg)).png().toFile(path.join(assets, 'icon.png'));
  const transparent = svg.replace(/<rect[^>]+\/>/, '');
  await sharp(Buffer.from(transparent))
    .resize(700, 700)
    .extend({ top: 162, bottom: 162, left: 162, right: 162, background: '#00000000' })
    .png()
    .toFile(path.join(assets, 'adaptive-icon.png'));
  await sharp(Buffer.from(transparent))
    .resize(512, 512)
    .png()
    .toFile(path.join(assets, 'splash.png'));
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
