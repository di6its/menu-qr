export const instant = false;
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import OrdersManager from "@/components/dashboard/OrdersManager";

export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const store = await prisma.store.findUnique({ where: { userId: session.user.id } });
  if (!store) redirect("/dashboard");

  const orders = await prisma.order.findMany({
    where: { storeId: store.id },
    include: { items: { include: { menuItem: true } }, table: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return <OrdersManager initialOrders={orders} />;
}
