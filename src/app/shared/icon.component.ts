import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type IconName =
  | 'menu'
  | 'close'
  | 'arrow-left'
  | 'arrow-right'
  | 'chevron-right'
  | 'share'
  | 'phone'
  | 'pin'
  | 'instagram'
  | 'facebook'
  | 'youtube'
  | 'whatsapp';

/** Inline SVG icons (no icon font). Decorative by default. */
@Component({
  selector: 'app-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true', class: 'icon' },
  styles: `
    :host {
      display: inline-flex;
      flex: none;
      line-height: 0;
    }
  `,
  template: `
    <svg
      [attr.width]="size()"
      [attr.height]="size()"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
      focusable="false"
    >
      @switch (name()) {
        @case ('menu') {
          <path d="M4 7h16M4 12h16M4 17h16" />
        }
        @case ('close') {
          <path d="M6 6l12 12M18 6L6 18" />
        }
        @case ('arrow-left') {
          <path d="M15 5l-7 7 7 7" />
        }
        @case ('arrow-right') {
          <path d="M9 5l7 7-7 7" />
        }
        @case ('chevron-right') {
          <path d="M10 7l5 5-5 5" />
        }
        @case ('share') {
          <path d="M12 4v11M7.5 8.5L12 4l4.5 4.5M5 13v5a2 2 0 002 2h10a2 2 0 002-2v-5" />
        }
        @case ('phone') {
          <path
            d="M5 4h3l2 5-2.5 1.5a11 11 0 005 5L14 13l5 2v3a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z"
          />
        }
        @case ('pin') {
          <path d="M12 21s-7-6.2-7-11.5A7 7 0 0119 9.5C19 14.8 12 21 12 21z" />
          <circle cx="12" cy="9.5" r="2.5" />
        }
        @case ('instagram') {
          <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" />
        }
        @case ('facebook') {
          <path d="M14 8h3V4h-3a4 4 0 00-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8z" />
        }
        @case ('youtube') {
          <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
          <path d="M10 9.5v5l4.5-2.5z" fill="currentColor" />
        }
        @case ('whatsapp') {
          <path
            d="M4 20l1.2-3.9A8.5 8.5 0 1112 20.5a8.4 8.4 0 01-4.1-1.1L4 20z"
          />
          <path
            d="M9 8.5c0 3.5 2.6 6.5 6 6.5l1-1.5-2-1-1 1c-1-.5-2-1.5-2.5-2.5l1-1-1-2-1.5 1z"
            fill="currentColor"
            stroke="none"
          />
        }
      }
    </svg>
  `,
})
export class IconComponent {
  readonly name = input.required<IconName>();
  readonly size = input(20);
}
