export type Fabric = 'silk' | 'silk-cotton' | 'cotton' | 'viscose-cotton' | 'khun';
export type Loom = 'handloom' | 'powerloom' | 'fabric';

export interface SiteConfig {
  brand: { name: string; tagline: string; since: number; monogram: string; logo: string };
  contact: {
    whatsapp: string;
    phoneDisplay: string;
    email: string;
    address: string[];
    mapsUrl: string;
    mapsEmbed: string;
    geo: { lat: number; lng: number };
    gstn: string;
    hours: string;
  };
  social: { instagram: string; facebook: string; youtube: string; justdial: string };
  announcement: string[];
  pages: {
    collections: {
      title: string;
      description: string;
      eyebrow: string;
      heading: string;
      lead: string;
      fabricLabel: string;
      loomLabel: string;
      fabrics: { value: string; label: string }[];
      looms: { value: string; label: string }[];
      empty: string;
    };
    visit: { title: string; description: string; hoursLabel: string; hoursFallback: string };
    notFound: { title: string; eyebrow: string; heading: string; text: string; button: string };
    category: {
      breadcrumbHome: string;
      breadcrumbCollections: string;
      askCollection: string;
      askPrice: string;
      lightboxAsk: string;
      share: string;
      copied: string;
      endText: string;
      endCta: string;
    };
  };
  footer: { about: string; floatingLabel: string };
  whatsappTemplates: { general: string; category: string; item: string };
  seo: { siteUrl: string; defaultTitle: string; defaultDescription: string; ogImage: string };
}

export interface Category {
  slug: string;
  code: string;
  folder: string;
  title: string;
  shortTitle: string;
  fabric: Fabric;
  loom: Loom;
  badge: string;
  spec: string;
  description: string;
  seoDescription: string;
  cover: string;
  featured: boolean;
  excludeFiles: string[];
}

export interface CatalogItem {
  code: string;
  w: number;
  h: number;
  thumb: string;
  full: string;
  fallback: string;
  blur: string;
}

export interface Catalog {
  slug: string;
  count: number;
  items: CatalogItem[];
}

export interface CatalogIndexEntry {
  slug: string;
  count: number;
  cover: string;
  coverBlur: string;
}

export interface NavLink {
  label: string;
  route?: string;
  fragment?: string;
  href?: string;
}

export interface NavConfig {
  header: NavLink[];
  footer: { collections: NavLink[]; help: NavLink[] };
}

export interface SiteImageRef {
  id: string;
  alt: string;
  width: number;
  height: number;
  caption?: string;
}

export interface AboutConfig {
  seo: { title: string; description: string };
  hero: { eyebrow: string; heading: string; lead: string };
  founder: { eyebrow: string; heading: string; image: SiteImageRef; paragraphs: string[] };
  sections: { id: string; eyebrow: string; heading: string; paragraphs: string[]; image?: SiteImageRef }[];
  cta: { heading: string; text: string; button: string };
}

export interface HomeConfig {
  hero: {
    eyebrow: string;
    heading: string;
    subheading: string;
    primaryCta: string;
    secondaryCta: { label: string; route: string };
    trust: string[];
    badge: { value: string; label: string };
    collage: { main: SiteImageRef; top: SiteImageRef; bottom: SiteImageRef };
  };
  press: { label: string; items: { name: string; image: string; width: number; height: number }[] };
  howToOrder: {
    eyebrow: string;
    heading: string;
    lead: string;
    cta: string;
    steps: { title: string; text: string }[];
  };
  collections: {
    eyebrow: string;
    heading: string;
    lead: string;
    viewAll: string;
    filterLabel: string;
    filters: { value: string; label: string }[];
  };
  story: {
    eyebrow: string;
    heading: string;
    paragraphs: string[];
    image: SiteImageRef;
    stats: { value: string; label: string }[];
    primaryCta: { label: string; route: string };
    secondaryCta: { label: string; route: string };
  };
  why: { eyebrow: string; heading: string; features: { icon: string; title: string; text: string }[] };
  reviews: {
    eyebrow: string;
    heading: string;
    lead: string;
    cta: { label: string; href: string };
    items: { name: string; place: string; source: string; text: string }[];
  };
  visit: { eyebrow: string; heading: string; text: string; cardTitle: string; directions: string; showMap: string };
  finalCta: { eyebrow: string; heading: string; text: string; button: string };
}
