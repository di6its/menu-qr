export const instant = false;
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import SettingsForm from "@/components/dashboard/SettingsForm";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const store = await prisma.store.findUnique({ where: { userId: session.user.id } });
  if (!store) redirect("/dashboard");

  return <SettingsForm store={store} />;
}
