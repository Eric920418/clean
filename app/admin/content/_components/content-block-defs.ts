// 集中定義所有 ContentBlock 的 fields schema
// 給 ContentAdminPage（顯示分組列表）跟 ContentBlockModal（編輯 fields）共用

export type FieldType = 'text' | 'richtext' | 'image'

// group：用於後台分組顯示；每個 key 對應一個前台頁面
export type BlockGroup = 'home' | 'about' | 'contact' | 'faq' | 'services' | 'works' | 'global'

export type BlockDef = {
  title: string
  description: string
  group: BlockGroup
  fields: { name: string; label: string; type: FieldType; hint?: string; folder?: string }[]
}

export const BLOCK_DEFS: Record<string, BlockDef> = {
  // === 首頁 ===
  'hero-home': {
    title: '首頁 Hero（主視覺）',
    description: '首頁最上方的標題、副標、按鈕文字、4 條 checklist、主視覺圖片',
    group: 'home',
    fields: [
      { name: 'heroImage', label: '主視覺圖片', type: 'image', folder: 'home', hint: '建議 4:5 比例、800×1000px 以上。未填則使用首頁精選對比圖' },
      { name: 'eyebrow', label: 'Eyebrow', type: 'text', hint: '例：Invisible Care · 居家健康守護' },
      { name: 'titleLine1', label: '主標第一行', type: 'text' },
      { name: 'titleLine2', label: '主標第二行（強調色）', type: 'text' },
      { name: 'description', label: '副標說明', type: 'richtext' },
      { name: 'primaryCta', label: '主 CTA 按鈕文字', type: 'text', hint: '例：立即來電預約' },
      { name: 'secondaryCta', label: '副 CTA 按鈕文字', type: 'text', hint: '例：看服務案例' },
      { name: 'checklist1', label: 'Checklist 1', type: 'text' },
      { name: 'checklist2', label: 'Checklist 2', type: 'text' },
      { name: 'checklist3', label: 'Checklist 3', type: 'text' },
      { name: 'checklist4', label: 'Checklist 4', type: 'text' },
    ],
  },
  'section-services-home': {
    title: '首頁・服務項目區塊標題',
    description: 'Our Services 區塊的 eyebrow 與標題',
    group: 'home',
    fields: [
      { name: 'eyebrow', label: 'Eyebrow', type: 'text' },
      { name: 'title', label: '標題', type: 'text' },
      { name: 'description', label: '副標', type: 'richtext' },
    ],
  },
  'section-works-home': {
    title: '首頁・精選作品區塊標題',
    description: 'Real Results 區塊的 eyebrow、標題與「查看全部」按鈕',
    group: 'home',
    fields: [
      { name: 'eyebrow', label: 'Eyebrow', type: 'text' },
      { name: 'title', label: '標題', type: 'text' },
      { name: 'description', label: '副標', type: 'richtext' },
      { name: 'viewAllLabel', label: '「查看全部實績」按鈕文字', type: 'text' },
    ],
  },
  'section-process-home': {
    title: '首頁・服務流程區塊標題',
    description: 'How it works 區塊的 eyebrow 與標題（流程步驟在「服務流程」管理）',
    group: 'home',
    fields: [
      { name: 'eyebrow', label: 'Eyebrow', type: 'text' },
      { name: 'title', label: '標題', type: 'text' },
    ],
  },
  'section-testimonials-home': {
    title: '首頁・客戶評價區塊標題',
    description: 'Customer Voices 區塊的 eyebrow 與標題（評價內容在「客人的好話」管理）',
    group: 'home',
    fields: [
      { name: 'eyebrow', label: 'Eyebrow', type: 'text' },
      { name: 'title', label: '標題', type: 'text' },
    ],
  },
  'cta-home': {
    title: '首頁・底部 CTA banner',
    description: '首頁最底部深色預約 banner',
    group: 'home',
    fields: [
      { name: 'backgroundImage', label: '背景圖', type: 'image', folder: 'home', hint: '深色濾鏡覆蓋（透明度 25%），建議用較亮或彩色的圖才看得出來。留空使用預設廚房照片。' },
      { name: 'overline', label: '上方小標', type: 'text', hint: '例：BOOK YOUR HOME CARE TODAY' },
      { name: 'titleLine1', label: '主標第一行', type: 'text' },
      { name: 'titleLine2', label: '主標第二行', type: 'text' },
      { name: 'description', label: '副標', type: 'richtext' },
      { name: 'primaryCta', label: '按鈕文字', type: 'text' },
      { name: 'lineUrl', label: 'LINE 加好友連結（選填）', type: 'text', hint: '填網址即會自動顯示官方「加入好友」按鈕；留空則不顯示。例：https://lin.ee/sjHybe1' },
    ],
  },
  // === About 頁 ===
  'hero-about': {
    title: '關於我們・Hero',
    description: 'About 頁最上方的標題段',
    group: 'about',
    fields: [
      { name: 'eyebrow', label: 'Eyebrow', type: 'text', hint: '例：About invisible care' },
      { name: 'titleLine1', label: '主標第一行', type: 'text' },
      { name: 'titleLine2', label: '主標第二行（強調色）', type: 'text' },
      { name: 'lead', label: '右側說明文', type: 'richtext' },
    ],
  },
  about: {
    title: '關於我們・故事段',
    description: 'About 頁中段的「Our story」與三段故事',
    group: 'about',
    fields: [
      { name: 'eyebrow', label: 'Eyebrow', type: 'text' },
      { name: 'title', label: '標題', type: 'text' },
      { name: 'paragraph1', label: '段落 1', type: 'richtext' },
      { name: 'paragraph2', label: '段落 2', type: 'richtext' },
      { name: 'paragraph3', label: '段落 3', type: 'richtext' },
      { name: 'image', label: '故事區圖片', type: 'image', folder: 'about' },
    ],
  },
  'cta-about': {
    title: '關於我們・底部 CTA',
    description: 'About 頁底部的呼籲區塊',
    group: 'about',
    fields: [
      { name: 'title', label: '標題', type: 'text' },
      { name: 'description', label: '副標', type: 'richtext' },
      { name: 'primaryCta', label: '按鈕文字', type: 'text' },
    ],
  },
  // === 其他頁面 Hero ===
  'hero-contact': {
    title: '預約諮詢・Hero',
    description: 'Contact 頁最上方標題段',
    group: 'contact',
    fields: [
      { name: 'eyebrow', label: 'Eyebrow', type: 'text' },
      { name: 'title', label: '標題', type: 'text' },
      { name: 'description', label: '副標', type: 'richtext' },
    ],
  },
  'hero-faq': {
    title: '常見問題・Hero 與區塊文字',
    description: 'FAQ 頁的 Hero、「一般服務」標題、底部聯絡卡片文案',
    group: 'faq',
    fields: [
      { name: 'eyebrow', label: 'Eyebrow', type: 'text' },
      { name: 'title', label: 'Hero 標題', type: 'text' },
      { name: 'description', label: 'Hero 副標', type: 'richtext' },
      { name: 'generalHeading', label: '一般服務區塊標題', type: 'text' },
      { name: 'contactBoxText', label: '底部聯絡卡片文字', type: 'text' },
      { name: 'contactBoxButton', label: '底部聯絡按鈕文字', type: 'text' },
    ],
  },
  'hero-services': {
    title: '服務項目列表・Hero',
    description: 'Services 列表頁的標題段',
    group: 'services',
    fields: [
      { name: 'eyebrow', label: 'Eyebrow', type: 'text' },
      { name: 'title', label: '標題', type: 'text' },
      { name: 'description', label: '副標', type: 'richtext' },
    ],
  },
  'hero-works': {
    title: '服務案例・Hero',
    description: 'Works 頁的標題段',
    group: 'works',
    fields: [
      { name: 'eyebrow', label: 'Eyebrow', type: 'text' },
      { name: 'title', label: '標題', type: 'text' },
      { name: 'description', label: '副標', type: 'richtext' },
    ],
  },
  // === 全站導覽（Header / Footer 文字） ===
  navigation: {
    title: '導覽列與 Footer 文字',
    description: '導覽列的 5 個分頁 label、主要按鈕文字、Footer 法律聲明',
    group: 'global',
    fields: [
      { name: 'navServicesLabel', label: '導覽：服務項目', type: 'text' },
      { name: 'navWorksLabel', label: '導覽：服務案例', type: 'text' },
      { name: 'navAboutLabel', label: '導覽：關於我們', type: 'text' },
      { name: 'navFaqLabel', label: '導覽：常見問題', type: 'text' },
      { name: 'navContactLabel', label: '導覽：預約諮詢', type: 'text' },
      { name: 'navPrimaryCtaLabel', label: '導覽列主按鈕文字', type: 'text', hint: '例：立即來電預約' },
      { name: 'footerLegalNote', label: 'Footer 法律聲明', type: 'richtext' },
    ],
  },
}

export const OTHER_GROUPS: { key: BlockGroup; label: string }[] = [
  { key: 'contact', label: '預約諮詢' },
  { key: 'faq', label: '常見問題' },
  { key: 'services', label: '服務列表' },
  { key: 'works', label: '服務案例' },
  { key: 'global', label: '全站導覽 / Footer' },
]
