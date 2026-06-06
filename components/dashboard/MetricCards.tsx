import { Card, CardContent } from '@/components/ui/card'
import {
  TrendingUp,
  TrendingDown,
  CreditCard,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react'
import { Transaction } from '@prisma/client'

interface MetricCardsProps {
  totalSpent: number
  lastMonthSpent: number
  largestTransaction: Transaction | undefined
  activeSubscriptions: number
  subscriptionTotal: number
  unseenAnomalies: number
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function percentChange(current: number, previous: number) {
  if (previous === 0) return null
  return ((current - previous) / previous) * 100
}

export function MetricCards({
  totalSpent,
  lastMonthSpent,
  largestTransaction,
  activeSubscriptions,
  subscriptionTotal,
  unseenAnomalies,
}: MetricCardsProps) {
  const change = percentChange(totalSpent, lastMonthSpent)
  const isUp = change !== null && change > 0

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {/* Total spent */}
      <Card>
        <CardContent className="">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Spent this month</p>
              <p className="mt-1 text-2xl font-medium">
                {formatCurrency(totalSpent)}
              </p>
              {change !== null && (
                <p
                  className={`mt-1 flex items-center gap-1 text-xs ${
                    isUp ? 'text-destructive' : 'text-green-600'
                  }`}
                >
                  {isUp ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {Math.abs(change).toFixed(1)}% vs last month
                </p>
              )}
              {change === null && (
                <p className="mt-1 text-xs text-muted-foreground">
                  No data last month
                </p>
              )}
            </div>
            <div className="rounded-md bg-muted p-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Largest transaction */}
      <Card>
        <CardContent className="">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm text-muted-foreground">
                Largest transaction
              </p>
              <p className="mt-1 text-2xl font-medium">
                {largestTransaction
                  ? formatCurrency(Number(largestTransaction.amount))
                  : '—'}
              </p>
              {largestTransaction && (
                <p className="mt-1 truncate text-xs text-muted-foreground">
                  {largestTransaction.merchant}
                  {largestTransaction.category
                    ? ` · ${largestTransaction.category}`
                    : ''}
                </p>
              )}
              {!largestTransaction && (
                <p className="mt-1 text-xs text-muted-foreground">
                  No transactions this month
                </p>
              )}
            </div>
            <div className="ml-2 rounded-md bg-muted p-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscriptions */}
      <Card>
        <CardContent className="">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Active subscriptions
              </p>
              <p className="mt-1 text-2xl font-medium">
                {activeSubscriptions}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {formatCurrency(subscriptionTotal)}/mo total
              </p>
            </div>
            <div className="rounded-md bg-muted p-2">
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Anomalies */}
      <Card>
        <CardContent className="">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Anomalies flagged</p>
              <p className="mt-1 text-2xl font-medium">{unseenAnomalies}</p>
              <p
                className={`mt-1 text-xs ${
                  unseenAnomalies > 0
                    ? 'text-destructive'
                    : 'text-muted-foreground'
                }`}
              >
                {unseenAnomalies > 0
                  ? `${unseenAnomalies} need${unseenAnomalies === 1 ? 's' : ''} review`
                  : 'All clear'}
              </p>
            </div>
            <div
              className={`rounded-md p-2 ${
                unseenAnomalies > 0 ? 'bg-destructive/10' : 'bg-muted'
              }`}
            >
              <AlertTriangle
                className={`h-4 w-4 ${
                  unseenAnomalies > 0
                    ? 'text-destructive'
                    : 'text-muted-foreground'
                }`}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}