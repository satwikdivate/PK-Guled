import { Injectable, inject } from '@angular/core';
import { ContentService } from './content.service';

export type WaKind = 'general' | 'category' | 'item';

/** Builds wa.me links from the number and message templates in site.json. */
@Injectable({ providedIn: 'root' })
export class WhatsAppService {
  private readonly content = inject(ContentService);

  link(kind: WaKind = 'general', vars: { category?: string; code?: string } = {}): string {
    const site = this.content.site();
    const text = site.whatsappTemplates[kind]
      .replace(/\{category\}/g, vars.category ?? '')
      .replace(/\{code\}/g, vars.code ?? '');
    return `https://wa.me/${site.contact.whatsapp}?text=${encodeURIComponent(text)}`;
  }

  tel(): string {
    return `tel:+${this.content.site().contact.whatsapp}`;
  }
}
