# P K Guled Ilkal Sarees website

Static, prerendered Angular site for P K Guled (Ilkal, Karnataka, since 1875). There is no backend: every page is a plain HTML file served by nginx, all text comes from JSON, and the only way to buy is WhatsApp.

## Quick start

```bash
npm install
npm run build          # images -> Angular prerender -> sitemaps/robots/404/CSP
npm run serve:static   # http://localhost:4300 (serves the prerendered output)
npm start              # dev server with live reload (http://localhost:4200)
```

`npm run build` runs three steps automatically:

| Step | Script | What it does |
|---|---|---|
| `prebuild` | `scripts/build-images.mjs` (`npm run images`) | Reads `raw-images/`, writes `public/img/**` (400 px webp thumbs, 800 px webp + jpg, covers, site images) and `src/assets/data/catalog/*.json` |
| `build` | `ng build` | Prerenders every route to static HTML in `dist/pkguled-web/browser` |
| `postbuild` | `scripts/build-sitemap.mjs` | Writes `sitemap.xml`, `sitemap-images.xml`, `robots.txt`, `404.html`, the hero font preload and `dist/pkguled-web/csp.conf` |

The image step is incremental: only new or changed photos are converted.

## Editing content (no code changes)

All content lives in `src/assets/data/`. Edit, rebuild, redeploy.

| File | What it controls |
|---|---|
| `site.json` | Brand, WhatsApp number, phone, address, map, GSTN, hours, social links, announcement bar, WhatsApp message templates, SEO defaults, page labels |
| `home.json` | Home page sections: hero, press, how to order, collections intro, story, why us, reviews, visit, final CTA |
| `about.json` | Our Story page |
| `categories.json` | The 14 collections: order, names, codes, fabric/loom filters, cover photo, featured flag |
| `nav.json` | Header links and footer columns |
| `site-images.json` | Which photo from the `00 ...` folders is used for the logo, hero, press logos, founder, OG image |
| `catalog/*.json`, `codes.lock.json` | **Generated** by the image step. Do not edit by hand (see below) |

Any value that starts with `TODO` is treated as empty and hidden on the site (for example `email`, `hours`, category `description`). Fill it in when you have the real text.

Change the WhatsApp number in one place, `site.json` → `contact.whatsapp` (digits only, with country code) and `contact.phoneDisplay`, then rebuild. Every WhatsApp button, call link and the announcement bar update.

## Adding new saree photos

1. Drop the photos (jpg, png or webp, ideally square) into the right category folder in `raw-images/`, for example `raw-images/07 Pure Cotton Queen Ilkal Handloom Sarees/`.
2. Run `npm run build` (or `docker compose up -d --build` on the server).

New photos get the next free code, for example `PCQ-096`. Existing photos keep their code forever because the mapping is stored in `src/assets/data/codes.lock.json`. **Commit that file**: customers quote these codes on WhatsApp.

To remove a photo, delete it from the folder (its code is never reused) or add its file name to that category's `excludeFiles` list.

## Adding a new category

1. Create the folder in `raw-images/`, for example `raw-images/15 Silk Kasuti Special/`, and put the photos in it.
2. Put a square cover photo in `raw-images/00 Collections Page (category covers)/`.
3. Add one entry to `src/assets/data/categories.json`:

   ```json
   {
     "slug": "silk-kasuti-special",
     "code": "SKS",
     "folder": "15 Silk Kasuti Special",
     "title": "Silk Kasuti Special Sarees",
     "shortTitle": "Silk Kasuti Special",
     "fabric": "silk",
     "loom": "handloom",
     "badge": "PURE SILK",
     "spec": "TODO",
     "description": "TODO",
     "seoDescription": "TODO",
     "cover": "my-cover.jpg",
     "featured": false,
     "excludeFiles": ["cropped-datt-1.png"]
   }
   ```

   `fabric` is one of `silk`, `silk-cotton`, `cotton`, `viscose-cotton`, `khun`. `loom` is one of `handloom`, `powerloom`, `fabric`. `code` must be unique (3 letters).
4. Rebuild. The new page `/collections/silk-kasuti-special` is prerendered, listed on `/collections`, in the category chips, the sitemap and the image sitemap.

## Project layout

```
src/app/core/        models, ContentService, SeoService, WhatsAppService, platform helpers
src/app/shared/      header, footer, announcement bar, WhatsApp buttons, category card, icons, reveal
src/app/features/    home, collections, category (virtual grid, tile, lightbox), about, visit, not-found
src/assets/data/     all JSON content
src/styles/          design tokens, typography, base styles
scripts/             build-images.mjs, build-sitemap.mjs
nginx/               nginx server config and security headers
raw-images/          original photos (git-ignored, needed for the build)
```

## How it stays fast

- Every route is prerendered. The home page hydrates only the hero; the sections below never hydrate or hydrate on first tap (Angular incremental hydration).
- Category pages render the first 12 tiles as real HTML for Google, then switch to a window-scrolling CDK virtual grid (rows of 2 to 5 square tiles). Only rows near the screen exist in the DOM, so images load only as you scroll.
- The lightbox loads one 800 px image, then preloads only the next and previous ones.
- The Google Map iframe loads only after "Show map" is tapped.

## Deployment

See [DEPLOY.md](DEPLOY.md).
