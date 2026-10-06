import { createReader } from '@keystatic/core/reader';
import config from '../keystatic.config';

const cfg = (config as any).default ?? config;
const reader = createReader(process.cwd(), cfg);
let bad = 0;
for (const name of Object.keys(cfg.collections ?? {}) as Extract<keyof typeof reader.collections, string>[]) {
  const col = reader.collections[name];
  const slugs = await col.list();
  let ok = 0;
  for (const slug of slugs) {
    try {
      const e = await col.read(slug);
      if (e) ok++;
      else throw new Error('not found');
    } catch (err) {
      bad++;
      if (bad <= 15) console.log(`${name}/${slug}: ${String(err).split('\n').slice(0, 2).join(' ')}`);
    }
  }
  console.log(`${name}: ${ok}/${slugs.length} valid`);
}
process.exit(bad ? 1 : 0);
