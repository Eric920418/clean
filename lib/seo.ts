import { siteConfig } from './site-config'

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

/**
 * 共用 entity anchor。所有 schema 透過 @id 引用，形成 entity graph，
 * 幫助 Google Knowledge Graph 把整個網站理解為「同一個商業實體的多面向」。
 */
export const BUSINESS_ID = `${baseUrl}#business`
export const ORG_ID = `${baseUrl}#organization`
export const WEBSITE_ID = `${baseUrl}#website`

/**
 * 社群網址有效性判斷 —— footer 顯示與 SEO sameAs 共用同一份規則。
 * 後台 `fbUrl`/`igUrl` 是業主輸入、會渲染進 `<a href>` 與 JSON-LD，必須當不可信來源處理：
 * 1. 強制 http(s) 協議 —— 擋掉 `javascript:` / `data:` 等會造成 href XSS 的 scheme。
 * 2. 擋掉空值與佔位網址（如 https://facebook.com/ 這種只到網域根、沒指向粉專的值）。
 * 因此業主必須在後台填「完整的 https:// 粉專網址」才會顯示。
 */
export function isValidSocialUrl(u?: string | null): u is string {
  if (!u || u.endsWith('//') || u.endsWith('.com/')) return false
  try {
    const { protocol } = new URL(u)
    return protocol === 'https:' || protocol === 'http:'
  } catch {
    return false
  }
}

type City = string

function cityArray(cities?: City[]): Array<Record<string, unknown>> {
  return (cities ?? siteConfig.contact.serviceCities).map((name) => ({
    '@type': 'City',
    name,
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'TW',
      addressRegion: '台灣',
      addressLocality: name,
    },
  }))
}

export function localBusinessJsonLd(opts?: {
  rating?: { average: number; count: number }
  image?: string
  knowsAbout?: string[]
  cities?: City[]
  sameAs?: Array<string | null | undefined>
}) {
  const cities = cityArray(opts?.cities)
  const sameAs = (opts?.sameAs ?? []).filter(isValidSocialUrl)
  return {
    '@context': 'https://schema.org',
    '@type': 'HomeAndConstructionBusiness',
    '@id': BUSINESS_ID,
    name: siteConfig.brandName,
    alternateName: siteConfig.brandShort,
    description: siteConfig.description,
    slogan: siteConfig.brandTagline,
    url: baseUrl,
    telephone: siteConfig.contact.phone,
    email: siteConfig.contact.email,
    image: opts?.image ?? `${baseUrl}/logo.jpg`,
    priceRange: '$$',
    currenciesAccepted: 'TWD',
    paymentAccepted: '現金、銀行轉帳、LINE Pay',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'TW',
      addressRegion: '台灣',
    },
    areaServed: cities,
    knowsAbout: opts?.knowsAbout ?? [
      '冷氣清洗',
      '洗衣機清洗',
      '水塔清洗',
      '居家深度清潔',
      '裝潢後細清',
      '全戶濾水',
      '防霾紗網',
    ],
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opens: '09:00',
        closes: '19:00',
      },
    ],
    ...(sameAs.length ? { sameAs } : {}),
    ...(opts?.rating && opts.rating.count > 0
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: opts.rating.average.toFixed(1),
            reviewCount: opts.rating.count,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
  }
}

export function organizationJsonLd(opts?: {
  image?: string
  foundingDate?: string
  sameAs?: Array<string | null | undefined>
}) {
  const sameAs = (opts?.sameAs ?? []).filter(isValidSocialUrl)
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': ORG_ID,
    name: siteConfig.brandName,
    alternateName: siteConfig.brandShort,
    url: baseUrl,
    logo: opts?.image ?? `${baseUrl}/logo.jpg`,
    description: siteConfig.description,
    email: siteConfig.contact.email,
    telephone: siteConfig.contact.phone,
    ...(sameAs.length ? { sameAs } : {}),
    ...(opts?.foundingDate ? { foundingDate: opts.foundingDate } : {}),
  }
}

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: baseUrl,
    name: siteConfig.brandName,
    inLanguage: 'zh-TW',
    publisher: { '@id': BUSINESS_ID },
  }
}

