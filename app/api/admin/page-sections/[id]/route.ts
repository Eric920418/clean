import { NextRequest } from 'next/server'
import { revalidatePath } from 'next/cache'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { checkAdminAuth, errorResponse, successResponse } from '@/lib/api-auth'
import { sanitizeRichText } from '@/lib/sanitize-html'
import { deleteImageFromR2 } from '@/lib/r2'
import { isFixedType, type PageSectionPage } from '@/lib/admin-types'

// 對應 page-sections 的富文本 / 圖片欄位（依 type 不同）
const RICH_TEXT_CONFIG_KEYS = ['body', 'description', 'html'] as const
const IMAGE_CONFIG_KEYS = ['image', 'backgroundImage'] as const

type RouteParams = { params: Promise<{ id: string }> }

function pagePath(page: string): string {
  return page === 'home' ? '/' : `/${page}`
}

// PUT /api/admin/page-sections/[id] — 偏更新（order / isVisible / config）
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const auth = await checkAdminAuth()
  if (!auth.authorized) return auth.response

  try {
    const sectionId = parseInt(id, 10)
    const body = await request.json()
    const existing = await prisma.pageSection.findUnique({ where: { id: sectionId } })
    if (!existing) return errorResponse('找不到該區塊', 404)

    const data: Record<string, unknown> = {}

    if (body.order !== undefined) {
      data.order = typeof body.order === 'number' ? body.order : parseInt(String(body.order), 10)
    }
    if (body.isVisible !== undefined) {
      data.isVisible = Boolean(body.isVisible)
    }

    let staleImageUrls: string[] = []
    if (body.config !== undefined) {
      if (typeof body.config !== 'object' || body.config === null || Array.isArray(body.config)) {
        return errorResponse('config 必須是 object', 400)
      }
      const cfg = { ...(body.config as Record<string, unknown>) }
      // sanitize 富文本欄位
      for (const key of RICH_TEXT_CONFIG_KEYS) {
        if (cfg[key] !== undefined) {
          cfg[key] = cfg[key] === null || cfg[key] === '' ? null : sanitizeRichText(cfg[key])
        }
      }
      // 收集舊圖片 URL（換圖時 fire-and-forget 清掉 R2 孤兒檔）
      const oldConfig = (existing.config ?? {}) as Record<string, unknown>
      for (const key of IMAGE_CONFIG_KEYS) {
        const oldVal = oldConfig[key]
        const newVal = cfg[key]
        if (typeof oldVal === 'string' && oldVal && oldVal !== newVal) {
          staleImageUrls.push(oldVal)
        }
      }
      data.config = cfg as Prisma.InputJsonValue
    }

    const section = await prisma.pageSection.update({
      where: { id: sectionId },
      data,
    })

    if (staleImageUrls.length > 0) {
      Promise.all(staleImageUrls.map((url) => deleteImageFromR2(url))).catch((e) =>
        console.warn('R2 stale cleanup (page-section):', e),
      )
    }

    revalidatePath(pagePath(existing.page))
    return successResponse(section)
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : '更新失敗')
  }
}

// DELETE /api/admin/page-sections/[id]
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const auth = await checkAdminAuth()
  if (!auth.authorized) return auth.response

  try {
    const sectionId = parseInt(id, 10)
    const existing = await prisma.pageSection.findUnique({ where: { id: sectionId } })
    if (!existing) return errorResponse('找不到該區塊', 404)

    // 固定區塊不能刪 — 業主只能排序或隱藏
    if (isFixedType(existing.page as PageSectionPage, existing.type)) {
      return errorResponse('固定區塊不能刪除，請改用「隱藏」', 400)
    }

    // 刪除前收集 R2 圖片做 fire-and-forget 清理
    const cfg = (existing.config ?? {}) as Record<string, unknown>
    const imageUrls = IMAGE_CONFIG_KEYS.map((k) => cfg[k]).filter(
      (v): v is string => typeof v === 'string' && v.length > 0,
    )

    await prisma.pageSection.delete({ where: { id: sectionId } })

    if (imageUrls.length > 0) {
      Promise.all(imageUrls.map((url) => deleteImageFromR2(url))).catch((e) =>
        console.warn('R2 stale cleanup (page-section delete):', e),
      )
    }

    revalidatePath(pagePath(existing.page))
    return successResponse({ message: '已刪除' })
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : '刪除失敗')
  }
}
