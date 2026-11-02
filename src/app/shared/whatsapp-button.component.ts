import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { WaKind, WhatsAppService } from '../core/whatsapp.service';

/**
 * WhatsApp call to action. Builds `https://wa.me/<number>?text=<template>` from site.json.
 * Variants: solid (green), outline, floating is a separate component.
 */
@Component({
  selector: 'app-whatsapp-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `
    <a
      class="btn"
      [class.btn--wa]="variant() === 'solid'"
      [class.btn--outline]="variant() === 'outline'"
      [class.btn--lg]="size() === 'lg'"
      [class.btn--xl]="size() === 'xl'"
      [class.btn--sm]="size() === 'sm'"
      [href]="href()"
      target="_blank"
      rel="noopener"
      [attr.aria-label]="ariaLabel() || null"
    >
      @if (variant() === 'solid') {
        <img
          [src]="'/icons/chat-' + iconSize() + '.svg'"
          [width]="iconSize()"
          [height]="iconSize()"
          alt=""
        />
      }
      <span>{{ label() }}</span>
    </a>
  `,
  styles: `
    .btn--sm {
      min-height: 35px;
      padding: 9px 16px;
      font-size: 14px;
      gap: 8px;
      box-shadow: none;
    }
  `,
})
export class WhatsAppButtonComponent {
  private readonly wa = inject(WhatsAppService);

  readonly label = input('Chat on WhatsApp');
  readonly kind = input<WaKind>('general');
  readonly category = input<string>();
  readonly code = input<string>();
  readonly variant = input<'solid' | 'outline'>('solid');
  readonly size = input<'sm' | 'md' | 'lg' | 'xl'>('md');
  readonly ariaLabel = input<string>();

  protected readonly href = computed(() =>
    this.wa.link(this.kind(), { category: this.category(), code: this.code() }),
  );
  protected readonly iconSize = computed(() =>
    this.size() === 'xl' ? 24 : this.size() === 'sm' ? 16 : 20,
  );
}
