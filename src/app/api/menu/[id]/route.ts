import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { name, description, price, category, imageUrl, available } = await req.json();

  const store = await prisma.store.findUnique({ where: { userId: session.user.id } });
  if (!store) return NextResponse.json({ error: "No store" }, { status: 404 });

  const item = await prisma.menuItem.update({
    where: { id, storeId: store.id },
    data: { name, description, price: parseFloat(price), category, imageUrl, available },
  });

  return NextResponse.json(item);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const store = await prisma.store.findUnique({ where: { userId: session.user.id } });
  if (!store) return NextResponse.json({ error: "No store" }, { status: 404 });

  await prisma.menuItem.delete({ where: { id, storeId: store.id } });
  return NextResponse.json({ success: true });
}
