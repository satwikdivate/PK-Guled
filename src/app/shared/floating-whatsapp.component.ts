import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  afterNextRender,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { WhatsAppService } from '../core/whatsapp.service';

@Component({
  selector: 'app-floating-whatsapp',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a
      class="fab"
      [class.is-visible]="visible()"
      [href]="href()"
      target="_blank"
      rel="noopener"
      [attr.aria-label]="label() + ' on WhatsApp'"
      [attr.tabindex]="visible() ? null : -1"
    >
      <img src="/icons/chat-24.svg" width="24" height="24" alt="" />
      <span class="label">{{ label() }}</span>
    </a>
  `,
  styles: `
    .fab {
      position: fixed;
      right: 16px;
      bottom: 16px;
      z-index: 40;
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 16px;
      border-radius: var(--radius-pill);
      background: var(--c-wa);
      color: var(--c-white);
      font-size: 15px;
      font-weight: 600;
      text-decoration: none;
      box-shadow: 0 10px 14px rgb(0 0 0 / 25%);
      opacity: 0;
      transform: translateY(16px) scale(0.9);
      pointer-events: none;
      transition:
        opacity 0.25s ease,
        transform 0.25s ease,
        background-color 0.2s ease;
      &.is-visible {
        opacity: 1;
        transform: none;
        pointer-events: auto;
      }
      &:hover {
        background: var(--c-wa-dark);
      }
    }
    .label {
      display: none;
    }
    @media (min-width: 768px) {
      .fab {
        right: 32px;
        bottom: 32px;
        padding: 16px 22px 16px 18px;
      }
      .label {
        display: inline;
      }
    }
  `,
})
export class FloatingWhatsAppComponent {
  private readonly wa = inject(WhatsAppService);
  readonly label = input('Ask for price');
  protected readonly visible = signal(false);
  protected readonly href = computed(() => this.wa.link('general'));

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const onScroll = () => this.visible.set(scrollY > 300);
      onScroll();
      addEventListener('scroll', onScroll, { passive: true });
      destroyRef.onDestroy(() => removeEventListener('scroll', onScroll));
    });
  }
}
