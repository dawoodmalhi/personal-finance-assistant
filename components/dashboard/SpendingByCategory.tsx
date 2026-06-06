'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface SpendingByCategoryProps {
  data: Record<string, number>
}

const CATEGORY_COLORS: Record<string, string> = {
  Groceries: '#1D9E75',
  Dining: '#378ADD',
  Transport: '#7F77DD',
  Subscriptions: '#D4537E',
  Healthcare: '#EF9F27',
  Shopping: '#D85A30',
  Travel: '#888780',
  Entertainment: '#5DCAA5',
  Education: '#97C459',
  Utilities: '#AFA9EC',
  Other: '#B4B2A9',
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function SpendingByCategory({ data }: SpendingByCategoryProps) {
  const sorted = Object.entries(data)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)

  const max = sorted[0]?.[1] ?? 1
  const total = sorted.reduce((sum, [, v]) => sum + v, 0)

  if (sorted.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Spending by category
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No transactions this month.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">
          Spending by category
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Total: {formatCurrency(total)}
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sorted.map(([category, amount]) => {
            const pct = Math.round((amount / max) * 100)
            const share = ((amount / total) * 100).toFixed(1)
            const color =
              CATEGORY_COLORS[category] ?? CATEGORY_COLORS['Other']

            return (
              <div key={category}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block h-2 w-2 rounded-full"
                      style={{ background: color }}
                    />
                    <span className="font-medium text-foreground">
                      {category}
                    </span>
                    <span className="text-muted-foreground">{share}%</span>
                  </div>
                  <span className="text-foreground">
                    {formatCurrency(amount)}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, background: color }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}