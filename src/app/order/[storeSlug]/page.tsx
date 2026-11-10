export const instant = false;
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import OrderPage from "@/components/order/OrderPage";

export default async function CustomerOrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ storeSlug: string }>;
  searchParams: Promise<{ table?: string }>;
}) {
  const { storeSlug } = await params;
  const { table: tableId } = await searchParams;

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

  if (!store) notFound();

  const table = tableId ? store.tables.find((t) => t.id === tableId) : undefined;

  return <OrderPage store={store} menuItems={store.menuItems} tables={store.tables} initialTable={table} />;
}
