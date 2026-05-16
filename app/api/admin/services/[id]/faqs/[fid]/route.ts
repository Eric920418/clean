import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkAdminAuth, errorResponse, successResponse } from '@/lib/api-auth'
import { revalidateService } from '@/lib/revalidate-service'
import { sanitizeRichText } from '@/lib/sanitize-html'

type RouteParams = { params: Promise<{ id: string; fid: string }> }

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id, fid } = await params
  const auth = await checkAdminAuth()
  if (!auth.authorized) return auth.response

  try {
    const body = await request.json()
    const item = await prisma.serviceFaq.update({
      where: { id: parseInt(fid) },
      data: {
        ...(body.question !== undefined && { question: body.question }),
        ...(body.answer !== undefined && {
          answer: (() => {
            const c = sanitizeRichText(body.answer)
            if (!c) throw new Error('答案為必填')
            return c
          })(),
        }),
        ...(body.order !== undefined && { order: body.order }),
      },
    })
    await revalidateService(parseInt(id))
    return successResponse(item)
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : '更新失敗')
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { id, fid } = await params
  const auth = await checkAdminAuth()
  if (!auth.authorized) return auth.response

  try {
    await prisma.serviceFaq.delete({ where: { id: parseInt(fid) } })
    await revalidateService(parseInt(id))
    return successResponse({ message: '已刪除' })
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : '刪除失敗')
  }
}
