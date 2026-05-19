# invisible care · 居家健康守護 CMS

> 看不見的守護，才是家最頂級的豪華。
>
> 整合防霾紗網、全戶濾水、水塔清洗、冷氣與洗衣機深度拆洗、精緻居家清潔六大專業服務，由內而外為您守護家的純淨與健康。

本專案是 invisible care 的官網與內容管理系統（CMS）。本 README 是專案唯一的事實來源，所有環境變數、開發指令、部署流程、資料模型說明都在這份文件裡。

---

## 目前狀態

| 項目 | 狀態 |
|---|---|
| 前台 7 頁（首頁 / 服務 / 服務詳情 / 作品集 / 關於 / 預約 / FAQ） | ✅ 已串接 Prisma |
| Before/After 並排對比元件（Server Component 外殼 + Lightbox 放大） | ✅ 已完成 |
| 前台圖片點擊放大（整頁 gallery：對比圖 / 服務 Intro / Gallery，支援手機 swipe & pinch zoom） | ✅ 已完成 |
| 服務 slug 完全自動產生（業主只填中文 name，系統 pinyin 化 + 撞名 `-2 / -3`） | ✅ 已完成 |
| Section CMS — Phase 2 C1：schema + 資料 migration（schema 新增、子表向下相容） | ✅ 已完成 |
| Section CMS — Phase 2 C2：後台 sections 管理頁（重排、開關、新增、刪除） | ✅ 已完成 |
| Section CMS — Phase 2 C3a：前台動態渲染（C2 重排/開關終於對客戶生效）| ✅ 已完成 |
| Section CMS — Phase 2 C3b：簡單 type 編輯 modal（hero / intro / cta / text_block）| ✅ 已完成 |
| Section CMS — Phase 2 C3c：列表 type section-scoped 子頁（features / faq / gallery / before_after）| ✅ 已完成 |
| Section CMS — Phase 2 C4a：移除所有 fallback、邏輯切換到 section（schema 保留）| ✅ 已完成 |
| Section CMS — Phase 2 C4b：物理 drop 12 個冗餘欄位、schema 清理完畢 | ✅ 已完成 |
| 設計系統（純淨醫療感配色） | ✅ 已完成 |
| Prisma schema + seed.ts | ✅ 已完成 |
| 預約諮詢表單（前端 → 公開 API → DB） | ✅ 已完成 |
| sitemap.xml / robots.txt / generateMetadata | ✅ 已完成 |
| LocalBusiness + Service JSON-LD（SEO 結構化資料） | ✅ 已完成 |
| **後台 CMS**（11 頁完整管理介面） | ✅ 已完成 |
| NextAuth 登入 + middleware 保護 + R2 圖片上傳 | ✅ 已完成 |
| 業主可自助操作：服務 CRUD / 對比圖 / 詢問單 / 評價 / 內容 / 設定 | ✅ 已完成 |
| **後台老人友善 UI/UX**（mobile-first、底部 tab、字級 16px+、口語化措辭） | ✅ 已完成 |

下一步：使用者填入 `.env`（DB / R2 / NEXTAUTH_SECRET），跑 `pnpm db:push && pnpm db:seed`，即可啟用整套後台。

---

## 技術棧

| 類別 | 套件 / 服務 |
|---|---|
| Framework | Next.js 15.5（App Router）+ React 18 |
| ORM / DB | Prisma 7 + PostgreSQL（Neon） |
| DB Driver | `@neondatabase/serverless` + `@prisma/adapter-neon`（WebSocket，serverless 場景） |
| 認證 | NextAuth 4 + Credentials + bcryptjs |
| UI | Tailwind CSS 4（CSS-first config）+ Radix UI primitives |
| 圖床 | Cloudflare R2（S3 SDK） |
| Lightbox | `yet-another-react-lightbox`（dynamic import，僅用戶點圖才載入） |
| 觀測 | Vercel Analytics + Speed Insights（部署後自動收 Web Vitals） |
| 通知 | Sonner toast |
| 套件管理 | **pnpm（強制）** |
| 字體 | Noto Sans TC + Inter（next/font/google） |

---

## 後台路由速覽（Admin CMS）

| 路由 | 用途 |
|---|---|
| `/admin/login` | 登入頁（首次用 `.env` 中的 ADMIN_USERNAME/PASSWORD，自動 bcrypt 寫入 DB） |
| `/admin/dashboard` | 首頁：QuickActions 兩個大按鈕 + 4 張統計卡 + 最近 5 筆詢問 |
| `/admin/services` | 服務列表（新增 modal、排序、上下架、刪除、進入詳細編輯） |
| `/admin/services/[id]/sections` | ⭐ 服務唯一編輯入口：主欄位（名稱 / slug / 描述 / 卡片圖 / SEO / 上下架）+ 頁面區塊管理（Hero / Intro / 重點說明 / 對比圖 / 圖庫 / FAQ / CTA / 推薦服務 / 文字塊） |
| `/admin/services/[id]/sections/[sectionId]/items` | 列表型區塊（特色清單、FAQ、對比圖、相簿）的內容管理子頁 |
| `/admin/inquiries` | 客人問問題列表（手機卡片、桌機表格、狀態 chip 篩選） |
| `/admin/inquiries/[id]` | 詢問單詳情（狀態切換） |
| `/admin/testimonials` | 客人的好話 CRUD |
| `/admin/why-us-sections` | ⭐ 首頁「為何選我們」+ 關於頁「三項職人信仰」多區塊 CRUD（依 location 區分） |
| `/admin/process-steps` | ⭐ 首頁「服務流程」步驟 CRUD（標準 4 步，可增減） |
| `/admin/general-faqs` | ⭐ `/faq` 頁「一般問題」CRUD（非特定服務的常見問題） |
| `/admin/content` | ⭐ 頁面內容：上方「首頁附加區塊（動態）」+「關於我們附加區塊（動態）」可新增/排序/隱藏/刪除（4 種 type）；下方 14 個固定欄位 ContentBlock 依所屬頁面分組折疊（首頁 / 關於我們 / 預約諮詢 / 常見問題 / 服務列表 / 服務案例 / 全站導覽） |
| `/admin/settings` | 站台設定（進階） |
| `/admin/more` | 手機版「更多」入口（評價 + 進階摺疊區 + 登出） |

整個 `/admin/*` 由 `middleware.ts` 保護，未登入會自動導向 `/admin/login`。

### 後台 UI 設計準則（老人友善）

實際使用者為 55-65 歲老闆，主力裝置是手機。設計遵守以下硬底線：

| 規則 | 數值 | 落實位置 |
|---|---|---|
| 最小字級 | **16px**（`text-base`） | `app/globals.css` `.admin-friendly` 容器自動覆蓋 `text-xs/text-sm` |
| 主要按鈕高度 | **48px** | `.btn-primary` / `.btn-ghost` `min-height` |
| 次要按鈕觸控目標 | **44px** | shared components `style={{ minHeight: 44 }}` |
| 表單 input 高度 | **48px** | `.admin-friendly input` |
| Error 訊息 | **紅底白字卡片 + ⚠ 圖示** | `components/admin/form-field.tsx` `Field` |
| 危險動作 | **二次確認 modal**（取消在左主視覺、確認在右紅色） | `components/admin/confirm-dialog.tsx` + `useConfirm` hook |
| 中文措辭 | **口語化字典**（「詢問單」→「客人問題」、enum 加 emoji） | `lib/i18n/admin-zh.ts` 單一來源 |
| 導覽 | **手機底部 4 tab + 桌機 sidebar**（永遠顯示文字標籤、不再純 icon） | `components/admin/mobile-tab-bar.tsx`、`sidebar.tsx` |
| Mobile-first | 卡片版面取代密集表格、`tel:` 直接撥號、`env(safe-area-inset-bottom)` 避讓 home indicator | `app/admin/inquiries/page.tsx` 等 |

**修改任何後台文字／enum 顯示，請從 `lib/i18n/admin-zh.ts` 改起，不要散落在各頁面。**

#### 手機版 Spacing 慣例（避免擁擠／爆版）

375px iPhone 上外層 padding 會與卡片 padding 疊加吃掉內容寬度。後台統一以下規則：

| 元素 | Mobile | Tablet (`sm:`) | Desktop (`md:`) |
|---|---|---|---|
| 外層 layout (`AdminContent`) | `px-3 py-4` | `p-6` | `p-8` |
| 卡片／section | `p-4` | `p-5` | `p-6` |
| AdminModal 內容區 | `p-4` | `p-5` | `p-6` |
| AdminModal header | `px-4 py-3` | `px-5 py-4` | `px-6` |
| Sticky bottom action bar 的 `-mx`/`px`/`-mb` | `-4` | `-5` | `-6` |
| 底部 tab bar | 高 **64px**、`text-xs`、icon `h-5 w-5`、`whitespace-nowrap` |

新增頁面卡片 className 一律使用 `p-4 sm:p-5 md:p-6`，請勿單獨寫死 `p-5` 或 `p-6`。

## API 路由

```
# 公開
POST   /api/auth/[...nextauth]              認證
POST   /api/inquiries                       前台預約諮詢提交（公開）

# 受保護（需要 admin session）
POST   /api/admin/upload                    R2 圖片上傳（client 4 MB / server 5 MB；上限受 Vercel 4.5 MB serverless payload 硬上限）

GET    /api/admin/services                  服務列表（亦供前台使用）
POST   /api/admin/services
GET/PUT/DELETE  /api/admin/services/[id]
GET/POST        /api/admin/services/[id]/features
PUT/DELETE      /api/admin/services/[id]/features/[fid]
GET/POST        /api/admin/services/[id]/faqs
PUT/DELETE      /api/admin/services/[id]/faqs/[fid]
GET/POST        /api/admin/services/[id]/before-afters
PUT/DELETE      /api/admin/services/[id]/before-afters/[bid]
GET/POST/PATCH/DELETE   /api/admin/services/[id]/gallery

GET    /api/admin/inquiries                 詢問單列表（支援 status / isRead 過濾）
GET/PUT/DELETE  /api/admin/inquiries/[id]

GET/POST        /api/admin/testimonials
PUT/DELETE      /api/admin/testimonials/[id]

GET/POST        /api/admin/why-us-sections        首頁/關於頁 WhyUs 多區塊（支援 ?location=home|about）
PUT/DELETE      /api/admin/why-us-sections/[id]
GET/POST        /api/admin/process-steps          首頁服務流程
PUT/DELETE      /api/admin/process-steps/[id]
GET/POST        /api/admin/general-faqs           /faq 一般問題
PUT/DELETE      /api/admin/general-faqs/[id]

GET             /api/admin/content
GET/PUT         /api/admin/content/[key]

GET/POST        /api/admin/page-sections          頁面動態附加區塊（GET 需帶 ?page=home|about）
PUT/DELETE      /api/admin/page-sections/[id]     更新 order / isVisible / config；刪除自動清 R2 圖

GET/PUT         /api/admin/settings         一次拿 / 存所有 key/value
```

所有受保護 API 都用 `lib/api-auth.ts` 的 `checkAdminAuth()` 驗證；未登入回 401。

## 目錄結構

```
clean/
├── app/
│   ├── layout.tsx                  根布局（字體、Toaster、Nav、Footer）
│   ├── page.tsx                    首頁（Hero + 六大服務 + 三大堅持 + 作品牆 + 流程 + 評價 + CTA）
│   ├── services/
│   │   ├── page.tsx                六大服務列表
│   │   └── [slug]/page.tsx         服務詳情（含 generateStaticParams）
│   ├── works/page.tsx              服務案例（前後對比集合 + 分類篩選）
│   ├── about/page.tsx              關於我們
│   ├── contact/page.tsx            預約諮詢
│   ├── faq/page.tsx                常見問題
│   ├── sitemap.ts                  動態 sitemap.xml
│   ├── robots.ts                   robots.txt（封鎖 /admin 與 /api）
│   ├── icon.jpg                    favicon（App Router 慣例自動產生 <link rel="icon">）
│   └── globals.css                 設計系統 CSS（純淨醫療感）
│
├── components/
│   ├── before-after-pair.tsx      🎯 並排對比元件（左 Before / 右 After，Server Component 外殼）
│   ├── lightbox-provider.tsx       🆕 全頁圖片相簿 Provider（yet-another-react-lightbox）
│   ├── lightbox-image.tsx          🆕 點擊放大版 next/image（自動串入 Provider gallery）
│   ├── site-nav.tsx                Sticky 上方導航
│   ├── site-footer.tsx             頁尾
│   ├── section-heading.tsx         章節標題（eyebrow + title + desc）
│   ├── icon-by-name.tsx            Lucide icon 名稱映射
│   ├── faq.tsx                     Radix Accordion FAQ
│   ├── works-gallery.tsx           作品集篩選 grid
│   └── contact-form.tsx            預約表單（react state + Sonner）
│
├── lib/
│   ├── prisma.ts                   Prisma singleton client
│   ├── utils.ts                    cn() class helper
│   ├── site-config.ts              品牌靜態資訊（電話、Line、三大堅持、流程、合作平台、App 連結）
│   └── mock-data.ts                Mock 資料（嚴格對應 Prisma model 形狀）
│
├── prisma/
│   └── schema.prisma               資料模型
│
├── .env.example                    環境變數範本
├── package.json                    pnpm.onlyBuiltDependencies 已宣告 prisma/sharp
├── next.config.ts                  next/image remote patterns（Unsplash + R2）
├── prisma.config.ts                Prisma datasource 從 .env 讀取
└── postcss.config.mjs              Tailwind 4 postcss
```

---

## 環境變數

複製 `.env.example` 為 `.env`，填入下列變數：

```bash
# Database — 必須與 drink 專案使用「不同」的 Neon 資料庫
# 重要：URL 必須使用 Neon Pooler endpoint（含 -pooler 字樣），serverless driver 才會走 PgBouncer
# 範例：postgresql://user:pwd@ep-xxx-pooler.ap-southeast-1.aws.neon.tech/db?sslmode=require
DATABASE_URL="postgresql://user:password@host-pooler/db?sslmode=require"

# NextAuth
NEXTAUTH_SECRET=""                # openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3100"

# 預設管理員（首次啟動會自動建立並 bcrypt hash）
ADMIN_USERNAME="admin"
ADMIN_PASSWORD=""                  # 自設強密碼

# Cloudflare R2 — 必須與 drink 專案使用「不同」的 bucket
R2_ENDPOINT="https://<account-id>.r2.cloudflarestorage.com"
R2_BUCKET_NAME="invisible-care"
R2_ACCESS_KEY_ID=""
R2_SECRET_ACCESS_KEY=""
R2_PUBLIC_URL="https://pub-xxxxx.r2.dev"

# 公開設定（SEO / sitemap / OG 用）
NEXT_PUBLIC_SITE_URL="http://localhost:3100"
NEXT_PUBLIC_BRAND_NAME="invisible care"
```

> ⚠️ **DB 與 R2 bucket 一定要與其他專案隔離**，否則 admin 帳密與圖片會互相覆蓋。

---

## 開發指令

```bash
pnpm install              # 安裝依賴（postinstall 會跑 prisma generate）
pnpm dev                  # 啟動開發伺服器（預設 :3000，本機已被佔用時用 --port 3100）
pnpm build                # 建置（會先跑 prisma generate）
pnpm start                # 啟動正式版伺服器

pnpm db:push              # 將 schema 推到資料庫（開發階段使用，避免 --accept-data-loss）
pnpm db:seed              # 跑 prisma/seed.ts（待建立）
pnpm db:studio            # 開啟 Prisma Studio
```

`pnpm dev --port 3100` 範例：本機若已有其他開發伺服器佔用 3000，可用此參數。

---

## 設計系統（純淨醫療感）

