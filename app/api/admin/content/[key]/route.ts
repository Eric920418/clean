import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkAdminAuth, errorResponse, successResponse } from '@/lib/api-auth'
import { deleteImageFromR2 } from '@/lib/r2'

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
    const { payload } = await request.json()
    // 先讀舊 payload 做 compare-and-delete（清 R2 孤兒檔）
    const existing = await prisma.contentBlock.findUnique({ where: { key } })
    const item = await prisma.contentBlock.upsert({
      where: { key },
      create: { key, payload: payload ?? {} },
      update: { payload: payload ?? {} },
    })

    // 遍歷舊 payload，任一 string 欄位值改變就 fire-and-forget 清舊 URL
    // deleteImageFromR2 的 guard 會跳過非 R2 URL（如 unsplash），所以可放心對所有字串欄位呼叫
    if (existing?.payload && typeof existing.payload === 'object') {
      const oldPayload = existing.payload as Record<string, unknown>
      const newPayload = (payload ?? {}) as Record<string, unknown>
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

    return successResponse(item)
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : '儲存失敗')
  }
}
