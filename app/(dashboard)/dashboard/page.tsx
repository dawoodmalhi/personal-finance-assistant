import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { MetricCards } from '@/components/dashboard/MetricCards'
import { SpendingByCategory } from '@/components/dashboard/SpendingByCategory'
import { MonthlyTrend } from '@/components/dashboard/MonthlyTrend'
import { BudgetTracker } from '@/components/dashboard/BudgetTracker'
import { RecentTransactions } from '@/components/dashboard/RecentTransactions'
import { SubscriptionsList } from '@/components/dashboard/SubscriptionsList'
import { AnomalyFlags } from '@/components/dashboard/AnomalyFlags'
import { startOfMonth, endOfMonth, subMonths } from 'date-fns'

export default async function DashboardPage() {
  const user = await getCurrentUser()
  const now = new Date()
  const monthStart = startOfMonth(now)
  const monthEnd = endOfMonth(now)

  const [transactions, budgets, subscriptions, anomalies, lastMonthTotal] =
    await Promise.all([
      prisma.transaction.findMany({
        where: { userId: user.id, isDuplicate: false },
        orderBy: { date: 'desc' },
        take: 100,
      }),
      prisma.budget.findMany({ where: { userId: user.id } }),
      prisma.subscription.findMany({
        where: { userId: user.id },
        orderBy: { amount: 'desc' },
      }),
      prisma.anomalyFlag.findMany({
        where: { userId: user.id },
        include: { transaction: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      prisma.transaction.aggregate({
        where: {
          userId: user.id,
          date: { gte: startOfMonth(subMonths(now, 1)), lte: endOfMonth(subMonths(now, 1)) },
          isDuplicate: false,
        },
        _sum: { amount: true },
      }),
    ])

  const thisMonthTxs = transactions.filter(
    t => t.date >= monthStart && t.date <= monthEnd
  )

  const totalSpent = thisMonthTxs.reduce((sum, t) => sum + Number(t.amount), 0)
  const lastMonthSpent = Number(lastMonthTotal._sum.amount ?? 0)
  const largest = [...thisMonthTxs].sort((a, b) => Number(b.amount) - Number(a.amount))[0]

  const byCategory = thisMonthTxs.reduce<Record<string, number>>((acc, t) => {
    const cat = t.category ?? 'Other'
    acc[cat] = (acc[cat] ?? 0) + Number(t.amount)
    return acc
  }, {})

  const budgetsWithSpend = budgets.map(b => ({
    ...b,
    spent: thisMonthTxs
      .filter(t => t.category === b.category)
      .reduce((sum, t) => sum + Number(t.amount), 0),
  }))

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-medium">Dashboard</h1>

      <MetricCards
        totalSpent={totalSpent}
        lastMonthSpent={lastMonthSpent}
        largestTransaction={largest}
        activeSubscriptions={subscriptions.filter(s => s.isActive).length}
        subscriptionTotal={subscriptions.filter(s => s.isActive).reduce((s, sub) => s + Number(sub.amount), 0)}
        unseenAnomalies={anomalies.filter(a => !a.seenByUser).length}
      />

      <div className="grid grid-cols-2 gap-6">
        <SpendingByCategory data={byCategory} />
        <MonthlyTrend userId={user.id} />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <BudgetTracker budgets={budgetsWithSpend} />
        <RecentTransactions transactions={transactions.slice(0, 8)} />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <AnomalyFlags anomalies={anomalies} />
        </div>
        <SubscriptionsList subscriptions={subscriptions} />
      </div>
    </div>
  )
}