| Token | 值 | 用途 |
|---|---|---|
| `--bg-base` | `#FFFFFF` | 主背景 |
| `--bg-soft` | `#F8FAFC` | 次要背景 / Section 分區 |
| `--bg-tint` | `#ECFDF5` | 主題色背景（emerald-50） |
| `--primary` | `#10B981` | 主 CTA、強調（emerald-500） |
| `--primary-deep` | `#059669` | hover 與深色文字（emerald-600） |
| `--accent` | `#0EA5E9` | 輔助強調（sky-500） |
| `--ink` | `#0F172A` | 主標題（slate-900） |
| `--ink-soft` | `#475569` | 內文（slate-600） |
| `--ink-muted` | `#94A3B8` | 提示文字（slate-400） |
| `--hairline` | `#E2E8F0` | 線條 / 分隔（slate-200） |

**字體**：中文 `Noto Sans TC`（300/400/500/700）、英文 `Inter`（400/500/600/700）。

**圓角**：主要採 `rounded-xl`（0.75rem），按鈕 `rounded-md`，大區塊 `rounded-2xl`。

**互動**：卡片 hover `translate-y-[-2px]` + `shadow-md` 過渡 200ms。

`globals.css` 提供以下 utility class：
- `.section` — 上下 6rem / md:8rem padding
- `.container-narrow` — max-w 1200px + 1.5rem padding
- `.btn-primary` / `.btn-ghost` — 主 / 次 CTA
- `.eyebrow` — 章節小標籤（含左側細線）
- `.bg-medical-glow` — Hero 漸層藥水暈染背景
- `.card-hover` — 卡片浮起動效

---

## 資料模型重點（差異於 drink 專案）

```prisma
model Service {
  id           Int     @id @default(autoincrement())
  slug         String  @unique          // SEO 友善 URL；新增時由系統自動拼音化（lib/slug.ts），業主只填 name
  name         String
  shortDesc    String                   // 卡片摘要（80 字內）
  longDesc     String                   // 詳情頁長文
  icon         String?                  // Lucide icon 名稱
  heroImage    String?
  cardImage    String?
  order        Int     @default(0)
  isActive     Boolean @default(true)
  isFeatured   Boolean @default(false)
  seoTitle     String?
  seoDesc      String?

  features     ServiceFeature[]
  faqs         ServiceFaq[]
  beforeAfters BeforeAfterPair[]        // 🎯 核心：drink 沒有的對比配對
  galleryImgs  ServiceGalleryImage[]
}

model BeforeAfterPair {                 // 🎯 核心
  beforeUrl  String
  afterUrl   String
  caption    String?
  location   String?                    // 例：「台北市信義區」
  takenAt    DateTime?
  isFeatured Boolean                    // 首頁作品牆主推
}

model ServiceGalleryImage {              // 施作過程相簿（gallery type）
  url       String
  alt       String?                     // SEO / 無障礙用
  caption   String?                     // 顯示在照片下方的說明文字（2026-05-16 新增）
  order     Int
}

model BookingInquiry {                   // 取代 ContactMessage
  lineId     String?                    // 客戶 LINE ID（新表單必填，舊資料為 null）
  serviceIds Int[]                      // legacy：舊表單服務多選，保留以避免歷史資料遺失
  status     InquiryStatus              // NEW / CONTACTED / QUOTED / DONE / CLOSED
}
// 2026-05-15：contact 表單從 serviceIds 改為 lineId（新表單不再寫入此欄）
// 2026-05-16：schema 把 serviceIds 加回（型別與 DB 同步），避免 db push 觸發 data loss

model WhyUsSection {                     // 首頁/關於頁 WhyUs 多區塊
  location    String                    // "home" 首頁、"about" 關於頁
  eyebrow     String?
  title       String                    // 例：「三項堅持，讓家人安心」
  description String?
  cards       Json                      // 固定 3 張：[{title, desc}, {title, desc}, {title, desc}]
  order       Int                       // 上下排序（lib/admin-reorder swapOrderByIndex）
}

model ProcessStep {                      // 首頁「服務流程」四步驟
  step  String                          // 顯示用編號，例如 "01"
  title String
  desc  String
  order Int
}

model GeneralFaq {                       // /faq 頁一般問題（非特定服務）
  question String
  answer   String
  order    Int
}

model PageSection {                      // 動態附加區塊（後台 /admin/content）
  page      String                       // "home" 首頁、"about" 關於我們
  type      String                       // text_block / cta_banner / image_text / rich_content
  order     Int                          // 同 page 內順序
  isVisible Boolean
  config    Json                         // 依 type 不同存不同欄位
  // 渲染位置：home → Testimonials 後 / CtaBanner 前
  //         about → Belief sections 後 / CTA 前
  // @@index([page, order])
}
```

完整 schema 見 `prisma/schema.prisma`。

### 六大服務 slug 對照

| 中文名 | slug |
|---|---|
| 防霾紗網更換與維修 | `anti-haze-screen` |
| 全戶大胖過濾系統 | `whole-house-filter` |
| 水塔清洗與養護 | `water-tank-cleaning` |
| 冷氣機深度清洗 | `aircon-cleaning` |
| 洗衣機拆解清潔 | `washer-deep-clean` |
| 精緻居家清潔 | `home-cleaning` |

---

## 路由

### 公開頁面

| 路由 | 說明 |
|---|---|
| `/` | 首頁 |
| `/services` | 六大服務列表 |
| `/services/[slug]` | 單一服務詳情（generateStaticParams） |
| `/works` | 服務案例（全部對比圖 + 分類篩選） |
| `/about` | 關於我們 |
| `/contact` | 預約諮詢 |
| `/faq` | 常見問題 |
| `/sitemap.xml` | 動態 sitemap |
| `/robots.txt` | 封鎖 /admin 與 /api |

### 後台路由（待建）

| 路由 | 說明 |
|---|---|
| `/admin/login` | 登入 |
| `/admin/dashboard` | 儀表板 |
| `/admin/services` | 服務 CRUD |
| `/admin/services/[id]/sections` | ⭐ 服務唯一編輯入口（主欄位 + 區塊管理；對比圖／圖庫由內部區塊承接） |
| `/admin/inquiries` | 詢問單列表（NEW → CONTACTED → QUOTED → DONE） |
| `/admin/content` | 首頁區塊內容（ContentBlock） |
| `/admin/settings` | 站台設定 |

---

## Before/After 對比元件

`components/before-after-pair.tsx` 採傳統並排式（甲方指定）：

- **桌面**：左 Before、右 After，兩張圖等寬並排，各自帶清楚標籤
- **手機**：自動上下堆疊（CSS grid `grid-cols-1 md:grid-cols-2`）
- **外殼是 Server Component**：BeforeAfterPair 本身不含 client state，只是把每張圖交給 `LightboxImage`（Client）處理點擊放大
- **效能**：`next/image` + 鎖定 aspect-ratio 避免 CLS，預設 `4/3`
- **微互動**：hover 時兩張圖一同放大 2%（`group-hover:scale-[1.02]`），保留品味但不喧賓奪主
- **點擊放大**：每張圖都可點開全螢幕檢視（見下方 Lightbox 段落）
- **語意**：Before 標籤用 `bg-ink/80`（深色），After 用 `bg-primary/95`（emerald），形成色彩對比
- **配置**：作品牆統一單欄 `max-w-4xl mx-auto`，每組 pair 滿版顯示，視覺反差最大化

使用範例：

```tsx
<BeforeAfterPair
  beforeUrl={pair.beforeUrl}
  afterUrl={pair.afterUrl}
  caption="使用 8 年未深度清洗的冷氣風輪"
  location="台北市信義區"
  aspect="photo"        // photo (4/3) | video (16/9) | square (1/1)
  priority              // 首屏首組加上
/>
```

**首頁 Hero 例外**：Hero 不放 pair（避免縮成迷你尺寸）。改用單張「清洗後實況」大圖搭配 `aspect-[4/5]` 海報感框；對比展示交給下方「親眼見證的反差」區塊滿版呈現。

---

## 前台圖片放大（Lightbox）

