// Build-time image pipeline. Run with `npm run images` (also wired as `prebuild`).
// Reads raw-images/, writes public/img/** and src/assets/data/catalog/*.json + codes.lock.json.
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const RAW = path.join(ROOT, 'raw-images');
const OUT = path.join(ROOT, 'public', 'img');
const DATA = path.join(ROOT, 'src', 'assets', 'data');
const CATALOG = path.join(DATA, 'catalog');
const LOCK = path.join(DATA, 'codes.lock.json');
const COVERS_DIR = '00 Collections Page (category covers)';
const IMG_EXT = /\.(jpe?g|png|webp)$/i;
const collator = new Intl.Collator('en', { numeric: true, sensitivity: 'base' });

const readJson = (f, fallback) => (fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : fallback);
const writeJson = (f, v) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, JSON.stringify(v, null, 2) + '\n'); };
const size = (f) => (fs.existsSync(f) ? fs.statSync(f).size : 0);
const kb = (n) => Math.round(n / 1024);
const fresh = (out, src) => fs.existsSync(out) && fs.statSync(out).mtimeMs >= fs.statSync(src).mtimeMs;

async function pool(items, limit, fn) {
  const results = new Array(items.length);
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) { const i = next++; results[i] = await fn(items[i], i); }
  }));
  return results;
}

async function blurOf(src) {
  const buf = await sharp(src).rotate().resize({ width: 16 }).webp({ quality: 40 }).toBuffer();
  return `data:image/webp;base64,${buf.toString('base64')}`;
}

async function makeProduct(src, dir, code) {
  const thumb = path.join(dir, `${code}-400.webp`);
  const full = path.join(dir, `${code}-800.webp`);
  const jpg = path.join(dir, `${code}-800.jpg`);
  const base = () => sharp(src).rotate();
  if (!fresh(thumb, src)) await base().resize({ width: 400, withoutEnlargement: true }).webp({ quality: 72 }).toFile(thumb);
  if (!fresh(full, src)) await base().resize({ width: 800, withoutEnlargement: true }).webp({ quality: 80 }).toFile(full);
  if (!fresh(jpg, src)) await base().resize({ width: 800, withoutEnlargement: true }).flatten({ background: '#ffffff' }).jpeg({ quality: 82, mozjpeg: true }).toFile(jpg);
  const { width, height } = await sharp(full).metadata();
  return { w: width, h: height, blur: await blurOf(src) };
}

async function main() {
  if (!fs.existsSync(RAW)) throw new Error('raw-images/ not found. Copy the image folders there first.');
  const categories = readJson(path.join(DATA, 'categories.json'), []);
  const siteImages = readJson(path.join(DATA, 'site-images.json'), { items: [] }).items;
  const lock = readJson(LOCK, {});
  const index = [];
  const rows = [];
  let total = 0;

  for (const cat of categories) {
    const srcDir = path.join(RAW, cat.folder);
    if (!fs.existsSync(srcDir)) throw new Error(`Folder not found for ${cat.slug}: ${cat.folder}`);
    const exclude = new Set((cat.excludeFiles ?? ['cropped-datt-1.png']).map((n) => n.toLowerCase()));
    const files = fs.readdirSync(srcDir)
      .filter((f) => IMG_EXT.test(f) && !exclude.has(f.toLowerCase()))
      .sort(collator.compare);

    // Stable codes: existing files keep their code, new files get the next free number.
    let max = 0;
    for (const [k, v] of Object.entries(lock)) if (k.startsWith(`${cat.slug}/`)) max = Math.max(max, parseInt(v.split('-')[1], 10));
    for (const f of files) {
      const key = `${cat.slug}/${f}`;
      if (!lock[key]) lock[key] = `${cat.code}-${String(++max).padStart(3, '0')}`;
    }

    const outDir = path.join(OUT, cat.slug);
    fs.mkdirSync(outDir, { recursive: true });
    const items = await pool(files, 8, async (f) => {
      const code = lock[`${cat.slug}/${f}`];
      const m = await makeProduct(path.join(srcDir, f), outDir, code);
      const p = `/img/${cat.slug}/${code}`;
      return { code, w: m.w, h: m.h, thumb: `${p}-400.webp`, full: `${p}-800.webp`, fallback: `${p}-800.jpg`, blur: m.blur };
    });
    items.sort((a, b) => collator.compare(a.code, b.code));
    writeJson(path.join(CATALOG, `${cat.slug}.json`), { slug: cat.slug, count: items.length, items });

    // Cover (square, 600 px)
    const coverSrc = path.join(RAW, COVERS_DIR, cat.cover);
    if (!fs.existsSync(coverSrc)) throw new Error(`Cover not found for ${cat.slug}: ${cat.cover}`);
    const coverOut = path.join(OUT, 'site', `cover-${cat.slug}-600.webp`);
    fs.mkdirSync(path.dirname(coverOut), { recursive: true });
    if (!fresh(coverOut, coverSrc)) await sharp(coverSrc).rotate().resize(600, 600, { fit: 'cover' }).webp({ quality: 78 }).toFile(coverOut);
    index.push({ slug: cat.slug, count: items.length, cover: `/img/site/cover-${cat.slug}-600.webp`, coverBlur: await blurOf(coverSrc) });

    const before = files.reduce((s, f) => s + size(path.join(srcDir, f)), 0);
    const after = items.reduce((s, i) => s + size(path.join(ROOT, 'public', i.thumb)) + size(path.join(ROOT, 'public', i.full)) + size(path.join(ROOT, 'public', i.fallback)), 0);
    rows.push({ category: cat.slug, images: items.length, 'before KB': kb(before), 'after KB (all 3 variants)': kb(after) });
    total += items.length;
  }

  // Site images (banners, logo, press, founder ...)
  for (const s of siteImages) {
    const src = path.join(RAW, s.folder, s.file);
    if (!fs.existsSync(src)) { console.warn(`! missing site image ${s.id}: ${s.folder}/${s.file}`); continue; }
    const fmt = s.format ?? 'webp';
    const encode = (img) => (fmt === 'png' ? img.png({ compressionLevel: 9 }) : fmt === 'jpg' ? img.flatten({ background: '#fff' }).jpeg({ quality: 82, mozjpeg: true }) : img.webp({ quality: 80 }));
    const targets = s.height ? [{ name: `${s.id}-h${s.height}`, resize: { height: s.height } }] : s.widths.map((w) => ({ name: `${s.id}-${w}`, resize: s.crop ? { width: s.crop[0], height: s.crop[1], fit: 'cover' } : { width: w, withoutEnlargement: true } }));
    for (const t of targets) {
      const out = path.join(OUT, 'site', `${t.name}.${fmt}`);
      if (!fresh(out, src)) await encode(sharp(src).rotate().resize(t.resize)).toFile(out);
    }
  }

  writeJson(path.join(CATALOG, 'index.json'), index);
  writeJson(LOCK, Object.fromEntries(Object.entries(lock).sort(([a], [b]) => collator.compare(a, b))));
  console.table(rows);
  console.log(`Total: ${total} product images across ${categories.length} categories (logo excluded).`);
}

main().catch((e) => { console.error(e); process.exit(1); });
