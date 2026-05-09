import { prisma } from '@/lib/prisma'
import { errorResponse, successResponse } from '@/lib/api-auth'

export async function GET() {
  try {
    const items = await prisma.contentBlock.findMany({ orderBy: { key: 'asc' } })
    return successResponse(items)
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : '獲取失敗')
  }
}
