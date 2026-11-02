import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ContentService, isSet } from './content.service';

export interface PageSeo {
  title?: string;
  description?: string;
  /** Path starting with `/`, used for the canonical URL. */
  path: string;
  image?: string;
  jsonLd?: object[];
  noindex?: boolean;
}

/** Per-route title, meta, canonical, Open Graph, Twitter and JSON-LD, built from site.json. */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly doc = inject(DOCUMENT);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly content = inject(ContentService);

  update(page: PageSeo): void {
    const site = this.content.site();
    const base = site.seo.siteUrl.replace(/\/$/, '');
    const title = page.title ?? site.seo.defaultTitle;
    const description = isSet(page.description) ? page.description : site.seo.defaultDescription;
    const url = base + (page.path === '/' ? '/' : page.path.replace(/\/$/, ''));
    const image = base + (page.image ?? site.seo.ogImage);

    this.title.setTitle(title);
    const tags: [string, string, 'name' | 'property'][] = [
      ['description', description, 'name'],
      ['robots', page.noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large', 'name'],
      ['og:type', 'website', 'property'],
      ['og:site_name', `${site.brand.name} ${site.brand.tagline}`, 'property'],
      ['og:locale', 'en_IN', 'property'],
      ['og:title', title, 'property'],
      ['og:description', description, 'property'],
      ['og:url', url, 'property'],
      ['og:image', image, 'property'],
      ['twitter:card', 'summary_large_image', 'name'],
      ['twitter:title', title, 'name'],
      ['twitter:description', description, 'name'],
      ['twitter:image', image, 'name'],
    ];
    for (const [key, value, attr] of tags) this.meta.updateTag({ [attr]: key, content: value });

    let canonical = this.doc.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = this.doc.createElement('link');
      canonical.rel = 'canonical';
      this.doc.head.appendChild(canonical);
    }
    canonical.href = url;

    this.doc.head.querySelectorAll('script[data-seo]').forEach((s) => s.remove());
    for (const data of [this.business(), ...(page.jsonLd ?? [])]) {
      const script = this.doc.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-seo', '');
      script.textContent = JSON.stringify(data);
      this.doc.head.appendChild(script);
    }
  }

  absolute(path: string): string {
    return this.content.site().seo.siteUrl.replace(/\/$/, '') + path;
  }

  breadcrumb(items: { name: string; path: string }[]): object {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((it, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: it.name,
        item: this.absolute(it.path),
      })),
    };
  }

  private business(): object {
    const site = this.content.site();
    const c = site.contact;
    return {
      '@context': 'https://schema.org',
      '@type': 'ClothingStore',
      '@id': this.absolute('/#business'),
      name: `${site.brand.name} ${site.brand.tagline}`,
      url: this.absolute('/'),
      logo: this.absolute(site.brand.logo),
      image: this.absolute(site.seo.ogImage),
      telephone: `+${c.whatsapp}`,
      ...(isSet(c.email) ? { email: c.email } : {}),
      foundingDate: String(site.brand.since),
      priceRange: 'On request',
      address: {
        '@type': 'PostalAddress',
        streetAddress: c.address[0],
        addressLocality: 'Ilkal',
        addressRegion: 'Karnataka',
        postalCode: '587125',
        addressCountry: 'IN',
      },
      geo: { '@type': 'GeoCoordinates', latitude: c.geo.lat, longitude: c.geo.lng },
      hasMap: c.mapsUrl,
      sameAs: Object.values(site.social),
    };
  }
}
