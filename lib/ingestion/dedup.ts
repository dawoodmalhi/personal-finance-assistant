import { prisma } from '@/lib/prisma'
import { ParsedTransaction } from './parseCSV'

interface DedupResult {
  toInsert: ParsedTransaction[]
  duplicates: ParsedTransaction[]
}

function normalise(s: string) {
  return s.toLowerCase().trim()
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export async function dedup(
  transactions: ParsedTransaction[],
  userId: string
): Promise<DedupResult> {
  if (transactions.length === 0) {
    return { toInsert: [], duplicates: [] }
  }

  const dates = transactions.map((t) => t.date)
  const minDate = new Date(Math.min(...dates.map((d) => d.getTime())))
  const maxDate = new Date(Math.max(...dates.map((d) => d.getTime())))

  // Fetch existing transactions in the date range only (efficient)
  const existing = await prisma.transaction.findMany({
    where: {
      userId,
      date: { gte: minDate, lte: maxDate },
    },
    select: {
      date: true,
      amount: true,
      merchant: true,
    },
  })

  const toInsert: ParsedTransaction[] = []
  const duplicates: ParsedTransaction[] = []

  for (const tx of transactions) {
    const isDuplicate = existing.some(
      (e) =>
        sameDay(new Date(e.date), tx.date) &&
        Math.abs(Number(e.amount) - tx.amount) < 0.01 &&
        normalise(e.merchant) === normalise(tx.merchant)
    )

    if (isDuplicate) {
      duplicates.push(tx)
    } else {
      toInsert.push(tx)
    }
  }

  return { toInsert, duplicates }
}