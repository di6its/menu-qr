import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const store = await prisma.store.findUnique({ where: { userId: session.user.id } });
  if (!store) return NextResponse.json({ error: "No store" }, { status: 404 });

  await prisma.table.delete({ where: { id, storeId: store.id } });
  return NextResponse.json({ success: true });
}