採用 [`yet-another-react-lightbox`](https://yet-another-react-lightbox.com/) v3 + 自家 Provider 架構，**整頁所有圖片自動串成一個相簿**：點任一張就能用左右翻頁、滑動手勢、pinch zoom 看完同頁所有圖。

### 架構

```
app/(site)/layout.tsx
└─ <LightboxProvider>                ← 全站包一次，掛 yet-another-react-lightbox
    └─ <main>{children}</main>
       └─ ... <LightboxImage> ...    ← 各處圖片用這個包，自動 register 進 Provider
```

| 檔案 | 職責 |
|---|---|
| `components/lightbox-provider.tsx` | Client Component。提供 `register / open` API、渲染 `<Lightbox>`、依 DOM 順序排序 slides |
| `components/lightbox-image.tsx` | `next/image` 包裝。掛載時 register 自己，點擊呼叫 `open(id)` |

### 使用方式

對外 props 鏡像 `next/image`，任何要可點擊放大的圖換成 `<LightboxImage>` 即可：

```tsx
<LightboxImage
  src={url}
  alt="清洗前 · 冷氣風輪"
  fill
  sizes="(min-width: 768px) 50vw, 100vw"
  className="object-cover"
  unoptimized        // R2 直連圖必傳
  caption="清洗前 · 冷氣風輪"
/>
```

### 套用範圍

| 位置 | 元件 | 狀態 |
|---|---|---|
| 對比圖（首頁 / 服務詳情 / works 頁） | `BeforeAfterPair` 內部 | ✅ 自動套用 |
| 服務詳情頁 Intro 故事圖 | `app/(site)/services/[slug]/page.tsx` | ✅ 已套用 |
| 服務詳情頁 Gallery 縮圖 | 同上 | ✅ 已套用 |
| 服務詳情頁 Hero 半透明背景圖 | — | ❌ 跳過（裝飾用，放大會破壞遮罩設計）|
| 首頁 Hero / CTA Banner 背景 | — | ❌ 跳過（同上） |

### 互動規格

- **整頁 gallery**：同一頁所有 `<LightboxImage>` 自動串成一個相簿，依 DOM 順序排序（`compareDocumentPosition`）
- **翻頁**：左右箭頭按鈕、鍵盤 ←/→、**手機 swipe**、`carousel.finite = true` 到最後一張就停（不無限循環）
- **縮放**：滾輪 + pinch zoom（Zoom plugin），最大 4 倍像素比
- **caption**：顯示在底部置中，Captions plugin（隱藏 toggle 按鈕）
- **關閉**：ESC / 點黑色背景 / 右上角 X / **手機下拉手勢（`closeOnPullDown`）**
- **z-index 9999**：蓋過 SiteNav (z-50) 與 FloatingCta (z-40)
- **手機友善徽章**：每張縮圖右下角有半透明黑底 + 白色 maximize 圖示，明確暗示可點（彌補手機無 hover 的問題）
- **a11y**：用 `<button>` 包圖，aria-label 為「放大檢視：{alt}」；YARL 內建 focus trap、ARIA roles
- **Next/Image 整合**：放大版用 `render.slide` 自訂渲染為 `<NextImage fill object-contain>`，R2 圖透過 `unoptimized` 直連

---

## Service Section CMS（Phase 2，進行中）

業主可在後台動態加 section、控制顯示順序、同類型加多個。Phase 2 拆 4 個 commit 漸進交付。

### C1（已完成）— schema + migration，純新增、向下相容

新增 `ServiceSection` model，每個 service 預設 8 個 section（依 `hero / intro / why_with_features / before_after / gallery / faq / cta / more_services` 順序）。`ServiceFeature / ServiceFaq / BeforeAfterPair / ServiceGalleryImage` 各加 nullable `sectionId`，舊 `serviceId` 保留 — 既有功能完全不受影響。

執行記錄：

```bash
pnpm db:push                                        # 純新增、無 data-loss
pnpm exec tsx prisma/section-cms-c1-migrate.ts      # 為現有資料填 sections
pnpm exec tsx prisma/section-cms-c1-verify.ts       # 驗證每 service 8 個 section + 子表無孤兒
```

當前資料狀態：8 services × 8 sections = 64 sections，所有 features/faqs/beforeAfters/galleryImgs 都有 sectionId。

### C2（已完成）— 後台 sections 管理頁

新增頁面 `/admin/services/[id]/sections`：
- 列出該 service 全部 sections（依 order）
- **上下移**：呼叫 `lib/admin-reorder.ts` 的 `swapOrderByIndex`（按 sorted index 重算 order，不依賴 order 唯一性）
- **隱藏 / 顯示**：toggle `isVisible`
- **新增**：modal 顯示 9 種 type 卡片（hero / intro / why_with_features / before_after / gallery / faq / cta / more_services / text_block），點一下即建立空 section
- **刪除**：confirm dialog，安全閥防止刪到最後一個（須留至少一個）
- **編輯內容**：留到 C3（圖片、FAQ、特色 bullet 等子表編輯）

API：

| 動作 | Endpoint |
|---|---|
| GET 列表（依 order）| `/api/admin/services/[id]/sections` |
| POST 新增 | 同上 |
| PUT 更新（order swap / isVisible toggle / config）| `/api/admin/services/[id]/sections/[sectionId]` |
| DELETE 刪除 | 同上（最後一個會拒絕） |

> C2 完全不動前台、不動子表 API、不動舊資料 — 完全 backwards-compatible。

### C3a（已完成）— 前台動態渲染

`app/(site)/services/[slug]/page.tsx` 從 270 行硬編碼 JSX 改成 30 行動態渲染：

```tsx
const visibleSections = service.sections
  .filter((s) => s.isVisible)
  .sort((a, b) => a.order - b.order)

return visibleSections.map((section) => (
  <SectionRenderer section={section} service={service} others={others} phoneTel={phoneTel} />
))
```

9 個 Server Component 拆到 `components/service-sections/`：
- `HeroSection` / `IntroSection` / `WhyWithFeaturesSection` / `BeforeAfterSection` /
  `GallerySection` / `FaqSection` / `CtaSection` / `MoreServicesSection` / `TextBlockSection`
- 各自從 `section.config` 讀自訂內容，fallback 到 Service 主表舊欄位（C4 才會 drop 舊欄位）

`lib/queries.ts` 的 `getServiceBySlugFull` 改成 `include: { sections: { include: { features, faqs, beforeAfters, galleryImgs } } }`，子表透過 section 取（C1 migration 已填好 sectionId）。

**業主感受到的改變**：在 C2 sections 管理頁的「隱藏 / 重排」現在會在 60 秒（ISR revalidate）內反映在前台。

**視覺零回歸驗證**：aircon-cleaning（8 sections）/ anti-haze-screen（6 sections）/ home-cleaning（7 sections）/ water-tank-cleaning（6 sections）全部跟 migration 前一致。

### C3b（已完成）— 簡單 type 編輯 modal

`components/admin/section-config-modal.tsx` 提供 generic 編輯 modal，根據 section.type 渲染對應 form 欄位：

| Type | 可編輯欄位 |
|---|---|
| `hero` | heroImage（覆寫 service.heroImage）、eyebrow、title、description、ctaText |
| `intro` | eyebrow、title、image、body（單一富文本，可分多段）。**舊資料相容**：未重存的 section 仍讀 `paragraph1/2/3`；後台第一次開 modal 會自動把舊三段串接到 `body` 當初值，按存檔後舊欄位被一併清除 |
| `why_with_features` | eyebrow、title（主文沿用 service.longDesc） |
| `cta` | title、description |
| `text_block` | eyebrow、title、body |

業主在 sections 管理頁點某行的 ✏️ → 開 modal → 改完按儲存 → PUT `/api/admin/services/[id]/sections/[sectionId]` body `{config: {...}}` → 前台 60 秒 ISR 後反映。**空欄位儲存為 `null`**，前台 fallback 到 service 主表舊欄位（C4 之前的過渡）。

> 點複雜 type（before_after / gallery / faq / more_services）的 ✏️ 會顯示 toast 提示「請走舊路徑管理該 service 全部 X — section-scoped 內容管理在 C3c 上線」。

**Textarea 換行保留**：sections modal 與子頁中所有 `<textarea>` 欄位（hero/intro/cta description、cta description、before_after description、text_block body、why_with_features longDesc、`Service.shortDesc`）後台輸入的 `\n` 都會在前台以實際換行渲染。（FAQ answer 已改為 RichTextEditor，走 HTML 渲染路徑，不在此清單內。）實作方式：對應的渲染容器加 `whitespace-pre-line` Tailwind class（純 CSS，無 markdown / `<br/>` / XSS 風險）。共用元件 `components/section-heading.tsx` 的 description 已套用，所以任何透過 `SectionHeading` 顯示副標的 section 自動支援。`Service.shortDesc` 顯示在四處：首頁服務卡片（`app/(site)/page.tsx`）、服務列表卡片（`app/(site)/services/page.tsx`）、服務詳情頁 Hero（`HeroSection.tsx`）、其他服務區塊（`MoreServicesSection.tsx`），四處皆套用換行支援；唯獨 SEO meta description（`generateMetadata` 與 `lib/seo.ts`）使用原始字串，因 meta 不渲染換行。例外：`before_after` 的 `caption` 後台是單行 `<input>` 不支援。

**服務主欄位編輯入口統一**：原 `/admin/services` 列表的 Sparkles modal（編輯 11 個主欄位：name / shortDesc / longDesc / icon / order / cardImage / heroImage / seoTitle / seoDesc / isActive / isFeatured）已合併進 `/admin/services/[id]/edit` 的 `MainFieldsPanel`，列表只保留 Pencil 一個編輯入口，避免「同一個服務有兩個編輯入口」的認知負擔。列表頁的 `AdminModal` 縮編為 create-only（新增服務），編輯走獨立頁面。後端 API 零變動（`PUT /api/admin/services/[id]` 既有 schema 已支援）。

**Hero 背景圖：唯一入口在 sections > Hero modal**：因為 `HeroSection.tsx` 的 fallback 順序是 `section.config.heroImage ?? service.heroImage`（section 層級優先），如果使用者在 MainFieldsPanel 改 service.heroImage，會被 hero section 的 config 覆蓋而看不到變化。**修法**：MainFieldsPanel 移除 heroImage 欄位（PUT body 也不送，原 Service.heroImage 不動，仍當 fallback），改為指向「頁面區塊管理 → Hero 區塊」的提示卡。新增服務的 create modal **仍保留** heroImage 欄位作為「初始 fallback」用（新建 service 尚無 sections，這時 Service.heroImage 是唯一管道；之後若使用者在 sections 設了 Hero config.heroImage，那邊優先）。`cardImage` 因屬於列表卡片用、與 section 無關，繼續留在 MainFieldsPanel。

**FeaturesPanel / FaqsPanel 補 sectionId（修 400 Bad Request）**：C4b 後 `ServiceFeature.sectionId` 與 `ServiceFaq.sectionId` 必填，API `POST /api/admin/services/[id]/features|faqs` 強制驗證。但 `/admin/services/[id]/edit` 的兩個 panel 是 C4b 前的舊 UI，POST body 缺 `sectionId` 必然回 400。**修法**：兩個 panel 加 `sectionId: number | null` prop，由父層 edit page 從 `service.sections` 自動找對應型別（`why_with_features` 給 features，`faq` 給 faqs）；POST body 帶上 sectionId。**若該型 section 不存在**，panel 不顯示輸入框，改顯示「請先到頁面區塊管理新增此區塊」的提示，連結到 sections 頁。同時 `AdminService` 型別加 `sections?: AdminServiceSection[]`（GET API 一直有回，只是型別沒宣告）。

**`FeaturesPanel` 已從 edit 頁移除（去除重複入口）**：服務特色與 sections 子頁的 `FeaturesEditor` 編輯同一張 `ServiceFeature` 表、同一個 `why_with_features` section，重複入口造成認知負擔。**修法**：`/admin/services/[id]/edit` 完全移除 `FeaturesPanel` 與 `FeatureRow` 函式、相關 `AdminServiceFeature` import 與 `Trash2` icon import；服務特色一律走「頁面區塊管理 → why_with_features 區塊 → items 子頁」編輯。後端 API（`/features` CRUD routes、sectionId 必填邏輯）零變動。

**`FaqsPanel` 也從 edit 頁移除（同步去除重複入口）**：與 FeaturesPanel 同樣理由——`/admin/services/[id]/edit` 的 `FaqsPanel` 與 sections 子頁的 `FaqsEditor` 編輯同一張 `ServiceFaq` 表、同一個 `faq` section。**修法**：edit 頁完全移除 `FaqsPanel` / `FaqRow` 函式、相關 `AdminServiceFaq` / `RichText` / `RichTextEditor` / `MessageSquare` / `Plus` import；FAQ 一律走「頁面區塊管理 → faq 區塊 → items 子頁」編輯。同時 sections 子頁的 `FaqsEditor` 答案欄位從 `<textarea>` 升級為 `RichTextEditor`（CKEditor），display 從純文字 `<p whitespace-pre-line>` 改為 `<RichText>`（與前台 `components/faq.tsx` 一致），並加提示告知「可貼入 LINE 加好友按鈕等 HTML 片段（`<a href="..."><img ...></a>`），前台會自動 sanitize 後渲染為可點擊圖片」。FAQ answer 不再走 textarea 換行保留邏輯，而是走富文本 HTML 渲染路徑（`lib/sanitize-html.ts` 白名單允許 `a[href,target,rel]` + `img[src,alt,height,width]`，`border="0"` 等 HTML4 屬性會被砍掉但視覺無差）。

**`RichTextEditor` 加上 `HtmlEmbed` plugin（解業主貼 LINE 按鈕程式碼角括號被 escape 的問題）**：CKEditor 5 對「貼純 HTML 文字」與「貼 HTML 內容」是兩條不同的 paste pipeline——從 LINE 後台/文件複製出來的 `<a href...><img...></a>` 是純文字 clipboard，CKEditor 看到 `<` `>` 會跳脫成 `&lt;` `&gt;`，業主看到的就是一坨原始碼。**修法**：`components/admin/rich-text-editor.tsx` import `HtmlEmbed` from `ckeditor5`，加進 plugins list 與 toolbar `htmlEmbed` 按鈕（位置在 `link` 與 `insertImage` 之間，業主插連結附近就看得到）；config 設 `htmlEmbed.showPreviews = true` 讓編輯器內 inline 預覽渲染後的樣子；`sanitizeHtml` callback 回傳 `{ html, hasChanged: false }` 純為消除 console warning，預覽的 sanitize 不持久化、真正 XSS 防線靠 `lib/sanitize-html.ts`（API 寫入 + 前台 render 雙保險）。**輸出格式**：CKEditor 把 htmlEmbed 內容存為 `<div class="raw-html-embed">YOUR_HTML</div>`，sanitize-html 預設 allowedTags 含 `div`，`class` 透過 `'*': ['class', 'style']` 放行，內層 `<a><img></a>` 各自走原本的白名單，圓桌一圈都通。**FaqsEditor 提示文字同步更新**告知業主「直接貼到編輯區會被當純文字、要點 toolbar 的『嵌入 HTML』按鈕」。

**`RichTextEditor` 修補 `closeAllDropdowns` 誤關 toolbar dropdown 的回頭路（fix `insertTable` 網格選擇器一閃就消失）**：原本為了攔 CKEditor 5 v44 的「點 editable 自動 open 第一個 dropdown」bug，`handleEditorReady` 在 editor wrapper element 上掛 mousedown listener，RAF + setTimeout(50) 後把 toolbar 內所有 isOpen dropdown 強制關掉。但這個 listener 沒區分 mousedown target——點 toolbar 上的 dropdown 按鈕也會觸發。普通 dropdown（heading / fontSize / link）是 click 才 open，晚於 50ms 那次 close，所以沒事；但 `insertTable` 的網格選擇器（row/col grid picker）為了讓使用者立刻拖拉選格子，**在 mousedown 階段就 open**，剛 open 完就被 RAF callback 關掉、表格叫不出來。**修法**：mousedown handler 加 `target.closest('.ck-toolbar')` 判斷，target 在 toolbar 區內就 return、不關 dropdown；只有點 editable area 才走原本的 close 邏輯。CKEditor 5 toolbar wrapper 用 `.ck-toolbar` class、editable 用 `.ck-editor__editable`，兩者互斥。production console log 從 `[RichTextEditor v12]` 升到 `[RichTextEditor v13]` 作部署驗證標記。

**Service detail page 加 `safeDecodeSlug` 防禦性 decode（fix 中文 slug 在 production 404）**：把 service 改成中文 slug（如 `防霾紗網安裝`）後，production 訪問 `/services/%E9%98%B2...` 卻 404；本機 dev server 正常、且本機跑 `prisma.service.findUnique({ where: { slug: '防霾紗網安裝' } })` 直接命中該筆。**診斷**：用 `mcp__claude_ai_Vercel__get_runtime_logs` 確認 production 真的 404、`x-vercel-cache: MISS` 排除 cache 問題；用本機 prisma 比對 DB 拿到的 slug codepoints 是 `U+9632 U+973e U+7d17 U+7db2 U+5b89 U+88dd`、跟 URL decode 結果完全一致、NFC/NFD normalize 都不變、findUnique 命中——所以資料層沒問題。**判定**：Vercel Edge proxy → Node Lambda 過程中 `params.slug` 沒被自動 decode、頁面拿到字面字串 `%E9%98%B2...`、用這串去查 DB 當然 miss → `notFound()` → 404。Dev server 因為走另一條 path resolve 路徑、自動 decode。**修法**：`app/(site)/services/[slug]/page.tsx` 加 `safeDecodeSlug()` helper（try/catch 包 `decodeURIComponent`），`generateMetadata` 跟 default export 兩處都過一次再傳給 `getServiceBySlugFull()`。`decodeURIComponent` 對純 ASCII / 已 decode 的中文字串是 idempotent、套上零副作用；對 malformed `%xx` 序列 throw、catch 後 fallback 回原字串。後端 Prisma query 跟 DB 一字未動。

**Service slug 中文化 + edit 頁開放手動編輯**：原本 `lib/slug.ts` 走 `pinyin-pro` 把中文服務名轉拼音 kebab-case（「冷氣清洗」→ `leng-qi-qing-xi`），業主覺得拼音版 URL 像亂碼、希望中文化。技術上 Next.js dynamic route `[slug]` 原生吃 Unicode、瀏覽器地址欄顯示可讀中文、Google 中文索引正常處理；trade-off 是複製貼到 Email / log 時會 percent-encode。**修法**：(1) `lib/slug.ts` slugify 改為「保留 CJK Han + ASCII alnum、空白轉 hyphen、其他符號剝掉、轉小寫、截 60 字」（用 `\p{Script=Han}` Unicode property escape），不再經 pinyin-pro。(2) `app/api/admin/services/[id]/route.ts` PUT 加 `body.slug` 處理：跑 `slugify()` normalize → 跟舊 slug 不同才走 unique 檢查 → 寫 DB。同時 catch Prisma P2002 unique constraint 兜底。**Slug 變動 revalidate**：除了 `revalidateService(serviceId)`（讀新 slug 重生新路徑），額外呼叫 `revalidatePath('/services/${oldSlug}')` 讓舊路徑也標 stale；否則 ISR cache 還會 serve 舊 URL、業主以為改不掉。(3) `app/admin/services/[id]/edit/page.tsx` MainFieldsPanel 加 slug 編輯 input（移除原本只讀的 `<span>slug: ...</span>` header display），下方放紅字警告「改網址 = 改對外 URL，舊連結會 404、Google 排名可能掉」——業主自行承擔風險。**既有 8 筆 services 維持原拼音 slug 不動**（沒有自動 migration，業主手動進 edit 頁逐一改才會變中文），保留外部已分享連結的相容性。**沒做的事**：(a) 沒加 `slugAliases` 欄位 + middleware 301 redirect 配套——業主接受「改完舊連結就斷」、不要工程複雜度；如未來客戶反映需要 SEO 保護再做。(b) create flow 沒加 slug 預覽 UI——POST 自動 slugify(name)、業主想看會被生成什麼可以先 create 完進 edit 頁看。

**`sanitize-html` 加上 `allowedStyles` 白名單（fix 字體顏色 / 背景 / 字體大小 / alignment 等套用後存檔消失）**：原本 `lib/sanitize-html.ts` 雖然在 `allowedAttributes` 放行了 `'*': ['class', 'style']`，但 sanitize-html 的設計是「放行 `style` 屬性 key 只是第一步、屬性內的 CSS property 必須另外用 `allowedStyles` 個別 regex 放行；不設 = 全部清掉」。實際路徑：CKEditor 套字體顏色 → `<span style="color:#e91e63">` → API 過 sanitize → `style` 屬性內所有 CSS property 被清空 → DB 存 `<span>red</span>`（沒顏色）→ 業主看到顏色消失。**修法**：在 `sanitizeRichText` config 加 `allowedStyles: { '*': {...} }`，每個 CSS property 配 `/^[^<>;]+$/` regex（CKEditor 是受信任輸出源、不必對 hex / rgb / 單位個別寫 regex，只擋掉 HTML 注入字元跟 CSS 分隔符即可）。涵蓋 property：color / background-color / background / font-family / font-size / font-weight / font-style / text-align / text-decoration / line-height / width / height / border (+border-top/right/bottom/left/color/style/width/radius/collapse) / padding (+四向) / margin (+四向) / vertical-align / text-indent / letter-spacing / text-transform / float / display。一次補齊所有 CKEditor 5 plugin 的 inline style 輸出（fontColor / fontBackgroundColor / fontSize / fontFamily / Alignment / ImageResize / Table*）。**XSS 驗證跑過**：`onclick="alert(1)"` 屬性被砍、`<span style="background:url(javascript:alert(1))">` 整個 style 被砍（sanitize-html 內建 url + javascript: 防護額外把關）。**重要副作用**：在此修補前已存進 DB 的富文本若帶 inline style、那些 style 已經被清掉、無法復原，業主需要重新編輯既有內容才能套回顏色 / 對齊等樣式。

**`FaqsEditor` 加上上移 / 下移按鈕（業主要求 FAQ 順序可調）**：sections 子頁的 `/admin/services/[id]/sections/[sectionId]/items` 在 FAQ 區塊本來只有編輯 / 刪除、沒辦法調順序，業主要在「常見問題 · 內容管理」頁手動排。**修法**：`components/admin/section-editors/FaqsEditor.tsx` import `ArrowUp` / `ArrowDown` + `swapOrderByIndex` / `nextOrder`（`@/lib/admin-reorder` 既有 helper），加 `move(id, dir)` 函式呼叫 `swapOrderByIndex` 走 `/api/admin/services/[id]/faqs/[fid]` PUT，`onChange()` 觸發父層重抓 section、UI 更新。FaqRow 加 `onMove` / `index` / `total` props，在編輯 / 刪除按鈕前插上下移按鈕（boundary 用 `disabled` + `opacity-30`）。同時把新增 FAQ 的 `order` 從 `faqs.length` 改成 `nextOrder(faqs)`（`max(order)+1`）避免「reorder 後再新增會 order 碰撞」的 latent bug。後端 `/api/admin/services/[id]/faqs/[fid]` PUT 既有支援 `order` 欄位、且每次寫入都會 `revalidateService(serviceId)`，所以前台 60s ISR 視窗內看得到新順序。**為什麼只動 FAQ、其他 section editor (Features/Gallery/BeforeAfter) 不一起動**：業主只反映 FAQ 需要、其他暫時沒抱怨；未來業主有需求再用同套 pattern 複製過去。

**`/admin/process-steps` 描述欄位升級為 RichTextEditor**：原本是純 `<textarea>` 存純文字 desc，業主反映想用粗體 / 列表 / 超連結 / 嵌入 LINE 按鈕等富文本。**修法**：(1) admin 頁 `app/admin/process-steps/page.tsx` import `RichTextEditor` + `RichText`，modal 內 desc 欄位 textarea → RichTextEditor，列表卡片內 `<p>{it.desc}</p>` → `<RichText html={it.desc} />`，移除不再用的 `textareaClass` import；(2) API `app/api/admin/process-steps/route.ts` + `[id]/route.ts` import `sanitizeRichText` + `revalidatePath`，POST/PUT 用 `sanitizeRichText(desc)` 取代原本的 `desc.trim()` 驗證（CKEditor 空狀態如 `<p></p>` / `<p><br></p>` trim 後仍非空、要 sanitize 才會回 null），DB 寫入後 `revalidatePath('/')`（這 API 原本沒 revalidate 是 latent bug，業主編完要等 60s ISR 才看到首頁變化，順手補）；(3) 前台 `app/(site)/page.tsx` Process 元件內 `<p>{p.desc}</p>` → `<RichText html={p.desc} className="... prose-sm" />`。**既有 DB 資料相容**：原本存的純文字無 HTML 標籤，過 sanitize-html 與 RichText 後就是純文字渲染、視覺無差；新存的會是 CKEditor 輸出的 `<p>...</p>` 包起來的富文本，`prose-sm` 自動套上 typography。

**`RichTextEditor` 進一步修補 `clearStaleSelectionAttrs` 過度激進（fix `字體大小 / 字體類型 / 字體顏色 / 背景顏色` dropdown 套用後沒效果）**：v12 為了解 v44 「focus editable 時自動把 toolbar 第一個 button 對應的 attribute 加到 selection 上」這個 bug，在 focus 後把 selection 上**所有** attribute 都清掉。但這把 user 主動從 fontSize / fontFamily / fontColor / fontBackgroundColor / highlight / italic / underline / strikethrough 等 dropdown 套用的合法 attribute 也一起殺掉——典型情境是「游標放空白處 → 點字體大小 20 → 打字卻沒變大」，因為「點 dropdown 選 20」會讓 editable 失焦再 refocus，refocus 時 selection 上的 fontSize=20 被一起清掉。**修法**：v44 bug 只在「toolbar 第一個 button 對應的 attribute」上發作，現在第一個是 `bold`，所以只清 `bold` 就夠了；其他 attribute 全部保留。`clearStaleSelectionAttrs` 從「`getAttributeKeys()` 迴圈刪所有」改為「`writer.removeSelectionAttribute('bold')` 單一刪」。**Tradeoff**：「游標空白處點 bold → 打字」這個流程會失敗（bold 在 focus 回來時被清掉），但業主習慣是「先選字再 bold」，可接受。如果未來 toolbar 第一個 button 換掉，這裡要同步調整（程式內已留 TODO 註解）。Production console log 從 `[RichTextEditor v13]` 升到 `[RichTextEditor v14]`。

**首頁 Hero 主視覺圖片可在 `/admin/content` 直接編輯**：`hero-home` ContentBlock 新增 `heroImage` 欄位（image type、folder 'home'）。前台 `app/(site)/page.tsx` Hero 元件改用 `hero.heroImage || featured?.afterUrl` 雙來源邏輯 —— 業主有填就用 ContentBlock 的圖、未填則保留原本「精選對比圖第 0 筆」fallback。alt 對應：用 ContentBlock 圖時固定 "首頁主視覺"，用 featured fallback 時用 `featured.caption`。同時補完 `/api/admin/content/[key]` PUT 的 ISR revalidate（先前漏寫，業主存 content block 要等 60 秒）：DB upsert 後 revalidate `/`、`/about`、`/contact`、`/faq`、`/services`、`/works`。

**MainFieldsPanel 隱藏 `icon` / `order` 欄位**：業主用不到，從 `/admin/services/[id]/edit` 的表單與 form state 移除，UI 不顯示。**後端 API 零變動**（`PUT /api/admin/services/[id]` 已用 `body.xxx !== undefined` 條件式更新，body 沒帶就跳過 DB 寫入）。**現有 `service.icon` / `service.order` 資料保留**，前台仍依 `service.icon` 顯示 lucide 圖示、依 `service.order` 排序。要批次調整排序請改用 `/admin/services` 列表頁的上下移按鈕，icon 需修改可暫時直接改 DB 或臨時加回欄位。

**首頁 CTA Banner 新增「LINE 加好友連結」與「背景圖」獨立欄位**：`cta-home` ContentBlock 新增兩個欄位：
- `lineUrl`（純 text）：前台條件渲染 LINE 官方「加入好友」按鈕（hardcode 用 `https://scdn.line-apps.com/n/line_add_friends/btn/zh-Hant.png`），lineUrl 有填才顯示。設計動機：原本 CKEditor 沒貼 raw HTML 的入口、業主貼進編輯區角括號會被 escape；給專屬欄位零學習成本。（後續已在 `RichTextEditor` 加 `HtmlEmbed` plugin，FAQ 等富文本欄位可用 toolbar 的「嵌入 HTML」按鈕貼第三方程式碼；CTA Banner 仍保留 lineUrl 專屬欄位——主畫面只有 LINE 一個按鈕、用專屬欄位比 HtmlEmbed 步驟少。）
- `backgroundImage`（image，folder 'home'）：原本 `app/(site)/page.tsx` CtaBanner 背景圖是 hardcode unsplash 廚房照片、admin 無入口；改為「有填用 ContentBlock 圖、未填 fallback 到原 unsplash URL」。前端 `<Image>` 統一加 `unoptimized`（先前 hardcode 路徑沒加是 bug，會吃 Next.js image quota）。

LINE button 圖片用 `<img>` raw tag、CTA 背景與 unsplash fallback 用 `<Image unoptimized>`，都避免 `next.config.ts` 為單一 host 增加 remotePatterns。

**「詳細描述（主文）」編輯入口從 services/edit 搬到 sections/items 子頁**：`service.longDesc` 在前台 `WhyWithFeaturesSection.tsx` 用作「為什麼這項服務重要？」section 的主文，但 admin 端入口卻在 `/admin/services/[id]/edit` 的主欄位面板，與「該 section 的內容管理」分離 —— 業主心智模型對不上（修文案要先跑兩個頁面）。

**改動**：
1. `app/api/admin/sections/[sectionId]/route.ts`：GET 的 service select 加 `longDesc: true`，items 子頁拿得到主文初值。
2. `app/admin/services/[id]/sections/[sectionId]/items/page.tsx`：在 `why_with_features` 區塊 features 編輯區上方新增 `WhyMainDescEditor` 元件（內含 RichTextEditor + 獨立儲存按鈕、走 `PUT /api/admin/services/[id]` 既有 endpoint）。
3. `app/admin/services/[id]/edit/page.tsx`：移除「詳細描述」Field 與 `form.longDesc`，改為一個指示卡片連往 sections 管理頁。

**資料層零變動**：`Service.longDesc` schema 不變、`PUT /api/admin/services/[id]` 用 `body.longDesc !== undefined` 條件式更新（line 71-77），edit 頁 form 拿掉 longDesc 後 PUT body 不會送該欄、DB 不會被誤覆蓋。前台 `WhyWithFeaturesSection` 仍讀 `service.longDesc` 顯示，**完全不需動前台**。

---

**`SectionConfigModal` 富文本欄位 stale display 修補（兩階段）**：業主回報 `/admin/services/[id]/sections` 跨 section 切換 modal 時，富文本欄位（intro 的 paragraph1/2/3、text_block 的 body）會殘留前一個 section 的內容。

第一次嘗試只給 `<RichTextEditor>` 加 `key={section.id}-${field.key}`，**結果無效**。真正的根因是「**兩階段初始化的時序漏洞**」：`SectionConfigModal` 自己用 `useState<ConfigState>({})` + `useEffect(() => setForm(section.config), [open, section])`，第一次 render 時 form 仍是上一個 section 的內容（useEffect 尚未跑），RichTextEditor 就 mount 並把舊內容凍進 `useRef(value)`；等 useEffect 跑、setForm 變新值時，CKEditor 已 freeze，加 key 也救不回（因為 React 看 key 變 unmount/remount，但第一次 render 時 form 仍 stale）。**且若業主在 stale 狀態下按過儲存，PUT body 會把客廳的內容寫進廚房 section.config，DB 真的被污染**。

**真正修法（兩處同時改）**：
1. `app/admin/services/[id]/sections/page.tsx` 的 `<SectionConfigModal>` 加 `key={editingSection?.id ?? 'closed'}` —— 父層 force remount。
2. `components/admin/section-config-modal.tsx` 把 `useState({})` + 那段 `useEffect` 改寫為 `useState(() => 從 section.config 算出 initial)` 的 lazy initializer —— **第一次 render 時 form 就已正確**，RichTextEditor mount 時 `initialDataRef` 凍住的就是正確值，CKEditor 顯示對的內容。同時移除舊的 `useEffect` 與 `useEffect` import，以及子層 `<RichTextEditor>` 上的 key（不再需要）。

**未來警告**：所有「外部 prop 變化要重設 internal state」的 component，避免 `useState 預設值 + useEffect 同步` 兩階段，改用「父層 key force remount + 子層 lazy initializer 一次到位」這個 React 慣用模式，否則任何「mount 時凍住 prop」的 wrapper（如 CKEditor、CodeMirror、Map）都會踩此坑。

**歷史資料污染**：此 bug 在修補前每次「業主在 stale 顯示下按儲存」都會把錯內容寫進 DB。業主需手動進每個 intro section 比對 paragraph1/2/3 內容是否正確，必要時清空或重填。沒有資料庫層級的回復方案（Neon 也沒做 point-in-time recovery）。

**所有 admin 寫入動作主動觸發 ISR revalidate（修「存了沒看到」）**：前台 `/services` 與 `/services/[slug]` 用 `export const revalidate = 60`，預設要等 60 秒。新增 `lib/revalidate-service.ts` 提供 `revalidateService(serviceId)` helper：查 slug → `revalidatePath('/services/${slug}')` + `/services` + `/`。所有 admin write routes（services POST/PUT/DELETE、sections POST/PUT/DELETE、features POST/PUT/DELETE、faqs POST/PUT/DELETE、before-afters POST/PUT/DELETE、gallery POST/PATCH/DELETE）在 DB commit 後呼叫此 helper。`revalidatePath` 是 fire-and-forget，不延遲 API response，但下次前台請求就會立即 regenerate。業主存檔後 hard refresh 就看得到變化、不用再等 60 秒。

### C3c（已完成）— 列表 type section-scoped 子頁

業主新增「第二個 Gallery / FAQ / Before-After / 重點清單 section」現在可以加自己的內容、跟其他同類型 section 完全獨立。

**API 改動**（**最小侵入**：沿用既有 POST，只多接 `sectionId` 參數）：

| Endpoint | 改動 |
|---|---|
| `POST /api/admin/services/[id]/features` | body 加 `sectionId?: number`，寫入 ServiceFeature.sectionId |
| `POST /api/admin/services/[id]/faqs` | 同上（ServiceFaq）|
| `POST /api/admin/services/[id]/before-afters` | 同上（BeforeAfterPair）|
| `POST /api/admin/services/[id]/gallery` | 同上（ServiceGalleryImage）|
| `GET /api/admin/sections/[sectionId]` | **新增**：一次拿 section + service.{id,name,slug} + 所有子表 items |

PUT/DELETE 路徑保持 itemId-scoped 不變（無 sectionId 概念）。

**子頁**：`/admin/services/[id]/sections/[sectionId]/items/page.tsx`，依 `section.type` 條件渲染：

| Type | Editor 元件 | 功能 |
|---|---|---|
| `why_with_features` | `FeaturesEditor` | inline 列表 + 加入框新增 + 刪除 |
| `faq` | `FaqsEditor` | 展開式新增表單、inline edit、刪除 |
| `gallery` | `GalleryEditor` | 多檔批量上傳 R2、改 alt（onBlur 自動存）、刪除（同時清 R2）|
| `before_after` | `BeforeAfterEditor` | 沿用 `<BeforeAfterModal>`（多接 `sectionId` prop）、首頁精選 toggle、刪除 |

**sections 管理頁**：簡單 type 仍開 modal、列表 type ✏️ 改成 `router.push` 導向子頁；`more_services` 顯示 toast「自動帶入無需編輯」。

業主感受到的改變：
- 第一個 Gallery 跟第二個 Gallery 的圖完全分開
- features 重點清單可以為「不同的 section」各自設一份
- FAQ section 可以多組，例如「服務 FAQ」+「保固 FAQ」

### C4a（已完成）— 邏輯切換到 section，移除所有 fallback

前台 / 後台 / queries 不再讀 `Service.intro* / why* / heroImage` 之外的舊欄位，也不再從 service-level 子表 fallback：

| 檔案 | 動作 |
|---|---|
| `components/service-sections/IntroSection.tsx` | 移除 `?? service.intro*` fallback |
| `components/service-sections/WhyWithFeaturesSection.tsx` | 移除 `?? service.why* / service.features` fallback |
| `components/service-sections/BeforeAfterSection.tsx` | 移除 service.beforeAfters fallback |
| `components/service-sections/GallerySection.tsx` | 移除 service.galleryImgs fallback |
| `components/service-sections/FaqSection.tsx` | 移除 service.faqs fallback |
| `lib/queries.ts` `getServiceBySlugFull` | 不再頂層 include features/faqs/beforeAfters/galleryImgs |
| `prisma/seed.ts` | Service.upsert 不再寫 `intro*`/`why*`；改用 `introSectionConfig` 寫入 intro section.config |
| `components/admin/section-editors/SectionConfigInline.tsx` | **新增**：list-type 子頁上方加 inline config 編輯（eyebrow / title / description for before_after），onBlur 自動 PUT — 解決 C3c 遺留的 why_with_features title 無法編輯問題 |

### C4b（已完成）— 物理 drop 12 個冗餘欄位

業主在 Neon Console 建好 backup branch `pre-c4b-2026-05-15` 後明確授權執行。

已 drop：
- `Service` 表：`introEyebrow / introTitle / introParagraph1 / introParagraph2 / introParagraph3 / introImage / whyEyebrow / whyTitle`（8 欄）
- 子表：`ServiceFeature.serviceId / ServiceFaq.serviceId / BeforeAfterPair.serviceId / ServiceGalleryImage.serviceId`（4 個 FK）
- 子表 `sectionId` 從 nullable 改成 not null（schema 強制無孤兒記錄）

執行流程：
1. `pnpm exec tsx prisma/section-cms-c4b-precheck.ts` — 確認 0 孤兒
2. 改 `prisma/schema.prisma`：drop 8 欄 + drop 4 個 service relation + sectionId not null
3. `pnpm exec prisma db push --accept-data-loss` — Neon 列出將 drop 的欄位，全部資料 C1 已搬到 section.config / section relations
4. 跑 verify 確認筆數不變（8 services, 64 sections, 27 features, 7 faqs, 15 beforeAfters, 7 gallery — drop 前後完全相同）
5. 清掉所有 code 對舊欄位的 reference（API routes / queries / admin pages / seed.ts）

連帶清理：
- 刪除 `prisma/section-cms-c1-migrate.ts`（一次性 migration，已執行完畢）
- 子表 service-scoped API（`/api/admin/services/[id]/features` 等）的 GET/POST：改成 `where: { section: { serviceId } }`（透過 section 反向關聯），POST 強制要求 body.sectionId
- `lib/queries.ts` `getActiveServices` / `getFeaturedBeforeAfters` / `getAllBeforeAfters` 改成從 sections 拉子表後攤平
- `prisma/seed.ts` 子表 reset 改成 sectionId-scoped；新增 `ensureDefaultSectionsForService` helper

### Phase 2 全程完工

業主行為與前台呈現 100% 走 section CMS。schema 乾淨無冗餘。可以正常上線給業主使用。

---

## 服務 Slug 自動產生

`lib/slug.ts` 提供 `slugify(name)` 與 `uniqueSlug(base, existing)`，業主新增服務時**不填 slug**，由系統依中文 `name` 自動產生 URL 友善的 slug。

### 行為

| 情境 | 輸入 | 輸出 |
|---|---|---|
| 中文名稱 | `冷氣深度清洗` | `leng-qi-shen-du-qing-xi` |
| 中英混合 | `防霾紗網 Pro` | `fang-mai-sha-wang-pro` |
| 純英文 | `Air Conditioner Cleaning` | `air-conditioner-cleaning` |
| 撞名 | name = `家事清潔`（slug 已存在） | `jia-shi-qing-jie-2`（後綴遞增）|
| 純符號 fallback | `!!!@@@` | `service` |

### 規則

- 拼音化用 `pinyin-pro`（無聲調、非中文連續保留、純 JS）
- 上限 60 字元（避免過長 URL）
- 撞名加 `-2 / -3 / -4` 後綴（不用 nanoid，URL 可讀、業主辨識度高）
- **編輯時 slug 鎖定**：`PUT /api/admin/services/[id]` 忽略 `body.slug`，避免改名破壞已分享連結與 SEO 索引
- 既有 6 個 service 的 slug 保留現狀，不做 migration

### 為什麼這樣設計？

業主非技術人員，要他「把『冷氣深度清洗』翻成英文 + 用連字號連接 + 確認沒撞名」太難了。slug 是技術細節，**業主應該無感**。

---

## 開發守則（CLAUDE.md 全域強制）

1. **只用 pnpm** — 不可使用 npm / yarn 安裝套件
2. **錯誤完整顯示在前端** — 任何 API 錯誤都要 toast 並 inline 顯示完整訊息，不可吞錯誤
3. **永遠只有一份文檔** — 所有說明都寫進 README.md，不新建其他 .md 文件
4. **禁用 `--accept-data-loss`** — Prisma 推 schema 時若會刪資料，必須先備份再手動處理
5. **不要亂覆蓋資料庫** — 開發階段只用 `db:push`，正式環境用 migrate

---

## 部署（Vercel + Neon + R2）

1. **Neon**：建立新的 PostgreSQL 專案（不要與 drink 共用），region 必須選 **AWS Asia Pacific (Singapore) `ap-southeast-1`**（與 Vercel function region 對齊）。複製 **Pooled connection string**（URL 含 `-pooler`）
2. **Cloudflare R2**：建立新 bucket `invisible-care`，啟用 public 子網域，產生 API token
3. **Vercel**：連結 GitHub repo（需 Pro plan 才能 pin region）
4. 在 Vercel 專案設定中填入所有 `.env.example` 列出的環境變數
5. 推送到 main 觸發部署，build 流程：`prisma generate && next build`
6. 第一次部署完成後，造訪 `/admin/login`

### 效能關鍵設定（已內建在 repo）

- `vercel.json` 將 function region 釘在 **`sin1`**（新加坡），與 Neon DB 同機房 → 跨服務 RTT < 2ms
- `lib/prisma.ts` 使用 Neon WebSocket serverless driver（無 TCP cold start handshake）
- `next.config.ts` 設定 AVIF/WebP、30 天 image cache、`serverExternalPackages` 排除 `ws` 不被 webpack bundle
- `app/layout.tsx` 已掛 Speed Insights + Analytics，部署後 24h 內可在 Vercel Dashboard 看 Web Vitals

**驗證 region 是否正確**：deploy 後在瀏覽器 DevTools Network → 任一請求 → response header `x-vercel-id` 開頭應為 `sin1::`

---

## 已知限制

- 部分 mock 圖片仍用 Unsplash，實機部署後業主透過 `/admin/services/[id]/sections` 內的「前後對比圖」與「服務圖庫」區塊上傳真實照片，會自動存到 Cloudflare R2 並覆蓋顯示
- Before/After 並排元件在 iOS Safari 14 以下未測試（目標瀏覽器為 iOS 16+ / Chrome 110+）
- 後台無多管理員 / 角色權限；單一 admin 帳號（drink 模式）
- 後台無操作 audit log
- 後台無草稿 / 排程發布（直接 `isActive` 切換）
- 對比圖採「一次新增一組 modal」UX；未做拖拉批次上傳
- **TODO（資料新鮮度）**：所有 admin 寫入 API（`app/api/admin/**/route.ts` 的 POST/PUT/DELETE）目前都沒呼叫 `revalidatePath` 或 `revalidateTag`。後果：在後台改完資料，前台要等 ISR 60 秒才會看到。修正方向：在每個寫入 handler 成功回傳前，根據 entity 類型呼叫對應的 `revalidatePath`（services → `/services` + `/services/[slug]`；testimonials → `/`；general-faqs → `/faq`；content/settings → `revalidatePath('/', 'layout')`）。

## 第一次啟動完整步驟

1. **`pnpm install`** — 套件安裝（會自動 `prisma generate`）
2. **填寫 `.env`** — 從 `.env.example` 複製，填入 Neon DATABASE_URL、NEXTAUTH_SECRET（`openssl rand -base64 32`）、ADMIN_USERNAME/PASSWORD、R2 五個 keys、NEXT_PUBLIC_SITE_URL、NEXT_PUBLIC_BRAND_NAME
3. **`pnpm db:push`** — 將 schema 推到資料庫（首次無資料，**禁用** `--accept-data-loss`）
4. **`pnpm db:seed`** — 寫入 6 大服務 + 對比圖 + 評價 mock 資料
5. **`pnpm dev --port 3100`** — 啟動開發伺服器
6. 開瀏覽器到 `http://localhost:3100`（前台）或 `http://localhost:3100/admin/login`（後台），用 `.env` 設定的帳密登入
7. 進入後台後可以開始上傳真實照片、編輯內容、處理詢問單

---

## 變更記錄

### 2026-05-18（`/admin/content` 加入動態附加區塊：首頁 + 關於我們）

**動機**：原本 `/admin/content` 只能編輯 14 個寫死 key 的 `ContentBlock`，業主想加「促銷橫幅、品牌故事、認證說明」這類額外段落無從下手。固定欄位 14 個還會混在一起、找起來累。

**設計選擇**：
- 不破壞既有 14 個 ContentBlock；新增 `PageSection` 表並存（兩者各司其職：ContentBlock 管固定區塊的文案、PageSection 管動態插入的整段區塊）
- 通用 `PageSection` 表帶 `page` 欄位（`home` / `about`），未來 contact/faq 要加不用再開新表
- 沿用 `/admin/services/[id]/sections` 的 UI 模式：新增 modal 選 type、上下移排序、顯示/隱藏 toggle、刪除確認

**渲染位置**：
- `home`：`Testimonials` 後、`CtaBanner` 前（`app/(site)/page.tsx`）
- `about`：Belief sections（WhyUsSection location=about）後、底部 CTA 前（`app/(site)/about/page.tsx`）
- 兩個頁面都加 `getActivePageSections(page)` 到既有 `Promise.all`，沒讓 ISR static 退化

**4 種 type**：
| type | 欄位 | 適用場景 |
|---|---|---|
| `text_block` | eyebrow + title + body(rich) | 一段標題說明、最新消息 |
| `cta_banner` | backgroundImage + overline + titleLine1/2 + description(rich) + primaryCta + lineUrl | 額外的預約 CTA、限時優惠 |
| `image_text` | layout(left/right) + image + eyebrow + title + body(rich) + ctaText + ctaUrl | 品牌故事、認證介紹 |
| `rich_content` | html(rich) | 自由格式內容 |

**關鍵檔案**：
- `prisma/schema.prisma` — 新增 `PageSection` model（`@@index([page, order])`）
- `app/api/admin/page-sections/route.ts` — GET（?page=）/ POST，含 default config 範本
- `app/api/admin/page-sections/[id]/route.ts` — PUT / DELETE，富文本 sanitize、R2 圖片孤兒清理、`revalidatePath` 對應頁面
- `components/admin/page-section-config-modal.tsx` — 依 type 動態渲染欄位（沿用 FieldRenderer pattern）
- `app/admin/content/_components/PageSectionsManager.tsx` — 列表 / 新增 / 排序 / 隱藏 / 刪除 UI
- `app/admin/content/page.tsx` — 上方掛兩個 manager（首頁、關於我們），下方保留原 14 個 accordion
- `app/(site)/_components/page-custom-sections.tsx` — 前台 server component，依 type 渲染 4 種 UI
- `lib/queries.ts` — 新增 `getActivePageSections(page)`
- `lib/admin-types.ts` — 新增 `PageSectionPage` / `PageSectionType` / `AdminPageSection`

**為什麼不沿用 `ServiceSection`**：強制 `serviceId` 又綁 4 張子表（features/faqs/before-after/gallery），首頁附加區塊全用 config JSON 就夠。`PageSection` 結構小、index 快、未來擴 contact/faq/works 也獨立。

**為什麼 4 種 type 各自獨立而不全用 `rich_content`**：`rich_content` 雖能塞所有內容，但業主後台會失去結構化欄位提示。`text_block` / `cta_banner` / `image_text` 給業主清楚的填空框，`rich_content` 留給真正自由排版場景。

**附加：固定欄位區塊按頁面分組**

業主提過「14 個固定欄位混在一起難找、想自由排序」。前台 render 順序是寫死在 JSX 的，後台清單順序改了前台不會動 — 直接做「自由排序」是浪費工。改做：在 `BLOCK_DEFS` 每個 entry 加 `group` 欄位（`home` / `about` / `contact` / `faq` / `services` / `works` / `global`），`ContentAdminPage` 用 HTML `<details>` 按 group 折疊，預設只展開「首頁」組。HTML 原生 details 的好處：無 JS 也能 work、業主誤折疊不會 unmount 內部 BlockEditor（dirty tracking 保留）。Chevron 用 Tailwind 4 `group-open:rotate-90` variant 配 `[&::-webkit-details-marker]:hidden` 自訂視覺。

### 2026-05-18（移除所有假圖 fallback：源碼 + seed + DB 三層清乾淨）

**動機**：業主端不能放假圖。但專案多處有「後台沒設圖就 fallback 到 unsplash」的邏輯，加上 seed 與 mock-data 把 unsplash URL 寫進 DB，導致就算後台不設圖也會顯示假圖。

**改動**：

1. **源碼 fallback 移除（2 處）**：
   - `app/(site)/page.tsx` — `CtaBanner` 背景圖：原本 `block.backgroundImage || 'https://images.unsplash.com/...'`，改為 `{block.backgroundImage && <div>...</div>}`，沒設背景就直接純 ink 色塊。
   - `app/(site)/about/page.tsx` — 故事區大圖：原本 `aboutBlock?.image || 'https://images.unsplash.com/...'`，改為條件渲染整個 `<div className="aspect-[4/5]">`，且 grid 自動 collapse 為單欄全寬讓文字撐開（避免左半空白）。

2. **Seed／mock-data 去毒**：
   - `lib/mock-data.ts` — `u()` helper 從「拼 unsplash URL」改為「永遠回傳空字串」，下方所有 mock service 的 `heroImage / cardImage / beforeUrl / afterUrl / gallery url` 全變空字串，但結構不動。
   - `prisma/seed.ts` —
     - `introSectionConfig` 兩支 service 的 `image` 從 unsplash URL 改為 `''`
     - `about` ContentBlock 的 `image` 從 unsplash URL 改為 `''`
     - `service.upsert` 的 `heroImage / cardImage` 改用 `m.heroImage || null` / `m.cardImage || null`，避免寫入空字串汙染 schema
     - `BeforeAfterPair / ServiceGalleryImage` 建立前先 `filter` 掉 URL 空字串，沒有 URL 的對比圖／圖庫圖**不再寫入 DB**（避免 NOT NULL 欄位塞 `''`）

3. **DB 一鍵清理**（針對既有 production 資料）：
   - `prisma/scan-fake-images.ts`（新）— 唯讀掃 `Service.heroImage/cardImage`、`ServiceSection.config`、`ContentBlock.payload`、`BeforeAfterPair.beforeUrl/afterUrl`、`ServiceGalleryImage.url` 五個出處，列出所有含 `images.unsplash.com / picsum / placeholder` 的位置。`pnpm tsx prisma/scan-fake-images.ts`
   - `prisma/clear-fake-images.ts`（新）— 預設 dry-run，`--confirm` 才寫 DB。可 null 的欄位設 null，JSON config 移除 key，NOT NULL 欄位（before-after pair、gallery image）整筆 DELETE。執行：`pnpm tsx prisma/clear-fake-images.ts --confirm`
   - **本次執行結果**：5 筆 UPDATE（4 個服務的 heroImage+cardImage、1 個 intro section config）+ 1 筆 DELETE（一組假紗窗對比圖 pair#48）。掃描歸零。

**未來新增 image 欄位**：千萬不要寫 `image || '<fallback URL>'`。後台沒設就條件渲染整段拿掉，或顯示文字提示（如 `app/(site)/services/page.tsx:57` 的 `<Sparkles>` icon、`app/(site)/page.tsx:144` 的「尚未上傳對比圖」字樣）。`next.config.ts` 的 `images.unsplash.com` 規則暫時保留（讓本機開發若 import 舊 unsplash URL 不會直接炸），但長期可以拿掉。

### 2026-05-18（**最終修法**：兩個獨立 bug 一起解 — `<Field>` label 攔截 + CKEditor v45+ 拒絕 GPL）

**事件總結**：業主回報「modal 內 CKEditor 不能編輯、點輸入框觸發 toolbar 第一個按鈕」。一連串排查發現是**兩個獨立 bug 疊起來**：

**Bug #1**：`components/admin/form-field.tsx` 的 `Field` 元件用 `<label>` 包整個 children。HTML `<label>` 標準行為：點 label 內非 form-control 區域 → 瀏覽器自動把 click + focus 轉發到 label 內**第一個 focusable form control**（input / button / textarea / select）。CKEditor toolbar 第一個 button 落在 `<Field><RichTextEditor /></Field>` 結構的 `<label>` 內，contenteditable 不算 labelable element，所以點編輯區會被 forward 到 toolbar 第一個按鈕。

**Bug #2**：CKEditor 5 從 v45 開始**拒絕 `licenseKey: 'GPL'`**。v45+ `@ckeditor/ckeditor5-core` 內 `verifyLicenseKey` 直接呼叫 `blockEditor('lts')` → `editor.enableReadOnlyMode(Symbol('invalidLicense'))`，把整個 editor 鎖成 read-only、所有 toolbar button 變灰、contenteditable=false。v44.3.0 仍接受 GPL（只在 distributionChannel === 'cloud' 才 block）。本次先升 v47 後改 GPL 全 block、後來再降回 v44 才恢復。

**為何「FAQ items 頁正常」**：`components/admin/section-editors/FaqsEditor.tsx` 用 RichTextEditor 時**沒包 `<Field>`**、直接放在 `<div>` 內。一直以為差別是 inline vs modal — **錯**，是 Field 包裝差別。

**走過的修法路徑（前面幾次修錯方向）**：
1. ❌ 各種 `clearBoldOnce` multi-tick hack（tick 0 / microtask / setTimeout 0/50ms / RAF×2 / 500ms focus window）
2. ❌ 升 CKEditor 5 v44.3.0 → v47.7.1、想說 v44 internal bug — **反而觸發 Bug #2，editor 完全變 read-only 不能編輯**
3. ❌ ClassicEditor → DecoupledEditor、想說 toolbar 跟 editable 物理分離
4. ✅ 改 Field 從 `<label>` → `<div>`、保留 `<span>` 文字顯示（解 Bug #1）
5. ✅ 降回 ckeditor5 v44.3.0 + @ckeditor/ckeditor5-react v9.5.0（解 Bug #2）

**最終修法**：
- `components/admin/form-field.tsx`：`<label>` → `<div>`，內附長註解警告未來不要改回。失去「點 label 文字 → forward focus 給內部 input」這個 nice-to-have，但 user 點 input/textarea/select 本身仍能正常 focus（瀏覽器原生行為），UX 影響極小。
- `package.json`：`ckeditor5` 維持 `^44.3.0`、`@ckeditor/ckeditor5-react` 維持 `^9.5.0`（v44 GPL 仍 work）
- `components/admin/rich-text-editor.tsx`：保留 ClassicEditor → DecoupledEditor + toolbar 拆到外部 div + `data` prop + `onAfterDestroy` 清 toolbar 殘留。雖然 Bug #1 修了後 ClassicEditor 理論上也能工作，但 DecoupledEditor 結構照 user 提供的 `/Users/eric/Desktop/Contribute/components/CustomEditor.tsx` 範例做、已驗證 production 可用，比較穩。
- 拔掉 477 行內所有 v44 hack（mousedown intercept + multi-tick clearBold + 500ms focus window + `[RichTextEditor v15] mounted` console.log），檔案從 477 行縮到約 360 行。

**驗證方式（gstack headless 瀏覽器自動測）**：
1. `pnpm build` 一次過、零 breaking change
2. dev server 起 + 清 `.next` cache（**重要**：升 v47 又降回 v44 時、cache 必須清）
3. 用 gstack 登入 admin → 進 `/admin/general-faqs` → 開新增 FAQ modal
4. CKEditor 內 `editor.isReadOnly === false`、`_readOnlyLocks` 為 `Set([])`、`contenteditable="true"`
5. 點編輯區、type「測試打字看看」→ `<p>測試打字看看</p>` 寫進 editable innerHTML
6. toolbar 粗體按鈕從 disabled 變 enabled、點擊不觸發異常 active

**關鍵檔案**：
- `components/admin/form-field.tsx` — `<label>` → `<div>`（**Bug #1 修這個**）
- `package.json` — 保持 `ckeditor5@^44.3.0` 不升（**Bug #2 是 v45+ 拒絕 GPL 才產生的**）
- `components/admin/rich-text-editor.tsx` — DecoupledEditor + 拔掉所有 v44 hack

**未來警告 — 嚴重程度極高**：
- **不要把 `Field` 外層的 `<div>` 改回 `<label>`** — 任何用 `<Field>` 包 RichTextEditor 的場景會立刻復活 Bug #1。code 內已留長註解
- **不要升 ckeditor5 到 v45+**，除非先去 [CKEditor Customer Portal](https://portal.ckeditor.com/) 申請 free OSS license key（雖然開源、但需要註冊取得 token）並改 `licenseKey: process.env.NEXT_PUBLIC_CKEDITOR_LICENSE_KEY`。v45+ 直接拒絕 `'GPL'` 字串、editor 會永久 read-only
- 加新「複合 widget」（contenteditable / custom editor / iframe-based control）時，用 `<Field>` 包它一定要先確認 widget 內部沒有 form control button
- 之前那一年累積的 hack 都是在追幽靈（v44 internal bug 不存在 / sticky toolbar scrolling parent 沒影響），如果未來在 modal 內又看到 toolbar 按鈕怪異 active — 先檢查 `<Field>` 外層是不是 `<label>`，再去懷疑 CKEditor
- **dev server cache 是 debug 殺手**：升降 CKEditor 版本時，務必 `rm -rf .next` 後重啟，否則 React Fast Refresh 會跑舊 bundle 給你看新行為，極難 debug

### 2026-05-17（一些被淘汰的中途修法 — 真正修法看 2026-05-18 那則）

**真正的 root cause**：`components/admin/form-field.tsx` 的 `Field` 元件原本用 `<label>` 包整個 children。HTML `<label>` 標準行為：點 label 內**非 form-control 區域** → 瀏覽器把 click + focus 自動 forward 到 label 內**第一個 focusable form control**（input / button / textarea / select）。

CKEditor 的 toolbar 第一個 button（undo / bold）正好落在 `<Field><RichTextEditor /></Field>` 結構的 `<label>` 內，且 `contenteditable` 編輯區**不算 labelable element**，所以業主點編輯區：

1. 瀏覽器 forward click 到 label 內第一個 button（toolbar 第一個按鈕）
2. 該 button 變 active + 跳出 tooltip
3. focus 跑到 button、沒進入 contenteditable
4. 完全無法打字

**為何「FAQ items 頁正常」**：`components/admin/section-editors/FaqsEditor.tsx` 用 RichTextEditor 時**沒包 `<Field>`**、直接放在 `<div>` 內，所以沒有 label forward 問題。一直以為差別是 inline vs modal — **完全錯**。

**走過的修法路徑（全部是修錯方向）**：
1. ❌ 各種 `clearBoldOnce` multi-tick hack（tick 0 / microtask / setTimeout 0/50ms / RAF×2 / 500ms focus window）
2. ❌ 升 CKEditor 5 v44.3.0 → v47.7.1 跨 3 major version、想說 v44 internal bug
3. ❌ ClassicEditor → DecoupledEditor、想說 toolbar 跟 editable 物理分離
4. ✅ 改 Field 從 `<label>` → `<div>`、保留 `<span>` 文字顯示

**最終修法**：`components/admin/form-field.tsx` 把外層 `<label>` 改為 `<div>`、label 文字仍用 `<span>` 顯示。功能上失去「點 label 文字 → forward focus 給 input」這個 nice-to-have，但 user 點 input/textarea/select 本身仍然能正常 focus（瀏覽器原生行為），UX 影響極小；換來的是 RichTextEditor 在任何 form 內都能正常 focus + 打字。

**保留下來的修改**（順手做的清理、雖跟此 bug 無關但有正面價值）：
- ckeditor5 v44.3.0 → v47.7.1（移除 v44 系列潛在 internal bug 風險，所有 41 個 plugin import 仍兼容）
- `@ckeditor/ckeditor5-react` v9.5.0 → v11.1.2（v47 的 peer dep 要求）
- ClassicEditor → DecoupledEditor + toolbar 拆到外部 div（沿用 `/Users/eric/Desktop/Contribute/components/CustomEditor.tsx` 結構，user 確認可用）
- 拔掉 `components/admin/rich-text-editor.tsx` 內所有 v44 hack（mousedown intercept + multi-tick clearBold + 500ms focus window + `[RichTextEditor v15] mounted` console.log），477 行縮到約 340 行

**關鍵檔案**：
- `components/admin/form-field.tsx` — `<label>` → `<div>`（**真正修這個 bug 的改動**）
- `package.json` — ckeditor5 `^44.3.0` → `^47.7.1`，`@ckeditor/ckeditor5-react` `^9.5.0` → `^11.1.2`
- `components/admin/rich-text-editor.tsx` — ClassicEditor → DecoupledEditor + 拔掉所有 v44 hack

**未來警告 — 嚴重程度極高**：
- **不要把 `Field` 外層的 `<div>` 改回 `<label>`** — 任何用 `<Field>` 包 RichTextEditor 的場景會立刻復活這個 bug。code 內已留長註解警告
- 加新「複合 widget」（contenteditable / custom editor / iframe-based control）時，用 `<Field>` 包它一定要先確認 widget 內部沒有 form control button（否則會被 label forward）
- 之前那一年累積的 hack 都是在追幽靈（v44 internal bug 不存在 / sticky toolbar scrolling parent 沒影響），如果未來在 modal 內又看到 toolbar 按鈕怪異 active — 先檢查 `<Field>` 外層是不是 `<label>`，再去懷疑 CKEditor

### 2026-05-17（CKEditor 5 v44 → v47.7.1 升級 + ClassicEditor → DecoupledEditor — 看似修了但其實沒修，真正根因在 2026-05-18 那則）

**動機**：業主回報「所有後台用到富文本編輯器的 modal（新增/編輯 FAQ、評價、服務、流程步驟、區塊內容 modal、對比圖 modal）剛 hover 或 focus 編輯區，toolbar 第一個按鈕（粗體）就會自動進入 active 狀態，看起來像被選取，且根本不能打字」。唯一正常的頁面是 `/admin/services/[id]/sections/[sectionId]/items` 的 FaqsEditor（inline 條件渲染）。

**根因（兩層）**：
1. **CKEditor 5 ClassicEditor 在 modal 容器（fixed overlay + overflow-y-auto）內，focus editable 時會把 focus tracker 跳到 toolbar 第一個 button**，導致該 button 進入 active 狀態 + tooltip 跳出 + 鍵盤 focus 卡在 toolbar、user 不能打字。本地用 production needfix.com.tw 與 dev server 都 reproduce 確認
2. ClassicEditor 把 toolbar 跟 editable 包在同一個 wrapper element 內，CKEditor 內部的「focus 從 editable 跳到 toolbar」這個行為 hardcoded 依賴 toolbar 跟 editable 是 sibling 關係

**走過的修法路徑**：
1. ❌ **multi-tick `clearBoldOnce` hack（已淘汰）**：原本在 `handleEditorReady` 用 mousedown intercept + 5 個時機（tick 0 / microtask / 0ms / 50ms / 2 frames）清 bold attribute + 500ms focus window selection change 監聽，**inline 場景剛好贏得時序競賽，modal 內失效**
2. ❌ **升 ckeditor5 v44.3.0 → v47.7.1**（跨 3 major version）：原本以為是 v44 internal bug、v45+ 應該修了。實測**還在**——這不是版本 bug，是 ClassicEditor 架構問題
3. ✅ **改用 DecoupledEditor**：toolbar 跟 editable 物理分離到兩個 DOM element，onReady 後手動把 `editor.ui.view.toolbar.element` `appendChild` 到外部 `toolbarRef` div。CKEditor 找不到「toolbar 在 editor wrapper 內」的條件、focus tracker 不跳。**參考 `/Users/eric/Desktop/Contribute/components/CustomEditor.tsx` 結構**——那個專案的 RichTextEditor 一直正常、就是用 Decoupled

**最終修法**：
- 升 ckeditor5 v44.3.0 → v47.7.1（順便清掉 v44 系列的相關潛在 internal bug），`@ckeditor/ckeditor5-react` v9.5.0 → v11.1.2（peer dep 要求 ckeditor5 >= 46.0.0）
- `components/admin/rich-text-editor.tsx`：
  - `import { ClassicEditor, ... }` → `import { DecoupledEditor, ... }` from `'ckeditor5'`（v47 unified package 內有 export `DecoupledEditor`、不用換套件、所有 41 個 plugin 保留）
  - 拔掉所有 v44 hack（mousedown intercept + multi-tick clearBold + 500ms focus window + `[RichTextEditor v15] mounted` console.log），477 行縮到 ~340 行
  - render 結構從「單一 wrapper 內塞 `<CKEditor>`」改成「外層 `toolbarRef` div + 外層 `editorRef` div 內塞 `<CKEditor editor={DecoupledEditor}>`」
  - 新 `handleEditorReady` 只做一件事：`toolbarRef.current.appendChild(editor.ui.view.toolbar.element)`
  - toolbar items 第一個從 `bold` 改回 `undo / redo / heading` 開頭（v44 「第一個 dropdown auto-open」workaround 不需要了）
  - 加 CSS：toolbar 容器有上圓角、editable 容器有下圓角、editable focus 時拔掉 CKEditor 預設 box-shadow（與專案 hairline border 風格一致）

**驗證**：
- `pnpm build` 一次過、零 breaking change — 41 個 plugin import 名稱完全沒變，`translations/zh.js` 路徑、licenseKey `'GPL'`、config schema 全部仍兼容
- modal 場景（general-faqs、testimonials、services、process-steps、content、section-config、before-after）內 focus 編輯區後第一個 toolbar button 不再 auto-active、可以直接打字
- inline 場景（FaqsEditor 在 sections/items 頁）一樣正常運作

**關鍵檔案**：
- `package.json` — ckeditor5 `^44.3.0` → `^47.7.1`，`@ckeditor/ckeditor5-react` `^9.5.0` → `^11.1.2`
- `components/admin/rich-text-editor.tsx` — ClassicEditor → DecoupledEditor、拔掉所有 v44 hack、toolbar 分離

**未來警告**：
- 不要把 DecoupledEditor 改回 ClassicEditor，會立刻復活這個 bug
- 不要在 `handleEditorReady` 內加「修補 selection attribute」「攔截 mousedown 關 dropdown」之類的時序競賽 hack——這條路走過已淘汰
- toolbar element 是 CKEditor 在 destroy 時自己清理的，不要在 useEffect cleanup 內手動 removeChild（會跟 CKEditor 內部 cleanup 衝突）

### 2026-05-17（服務編輯入口大合併：`/edit` + `/before-afters` + `/gallery` → `/sections`）

**動機**：`/admin/services/[id]/edit` 上的三張快速連結卡（區塊管理、對比圖、圖庫）與獨立的 `/before-afters`、`/gallery` 子頁，跟 `/sections` 頁內的 before_after / gallery 區塊功能 100% 重疊，業主要記兩條編輯路徑、改 schema 時容易漏更新。

**改動**：
1. **抽出** `components/admin/service-main-fields-panel.tsx` — 原本 `/edit` 頁內 inline 的 `MainFieldsPanel`（服務名稱 / slug / 描述 / 卡片圖 / SEO / 上下架 / 首頁精選）拉成獨立 component。
2. **嵌入** `/admin/services/[id]/sections/page.tsx` 頂部 — 主欄位面板放在區塊列表上方，header 簡化為 `service.name`，麵包屑壓成「服務管理 → 服務名稱」兩階。「新增區塊」按鈕從 page header 搬到「頁面區塊」子標題右側，視覺分層更清楚。
3. **刪除** 三個 page 路由：`app/admin/services/[id]/edit/`、`/before-afters/`、`/gallery/`。**API 路由保留** — `app/api/admin/services/[id]/before-afters/**` 與 `/gallery/**` 仍被 `BeforeAfterEditor` / `GalleryEditor` / `BeforeAfterModal` 使用。
4. **更新連結**：
   - `app/admin/services/page.tsx` 列表編輯按鈕 → `/sections`
   - `app/admin/services/[id]/sections/[sectionId]/items/page.tsx` 兩處麵包屑 → `/sections`（並順手刪掉變成同 URL 的「區塊管理」冗餘階）
   - `components/admin/quick-actions.tsx` dashboard 快捷「新增清潔前後照片」→ `/sections`（多一層點擊到 before_after section，可接受）

**未來新增 admin page** 若關於服務內容，一律放在 `/sections` 流程內（簡單 type 走 modal、列表型走 `/sections/[sectionId]/items`），不要再開獨立路由——這次合併就是因為當初獨立路由變成重複入口。

### 2026-05-17（header logo — `public/logo.jpg`，⚠️ 與品牌名衝突待釐清）

`components/site-nav.tsx` 左上角原本的 `ShieldCheck` 方塊圖示換成 `<Image src="/logo.jpg" w/h=40>`，圖檔放在 `public/logo.jpg`（業主提供的 ProShake 握手 logo）。`ShieldCheck` import 已從 lucide-react 移除。右側「invisible care / 看不見的守護」文字塊**保留**（仍由 ContentBlock settings 動態渲染）。

**⚠️ 待釐清**：logo 圖含 "ProShake" wordmark，與站名「invisible care」並列形成雙品牌。後續方向二選一：
1. 品牌改名 ProShake → 改 `site-settings` 的 siteName / tagline、SEO metadata、README 全站文字。
2. 換一張「純圖示版（無 wordmark）」logo → 適合 header / favicon 小尺寸顯示，現在這張在 32-40px 下 wordmark 會糊。

### 2026-05-17（favicon）

將 `/Users/eric/Downloads/IMG_0748.JPG` 複製為 `app/icon.jpg`，走 Next.js App Router 的 file-based metadata 慣例 — build 時自動產生 `<link rel="icon" href="/icon.jpg?<hash>">`，**`layout.tsx` 不需改 `metadata.icons`**。日後若要換 icon，覆蓋同名檔即可；想優化體積/透明度可換成 `icon.png` 或 `icon.svg`（同名前綴即可）。⚠️ 同樣與「invisible care」品牌名衝突（見上一項）。

### 2026-05-16（CKEditor 擴展到 `/admin/content`：14 個 ContentBlock 多行欄位升級）

**動機**：甲方反映 about 頁的「我們的專業全方位服務」段落要打項目符號只能手動敲 `• ` + 換行，土法煉鋼且 SEO 看不出 `<ul>` 結構。`/admin/content` 整頁的 textarea 全部升級為 CKEditor。

**範圍**：**只升級多行欄位（textarea → richtext），短欄位（text）維持純 input**。理由：按鈕 label / 導覽分頁名 / Eyebrow 是「結構化 string」，富文本會把 `立即來電預約` 變成 `<p>立即來電預約</p>`、按鈕渲染要 strip tags、整套邏輯複雜化；50 個短欄位每個掛一個 toolbar 也會把頁面長度撐爆。

| 升級的 14 個欄位（按 block） | 維持 text input 的欄位 |
|---|---|
| hero-home.description | eyebrow / titleLine1/2 / primaryCta / secondaryCta / checklist1-4 |
| section-services-home.description、section-works-home.description | eyebrow / title / viewAllLabel |
| cta-home.description | overline / titleLine1/2 / primaryCta |
| hero-about.lead | eyebrow / titleLine1/2 |
| about.paragraph1/2/3 | eyebrow / title |
| cta-about.description | title / primaryCta |
| hero-contact / hero-faq / hero-services / hero-works 的 description | eyebrow / title / 各種 label |
| navigation.footerLegalNote | 5 個 nav label + navPrimaryCtaLabel |

**改動**：
- **`app/admin/content/page.tsx`**：`FieldType` `'textarea'` → `'richtext'`、所有對應 field 改類型、BlockEditor 改 render `<RichTextEditor>`、save 時 body 帶 `richTextKeys` 清單
- **`app/api/admin/content/[key]/route.ts`**：PUT 接 `richTextKeys: string[]`，只對這些 key 過 `sanitizeRichText()`，其他純 text / image URL 不動
- **`prisma/backfill-contentblock-richtext.ts`**（新檔，一次性）：對 12 個 block 內 14 個 richtext 欄位把純文字按 `\n+` 拆段、每段包成 `<p>...</p>`。Idempotent（已 `<` 開頭就跳過）。已執行：12 blocks / 14 fields backfilled
- **`components/section-heading.tsx`**：`description` 從 `<p whitespace-pre-line>` 改用 `<RichText html={description}>`，這個 helper 被首頁 / about / contact / faq / works / services 共用，一改全動
- **`app/(site)/page.tsx`** 直接渲染的 hero.description + 底部 CTA banner.description → `<RichText>`
- **`app/(site)/about/page.tsx`** hero lead / paragraphs.map / cta description → `<RichText>`
- **`components/site-footer.tsx`** `navigation.footerLegalNote` → `<RichText inline>`（小字一行，用 inline 模式不壞排版）

**注意**：之前 plan 階段刻意把 ContentBlock.payload 排除（標「複雜結構，後續迭代」），但 about 頁案例證明這個欄位正是富文本最該存在的地方 — 本次解鎖。

### 2026-05-16（CKEditor 富文本引入：8 個長文欄位升級）

**動機**：甲方寫服務介紹 / FAQ / 評價時只能純文字，無法用粗體、列表、標題、表格、插圖、超連結。引入 seminar 專案的 CKEditor 5 ClassicEditor。

**範圍刻意縮窄**：只改「真正是文章型長文」的欄位，**不改**短說明、客戶填寫欄位、結構化欄位。

| 改成富文本 | 維持純 textarea（明確列表，避免日後混淆） |
|---|---|
| `Service.longDesc` | `Service.shortDesc`（卡片摘要會破排版） |
| `ServiceFaq.answer` | `BookingInquiry.message`（客戶填、安全考量） |
| `GeneralFaq.answer` | `BeforeAfterPair.caption` / `ServiceGalleryImage.caption`（短說明） |
| `Testimonial.content` | `ServiceSection.config.description`（hero / cta / before_after 副標、短） |
| `ServiceSection.config.paragraph1/2/3`（intro） | `ProcessStep.desc` / `WhyUsSection.description` / `WhyUsSection.cards[].desc` |
| `ServiceSection.config.body`（text_block） | `ContentBlock.payload`（複雜結構，後續迭代） |

**改動**：
- **`components/admin/rich-text-editor.tsx`**（新檔）：CKEditor 5 ClassicEditor + 自訂 R2 UploadAdapter（取代 `Base64UploadAdapter`，避免 HTML 被 base64 圖片撐爆）
- **`components/admin/rich-text-editor-loader.tsx`**（新檔）：`next/dynamic` + `ssr: false`，CKEditor 不能 SSR 必須 client only
- **`components/rich-text.tsx`**（新檔）：前台渲染元件，內含 sanitize；支援 `inline` mode（用於 testimonial blockquote 內保留中文括弧裝飾）
- **`lib/sanitize-html.ts`**（新檔）：用 `sanitize-html` 套件（**不用 `isomorphic-dompurify`** — 在 Next.js server bundle 環境會試圖 read 不存在的 jsdom default-stylesheet.css）
- **`prisma/backfill-richtext.ts`**（新檔，一次性）：把現有純文字按 `\n+` 拆段、每段包成 `<p>...</p>` 並 escape HTML 特殊字元。Idempotent（已 `<` 開頭就跳過）。已執行回填 33 筆
- **`app/globals.css`**：加 `@plugin "@tailwindcss/typography"`，前台渲染富文本才有 `prose` 樣式
- **8 個 admin form**：`general-faqs/page.tsx`、`testimonials/page.tsx`、`services/page.tsx`、`services/[id]/edit/page.tsx`（longDesc + FAQ）、`section-config-modal.tsx`（intro paragraph1/2/3 + text_block body）的 `<textarea>` 換成 `<RichTextEditor>`
- **5 個 API route 寫入 sanitize**：`services` POST/PUT、`general-faqs` POST/PUT、`testimonials` POST/PUT、`services/[id]/faqs` POST/PUT、`services/[id]/sections/[sectionId]` PUT（config 內 RICH_TEXT_CONFIG_KEYS）
- **5 個前台元件**：`IntroSection`、`TextBlockSection`、`WhyWithFeaturesSection`、`faq.tsx`、首頁 testimonial 卡片改用 `<RichText html={...} />`
- **`WhyWithFeaturesSection` 富文本 margin 覆寫**：容器 className 加上 `[&_*]:my-0`，砍掉 `prose` 預設給段落 / 標題 / 列表的上下 margin。理由是該區塊使用 `leading-loose`（行高 2），段落間距改由行高承擔，避免「行高 + margin」雙重間距視覺鬆散。**副作用**：客戶在 CKEditor 寫多段時，段落之間沒有顯著分隔，若需要分段視覺需自行加空行或標題

**已知顧慮**：
- **CKEditor 5 GPL 授權**在商業 CMS 屬法律灰色地帶。如未來需上正式商用授權再評估換 Tiptap
- **bundle size 約 2-3 MB**：dynamic import 後僅 admin 編輯頁載入，前台不受影響
- **CSS 主題**（lark）配色與 clean 設計系統不一致，先接受外觀差異

**新欄位寫入規則**：未來新加「長文」型欄位，必須在對應 API route POST/PUT 過 `sanitizeRichText()`、admin form 用 `<RichTextEditor from rich-text-editor-loader>`、前台用 `<RichText html={...} />`。

### 2026-05-16（admin 排序箭頭失效：order 碰撞修復）

**症狀**：`/admin/services` 等列表頁的上下箭頭點了不動。

**根因**：
1. 多筆 service 的 `order` 都是 `0`（新增 form 預設 0、沒人手動改），DB 內排序 key 大量碰撞
2. `move()` 邏輯是「互換兩筆 order 數字」— 當兩筆 order 相同時，互換 = 沒動，UI 看起來「箭頭沒用」
3. `fetch` 沒檢查 `r.ok`，API 失敗也 silent fail（違反「所有錯誤完整顯示前端」）

**修法**：
- **`prisma/normalize-orders.ts`**（新檔，一次性 script）：把 `Service / GeneralFaq / ProcessStep / WhyUsSection / ServiceSection / BeforeAfterPair / ServiceFeature / ServiceFaq / ServiceGalleryImage` 的 `order` 全部重編為 0..n-1，分組鍵分別為「全表 / serviceId / sectionId / location」。已執行
- **`lib/admin-reorder.ts`**（新檔）：
  - `swapOrderByIndex(items, id, dir, putUrl)` — 按 sorted index 重算 order，**不依賴 order 唯一性**也能正確
  - `nextOrder(items)` — 算 `max(order)+1`，新增 form 用，避免再生 dup
  - 內建 `r.ok` 檢查 + 解析 error message，失敗 throw 讓 caller toast
- **6 個 admin page** 全改成呼叫 helper：`app/admin/services/page.tsx`、`app/admin/services/[id]/sections/page.tsx`、`app/admin/services/[id]/before-afters/page.tsx`、`app/admin/general-faqs/page.tsx`、`app/admin/process-steps/page.tsx`、`app/admin/why-us-sections/page.tsx`
- **`app/admin/services/page.tsx`** 新增 form 的 `order` 預設改用 `nextOrder(services)`

**未來新增列表 admin page** 必須沿用 `swapOrderByIndex` + `nextOrder`，不要再寫 swap 數字版本。

### 2026-05-16（施作過程相簿照片下方文字）

**動機**：甲方希望 `gallery` type section 的圖片下方能顯示說明文字。

**改動**：
- **`prisma/schema.prisma`** `ServiceGalleryImage`：新增 `caption String?`（顯示用，alt 改純 SEO）
- **`prisma/backfill-gallery-caption.ts`**（新檔，一次性）：把現有 `alt` 內容複製到 `caption`，已執行回填 7 筆
- **`app/api/admin/services/[id]/gallery/route.ts`**：POST/PATCH 接受 `caption`
- **`components/admin/section-editors/GalleryEditor.tsx`**：拆兩欄 input（顯示文字 + SEO alt）
- **`components/service-sections/GallerySection.tsx`**：用 `<figure>` + `<figcaption>` 渲染 caption；caption 為空時不渲染 `<figcaption>`，舊版視覺零回歸
- **`prisma/schema.prisma`** `BookingInquiry`：補回 `serviceIds Int[]` 標記 legacy，避免 `db push` 觸發 data loss（CLAUDE.md 禁用 `--accept-data-loss`）

### 2026-05-15（contact 表單：移除「想諮詢的服務」，改填 LINE ID）

**動機**：簡化轉換漏斗，LINE ID 比 email/電話對台灣客戶的後續聯絡命中率更高。

**改動**：

- **`prisma/schema.prisma`** `BookingInquiry`：移除 `serviceIds Int[]`、新增 `lineId String?`。schema 設 nullable，業務層（API + 前端）強制必填——`null` 只代表「舊資料無此欄位」這個歷史事實
- **`components/contact-form.tsx`**：移除多選 toggle 服務 UI 與 `services` prop，改為 `LINE ID` 文字必填欄位（緊接電話之後），placeholder「您的 LINE ID（例：cleanmaster123）」、`maxLength=100`、不做嚴格 regex（避免擋掉貼 line.me 連結的客戶）
- **`app/api/inquiries/route.ts`**：解構移除 `serviceIds`、加 `lineId` 驗證（非空 + 上限 100 字）。`prisma.bookingInquiry.create` 寫入 `lineId.trim()`
- **`app/(site)/contact/page.tsx`**：移除 `getActiveServices` import 與呼叫（函數本身保留——服務列表頁仍在用），`<ContactForm />` 不再需要 props
- **`lib/admin-types.ts`** `AdminInquiry`：欄位 `serviceIds: number[]` → `lineId: string | null`
- **`app/admin/inquiries/[id]/page.tsx`**：移除「想諮詢的服務」整個 `<section>` + `services` state + `/api/admin/services` fetch + `matchedServices` 計算。客戶資訊區新增 LINE ID 顯示 + 「複製」按鈕（個人 LINE ID 沒有官方 deeplink，複製貼到 LINE 搜尋是最務實的 UX）
- **`app/admin/inquiries/page.tsx`** 列表頁：桌機版表格「電話 / Email」欄改為「電話 / LINE ID」（email 退到詳情頁查看）。手機版 card 維持不變
- **資料庫**：用 `ALTER TABLE ... ADD COLUMN "lineId" TEXT` 純新增（非破壞性）。`serviceIds` 欄位**保留在 DB 但 schema.prisma 已移除**——prisma client 不會讀寫它，新諮詢的 `serviceIds` 為 NULL，舊資料完整保留（已備份 CSV 在 `backups/`）。這是「方案 A：保留欄位但停用」，業務效果跟「完全 DROP」一致，但零資料破壞、零部署風險。若未來要徹底清理欄位，再執行 `ALTER TABLE "BookingInquiry" DROP COLUMN "serviceIds";`

### 2026-05-15（效能優化：region 對齊 + Neon serverless driver + bundle 瘦身）

**根本問題**：Vercel function 跑在 `iad1`（美東預設），Neon DB 在新加坡，使用者在台灣 → 每個 SSR query 跨太平洋來回 ~225ms，TTFB 與 admin 操作都被網路延遲吃掉。

**改動**：

- **`vercel.json`（新建）**：`regions: ["sin1"]`，function 與 Neon DB 同機房，跨服務 RTT 從 ~225ms 降到 < 2ms
- **`lib/prisma.ts`**：`@prisma/adapter-pg` + `pg.Pool` → `@prisma/adapter-neon` + Neon Serverless Driver（WebSocket，無 TCP cold start handshake）
- **`prisma/seed.ts` / `prisma/section-cms-c1-verify.ts` / `prisma/section-cms-c4b-precheck.ts`**：同步換成 Neon adapter
- **`next.config.ts`**：
  - 加 `serverExternalPackages: ['@neondatabase/serverless', 'ws', '@prisma/adapter-neon']`（避免 webpack bundle `ws` 導致 build 時 prerender 出 `b.mask is not a function`）
  - `images.formats: ['image/avif', 'image/webp']`、`minimumCacheTTL: 30 天`、收斂 `deviceSizes` / `imageSizes`
- **`components/lightbox-renderer.tsx`（新建）+ `components/lightbox-provider.tsx`**：拆出 lightbox 重邏輯，用 `next/dynamic({ ssr: false })` 懶載入 → `yet-another-react-lightbox` + 兩個 plugin + CSS 不再進初始 bundle，僅用戶第一次點圖才下載
- **`app/layout.tsx`**：加 `@vercel/speed-insights` + `@vercel/analytics`，部署後自動收 LCP / FCP / TTFB / INP / CLS
- **依賴清理**：`pnpm remove @prisma/adapter-pg pg @types/pg embla-carousel-react motion react-hook-form`（後三個專案完全沒用到，純 dead deps），`pnpm add @prisma/adapter-neon @neondatabase/serverless ws @vercel/speed-insights @vercel/analytics @types/ws`
- **README**：環境變數區段補充 `DATABASE_URL` 必須走 `-pooler` endpoint，部署章節新增「效能關鍵設定」與 `x-vercel-id` 驗證步驟

**預期影響**：台灣使用者首頁 cold path TTFB 從 ~500–700ms 降到 ~120–180ms；admin 後台每次操作從 ~1s+ 卡頓降到 ~150ms 內。

**未做**：admin GET 加快取（P0 後不一定還需要）、admin 寫入加 `revalidatePath`（列為「已知限制 → TODO」），等 Speed Insights 收 24h 真實數據再決定。

### 2026-05-13（結構性品牌文案全面後台化：100% 無前台硬編碼文案）

延續前一階段已動態化的內容，這次把剩下的「結構性品牌文案」也搬進 DB：

- **6 個頁面 Hero**（首頁/about/contact/faq/services/works）標題、副標、Eyebrow
- **6 個區塊標題**（Our Services/Real Results/How it works/Customer Voices/About hero/CTA banner）
- **首頁 Hero 4 條 checklist**（歐盟認證環保洗劑 / 透明報價 / 30 天保固 / 雙北桃園新竹）
- **首頁底部 CTA banner** 全文（BOOK YOUR HOME CARE TODAY / 把專業交給我們...）
- **About 底部 CTA**（您的家，值得被溫柔對待...）
- **Navigation 5 個分頁 label** + 主按鈕文字
- **Footer 法律聲明**

**設計取捨**：不增 schema，全部用既有 `ContentBlock`（key + Json payload），共 13 個新 keys：`hero-home`/`section-services-home`/`section-works-home`/`section-process-home`/`section-testimonials-home`/`cta-home`/`hero-about`/`cta-about`/`hero-contact`/`hero-faq`/`hero-services`/`hero-works`/`navigation`。`/admin/content` 統一編輯介面（既有 BLOCK_DEFS 機制擴 array 即可）。

**fallback 設計**：每個欄位都有 hardcoded fallback（DB 缺鍵時用），避免業主清空某欄位後前台空白。代價：清乾淨某欄位仍會看到 fallback 字串，業主可能誤以為「沒清掉」。

**新增 helper**：`lib/queries.ts:getAllContentBlocks()` 一次拿所有 blocks，省 round-trip。

**SEO 警告**：業主若大幅修改 Hero 標題 / meta description，Google 重新爬蟲後排名可能波動。建議業主修改前先評估 SEO 影響，或保留原標題作為 H1，修改其他段落。

**結果**：除了固定的 route 路徑（`/services` 等）與一些 fallback 預設字串外，**前台 100% 無硬編碼可顯示文案**。

### 2026-05-12（全前台 DB 化：聯絡資訊、服務流程、FAQ、Belief 全部後台可改）

審計後發現嚴重的「死資料連結」：後台 `/admin/settings` 寫進 `SiteSetting` 表，但前台 49 處讀的是 `lib/site-config.ts` 硬編碼——業主以為改了卻沒生效。同時也將其他純硬編碼區塊一併後台化。

**B 級「死資料連結」修補**：
- 全站 `siteConfig.contact.*` / `siteConfig.description` / `siteConfig.brandName` 等改讀 `getSiteSettings()`
- `app/(site)/layout.tsx` 改為 server component，await `getSiteSettings()` 後透過 props 注入 `SiteNav` / `SiteFooter` / `FloatingCta`
- root `app/layout.tsx` metadata 改為 `generateMetadata()` 從 DB 讀 siteName / tagline / description
- seed.ts 把 siteConfig 中所有 contact / social / brand 資料補入 `SiteSetting`（不覆蓋既有值）

**C 級「純硬編碼」後台化**：
- 新增 `ProcessStep` model + `/admin/process-steps` + API CRUD → 首頁服務流程改讀 DB（grid 欄數依數量自動調整 1/2/3/4）
- 新增 `GeneralFaq` model + `/admin/general-faqs` + API CRUD → `/faq` 一般問題改讀 DB
- `WhyUsSection` 加 `location` 欄位（`home` / `about`），admin 介面以 tab 切換、新增/排序皆限定當前 location
- `/about` 頁「三項職人信仰」改讀 `getWhyUsSections({ location: 'about' })`
- seed.ts 補入 4 筆 ProcessStep、4 筆 GeneralFaq、1 筆 about WhyUsSection 作為初始假資料

**保留**：
- `lib/site-config.ts` 仍存在但僅作 seed 初始值來源；前台 0 處引用
- 此次未動：Hero 主視覺文案、Navigation 順序、首頁 hero 內 4 條 checklist（這些 SEO/視覺結構性內容業主通常不會自行改）

**路由速覽更新**：
- 新增 admin：`/admin/process-steps`、`/admin/general-faqs`
- 新增 API：`/api/admin/process-steps`、`/api/admin/general-faqs`
- `/api/admin/why-us-sections` 支援 `?location=home|about` query

### 2026-05-12（首頁「為何選我們」改為後台可疊多組區塊）

原本 `app/(site)/page.tsx` 的 `WhyUs()` 區塊狀態混亂：

- 標題/副標已存在 `ContentBlock(key="why-us")` 可後台編輯
- 但**三張卡片內容硬編碼**在 `lib/site-config.ts` 的 `siteConfig.promises`，後台改不到
- 整個 section 只能存「一組」，業主想新增第二段標題+三卡完全做不到

本次改動：

- 新增 Prisma model `WhyUsSection`（`cards Json` 固定 3 張、`order` 排序）
- 新增 admin 頁 `/admin/why-us-sections`（仿 testimonials pattern，含 `useConfirm()` 二次確認）
- 新增 API `/api/admin/why-us-sections`（POST 自動算 `order = max + 1`；排序沿用 services 的 swap-order pattern，無獨立 move endpoint）
- 卡片驗證集中在 `lib/why-us.ts` 的 `parseCards()`（discriminated union 回 `{ok, error}`，API + 前端共用）
- 首頁 `app/(site)/page.tsx` 改透過 `getWhyUsSections()` 從 DB 讀，迴圈渲染每組；`sections.length === 0` 不渲染空殼
- 移除 `app/admin/content/page.tsx` 的 `why-us` BlockEditor（避免雙頭管理）；seed 順手清孤兒 `ContentBlock(key="why-us")`
- Sidebar / `/admin/more` / `lib/i18n/admin-zh.ts` 同步加入「為何選我們」入口

**Scope 取捨**：`app/(site)/about/page.tsx` L80 也讀 `siteConfig.promises`（包裝成「三項職人信仰」），暫保留靜態。`lib/site-config.ts` 的 `promises` 因此不刪，但已標註不再驅動首頁。日後若 about 也要後台化，可加 `location` 欄位區分。

**ISR**：首頁 `revalidate = 60`，業主編輯後最多 60 秒首頁才反映，與 testimonials 行為一致，本次不引入 `revalidatePath`。

### 2026-05-12（首頁客戶評價拿掉 `.slice(0, 3)` 硬限制）

原本首頁 `Testimonials` 區塊存在「雙層砍」：

- `lib/queries.ts` 的 `getActiveTestimonials()` 已用 `take: 6` 限制取 6 筆
- 但 `app/(site)/page.tsx:271` 又 `testimonials.slice(0, 3)` 再砍到 3 筆

導致業主即使在後台 `/admin/testimonials` 新增第 4 筆評價（且 `isActive: true`），首頁也永遠看不到——必須把它 `order` 設成 0/1/2 之一才會「擠掉」現有的某一張上首頁。這對業主而言是**隱形行為**，沒有任何 UI 提示。

本次改動：

- 拿掉 `app/(site)/page.tsx:271` 的 `.slice(0, 3)`，改為 `testimonials.map(...)`
- `take: 6` 保留作為硬上限（防止業主累積到 30+ 筆時首頁變超長一片牆）
- 不動 grid（仍為 `md:grid-cols-3`）。4 / 5 筆會出現「3+1」「3+2」非滿格排版，這是刻意的視覺驅動——業主看到不齊就會去多收 2 筆評價，6 筆才會剛好滿一整面 3x2 grid

設計取捨：曾考慮 carousel（embla-carousel-react 已安裝），但 Neon 實測只有 4 筆評價，carousel 在這個量級上反而顯得內容稀薄（第 2 頁只有 1 張卡片）。等評價累積到 9 筆以上再考慮。

### 2026-05-11（服務詳情頁「為什麼這項服務重要？」標題納入 CMS）

原本 `app/(site)/services/[slug]/page.tsx` 第二區塊的標題是**硬編碼**：

```tsx
<SectionHeading eyebrow="Why this matters" title="為什麼這項服務重要？" />
```

導致後台無法針對個別服務調整這兩行文字（主文 `longDesc` 本身一直都可編輯）。本次改動：

- Prisma `Service` model 加 2 個 nullable 欄位：`whyEyebrow`、`whyTitle`（純 ADD COLUMN，不動現有資料）
- API `POST /api/admin/services` 與 `PUT /api/admin/services/[id]` 白名單擴充 2 欄位
- 後台 `/admin/services` 主編輯 modal 在「詳細描述」下方新增區塊「『為什麼這項服務重要？』區塊標題（選填）」，含兩個輸入框與預設值提示
- 前台改成 `service.whyEyebrow ?? 'Why this matters'` 與 `service.whyTitle ?? '為什麼這項服務重要？'`——**有填用填的，沒填用預設**，現有資料完全相容
- `lib/admin-types.ts` 的 `AdminService` 同步加 2 欄位
- 用 `??` 而非 `||`：API 已把空字串轉 `null`，只有 `null/undefined` 才該 fallback，避免日後資料邏輯變動時 fallback 被誤觸發

設計取捨：曾考慮做 `ServiceSection` 子表把所有 SectionHeading 標題全部 CMS 化（彈性最大），但服務頁區塊本質不同質（intro 有圖、why 有 features aside、works 是對比配對），統一 schema 會變成 EAV 反模式 + 高風險資料遷移。改採最小擴充。

### 2026-05-09（服務詳情頁故事區 + about CMS 完成接通）

每個服務的詳情頁 `/services/[slug]` 在 hero 下方新增「圖文並排故事區」（對齊 about 頁面結構），且**每個服務的故事獨立**（per-service 內容，不是全站共用）：

- Prisma `Service` model 加 6 個 nullable 欄位：`introEyebrow`、`introTitle`、`introParagraph1-3`、`introImage`
- 後台 `/admin/services` 主編輯 modal 新增「服務介紹」區塊，含 ImageUploader（上傳到 R2 `services-intro/` folder）
- 前台條件渲染：`introTitle || introImage` 任一存在才顯示故事區，`introTitle` 存在才顯示 SectionHeading，空段落自動過濾
- API `POST/PUT /api/admin/services/*` 加 6 欄位 spread

同時修補既有缺陷：`app/(site)/about/page.tsx` 之前是**全部硬寫**，後台 admin/content 編了沒效果。本次：

- about 頁改 `async function` + `getContentBlock('about')`
- 硬寫文案改為 fallback（DB 沒資料時顯示原本的）
- BlockEditor 擴展支援 `type: 'image'`，串現有 ImageUploader
- `BLOCK_DEFS.about` 加 `image` 欄位
- seed 補入 about ContentBlock（含圖片預設值）

R2 folder 慣例：服務介紹圖 `services-intro/`、about 故事區圖 `about/`、ContentBlock 通用圖 `content/`。

### 2026-05-09（填入 LINE 官方短網址）

`siteConfig.contact` 填上業主提供的 lin.ee 短網址：

- `lineFriendUrl` = `https://lin.ee/WuFCNig`（加賴諮詢／加好友）
- `lineCallUrl` = `https://lin.ee/cQe8Hhz`（賴通話／LINE 通話）

填入後既有 5 處 conditional render 的 LINE CTA 全部自動啟用（footer LINE@ 大按鈕、footer LINE 通話 outline 按鈕、FAB 綠色圓鈕、nav top bar 綠色圓鈕、nav menu drawer 諮詢 CTA）。

### 2026-05-09（手機 Navbar 加入 CTA 按鈕）

`components/site-nav.tsx` 行動裝置版（`md` 以下）兩處新增 CTA：

- **Top bar 永遠可見**：hamburger 旁邊新增紅色電話圓鈕 + 綠色 LINE 圓鈕（icon-only，36px，跟 hamburger 同層級）
- **Menu drawer 展開時**：nav links 下方加入 full-width 文字按鈕「立即來電預約」「立即加 LINE 諮詢」，搭配 icon 與箭頭

LINE icon 沿用 floating-cta 的 inline SVG knockout 風格（白底 + 綠 LINE 字）；目前在 nav 跟 FAB 都各自 inline 一份，未來第三次出現再抽共用元件（rule of three）。

### 2026-05-09（手機/平板浮動 CTA + Footer 外部連結 + LINE@ 按鈕視覺升級）

新增 `components/floating-cta.tsx` 浮動行動按鈕（FAB），掛在 `app/(site)/layout.tsx`：

- 紅色圓鈕 `#E53935`：直撥 `siteConfig.contact.phoneTel`
- 綠色圓鈕 `#06C755`：開 `siteConfig.contact.lineFriendUrl`（URL 為空就不渲染）
- 響應式：`lg:hidden`（≥1024px 桌機隱藏）
- 安全區：`bottom: calc(1rem + env(safe-area-inset-bottom))` 避開 iPhone home indicator
- 純 Server Component，零 client JS

⚠️ **斷點邊緣案例**：iPad Pro 12.9" 直立寬度為 1024px，剛好被 `lg:hidden` 蓋住。若需該尺寸顯示 FAB，把 `lg:hidden` 改為 `xl:hidden`（1280px 才隱藏）。



Footer 新增兩個外部連結區塊，皆採用「URL 為空字串就不渲染」的 conditional 模式（與既有 LINE 按鈕一致），確保未填值時前端不會出現死連結：

- **Proshake 媒合平台店家頁** — `siteConfig.partners.proshake.url`，顯示在「聯絡資訊」欄末端，外觀與 LINE 通話按鈕同層級
- **iOS App 下載** — `siteConfig.apps.ios`，顯示在品牌描述下方（左側大區塊），按鈕為深色 + Apple icon。Android 版未規劃，故無對應欄位

同時把「加 LINE 好友」按鈕從小膠囊樣式升級為大顆 CTA 按鈕（綠底 `#06C755` + 白色 LINE icon + 雙行文字「免費估價 / LINE@」），LINE icon 用 inline SVG（白色圓角矩形 + 內嵌綠色 "LINE" 字樣），不引入商標檔案。文案沿用「LINE@」（注意：LINE 已於 2019 年將 LINE@ 整併為「LINE 官方帳號」，台灣中小企業普遍仍習慣 LINE@ 稱呼）。`aria-label` 設為「免費估價，加 LINE 官方帳號」確保螢幕閱讀器讀出完整語意。

> ⚠️ **業主待辦**：到 `lib/site-config.ts` 補上兩個 URL：
> 1. `partners.proshake.url`：必須是 invisible care 在 Proshake 上的**店家頁**，**不是** `https://proshake.tw` 首頁，否則使用者點下去看不到自家服務
> 2. `apps.ios`：App Store 完整 URL（例如 `https://apps.apple.com/tw/app/...`）

未填 URL 時對應區塊不顯示；填上後 footer 自動出現。日後搬到 `SiteSetting` 後台管理時，這兩欄也能直接接 admin。

### 2026-05-05（第二批，後台 CMS）

- 新增 11 頁後台管理介面：登入、儀表板、服務 CRUD、服務子表編輯、對比圖配對管理、圖庫、詢問單列表 + 詳情、客戶評價、頁面內容、站台設定
- 新增 ~25 條 API 路由（全部沿用 drink `errorResponse/successResponse/checkAdminAuth` 三件套）
- 新增 `lib/auth.ts`（NextAuth + Credentials + bcryptjs，session 1h）、`lib/api-auth.ts`、`lib/r2.ts`、`middleware.ts`（保護 /admin/*）
- 新增 `prisma/seed.ts`：把 mock-data 內容寫入 DB，業主有預設資料可改
- 前台 6 個頁面從 mock-data 切到 Prisma server queries（`lib/queries.ts`）
- contact-form 串接公開 `/api/inquiries`，移除 600ms delay 模擬
- 新增 LocalBusiness + Service JSON-LD（`lib/seo.ts` + `components/json-ld.tsx`）
- 修正 drink AdminContent 的 ml-64/ml-16 不同步小 bug：sidebar 摺疊狀態提升到 React context
- 對比圖刪除時連帶清除 R2 上的圖檔，避免孤兒檔案

### 2026-05-05（第一批，並排對比改版）

- **並排對比改版**：依甲方需求把拖曳式 slider 改為傳統並排（左 Before / 右 After），元件改為 Server Component，整體前台 client JS 縮減
- **節奏調整**：`.section` 由 `py-24/32` 改為 `py-14/20`，搭配章節 heading 與內容間距 `mt-14 → mt-10`，整頁高度 ~30%
- **作品牆滿版單欄**：`grid-cols-2` 改為 `mx-auto max-w-4xl grid-cols-1`，每組對比圖完整呈現
- **Hero 換單張海報圖**：避免並排在 Hero 右半被壓縮成迷你尺寸
- 修正 4 張 Unsplash 404 ID

### 2026-04-30

- 初始化專案，沿用 `/Users/eric/Desktop/project/drink` 技術棧但全面調整為清潔產業需求
- 完成前台靜態原型（首頁、服務、實績、關於、預約、FAQ）
- 完成 SEO 基礎建設（sitemap.xml、robots.txt、generateMetadata）
- 完成 Prisma schema 設計（含 `BeforeAfterPair` 獨立 model）
