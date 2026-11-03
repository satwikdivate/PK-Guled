import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { CatalogItem } from '../../core/models';
import { PhotoShareService } from '../../core/photo-share.service';
import { WhatsAppService } from '../../core/whatsapp.service';

/**
 * One square product tile. The base64 blur shows instantly as a background, the 400 px
 * thumbnail loads lazily on top and fades in. Tiles rendered in the prerendered HTML
 * (`fade = false`) are shown without the fade so they never wait for JavaScript.
 */
@Component({
  selector: 'app-saree-tile',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let it = item();
    <div class="tile" [style.background-image]="'url(' + it.blur + ')'">
      <button
        type="button"
        class="hit"
        [attr.data-code]="it.code"
        [attr.aria-label]="'View design ' + it.code + ' larger'"
        (click)="open.emit($any($event.currentTarget))"
      >
        <picture>
          <source [srcset]="it.thumb" type="image/webp" />
          <img
            #img
            [src]="it.fallback"
            width="400"
            height="400"
            [alt]="alt()"
            [attr.loading]="eager() ? 'eager' : 'lazy'"
            [attr.fetchpriority]="eager() ? 'high' : null"
            decoding="async"
            [class.fade]="fade()"
            [class.is-loaded]="loaded()"
            (load)="loaded.set(true)"
          />
        </picture>
      </button>
      <span class="code">{{ it.code }}</span>
      <a
        class="ask"
        [href]="askHref()"
        target="_blank"
        rel="noopener"
        [attr.aria-label]="askLabel() + ' for design ' + it.code + ' on WhatsApp'"
        (click)="ask($event)"
        >{{ askLabel() }}</a
      >
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    .tile {
      position: relative;
      aspect-ratio: 1;
      overflow: hidden;
      border-radius: var(--radius-md);
      background-color: var(--c-sand);
      background-size: cover;
      background-position: center;
    }
    .hit {
      display: block;
      width: 100%;
      height: 100%;
      padding: 0;
      border: 0;
      background: none;
      cursor: zoom-in;
      &:focus-visible {
        outline-offset: -4px;
      }
    }
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.5s var(--ease);
      &.fade {
        opacity: 0;
        transition:
          opacity 0.3s ease-out,
          transform 0.5s var(--ease);
      }
      &.fade.is-loaded {
        opacity: 1;
      }
    }
    .tile:hover img {
      transform: scale(1.03);
    }
    .code {
      position: absolute;
      left: 8px;
      bottom: 8px;
      padding: 4px 8px;
      border-radius: var(--radius-pill);
      background: rgb(36 9 14 / 72%);
      color: var(--c-white);
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.04em;
      pointer-events: none;
    }
    .ask {
      position: absolute;
      right: 8px;
      bottom: 8px;
      display: inline-flex;
      align-items: center;
      min-height: 32px;
      padding: 6px 12px;
      border-radius: var(--radius-pill);
      background: var(--c-wa);
      color: var(--c-white);
      font-size: 13px;
      font-weight: 600;
      text-decoration: none;
      opacity: 0;
      transform: translateY(6px);
      transition:
        opacity 0.2s ease,
        transform 0.2s ease;
    }
    .tile:hover .ask,
    .ask:focus-visible {
      opacity: 1;
      transform: none;
    }
    @media (hover: none) {
      .ask {
        opacity: 1;
        transform: none;
      }
    }
    @media (max-width: 420px) {
      .code {
        font-size: 11px;
        left: 6px;
        bottom: 6px;
      }
      .ask {
        right: 6px;
        bottom: 6px;
        min-height: 28px;
        padding: 5px 9px;
        font-size: 12px;
      }
    }
  `,
})
export class SareeTileComponent {
  private readonly wa = inject(WhatsAppService);
  private readonly photo = inject(PhotoShareService);

  readonly item = input.required<CatalogItem>();
  readonly categoryTitle = input.required<string>();
  readonly alt = input.required<string>();
  readonly askLabel = input('Ask price');
  readonly eager = input(false);
  /** Fade the thumbnail in on load. Off for prerendered tiles. */
  readonly fade = input(true);
  readonly open = output<HTMLElement>();

  protected readonly loaded = signal(false);
  private readonly img = viewChild.required<ElementRef<HTMLImageElement>>('img');

  protected readonly askHref = computed(() =>
    this.wa.link('item', {
      code: this.item().code,
      category: this.categoryTitle(),
      link: `/p/${this.item().code}`,
    }),
  );

  constructor() {
    // A cached image may finish loading before Angular listens for `load`.
    afterNextRender(() => {
      if (this.img().nativeElement.complete) this.loaded.set(true);
    });
  }

  /** Attach the actual photo (share sheet on phones, clipboard on laptops). */
  protected ask(event: MouseEvent): void {
    const it = this.item();
    void this.photo.ask(event, { code: it.code, category: this.categoryTitle(), image: it.fallback });
  }
}
