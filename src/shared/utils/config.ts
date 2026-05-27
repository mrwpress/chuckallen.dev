/* ============================================================
   Shared Site Configuration Type
   Each site creates a single config object conforming to this
   interface. One file, one source of truth.
   ============================================================ */

export interface NavItem {
  label: string;
  href: string;
}

export interface SocialLink {
  label: string;
  href: string;
  icon: string;
}

export interface SiteConfig {
  // ── Identity ──
  name: string;
  legalName: string;
  url: string;
  locale: string;
  author: string;
  foundingDate: string;

  // ── SEO Defaults ──
  defaultTitle: string;
  defaultDescription: string;
  defaultOgImage: string;
  twitterHandle?: string;

  // ── NAP (Name, Address, Phone) ──
  email: string;
  phone: string;
  phoneFormatted: string;
  address: {
    street?: string;
    city?: string;
    region: string;
    postalCode?: string;
    country: string;
  };

  // ── Business ──
  careerStartYear?: number;
  priceRange?: string;
  calendly?: string;
  timezone?: string;

  // ── Third-Party Keys (public/client-side only) ──
  gtmId?: string;
  turnstileSiteKey?: string;

  // ── Navigation ──
  navItems: NavItem[];
  legalLinks: NavItem[];
  socialLinks: SocialLink[];
  sameAs: string[];
}

export function yearsExperience(site: SiteConfig): number {
  return new Date().getFullYear() - (site.careerStartYear ?? 2008);
}
