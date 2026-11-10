import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const store = await prisma.store.findUnique({ where: { userId: session.user.id } });
  if (!store) return NextResponse.json([]);

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const orders = await prisma.order.findMany({
    where: {
      storeId: store.id,
      ...(status && status !== "all" ? { status } : {}),
    },
    include: {
      items: { include: { menuItem: true } },
      table: true,
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json(orders);
}

export async function POST(req: Request) {
  const { storeSlug, tableId, customerName, notes, items } = await req.json();

  const store = await prisma.store.findUnique({ where: { slug: storeSlug } });
  if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 });
  if (!store.isOpen) return NextResponse.json({ error: "Store is currently closed" }, { status: 400 });

  if (!items || items.length === 0) {
    return NextResponse.json({ error: "No items in order" }, { status: 400 });
  }

  const menuItemIds = items.map((i: { menuItemId: string }) => i.menuItemId);
  const menuItems = await prisma.menuItem.findMany({
    where: { id: { in: menuItemIds }, storeId: store.id, available: true },
  });

  if (menuItems.length !== menuItemIds.length) {
    return NextResponse.json({ error: "Some items are unavailable" }, { status: 400 });
  }

  const orderItems = items.map((i: { menuItemId: string; quantity: number; notes?: string }) => {
    const mi = menuItems.find((m) => m.id === i.menuItemId)!;
    return {
      menuItemId: i.menuItemId,
      quantity: i.quantity,
      notes: i.notes,
      price: mi.price,
    };
  });

  const order = await prisma.order.create({
    data: {
      storeId: store.id,
      tableId: tableId || null,
      customerName,
      notes,
      items: { create: orderItems },
    },
    include: {
      items: { include: { menuItem: true } },
      table: true,
    },
  });

  return NextResponse.json(order);
}
