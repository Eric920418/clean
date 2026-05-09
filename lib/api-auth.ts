import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from './auth'

export async function checkAdminAuth() {
  const session = await getServerSession(authOptions)

  if (!session) {
    return {
      authorized: false as const,
      response: NextResponse.json({ error: '未授權' }, { status: 401 }),
    }
  }

  return { authorized: true as const, session }
}

export function errorResponse(message: string, status: number = 500) {
  return NextResponse.json({ error: message }, { status })
}

export function successResponse<T>(data: T, status: number = 200) {
  return NextResponse.json(data, { status })
}
