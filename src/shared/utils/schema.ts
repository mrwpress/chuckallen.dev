/* ============================================================
   Schema.org Structured Data Generators
   All return plain objects — serialize with JSON.stringify
   in a <script type="application/ld+json"> tag.
   ============================================================ */

import type { SiteConfig } from './config';

/* ── Private helpers ─────────────────────────────────────── */

function buildAreaServed(site: SiteConfig): Record<string, unknown>[] | undefined {
  if (!site.serviceAreaCities?.length) return undefined;
  return [
    ...site.serviceAreaCities.map((city) => ({ '@type': 'City', name: city })),
    { '@type': 'State', name: 'Colorado' },
    { '@type': 'Country', name: 'US' },
  ];
}

/* ── Service Schema ──────────────────────────────────────── */

export function serviceSchema(options: {
  name: string;
  description: string;
  url: string;
  site: SiteConfig;
  serviceType?: string;
  category?: string;
}): Record<string, unknown> {
  const areaServed = buildAreaServed(options.site);

  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: options.name,
    description: options.description,
    url: options.url,
    ...(options.serviceType && { serviceType: options.serviceType }),
    ...(options.category && { category: options.category }),
    provider: {
      '@type': 'ProfessionalService',
      name: options.site.name,
      url: options.site.url,
    },
    areaServed: areaServed ?? { '@type': 'Country', name: 'US' },
    availableChannel: [
      {
        '@type': 'ServiceChannel',
        serviceUrl: options.url,
        servicePhone: `+1${options.site.phone}`,
        name: 'Website',
      },
      {
        '@type': 'ServiceChannel',
        servicePhone: `+1${options.site.phone}`,
        name: 'Phone',
      },
    ],
    termsOfService: new URL('/terms/', options.site.url).href,
  };
}

/* ── Organization Schema ─────────────────────────────────── */

export function organizationSchema(site: SiteConfig): Record<string, unknown> {
  const logo = site.defaultOgImage.startsWith('http')
    ? site.defaultOgImage
    : new URL(site.defaultOgImage, site.url).href;

  const areaServed = buildAreaServed(site);
  const images = site.images?.map((img) =>
    img.startsWith('http') ? img : new URL(img, site.url).href,
  );

  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: site.name,
    legalName: site.legalName,
    url: site.url,
    logo,
    description: site.defaultDescription,
    email: site.email,
    telephone: `+1${site.phone}`,
    foundingDate: site.foundingDate,
    ...(site.priceRange && { priceRange: site.priceRange }),
    address: {
      '@type': 'PostalAddress',
      ...(site.address.street && { streetAddress: site.address.street }),
      ...(site.address.city && { addressLocality: site.address.city }),
      addressRegion: site.address.region,
      ...(site.address.postalCode && { postalCode: site.address.postalCode }),
      addressCountry: site.address.country,
    },
    ...(site.geo && {
      geo: {
        '@type': 'GeoCoordinates',
        latitude: site.geo.latitude,
        longitude: site.geo.longitude,
      },
    }),
    ...(site.openingHours && {
      openingHoursSpecification: [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: site.openingHours.days,
          opens: site.openingHours.opens,
          closes: site.openingHours.closes,
        },
      ],
    }),
    ...(areaServed && { areaServed }),
    ...(images?.length && { image: images }),
    ...(site.knowsAbout?.length && { knowsAbout: site.knowsAbout }),
    ...(site.contactPoint && {
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: site.contactPoint.telephone,
        contactType: site.contactPoint.contactType,
        ...(site.contactPoint.areaServed && { areaServed: site.contactPoint.areaServed }),
        ...(site.contactPoint.availableLanguage && { availableLanguage: site.contactPoint.availableLanguage }),
      },
    }),
    ...(site.naicsCode && { naics: site.naicsCode }),
    numberOfEmployees: { '@type': 'QuantitativeValue', value: 1 },
    ...(site.sameAs.length > 0 && { sameAs: site.sameAs }),
  };
}

/* ── WebSite Schema ──────────────────────────────────────── */

export function websiteSchema(site: SiteConfig): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: site.name,
    url: site.url,
  };
}

/* ── WebPage Schema ──────────────────────────────────────── */

export function webPageSchema(options: {
  title: string;
  description: string;
  url: string;
  site: SiteConfig;
  ogType?: 'website' | 'article';
  articlePublished?: string;
  articleModified?: string;
  ogImage?: string;
}): Record<string, unknown> {
  const isArticle = options.ogType === 'article';
  const titleClean = options.title.replace(new RegExp(` — ${options.site.name}$`), '');
  const logo = options.site.defaultOgImage.startsWith('http')
    ? options.site.defaultOgImage
    : new URL(options.site.defaultOgImage, options.site.url).href;

  return {
    '@context': 'https://schema.org',
    '@type': isArticle ? 'Article' : 'WebPage',
    name: options.title,
    description: options.description,
    url: options.url,
    ...(isArticle && { headline: titleClean }),
    ...(options.articlePublished && { datePublished: options.articlePublished }),
    ...(options.articleModified && { dateModified: options.articleModified }),
    ...(isArticle && {
      author: {
        '@type': 'Person',
        name: options.site.author,
        url: options.site.url + '/about/',
      },
      ...(options.ogImage && { image: options.ogImage }),
    }),
    isPartOf: { '@id': options.site.url },
    publisher: {
      '@type': 'Organization',
      name: options.site.name,
      url: options.site.url,
      logo: {
        '@type': 'ImageObject',
        url: logo,
      },
    },
  };
}

/* ── ProfilePage Schema ──────────────────────────────────── */

export function profilePageSchema(options: {
  site: SiteConfig;
  personName: string;
  personDescription: string;
  personImage?: string;
  jobTitle?: string;
  dateCreated?: string;
  dateModified?: string;
}): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    ...(options.dateCreated && { dateCreated: options.dateCreated }),
    ...(options.dateModified && { dateModified: options.dateModified }),
    mainEntity: {
      '@type': 'Person',
      name: options.personName,
      description: options.personDescription,
      ...(options.personImage && { image: options.personImage }),
      url: new URL('/about/', options.site.url).href,
      ...(options.jobTitle && { jobTitle: options.jobTitle }),
      ...(options.site.knowsAbout?.length && { knowsAbout: options.site.knowsAbout }),
      ...(options.site.sameAs.length > 0 && { sameAs: options.site.sameAs }),
      worksFor: {
        '@type': 'Organization',
        name: options.site.legalName,
        url: options.site.url,
      },
    },
  };
}

/* ── Breadcrumb Schema ───────────────────────────────────── */

export function breadcrumbSchema(
  pathname: string,
  site: SiteConfig,
  pageTitle?: string,
  isArticle?: boolean,
): Record<string, unknown> | null {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: site.url,
      },
      ...segments.map((segment, i) => {
        const isLast = i === segments.length - 1;
        const path = segments.slice(0, i + 1).join('/') + '/';
        const label = isLast && pageTitle
          ? pageTitle.replace(new RegExp(` — ${site.name}$`), '')
          : segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
        return {
          '@type': 'ListItem',
          position: i + 2,
          name: label,
          item: new URL(path, site.url).href,
        };
      }),
    ],
  };
}
