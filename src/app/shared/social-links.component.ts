import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { ContentService, isSet } from '../core/content.service';
import { IconComponent, IconName } from './icon.component';

/**
 * Instagram / Facebook / YouTube links from site.json `social`.
 * - `icons`: round icon buttons (header)
 * - `pills`: icon + name (pages, mobile menu); add `dark` on dark backgrounds
 */
@Component({
  selector: 'app-social-links',
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': "'is-' + variant() + (dark() ? ' is-dark' : '')" },
  template: `
    @if (label()) {
      <p class="label">{{ label() }}</p>
    }
    <ul role="list">
      @for (s of links(); track s.name) {
        <li>
          <a
            [href]="s.url"
            target="_blank"
            rel="noopener"
            [attr.aria-label]="variant() === 'icons' ? brand() + ' on ' + s.name : null"
            [attr.title]="variant() === 'icons' ? s.name : null"
          >
            <app-icon [name]="s.icon" [size]="variant() === 'icons' ? 20 : 18" />
            @if (variant() === 'pills') {
              <span>{{ s.name }}</span>
            }
          </a>
        </li>
      }
    </ul>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .label {
      font-size: 14px;
      font-weight: 600;
      color: var(--c-ink);
    }
    ul {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }
    a {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      color: var(--c-maroon);
      text-decoration: none;
      transition:
        background-color 0.2s ease,
        color 0.2s ease,
        border-color 0.2s ease;
    }
    :host(.is-icons) a {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: 1px solid var(--c-sand);
      background: var(--c-white);
      &:hover {
        background: var(--c-maroon);
        border-color: var(--c-maroon);
        color: var(--c-white);
      }
    }
    :host(.is-pills) a {
      min-height: 44px;
      padding: 10px 18px;
      border-radius: var(--radius-pill);
      border: 1.5px solid var(--c-maroon);
      font-size: 15px;
      font-weight: 600;
      &:hover {
        background: var(--c-maroon);
        color: var(--c-white);
      }
    }
    :host(.is-dark) {
      .label {
        color: var(--c-cream);
      }
      a {
        color: var(--c-cream);
        border-color: rgb(243 227 195 / 55%);
        &:hover {
          background: var(--c-cream);
          border-color: var(--c-cream);
          color: var(--c-maroon);
        }
      }
    }
  `,
})
export class SocialLinksComponent {
  private readonly content = inject(ContentService);
  readonly variant = input<'icons' | 'pills'>('pills');
  readonly dark = input(false);
  /** Optional heading, e.g. site.json followLabel. */
  readonly label = input<string>();

  protected readonly brand = computed(() => this.content.site().brand.name);
  protected readonly links = computed(() => {
    const s = this.content.site().social;
    const all: { name: string; url: string; icon: IconName }[] = [
      { name: 'Instagram', url: s.instagram, icon: 'instagram' },
      { name: 'Facebook', url: s.facebook, icon: 'facebook' },
      { name: 'YouTube', url: s.youtube, icon: 'youtube' },
    ];
    return all.filter((l) => isSet(l.url));
  });
}
