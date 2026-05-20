import { redirect } from 'next/navigation'

/**
 * 「為何選我們」管理已合併到 /admin/content（2026-05-18）。
 * 此頁面僅保留 URL 給舊書籤導向，實際編輯走 /admin/content 內的首頁/關於我們區塊管理 → ✏️。
 */
export default function WhyUsSectionsRedirect() {
  redirect('/admin/content')
}
