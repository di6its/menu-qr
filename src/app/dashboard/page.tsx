export const instant = false;
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ClipboardList, UtensilsCrossed, Table2, ArrowRight } from "lucide-react";
import SetupStoreForm from "@/components/dashboard/SetupStoreForm";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const store = await prisma.store.findUnique({
    where: { userId: session.user.id },
    include: {
      _count: {
        select: { menuItems: true, tables: true },
      },
    },
  });

  const pendingOrders = store
    ? await prisma.order.count({ where: { storeId: store.id, status: "pending" } })
    : 0;

  if (!store) {
    return (
      <div className="max-w-lg mx-auto pt-8">
        <h1 className="text-2xl font-bold mb-2">Welcome to MenuQR!</h1>
        <p className="text-gray-600 mb-8">Let&apos;s set up your store to get started.</p>
        <SetupStoreForm />
      </div>
    );
  }

  const stats = [
    {
      label: "Pending orders",
      value: pendingOrders,
      icon: ClipboardList,
      href: "/dashboard/orders",
      color: "bg-orange-50 text-orange-600",
    },
    {
      label: "Menu items",
      value: store._count.menuItems,
      icon: UtensilsCrossed,
      href: "/dashboard/menu",
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Tables",
      value: store._count.tables,
      icon: Table2,
      href: "/dashboard/tables",
      color: "bg-green-50 text-green-600",
    },
  ];

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{store.name}</h1>
          <p className="text-gray-500 text-sm mt-1 capitalize">{store.type}</p>
        </div>
        <span
          className={`text-xs font-medium px-2.5 py-1 rounded-full ${
            store.isOpen ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}
        >
          {store.isOpen ? "Open" : "Closed"}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, href, color }) => (
          <Link
            key={label}
            href={href}
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition group"
          >
            <div>
              <p className="text-sm text-gray-500">{label}</p>
              <p className="text-3xl font-bold mt-1">{value}</p>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
              <Icon className="w-6 h-6" />
            </div>
          </Link>
        ))}
      </div>

      {/* Quick links */}
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Quick actions</h2>
      <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-100">
        {[
          { href: "/dashboard/orders", label: "View & manage orders", desc: "See all incoming customer orders" },
          { href: "/dashboard/menu", label: "Edit menu", desc: "Add, update or remove menu items" },
          { href: "/dashboard/tables", label: "Manage tables + QR codes", desc: "Set up tables and download QR codes" },
          { href: "/dashboard/settings", label: "Store settings", desc: "Update store name, hours, and details" },
        ].map(({ href, label, desc }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition group"
          >
            <div>
              <p className="font-medium text-sm">{label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-700 transition" />
          </Link>
        ))}
      </div>

      {store._count.menuItems === 0 && (
        <div className="mt-6 bg-orange-50 border border-orange-200 rounded-xl p-4 text-sm">
          <p className="font-medium text-orange-800">Your menu is empty</p>
          <p className="text-orange-700 mt-0.5">
            <Link href="/dashboard/menu" className="underline">Add menu items</Link> so customers can place orders.
          </p>
        </div>
      )}
    </div>
  );
}
