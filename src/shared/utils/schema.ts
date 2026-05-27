/* ============================================================
   Schema.org Structured Data Generators
   All return plain objects — serialize with JSON.stringify
   in a <script type="application/ld+json"> tag.
   ============================================================ */

import type { SiteConfig } from './config';

export function organizationSchema(site: SiteConfig): Record<string, unknown> {
  const logo = site.defaultOgImage.startsWith('http')
    ? site.defaultOgImage
    : new URL(site.defaultOgImage, site.url).href;

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
    ...(site.sameAs.length > 0 && { sameAs: site.sameAs }),
  };
}

export function websiteSchema(site: SiteConfig): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: site.name,
    url: site.url,
  };
}

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
        return {
          '@type': 'ListItem',
          position: i + 2,
          name: isLast && isArticle && pageTitle
            ? pageTitle
            : segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
          item: new URL(path, site.url).href,
        };
      }),
    ],
  };
}
