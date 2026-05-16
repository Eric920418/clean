'use client'

import dynamic from 'next/dynamic'

/**
 * dynamic wrapper：CKEditor 在 SSR 會炸（read window/document），必須 ssr: false。
 * Admin 頁面 import 這個 loader、不直接 import RichTextEditor。
 */
export const RichTextEditor = dynamic(
  () => import('./rich-text-editor').then((m) => m.RichTextEditor),
  {
    ssr: false,
    loading: () => (
      <div className="h-60 rounded-md border border-hairline bg-bg-soft animate-pulse" />
    ),
  },
)