export function serviceJsonLd(service: {
  name: string
  shortDesc: string
  slug: string
  heroImage?: string | null
  longDesc?: string | null
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.name,
    description: service.longDesc ?? service.shortDesc,
    url: `${baseUrl}/services/${service.slug}`,
    serviceType: service.name,
    ...(service.heroImage ? { image: service.heroImage } : {}),
    provider: { '@id': BUSINESS_ID },
    areaServed: cityArray(),
    offers: {
      '@type': 'Offer',
      availability: 'https://schema.org/InStock',
      areaServed: cityArray(),
      priceCurrency: 'TWD',
      url: `${baseUrl}/services/${service.slug}`,
    },
  }
}

export function faqPageJsonLd(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.answer,
      },
    })),
  }
}

/**
 * 單一問題頁（/faq/[slug]）用的 QAPage 結構化資料。
 * answer 需傳「純文字」（呼叫端用 stripHtml 攤平），避免把 HTML 塞進 schema text。
 */
export function qaPageJsonLd(faq: { question: string; answer: string; path: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'QAPage',
    mainEntity: {
      '@type': 'Question',
      name: faq.question,
      text: faq.question,
      answerCount: 1,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
        url: `${baseUrl}${faq.path}`,
      },
      url: `${baseUrl}${faq.path}`,
    },
  }
}

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${baseUrl}${item.path}`,
    })),
  }
}

export function reviewListJsonLd(testimonials: Array<{
  author: string
  rating: number
  content: string
  createdAt?: Date | string
}>) {
  if (testimonials.length === 0) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: testimonials.map((t, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Review',
        author: { '@type': 'Person', name: t.author },
        reviewRating: {
          '@type': 'Rating',
          ratingValue: t.rating,
          bestRating: 5,
          worstRating: 1,
        },
        reviewBody: t.content,
        itemReviewed: { '@id': BUSINESS_ID },
        ...(t.createdAt
          ? { datePublished: new Date(t.createdAt).toISOString().slice(0, 10) }
          : {}),
      },
    })),
  }
}

export function itemListJsonLd(items: Array<{ name: string; url: string; description?: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: item.url.startsWith('http') ? item.url : `${baseUrl}${item.url}`,
      name: item.name,
      ...(item.description ? { description: item.description } : {}),
    })),
  }
}

export function imageGalleryJsonLd(pairs: Array<{
  beforeUrl: string
  afterUrl: string
  caption?: string | null
  location?: string | null
  serviceName?: string
}>) {
  if (pairs.length === 0) return null
  const images = pairs.flatMap((p) => {
    const captionPrefix = p.serviceName ? `${p.serviceName} · ` : ''
    const baseCaption = p.caption ?? ''
    const tail = baseCaption ? ` · ${baseCaption}` : ''
    return [
      {
        '@type': 'ImageObject',
        contentUrl: p.beforeUrl,
        caption: `${captionPrefix}服務前${tail}`,
        ...(p.location ? { contentLocation: p.location } : {}),
      },
      {
        '@type': 'ImageObject',
        contentUrl: p.afterUrl,
        caption: `${captionPrefix}服務後${tail}`,
        ...(p.location ? { contentLocation: p.location } : {}),
      },
    ]
  })
  return {
    '@context': 'https://schema.org',
    '@type': 'ImageGallery',
    name: `${siteConfig.brandName} 服務前後對比`,
    description: '實際施作前後對比，所有照片皆為實拍。',
    associatedMedia: images,
    isPartOf: { '@id': BUSINESS_ID },
  }
}

export function aboutPageJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: `關於 ${siteConfig.brandName}`,
    url: `${baseUrl}/about`,
    mainEntity: { '@id': BUSINESS_ID },
  }
}

export function contactPageJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: `預約諮詢 - ${siteConfig.brandName}`,
    url: `${baseUrl}/contact`,
    mainEntity: { '@id': BUSINESS_ID },
  }
}

export { baseUrl }
