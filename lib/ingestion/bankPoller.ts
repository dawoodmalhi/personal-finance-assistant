import { prisma } from '@/lib/prisma'
import { dedup } from './dedup'
import { ParsedTransaction } from './parseCSV'

interface BankTransaction {
  id: string
  date: string
  amount: number
  merchant: string
  category?: string
  description?: string
}

export async function pollBankTransactions(userId: string): Promise<{
  inserted: number
  duplicates: number
  errors: string[]
}> {
  const errors: string[] = []

  let raw: BankTransaction[] = []
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    const res = await fetch(`${baseUrl}/api/mock-bank/transactions`, {
      next: { revalidate: 0 },
    })
    if (!res.ok) throw new Error(`Bank API responded with ${res.status}`)
    raw = await res.json()
  } catch (err: any) {
    errors.push(`Failed to fetch from bank API: ${err.message}`)
    return { inserted: 0, duplicates: 0, errors }
  }

  // Transform to ParsedTransaction
  const parsed: ParsedTransaction[] = []
  for (const tx of raw) {
    const date = new Date(tx.date)
    if (isNaN(date.getTime())) {
      errors.push(`Skipped bank tx: invalid date "${tx.date}"`)
      continue
    }
    if (typeof tx.amount !== 'number' || isNaN(tx.amount)) {
      errors.push(`Skipped bank tx: invalid amount for "${tx.merchant}"`)
      continue
    }
    parsed.push({
      date,
      amount: Math.abs(tx.amount),
      merchant: tx.merchant?.trim() ?? 'Unknown',
      category: tx.category,
      description: tx.description,
    })
  }

  if (parsed.length === 0) {
    return { inserted: 0, duplicates: 0, errors }
  }

  const { toInsert, duplicates } = await dedup(parsed, userId)

  if (toInsert.length > 0) {
    await prisma.transaction.createMany({
      data: toInsert.map((tx) => ({
        userId,
        date: tx.date,
        amount: tx.amount,
        merchant: tx.merchant,
        category: tx.category ?? null,
        description: tx.description ?? null,
        source: 'BANK_API',
        isDuplicate: false,
      })),
      skipDuplicates: true,
    })
  }

  return {
    inserted: toInsert.length,
    duplicates: duplicates.length,
    errors,
  }
}