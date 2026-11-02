import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, firstValueFrom, forkJoin, of, shareReplay } from 'rxjs';
import {
  AboutConfig,
  Catalog,
  CatalogIndexEntry,
  Category,
  HomeConfig,
  NavConfig,
  SiteConfig,
} from './models';

/** True when a JSON value is filled in (not empty and not a `TODO` placeholder). */
export function isSet(value: string | null | undefined): value is string {
  return !!value && !value.trim().toUpperCase().startsWith('TODO');
}

/**
 * Typed access to the JSON files in src/assets/data.
 *
 * Small, site-wide files (site, nav, categories, catalog index) are loaded once at app
 * start and exposed as signals. Page files (home, about, catalog/<slug>) are loaded by
 * route resolvers. Angular's HTTP transfer cache carries every response from the
 * prerendered HTML to the browser, so nothing is fetched twice on first load.
 */
@Injectable({ providedIn: 'root' })
export class ContentService {
  private readonly http = inject(HttpClient);
  private readonly cache = new Map<string, Observable<unknown>>();

  private readonly _site = signal<SiteConfig | null>(null);
  private readonly _nav = signal<NavConfig | null>(null);
  private readonly _categories = signal<Category[]>([]);
  private readonly _index = signal<CatalogIndexEntry[]>([]);

  /** Always defined after app init. */
  readonly site = computed(() => this._site() as SiteConfig);
  readonly nav = computed(() => this._nav() as NavConfig);
  readonly categories = this._categories.asReadonly();
  readonly catalogIndex = this._index.asReadonly();

  readonly categoryCards = computed(() => {
    const index = new Map(this._index().map((e) => [e.slug, e]));
    return this._categories().map((c) => ({ ...c, entry: index.get(c.slug) }));
  });

  async init(): Promise<void> {
    const res = await firstValueFrom(
      forkJoin({
        site: this.get<SiteConfig>('site.json'),
        nav: this.get<NavConfig>('nav.json'),
        categories: this.get<Category[]>('categories.json'),
        index: this.get<CatalogIndexEntry[]>('catalog/index.json'),
      }),
    );
    this._site.set(res.site);
    this._nav.set(res.nav);
    this._categories.set(res.categories);
    this._index.set(res.index);
  }

  category(slug: string): Category | undefined {
    return this._categories().find((c) => c.slug === slug);
  }

  indexEntry(slug: string): CatalogIndexEntry | undefined {
    return this._index().find((c) => c.slug === slug);
  }

  home$(): Observable<HomeConfig> {
    return this.get<HomeConfig>('home.json');
  }

  about$(): Observable<AboutConfig> {
    return this.get<AboutConfig>('about.json');
  }

  catalog$(slug: string): Observable<Catalog | null> {
    if (!this.category(slug)) return of(null);
    return this.get<Catalog>(`catalog/${slug}.json`).pipe(catchError(() => of(null)));
  }

  private get<T>(file: string): Observable<T> {
    let req = this.cache.get(file);
    if (!req) {
      req = this.http.get<T>(`/assets/data/${file}`).pipe(shareReplay({ bufferSize: 1, refCount: false }));
      this.cache.set(file, req);
    }
    return req as Observable<T>;
  }
}
