'use client'

import { useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Message } from '@/hooks/useChat'

interface ChatWindowProps {
  messages: Message[]
  isStreaming: boolean
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-1 py-2">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  )
}

function UserBubble({ content }: { content: string }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[75%] rounded-2xl rounded-tr-sm bg-blue-600 px-4 py-2.5 text-sm text-white shadow-sm">
        {content}
      </div>
    </div>
  )
}

function AssistantBubble({
  content,
  isStreaming,
}: {
  content: string
  isStreaming: boolean
}) {
  return (
    <div className="flex justify-start">
      <div className="flex items-start gap-2.5 max-w-[80%]">
        <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
          PF
        </div>
        <div className="rounded-2xl rounded-tl-sm border border-border bg-background px-4 py-2.5 text-sm shadow-sm">
          {content === '' && isStreaming ? (
            <TypingIndicator />
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({ children }) => (
                  <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>
                ),
                ul: ({ children }) => (
                  <ul className="mb-2 ml-4 list-disc space-y-1">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="mb-2 ml-4 list-decimal space-y-1">{children}</ol>
                ),
                li: ({ children }) => (
                  <li className="leading-relaxed">{children}</li>
                ),
                strong: ({ children }) => (
                  <strong className="font-medium text-foreground">
                    {children}
                  </strong>
                ),
                table: ({ children }) => (
                  <div className="my-2 overflow-x-auto rounded-md border border-border">
                    <table className="w-full text-xs">{children}</table>
                  </div>
                ),
                thead: ({ children }) => (
                  <thead className="bg-muted">{children}</thead>
                ),
                th: ({ children }) => (
                  <th className="px-3 py-2 text-left font-medium text-foreground">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="border-t border-border px-3 py-2 text-muted-foreground">
                    {children}
                  </td>
                ),
                code: ({ children }) => (
                  <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
                    {children}
                  </code>
                ),
                h1: ({ children }) => (
                  <h1 className="mb-2 text-base font-medium">{children}</h1>
                ),
                h2: ({ children }) => (
                  <h2 className="mb-2 text-sm font-medium">{children}</h2>
                ),
                h3: ({ children }) => (
                  <h3 className="mb-1 text-sm font-medium">{children}</h3>
                ),
              }}
            >
              {content}
            </ReactMarkdown>
          )}
        </div>
      </div>
    </div>
  )
}

export function ChatWindow({ messages, isStreaming }: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isStreaming])

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-xl font-bold text-muted-foreground">
          PF
        </div>
        <div>
          <p className="font-medium text-foreground">
            Personal Finance Assistant
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Ask me anything about your spending, budgets, or transactions.
          </p>
        </div>
        <div className="mt-2 flex flex-wrap justify-center gap-2">
          {[
            'How much did I spend last month?',
            'What are my active subscriptions?',
            'Where can I cut back?',
            'Summarise my finances',
          ].map((prompt) => (
            <button
              key={prompt}
              className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              onClick={() => {
                const event = new CustomEvent('suggestion', {
                  detail: prompt,
                })
                window.dispatchEvent(event)
              }}
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 pb-2">
      {messages.map((message, i) => {
        const isLast = i === messages.length - 1
        if (message.role === 'user') {
          return <UserBubble key={message.id} content={message.content} />
        }
        return (
          <AssistantBubble
            key={message.id}
            content={message.content}
            isStreaming={isStreaming && isLast}
          />
        )
      })}
      <div ref={bottomRef} />
    </div>
  )
}