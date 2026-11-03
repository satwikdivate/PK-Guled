import { A11yModule } from '@angular/cdk/a11y';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { CatalogItem, SiteConfig } from '../../core/models';
import { WhatsAppService } from '../../core/whatsapp.service';
import { IconComponent } from '../../shared/icon.component';

/** Full-screen image viewer, attached to a CDK overlay by the category page. */
@Component({
  selector: 'app-lightbox',
  imports: [A11yModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown)': 'onKey($event)',
  },
  template: `
    @let it = current();
    <div
      class="lb"
      role="dialog"
      aria-modal="true"
      [attr.aria-label]="'Design ' + it.code + ', ' + categoryTitle()"
      cdkTrapFocus
      [cdkTrapFocusAutoCapture]="true"
    >
      <div class="top">
        <p class="count" aria-live="polite">{{ index() + 1 }} / {{ items().length }}</p>
        <button type="button" class="icon-btn" (click)="closed.emit()" aria-label="Close">
          <app-icon name="close" [size]="26" />
        </button>
      </div>

      <div
        class="stage"
        (click)="onStageClick($event)"
        (touchstart)="onTouchStart($event)"
        (touchend)="onTouchEnd($event)"
      >
        <div class="frame" [style.aspect-ratio]="it.w + ' / ' + it.h">
          <img class="thumb" [src]="it.thumb" [width]="it.w" [height]="it.h" alt="" />
          @for (i of [it]; track i.code) {
            <picture>
              <source [srcset]="i.full" type="image/webp" />
              <img
                class="full"
                [class.is-loaded]="loadedCode() === i.code"
                [src]="i.fallback"
                [width]="i.w"
                [height]="i.h"
                [alt]="alt()"
                (load)="onFullLoad(i.code)"
              />
            </picture>
          }
        </div>

        @if (items().length > 1) {
          <button type="button" class="nav nav--prev icon-btn" (click)="prev()" aria-label="Previous design">
            <app-icon name="arrow-left" [size]="28" />
          </button>
          <button type="button" class="nav nav--next icon-btn" (click)="next()" aria-label="Next design">
            <app-icon name="arrow-right" [size]="28" />
          </button>
        }
      </div>

      <div class="bar">
        <div class="meta">
          <p class="code">{{ it.code }}</p>
          <p class="cat">{{ categoryTitle() }}</p>
        </div>
        <div class="actions">
          <a class="btn btn--wa" [href]="askHref()" target="_blank" rel="noopener">
            <img src="/icons/chat-20.svg" width="20" height="20" alt="" />{{ labels().lightboxAsk }}
          </a>
        </div>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
      height: 100%;
      color: var(--c-cream);
    }
    .lb {
      display: grid;
      grid-template-rows: auto minmax(0, 1fr) auto;
      width: 100%;
      height: 100%;
      outline: none;
    }
    .top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 12px 8px 20px;
    }
    .count {
      font-size: 14px;
      font-variant-numeric: tabular-nums;
      color: var(--c-night-text);
    }
    .icon-btn {
      display: grid;
      place-items: center;
      width: 48px;
      height: 48px;
      padding: 0;
      border: 0;
      border-radius: 50%;
      background: rgb(255 255 255 / 8%);
      color: var(--c-white);
      cursor: pointer;
      &:hover {
        background: rgb(255 255 255 / 18%);
      }
    }
    .stage {
      position: relative;
      display: grid;
      place-items: center;
      padding: 0 12px;
      touch-action: pan-y pinch-zoom;
      @media (min-width: 768px) {
        padding: 0 88px;
      }
    }
    .frame {
      position: relative;
      max-width: 100%;
      max-height: 100%;
      height: min(100%, 800px);
      overflow: hidden;
      border-radius: var(--radius-md);
      @media (max-width: 767px) {
        width: 100%;
        height: auto;
      }
      img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
    }
    .thumb {
      filter: blur(12px);
      transform: scale(1.04);
    }
    picture {
      position: absolute;
      inset: 0;
    }
    .full {
      opacity: 0;
      transition: opacity 0.25s ease-out;
      &.is-loaded {
        opacity: 1;
      }
    }
    .nav {
      position: absolute;
      top: 50%;
      translate: 0 -50%;
      width: 56px;
      height: 56px;
      background: rgb(0 0 0 / 35%);
      &--prev {
        left: 16px;
      }
      &--next {
        right: 16px;
      }
      @media (max-width: 767px) {
        top: auto;
        bottom: 12px;
        translate: none;
        width: 48px;
        height: 48px;
        &--prev {
          left: 20px;
        }
        &--next {
          right: 20px;
        }
      }
    }
    .bar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 12px 24px;
      padding: 16px 20px max(20px, env(safe-area-inset-bottom));
      @media (min-width: 768px) {
        padding-inline: 88px;
      }
    }
    .code {
      font-family: var(--font-display);
      font-size: 24px;
      font-weight: 700;
      color: var(--c-white);
    }
    .cat {
      font-size: 14px;
      color: var(--c-night-text);
    }
    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      .btn {
        box-shadow: none;
      }
    }
  `,
})
export class LightboxComponent {
  private readonly wa = inject(WhatsAppService);

  readonly items = input.required<CatalogItem[]>();
  readonly index = model.required<number>();
  readonly categoryTitle = input.required<string>();
  readonly alt = input('');
  readonly labels = input.required<SiteConfig['pages']['category']>();
  readonly closed = output<void>();

  protected readonly current = computed(() => this.items()[this.index()]);
  protected readonly loadedCode = signal<string | null>(null);
  protected readonly askHref = computed(() =>
    this.wa.link('item', {
      code: this.current().code,
      category: this.categoryTitle(),
      link: `/p/${this.current().code}`,
    }),
  );

  private touch: { x: number; y: number } | null = null;
  private readonly preloaded = new Set<string>();


  prev(): void {
    const n = this.items().length;
    this.index.set((this.index() - 1 + n) % n);
  }

  next(): void {
    this.index.set((this.index() + 1) % this.items().length);
  }

  protected onKey(e: KeyboardEvent): void {
    if (e.key === 'Escape') this.closed.emit();
    else if (e.key === 'ArrowLeft') this.prev();
    else if (e.key === 'ArrowRight') this.next();
    else return;
    e.preventDefault();
  }

  /** After the current full image loads, warm up only its two neighbours. */
  protected onFullLoad(code: string): void {
    this.loadedCode.set(code);
    const items = this.items();
    const n = items.length;
    const i = this.index();
    for (const j of [(i + 1) % n, (i - 1 + n) % n]) {
      const src = items[j].full;
      if (j === i || this.preloaded.has(src)) continue;
      this.preloaded.add(src);
      const img = new Image();
      img.decoding = 'async';
      img.src = src;
    }
  }

  protected onStageClick(e: MouseEvent): void {
    if (e.target === e.currentTarget) this.closed.emit();
  }

  protected onTouchStart(e: TouchEvent): void {
    this.touch = e.touches.length === 1 ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : null;
  }

  protected onTouchEnd(e: TouchEvent): void {
    if (!this.touch || e.changedTouches.length !== 1) return;
    // Ignore swipes while the page is pinch-zoomed.
    if (window.visualViewport && window.visualViewport.scale > 1.05) return;
    const dx = e.changedTouches[0].clientX - this.touch.x;
    const dy = e.changedTouches[0].clientY - this.touch.y;
    this.touch = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) this.next();
      else this.prev();
    } else if (dy > 90 && Math.abs(dy) > Math.abs(dx)) {
      this.closed.emit();
    }
  }
}
