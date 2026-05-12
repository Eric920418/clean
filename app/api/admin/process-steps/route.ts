import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkAdminAuth, errorResponse, successResponse } from '@/lib/api-auth'

export async function GET() {
  try {
    const items = await prisma.processStep.findMany({
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
    const { step, title, desc, order } = await request.json()
    if (typeof step !== 'string' || !step.trim()) {
      return errorResponse('步驟編號（如 01）為必填', 400)
    }
    if (typeof title !== 'string' || !title.trim()) {
      return errorResponse('標題為必填', 400)
    }
    if (typeof desc !== 'string' || !desc.trim()) {
      return errorResponse('描述為必填', 400)
    }

    let finalOrder = typeof order === 'number' ? order : null
    if (finalOrder === null) {
      const last = await prisma.processStep.findFirst({ orderBy: { order: 'desc' } })
      finalOrder = (last?.order ?? -1) + 1
    }

    const item = await prisma.processStep.create({
      data: { step: step.trim(), title: title.trim(), desc: desc.trim(), order: finalOrder },
    })
    return successResponse(item, 201)
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : '建立失敗')
  }
}
