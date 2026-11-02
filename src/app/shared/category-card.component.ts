import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { isSet } from '../core/content.service';
import { CatalogIndexEntry, Category } from '../core/models';
import { WhatsAppButtonComponent } from './whatsapp-button.component';

export type CategoryCardData = Category & { entry?: CatalogIndexEntry };

@Component({
  selector: 'app-category-card',
  imports: [RouterLink, WhatsAppButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let c = category();
    <article class="card">
      <div class="media" [style.background-image]="c.entry ? 'url(' + c.entry.coverBlur + ')' : null">
        @if (c.entry) {
          <img
            [src]="c.entry.cover"
            width="600"
            height="600"
            [alt]="c.title + ' cover'"
            loading="lazy"
            decoding="async"
          />
        }
        <span class="badge">{{ c.badge }}</span>
      </div>
      <div class="body">
        @if (headingLevel() === 2) {
          <h2 class="title"><a [routerLink]="['/collections', c.slug]">{{ c.title }}</a></h2>
        } @else {
          <h3 class="title"><a [routerLink]="['/collections', c.slug]">{{ c.title }}</a></h3>
        }
        <p class="meta">{{ meta() }}</p>
        <div class="foot">
          <span class="price">Price on request</span>
          <span class="cta">
            <app-whatsapp-button
              size="sm"
              label="Ask price"
              kind="category"
              [category]="c.title"
              [ariaLabel]="'Ask price for ' + c.title + ' on WhatsApp'"
            />
          </span>
        </div>
      </div>
    </article>
  `,
  styles: `
    :host {
      display: block;
      height: 100%;
    }
    .card {
      position: relative;
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow: hidden;
      border-radius: var(--radius-card);
      background: var(--c-ivory);
      transition: box-shadow 0.25s ease;
      &:hover {
        box-shadow: var(--shadow-card);
      }
      &:focus-within {
        box-shadow: 0 0 0 3px var(--c-gold);
      }
    }
    .media {
      position: relative;
      aspect-ratio: 384 / 420;
      overflow: hidden;
      background: var(--c-sand) center / cover no-repeat;
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.5s var(--ease);
      }
    }
    .card:hover .media img {
      transform: scale(1.04);
    }
    .badge {
      position: absolute;
      top: 16px;
      left: 16px;
      padding: 5px 10px;
      border-radius: var(--radius-pill);
      background: var(--c-white);
      color: var(--c-maroon);
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.88px;
      line-height: normal;
    }
    .body {
      display: flex;
      flex: 1;
      flex-direction: column;
      gap: 8px;
      padding: 20px 24px 24px;
    }
    .title {
      font-size: 22px;
      line-height: 1.25;
      a {
        color: inherit;
        text-decoration: none;
        outline: none;
        // Stretch the link over the whole card.
        &::after {
          content: '';
          position: absolute;
          inset: 0;
          z-index: 1;
        }
      }
    }
    .meta {
      font-size: 14px;
      color: var(--c-muted);
      white-space: pre-wrap;
    }
    .foot {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      margin-top: auto;
      padding-top: 12px;
    }
    .price {
      font-size: 13px;
      font-weight: 500;
      color: var(--c-muted);
    }
    .cta {
      position: relative;
      z-index: 2;
    }
    @media (max-width: 599px) {
      .body {
        padding: 14px 14px 16px;
      }
      .title {
        font-size: 17px;
      }
      .meta {
        font-size: 13px;
      }
      .badge {
        top: 10px;
        left: 10px;
        font-size: 10px;
      }
      .foot {
        flex-direction: column;
        align-items: stretch;
      }
      .price {
        display: none;
      }
      .cta ::ng-deep .btn {
        width: 100%;
      }
    }
  `,
})
export class CategoryCardComponent {
  readonly category = input.required<CategoryCardData>();
  readonly headingLevel = input<2 | 3>(3);

  protected readonly meta = computed(() => {
    const c = this.category();
    const count = c.entry ? `${c.entry.count} designs` : '';
    return [count, isSet(c.spec) ? c.spec : ''].filter(Boolean).join('  •  ');
  });
}
