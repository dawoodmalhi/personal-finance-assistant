import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { pollBankTransactions } from '@/lib/ingestion/bankPoller'

export async function POST() {
  try {
    const user = await getCurrentUser()
    const result = await pollBankTransactions(user.id)
    return NextResponse.json(result)
  } catch (err: any) {
    if (err.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}