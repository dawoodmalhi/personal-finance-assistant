'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Subscription } from '@prisma/client'
import { RefreshCw } from 'lucide-react'

interface SubscriptionsListProps {
  subscriptions: Subscription[]
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

function formatFrequency(freq: string) {
  const map: Record<string, string> = {
    MONTHLY: 'monthly',
    WEEKLY: 'weekly',
    ANNUAL: 'annual',
  }
  return map[freq] ?? freq.toLowerCase()
}

function toMonthlyEstimate(amount: number, freq: string) {
  if (freq === 'ANNUAL') return amount / 12
  if (freq === 'WEEKLY') return amount * 4.33
  return amount
}

export function SubscriptionsList({ subscriptions }: SubscriptionsListProps) {
  const active = subscriptions.filter((s) => s.isActive)
  const inactive = subscriptions.filter((s) => !s.isActive)

  const monthlyTotal = active.reduce(
    (sum, s) =>
      sum + toMonthlyEstimate(Number(s.amount), s.frequency),
    0
  )

  if (subscriptions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Subscriptions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No subscriptions detected yet.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Subscriptions</CardTitle>
        <p className="text-xs text-muted-foreground">
          {active.length} active ·{' '}
          {formatCurrency(monthlyTotal)}/mo estimated
        </p>
      </CardHeader>
      <CardContent className="px-4 pb-2">
        <div className="divide-y divide-border">
          {active.map((sub) => (
            <SubscriptionRow key={sub.id} sub={sub} />
          ))}
          {inactive.length > 0 && (
            <>
              <p className="py-2 text-xs font-medium text-muted-foreground">
                Inactive
              </p>
              {inactive.map((sub) => (
                <SubscriptionRow key={sub.id} sub={sub} inactive />
              ))}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function SubscriptionRow({
  sub,
  inactive = false,
}: {
  sub: Subscription
  inactive?: boolean
}) {
  const initials = sub.merchant
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div
      className={`flex items-center gap-3 py-2.5 ${
        inactive ? 'opacity-50' : ''
      }`}
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-medium text-muted-foreground">
        {initials}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between">
          <p className="truncate text-sm font-medium text-foreground">
            {sub.merchant}
          </p>
          <p className="ml-2 shrink-0 text-sm font-medium text-foreground">
            {formatCurrency(Number(sub.amount))}
          </p>
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <RefreshCw className="h-3 w-3" />
            <span>{formatFrequency(sub.frequency)}</span>
          </div>
          <span
            className={`rounded-full px-2 py-0.5 text-xs ${
              inactive
                ? 'bg-muted text-muted-foreground'
                : 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400'
            }`}
          >
            {inactive ? 'inactive' : 'active'}
          </span>
        </div>
      </div>
    </div>
  )
}