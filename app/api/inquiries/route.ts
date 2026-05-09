import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { errorResponse, successResponse } from '@/lib/api-auth'

// 公開 endpoint：前台 contact form 提交
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, phone, email, serviceIds, preferDate, address, message } = body

    if (!name?.trim() || !phone?.trim()) {
      return errorResponse('姓名與聯絡電話為必填', 400)
    }

    if (!Array.isArray(serviceIds) || serviceIds.length === 0) {
      return errorResponse('請至少選擇一項服務', 400)
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
        email: email?.trim() || null,
        serviceIds: serviceIds.map((x: unknown) => parseInt(String(x))).filter((n: number) => !isNaN(n)),
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
