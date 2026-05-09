import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkAdminAuth, errorResponse, successResponse } from '@/lib/api-auth'

type RouteParams = { params: Promise<{ id: string }> }

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params
  try {
    const items = await prisma.serviceFaq.findMany({
      where: { serviceId: parseInt(id) },
      orderBy: { order: 'asc' },
    })
    return successResponse(items)
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : '獲取失敗')
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const auth = await checkAdminAuth()
  if (!auth.authorized) return auth.response

  try {
    const { question, answer, order } = await request.json()
    if (!question || !answer) return errorResponse('問題與答案為必填', 400)

    const item = await prisma.serviceFaq.create({
      data: {
        serviceId: parseInt(id),
        question,
        answer,
        order: order ?? 0,
      },
    })
    return successResponse(item, 201)
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : '建立失敗')
  }
}
