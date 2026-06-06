import { startOfMonth, endOfMonth } from "date-fns";
import { prisma } from "@/lib/prisma";

// --- 1. Anthropic Tool Definitions ---
export const budgetTools = [
  {
    name: "get_budgets",
    description: "Fetch the user's current budgets, current spend, and indicates if they are near their limit.",
    input_schema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "set_budget",
    description: "Creates or updates a budget for a specific category.",
    input_schema: {
      type: "object",
      properties: {
        category: { type: "string", description: "The transaction category, e.g., 'Groceries', 'Dining'" },
        limitAmount: { type: "number", description: "The dollar amount limit for the period" },
        period: { 
          type: "string", 
          enum: ["MONTHLY", "WEEKLY"], // Tell the AI it MUST use these exact strings
          description: "Default is 'MONTHLY'" 
        }
      },
      required: ["category", "limitAmount"]
    },
  }
];

// --- 2. System Prompt Injection ---
/* Add this text to your Claude System Prompt:
   "You have access to the user's budgets. If the user asks about spending, call get_budgets. 
   If any returned budget has the 'nearLimit' flag set to true, proactively warn the user 
   about it in your response. You can also create/update budgets using set_budget."
*/

// --- 3. Tool Execution Handlers ---
export async function handleGetBudgets(userId: string) {
  const budgets = await prisma.budget.findMany({ where: { userId } });
  
  const start = startOfMonth(new Date());
  const end = endOfMonth(new Date());

  const transactions = await prisma.transaction.groupBy({
    by: ["category"],
    where: {
      userId,
      date: { gte: start, lte: end },
      category: { in: budgets.map((b) => b.category) },
    },
    _sum: { amount: true },
  });

  const spendMap = Object.fromEntries(
    transactions.map((t) => [t.category, t._sum.amount || 0])
  );

  return budgets.map((b) => {
    const spent = Number(spendMap[b.category] || 0);
    const limit = Number(b.limitAmount);
    
    const ratio = spent / limit;
    
    return {
      category: b.category,
      limitAmount: limit,
      spent,
      period: b.period,
      nearLimit: ratio >= 0.8 // Flags true if >= 80% spent
    };
  });
}

export async function handleSetBudget(userId: string, args: any) {
  const { category, limitAmount, period = "MONTHLY" } = args;
  
  const budget = await prisma.budget.upsert({
    where: {
      userId_category_period: { userId, category, period },
    },
    update: { limitAmount },
    create: { userId, category, limitAmount, period },
  });

  return { success: true, budget };
}