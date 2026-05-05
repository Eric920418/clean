# invisible care · 居家健康守護 CMS

> 看不見的守護，才是家最頂級的豪華。
>
> 整合防霾紗網、全戶濾水、水塔清洗、冷氣與洗衣機深度拆洗、精緻居家清潔六大專業服務，由內而外為您守護家的純淨與健康。

本專案是 invisible care 的官網與內容管理系統（CMS）。本 README 是專案唯一的事實來源，所有環境變數、開發指令、部署流程、資料模型說明都在這份文件裡。

---

## 目前狀態

| 項目 | 狀態 |
|---|---|
| 前台靜態原型（首頁 / 六大服務 / 服務詳情 / 作品集 / 關於 / 預約 / FAQ） | ✅ 已完成，可瀏覽 |
| Before/After 並排對比元件（傳統並排，純 Server Component） | ✅ 已完成 |
| 設計系統（純淨醫療感配色） | ✅ 已完成 |
| Prisma schema（六大 model + 對比圖獨立 model） | ✅ 已完成 |
| 預約諮詢表單 UI（含 toast、錯誤顯示） | ✅ 已完成（前端） |
| sitemap.xml / robots.txt / generateMetadata | ✅ 已完成 |
| 後台 CRUD（services / before-afters / inquiries / settings） | ⏳ 待開發 |
| NextAuth 登入 / R2 圖片上傳 / 串接真實 DB | ⏳ 待開發 |
| LocalBusiness JSON-LD | ⏳ 待開發 |

下一階段：用戶 review 前台視覺定版後，啟動後台 CRUD 與 R2 圖片上傳。

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
│   ├── site-config.ts              品牌靜態資訊（電話、Line、三大堅持、流程）
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

- 目前所有資料來自 `lib/mock-data.ts`，並未實際連線資料庫
- 圖片暫用 Unsplash 公開圖，部分 ID 已失效顯示為破圖（生產環境會用 R2 上傳真實照片取代）
- Before/After 並排元件在 iOS Safari 14 以下未測試（目標瀏覽器為 iOS 16+ / Chrome 110+）
- 預約諮詢表單目前模擬送出（600ms delay），尚未串接 `/api/inquiries`

---

## 變更記錄

### 2026-05-05

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
