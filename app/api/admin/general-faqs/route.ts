import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkAdminAuth, errorResponse, successResponse } from '@/lib/api-auth'

export async function GET() {
  const auth = await checkAdminAuth()
  if (!auth.authorized) return auth.response
  try {
    const items = await prisma.generalFaq.findMany({
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
    const { question, answer, order } = await request.json()
    if (typeof question !== 'string' || !question.trim()) {
      return errorResponse('問題為必填', 400)
    }
    if (typeof answer !== 'string' || !answer.trim()) {
      return errorResponse('回答為必填', 400)
    }

    let finalOrder = typeof order === 'number' ? order : null
    if (finalOrder === null) {
      const last = await prisma.generalFaq.findFirst({ orderBy: { order: 'desc' } })
      finalOrder = (last?.order ?? -1) + 1
    }

    const item = await prisma.generalFaq.create({
      data: { question: question.trim(), answer: answer.trim(), order: finalOrder },
    })
    return successResponse(item, 201)
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : '建立失敗')
  }
}
