import { RenderMode, ServerRoute } from '@angular/ssr';
import categories from '../assets/data/categories.json';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'collections/:slug',
    renderMode: RenderMode.Prerender,
    // One HTML file per category, read from categories.json at build time.
    getPrerenderParams: async () => categories.map((c) => ({ slug: c.slug })),
  },
  // Unknown URLs are served /404.html by nginx (copied from /404/index.html after build).
  { path: '**', renderMode: RenderMode.Prerender },
];
