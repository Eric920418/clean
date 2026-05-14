import { pinyin } from 'pinyin-pro'

export function slugify(name: string): string {
  const pinyinStr = pinyin(name, {
    toneType: 'none',
    type: 'array',
    nonZh: 'consecutive',
  }).join('-')

  return (
    pinyinStr
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'service'
  )
}

export function uniqueSlug(base: string, existing: Set<string>): string {
  if (!existing.has(base)) return base
  let i = 2
  while (existing.has(`${base}-${i}`)) i++
  return `${base}-${i}`
}
