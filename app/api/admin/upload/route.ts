import { NextRequest } from 'next/server'
import { checkAdminAuth, errorResponse, successResponse } from '@/lib/api-auth'
import { uploadImageToR2, isR2Configured } from '@/lib/r2'

export async function POST(request: NextRequest) {
  const auth = await checkAdminAuth()
  if (!auth.authorized) return auth.response

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const folder = (formData.get('folder') as string) || 'images'

    if (!file) {
      return errorResponse('請選擇要上傳的檔案', 400)
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return errorResponse('只允許上傳 JPG、PNG、GIF 或 WebP 格式的圖片', 400)
    }

    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return errorResponse('檔案大小不能超過 5MB', 400)
    }

    if (!isR2Configured()) {
      return errorResponse('圖片儲存未配置，請在 .env 中設定 R2_* 憑證', 500)
    }

    const result = await uploadImageToR2(file, file.name, folder)

    if (result.success && result.url) {
      return successResponse({ url: result.url })
    }
    return errorResponse(result.error || '上傳失敗', 500)
  } catch (error) {
    console.error('Upload error:', error)
    return errorResponse(error instanceof Error ? error.message : '上傳失敗')
  }
}
