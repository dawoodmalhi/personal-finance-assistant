import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const { messages, imageBase64 } = await req.json();

    // Persist user message
    const lastUserMsg = messages[messages.length - 1];
    if (lastUserMsg?.role === "user") {
      await prisma.chatMessage.create({
        data: {
          userId: user.id,
          role: "USER",
          content: lastUserMsg.content,
        },
      });
    }

    // Fetch user context
    const [memory, recentTxs, budgets] = await Promise.all([
      prisma.userMemory.findUnique({ where: { userId: user.id } }),
      prisma.transaction.findMany({
        where: { userId: user.id, isDuplicate: false },
        orderBy: { date: "desc" },
        take: 20,
        select: {
          date: true,
          amount: true,
          merchant: true,
          category: true,
        },
      }),
      prisma.budget.findMany({ where: { userId: user.id } }),
    ]);

    const systemPrompt = `You are a personal finance assistant. You have access to the user's transaction history and financial data.

Today's date: ${new Date().toDateString()}
User: ${user.name ?? user.email}

Recent transactions (last 20):
${recentTxs
  .map(
    (t) =>
      `- ${new Date(t.date).toLocaleDateString()} | ${t.merchant} | $${Number(t.amount).toFixed(2)} | ${t.category ?? "Uncategorized"}`,
  )
  .join("\n")}

Active budgets:
${
  budgets.length > 0
    ? budgets
        .map(
          (b) =>
            `- ${b.category}: $${Number(b.limitAmount).toFixed(0)}/${b.period.toLowerCase()}`,
        )
        .join("\n")
    : "No budgets set"
}

User preferences: ${JSON.stringify(memory?.preferences ?? {})}

Guidelines:
- Be concise and data-backed. Use numbers from their actual transactions.
- Use markdown for tables and lists when it helps clarity.
- If you cannot answer from the data available, say so clearly.
- Do not make up transaction data.
- Keep responses focused and actionable.`;

    // Build messages for Claude
    const claudeMessages: Anthropic.MessageParam[] = messages.map(
      (m: { role: string; content: string }, i: number) => {
        const isLast = i === messages.length - 1;
        if (isLast && imageBase64) {
          return {
            role: "user" as const,
            content: [
              {
                type: "image" as const,
                source: {
                  type: "base64" as const,
                  media_type: "image/jpeg" as const,
                  data: imageBase64,
                },
              },
              { type: "text" as const, text: m.content || "What is this?" },
            ],
          };
        }
        return {
          role: m.role === "user" ? ("user" as const) : ("assistant" as const),
          content: m.content,
        };
      },
    );

    // Stream response
    const stream = await anthropic.messages.stream({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: systemPrompt,
      messages: claudeMessages,
    });

    let fullResponse = "";

    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          if (
            chunk.type === "content_block_delta" &&
            chunk.delta.type === "text_delta"
          ) {
            const text = chunk.delta.text;
            fullResponse += text;
            controller.enqueue(new TextEncoder().encode(text));
          }
        }
        controller.close();

        // Persist assistant response after streaming completes
        await prisma.chatMessage.create({
          data: {
            userId: user.id,
            role: "ASSISTANT",
            content: fullResponse,
          },
        });
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err: any) {
    console.error("Chat error:", err);
    if (err.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
