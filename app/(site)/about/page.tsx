import type { Metadata } from 'next'
import {
  getSiteSettings,
  getWhyUsSections,
  getAllContentBlocks,
  getActivePageSections,
} from '@/lib/queries'
import { AboutSections } from '../_components/about-sections'

export const metadata: Metadata = {
  title: '關於我們',
  description:
    'invisible care 是一群對「居家純淨度」有著偏執追求的職人。我們是「居家健康空間的修復師」。',
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

  return (
    <AboutSections
      sections={sections}
      blocks={blocks}
      beliefSections={beliefSections}
      phoneTel={phoneTel}
    />
  )
}
