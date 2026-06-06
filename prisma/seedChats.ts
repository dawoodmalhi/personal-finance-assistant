import { prisma } from '../lib/prisma'

const MOCK_CHATS = [
  {
    role: 'USER' as const,
    content: 'How much did I spend on groceries last month?',
  },
  {
    role: 'ASSISTANT' as const,
    content:
      'Based on your transactions, you spent **$680.00** on groceries last month across 4 transactions:\n\n| Merchant | Amount |\n|---|---|\n| Whole Foods | $243.17 |\n| Trader Joe\'s | $139.61 |\n| Costco | $243.17 |\n| Aldi | $54.10 |\n\nThis is **12% higher** than the previous month ($607.00). Your grocery budget is set to $800/month, so you\'re still within limits.',
  },
  {
    role: 'USER' as const,
    content: 'What are my active subscriptions?',
  },
  {
    role: 'ASSISTANT' as const,
    content:
      'You have **5 active subscriptions** totalling **$56.95/month**:\n\n1. **Netflix** — $15.99/mo\n2. **Spotify** — $9.99/mo\n3. **Hulu** — $17.99/mo\n4. **Apple App Store** — $9.99/mo\n5. **iCloud** — $2.99/mo\n\nWould you like me to flag any of these as ones you might want to cancel?',
  },
  {
    role: 'USER' as const,
    content: 'Am I spending more than usual this month?',
  },
  {
    role: 'ASSISTANT' as const,
    content:
      'Yes, your spending is trending **higher than usual** this month.\n\n- **This month so far:** $3,284\n- **Last month total:** $2,931\n- **3-month average:** $2,756\n\nThe biggest drivers of the increase are:\n- **Travel** (+$445 — United Airlines flight)\n- **Shopping** (+$299 — Best Buy headphones)\n\nWithout those two one-off purchases, your spending would be roughly on par with your average.',
  },
  {
    role: 'USER' as const,
    content: 'Suggest where I can cut back.',
  },
  {
    role: 'ASSISTANT' as const,
    content:
      'Here are 3 concrete areas where you could cut back:\n\n**1. Dining out — save ~$150/mo**\nYou\'re spending ~$420/month dining out. Cooking at home 3 more times per week could bring this under $270.\n\n**2. Subscriptions — save ~$28/mo**\nYou have overlapping streaming services (Netflix + Hulu). Dropping one could save ~$18/mo. Adobe CC ($54.99) is currently inactive — cancel it to save another $55/mo.\n\n**3. Grocery delivery fees — save ~$20/mo**\nYou\'ve used Instacart twice this month ($94.30 total). Switching to in-store shopping or a delivery membership could cut fees significantly.',
  },
]

async function seedChats() {
  const user = await prisma.user.findFirst({
    where: { clerkId: 'user_3ElIgJmgemhbnCuIs0DBSKRycMe' },
  })

  if (!user) {
    console.error('Seed user not found. Run prisma/seed.ts first.')
    process.exit(1)
  }

  const existing = await prisma.chatMessage.count({
    where: { userId: user.id },
  })

  if (existing > 0) {
    console.log(`Skipping — ${existing} chat messages already exist`)
    process.exit(0)
  }

  await prisma.chatMessage.createMany({
    data: MOCK_CHATS.map((m) => ({
      userId: user.id,
      role: m.role,
      content: m.content,
    })),
  })

  console.log(`Seeded ${MOCK_CHATS.length} chat messages`)
}

seedChats()
  .catch(console.error)
  .finally(() => prisma.$disconnect())