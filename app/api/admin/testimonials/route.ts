import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkAdminAuth, errorResponse, successResponse } from '@/lib/api-auth'
import { sanitizeRichText } from '@/lib/sanitize-html'

export async function GET() {
  const auth = await checkAdminAuth()
  if (!auth.authorized) return auth.response
  try {
    const items = await prisma.testimonial.findMany({
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
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
    const { authorName, authorMeta, rating, content, serviceId, isActive, order } = body
    if (!authorName?.trim()) return errorResponse('客戶署名為必填', 400)
    const cleanContent = sanitizeRichText(content)
    if (!cleanContent) return errorResponse('內容為必填', 400)

    const item = await prisma.testimonial.create({
      data: {
        authorName: authorName.trim(),
        authorMeta: authorMeta?.trim() || null,
        rating: parseInt(String(rating ?? 5)) || 5,
        content: cleanContent,
        serviceId: serviceId ? parseInt(String(serviceId)) : null,
        isActive: isActive !== false,
        order: order ?? 0,
      },
    })
    return successResponse(item, 201)
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : '建立失敗')
  }
}
