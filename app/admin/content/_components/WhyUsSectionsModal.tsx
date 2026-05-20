'use client'

import { AdminModal } from '@/components/admin/admin-modal'
import { WhyUsSectionsEditor } from './WhyUsSectionsEditor'

type Props = {
  open: boolean
  /** null 表示關閉；給 'home' / 'about' 才開啟並 render 對應 location 的 editor */
  location: 'home' | 'about' | null
  onClose: () => void
}

const TITLE_BY_LOCATION = {
  home: '為何選我們（首頁）',
  about: '品牌信念（關於我們）',
} as const

/**
 * 包裝 WhyUsSectionsEditor 成 modal — 從 PageSectionsManager 對固定 section
 * `why_us` / `beliefs` 點編輯時開啟，取代原本跳轉 /admin/why-us-sections 的行為。
 *
 * 內部 editor 的「新增/編輯單筆」會再開一層 AdminModal — modal-in-modal 視覺上靠
 * z-index 自然 stack（兩層 z-50，後 mount 在上層）。
 */
export function WhyUsSectionsModal({ open, location, onClose }: Props) {
  if (!open || !location) return null
  return (
    <AdminModal
      open={open}
      onClose={onClose}
      size="xl"
      title={TITLE_BY_LOCATION[location]}
      description="每組固定三張卡片；可多組、可排序，分別顯示為多個區塊"
    >
      <WhyUsSectionsEditor key={location} location={location} />
    </AdminModal>
  )
}
