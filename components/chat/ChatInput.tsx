'use client'

import {
  useState,
  useRef,
  useEffect,
  KeyboardEvent,
  ChangeEvent,
} from 'react'
import { Paperclip, Send, X } from 'lucide-react'

interface ChatInputProps {
  onSend: (text: string, imageBase64?: string) => void
  isStreaming: boolean
}

export function ChatInput({ onSend, isStreaming }: ChatInputProps) {
  const [text, setText] = useState('')
  const [imageBase64, setImageBase64] = useState<string | undefined>()
  const [imagePreview, setImagePreview] = useState<string | undefined>()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`
  }, [text])

  // Listen for suggestion clicks from ChatWindow
  useEffect(() => {
    const handler = (e: Event) => {
      const suggestion = (e as CustomEvent).detail as string
      setText(suggestion)
      textareaRef.current?.focus()
    }
    window.addEventListener('suggestion', handler)
    return () => window.removeEventListener('suggestion', handler)
  }, [])

  function handleSend() {
    if ((!text.trim() && !imageBase64) || isStreaming) return
    onSend(text.trim(), imageBase64)
    setText('')
    setImageBase64(undefined)
    setImagePreview(undefined)
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const preview = URL.createObjectURL(file)
    setImagePreview(preview)

    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      // Strip data:image/...;base64, prefix
      const base64 = result.split(',')[1]
      setImageBase64(base64)
    }
    reader.readAsDataURL(file)
  }

  function clearImage() {
    setImageBase64(undefined)
    setImagePreview(undefined)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const canSend = (text.trim().length > 0 || !!imageBase64) && !isStreaming

  return (
    <div className="border-t border-border bg-background p-4 rounded-b-lg">
      {/* Image preview */}
      {imagePreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Attached image"
              className="h-16 w-16 rounded-lg object-cover border border-border"
            />
            <button
              onClick={clearImage}
              className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-background hover:bg-muted-foreground"
              aria-label="Remove image"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            Image attached — I'll extract details from it
          </p>
        </div>
      )}

      <div className="flex items-end gap-2">
        {/* File picker */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isStreaming}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40"
          aria-label="Attach image"
        >
          <Paperclip className="h-4 w-4" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isStreaming}
          placeholder={
            isStreaming
              ? 'Waiting for response...'
              : 'Ask about your finances… (Enter to send, Shift+Enter for newline)'
          }
          rows={1}
          className="flex-1 resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
        />

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={!canSend}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white transition-colors hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Send message"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        Responses are based on your transaction history and may not be financial advice.
      </p>
    </div>
  )
}