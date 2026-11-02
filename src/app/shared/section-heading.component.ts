import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Eyebrow + H2 + optional lead paragraph. Project extra content (e.g. a button) at the end. */
@Component({
  selector: 'app-section-heading',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.is-center]': "align() === 'center'", '[class.is-dark]': 'dark()' },
  template: `
    <div class="text">
      <span class="eyebrow">{{ eyebrow() }}</span>
      <h2 [id]="headingId() || null">{{ heading() }}</h2>
      @if (lead()) {
        <p class="lead">{{ lead() }}</p>
      }
    </div>
    <ng-content />
  `,
  styles: `
    :host {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-end;
      justify-content: space-between;
      gap: var(--s-5);
    }
    .text {
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-width: 780px;
    }
    :host(.is-center) {
      justify-content: center;
      text-align: center;
      .text {
        align-items: center;
        gap: 14px;
        max-width: 760px;
      }
    }
    :host(.is-dark) {
      h2 {
        color: var(--c-ivory);
      }
      .eyebrow {
        color: var(--c-gold-light);
      }
      .lead {
        color: var(--c-cream);
      }
    }
  `,
})
export class SectionHeadingComponent {
  readonly eyebrow = input('');
  readonly heading = input.required<string>();
  readonly lead = input<string>();
  readonly headingId = input<string>();
  readonly align = input<'start' | 'center'>('start');
  readonly dark = input(false);
}
