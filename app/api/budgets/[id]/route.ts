import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.id) return new NextResponse("Unauthorized", { status: 401 });
    const userId = user.id;

    const id = (await params).id;
    const body = await req.json();
    const { limitAmount } = body;

    const budget = await prisma.budget.update({
      where: { id, userId },
      data: { limitAmount: parseFloat(limitAmount) },
    });

    return NextResponse.json(budget);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.id) return new NextResponse("Unauthorized", { status: 401 });
    const userId = user.id;
    
    const id = (await params).id;
    await prisma.budget.delete({
      where: { id, userId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}