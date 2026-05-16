import { NextRequest } from 'next/server'
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
    if (body.question !== undefined) {
      if (typeof body.question !== 'string' || !body.question.trim()) {
        return errorResponse('問題為必填', 400)
      }
      data.question = body.question.trim()
    }
    if (body.answer !== undefined) {
      const cleanAnswer = sanitizeRichText(body.answer)
      if (!cleanAnswer) return errorResponse('回答為必填', 400)
      data.answer = cleanAnswer
    }
    if (body.order !== undefined) {
      data.order = typeof body.order === 'number' ? body.order : parseInt(String(body.order), 10)
    }

    const item = await prisma.generalFaq.update({ where: { id: parseInt(id, 10) }, data })
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
    await prisma.generalFaq.delete({ where: { id: parseInt(id, 10) } })
    return successResponse({ message: '已刪除' })
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : '刪除失敗')
  }
}
