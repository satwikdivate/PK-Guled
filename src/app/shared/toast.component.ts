import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PhotoShareService } from '../core/photo-share.service';
import { IconComponent } from './icon.component';

/** Small notice at the bottom of the screen (e.g. "Photo copied, press Ctrl+V"). */
@Component({
  selector: 'app-toast',
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="toast" role="status" aria-live="polite">
      @if (photo.toast(); as message) {
        <p>{{ message }}</p>
        <button type="button" (click)="photo.dismissToast()" aria-label="Dismiss">
          <app-icon name="close" [size]="18" />
        </button>
      }
    </div>
  `,
  styles: `
    .toast {
      position: fixed;
      left: 50%;
      bottom: 24px;
      z-index: 1100;
      translate: -50% 0;
      display: flex;
      align-items: center;
      gap: 12px;
      max-width: min(560px, calc(100vw - 32px));
      padding: 0;
      border-radius: var(--radius-md);
      background: var(--c-night);
      color: var(--c-cream);
      font-size: 15px;
      line-height: 1.45;
      box-shadow: 0 12px 30px rgb(0 0 0 / 35%);
      &:has(p) {
        padding: 14px 12px 14px 18px;
      }
    }
    button {
      display: grid;
      place-items: center;
      flex: none;
      width: 36px;
      height: 36px;
      padding: 0;
      border: 0;
      border-radius: 50%;
      background: rgb(255 255 255 / 10%);
      color: inherit;
      cursor: pointer;
    }
  `,
})
export class ToastComponent {
  protected readonly photo = inject(PhotoShareService);
}
