export type Reorderable = { id: number; order: number }

/**
 * 互換相鄰兩筆位置：按 sorted 結果找鄰居，把「新 index」寫回兩筆 order。
 * 與舊版「互換 order 數字」不同 — 當兩筆 order 相同時舊版完全失效（互換相同數字 = 沒動），本實作仍正確。
 *
 * @returns true 已成功提交變動；false 已在邊界（無動作）
 * @throws  任一 PUT 非 2xx（caller 自行 toast）
 */
export async function swapOrderByIndex(
  items: Reorderable[],
  currentId: number,
  dir: 'up' | 'down',
  putUrl: (id: number) => string,
): Promise<boolean> {
  const sorted = [...items].sort((a, b) => a.order - b.order || a.id - b.id)
  const idx = sorted.findIndex((s) => s.id === currentId)
  if (idx < 0) throw new Error(`找不到 id=${currentId}`)
  const swapIdx = dir === 'up' ? idx - 1 : idx + 1
  if (swapIdx < 0 || swapIdx >= sorted.length) return false

  const a = sorted[idx]
  const b = sorted[swapIdx]
  const responses = await Promise.all([
    fetch(putUrl(a.id), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order: swapIdx }),
    }),
    fetch(putUrl(b.id), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order: idx }),
    }),
  ])
  for (const r of responses) {
    if (!r.ok) {
      const data = await r.json().catch(() => ({}))
      throw new Error(data.error || `${r.status} ${r.statusText}`)
    }
  }
  return true
}

/**
 * 計算新增項目的 order 預設值：max(order)+1，空陣列回 0。
 * 避免「永遠預設 0」造成 order 碰撞、排序失效。
 */
export function nextOrder(items: Reorderable[]): number {
  if (items.length === 0) return 0
  return Math.max(...items.map((i) => i.order)) + 1
}
