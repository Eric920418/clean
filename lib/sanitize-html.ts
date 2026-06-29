import sanitize from 'sanitize-html'

/**
 * 統一進入點：API 寫入 DB 前過濾 admin 富文本，移除 script / iframe / on* 屬性等危險內容。
 * 雙保險之一（另一保險是 components/rich-text.tsx 渲染時再 sanitize 一次，防 DB 直接被改）。
 *
 * 用 `sanitize-html`（純 JS、無 jsdom 依賴）— `isomorphic-dompurify` 在 Next.js server bundle 環境
 * 會試圖 read 不存在的 jsdom default-stylesheet.css，已棄用。
 *
 * - 非字串 / 空字串 / `<p></p>` → 回 null（保留欄位 nullable 語意）
 */

/**
 * style 屬性裡每個 CSS property 的允許值 regex。
 * 規則：禁止 `<` `>` `;`（HTML 注入字元、CSS 分隔符），其他寬鬆放行。
 * CKEditor 是受信任輸出源、不需要對 hex / rgb / 單位個別配 regex；只要擋掉 HTML 注入即可。
 */
const SAFE_STYLE_VALUE = /^[^<>;]+$/

/**
 * 允許保留在 `style` 屬性裡的 CSS property 白名單。
 * 對應 CKEditor 5 各 plugin 的輸出：
 *   - fontColor → color
 *   - fontBackgroundColor / highlight (fallback) → background-color
 *   - fontFamily → font-family
 *   - fontSize（supportAllValues: true）→ font-size
 *   - Alignment → text-align
 *   - Bold / Italic / Underline / Strikethrough fallback → font-weight / font-style / text-decoration
 *   - ImageResize → width / height
 *   - Table* → border / border-* / padding / margin / vertical-align / width / height / border-collapse
 * 沒列在這裡的 CSS property 會被 sanitize-html 清掉。
 */
const ALLOWED_STYLES_PER_TAG = {
  color: [SAFE_STYLE_VALUE],
  'background-color': [SAFE_STYLE_VALUE],
  background: [SAFE_STYLE_VALUE],
  'font-family': [SAFE_STYLE_VALUE],
  'font-size': [SAFE_STYLE_VALUE],
  'font-weight': [SAFE_STYLE_VALUE],
  'font-style': [SAFE_STYLE_VALUE],
  'text-align': [SAFE_STYLE_VALUE],
  'text-decoration': [SAFE_STYLE_VALUE],
  'text-indent': [SAFE_STYLE_VALUE],
  'line-height': [SAFE_STYLE_VALUE],
  'letter-spacing': [SAFE_STYLE_VALUE],
  width: [SAFE_STYLE_VALUE],
  height: [SAFE_STYLE_VALUE],
  border: [SAFE_STYLE_VALUE],
  'border-top': [SAFE_STYLE_VALUE],
  'border-right': [SAFE_STYLE_VALUE],
  'border-bottom': [SAFE_STYLE_VALUE],
  'border-left': [SAFE_STYLE_VALUE],
  'border-color': [SAFE_STYLE_VALUE],
  'border-style': [SAFE_STYLE_VALUE],
  'border-width': [SAFE_STYLE_VALUE],
  'border-radius': [SAFE_STYLE_VALUE],
  'border-collapse': [SAFE_STYLE_VALUE],
  padding: [SAFE_STYLE_VALUE],
  'padding-top': [SAFE_STYLE_VALUE],
  'padding-right': [SAFE_STYLE_VALUE],
  'padding-bottom': [SAFE_STYLE_VALUE],
  'padding-left': [SAFE_STYLE_VALUE],
  margin: [SAFE_STYLE_VALUE],
  'margin-top': [SAFE_STYLE_VALUE],
  'margin-right': [SAFE_STYLE_VALUE],
  'margin-bottom': [SAFE_STYLE_VALUE],
  'margin-left': [SAFE_STYLE_VALUE],
  'vertical-align': [SAFE_STYLE_VALUE],
  'text-transform': [SAFE_STYLE_VALUE],
  float: [SAFE_STYLE_VALUE],
  display: [SAFE_STYLE_VALUE],
}

