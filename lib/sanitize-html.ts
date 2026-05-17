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

export function sanitizeRichText(input: unknown): string | null {
  if (typeof input !== 'string') return null
  const trimmed = input.trim()
  if (trimmed === '' || trimmed === '<p></p>' || trimmed === '<p><br></p>') return null
  return sanitize(input, {
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
    },
  })
}
