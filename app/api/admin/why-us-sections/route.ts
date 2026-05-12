import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkAdminAuth, errorResponse, successResponse } from '@/lib/api-auth'
import { parseCards } from '@/lib/why-us'

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const location = url.searchParams.get('location') ?? undefined
    const items = await prisma.whyUsSection.findMany({
      where: location ? { location } : undefined,
      orderBy: [{ location: 'asc' }, { order: 'asc' }, { createdAt: 'asc' }],
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
    const { location, eyebrow, title, description, cards, order } = body

    const finalLocation = location === 'about' ? 'about' : 'home'

    if (typeof title !== 'string' || !title.trim()) {
      return errorResponse('標題為必填', 400)
    }

    const cardsResult = parseCards(cards)
    if (!cardsResult.ok) return errorResponse(cardsResult.error, 400)

    // 新增時若沒給 order，依該 location 的最大 order +1
    let finalOrder = typeof order === 'number' ? order : null
    if (finalOrder === null) {
      const last = await prisma.whyUsSection.findFirst({
        where: { location: finalLocation },
        orderBy: { order: 'desc' },
      })
      finalOrder = (last?.order ?? -1) + 1
    }

    const item = await prisma.whyUsSection.create({
      data: {
        location: finalLocation,
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
