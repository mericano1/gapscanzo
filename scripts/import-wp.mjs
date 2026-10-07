// One-off importer: WordPress WXR export (+ calendar iCal) -> Keystatic content files.
// Usage: node scripts/import-wp.mjs [--dry]
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import he from 'he';
import sharp from 'sharp';
import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';

const ROOT = path.resolve(import.meta.dirname, '..');
const EXPORT = path.resolve(ROOT, '../export');
const UPLOADS = path.join(EXPORT, 'uploads');
const DERIVED = path.join(EXPORT, 'derived');
const DRY = process.argv.includes('--dry');

fs.mkdirSync(DERIVED, { recursive: true });

// ---------- XML parsing ----------
const xml = fs.readFileSync(path.join(EXPORT, 'gap.wordpress.2026-10-02.xml'), 'utf8');
const unwrap = (s) => s.replace(/^<!\[CDATA\[/, '').replace(/\]\]>$/, '');
const tag = (src, t) => {
  const m = src.match(new RegExp(`<${t}>([\\s\\S]*?)</${t}>`));
  return m ? unwrap(m[1]) : '';
};

const posts = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((m) => {
  const raw = m[1];
  const meta = {};
  for (const mm of raw.matchAll(
    /<wp:postmeta>\s*<wp:meta_key>([\s\S]*?)<\/wp:meta_key>\s*<wp:meta_value>([\s\S]*?)<\/wp:meta_value>\s*<\/wp:postmeta>/g,
  )) {
    meta[unwrap(mm[1])] = unwrap(mm[2]);
  }
  const terms = [...raw.matchAll(/<category domain="([^"]+)" nicename="([^"]*)"[^>]*>([\s\S]*?)<\/category>/g)].map(
    (c) => ({ domain: c[1], slug: c[2], name: he.decode(unwrap(c[3])) }),
  );
  return {
    id: tag(raw, 'wp:post_id'),
    type: tag(raw, 'wp:post_type'),
    status: tag(raw, 'wp:status'),
    title: he.decode(tag(raw, 'title')).trim(),
    link: tag(raw, 'link'),
    name: tag(raw, 'wp:post_name'),
    date: tag(raw, 'wp:post_date'),
    content: tag(raw, 'content:encoded'),
    excerpt: tag(raw, 'excerpt:encoded'),
    attachmentUrl: tag(raw, 'wp:attachment_url'),
    meta,
    terms,
  };
});

const ofType = (t) => posts.filter((p) => p.type === t && p.status === 'publish');
const attachments = new Map();
for (const p of posts.filter((p) => p.type === 'attachment')) {
  const m = p.attachmentUrl.match(/wp-content\/uploads\/(.+)$/);
  if (m) attachments.set(p.id, m[1]);
}

// ---------- media handling ----------
const IMG_EXT = /\.(jpe?g|jpe|png|webp)$/i;
const safe = (rel) => rel.replace(/[^A-Za-z0-9._/-]+/g, '-');
const media = new Map(); // outRel -> { src, isImage }
const missing = new Set();

