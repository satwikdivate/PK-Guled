import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContentService } from '../../core/content.service';
import { HomeConfig } from '../../core/models';
import { CategoryCardComponent } from '../../shared/category-card.component';
import { SectionHeadingComponent } from '../../shared/section-heading.component';

/** "Shop by fabric": filter chips + category cards. Deferred on the home page. */
@Component({
  selector: 'app-home-collections',
  imports: [RouterLink, CategoryCardComponent, SectionHeadingComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let cfg = config();
    <app-section-heading
      [eyebrow]="cfg.eyebrow"
      [heading]="cfg.heading"
      [lead]="cfg.lead"
      headingId="collections-title"
    >
      <a routerLink="/collections" class="btn btn--outline">{{ cfg.viewAll }}</a>
    </app-section-heading>

    <div class="chips" role="group" [attr.aria-label]="cfg.filterLabel">
      <span class="chips-label" aria-hidden="true">{{ cfg.filterLabel }}</span>
      @for (f of cfg.filters; track f.value) {
        <button type="button" class="chip" [attr.aria-pressed]="filter() === f.value" (click)="filter.set(f.value)">
          {{ f.label }}
        </button>
      }
      <a routerLink="/collections" class="chip chip--link">Explore all collections →</a>
    </div>

    <ul role="list" class="grid" aria-live="polite">
      @for (c of visible(); track c.slug) {
        <li><app-category-card [category]="c" /></li>
      }
    </ul>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 32px;
    }
    .chips {
      display: flex;
      align-items: center;
      gap: 10px;
      overflow-x: auto;
      scrollbar-width: none;
      margin-inline: calc(-1 * var(--gutter));
      padding: 2px var(--gutter);
      &::-webkit-scrollbar {
        display: none;
      }
    }
    .chips-label {
      font-size: 14px;
      font-weight: 600;
      white-space: nowrap;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px;
      @media (min-width: 768px) {
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 24px;
      }
    }
  `,
})
export class HomeCollectionsComponent {
  private readonly content = inject(ContentService);
  readonly config = input.required<HomeConfig['collections']>();
  protected readonly filter = signal('all');

  protected readonly visible = computed(() => {
    const all = this.content.categoryCards();
    const f = this.filter();
    if (f === 'all') return all.filter((c) => c.featured);
    return all.filter((c) => c.fabric === f);
  });
}
