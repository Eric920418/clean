import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { compare, hash } from 'bcryptjs'
import { prisma } from './prisma'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: { label: '用戶名', type: 'text' },
        password: { label: '密碼', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error('請輸入用戶名和密碼')
        }

        let admin = await prisma.admin.findUnique({
          where: { username: credentials.username },
        })

        if (!admin) {
          const envUsername = process.env.ADMIN_USERNAME
          const envPassword = process.env.ADMIN_PASSWORD

          if (
            envUsername &&
            envPassword &&
            credentials.username === envUsername &&
            credentials.password === envPassword
          ) {
            const hashedPassword = await hash(envPassword, 12)
            admin = await prisma.admin.create({
              data: {
                username: envUsername,
                password: hashedPassword,
                name: '管理員',
              },
            })
          } else {
            throw new Error('用戶名或密碼錯誤')
          }
        } else {
          const isValid = await compare(credentials.password, admin.password)
          if (!isValid) {
            throw new Error('用戶名或密碼錯誤')
          }
        }

        return {
          id: admin.id.toString(),
          name: admin.name || admin.username,
          email: admin.username,
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 60 * 60, // 1 小時
  },
  pages: {
    signIn: '/admin/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        ;(session.user as { id?: string }).id = token.id as string
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}