function resolveUpload(relRaw) {
  let rel = relRaw.split(/[?#]/)[0];
  try {
    rel = decodeURIComponent(rel);
  } catch {}
  const spaced = rel.replace(/\+/g, ' ');
  const candidates = [rel, spaced, rel.replace(/-\d+x\d+(?=\.\w+$)/, ''), spaced.replace(/-\d+x\d+(?=\.\w+$)/, ''), rel.replace(/-scaled(?=\.\w+$)/, '')];
  for (const c of candidates) {
    const f = path.join(UPLOADS, c);
    if (fs.existsSync(f) && fs.statSync(f).isFile()) return { rel: c, file: f };
  }
  return null;
}

function useUpload(relRaw) {
  const r = resolveUpload(relRaw);
  if (!r) {
    missing.add(relRaw);
    return null;
  }
  const isImage = IMG_EXT.test(r.rel);
  const outRel = safe(isImage ? r.rel.replace(IMG_EXT, '.webp') : r.rel);
  media.set(outRel, { src: r.file, isImage });
  return '/media/' + outRel;
}

// Archived Blogger photos, stored next to WordPress as /old_imgs/<blogspot host>/...
const OLD_DIR = path.join(EXPORT, 'old_imgs');
function useOld(relRaw) {
  let rel = relRaw.split(/[?#]/)[0];
  try {
    rel = decodeURIComponent(rel);
  } catch {}
  let file = path.join(OLD_DIR, rel);
  if (!fs.existsSync(file)) file = path.join(OLD_DIR, rel.replace(/\+/g, ' '));
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
    missing.add('old_imgs/' + relRaw);
    return null;
  }
  const hash = createHash('sha1').update(rel).digest('hex').slice(0, 8);
  const base = safe(path.basename(rel)).replace(/\.[^.]+$/, '');
  const isImage = /\.(jpe?g|jpe|png|webp)$/i.test(rel);
  const outRel = `old/${hash}-${base}${isImage ? '.webp' : path.extname(rel).toLowerCase()}`;
  media.set(outRel, { src: file, isImage });
  return '/media/' + outRel;
}

const OLD_RE = /(?:https?:\/\/(?:www\.)?gapscanzo\.net(?:\/new)?)?\/old_imgs\/([^\s"'<>]+)/gi;
const UPLOAD_RE = /(?:(?:https?:)?\/\/(?:www\.)?gapscanzo\.net)?(?:\/new)?\/wp-content\/uploads\/([^\s"'<>]+)/gi;

// File names contain ( ) [ ]; keep them when balanced, but drop sentence punctuation glued to the end of a bare URL.
function splitTail(rel) {
  let tail = '';
  for (;;) {
    const c = rel.at(-1);
    const open = { ')': '(', ']': '[' }[c];
    const unbalanced = open && rel.split(c).length > rel.split(open).length;
    if (unbalanced || '.,;:!?'.includes(c)) {
      tail = c + tail;
      rel = rel.slice(0, -1);
    } else return [rel, tail];
  }
}
const SITE_RE = /https?:\/\/(?:www\.)?gapscanzo\.net(?:\/new)?\//gi;

function rewriteUrls(html) {
  return html
    .replace(OLD_RE, (all, raw) => {
      const [rel, tail] = splitTail(raw);
      const u = useOld(rel);
      return u ? u + tail : all;
    })
    .replace(UPLOAD_RE, (all, raw) => {
      const [rel, tail] = splitTail(raw);
      const u = useUpload(rel);
      return u ? u + tail : all;
    })
    .replace(/(href=["'])https?:\/\/(?:www\.)?gapscanzo\.net(?:\/new)?\//gi, '$1/')
    .replace(SITE_RE, '/');
}

// ---------- HTML -> Markdown ----------
const td = new TurndownService({ headingStyle: 'atx', bulletListMarker: '-', codeBlockStyle: 'fenced', emDelimiter: '_' });
td.use(gfm);
td.remove(['style', 'script']);
td.addRule('iframe', {
  filter: 'iframe',
  replacement: (_c, node) => {
    const src = node.getAttribute('src');
    return src ? `\n\n[Video](${src.startsWith('//') ? 'https:' + src : src})\n\n` : '';
  },
});

const shortcodeLeft = {};
function toMarkdown(html) {
  let h = html.replace(/\r\n/g, '\n');
  h = h.replace(/\[caption[^\]]*\]([\s\S]*?)\[\/caption\]/gi, '$1');
  h = h.replace(/\[(\/?)([a-z0-9_-]+)[^\]]*\]/gi, (all, _s, name) => {
    if (/^(gallery|embed|ai1ec\w*|video|audio|playlist|googlemaps?)$/i.test(name)) {
      shortcodeLeft[name] = (shortcodeLeft[name] || 0) + 1;
      return '';
    }
    return all;
  });
  h = h.replace(/^\s*(https?:\/\/(?:www\.)?(?:youtube\.com\/watch\S+|youtu\.be\/\S+|vimeo\.com\/\S+))\s*$/gim, '<p><a href="$1">$1</a></p>');
  if (!/<p[\s>]/i.test(h)) {
    h = h
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean)
      .map((p) => (/^<(h\d|ul|ol|table|div|blockquote|figure|img|iframe)/i.test(p) ? p : `<p>${p.replace(/\n/g, '<br />')}</p>`))
      .join('\n');
  }
  h = rewriteUrls(h);
  let md = td.turndown(h).replace(/ /g, ' ').replace(/\n{3,}/g, '\n\n').trim();
  md = md.replace(/\{%/g, '{ %'); // keep Markdoc from reading tags
  return md;
}

const plain = (html) =>
  he
    .decode(html.replace(/<[^>]+>/g, ' ').replace(/\[[^\]]+\]/g, ' '))
    .replace(/\s+/g, ' ')
    .trim();
const summary = (p) => {
  const t = plain(p.excerpt || p.content);
  return t.length > 220 ? t.slice(0, 217).replace(/\s\S*$/, '') + '…' : t;
};

// ---------- file output ----------
const usedSlugs = {};
function slugFor(kind, p) {
  let base = p.name;
  try {
    base = decodeURIComponent(base);
  } catch {}
  base = (base || p.title)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || `item-${p.id}`;
  const set = (usedSlugs[kind] ??= new Set());
  let s = base;
  for (let i = 2; set.has(s); i++) s = `${base}-${i}`;
  set.add(s);
  return s;
}

function writeEntry(kind, slug, front, body) {
  const fm = Object.entries(front)
    .filter(([, v]) => v !== undefined && v !== null && v !== '' && !(Array.isArray(v) && !v.length))
    .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
    .join('\n');
  const out = `---\n${fm}\n---\n\n${body}\n`;
  if (DRY) return;
  const dir = path.join(ROOT, 'content', kind);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, `${slug}.mdoc`), out);
}

const day = (d) => d.slice(0, 10);
const cover = (p) => {
  const rel = attachments.get(p.meta._thumbnail_id);
  return rel ? (useUpload(rel) ?? undefined) : undefined;
};
const urlPath = (link) => new URL(link).pathname.replace(/^\/new(?=\/)/, '');
const redirects = [];
const counts = {};

// ---------- news ----------
for (const p of ofType('news')) {
  const slug = slugFor('news', p);
  writeEntry(
    'news',
    slug,
    {
      title: p.title,
      date: day(p.date),
      summary: summary(p),
      cover: cover(p),
      pinned: p.terms.some((t) => t.domain === 'sections' && t.slug === 'homepage'),
    },
    toMarkdown(p.content),
  );
  counts.news = (counts.news || 0) + 1;
}

// ---------- blog ----------
for (const p of ofType('post')) {
  const slug = slugFor('blog', p);
  const tags = p.terms.filter((t) => t.domain === 'post_tag').map((t) => t.name);
  const cats = p.terms.filter((t) => t.domain === 'category' && t.slug !== 'uncategorized').map((t) => t.name);
  writeEntry(
    'blog',
    slug,
    { title: p.title, date: day(p.date), summary: summary(p), cover: cover(p), categories: cats, tags },
    toMarkdown(p.content),
  );
  const from = urlPath(p.link);
  if (from !== `/blog/${slug}`) redirects.push({ from, to: `/blog/${slug}` });
  counts.blog = (counts.blog || 0) + 1;
}

// ---------- pages / activities ----------
const SKIP_PAGES = new Set(['home-page', 'calendario', 'blog', 'news', 'attivita', 'sample-page']);
const acfDump = {};
const gallery = (m) => {
  const out = [];
  for (let i = 0; m[`gallery-images_${i}_gallery-image`] !== undefined; i++) {
    const rel = attachments.get(m[`gallery-images_${i}_gallery-image`]);
    const url = rel && useUpload(rel);
    if (url) out.push({ image: url, caption: m[`gallery-images_${i}_gallery-text`] || '' });
  }
  return out;
};
const contacts = (m) =>
  ['first', 'second', 'third']
    .map((k) => ({ name: m[`${k}-contact-name`] || '', email: m[`${k}-contact-email`] || '' }))
    .filter((c) => c.name || c.email);

const skippedPages = [];
for (const p of ofType('page')) {
  const route = urlPath(p.link).replace(/^\/|\/$/g, '');
  const m = Object.fromEntries(Object.entries(p.meta).filter(([k]) => !k.startsWith('_')));
  acfDump[route] = m;
  if (SKIP_PAGES.has(route.split('/').pop()) && !route.startsWith('attivita/')) {
    skippedPages.push(route);
    continue;
  }
  const isActivity = route.startsWith('attivita/');
  const kind = isActivity ? 'activities' : 'pages';
  const slug = isActivity ? route.slice('attivita/'.length) : route;
  if (!slug) continue;
  usedSlugs[kind] ??= new Set();
  usedSlugs[kind].add(slug);
  writeEntry(
    kind,
    slug.replace(/\//g, '--'),
    {
      title: p.title,
      cover: cover(p),
      mapLink: m['map-link'],
      email: m['email-address'],
      contacts: contacts(m),
      gallery: gallery(m),
    },
    // The banner photo that opened each old page is now the page header (src/lib/heroes.ts).
    toMarkdown(p.content).replace(/^!\[[^\]]*\]\([^)]*\/(testata[^/)]*|unisciti_a_noi_testata2|corsa-montagna|home_fondo)\.webp\)\n\n?/, ''),
  );
  counts[kind] = (counts[kind] || 0) + 1;
}

// ---------- Il Nodo (newsletter archive) ----------
const nodoPage = ofType('page').find((p) => urlPath(p.link) === '/il-nodo/');
if (nodoPage) {
  const m = nodoPage.meta;
  const fileUrl = (id) => {
    const rel = attachments.get(id);
    return rel ? useUpload(rel) : null;
  };
  const years = [];
  for (let y = 0; m[`year-issues_${y}_year`] !== undefined; y++) {
    const issues = [];
    for (let i = 0; m[`year-issues_${y}_issues_${i}_issue-name`] !== undefined; i++) {
      const file = fileUrl(m[`year-issues_${y}_issues_${i}_issue-file`]);
      if (file) issues.push({ name: m[`year-issues_${y}_issues_${i}_issue-name`], file });
    }
    years.push({ year: m[`year-issues_${y}_year`], issues });
  }
  const flat = [];
  for (let i = 0; m[`issues_${i}_issue-name`] !== undefined; i++) {
    const file = fileUrl(m[`issues_${i}_issue-file`]);
    if (file) flat.push({ name: m[`issues_${i}_issue-name`], file });
  }
  if (flat.length) years.unshift({ year: 'Recenti', issues: flat });
  if (!DRY) {
    fs.mkdirSync(path.join(ROOT, 'data'), { recursive: true });
    fs.writeFileSync(path.join(ROOT, 'data/nodo.json'), JSON.stringify(years, null, 2));
  }
  counts.nodoIssues = years.reduce((n, y) => n + y.issues.length, 0);
}

// ---------- events (dates scraped from the live event pages; the WXR has none) ----------
const MONTHS = { gennaio: 1, febbraio: 2, marzo: 3, aprile: 4, maggio: 5, giugno: 6, luglio: 7, agosto: 8, settembre: 9, ottobre: 10, novembre: 11, dicembre: 12 };
const iso = (mon, d, y) => (MONTHS[mon.toLowerCase()] ? `${y}-${String(MONTHS[mon.toLowerCase()]).padStart(2, '0')}-${String(d).padStart(2, '0')}` : null);
const QUANDO =
  /^([a-zì]+) (\d{1,2}), (\d{4})(?: @ (\d{1,2}:\d{2}))?(?: – (?:([a-zì]+) (\d{1,2}), (\d{4})(?: @ (\d{1,2}:\d{2}))?|(\d{1,2}:\d{2})))?/i;
function parseQuando(name) {
  const f = path.join(DERIVED, 'events', `${name}.html`);
  if (!fs.existsSync(f)) return null;
  const t = fs
    .readFileSync(f, 'utf8')
    .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ');
  const q = t.match(/Quando:\s*(.*)/);
  const m = q && q[1].match(QUANDO);
  if (!m) return null;
  const startDate = iso(m[1], m[2], m[3]);
  if (!startDate) return null;
  const endDate = m[5] ? iso(m[5], m[6], m[7]) : null;
  return {
    startDate,
    startTime: m[4]?.padStart(5, '0'),
    endDate: endDate && endDate !== startDate ? endDate : undefined,
    endTime: (m[8] || m[9])?.padStart(5, '0'),
  };
}
const textOf = (h = '') =>
  he
    .decode(h.replace(/<br\s*\/?>/gi, ', ').replace(/<[^>]+>/g, ''))
    .replace(/\s+/g, ' ')
    .replace(/(\s*,)+\s*$/, '')
    .trim();
function parseDetails(name) {
  const f = path.join(DERIVED, 'events', `${name}.html`);
  if (!fs.existsSync(f)) return {};
  const html = fs.readFileSync(f, 'utf8');
  const block = (cls) => html.match(new RegExp(`<div class="ai1ec-${cls}">[\\s\\S]*?<div class="ai1ec-field-value">([\\s\\S]*?)</div>\\s*</div>`))?.[1];
  const addr = html.match(/id="ai1ec-gmap-address" value="([^"]*)"/)?.[1];
  const contact = {};
  for (const m of (block('contact') ?? '').matchAll(/<span class="ai1ec-contact-(name|phone|email|url)">([\s\S]*?)<\/span>/g)) contact[m[1]] = textOf(m[2]);
  return {
    location: (addr ? he.decode(addr) : textOf(block('location'))) || undefined,
    contact: contact.name,
    contactPhone: contact.phone,
    contactEmail: contact.email,
    contactUrl: contact.url,
    cost: textOf(block('cost')) || undefined,
  };
}
const unmatchedEvents = [];
for (const p of ofType('ai1ec_event')) {
  const when = parseQuando(p.name);
  if (!when) {
    unmatchedEvents.push(p.title);
    continue;
  }
  const slug = slugFor('events', p);
  writeEntry(
    'events',
    slug,
    {
      title: p.title,
      ...when,
      ...parseDetails(p.name),
      categories: p.terms.filter((t) => t.domain === 'events_categories').map((t) => t.name),
      tags: p.terms.filter((t) => t.domain === 'events_tags').map((t) => t.name),
      cover: cover(p),
    },
    toMarkdown(p.content),
  );
  redirects.push({ from: `/ai1ec_event/${p.name}`, to: `/calendario/${slug}` });
  counts.events = (counts.events || 0) + 1;
}

// ---------- media pipeline ----------
let srcBytes = 0;
let outBytes = 0;
const list = [...media.entries()];
for (const [, { src }] of list) srcBytes += fs.statSync(src).size;
if (!DRY) {
  let i = 0;
  const worker = async () => {
    while (i < list.length) {
      const [outRel, { src, isImage }] = list[i++];
      const dest = path.join(ROOT, 'public/media', outRel);
      if (fs.existsSync(dest)) {
        outBytes += fs.statSync(dest).size;
        continue;
      }
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      try {
        if (isImage) {
          await sharp(src, { failOn: 'none' })
            .rotate()
            .resize({ width: 1600, withoutEnlargement: true })
            .webp({ quality: 78 })
            .toFile(dest);
        } else {
          fs.copyFileSync(src, dest);
        }
        outBytes += fs.statSync(dest).size;
      } catch (e) {
        console.error('media failed', src, e.message);
      }
    }
  };
  await Promise.all(Array.from({ length: 8 }, worker));
  fs.writeFileSync(path.join(ROOT, 'data/redirects.json'), JSON.stringify(redirects, null, 2));
}

// ---------- report ----------
const mb = (n) => (n / 1048576).toFixed(0) + ' MB';
const report = {
  dry: DRY,
  counts,
  unmatchedEvents,
  skippedPages,
  mediaFiles: list.length,
  mediaImages: list.filter(([, v]) => v.isImage).length,
  mediaSource: mb(srcBytes),
  mediaOutput: DRY ? 'n/a' : mb(outBytes),
  missingMedia: missing.size,
  missingSample: [...missing].slice(0, 25),
  shortcodesStripped: shortcodeLeft,
  redirects: redirects.length,
};
fs.writeFileSync(path.join(DERIVED, 'acf-pages.json'), JSON.stringify(acfDump, null, 2));
fs.writeFileSync(path.join(DERIVED, 'report.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
