import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { startOfMonth, endOfMonth } from "date-fns";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || !user.id) return new NextResponse("Unauthorized", { status: 401 });
    const userId = user.id;

    const budgets = await prisma.budget.findMany({
      where: { userId },
    });

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

    const enrichedBudgets = budgets.map((b) => ({
      ...b,
      spent: Number(spendMap[b.category] || 0),
    }));

    return NextResponse.json(enrichedBudgets);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.id) return new NextResponse("Unauthorized", { status: 401 });
    const userId = user.id;

    const body = await req.json();
    const { category, limitAmount, period = "MONTHLY" } = body;

    if (!category || !limitAmount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const budget = await prisma.budget.upsert({
      where: {
        userId_category_period: { userId, category, period },
      },
      update: { limitAmount: parseFloat(limitAmount) },
      create: {
        userId,
        category,
        limitAmount: parseFloat(limitAmount),
        period,
      },
    });

    return NextResponse.json(budget);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}