export type Reorderable = { id: number; order: number }

/**
 * 互換相鄰兩筆位置，並 rebalance 整個 list 為連續 order 0..N-1。
 *
 * 為什麼要 rebalance（2026-05-18 修）：
 * 舊版「把對方在 sorted array 的 index 寫回我的 order」演算法只在 order 連續 0,1,2,...
 * 時才等價於「swap 兩個 order 值」。但我們的 PageSection 有 fixed (1-7) + dynamic (101+)
 * 的 order gap，互換時會產生 duplicate order（例如 A=1 跟 C=101 互換 → A=1 不變、C=1，跟 A 衝突）。
 *
 * 新策略：先在 sorted array 互換兩個位置，然後把全 list rebalance 成 0..N-1，只 PUT 有變動的。
 * - 結果保證 order 連續、無 duplicate
 * - 多數情況只 update 2-3 個 items（被 swap 那兩個 + order gap 跨越區的鄰居）
 *
 * caller 傳的 items 必須是同個排序空間（例如 PageSectionsManager 傳該 page 的 sections）— 否則
 * rebalance 會把不同空間的 order 攪混。
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

  // 互換 sorted 內兩位置產生新順序
  const next = sorted.slice()
  ;[next[idx], next[swapIdx]] = [next[swapIdx], next[idx]]

  // Rebalance 為 0..N-1，只 PUT order 真的改變的
  const updates = next
    .map((item, newOrder) => ({ item, newOrder }))
    .filter(({ item, newOrder }) => item.order !== newOrder)

  const responses = await Promise.all(
    updates.map(({ item, newOrder }) =>
      fetch(putUrl(item.id), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: newOrder }),
      }),
    ),
  )
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
