import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ChatPage } from '@/components/chat/ChatPage'

export default async function Chat() {
  const user = await getCurrentUser()

  const history = await prisma.chatMessage.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'asc' },
    take: 100,
  })

  const initialMessages = history.map((m) => ({
    id: m.id,
    role: m.role === 'USER' ? ('user' as const) : ('assistant' as const),
    content: m.content,
  }))

  return <ChatPage initialMessages={initialMessages} />
}