import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { errorResponse, successResponse } from '@/lib/api-auth'

// 公開 endpoint：前台 contact form 提交
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, phone, lineId, email, preferDate, address, message } = body

    if (!name?.trim() || !phone?.trim()) {
      return errorResponse('姓名與聯絡電話為必填', 400)
    }

    if (typeof lineId !== 'string' || !lineId.trim()) {
      return errorResponse('請填寫 LINE ID', 400)
    }

    if (lineId.trim().length > 100) {
      return errorResponse('LINE ID 過長（上限 100 字）', 400)
    }

    if (typeof message === 'string' && message.length > 2000) {
      return errorResponse('訊息過長（上限 2000 字）', 400)
    }

    // 簡易電話格式（4–20 個數字、空白、+、-、括號）
    if (!/^[0-9+\-\s()]{4,20}$/.test(phone)) {
      return errorResponse('電話格式不正確', 400)
    }

    const inquiry = await prisma.bookingInquiry.create({
      data: {
        name: name.trim(),
        phone: phone.trim(),
        lineId: lineId.trim(),
        email: email?.trim() || null,
        preferDate: preferDate ? new Date(preferDate) : null,
        address: address?.trim() || null,
        message: message?.trim() || null,
      },
    })

    return successResponse({ id: inquiry.id, message: '已收到您的預約' }, 201)
  } catch (error) {
    console.error('Public inquiry submit error:', error)
    return errorResponse(error instanceof Error ? error.message : '送出失敗')
  }
}
