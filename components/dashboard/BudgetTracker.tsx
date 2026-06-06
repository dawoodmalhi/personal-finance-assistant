'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Budget } from '@prisma/client'

interface BudgetWithSpend extends Budget {
  spent: number
}

interface BudgetTrackerProps {
  budgets: BudgetWithSpend[]
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function getBarColor(pct: number, over: boolean) {
  if (over) return '#E24B4A'
  if (pct > 80) return '#BA7517'
  return '#1D9E75'
}

function getTextColor(pct: number, over: boolean) {
  if (over) return 'text-destructive'
  if (pct > 80) return 'text-yellow-600'
  return 'text-green-600'
}

export function BudgetTracker({ budgets }: BudgetTrackerProps) {
  if (budgets.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Budget tracker</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No budgets set yet. Ask the assistant to set one for you.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Budget tracker</CardTitle>
        <p className="text-xs text-muted-foreground">
          {budgets.filter((b) => b.spent > Number(b.limitAmount)).length > 0
            ? `${budgets.filter((b) => b.spent > Number(b.limitAmount)).length} budget(s) exceeded`
            : 'All budgets on track'}
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {budgets.map((budget) => {
            const limit = Number(budget.limitAmount)
            const pct = Math.min(
              Math.round((budget.spent / limit) * 100),
              100
            )
            const over = budget.spent > limit
            const remaining = limit - budget.spent
            const barColor = getBarColor(pct, over)
            const textColor = getTextColor(pct, over)

            return (
              <div key={budget.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">
                      {budget.category}
                    </span>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-muted-foreground">
                      {budget.period.toLowerCase()}
                    </span>
                  </div>
                  <span className={`font-medium ${textColor}`}>
                    {formatCurrency(budget.spent)} / {formatCurrency(limit)}
                  </span>
                </div>

                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      background: barColor,
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{pct}% used</span>
                  <span className={over ? 'text-destructive' : ''}>
                    {over
                      ? `${formatCurrency(Math.abs(remaining))} over budget`
                      : `${formatCurrency(remaining)} remaining`}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}