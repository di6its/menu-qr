import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { status } = await req.json();

  const store = await prisma.store.findUnique({ where: { userId: session.user.id } });
  if (!store) return NextResponse.json({ error: "No store" }, { status: 404 });

  const order = await prisma.order.update({
    where: { id, storeId: store.id },
    data: { status },
    include: { items: { include: { menuItem: true } }, table: true },
  });

  return NextResponse.json(order);
}
