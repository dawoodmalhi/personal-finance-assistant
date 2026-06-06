// app/api/categories/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const distinctCategories = await prisma.transaction.findMany({
      where: { 
        userId,
        category: { not: null } 
      },
      distinct: ['category'],
      select: { category: true },
    });

    const categoryList = distinctCategories
      .map((c) => c.category)
      .filter((c): c is string => Boolean(c));

    return NextResponse.json(categoryList);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}