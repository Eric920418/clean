import { NextRequest } from 'next/server'
import { revalidatePath } from 'next/cache'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { checkAdminAuth, errorResponse, successResponse } from '@/lib/api-auth'
import { deleteImageFromR2 } from '@/lib/r2'
import { sanitizeRichText } from '@/lib/sanitize-html'

type RouteParams = { params: Promise<{ key: string }> }

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { key } = await params
  const auth = await checkAdminAuth()
  if (!auth.authorized) return auth.response
  try {
    const item = await prisma.contentBlock.findUnique({ where: { key } })
    return successResponse(item)
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : '獲取失敗')
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { key } = await params
  const auth = await checkAdminAuth()
  if (!auth.authorized) return auth.response

  try {
    const { payload, richTextKeys } = await request.json()
    // 對前端標記為 richtext 的 key 做 sanitize；其他純 text/image URL 不動
    const cleanPayload: Record<string, unknown> = { ...(payload ?? {}) }
    if (Array.isArray(richTextKeys)) {
      for (const k of richTextKeys) {
        if (typeof k === 'string' && k in cleanPayload) {
          cleanPayload[k] = sanitizeRichText(cleanPayload[k]) ?? ''
        }
      }
    }
    // 先讀舊 payload 做 compare-and-delete（清 R2 孤兒檔）
    const existing = await prisma.contentBlock.findUnique({ where: { key } })
    const payloadForDb = cleanPayload as Prisma.InputJsonValue
    const item = await prisma.contentBlock.upsert({
      where: { key },
      create: { key, payload: payloadForDb },
      update: { payload: payloadForDb },
    })

    // 遍歷舊 payload，任一 string 欄位值改變就 fire-and-forget 清舊 URL
    // deleteImageFromR2 的 guard 會跳過非 R2 URL（如 unsplash），所以可放心對所有字串欄位呼叫
    if (existing?.payload && typeof existing.payload === 'object') {
      const oldPayload = existing.payload as Record<string, unknown>
      const newPayload = cleanPayload
      const stale: string[] = []
      Object.keys(oldPayload).forEach((k) => {
        const oldVal = oldPayload[k]
        const newVal = newPayload[k]
        if (typeof oldVal === 'string' && oldVal && oldVal !== newVal) {
          stale.push(oldVal)
        }
      })
      if (stale.length > 0) {
        Promise.all(stale.map((url) => deleteImageFromR2(url))).catch((e) =>
          console.warn('R2 stale cleanup (content):', e),
        )
      }
    }

    // ContentBlock 跨多個前台頁面使用（hero-home、nav、cta 等），全部 revalidate
    revalidatePath('/')
    revalidatePath('/about')
    revalidatePath('/contact')
    revalidatePath('/faq')
    revalidatePath('/services')
    revalidatePath('/works')

    return successResponse(item)
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : '儲存失敗')
  }
}
