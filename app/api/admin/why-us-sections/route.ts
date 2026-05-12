import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkAdminAuth, errorResponse, successResponse } from '@/lib/api-auth'
import { parseCards } from '@/lib/why-us'

export async function GET() {
  try {
    const items = await prisma.whyUsSection.findMany({
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    })
    return successResponse(items)
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : '獲取失敗')
  }
}

export async function POST(request: NextRequest) {
  const auth = await checkAdminAuth()
  if (!auth.authorized) return auth.response

  try {
    const body = await request.json()
    const { eyebrow, title, description, cards, order } = body

    if (typeof title !== 'string' || !title.trim()) {
      return errorResponse('標題為必填', 400)
    }

    const cardsResult = parseCards(cards)
    if (!cardsResult.ok) return errorResponse(cardsResult.error, 400)

    // 新增時若沒給 order，自動排到最後
    let finalOrder = typeof order === 'number' ? order : null
    if (finalOrder === null) {
      const last = await prisma.whyUsSection.findFirst({ orderBy: { order: 'desc' } })
      finalOrder = (last?.order ?? -1) + 1
    }

    const item = await prisma.whyUsSection.create({
      data: {
        eyebrow: typeof eyebrow === 'string' && eyebrow.trim() ? eyebrow.trim() : null,
        title: title.trim(),
        description:
          typeof description === 'string' && description.trim() ? description.trim() : null,
        cards: cardsResult.cards,
        order: finalOrder,
      },
    })
    return successResponse(item, 201)
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : '建立失敗')
  }
}
