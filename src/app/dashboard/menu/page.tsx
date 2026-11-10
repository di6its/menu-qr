export const instant = false;
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import MenuManager from "@/components/dashboard/MenuManager";

export default async function MenuPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const store = await prisma.store.findUnique({ where: { userId: session.user.id } });
  if (!store) redirect("/dashboard");

  const items = await prisma.menuItem.findMany({
    where: { storeId: store.id },
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });

  return <MenuManager initialItems={items} />;
}
