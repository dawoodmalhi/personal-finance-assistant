'use client'

import { useState, useRef, DragEvent, ChangeEvent } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, FileText, CheckCircle, AlertCircle, X } from 'lucide-react'

interface UploadResult {
  inserted: number
  duplicates: number
  errors: string[]
}

type UploadState =
  | { status: 'idle' }
  | { status: 'dragging' }
  | { status: 'uploading'; fileName: string }
  | { status: 'success'; result: UploadResult; fileName: string }
  | { status: 'error'; message: string }

export function UploadCSV() {
  const [state, setState] = useState<UploadState>({ status: 'idle' })
  const inputRef = useRef<HTMLInputElement>(null)

  async function upload(file: File) {
    if (!file.name.endsWith('.csv')) {
      setState({ status: 'error', message: 'Only CSV files are supported.' })
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setState({ status: 'error', message: 'File too large. Max size is 10MB.' })
      return
    }

    setState({ status: 'uploading', fileName: file.name })

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/transactions/upload', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()

      if (!res.ok) {
        setState({
          status: 'error',
          message: data.error ?? 'Upload failed.',
        })
        return
      }

      setState({ status: 'success', result: data, fileName: file.name })
    } catch {
      setState({
        status: 'error',
        message: 'Network error. Please try again.',
      })
    }
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) upload(file)
    else setState({ status: 'idle' })
  }

  function onDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setState({ status: 'dragging' })
  }

  function onDragLeave() {
    setState({ status: 'idle' })
  }

  function onChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) upload(file)
  }

  function reset() {
    setState({ status: 'idle' })
    if (inputRef.current) inputRef.current.value = ''
  }

  const isDragging = state.status === 'dragging'
  const isUploading = state.status === 'uploading'

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">
          Import transactions
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Upload a CSV file from your bank or export tool
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Dropzone */}
        {(state.status === 'idle' || state.status === 'dragging') && (
          <div
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onClick={() => inputRef.current?.click()}
            className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
              isDragging
                ? 'border-blue-400 bg-blue-50 dark:bg-blue-950/20'
                : 'border-border hover:border-muted-foreground/50 hover:bg-muted/30'
            }`}
          >
            <Upload
              className={`h-8 w-8 ${
                isDragging ? 'text-blue-500' : 'text-muted-foreground'
              }`}
            />
            <div>
              <p className="text-sm font-medium text-foreground">
                {isDragging ? 'Drop your CSV here' : 'Drop CSV or click to browse'}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Supports most bank export formats · Max 10MB
              </p>
            </div>
            <input
              ref={inputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={onChange}
            />
          </div>
        )}

        {/* Uploading */}
        {state.status === 'uploading' && (
          <div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-muted/30 p-8">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground border-t-blue-500" />
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">
                Importing transactions...
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {state.fileName}
              </p>
            </div>
          </div>
        )}

        {/* Success */}
        {state.status === 'success' && (
          <div className="space-y-3 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950/20">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-800 dark:text-green-300">
                    Import complete
                  </p>
                  <p className="text-xs text-green-700 dark:text-green-400">
                    {state.fileName}
                  </p>
                </div>
              </div>
              <button
                onClick={reset}
                className="text-green-600 hover:text-green-800"
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex gap-4 text-sm">
              <div className="text-center">
                <p className="text-xl font-medium text-green-800 dark:text-green-300">
                  {state.result.inserted}
                </p>
                <p className="text-xs text-green-700 dark:text-green-400">
                  imported
                </p>
              </div>
              <div className="text-center">
                <p className="text-xl font-medium text-yellow-700 dark:text-yellow-400">
                  {state.result.duplicates}
                </p>
                <p className="text-xs text-yellow-600 dark:text-yellow-500">
                  duplicates skipped
                </p>
              </div>
              {state.result.errors.length > 0 && (
                <div className="text-center">
                  <p className="text-xl font-medium text-red-700 dark:text-red-400">
                    {state.result.errors.length}
                  </p>
                  <p className="text-xs text-red-600 dark:text-red-500">
                    rows skipped
                  </p>
                </div>
              )}
            </div>

            {state.result.errors.length > 0 && (
              <details className="text-xs">
                <summary className="cursor-pointer text-green-700 dark:text-green-400">
                  Show {state.result.errors.length} warnings
                </summary>
                <ul className="mt-2 space-y-1 text-muted-foreground">
                  {state.result.errors.map((e, i) => (
                    <li key={i} className="truncate">
                      {e}
                    </li>
                  ))}
                </ul>
              </details>
            )}

            <button
              onClick={reset}
              className="w-full rounded-md border border-green-300 py-1.5 text-xs text-green-700 hover:bg-green-100 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-950"
            >
              Import another file
            </button>
          </div>
        )}

        {/* Error */}
        {state.status === 'error' && (
          <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/20">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800 dark:text-red-300">
                Upload failed
              </p>
              <p className="mt-0.5 text-xs text-red-700 dark:text-red-400">
                {state.message}
              </p>
            </div>
            <button
              onClick={reset}
              className="text-red-600 hover:text-red-800"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* File info */}
        {state.status === 'idle' && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <FileText className="h-3.5 w-3.5" />
            <span>
              Accepts exports from Chase, Bank of America, Wells Fargo,
              Mint, and most standard CSV formats
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}