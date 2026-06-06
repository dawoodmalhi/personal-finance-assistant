'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Building, RefreshCw, CheckCircle, AlertCircle, X } from 'lucide-react'

interface PollResult {
  inserted: number
  duplicates: number
  errors: string[]
}

type PollState =
  | { status: 'idle' }
  | { status: 'polling' }
  | { status: 'success'; result: PollResult }
  | { status: 'error'; message: string }

export function PollBank() {
  const [state, setState] = useState<PollState>({ status: 'idle' })

  async function handlePoll() {
    setState({ status: 'polling' })

    try {
      const res = await fetch('/api/transactions/poll-bank', {
        method: 'POST',
      })
      const data = await res.json()

      if (!res.ok) {
        setState({
          status: 'error',
          message: data.error ?? 'Failed to sync with bank.',
        })
        return
      }

      setState({ status: 'success', result: data })
    } catch {
      setState({
        status: 'error',
        message: 'Network error. Please try again.',
      })
    }
  }

  function reset() {
    setState({ status: 'idle' })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">
          Bank Synchronization
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Automatically pull your latest transactions
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Idle State */}
        {state.status === 'idle' && (
          <div
            onClick={handlePoll}
            className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-border p-8 text-center transition-colors hover:border-muted-foreground/50 hover:bg-muted/30"
          >
            <Building className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-foreground">
                Sync Mock Bank
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Fetch the latest 20 transactions
              </p>
            </div>
          </div>
        )}

        {/* Polling State */}
        {state.status === 'polling' && (
          <div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-muted/30 p-8">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">
                Connecting to bank...
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Fetching latest transactions securely
              </p>
            </div>
          </div>
        )}

        {/* Success State */}
        {state.status === 'success' && (
          <div className="space-y-3 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950/20">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-800 dark:text-green-300">
                    Sync complete
                  </p>
                  <p className="text-xs text-green-700 dark:text-green-400">
                    Connection successful
                  </p>
                </div>
              </div>
              <button onClick={reset} className="text-green-600 hover:text-green-800">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex gap-4 text-sm">
              <div className="text-center">
                <p className="text-xl font-medium text-green-800 dark:text-green-300">
                  {state.result.inserted}
                </p>
                <p className="text-xs text-green-700 dark:text-green-400">imported</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-medium text-yellow-700 dark:text-yellow-400">
                  {state.result.duplicates}
                </p>
                <p className="text-xs text-yellow-600 dark:text-yellow-500">skipped</p>
              </div>
            </div>

            <button
              onClick={reset}
              className="w-full rounded-md border border-green-300 py-1.5 text-xs text-green-700 hover:bg-green-100 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-950"
            >
              Sync again
            </button>
          </div>
        )}

        {/* Error State */}
        {state.status === 'error' && (
          <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/20">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800 dark:text-red-300">Sync failed</p>
              <p className="mt-0.5 text-xs text-red-700 dark:text-red-400">{state.message}</p>
            </div>
            <button onClick={reset} className="text-red-600 hover:text-red-800">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}