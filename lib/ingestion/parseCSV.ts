import Papa from 'papaparse'

export interface ParsedTransaction {
  date: Date
  amount: number
  merchant: string
  category?: string
  description?: string
}

interface ParseResult {
  valid: ParsedTransaction[]
  errors: string[]
}

// Fuzzy column name mapping
const FIELD_ALIASES: Record<string, string[]> = {
  date: [
    'date', 'transaction date', 'trans date', 'posted date',
    'posting date', 'value date', 'created at',
  ],
  amount: [
    'amount', 'transaction amount', 'debit', 'credit',
    'sum', 'value', 'price', 'total',
  ],
  merchant: [
    'merchant', 'description', 'name', 'payee', 'vendor',
    'merchant name', 'transaction description', 'details',
  ],
  category: ['category', 'type', 'transaction type', 'cat'],
  note: ['note', 'notes', 'memo', 'reference', 'remarks'],
}

function resolveColumn(
  headers: string[],
  field: string
): string | undefined {
  const aliases = FIELD_ALIASES[field] ?? []
  return headers.find((h) =>
    aliases.includes(h.toLowerCase().trim())
  )
}

function parseAmount(raw: string): number | null {
  if (!raw || typeof raw !== 'string') return null
  // Remove currency symbols, spaces, keep minus sign, digits, dot, comma
  const cleaned = raw
    .replace(/[£$€¥₹\s]/g, '')
    .replace(/,(?=\d{3})/g, '') // remove thousands separators
    .replace(/,/g, '.') // handle European decimals
    .trim()
  const value = parseFloat(cleaned)
  if (isNaN(value)) return null
  return value
}

function parseDate(raw: string): Date | null {
  if (!raw || typeof raw !== 'string') return null
  const s = raw.trim()

  const formats = [
    // YYYY-MM-DD
    /^(\d{4})-(\d{2})-(\d{2})$/,
    // MM/DD/YYYY
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
    // DD-MM-YYYY
    /^(\d{1,2})-(\d{1,2})-(\d{4})$/,
    // DD/MM/YYYY
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
    // MM-DD-YYYY
    /^(\d{1,2})-(\d{1,2})-(\d{4})$/,
  ]

  // Try native Date first for ISO strings
  const native = new Date(s)
  if (!isNaN(native.getTime()) && s.includes('-')) return native

  // MM/DD/YYYY
  const mdyMatch = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (mdyMatch) {
    const d = new Date(
      parseInt(mdyMatch[3]),
      parseInt(mdyMatch[1]) - 1,
      parseInt(mdyMatch[2])
    )
    if (!isNaN(d.getTime())) return d
  }

  // DD-MM-YYYY
  const dmyMatch = s.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/)
  if (dmyMatch) {
    const d = new Date(
      parseInt(dmyMatch[3]),
      parseInt(dmyMatch[2]) - 1,
      parseInt(dmyMatch[1])
    )
    if (!isNaN(d.getTime())) return d
  }

  // DD/MM/YYYY (European)
  const dmySlash = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (dmySlash) {
    const d = new Date(
      parseInt(dmySlash[3]),
      parseInt(dmySlash[2]) - 1,
      parseInt(dmySlash[1])
    )
    if (!isNaN(d.getTime())) return d
  }

  // Fallback: let JS try
  const fallback = new Date(s)
  if (!isNaN(fallback.getTime())) return fallback

  return null
}

export function parseCSV(fileContent: string): ParseResult {
  const valid: ParsedTransaction[] = []
  const errors: string[] = []

  const result = Papa.parse<Record<string, string>>(fileContent, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  })

  if (result.errors.length > 0) {
    result.errors.forEach((e) =>
      errors.push(`CSV parse error at row ${e.row}: ${e.message}`)
    )
  }

  if (!result.data || result.data.length === 0) {
    errors.push('No data rows found in CSV')
    return { valid, errors }
  }

  const headers = Object.keys(result.data[0] ?? {})
  const dateCol = resolveColumn(headers, 'date')
  const amountCol = resolveColumn(headers, 'amount')
  const merchantCol = resolveColumn(headers, 'merchant')
  const categoryCol = resolveColumn(headers, 'category')
  const noteCol = resolveColumn(headers, 'note')

  if (!dateCol) errors.push('Warning: no date column found, rows may be skipped')
  if (!amountCol) errors.push('Warning: no amount column found, rows may be skipped')
  if (!merchantCol) errors.push('Warning: no merchant/description column found')

  result.data.forEach((row, i) => {
    const rowNum = i + 2 // 1-indexed + header row

    // Parse amount
    const rawAmount = amountCol ? row[amountCol] : ''
    const amount = parseAmount(rawAmount ?? '')
    if (amount === null) {
      errors.push(`Row ${rowNum}: skipped — invalid amount "${rawAmount}"`)
      return
    }

    // Parse date
    const rawDate = dateCol ? row[dateCol] : ''
    const date = parseDate(rawDate ?? '')
    if (!date) {
      errors.push(`Row ${rowNum}: skipped — invalid date "${rawDate}"`)
      return
    }

    // Parse merchant
    const merchant = merchantCol
      ? (row[merchantCol] ?? '').trim()
      : 'Unknown'
    if (!merchant) {
      errors.push(`Row ${rowNum}: skipped — missing merchant`)
      return
    }

    const category = categoryCol
      ? (row[categoryCol] ?? '').trim() || undefined
      : undefined

    const description = noteCol
      ? (row[noteCol] ?? '').trim() || undefined
      : undefined

    valid.push({ date, amount: Math.abs(amount), merchant, category, description })
  })

  return { valid, errors }
}