import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkAdminAuth, errorResponse, successResponse } from '@/lib/api-auth'

export async function GET() {
  const auth = await checkAdminAuth()
  if (!auth.authorized) return auth.response
  try {
    const items = await prisma.siteSetting.findMany({ orderBy: { key: 'asc' } })
    return successResponse(items)
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : '獲取失敗')
  }
}

// 一次更新多個 key（body: { settings: { key1: val1, key2: val2 } }）
export async function PUT(request: NextRequest) {
  const auth = await checkAdminAuth()
  if (!auth.authorized) return auth.response

  try {
    const { settings } = await request.json()
    if (!settings || typeof settings !== 'object') {
      return errorResponse('settings 物件為必填', 400)
    }

    const ops = Object.entries(settings as Record<string, string>).map(([key, value]) =>
      prisma.siteSetting.upsert({
        where: { key },
        create: { key, value: String(value ?? '') },
        update: { value: String(value ?? '') },
      }),
    )
    await prisma.$transaction(ops)
    return successResponse({ message: '已儲存', count: ops.length })
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : '儲存失敗')
  }
}
