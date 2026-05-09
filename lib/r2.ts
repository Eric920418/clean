import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3'

const R2_ENDPOINT = process.env.R2_ENDPOINT || ''
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'invisible-care'
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || ''
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || ''
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || ''

const s3Client = new S3Client({
  region: 'auto',
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
})

export function isR2Configured(): boolean {
  return !!(R2_ENDPOINT && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY)
}

function generateUniqueFileName(originalName: string): string {
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 8)
  const extension = originalName.split('.').pop() || 'jpg'
  const baseName = originalName
    .replace(/\.[^/.]+$/, '')
    .replace(/[^a-zA-Z0-9一-龥]/g, '-')
    .toLowerCase()
  return `${baseName}-${timestamp}-${randomString}.${extension}`
}

export async function uploadImageToR2(
  file: File | Buffer,
  fileName?: string,
  folder: string = 'images',
): Promise<{ success: boolean; url?: string; error?: string }> {
  if (!isR2Configured()) {
    return { success: false, error: 'R2 storage 未配置（請檢查 .env 裡的 R2_* 變數）' }
  }

  try {
    let buffer: Buffer
    let contentType: string
    let finalFileName: string

    if (file instanceof File) {
      buffer = Buffer.from(await file.arrayBuffer())
      contentType = file.type || 'image/jpeg'
      finalFileName = generateUniqueFileName(fileName || file.name)
    } else {
      buffer = file
      contentType = 'image/jpeg'
      finalFileName = generateUniqueFileName(fileName || 'image.jpg')
    }

    const key = `${folder}/${finalFileName}`

    await s3Client.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      }),
    )

    const url = R2_PUBLIC_URL
      ? `${R2_PUBLIC_URL}/${key}`
      : `${R2_ENDPOINT}/${R2_BUCKET_NAME}/${key}`

    return { success: true, url }
  } catch (error) {
    console.error('R2 upload error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    }
  }
}

export async function deleteImageFromR2(
  url: string,
): Promise<{ success: boolean; error?: string }> {
  if (!isR2Configured()) {
    return { success: false, error: 'R2 storage 未配置' }
  }

  try {
    let key = url
    if (R2_PUBLIC_URL && url.startsWith(R2_PUBLIC_URL)) {
      key = url.replace(`${R2_PUBLIC_URL}/`, '')
    } else if (url.includes(R2_BUCKET_NAME)) {
      key = url.split(`${R2_BUCKET_NAME}/`)[1]
    }

    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
      }),
    )
    return { success: true }
  } catch (error) {
    console.error('R2 delete error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Delete failed',
    }
  }
}

export async function getImageFromR2(
  key: string,
): Promise<{ success: boolean; data?: Buffer; contentType?: string; error?: string }> {
  if (!isR2Configured()) {
    return { success: false, error: 'R2 storage 未配置' }
  }

  try {
    const response = await s3Client.send(
      new GetObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
      }),
    )

    if (response.Body) {
      const chunks: Uint8Array[] = []
      for await (const chunk of response.Body as AsyncIterable<Uint8Array>) {
        chunks.push(chunk)
      }
      const buffer = Buffer.concat(chunks)
      return {
        success: true,
        data: buffer,
        contentType: response.ContentType || 'image/jpeg',
      }
    }

    return { success: false, error: 'Empty response' }
  } catch (error) {
    console.error('R2 get error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Get failed',
    }
  }
}

export { s3Client, R2_BUCKET_NAME }
