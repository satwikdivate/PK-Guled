import { Injectable, inject } from '@angular/core';
import { ContentService } from './content.service';
import { injectIsBrowser } from './platform';

export type WaKind = 'general' | 'category' | 'item';

/**
 * Builds wa.me links from the number and message templates in site.json.
 *
 * wa.me can only prefill text, so for a saree the message carries `{link}`: the saree's
 * preview page /p/<CODE> (written by scripts/build-sitemap.mjs). WhatsApp reads its og:image
 * and shows that saree's photo as the link preview. `{image}` (direct photo URL) also works.
 */
@Injectable({ providedIn: 'root' })
export class WhatsAppService {
  private readonly content = inject(ContentService);
  private readonly isBrowser = injectIsBrowser();

  link(
    kind: WaKind = 'general',
    vars: { category?: string; code?: string; image?: string; link?: string } = {},
  ): string {
    const site = this.content.site();
    const image = vars.image ? this.absolute(vars.image) : '';
    const link = vars.link ? this.absolute(vars.link) : '';
    const text = site.whatsappTemplates[kind]
      .replace(/\{category\}/g, vars.category ?? '')
      .replace(/\{code\}/g, vars.code ?? '')
      .replace(/\{image\}/g, image)
      .replace(/\{link\}/g, link)
      // Drop lines left empty by a missing value (no {link}, or "Photo: " without an image).
      .split('\n')
      .filter((line) => line.trim() !== '' && !/^[^:{]*:\s*$/.test(line))
      .join('\n');
    return `https://wa.me/${site.contact.whatsapp}?text=${encodeURIComponent(text)}`;
  }

  tel(): string {
    return `tel:+${this.content.site().contact.whatsapp}`;
  }

  /**
   * Public absolute URL for a site path, so the shop can open the photo from WhatsApp.
   * Uses the address the visitor is on when it is public (VM IP:port or the real domain);
   * on a local/dev address (localhost, LAN IPs) and in the prerender it uses seo.siteUrl.
   */
  private absolute(path: string): string {
    const siteUrl = this.content.site().seo.siteUrl.replace(/\/$/, '');
    const local =
      /^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|\[?::1\]?$|.*\.local$)/i;
    const origin = this.isBrowser && !local.test(location.hostname) ? location.origin : siteUrl;
    return origin + path;
  }
}
