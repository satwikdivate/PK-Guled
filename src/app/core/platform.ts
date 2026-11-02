import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, inject } from '@angular/core';

/** Call in an injection context. */
export function injectIsBrowser(): boolean {
  return isPlatformBrowser(inject(PLATFORM_ID));
}

/** Path of an image produced from site-images.json by scripts/build-images.mjs. */
export function siteImg(id: string, width: number, format: 'webp' | 'png' | 'jpg' = 'webp'): string {
  return `/img/site/${id}-${width}.${format}`;
}

/** Path of a press / mark logo (generated at a fixed height). */
export function siteLogo(id: string, height: number): string {
  return `/img/site/${id}-h${height}.webp`;
}

/** Safe localStorage access (private mode, SSR, disabled storage). */
export const storage = {
  get(key: string): string | null {
    try {
      return typeof localStorage === 'undefined' ? null : localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch {
      /* ignore */
    }
  },
};
