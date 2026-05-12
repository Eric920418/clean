// 首頁「為何選我們」共用型別 + 驗證
// cards 永遠固定 3 張：每張只有 title / desc

export type WhyUsCard = { title: string; desc: string }

export const WHY_US_CARD_COUNT = 3

export function emptyCards(): WhyUsCard[] {
  return Array.from({ length: WHY_US_CARD_COUNT }, () => ({ title: '', desc: '' }))
}

// 對外驗證：成功回 { ok: true, cards }，失敗回 { ok: false, error }
// 錯誤訊息設計成可以直接顯示給使用者（依用戶全域規則「所有錯誤完整顯示在前端」）
export function parseCards(
  raw: unknown,
): { ok: true; cards: WhyUsCard[] } | { ok: false; error: string } {
  if (!Array.isArray(raw)) {
    return { ok: false, error: '卡片資料格式錯誤（必須為陣列）' }
  }
  if (raw.length !== WHY_US_CARD_COUNT) {
    return { ok: false, error: `卡片必須恰好 ${WHY_US_CARD_COUNT} 張，目前收到 ${raw.length} 張` }
  }
  const cards: WhyUsCard[] = []
  for (let i = 0; i < raw.length; i++) {
    const c = raw[i] as Record<string, unknown> | null | undefined
    if (!c || typeof c !== 'object') {
      return { ok: false, error: `第 ${i + 1} 張卡片格式錯誤` }
    }
    const title = typeof c.title === 'string' ? c.title.trim() : ''
    const desc = typeof c.desc === 'string' ? c.desc.trim() : ''
    if (!title) return { ok: false, error: `第 ${i + 1} 張卡片：標題必填` }
    if (!desc) return { ok: false, error: `第 ${i + 1} 張卡片：描述必填` }
    if (title.length > 50) return { ok: false, error: `第 ${i + 1} 張卡片標題過長（>50 字）` }
    if (desc.length > 300) return { ok: false, error: `第 ${i + 1} 張卡片描述過長（>300 字）` }
    cards.push({ title, desc })
  }
  return { ok: true, cards }
}
