import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { Location } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  untracked,
  viewChild,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ContentService, isSet } from '../../core/content.service';
import { Catalog } from '../../core/models';
import { injectIsBrowser } from '../../core/platform';
import { SeoService } from '../../core/seo.service';
import { WhatsAppButtonComponent } from '../../shared/whatsapp-button.component';
import { NotFoundComponent } from '../not-found/not-found.component';
import { LightboxComponent } from './lightbox.component';
import { STATIC_TILES, SareeGridComponent, sareeAlt } from './saree-grid.component';

/** Window scroll offsets per category, restored on back/forward navigation. */
const savedScroll = new Map<string, number>();

@Component({
  selector: 'app-category-page',
  imports: [RouterLink, WhatsAppButtonComponent, SareeGridComponent, NotFoundComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './category-page.component.html',
  styleUrl: './category-page.component.scss',
})
export class CategoryPageComponent {
  /** Route param and resolver data (component input binding). */
  readonly slug = input.required<string>();
  readonly catalog = input<Catalog | null>(null);

  protected readonly content = inject(ContentService);
  protected readonly labels = computed(() => this.content.site().pages.category);
  protected readonly category = computed(() => this.content.category(this.slug()));
  protected readonly items = computed(() => this.catalog()?.items ?? []);
  protected readonly description = computed(() => {
    const d = this.category()?.description;
    return isSet(d) ? d : null;
  });
  protected readonly endText = computed(() =>
    this.labels().endText.replace('{count}', String(this.items().length)),
  );

  private readonly overlay = inject(Overlay);
  private readonly location = inject(Location);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly seo = inject(SeoService);
  private readonly isBrowser = injectIsBrowser();
  private readonly chips = viewChild<ElementRef<HTMLElement>>('chips');
  private overlayRef: OverlayRef | null = null;
  private trigger: HTMLElement | null = null;
  private readonly isPopstate = this.router.currentNavigation()?.trigger === 'popstate';

  constructor() {
    effect(() => {
      const cat = this.category();
      const items = this.items();
      if (!cat || !this.catalog()) return;
      untracked(() => this.updateSeo(cat.slug, items));
    });

    // Keep the active category chip in view on the sticky sub-bar.
    effect(() => {
      this.slug();
      const bar = this.chips()?.nativeElement;
      if (!bar || !this.isBrowser) return;
      requestAnimationFrame(() => {
        const active = bar.querySelector<HTMLElement>('[aria-current="page"]');
        if (active) bar.scrollLeft = active.offsetLeft - (bar.clientWidth - active.offsetWidth) / 2;
      });
    });

    afterNextRender(() => {
      const code = this.route.snapshot.queryParamMap.get('saree');
      if (code) {
        const index = this.items().findIndex((i) => i.code === code.toUpperCase());
        if (index >= 0) this.openLightbox(index, null);
      }
    });

    inject(DestroyRef).onDestroy(() => {
      this.closeLightbox(false);
      if (this.isBrowser) savedScroll.set(this.slug(), scrollY);
    });
  }

  /** Called when the virtual grid has rendered: restore scroll on back/forward. */
  protected onGridReady(): void {
    const y = savedScroll.get(this.slug());
    if (this.isPopstate && y) scrollTo({ top: y, behavior: 'instant' });
  }

  protected onOpen(e: { index: number; trigger: HTMLElement }): void {
    this.openLightbox(e.index, e.trigger);
  }

  private openLightbox(index: number, trigger: HTMLElement | null): void {
    const cat = this.category();
    if (!cat || this.overlayRef) return;
    this.trigger = trigger;

    this.overlayRef = this.overlay.create({
      hasBackdrop: true,
      backdropClass: 'lightbox-backdrop',
      panelClass: 'lightbox-pane',
      scrollStrategy: this.overlay.scrollStrategies.block(),
      positionStrategy: this.overlay.position().global().top('0').left('0'),
    });
    const ref = this.overlayRef.attach(new ComponentPortal(LightboxComponent));
    ref.setInput('items', this.items());
    ref.setInput('index', index);
    ref.setInput('categoryTitle', cat.title);
    ref.setInput('labels', this.labels());
    ref.setInput('alt', sareeAlt(cat, this.items()[index].code));
    ref.instance.closed.subscribe(() => this.closeLightbox(true));
    ref.instance.index.subscribe((i) => {
      ref.setInput('alt', sareeAlt(cat, this.items()[i].code));
      this.setSareeParam(this.items()[i].code);
    });
    this.overlayRef.backdropClick().subscribe(() => this.closeLightbox(true));
    this.setSareeParam(this.items()[index].code);
  }

  private closeLightbox(restoreFocus: boolean): void {
    if (!this.overlayRef) return;
    const code = new URLSearchParams(location.search).get('saree');
    this.overlayRef.dispose();
    this.overlayRef = null;
    // On destroy the browser URL may already belong to the next page, so leave it alone.
    if (!restoreFocus) return;
    this.setSareeParam(null);
    // Focus the tile that was opened (or the one for the last viewed design if it is rendered).
    const target =
      (code && document.querySelector<HTMLElement>(`[data-code="${CSS.escape(code)}"]`)) ||
      (this.trigger?.isConnected ? this.trigger : null);
    target?.focus({ preventScroll: true });
  }

  /** Shareable URL without triggering a router navigation (which would scroll the page). */
  private setSareeParam(code: string | null): void {
    const path = this.location.path().split('?')[0];
    this.location.replaceState(path, code ? `saree=${encodeURIComponent(code)}` : '');
  }

  private updateSeo(slug: string, items: Catalog['items']): void {
    const cat = this.category()!;
    const path = `/collections/${slug}`;
    const site = this.content.site();
    const description = isSet(cat.seoDescription)
      ? cat.seoDescription
      : `${cat.title} from ${site.brand.name}, Ilkal. ${items.length} designs. Ask for price and colours on WhatsApp.`;
    this.seo.update({
      title: `${cat.title} | ${site.brand.name} ${site.brand.tagline}`,
      description,
      path,
      image: items[0]?.fallback,
      jsonLd: [
        this.seo.breadcrumb([
          { name: 'Home', path: '/' },
          { name: 'Collections', path: '/collections' },
          { name: cat.title, path },
        ]),
        {
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: cat.title,
          numberOfItems: items.length,
          itemListElement: items.slice(0, STATIC_TILES).map((it, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            url: this.seo.absolute(`${path}?saree=${it.code}`),
            item: {
              '@type': 'ImageObject',
              contentUrl: this.seo.absolute(it.fallback),
              thumbnailUrl: this.seo.absolute(it.thumb),
              name: `${cat.title} ${it.code}`,
              caption: sareeAlt(cat, it.code),
              width: it.w,
              height: it.h,
            },
          })),
        },
      ],
    });
  }
}
