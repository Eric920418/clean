'use client'

import { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { AdminPageHeader } from '@/components/admin/admin-page-header'
import { PageSectionsManager } from './_components/PageSectionsManager'
import { ContentBlockModal } from './_components/ContentBlockModal'
import { BLOCK_DEFS, OTHER_GROUPS } from './_components/content-block-defs'

export default function ContentAdminPage() {
  // 當前正在編輯的 ContentBlock key — null 表示沒開 modal
  // 統一進出口：home/about 的 fixed section 編輯、其他頁面文案編輯都走這個
  const [editingBlockKey, setEditingBlockKey] = useState<string | null>(null)

  return (
    <>
      <AdminPageHeader
        title="頁面內容"
        description="編輯網站所有頁面的標題、副標、按鈕文字（動態資料如服務、評價、流程在各自的管理頁）"
      />

      <section className="mb-10">
        <h2 className="text-base font-semibold text-ink">首頁・區塊排序</h2>
        <p className="mt-1 mb-4 text-xs text-ink-muted">
          固定區塊（🔒 Hero / 服務 / 為何選我們 / 對比作品 / 流程 / 評價 / CTA）+ 動態區塊可互相換順序；固定區塊只能排序與隱藏、不能刪。文案編輯走右側 ✏️
        </p>
        <PageSectionsManager page="home" onEditFixed={setEditingBlockKey} />
      </section>

      <section className="mb-10">
        <h2 className="text-base font-semibold text-ink">關於我們・區塊排序</h2>
        <p className="mt-1 mb-4 text-xs text-ink-muted">
          固定區塊（🔒 Hero / 故事 / 信念 / CTA）+ 動態區塊可互相換順序
        </p>
        <PageSectionsManager page="about" onEditFixed={setEditingBlockKey} />
      </section>

      <section>
        <h2 className="text-base font-semibold text-ink">其他頁面文案</h2>
        <p className="mt-1 mb-4 text-xs text-ink-muted">
          預約諮詢 / 常見問題 / 服務列表 / 服務案例 / 全站導覽 / Footer 的標題、副標、按鈕文字
        </p>
        <div className="space-y-3">
          {OTHER_GROUPS.map((g) => {
            const keys = Object.keys(BLOCK_DEFS).filter((k) => BLOCK_DEFS[k].group === g.key)
            if (keys.length === 0) return null
            return (
              <div key={g.key} className="rounded-xl border border-hairline bg-white overflow-hidden">
                <div className="px-4 py-3 sm:px-5 sm:py-4 border-b border-hairline-soft bg-bg-soft/40">
                  <h3 className="text-base font-semibold text-ink">{g.label}</h3>
                </div>
                <ul className="divide-y divide-hairline-soft">
                  {keys.map((key) => {
                    const def = BLOCK_DEFS[key]
                    return (
                      <li key={key}>
                        <button
                          type="button"
                          onClick={() => setEditingBlockKey(key)}
                          className="w-full flex items-center justify-between gap-3 p-4 sm:p-5 hover:bg-bg-soft/60 transition text-left"
                        >
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-ink truncate">
                              {def.title}
                            </div>
                            <p className="text-xs text-ink-muted mt-0.5 truncate">
                              {def.description}
                            </p>
                          </div>
                          <ChevronRight className="h-5 w-5 text-ink-soft shrink-0" />
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )
          })}
        </div>
      </section>

      <ContentBlockModal
        key={editingBlockKey ?? 'closed'}
        open={!!editingBlockKey}
        blockKey={editingBlockKey}
        onClose={() => setEditingBlockKey(null)}
      />
    </>
  )
}
