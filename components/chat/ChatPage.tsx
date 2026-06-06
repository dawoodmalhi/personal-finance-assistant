'use client'

import { ChatWindow } from './ChatWindow'
import { ChatInput } from './ChatInput'
import { useChat, Message } from '@/hooks/useChat'

interface ChatPageProps {
  initialMessages: Message[]
}

export function ChatPage({ initialMessages }: ChatPageProps) {
  const { messages, sendMessage, isStreaming } = useChat(initialMessages)

  return (
    <div className="flex h-[calc(100vh-56px)] flex-col space-y-6 max-w-7xl mx-auto rounded-lg border my-8">
      <ChatWindow messages={messages} isStreaming={isStreaming} />
      <ChatInput onSend={sendMessage} isStreaming={isStreaming} />
    </div>
  )
}