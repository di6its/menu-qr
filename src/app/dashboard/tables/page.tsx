export const instant = false;
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import TablesManager from "@/components/dashboard/TablesManager";

export default async function TablesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const store = await prisma.store.findUnique({
    where: { userId: session.user.id },
    include: { tables: { orderBy: { name: "asc" } } },
  });

  if (!store) redirect("/dashboard");

  return <TablesManager store={store} initialTables={store.tables} />;
}
