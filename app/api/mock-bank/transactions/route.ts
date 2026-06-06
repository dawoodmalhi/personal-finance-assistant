import { NextResponse } from 'next/server'

export async function GET() {
  const merchants = [
    { merchant: 'Whole Foods', category: 'Groceries' },
    { merchant: 'Uber', category: 'Transport' },
    { merchant: 'Netflix', category: 'Subscriptions' },
    { merchant: 'Chipotle', category: 'Dining' },
    { merchant: 'Amazon', category: 'Shopping' },
    { merchant: 'CVS Pharmacy', category: 'Healthcare' },
    { merchant: 'Spotify', category: 'Subscriptions' },
    { merchant: 'Con Edison', category: 'Utilities' },
  ]

  const transactions = Array.from({ length: 20 }, (_, i) => {
    const m = merchants[i % merchants.length]
    const date = new Date()
    date.setDate(date.getDate() - i * 3)
    return {
      id: `mock_${i}`,
      date: date.toISOString().split('T')[0],
      amount: parseFloat((Math.random() * 200 + 5).toFixed(2)),
      merchant: m.merchant,
      category: m.category,
      description: `${m.merchant} purchase`,
    }
  })

  return NextResponse.json(transactions)
}