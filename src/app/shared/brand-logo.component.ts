import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContentService } from '../core/content.service';

@Component({
  selector: 'app-brand-logo',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let brand = content.site().brand;
    <a routerLink="/" class="logo">
      <span class="mono" aria-hidden="true">{{ brand.monogram }}</span>
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
    .mono {
      display: grid;
      place-items: center;
      padding: 8px 10px;
      border-radius: 10px;
      background: var(--c-maroon);
      color: var(--c-cream);
      font-family: var(--font-display);
      font-weight: 700;
      font-size: 18px;
      line-height: 24px;
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
}
