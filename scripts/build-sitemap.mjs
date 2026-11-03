// Post-build: sitemap.xml, sitemap-images.xml, robots.txt and 404.html in the browser output.
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const OUT = path.join(ROOT, 'dist', 'pkguled-web', 'browser');
const DATA = path.join(ROOT, 'src', 'assets', 'data');
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), 'utf8'));
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

if (!fs.existsSync(OUT)) throw new Error(`Build output not found: ${OUT}`);

const site = read('site.json');
const categories = read('categories.json');
const base = site.seo.siteUrl.replace(/\/$/, '');
const today = new Date().toISOString().slice(0, 10);

const routes = ['/', '/collections', ...categories.map((c) => `/collections/${c.slug}`), '/about', '/visit'];
const urls = routes
  .map((r) => `  <url><loc>${esc(base + r)}</loc><lastmod>${today}</lastmod></url>`)
  .join('\n');
fs.writeFileSync(
  path.join(OUT, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
);

let imageCount = 0;
const imageUrls = categories
  .map((c) => {
    const catalog = read(`catalog/${c.slug}.json`);
    const images = catalog.items
      .map((it) => {
        imageCount++;
        return `    <image:image><image:loc>${esc(base + it.fallback)}</image:loc><image:caption>${esc(`${c.title} ${it.code}`)}</image:caption></image:image>`;
      })
      .join('\n');
    return `  <url>\n    <loc>${esc(`${base}/collections/${c.slug}`)}</loc>\n${images}\n  </url>`;
  })
  .join('\n');
fs.writeFileSync(
  path.join(OUT, 'sitemap-images.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${imageUrls}\n</urlset>\n`,
);

fs.writeFileSync(
  path.join(OUT, 'robots.txt'),
  `User-agent: *\nAllow: /\nDisallow: /404\n\nSitemap: ${base}/sitemap.xml\nSitemap: ${base}/sitemap-images.xml\n`,
);

// Preload only the hero font weights (Playfair 600 headline, Inter 400 body) on the home
// page, where the headline is the LCP element. Category pages are left alone so the fonts
// do not compete with the first product thumbnails. File names are hashed by the build,
// so the links are injected here.
const media = path.join(OUT, 'media');
const heroFonts = fs.existsSync(media)
  ? fs.readdirSync(media).filter((f) => /^(playfair-display-latin-600-normal|inter-latin-400-normal)-.*\.woff2$/.test(f))
  : [];
const preload = heroFonts.map((f) => `<link rel="preload" href="/media/${f}" as="font" type="font/woff2" crossorigin>`).join('');
const htmlFiles = [path.join(OUT, 'index.html')];
for (const f of htmlFiles) {
  const html = fs.readFileSync(f, 'utf8');
  if (!preload || html.includes('as="font"')) continue;
  fs.writeFileSync(f, html.replace('</title>', `</title>${preload}`));
}

// WhatsApp preview pages: /p/<CODE> per saree. wa.me can only send text, so the "Ask price"
// message links here; WhatsApp reads og:image and shows that saree's photo as the preview.
// __ORIGIN__ is replaced by nginx (sub_filter) with the address the link was opened on, so
// the preview works on the VM IP:port and on the real domain without a rebuild. People who
// tap the link are sent on to the category page with the lightbox open.
let sharePages = 0;
for (const c of categories) {
  const catalog = read(`catalog/${c.slug}.json`);
  for (const it of catalog.items) {
    const target = `/collections/${c.slug}?saree=${it.code}`;
    const title = `Saree ${it.code} · ${c.title}`;
    const desc = `${c.title} from ${site.brand.name}, Ilkal. Price on request on WhatsApp.`;
    const html = `<!doctype html>
<html lang="en-IN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)} | ${esc(site.brand.name)}</title>
<meta name="robots" content="noindex, follow">
<meta name="description" content="${esc(desc)}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(`${site.brand.name} ${site.brand.tagline}`)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:image" content="__ORIGIN__${esc(it.fallback)}">
<meta property="og:image:type" content="image/jpeg">
<meta property="og:image:width" content="${it.w}">
<meta property="og:image:height" content="${it.h}">
<meta property="og:image:alt" content="${esc(`${c.title}, design ${it.code}`)}">
<meta property="og:url" content="__ORIGIN__/p/${esc(it.code)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="__ORIGIN__${esc(it.fallback)}">
<link rel="canonical" href="__ORIGIN__${esc(target)}">
<meta http-equiv="refresh" content="0; url=${esc(target)}">
<style>body{margin:0;display:grid;place-items:center;min-height:100vh;background:#fbf6ee;font-family:system-ui,sans-serif;color:#2a1a17}a{color:#7a1f2b;text-align:center;text-decoration:none}img{display:block;width:240px;height:240px;object-fit:cover;border-radius:16px;margin:0 auto 12px}</style>
</head>
<body><a href="${esc(target)}"><img src="${esc(it.thumb)}" width="240" height="240" alt="">View saree ${esc(it.code)}</a></body>
</html>
`;
    const dir = path.join(OUT, 'p', it.code);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), html);
    sharePages++;
  }
}

// nginx serves /404.html for unknown URLs (error_page 404).
const notFound = path.join(OUT, '404', 'index.html');
if (fs.existsSync(notFound)) fs.copyFileSync(notFound, path.join(OUT, '404.html'));
else console.warn('! 404/index.html not found, 404.html not written');

// Content-Security-Policy for nginx. Angular emits small inline scripts (event replay
// bootstrap) and an inline onload handler for non-critical CSS; they are allowed by hash so
// no 'unsafe-inline' is needed for scripts. Written next to the browser folder and copied
// into the nginx image by the Dockerfile.
const sha = (s) => `'sha256-${crypto.createHash('sha256').update(s, 'utf8').digest('base64')}'`;
const scriptHashes = new Set();
const handlerHashes = new Set();
const allHtml = [];
const walk = (dir) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.html')) allHtml.push(p);
  }
};
walk(OUT);
for (const f of allHtml) {
  const html = fs.readFileSync(f, 'utf8');
  for (const m of html.matchAll(/<script(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>/g)) {
    if (/type="application\/(ld\+)?json"/.test(m[1])) continue;
    scriptHashes.add(sha(m[2]));
  }
  for (const m of html.matchAll(/\son[a-z]+="([^"]*)"/g)) handlerHashes.add(sha(m[1].replace(/&#39;|&apos;/g, "'")));
}
const csp = [
  "default-src 'self'",
  `script-src 'self' ${[...scriptHashes].join(' ')}${handlerHashes.size ? ` 'unsafe-hashes' ${[...handlerHashes].join(' ')}` : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  'frame-src https://www.google.com https://maps.google.com',
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
].join('; ');
fs.writeFileSync(
  path.join(OUT, '..', 'csp.conf'),
  `# Generated by scripts/build-sitemap.mjs. Do not edit.\nadd_header Content-Security-Policy "${csp}" always;\n`,
);

console.log(
  `sitemap.xml: ${routes.length} routes, sitemap-images.xml: ${imageCount} images, robots.txt, 404.html, ` +
    `font preload (${heroFonts.length}) on the home page, ${sharePages} WhatsApp preview pages (/p/<code>), csp.conf (${scriptHashes.size} script + ${handlerHashes.size} handler hashes)`,
);
