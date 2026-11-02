import { ScrollingModule } from '@angular/cdk/scrolling';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { CatalogItem, Category } from '../../core/models';
import { SareeTileComponent } from './saree-tile.component';

/** How many tiles are rendered as a plain grid in the prerendered HTML. */
export const STATIC_TILES = 12;

export function sareeAlt(cat: Category, code: string): string {
  const woven = cat.loom === 'handloom' ? 'handwoven ' : '';
  const kind = cat.fabric === 'khun' ? 'fabric' : 'saree';
  return `${cat.title}, design ${code}, ${woven}Ilkal ${kind} from P K Guled, Ilkal`;
}

function columnsFor(width: number): number {
  if (width < 600) return 2;
  if (width < 960) return 3;
  if (width < 1280) return 4;
  return 5;
}

/**
 * Product grid with window-scrolling virtual rows (CDK virtual scroll is row based, so
 * items are chunked into rows of `columns()` tiles). Tiles are square, so a row's height
 * is known exactly: tileWidth + gap.
 *
 * Prerender: the first STATIC_TILES tiles are rendered as a normal grid with real <img>
 * tags. In the browser the virtual viewport is rendered underneath and the static grid is
 * removed as soon as the viewport has painted its first rows, so nothing flashes.
 */
@Component({
  selector: 'app-saree-grid',
  imports: [ScrollingModule, SareeTileComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="frame" [class.is-measured]="width() > 0">
      @if (showStatic()) {
        <ul role="list" class="static" [class.is-overlay]="virtual()">
          @for (it of staticItems(); track it.code) {
            <li>
              <app-saree-tile
                [item]="it"
                [categoryTitle]="category().title"
                [alt]="alt(it.code)"
                [askLabel]="askLabel()"
                [eager]="$index < 2"
                [fade]="false"
                (open)="openAt($index, $event)"
              />
            </li>
          }
        </ul>
      }

      @if (virtual()) {
        <cdk-virtual-scroll-viewport
          scrollWindow
          [itemSize]="rowHeight()"
          [minBufferPx]="minBuffer()"
          [maxBufferPx]="maxBuffer()"
          class="viewport"
          role="list"
          [attr.aria-label]="category().title + ' designs'"
          (scrolledIndexChange)="firstRow.set($event)"
        >
          <div
            *cdkVirtualFor="let row of rows(); trackBy: trackRow; let r = index"
            class="row"
            role="none"
            [style.height.px]="rowHeight()"
            [style.padding-bottom.px]="gap()"
            [style.grid-template-columns]="'repeat(' + columns() + ', minmax(0, 1fr))'"
            [style.column-gap.px]="gap()"
          >
            @for (it of row; track it.code) {
              <app-saree-tile
                role="listitem"
                [item]="it"
                [categoryTitle]="category().title"
                [alt]="alt(it.code)"
                [askLabel]="askLabel()"
                (open)="openAt(r * columns() + $index, $event)"
              />
            }
          </div>
        </cdk-virtual-scroll-viewport>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
      container-type: inline-size;
    }
    .frame {
      position: relative;
    }
    // Same breakpoints as columnsFor(), expressed as container queries for the static grid.
    .static {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px;
      @container (min-width: 600px) {
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 16px;
      }
      @container (min-width: 960px) {
        grid-template-columns: repeat(4, minmax(0, 1fr));
      }
      @container (min-width: 1280px) {
        grid-template-columns: repeat(5, minmax(0, 1fr));
      }
      &.is-overlay {
        position: absolute;
        inset: 0 0 auto 0;
        z-index: 1;
        background: var(--c-ivory);
      }
    }
    .viewport {
      display: block;
      contain: none;
    }
    .row {
      display: grid;
      box-sizing: border-box;
    }
  `,
})
export class SareeGridComponent {
  readonly items = input.required<CatalogItem[]>();
  readonly category = input.required<Category>();
  readonly askLabel = input('Ask price');
  /** Emits the item index and the element that opened it (focus returns there). */
  readonly open = output<{ index: number; trigger: HTMLElement }>();
  /** Emits once the virtual viewport has rendered, so the page can restore scroll. */
  readonly ready = output<void>();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  protected readonly width = signal(0);
  protected readonly virtual = signal(false);
  protected readonly showStatic = signal(true);
  protected readonly firstRow = signal(0);
  private readonly viewportH = signal(800);

  protected readonly columns = computed(() => columnsFor(this.width()));
  protected readonly gap = computed(() => (this.width() < 600 ? 12 : 16));
  protected readonly tile = computed(
    () => (this.width() - this.gap() * (this.columns() - 1)) / this.columns(),
  );
  protected readonly rowHeight = computed(() => Math.max(1, this.tile() + this.gap()));
  protected readonly minBuffer = computed(() => Math.round(this.viewportH() * 1.5));
  protected readonly maxBuffer = computed(() => Math.round(this.viewportH() * 2.5));

  protected readonly staticItems = computed(() => this.items().slice(0, STATIC_TILES));
  protected readonly rows = computed(() => {
    const items = this.items();
    const cols = this.columns();
    const rows: CatalogItem[][] = [];
    for (let i = 0; i < items.length; i += cols) rows.push(items.slice(i, i + cols));
    return rows;
  });

  protected readonly trackRow = (_: number, row: CatalogItem[]) => row[0]?.code;

  constructor() {
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      this.viewportH.set(innerHeight);
      this.width.set(this.host.clientWidth);

      const ro = new ResizeObserver(() => this.onResize());
      ro.observe(this.host);
      const onWinResize = () => this.viewportH.set(innerHeight);
      addEventListener('resize', onWinResize, { passive: true });
      destroyRef.onDestroy(() => {
        ro.disconnect();
        removeEventListener('resize', onWinResize);
      });

      // Switch to the virtual viewport in its own task (not inside hydration), then drop the
      // static grid once the viewport has had two frames to paint its rows.
      const idle = window.requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 1));
      const handle = idle(() => {
        this.virtual.set(true);
        requestAnimationFrame(() =>
          requestAnimationFrame(() => {
            this.showStatic.set(false);
            this.ready.emit();
          }),
        );
      });
      destroyRef.onDestroy(() => (window.cancelIdleCallback ?? clearTimeout)(handle as number));
    });
  }

  protected alt(code: string): string {
    return sareeAlt(this.category(), code);
  }

  protected openAt(index: number, trigger: HTMLElement): void {
    this.open.emit({ index, trigger });
  }

  /** Recompute columns and keep the item at the top of the screen in view. */
  private onResize(): void {
    const newWidth = this.host.clientWidth;
    if (newWidth === this.width()) return;

    const oldCols = this.columns();
    const oldRowH = this.rowHeight();
    const gridTop = this.host.getBoundingClientRect().top + scrollY;
    const offset = scrollY - gridTop;
    const anchorIndex = offset > 0 ? Math.floor(offset / oldRowH) * oldCols : -1;

    this.width.set(newWidth);

    if (anchorIndex > 0 && this.columns() !== oldCols) {
      const targetRow = Math.floor(anchorIndex / this.columns());
      requestAnimationFrame(() => scrollTo({ top: gridTop + targetRow * this.rowHeight(), behavior: 'instant' }));
    }
  }
}
