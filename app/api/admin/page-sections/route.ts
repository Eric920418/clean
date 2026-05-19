import { NextRequest } from 'next/server'
import { revalidatePath } from 'next/cache'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { checkAdminAuth, errorResponse, successResponse } from '@/lib/api-auth'
import { ensureFixedSections } from '@/lib/queries'
import { isFixedType } from '@/lib/admin-types'

// 動態附加區塊：目前用於首頁 & 關於我們，未來可擴 contact/faq/works
const ALLOWED_PAGES = ['home', 'about'] as const
// 業主透過後台新增的只能是 dynamic types；fixed types 由 ensureFixedSections 自動 backfill
const ALLOWED_DYNAMIC_TYPES = ['text_block', 'cta_banner', 'image_text', 'rich_content'] as const

type PageName = (typeof ALLOWED_PAGES)[number]
type SectionType = (typeof ALLOWED_DYNAMIC_TYPES)[number]

function defaultConfig(type: SectionType): Record<string, unknown> {
  switch (type) {
    case 'text_block':
      return { eyebrow: null, title: null, body: null }
    case 'cta_banner':
      return {
        backgroundImage: null,
        overline: null,
        titleLine1: null,
        titleLine2: null,
        description: null,
        primaryCta: null,
        lineUrl: null,
      }
    case 'image_text':
      return {
        layout: 'image-left',
        image: null,
        eyebrow: null,
        title: null,
        body: null,
        ctaText: null,
        ctaUrl: null,
      }
    case 'rich_content':
      return { html: null }
  }
}

function pagePath(page: PageName): string {
  return page === 'home' ? '/' : `/${page}`
}

// GET /api/admin/page-sections?page=home — 列出指定頁面的全部 section（fixed + dynamic，依 order）
export async function GET(request: NextRequest) {
  const auth = await checkAdminAuth()
  if (!auth.authorized) return auth.response

  try {
    const page = request.nextUrl.searchParams.get('page') as PageName | null
    if (!page || !ALLOWED_PAGES.includes(page)) {
      return errorResponse(`page 必須是：${ALLOWED_PAGES.join(', ')}`, 400)
    }
    await ensureFixedSections(page)
    const sections = await prisma.pageSection.findMany({
      where: { page },
      orderBy: { order: 'asc' },
    })
    return successResponse(sections)
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : '讀取失敗')
  }
}

// POST /api/admin/page-sections — 新增一個 section
export async function POST(request: NextRequest) {
  const auth = await checkAdminAuth()
  if (!auth.authorized) return auth.response

  try {
    const body = await request.json()
    const page = body.page as PageName
    const type = body.type as SectionType

    if (!page || !ALLOWED_PAGES.includes(page)) {
      return errorResponse(`page 必須是：${ALLOWED_PAGES.join(', ')}`, 400)
    }
    if (!type || !ALLOWED_DYNAMIC_TYPES.includes(type)) {
      return errorResponse(
        `type 必須是這 ${ALLOWED_DYNAMIC_TYPES.length} 種動態類型之一：${ALLOWED_DYNAMIC_TYPES.join(', ')}（固定區塊不能透過新增建立，由系統自動 backfill）`,
        400,
      )
    }
    // 雙重保護：fixed type 永遠不能透過 API 建立
    if (isFixedType(page, type)) {
      return errorResponse('固定區塊不能新增，業主只能排序或隱藏', 400)
    }

    const maxOrder = await prisma.pageSection.aggregate({
      where: { page },
      _max: { order: true },
    })

    const section = await prisma.pageSection.create({
      data: {
        page,
        type,
        order: (maxOrder._max.order ?? 0) + 1,
        isVisible: true,
        config: defaultConfig(type) as Prisma.InputJsonValue,
      },
    })

    revalidatePath(pagePath(page))
    return successResponse(section, 201)
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : '新增失敗')
  }
}
