import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContentService } from '../core/content.service';

@Component({
  selector: 'app-brand-logo',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.is-dark]': 'dark()' },
  template: `
    @let brand = content.site().brand;
    <a routerLink="/" class="logo">
      <img
        class="mark"
        [src]="brand.mark.src"
        [width]="brand.mark.width"
        [height]="brand.mark.height"
        [alt]="brand.mark.alt"
        fetchpriority="high"
      />
      <span class="words">
        <span class="name">{{ brand.name.toUpperCase() }}</span>
        <span class="sub">{{ brand.tagline.toUpperCase() }}&nbsp;&nbsp;•&nbsp;&nbsp;SINCE {{ brand.since }}</span>
      </span>
    </a>
  `,
  styles: `
    .logo {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      text-decoration: none;
    }
    .mark {
      width: auto;
      height: 56px;
      filter: drop-shadow(0 2px 3px rgb(74 16 24 / 18%));
      @media (max-width: 1023px) {
        height: 46px;
      }
    }
    .words {
      display: flex;
      flex-direction: column;
      gap: 2px;
      line-height: normal;
    }
    .name {
      font-family: var(--font-display);
      font-weight: 700;
      font-size: 20px;
      letter-spacing: 1.6px;
      color: var(--c-maroon);
      white-space: nowrap;
    }
    .sub {
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 1.4px;
      color: var(--c-gold-text);
      white-space: nowrap;
    }
    :host(.is-dark) {
      .name {
        color: var(--c-cream);
        font-size: 24px;
        letter-spacing: 1.92px;
      }
      .sub {
        color: var(--c-gold-light);
      }
      .mark {
        height: 64px;
        filter: none;
      }
    }
    @media (max-width: 380px) {
      .name {
        font-size: 17px;
      }
      .sub {
        font-size: 9px;
        letter-spacing: 1px;
      }
    }
  `,
})
export class BrandLogoComponent {
  protected readonly content = inject(ContentService);
  /** Light text for the dark footer. */
  readonly dark = input(false);
}
