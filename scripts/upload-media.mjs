// One-off: upload the gitignored media archive (public/media/**, except site/) to Vercel Blob.
// Usage: node --env-file=.env.local scripts/upload-media.mjs
import { put, list } from '@vercel/blob';
import { readdir, readFile, stat } from 'node:fs/promises';
import { join, relative } from 'node:path';
import mime from 'mime-types';

const ROOT = 'public/media';
const SKIP = new Set(['site']);

async function* walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (dir === ROOT && SKIP.has(e.name)) continue;
    if (e.isDirectory()) yield* walk(p);
    else if (!e.name.startsWith('.')) yield p;
  }
}

const existing = new Set();
let cursor;
do {
  const page = await list({ prefix: 'media/', limit: 1000, cursor });
  page.blobs.forEach((b) => existing.add(b.pathname));
  cursor = page.cursor;
} while (cursor);
console.log(`already uploaded: ${existing.size}`);

const files = [];
for await (const f of walk(ROOT)) files.push(f);
const todo = files.filter((f) => !existing.has('media/' + relative(ROOT, f)));
console.log(`files: ${files.length}, to upload: ${todo.length}`);

let done = 0, failed = 0, base;
async function worker() {
  while (todo.length) {
    const f = todo.pop();
    const pathname = 'media/' + relative(ROOT, f);
    try {
      const r = await put(pathname, await readFile(f), {
        access: 'public', addRandomSuffix: false, allowOverwrite: true,
        contentType: mime.lookup(f) || 'application/octet-stream',
        cacheControlMaxAge: 31536000,
      });
      base ??= r.url.slice(0, r.url.indexOf('/media/'));
    } catch (e) { failed++; console.error('FAIL', pathname, e.message); }
    if (++done % 200 === 0) console.log(`${done} done`);
  }
}
await Promise.all(Array.from({ length: 8 }, worker));
console.log(`finished: ${done - failed} ok, ${failed} failed. base=${base ?? '(see list)'}`);
