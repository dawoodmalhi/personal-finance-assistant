'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface MonthlyTrendProps {
  userId: string
}

interface MonthData {
  month: string
  total: number
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function MonthlyTrend({ userId }: MonthlyTrendProps) {
  const [data, setData] = useState<MonthData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch('/api/dashboard/monthly-trend')
      .then((r) => r.json())
      .then((d) => {
        setData(d.data ?? [])
        setLoading(false)
      })
      .catch(() => {
        setError(true)
        setLoading(false)
      })
  }, [userId])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">
          Monthly trend
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Last 6 months
        </p>
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="flex h-[180px] items-center justify-center">
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        )}
        {error && (
          <div className="flex h-[180px] items-center justify-center">
            <p className="text-sm text-muted-foreground">
              Failed to load trend data.
            </p>
          </div>
        )}
        {!loading && !error && data.length === 0 && (
          <div className="flex h-[180px] items-center justify-center">
            <p className="text-sm text-muted-foreground">
              Not enough data yet.
            </p>
          </div>
        )}
        {!loading && !error && data.length > 0 && (
          <ResponsiveContainer width="100%" height={180}>
            <LineChart
              data={data}
              margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border)"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => '$' + (v / 1000).toFixed(1) + 'k'}
                width={48}
              />
              <Tooltip
                formatter={(value) => [formatCurrency(Number(value ?? 0)), 'Spent']}
                contentStyle={{
                  fontSize: 12,
                  border: '0.5px solid var(--border)',
                  borderRadius: 8,
                  background: 'var(--background)',
                  color: 'var(--foreground)',
                }}
              />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#378ADD"
                strokeWidth={2}
                dot={{ r: 3, fill: '#378ADD', strokeWidth: 0 }}
                activeDot={{ r: 5, fill: '#378ADD', strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}