'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Transaction } from '@prisma/client'
import { useCallback, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import {
  Search,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  X,
} from 'lucide-react'

interface TransactionsTableProps {
  transactions: Transaction[]
  total: number
  page: number
  pageSize: number
  categories: string[]
  currentCategory: string
  currentSource: string
  currentSearch: string
}

const SOURCE_LABELS: Record<string, string> = {
  CSV: 'CSV',
  BANK_API: 'Bank',
  RECEIPT: 'Receipt',
  MANUAL: 'Manual',
}

const SOURCES = ['CSV', 'BANK_API', 'RECEIPT', 'MANUAL']

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
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount)
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date))
}

export function TransactionsTable({
  transactions,
  total,
  page,
  pageSize,
  categories,
  currentCategory,
  currentSource,
  currentSearch,
}: TransactionsTableProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(currentSearch)
  const totalPages = Math.ceil(total / pageSize)

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      params.delete('page')
      router.push(`${pathname}?${params.toString()}`)
    },
    [searchParams, pathname, router]
  )

  function goToPage(p: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(p))
    router.push(`${pathname}?${params.toString()}`)
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    updateParam('search', search)
  }

  function clearFilters() {
    setSearch('')
    router.push(pathname)
  }

  const hasFilters = currentCategory || currentSource || currentSearch
  const start = (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, total)

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-wrap items-center gap-3">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground shrink-0" />

            {/* Search */}
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search merchant..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-8 w-48 rounded-md border border-input bg-background pl-8 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
              <button
                type="submit"
                className="h-8 rounded-md border border-input bg-background px-3 text-xs hover:bg-muted"
              >
                Search
              </button>
            </form>

            {/* Category filter */}
            <select
              value={currentCategory}
              onChange={(e) => updateParam('category', e.target.value)}
              className="h-8 rounded-md border border-input bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="">All categories</option>
              {categories.sort().map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {/* Source filter */}
            <select
              value={currentSource}
              onChange={(e) => updateParam('source', e.target.value)}
              className="h-8 rounded-md border border-input bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="">All sources</option>
              {SOURCES.map((s) => (
                <option key={s} value={s}>
                  {SOURCE_LABELS[s]}
                </option>
              ))}
            </select>

            {/* Clear filters */}
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
                Clear
              </button>
            )}

            <span className="ml-auto text-xs text-muted-foreground">
              {total > 0 ? `${start}–${end} of ${total}` : '0 results'}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-sm font-medium text-foreground">
                No transactions found
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {hasFilters
                  ? 'Try adjusting your filters'
                  : 'Upload a CSV or connect your bank to get started'}
              </p>
              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="mt-3 text-xs text-blue-600 hover:underline"
                >
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                      Merchant
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                      Category
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                      Description
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                      Source
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {transactions.map((tx) => {
                    const catColor =
                      CATEGORY_COLORS[tx.category ?? ''] ?? '#888780'
                    return (
                      <tr
                        key={tx.id}
                        className="hover:bg-muted/40 transition-colors"
                      >
                        <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                          {formatDate(tx.date)}
                        </td>
                        <td className="px-4 py-3 font-medium text-foreground max-w-[180px] truncate">
                          {tx.merchant}
                        </td>
                        <td className="px-4 py-3">
                          {tx.category ? (
                            <span
                              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
                              style={{
                                background: catColor + '20',
                                color: catColor,
                              }}
                            >
                              <span
                                className="h-1.5 w-1.5 rounded-full"
                                style={{ background: catColor }}
                              />
                              {tx.category}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              —
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground max-w-[200px] truncate">
                          {tx.description ?? '—'}
                        </td>
                        <td className="px-4 py-3">
                          <span className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                            {SOURCE_LABELS[tx.source] ?? tx.source}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-destructive whitespace-nowrap">
                          -{formatCurrency(Number(tx.amount))}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Page {page} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => goToPage(page - 1)}
              disabled={page <= 1}
              className="flex items-center gap-1 rounded-md border border-input px-3 py-1.5 hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Previous
            </button>
            <button
              onClick={() => goToPage(page + 1)}
              disabled={page >= totalPages}
              className="flex items-center gap-1 rounded-md border border-input px-3 py-1.5 hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}