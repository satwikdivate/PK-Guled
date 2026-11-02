import { ChangeDetectionStrategy, Component, afterNextRender, computed, inject, signal } from '@angular/core';
import { ContentService } from '../core/content.service';
import { storage } from '../core/platform';
import { IconComponent } from './icon.component';

const KEY = 'pkg-announcement-dismissed';

@Component({
  selector: 'app-announcement-bar',
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (!dismissed()) {
      <aside class="bar" aria-label="Announcement">
        <ul role="list">
          @for (item of items(); track item; let last = $last) {
            <li [class.is-key]="last">{{ item }}</li>
          }
        </ul>
        <button type="button" class="close" (click)="dismiss()" aria-label="Dismiss announcement">
          <app-icon name="close" [size]="16" />
        </button>
      </aside>
    }
  `,
  styles: `
    .bar {
      position: relative;
      background: var(--c-deep);
      color: var(--c-cream);
      font-size: 13px;
      font-weight: 500;
      line-height: 16px;
      padding: 10px 44px;
    }
    ul {
      display: flex;
      justify-content: center;
      gap: 28px;
      margin: 0;
      padding: 0;
      list-style: none;
    }
    li {
      white-space: nowrap;
    }
    @media (max-width: 1023px) {
      li:not(.is-key) {
        display: none;
      }
    }
    @media (max-width: 400px) {
      .bar {
        font-size: 12px;
        padding-inline: 12px 40px;
      }
    }
    .close {
      position: absolute;
      right: 6px;
      top: 50%;
      translate: 0 -50%;
      display: grid;
      place-items: center;
      width: 32px;
      height: 32px;
      padding: 0;
      border: 0;
      border-radius: 50%;
      background: transparent;
      color: inherit;
      cursor: pointer;
      &:hover {
        background: rgb(255 255 255 / 12%);
      }
    }
  `,
})
export class AnnouncementBarComponent {
  protected readonly content = inject(ContentService);
  protected readonly dismissed = signal(false);
  /** {phone} in site.json announcement lines is replaced with contact.phoneDisplay. */
  protected readonly items = computed(() => {
    const site = this.content.site();
    return site.announcement.map((line) => line.replace('{phone}', site.contact.phoneDisplay));
  });

  constructor() {
    afterNextRender(() => {
      if (storage.get(KEY) === '1') this.dismissed.set(true);
    });
  }

  dismiss(): void {
    storage.set(KEY, '1');
    this.dismissed.set(true);
  }
}
