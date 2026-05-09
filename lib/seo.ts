import { siteConfig } from './site-config'

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

export function localBusinessJsonLd(opts?: {
  rating?: { average: number; count: number }
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HomeAndConstructionBusiness',
    name: siteConfig.brandName,
    description: siteConfig.description,
    url: baseUrl,
    telephone: siteConfig.contact.phone,
    email: siteConfig.contact.email,
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'TW',
      addressRegion: '台灣',
      addressLocality: siteConfig.contact.serviceArea,
    },
    areaServed: siteConfig.contact.serviceArea,
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
        ],
        opens: '09:00',
        closes: '19:00',
      },
    ],
    sameAs: [siteConfig.social.facebook, siteConfig.social.instagram].filter(Boolean),
    ...(opts?.rating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: opts.rating.average.toFixed(1),
        reviewCount: opts.rating.count,
      },
    }),
  }
}

export function serviceJsonLd(service: {
  name: string
  shortDesc: string
  slug: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.name,
    description: service.shortDesc,
    url: `${baseUrl}/services/${service.slug}`,
    provider: {
      '@type': 'HomeAndConstructionBusiness',
      name: siteConfig.brandName,
      url: baseUrl,
    },
    areaServed: siteConfig.contact.serviceArea,
    serviceType: service.name,
  }
}
