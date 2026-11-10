import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ storeSlug: string }> }) {
  const { storeSlug } = await params;

  const store = await prisma.store.findUnique({
    where: { slug: storeSlug },
    include: {
      menuItems: {
        where: { available: true },
        orderBy: [{ category: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
      },
      tables: { orderBy: { name: "asc" } },
    },
  });

  if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 });

  return NextResponse.json(store);
}
