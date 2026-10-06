// Brand/hero assets pulled from the old site: round logo crop + homepage activity photos.
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve(import.meta.dirname, '..');
const EXPORT = path.resolve(ROOT, '../export');

// Logo: the circle sits at roughly (340..455, 58..175) in the 979x235 header banner.
const size = 118;
const mask = Buffer.from(`<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}"/></svg>`);
await sharp(path.join(EXPORT, 'derived/brand/header.jpg'))
  .extract({ left: 337, top: 58, width: size, height: size })
  .composite([{ input: mask, blend: 'dest-in' }])
  .png()
  .toFile(path.join(ROOT, 'public/brand/logo-mark.png'));

const find = (name) => {
  for (const m of ['2015/05', '2015/06', '2015/07']) {
    const f = path.join(EXPORT, 'uploads', m, `${name}.jpg`);
    if (fs.existsSync(f)) return f;
  }
};
for (const name of ['home_alpinismo', 'home_trekking', 'home_scialp1', 'home_scialp2', 'home_attivita_ragazzi', 'home_sociali', 'home_escursionismo', 'home_fondo', 'testata_roccia', 'testata_roccia2']) {
  const f = find(name);
  if (!f) {
    console.log('missing', name);
    continue;
  }
  const info = await sharp(f).resize({ width: 1400, withoutEnlargement: true }).webp({ quality: 80 }).toFile(path.join(ROOT, `public/media/site/${name}.webp`));
  console.log(name, info.width + 'x' + info.height);
}
