import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkAdminAuth, errorResponse, successResponse } from '@/lib/api-auth'
import { deleteImageFromR2 } from '@/lib/r2'

type RouteParams = { params: Promise<{ id: string; bid: string }> }

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { bid } = await params
  const auth = await checkAdminAuth()
  if (!auth.authorized) return auth.response

  try {
    const body = await request.json()
    // 先讀舊資料，等下 update 後比對是否需清 R2 舊圖
    const before = await prisma.beforeAfterPair.findUnique({
      where: { id: parseInt(bid) },
      select: { beforeUrl: true, afterUrl: true },
    })

    const item = await prisma.beforeAfterPair.update({
      where: { id: parseInt(bid) },
      data: {
        ...(body.beforeUrl !== undefined && { beforeUrl: body.beforeUrl }),
        ...(body.afterUrl !== undefined && { afterUrl: body.afterUrl }),
        ...(body.caption !== undefined && { caption: body.caption || null }),
        ...(body.location !== undefined && { location: body.location || null }),
        ...(body.takenAt !== undefined && {
          takenAt: body.takenAt ? new Date(body.takenAt) : null,
        }),
        ...(body.isFeatured !== undefined && { isFeatured: body.isFeatured }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
        ...(body.order !== undefined && { order: body.order }),
      },
    })

    // 圖片 URL 有改變就 fire-and-forget 清舊 R2 物件（非 R2 URL 會被 guard 跳過）
    if (before) {
      const stale: string[] = []
      if (before.beforeUrl && before.beforeUrl !== item.beforeUrl) stale.push(before.beforeUrl)
      if (before.afterUrl && before.afterUrl !== item.afterUrl) stale.push(before.afterUrl)
      if (stale.length > 0) {
        Promise.all(stale.map((url) => deleteImageFromR2(url))).catch((e) =>
          console.warn('R2 stale cleanup:', e),
        )
      }
    }

    return successResponse(item)
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : '更新失敗')
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { bid } = await params
  const auth = await checkAdminAuth()
  if (!auth.authorized) return auth.response

  try {
    const item = await prisma.beforeAfterPair.findUnique({
      where: { id: parseInt(bid) },
    })

    if (!item) return errorResponse('對比圖不存在', 404)

    // 順手把 R2 上的兩張圖也刪掉（失敗不阻塞 DB 刪除）
    Promise.all([
      deleteImageFromR2(item.beforeUrl),
      deleteImageFromR2(item.afterUrl),
    ]).catch((e) => console.warn('R2 cleanup warning:', e))

    await prisma.beforeAfterPair.delete({ where: { id: parseInt(bid) } })
    return successResponse({ message: '已刪除' })
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : '刪除失敗')
  }
}
