import type { Metadata } from 'next'
import {
  getSiteSettings,
  getWhyUsSections,
  getAllContentBlocks,
  getActivePageSections,
} from '@/lib/queries'
import { AboutSections } from '../_components/about-sections'
import { JsonLd } from '@/components/json-ld'
import { aboutPageJsonLd, breadcrumbJsonLd } from '@/lib/seo'

export const metadata: Metadata = {
  title: '關於我們',
  description:
    'invisible care 是一群對「居家純淨度」有著偏執追求的職人。我們是「居家健康空間的修復師」，服務全台主要城市。',
  alternates: { canonical: '/about' },
}

// CMS 內容隨時可由業主在後台修改，每 60 秒重新生成
export const revalidate = 60

export default async function AboutPage() {
  const [settings, beliefSections, blocks, sections] = await Promise.all([
    getSiteSettings(),
    getWhyUsSections({ location: 'about' }),
    getAllContentBlocks(),
    getActivePageSections('about'),
  ])
  const phoneTel = settings.phoneTel || ''
  const lineFriendUrl = settings.lineFriendUrl || ''
  const lineCallUrl = settings.lineCallUrl || ''

  const breadcrumb = breadcrumbJsonLd([
    { name: '首頁', path: '/' },
    { name: '關於我們', path: '/about' },
  ])

  return (
    <>
      <JsonLd data={breadcrumb} />
      <JsonLd data={aboutPageJsonLd()} />
      <AboutSections
        sections={sections}
        blocks={blocks}
        beliefSections={beliefSections}
        phoneTel={phoneTel}
        lineFriendUrl={lineFriendUrl}
        lineCallUrl={lineCallUrl}
      />
    </>
  )
}
