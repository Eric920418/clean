import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkAdminAuth, errorResponse, successResponse } from '@/lib/api-auth'
import { parseCards } from '@/lib/why-us'

type RouteParams = { params: Promise<{ id: string }> }

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const auth = await checkAdminAuth()
  if (!auth.authorized) return auth.response

  try {
    const body = await request.json()
    const data: Record<string, unknown> = {}

    if (body.eyebrow !== undefined) {
      data.eyebrow =
        typeof body.eyebrow === 'string' && body.eyebrow.trim() ? body.eyebrow.trim() : null
    }
    if (body.title !== undefined) {
      if (typeof body.title !== 'string' || !body.title.trim()) {
        return errorResponse('標題為必填', 400)
      }
      data.title = body.title.trim()
    }
    if (body.description !== undefined) {
      data.description =
        typeof body.description === 'string' && body.description.trim()
          ? body.description.trim()
          : null
    }
    if (body.cards !== undefined) {
      const cardsResult = parseCards(body.cards)
      if (!cardsResult.ok) return errorResponse(cardsResult.error, 400)
      data.cards = cardsResult.cards
    }
    if (body.order !== undefined) {
      data.order = typeof body.order === 'number' ? body.order : parseInt(String(body.order), 10)
    }

    const item = await prisma.whyUsSection.update({
      where: { id: parseInt(id, 10) },
      data,
    })
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
    await prisma.whyUsSection.delete({ where: { id: parseInt(id, 10) } })
    return successResponse({ message: '已刪除' })
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : '刪除失敗')
  }
}
