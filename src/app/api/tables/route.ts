import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const store = await prisma.store.findUnique({ where: { userId: session.user.id } });
  if (!store) return NextResponse.json([]);

  const tables = await prisma.table.findMany({
    where: { storeId: store.id },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(tables);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const store = await prisma.store.findUnique({ where: { userId: session.user.id } });
  if (!store) return NextResponse.json({ error: "No store" }, { status: 404 });

  const { name, capacity } = await req.json();

  const table = await prisma.table.create({
    data: { storeId: store.id, name, capacity: parseInt(capacity) || 4 },
  });

  return NextResponse.json(table);
}