/**
 * 把富文本 HTML 攤平成純文字（給 meta description、JSON-LD 的 Answer.text、列表摘要用）。
 * 去標籤 → 還原常見 entity → 收斂空白 →（可選）截斷加省略號。
 */
export function stripHtml(html: string | null | undefined, maxLen?: number): string {
  if (!html) return ''
  let text = html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;|&#160;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
  if (maxLen && text.length > maxLen) {
    text = text.slice(0, maxLen).trimEnd() + '…'
  }
  return text
}

type SanitizeOpts = {
  /**
   * 富文本內允許的最高標題層級。
   *   - 3（預設）：內文嵌在頁面 H1／區塊 H2 之下，h4–h6 一律降為 h3（站台通用內文）。
   *   - 4：內容自成一頁、頁面 H1 由標題本身擔任（如 /faq/[slug] 的問題），答案可用到 h4。
   * 無論哪種，h1 恆降為 h2（不產生第二個 H1）。
   */
  maxHeading?: 3 | 4
}

export function sanitizeRichText(input: unknown, opts: SanitizeOpts = {}): string | null {
  if (typeof input !== 'string') return null
  const trimmed = input.trim()
  if (trimmed === '' || trimmed === '<p></p>' || trimmed === '<p><br></p>') return null
  const maxHeading = opts.maxHeading ?? 3
  // SEO 標題階級收口：h1 永遠降為 h2；超過 maxHeading 的層級壓到 maxHeading。
  const floor = `h${maxHeading}` // maxHeading=3 → 'h3'；maxHeading=4 → 'h4'
  const headingTransforms: Record<string, ReturnType<typeof sanitize.simpleTransform>> = {
    h1: sanitize.simpleTransform('h2', {}),
    h5: sanitize.simpleTransform(floor, {}),
    h6: sanitize.simpleTransform(floor, {}),
  }
  if (maxHeading === 3) headingTransforms.h4 = sanitize.simpleTransform('h3', {})
  const cleaned = sanitize(input, {
    allowedTags: [
      ...sanitize.defaults.allowedTags,
      'h1',
      'h2',
      'img',
      'figure',
      'figcaption',
      'u',
      'ins',
      'del',
      's',
      'sup',
      'sub',
      'mark',
    ],
    allowedAttributes: {
      ...sanitize.defaults.allowedAttributes,
      a: ['href', 'name', 'target', 'rel', 'download'],
      img: ['src', 'alt', 'title', 'width', 'height', 'class', 'srcset'],
      '*': ['class', 'style'],
    },
    allowedStyles: {
      '*': ALLOWED_STYLES_PER_TAG,
    },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    transformTags: {
      // 外部連結加 rel="noopener noreferrer"
      a: sanitize.simpleTransform('a', { rel: 'noopener noreferrer' }, true),
      // SEO 標題階級收口（依 maxHeading 動態決定，涵蓋現有與未來的 DB 內容）。
      ...headingTransforms,
    },
  })

  // 移除「空標題」：業主在富文本按 Enter 留下的空白標題行（<h3></h3>、<h2>&nbsp;</h2>、<h3><br></h3>）。
  // SEO 工具（如 SEO META in 1 Click）會標記為 empty heading。含 <img> 的標題保留（不視為空）。
  return cleaned.replace(/<(h[1-6])\b[^>]*>([\s\S]*?)<\/\1>/gi, (m, _tag, inner) => {
    if (/<img/i.test(inner)) return m
    const textOnly = inner.replace(/<[^>]*>/g, '').replace(/&nbsp;|&#160;| /g, '').trim()
    return textOnly === '' ? '' : m
  })
}
