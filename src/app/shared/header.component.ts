import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  afterNextRender,
  effect,
  inject,
  signal,
} from '@angular/core';
import {
  IsActiveMatchOptions,
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
} from '@angular/router';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ContentService } from '../core/content.service';
import { BrandLogoComponent } from './brand-logo.component';
import { IconComponent } from './icon.component';
import { WhatsAppButtonComponent } from './whatsapp-button.component';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, BrandLogoComponent, IconComponent, WhatsAppButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.is-scrolled]': 'scrolled()' },
  template: `
    <div class="container bar">
      <app-brand-logo />

      <nav class="nav" aria-label="Main">
        <ul role="list">
          @for (link of content.nav().header; track link.label) {
            <li>
              <a
                [routerLink]="link.route"
                [fragment]="link.fragment"
                routerLinkActive="is-active"
                [routerLinkActiveOptions]="link.fragment ? fragmentMatch : { exact: link.route === '/' }"
                >{{ link.label }}</a
              >
            </li>
          }
        </ul>
      </nav>

      <div class="actions">
        <span class="wa-desktop"><app-whatsapp-button label="Chat on WhatsApp" /></span>
        <button
          type="button"
          class="burger"
          (click)="open.set(!open())"
          [attr.aria-expanded]="open()"
          aria-controls="mobile-menu"
          [attr.aria-label]="open() ? 'Close menu' : 'Open menu'"
        >
          <app-icon [name]="open() ? 'close' : 'menu'" [size]="26" />
        </button>
      </div>
    </div>

    <div id="mobile-menu" class="sheet" [class.is-open]="open()" [attr.inert]="open() ? null : ''">
      <nav aria-label="Mobile">
        <ul role="list">
          @for (link of content.nav().header; track link.label) {
            <li>
              <a [routerLink]="link.route" [fragment]="link.fragment" (click)="open.set(false)">
                {{ link.label }}
                <app-icon name="chevron-right" />
              </a>
            </li>
          }
        </ul>
      </nav>
      <app-whatsapp-button label="Chat on WhatsApp" size="lg" />
      <p class="sheet-phone">or call <a [href]="'tel:+' + content.site().contact.whatsapp">{{ content.site().contact.phoneDisplay }}</a></p>
    </div>
  `,
  styles: `
    :host {
      position: sticky;
      top: 0;
      z-index: 50;
      display: block;
      background: transparent;
      border-bottom: 1px solid transparent;
      transition:
        background-color 0.25s ease,
        box-shadow 0.25s ease,
        border-color 0.25s ease;
    }
    :host(.is-scrolled) {
      background: var(--c-ivory);
      border-bottom-color: var(--c-sand);
      box-shadow: 0 6px 20px rgb(42 26 23 / 8%);
    }
    .bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 24px;
      min-height: var(--header-h);
    }
    .nav ul {
      display: flex;
      gap: 36px;
    }
    .nav a {
      position: relative;
      font-size: 15px;
      font-weight: 500;
      color: var(--c-ink);
      text-decoration: none;
      padding-block: 8px;
      &::after {
        content: '';
        position: absolute;
        left: 0;
        right: 0;
        bottom: 2px;
        height: 1.5px;
        background: var(--c-maroon);
        transform: scaleX(0);
        transition: transform 0.2s ease;
      }
      &:hover::after,
      &.is-active::after {
        transform: scaleX(1);
      }
    }
    .actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .burger {
      display: none;
      width: 44px;
      height: 44px;
      place-items: center;
      padding: 0;
      border: 0;
      border-radius: 50%;
      background: transparent;
      color: var(--c-ink);
      cursor: pointer;
    }
    .sheet {
      display: none;
    }
    @media (max-width: 1023px) {
      .nav,
      .wa-desktop {
        display: none;
      }
      .burger {
        display: grid;
      }
      .sheet {
        position: fixed;
        inset: var(--header-h) 0 0 0;
        display: flex;
        flex-direction: column;
        gap: 24px;
        padding: 16px var(--gutter) 32px;
        background: var(--c-ivory);
        overflow-y: auto;
        transform: translateX(100%);
        visibility: hidden;
        transition:
          transform 0.3s var(--ease),
          visibility 0s linear 0.3s;
        &.is-open {
          transform: none;
          visibility: visible;
          transition: transform 0.3s var(--ease);
        }
        ul a {
          display: flex;
          align-items: center;
          justify-content: space-between;
          min-height: 60px;
          border-bottom: 1px solid var(--c-sand);
          font-family: var(--font-display);
          font-size: 24px;
          font-weight: 600;
          color: var(--c-ink);
          text-decoration: none;
        }
      }
      .sheet-phone {
        text-align: center;
        color: var(--c-muted);
        a {
          color: var(--c-maroon);
          font-weight: 600;
        }
      }
    }
  `,
})
export class HeaderComponent {
  protected readonly content = inject(ContentService);
  protected readonly scrolled = signal(false);
  protected readonly open = signal(false);
  protected readonly fragmentMatch: IsActiveMatchOptions = {
    paths: 'exact',
    fragment: 'exact',
    queryParams: 'ignored',
    matrixParams: 'ignored',
  };
  private readonly doc = inject(DOCUMENT);

  constructor() {
    const destroyRef = inject(DestroyRef);

    inject(Router)
      .events.pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.open.set(false));

    effect(() => {
      this.doc.body.style.overflow = this.open() ? 'hidden' : '';
    });

    afterNextRender(() => {
      const onScroll = () => this.scrolled.set(scrollY > 40);
      onScroll();
      addEventListener('scroll', onScroll, { passive: true });
      const onKey = (e: KeyboardEvent) => e.key === 'Escape' && this.open.set(false);
      addEventListener('keydown', onKey);
      destroyRef.onDestroy(() => {
        removeEventListener('scroll', onScroll);
        removeEventListener('keydown', onKey);
      });
    });
  }
}
