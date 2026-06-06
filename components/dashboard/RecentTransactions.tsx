'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Transaction } from '@prisma/client'
import {
  ShoppingCart,
  Car,
  Utensils,
  Heart,
  Play,
  Package,
  Plane,
  BookOpen,
  Zap,
  RefreshCw,
  CreditCard,
} from 'lucide-react'

interface RecentTransactionsProps {
  transactions: Transaction[]
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Groceries: <ShoppingCart className="h-4 w-4" />,
  Transport: <Car className="h-4 w-4" />,
  Dining: <Utensils className="h-4 w-4" />,
  Healthcare: <Heart className="h-4 w-4" />,
  Entertainment: <Play className="h-4 w-4" />,
  Shopping: <Package className="h-4 w-4" />,
  Travel: <Plane className="h-4 w-4" />,
  Education: <BookOpen className="h-4 w-4" />,
  Utilities: <Zap className="h-4 w-4" />,
  Subscriptions: <RefreshCw className="h-4 w-4" />,
}

const CATEGORY_COLORS: Record<string, { bg: string; icon: string }> = {
  Groceries:     { bg: '#E1F5EE', icon: '#0F6E56' },
  Transport:     { bg: '#EEEDFE', icon: '#534AB7' },
  Dining:        { bg: '#E6F1FB', icon: '#185FA5' },
  Healthcare:    { bg: '#FAECE7', icon: '#993C1D' },
  Entertainment: { bg: '#E1F5EE', icon: '#085041' },
  Shopping:      { bg: '#FAEEDA', icon: '#854F0B' },
  Travel:        { bg: '#F1EFE8', icon: '#5F5E5A' },
  Education:     { bg: '#EAF3DE', icon: '#3B6D11' },
  Utilities:     { bg: '#EEEDFE', icon: '#3C3489' },
  Subscriptions: { bg: '#FBEAF0', icon: '#993556' },
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(date))
}

function getSourceLabel(source: string) {
  const map: Record<string, string> = {
    CSV: 'CSV',
    BANK_API: 'Bank',
    RECEIPT: 'Receipt',
    MANUAL: 'Manual',
  }
  return map[source] ?? source
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Recent transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No transactions yet. Upload a CSV or connect your bank to get
            started.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">
          Recent transactions
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          {transactions.length} most recent
        </p>
      </CardHeader>
      <CardContent className="px-4 pb-2">
        <div className="divide-y divide-border">
          {transactions.map((tx) => {
            const category = tx.category ?? 'Other'
            const colors = CATEGORY_COLORS[category] ?? {
              bg: '#F1EFE8',
              icon: '#5F5E5A',
            }
            const icon = CATEGORY_ICONS[category] ?? (
              <CreditCard className="h-4 w-4" />
            )

            return (
              <div
                key={tx.id}
                className="flex items-center gap-3 py-2.5"
              >
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                  style={{ background: colors.bg, color: colors.icon }}
                >
                  {icon}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="truncate text-sm font-medium text-foreground">
                      {tx.merchant}
                    </p>
                    <p className="ml-2 shrink-0 text-sm font-medium text-destructive">
                      -{formatCurrency(Number(tx.amount))}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{category}</span>
                    <span>·</span>
                    <span>{formatDate(tx.date)}</span>
                    <span>·</span>
                    <span>{getSourceLabel(tx.source)}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}