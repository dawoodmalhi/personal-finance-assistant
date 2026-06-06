'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AnomalyFlag, Transaction } from '@prisma/client'
import { AlertTriangle, AlertCircle, Info, CheckCircle } from 'lucide-react'

type AnomalyWithTransaction = AnomalyFlag & {
  transaction: Transaction
}

interface AnomalyFlagsProps {
  anomalies: AnomalyWithTransaction[]
}

const SEVERITY_CONFIG = {
  HIGH: {
    label: 'High',
    bg: '#FCEBEB',
    text: '#A32D2D',
    border: '#F09595',
    icon: <AlertCircle className="h-4 w-4" />,
  },
  MEDIUM: {
    label: 'Medium',
    bg: '#FAEEDA',
    text: '#633806',
    border: '#FAC775',
    icon: <AlertTriangle className="h-4 w-4" />,
  },
  LOW: {
    label: 'Low',
    bg: '#EAF3DE',
    text: '#27500A',
    border: '#C0DD97',
    icon: <Info className="h-4 w-4" />,
  },
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
    year: 'numeric',
  }).format(new Date(date))
}

export function AnomalyFlags({ anomalies }: AnomalyFlagsProps) {
  const unseen = anomalies.filter((a) => !a.seenByUser)
  const seen = anomalies.filter((a) => a.seenByUser)

  if (anomalies.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            <span className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Anomaly flags
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No unusual activity detected. Your spending looks normal.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">
          <span className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            Anomaly flags
          </span>
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          {unseen.length > 0
            ? `${unseen.length} new flag${unseen.length > 1 ? 's' : ''} need review`
            : 'All flags reviewed'}
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {unseen.length > 0 && (
          <div className="space-y-2">
            {unseen.map((anomaly) => (
              <AnomalyRow key={anomaly.id} anomaly={anomaly} />
            ))}
          </div>
        )}

        {seen.length > 0 && (
          <>
            <p className="pt-1 text-xs font-medium text-muted-foreground">
              Previously reviewed
            </p>
            <div className="space-y-2 opacity-60">
              {seen.map((anomaly) => (
                <AnomalyRow key={anomaly.id} anomaly={anomaly} />
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

function AnomalyRow({ anomaly }: { anomaly: AnomalyWithTransaction }) {
  const config = SEVERITY_CONFIG[anomaly.severity]

  return (
    <div
      className="flex items-start gap-3 rounded-lg border p-3"
      style={{
        background: config.bg,
        borderColor: config.border,
      }}
    >
      <div
        className="mt-0.5 shrink-0"
        style={{ color: config.text }}
        aria-hidden="true"
      >
        {config.icon}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className="rounded-full px-2 py-0.5 text-xs font-medium"
            style={{ background: config.border, color: config.text }}
          >
            {config.label}
          </span>
          <span className="text-sm font-medium" style={{ color: config.text }}>
            {anomaly.transaction.merchant}
          </span>
          <span className="text-xs" style={{ color: config.text, opacity: 0.8 }}>
            {formatCurrency(Number(anomaly.transaction.amount))}
          </span>
          <span className="text-xs" style={{ color: config.text, opacity: 0.7 }}>
            · {formatDate(anomaly.transaction.date)}
          </span>
        </div>

        <p
          className="mt-1 text-xs leading-relaxed"
          style={{ color: config.text, opacity: 0.85 }}
        >
          {anomaly.reason}
        </p>
      </div>
    </div>
  )
}