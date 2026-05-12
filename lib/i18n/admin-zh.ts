// 後台中文措辭字典 — 老人友善版
// 將英文 enum / 技術術語映射為長者一看就懂的口語中文
// 改字只需動這一檔

import type { AdminInquiry } from '@/lib/admin-types'

// === 導覽列名稱（口語化） ===
export const NAV_LABELS = {
  dashboard: '首頁',
  services: '我們的服務',
  inquiries: '客人問問題',
  testimonials: '客人的好話',
  whyUs: '為何選我們',
  content: '首頁文字',
  settings: '設定',
  advanced: '進階',
  logout: '登出',
  more: '更多',
} as const

// === 詢問單狀態（含 emoji 圖示，提升辨識度） ===
export const INQUIRY_STATUS = {
  NEW: { label: '新的', emoji: '🔴', tone: 'warn' },
  CONTACTED: { label: '已聯絡', emoji: '🟡', tone: 'accent' },
  QUOTED: { label: '已報價', emoji: '🔵', tone: 'primary' },
  DONE: { label: '完成', emoji: '🟢', tone: 'success' },
  CLOSED: { label: '結案', emoji: '⚫', tone: 'neutral' },
} as const satisfies Record<
  AdminInquiry['status'],
  { label: string; emoji: string; tone: string }
>

export const INQUIRY_STATUS_ORDER: AdminInquiry['status'][] = [
  'NEW',
  'CONTACTED',
  'QUOTED',
  'DONE',
  'CLOSED',
]

// === 動作按鈕（口語化） ===
export const ACTIONS = {
  save: '儲存',
  cancel: '不要了',
  delete: '刪掉',
  confirmDelete: '確定刪掉',
  confirm: '確定',
  edit: '修改',
  add: '新增',
  upload: '上傳',
  back: '回上一頁',
  callPhone: '打電話',
  changeStatus: '改狀態',
  viewAll: '看全部',
  more: '看更多',
} as const

// === 模組名稱與功能描述（給標題、空狀態用） ===
export const MODULES = {
  inquiries: {
    title: '客人問問題',
    description: '客人從網站留下的聯絡資料和需求',
    emptyText: '還沒有客人問問題',
  },
  services: {
    title: '我們的服務',
    description: '網站上展示的清潔服務項目',
    emptyText: '還沒有服務',
  },
  beforeAfters: {
    title: '清潔前後照片',
    description: '一張清潔前 + 一張清潔後，會出現在前台對比區',
    emptyText: '還沒有清潔前後照片',
  },
  testimonials: {
    title: '客人的好話',
    description: '客人給的評價，會顯示在首頁',
    emptyText: '還沒有客人好話',
  },
  content: {
    title: '首頁文字',
    description: '修改首頁上的標題、介紹文字',
    emptyText: '沒有可編輯內容',
  },
  settings: {
    title: '設定',
    description: '電話、Line、社群連結等基本資料',
    emptyText: '',
  },
} as const

// === 危險動作的確認文字（口語化警告） ===
export const CONFIRM_MESSAGES = {
  deleteBeforeAfter: {
    title: '確定要刪掉這組照片嗎？',
    body: '刪掉之後就找不回來了，清潔前和清潔後兩張都會一起刪掉。',
  },
  deleteTestimonial: {
    title: '確定要刪掉這則好話嗎？',
    body: '刪掉之後就找不回來了。',
  },
  deleteService: {
    title: '確定要刪掉這個服務嗎？',
    body: '這個服務底下的照片、好話也會一起刪掉，找不回來。',
  },
  closeInquiry: {
    title: '確定要結案嗎？',
    body: '結案後不會再提醒你回覆這位客人。',
  },
} as const

// === 字級語意名稱（避免在元件中寫 text-xs） ===
// 對應 globals.css 中的 friendly-text-* 類別
export const TEXT_SIZE = {
  caption: 'text-base', // 原本是 text-xs / text-sm，老人版改為 16px 起跳
  body: 'text-base', // 16px
  emphasis: 'text-lg', // 18px
  title: 'text-xl', // 20px
} as const
