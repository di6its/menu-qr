import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const store = await prisma.store.findUnique({
    where: { userId: session.user.id },
    include: { menuItems: true, tables: true },
  });

  return NextResponse.json(store);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const existing = await prisma.store.findUnique({ where: { userId: session.user.id } });
  if (existing) return NextResponse.json({ error: "Store already exists" }, { status: 400 });

  const { name, type, description, address, phone, hasTables } = await req.json();

  let slug = slugify(name);
  const slugExists = await prisma.store.findUnique({ where: { slug } });
  if (slugExists) slug = `${slug}-${Date.now()}`;

  const store = await prisma.store.create({
    data: {
      userId: session.user.id,
      name,
      slug,
      type: type || "restaurant",
      description,
      address,
      phone,
      hasTables: hasTables ?? true,
    },
  });

  return NextResponse.json(store);
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, type, description, address, phone, hasTables, isOpen } = await req.json();

  const store = await prisma.store.update({
    where: { userId: session.user.id },
    data: { name, type, description, address, phone, hasTables, isOpen },
  });

  return NextResponse.json(store);
}
