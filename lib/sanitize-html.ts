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
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    transformTags: {
      // 外部連結加 rel="noopener noreferrer"
      a: sanitize.simpleTransform('a', { rel: 'noopener noreferrer' }, true),
    },
  })
}
