import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkAdminAuth, errorResponse, successResponse } from '@/lib/api-auth'

type RouteParams = { params: Promise<{ id: string }> }

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const auth = await checkAdminAuth()
  if (!auth.authorized) return auth.response

  try {
    const body = await request.json()
    const item = await prisma.testimonial.update({
      where: { id: parseInt(id) },
      data: {
        ...(body.authorName !== undefined && { authorName: body.authorName }),
        ...(body.authorMeta !== undefined && { authorMeta: body.authorMeta || null }),
        ...(body.rating !== undefined && { rating: parseInt(String(body.rating)) || 5 }),
        ...(body.content !== undefined && { content: body.content }),
        ...(body.serviceId !== undefined && {
          serviceId: body.serviceId ? parseInt(String(body.serviceId)) : null,
        }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
        ...(body.order !== undefined && { order: body.order }),
      },
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
    await prisma.testimonial.delete({ where: { id: parseInt(id) } })
    return successResponse({ message: '已刪除' })
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : '刪除失敗')
  }
}
