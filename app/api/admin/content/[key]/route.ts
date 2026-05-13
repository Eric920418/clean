import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkAdminAuth, errorResponse, successResponse } from '@/lib/api-auth'

type RouteParams = { params: Promise<{ key: string }> }

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { key } = await params
  const auth = await checkAdminAuth()
  if (!auth.authorized) return auth.response
  try {
    const item = await prisma.contentBlock.findUnique({ where: { key } })
    return successResponse(item)
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : '獲取失敗')
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { key } = await params
  const auth = await checkAdminAuth()
  if (!auth.authorized) return auth.response

  try {
    const { payload } = await request.json()
    const item = await prisma.contentBlock.upsert({
      where: { key },
      create: { key, payload: payload ?? {} },
      update: { payload: payload ?? {} },
    })
    return successResponse(item)
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : '儲存失敗')
  }
}
