// Page header photos ("testate") from the old site, one per page/activity, as in the WordPress theme.
// Sources are the original uploads in ../export/uploads; output goes to public/media/site/testate (in git).
// Usage: node scripts/prep-heroes.mjs
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

const SRC = '../export/uploads';
const OUT = 'public/media/site/testate';
const heroes = {
  // pages
  'la-storia': '2015/05/testata_storia.jpg',
  'il-consiglio': '2015/05/testata_consiglio.jpg',
  'il-nodo': '2015/06/testata_nodo_02.jpg',
  'unisciti-a-noi': '2015/06/unisciti_a_noi_testata2.jpg',
  alpinismo: '2015/06/testata_alpinismo.jpg',
  contatti: '2015/05/DSC_0072.jpg',
  roccia: '2015/05/testata_roccia.jpg',
  // activities
  'alpinismo-giovanile': '2015/06/testata_ragazzi.jpg',
  arrampicata: '2015/05/testata_roccia2.jpg',
  'corsa-in-montagna': '2019/07/corsa-montagna.jpg',
  corsi: '2015/05/testata_corsi.jpg',
  escursionismo: '2015/05/testata_escursionismo.jpg',
  cultura: '2015/05/testata_eventi.jpg',
  'eventi-sociali': '2015/06/testata_eventi_sociali.jpg',
  'sci-alpino': '2015/05/testata_scialp.jpg',
  'sci-fondo': '2015/05/home_fondo.jpg',
};

await mkdir(OUT, { recursive: true });
for (const [key, src] of Object.entries(heroes)) {
  // Old banners are 980x350; non-banner photos are cropped to the same 2.8:1 shape.
  const img = sharp(`${SRC}/${src}`).rotate();
  const { width } = await img.metadata();
  const w = Math.min(width, 1600);
  await img.resize(w, Math.round(w / 2.8), { fit: 'cover', position: 'attention' })
    .webp({ quality: 80 }).toFile(`${OUT}/${key}.webp`);
  console.log(key);
}
