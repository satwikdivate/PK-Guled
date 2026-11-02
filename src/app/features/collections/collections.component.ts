import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ContentService } from '../../core/content.service';
import { SeoService } from '../../core/seo.service';
import { CategoryCardComponent } from '../../shared/category-card.component';

@Component({
  selector: 'app-collections',
  imports: [CategoryCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let page = content.site().pages.collections;
    <section class="section">
      <div class="container wrap">
        <header class="head">
          <span class="eyebrow">{{ page.eyebrow }}</span>
          <h1>{{ page.heading }}</h1>
          <p class="lead">{{ page.lead }}</p>
        </header>

        <div class="filters">
          <div class="chips" role="group" [attr.aria-label]="page.fabricLabel">
            <span class="chips-label" aria-hidden="true">{{ page.fabricLabel }}:</span>
            @for (f of page.fabrics; track f.value) {
              <button type="button" class="chip" [attr.aria-pressed]="fabric() === f.value" (click)="fabric.set(f.value)">
                {{ f.label }}
              </button>
            }
          </div>
          <div class="chips" role="group" [attr.aria-label]="page.loomLabel">
            <span class="chips-label" aria-hidden="true">{{ page.loomLabel }}:</span>
            @for (l of page.looms; track l.value) {
              <button type="button" class="chip" [attr.aria-pressed]="loom() === l.value" (click)="loom.set(l.value)">
                {{ l.label }}
              </button>
            }
          </div>
        </div>

        <ul role="list" class="grid" aria-live="polite">
          @for (c of visible(); track c.slug) {
            <li><app-category-card [category]="c" [headingLevel]="2" /></li>
          } @empty {
            <li class="empty">{{ page.empty }}</li>
          }
        </ul>
      </div>
    </section>
  `,
  styles: `
    .wrap {
      display: flex;
      flex-direction: column;
      gap: 32px;
    }
    .head {
      display: flex;
      flex-direction: column;
      gap: 14px;
      max-width: 760px;
    }
    .filters {
      display: flex;
      flex-direction: column;
      gap: 12px;
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
      min-width: 52px;
      font-size: 14px;
      font-weight: 600;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px;
      @media (min-width: 768px) {
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 24px;
      }
      @media (min-width: 1280px) {
        grid-template-columns: repeat(4, minmax(0, 1fr));
      }
    }
    .empty {
      grid-column: 1 / -1;
      padding: 48px 0;
      text-align: center;
      color: var(--c-muted);
    }
  `,
})
export class CollectionsComponent {
  protected readonly content = inject(ContentService);
  protected readonly fabric = signal('all');
  protected readonly loom = signal('all');

  protected readonly visible = computed(() =>
    this.content
      .categoryCards()
      .filter((c) => this.fabric() === 'all' || c.fabric === this.fabric())
      .filter((c) => this.loom() === 'all' || c.loom === this.loom()),
  );

  constructor() {
    const page = this.content.site().pages.collections;
    const seo = inject(SeoService);
    seo.update({
      title: page.title,
      description: page.description,
      path: '/collections',
      jsonLd: [
        seo.breadcrumb([
          { name: 'Home', path: '/' },
          { name: 'Collections', path: '/collections' },
        ]),
      ],
    });
  }
}
