/**
 * 把服務名稱轉成 URL slug。
 *
 * 規則：
 *   - 保留中文（CJK Han script）原樣
 *   - 保留 ASCII alphanumeric、轉小寫
 *   - 空白序列 → 單個 hyphen
 *   - 其他符號（標點、控制字元、emoji、全形符號等）整個剝掉
 *   - 折疊連續 hyphen、去頭尾 hyphen
 *   - 截到 60 字（DB index 友善）
 *   - 全空 fallback 'service'
 *
 * 之所以保留中文：Next.js dynamic route 原生吃 Unicode、現代瀏覽器地址欄顯示可讀中文，
 * 對中文 SEO 有正向加分。trade-off 是 URL 複製貼到 Email / log 時會 percent-encode
 * 變 `/services/%E5%86%B7...`（仍可點），業主自行接受。
 *
 * 既有 8 筆 services 的 slug 是這個 function 的舊版本（pinyin-pro → 拼音 kebab-case）
 * 產生的，這次改寫不會影響它們（API PUT 才能改 slug、create 也只對新服務套用此規則）。
 */
export function slugify(name: string): string {
  const cleaned = name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\p{Script=Han}a-z0-9-]/gu, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
  return cleaned || 'service'
}

export function uniqueSlug(base: string, existing: Set<string>): string {
  if (!existing.has(base)) return base
  let i = 2
  while (existing.has(`${base}-${i}`)) i++
  return `${base}-${i}`
}
