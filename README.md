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
| Before/After 並排對比元件（純 Server Component） | ✅ 已完成 |
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
| 認證 | NextAuth 4 + Credentials + bcryptjs |
| UI | Tailwind CSS 4（CSS-first config）+ Radix UI primitives |
| 動畫 / 互動 | Motion 11（Framer Motion 後繼）+ Embla Carousel（保留） |
| 圖床 | Cloudflare R2（S3 SDK） |
| 通知 | Sonner toast |
| 套件管理 | **pnpm（強制）** |
| 字體 | Noto Sans TC + Inter（next/font/google） |

---

## 後台路由速覽（Admin CMS）

| 路由 | 用途 |
|---|---|
| `/admin/login` | 登入頁（首次用 `.env` 中的 ADMIN_USERNAME/PASSWORD，自動 bcrypt 寫入 DB） |
| `/admin/dashboard` | 首頁：QuickActions 兩個大按鈕 + 4 張統計卡 + 最近 5 筆詢問 |
| `/admin/services` | 六大服務 CRUD（modal 編輯主欄位、排序、上下架、刪除） |
| `/admin/services/[id]/edit` | 服務子表（特色 / FAQ inline 編輯） |
| `/admin/services/[id]/before-afters` | ⭐ 清潔前後照片管理（每組 modal 上傳） |
| `/admin/services/[id]/gallery` | 服務圖庫批量上傳 |
| `/admin/inquiries` | 客人問問題列表（手機卡片、桌機表格、狀態 chip 篩選） |
| `/admin/inquiries/[id]` | 詢問單詳情（狀態切換） |
| `/admin/testimonials` | 客人的好話 CRUD |
| `/admin/why-us-sections` | ⭐ 首頁「為何選我們」+ 關於頁「三項職人信仰」多區塊 CRUD（依 location 區分） |
| `/admin/process-steps` | ⭐ 首頁「服務流程」步驟 CRUD（標準 4 步，可增減） |
| `/admin/general-faqs` | ⭐ `/faq` 頁「一般問題」CRUD（非特定服務的常見問題） |
| `/admin/content` | 首頁文字（進階，已不含 why-us，那組改由 `/admin/why-us-sections` 管理） |
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
| 中文措辭 | **口語化字典**（「詢問單」→「客人問問題」、enum 加 emoji） | `lib/i18n/admin-zh.ts` 單一來源 |
| 導覽 | **手機底部 4 tab + 桌機 sidebar**（永遠顯示文字標籤、不再純 icon） | `components/admin/mobile-tab-bar.tsx`、`sidebar.tsx` |
| Mobile-first | 卡片版面取代密集表格、`tel:` 直接撥號、`env(safe-area-inset-bottom)` 避讓 home indicator | `app/admin/inquiries/page.tsx` 等 |

**修改任何後台文字／enum 顯示，請從 `lib/i18n/admin-zh.ts` 改起，不要散落在各頁面。**

## API 路由

```
# 公開
POST   /api/auth/[...nextauth]              認證
POST   /api/inquiries                       前台預約諮詢提交（公開）

# 受保護（需要 admin session）
POST   /api/admin/upload                    R2 圖片上傳

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
│   ├── works/page.tsx              清潔實績（前後對比集合 + 分類篩選）
│   ├── about/page.tsx              關於我們
│   ├── contact/page.tsx            預約諮詢
│   ├── faq/page.tsx                常見問題
│   ├── sitemap.ts                  動態 sitemap.xml
│   ├── robots.ts                   robots.txt（封鎖 /admin 與 /api）
│   └── globals.css                 設計系統 CSS（純淨醫療感）
│
├── components/
│   ├── before-after-pair.tsx      🎯 並排對比元件（左 Before / 右 After，純 Server Component）
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
DATABASE_URL="postgresql://user:password@host/db?sslmode=require"

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
  slug         String  @unique          // SEO 友善：aircon-cleaning, water-tank-cleaning, ...
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

model BookingInquiry {                   // 取代 ContactMessage
  serviceIds Int[]                      // 客戶可多選想諮詢的服務
  status     InquiryStatus              // NEW / CONTACTED / QUOTED / DONE / CLOSED
}

model WhyUsSection {                     // 首頁/關於頁 WhyUs 多區塊
  location    String                    // "home" 首頁、"about" 關於頁
  eyebrow     String?
  title       String                    // 例：「三項堅持，讓家人安心」
  description String?
  cards       Json                      // 固定 3 張：[{title, desc}, {title, desc}, {title, desc}]
  order       Int                       // 上下排序（兩筆 swap PUT 完成）
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
| `/works` | 清潔實績（全部對比圖 + 分類篩選） |
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
| `/admin/services/[id]/before-afters` | ⭐ 對比圖批量上傳與配對 |
| `/admin/services/[id]/gallery` | 服務圖庫 |
| `/admin/inquiries` | 詢問單列表（NEW → CONTACTED → QUOTED → DONE） |
| `/admin/content` | 首頁區塊內容（ContentBlock） |
| `/admin/settings` | 站台設定 |

---

## Before/After 對比元件

`components/before-after-pair.tsx` 採傳統並排式（甲方指定）：

- **桌面**：左 Before、右 After，兩張圖等寬並排，各自帶清楚標籤
- **手機**：自動上下堆疊（CSS grid `grid-cols-1 md:grid-cols-2`）
- **零 client JS**：純 Server Component，無 useState、無事件處理，每組 pair 不增加 bundle
- **效能**：`next/image` + 鎖定 aspect-ratio 避免 CLS，預設 `4/3`
- **微互動**：hover 時兩張圖一同放大 2%（`group-hover:scale-[1.02]`），保留品味但不喧賓奪主
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

## 開發守則（CLAUDE.md 全域強制）

1. **只用 pnpm** — 不可使用 npm / yarn 安裝套件
2. **錯誤完整顯示在前端** — 任何 API 錯誤都要 toast 並 inline 顯示完整訊息，不可吞錯誤
3. **永遠只有一份文檔** — 所有說明都寫進 README.md，不新建其他 .md 文件
4. **禁用 `--accept-data-loss`** — Prisma 推 schema 時若會刪資料，必須先備份再手動處理
5. **不要亂覆蓋資料庫** — 開發階段只用 `db:push`，正式環境用 migrate

---

## 部署（Vercel + Neon + R2）

1. **Neon**：建立新的 PostgreSQL 專案（不要與 drink 共用），複製 connection string
2. **Cloudflare R2**：建立新 bucket `invisible-care`，啟用 public 子網域，產生 API token
3. **Vercel**：連結 GitHub repo
4. 在 Vercel 專案設定中填入所有 `.env.example` 列出的環境變數
5. 推送到 main 觸發部署，build 流程：`prisma generate && next build`
6. 第一次部署完成後，造訪 `/admin/login`（待後台實作完成後）

---

## 已知限制

- 部分 mock 圖片仍用 Unsplash，實機部署後業主透過 `/admin/services/[id]/before-afters` 與 `/gallery` 上傳真實照片，會自動存到 Cloudflare R2 並覆蓋顯示
- Before/After 並排元件在 iOS Safari 14 以下未測試（目標瀏覽器為 iOS 16+ / Chrome 110+）
- 後台無多管理員 / 角色權限；單一 admin 帳號（drink 模式）
- 後台無操作 audit log
- 後台無草稿 / 排程發布（直接 `isActive` 切換）
- 對比圖採「一次新增一組 modal」UX；未做拖拉批次上傳

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
