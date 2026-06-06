import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { subMonths, startOfMonth, endOfMonth, format } from 'date-fns'

export async function GET() {
  try {
    const user = await getCurrentUser()
    const now = new Date()

    const months = Array.from({ length: 6 }, (_, i) => {
      const date = subMonths(now, 5 - i)
      return {
        label: format(date, 'MMM'),
        start: startOfMonth(date),
        end: endOfMonth(date),
      }
    })

    const data = await Promise.all(
      months.map(async ({ label, start, end }) => {
        const result = await prisma.transaction.aggregate({
          where: {
            userId: user.id,
            isDuplicate: false,
            date: { gte: start, lte: end },
          },
          _sum: { amount: true },
        })
        return {
          month: label,
          total: Number(result._sum.amount ?? 0),
        }
      })
    )

    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}