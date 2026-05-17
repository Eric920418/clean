import { NextRequest } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { checkAdminAuth, errorResponse, successResponse } from '@/lib/api-auth'
import { sanitizeRichText } from '@/lib/sanitize-html'

type RouteParams = { params: Promise<{ id: string }> }

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const auth = await checkAdminAuth()
  if (!auth.authorized) return auth.response

  try {
    const body = await request.json()
    const data: Record<string, unknown> = {}
    if (body.step !== undefined) {
      if (typeof body.step !== 'string' || !body.step.trim()) {
        return errorResponse('步驟編號為必填', 400)
      }
      data.step = body.step.trim()
    }
    if (body.title !== undefined) {
      if (typeof body.title !== 'string' || !body.title.trim()) {
        return errorResponse('標題為必填', 400)
      }
      data.title = body.title.trim()
    }
    if (body.desc !== undefined) {
      if (typeof body.desc !== 'string' || !body.desc.trim()) {
        return errorResponse('描述為必填', 400)
      }
      data.desc = body.desc.trim()
    }
    if (body.order !== undefined) {
      data.order = typeof body.order === 'number' ? body.order : parseInt(String(body.order), 10)
    }

    const item = await prisma.processStep.update({ where: { id: parseInt(id, 10) }, data })
    return successResponse(item)
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : '更新失敗')
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const auth = await checkAdminAuth()
  if (!auth.authorized) return auth.response

  try {
    await prisma.processStep.delete({ where: { id: parseInt(id, 10) } })
    return successResponse({ message: '已刪除' })
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : '刪除失敗')
  }
}
