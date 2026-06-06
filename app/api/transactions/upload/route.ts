import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { parseCSV } from '@/lib/ingestion/parseCSV'
import { dedup } from '@/lib/ingestion/dedup'

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()

    const formData = await req.formData()
    const file = formData.get('file')

    if (!file || typeof file === 'string') {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      )
    }

    const blob = file as File
    if (!blob.name.endsWith('.csv')) {
      return NextResponse.json(
        { error: 'Only CSV files are supported' },
        { status: 400 }
      )
    }

    if (blob.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB' },
        { status: 400 }
      )
    }

    const content = await blob.text()

    // Parse
    const { valid, errors } = parseCSV(content)

    if (valid.length === 0) {
      return NextResponse.json({
        inserted: 0,
        duplicates: 0,
        errors,
      })
    }

    // Dedup
    const { toInsert, duplicates } = await dedup(valid, user.id)

    // Batch insert
    if (toInsert.length > 0) {
      await prisma.transaction.createMany({
        data: toInsert.map((tx) => ({
          userId: user.id,
          date: tx.date,
          amount: tx.amount,
          merchant: tx.merchant,
          category: tx.category ?? null,
          description: tx.description ?? null,
          source: 'CSV',
          isDuplicate: false,
        })),
        skipDuplicates: true,
      })
    }

    return NextResponse.json({
      inserted: toInsert.length,
      duplicates: duplicates.length,
      errors,
    })
  } catch (err: any) {
    console.error('Upload error:', err)
    if (err.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}