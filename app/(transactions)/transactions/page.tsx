import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { TransactionsTable } from '@/components/transactions/TransactionsTable'

interface SearchParams {
  page?: string
  category?: string
  source?: string
  search?: string
}

const PAGE_SIZE = 50

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const user = await getCurrentUser()
  const page = Math.max(1, parseInt(searchParams.page ?? '1'))
  const category = searchParams.category ?? ''
  const source = searchParams.source ?? ''
  const search = searchParams.search ?? ''

  const where = {
    userId: user.id,
    isDuplicate: false,
    ...(category ? { category } : {}),
    ...(source ? { source: source as any } : {}),
    ...(search
      ? {
          merchant: {
            contains: search,
            mode: 'insensitive' as const,
          },
        }
      : {}),
  }

  const [transactions, total, categories] = await Promise.all([
    prisma.transaction.findMany({
      where,
      orderBy: { date: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.transaction.count({ where }),
    prisma.transaction.findMany({
      where: { userId: user.id },
      select: { category: true },
      distinct: ['category'],
    }),
  ])

  const uniqueCategories = categories
    .map((c) => c.category)
    .filter(Boolean) as string[]

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium">Transactions</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {total} transaction{total !== 1 ? 's' : ''} total
          </p>
        </div>
      </div>

      <TransactionsTable
        transactions={transactions}
        total={total}
        page={page}
        pageSize={PAGE_SIZE}
        categories={uniqueCategories}
        currentCategory={category}
        currentSource={source}
        currentSearch={search}
      />
    </div>
  )
}