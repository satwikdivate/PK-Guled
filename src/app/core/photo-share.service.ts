import { Injectable, inject, signal } from '@angular/core';
import { ContentService } from './content.service';
import { injectIsBrowser } from './platform';
import { WhatsAppService } from './whatsapp.service';

export interface SareeRef {
  code: string;
  category: string;
  /** Same-origin path of the 800 px JPEG, e.g. /img/<slug>/<code>-800.jpg */
  image: string;
}

/**
 * "Ask price" with the actual saree photo attached.
 *
 * - Phones/tablets: the system share sheet with the JPEG + message as caption
 *   (customer taps WhatsApp, then the P K Guled chat).
 * - Laptops/desktops: WhatsApp Web/Desktop cannot receive a file from a website, so the
 *   photo is copied to the clipboard and the shop's chat opens with the message; the
 *   customer presses Ctrl+V to attach it.
 * - Anything else (old browsers, plain http): the normal wa.me text link.
 *
 * Sharing files and writing images to the clipboard need a secure context (HTTPS or
 * localhost); on plain http the browser hides these APIs and the text link is used.
 */
@Injectable({ providedIn: 'root' })
export class PhotoShareService {
  private readonly wa = inject(WhatsAppService);
  private readonly content = inject(ContentService);
  private readonly isBrowser = injectIsBrowser();

  /** Short notice shown by <app-toast> (e.g. after copying the photo). */
  readonly toast = signal<string | null>(null);
  private toastTimer: ReturnType<typeof setTimeout> | undefined;

  /** Click handler for an "Ask price" anchor whose href is the wa.me fallback link. */
  async ask(event: MouseEvent, saree: SareeRef): Promise<void> {
    if (!this.isBrowser || event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey) return; // let "open in new tab" work

    const vars = { code: saree.code, category: saree.category, link: `/p/${saree.code}` };
    const href = this.wa.link('item', vars);
    const text = this.wa.message('item', vars);
    const touch = matchMedia('(pointer: coarse)').matches;

    if (touch && typeof navigator.canShare === 'function') {
      event.preventDefault();
      try {
        const file = await this.file(saree);
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], text });
          return;
        }
      } catch (err) {
        if ((err as DOMException)?.name === 'AbortError') return; // customer closed the sheet
      }
      this.open(href);
      return;
    }

    // navigator.clipboard is undefined on plain http, whatever the TypeScript types say.
    const canCopy = window.isSecureContext && 'clipboard' in navigator && typeof ClipboardItem !== 'undefined';
    if (canCopy) {
      event.preventDefault();
      const copied = await this.copy(saree);
      this.open(href);
      if (copied) this.show(this.content.site().pages.category.photoCopied);
      return;
    }
    // Otherwise the anchor's own wa.me href opens normally.
  }

  private async file(saree: SareeRef): Promise<File> {
    const res = await fetch(saree.image);
    if (!res.ok) throw new Error(`photo ${res.status}`);
    const blob = await res.blob();
    return new File([blob], `${saree.code}.jpg`, { type: blob.type || 'image/jpeg' });
  }

  /** Copy the photo as PNG (the only image type browsers allow on the clipboard). */
  private async copy(saree: SareeRef): Promise<boolean> {
    try {
      const png = (async () => {
        const bitmap = await createImageBitmap(await (await fetch(saree.image)).blob());
        const canvas = document.createElement('canvas');
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;
        canvas.getContext('2d')!.drawImage(bitmap, 0, 0);
        return new Promise<Blob>((resolve, reject) =>
          canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob'))), 'image/png'),
        );
      })();
      // Passing the promise keeps the write inside the click's user activation.
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': png })]);
      return true;
    } catch {
      return false;
    }
  }

  private open(href: string): void {
    const win = window.open(href, '_blank', 'noopener');
    if (!win) location.href = href;
  }

  private show(message: string): void {
    clearTimeout(this.toastTimer);
    this.toast.set(message);
    this.toastTimer = setTimeout(() => this.toast.set(null), 9000);
  }

  dismissToast(): void {
    clearTimeout(this.toastTimer);
    this.toast.set(null);
  }
}
