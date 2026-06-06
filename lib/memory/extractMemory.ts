import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/prisma";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function extractMemory(userId: string, userMessage: string) {
  try {
    const response = await anthropic.messages.create({
      model: "claude-3-5-haiku-latest",
      max_tokens: 200,
      temperature: 0.1,
      system: `Given this conversation message, extract any user preferences or facts to remember. Examples: pay dates, excluded categories, financial goals, family context. Return JSON strictly in this format: {"facts": [{"key": "string", "value": "string"}]} or {"facts": []} if nothing new. Return ONLY valid JSON, no markdown blocks.`,
      messages: [{ role: "user", content: userMessage }],
    });

    const content = (response.content[0] as any).text.trim();
    const parsed = JSON.parse(content);

    if (parsed.facts && parsed.facts.length > 0) {
      // Fetch existing memory
      const memory = await prisma.userMemory.findUnique({
        where: { userId }
      });

      // Merge JSON
      const currentPreferences = memory?.preferences ? (memory.preferences as any) : {};
      
      parsed.facts.forEach((fact: { key: string; value: string }) => {
        currentPreferences[fact.key] = fact.value;
      });

      // Save back to DB
      await prisma.userMemory.upsert({
        where: { userId },
        update: { preferences: currentPreferences },
        create: { userId, preferences: currentPreferences }
      });
    }
  } catch (error) {
    console.error("Memory extraction failed silently in background:", error);
  }
}