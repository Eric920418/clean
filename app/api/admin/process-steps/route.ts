import { NextRequest } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { checkAdminAuth, errorResponse, successResponse } from '@/lib/api-auth'
import { sanitizeRichText } from '@/lib/sanitize-html'

export async function GET() {
  const auth = await checkAdminAuth()
  if (!auth.authorized) return auth.response
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
    const cleanDesc = sanitizeRichText(desc)
    if (!cleanDesc) {
      return errorResponse('描述為必填', 400)
    }

    let finalOrder = typeof order === 'number' ? order : null
    if (finalOrder === null) {
      const last = await prisma.processStep.findFirst({ orderBy: { order: 'desc' } })
      finalOrder = (last?.order ?? -1) + 1
    }

    const item = await prisma.processStep.create({
      data: { step: step.trim(), title: title.trim(), desc: cleanDesc, order: finalOrder },
    })
    revalidatePath('/')
    return successResponse(item, 201)
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : '建立失敗')
  }
}
