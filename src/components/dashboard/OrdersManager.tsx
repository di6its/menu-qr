"use client";

import { useState } from "react";
import { formatPrice, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { RefreshCw } from "lucide-react";
import type { Order, OrderItem, MenuItem, Table } from "@prisma/client";

type FullOrder = Order & {
  items: (OrderItem & { menuItem: MenuItem })[];
  table: Table | null;
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  preparing: "Preparing",
  ready: "Ready",
  done: "Done",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  preparing: "bg-blue-100 text-blue-800",
  ready: "bg-green-100 text-green-800",
  done: "bg-gray-100 text-gray-600",
};

const NEXT_STATUS: Record<string, string> = {
  pending: "preparing",
  preparing: "ready",
  ready: "done",
};

const NEXT_LABEL: Record<string, string> = {
  pending: "Start preparing",
  preparing: "Mark ready",
  ready: "Mark done",
};

export default function OrdersManager({ initialOrders }: { initialOrders: FullOrder[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [filter, setFilter] = useState("active");
  const [loading, setLoading] = useState(false);

  const filtered = orders.filter((o) => {
    if (filter === "active") return ["pending", "preparing", "ready"].includes(o.status);
    if (filter === "done") return o.status === "done";
    return true;
  });

  async function refresh() {
    setLoading(true);
    try {
      const res = await fetch("/api/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
        toast.success("Orders refreshed");
      }
    } finally {
      setLoading(false);
    }
  }

  async function advance(order: FullOrder) {
    const next = NEXT_STATUS[order.status];
    if (!next) return;
    const res = await fetch(`/api/orders/${order.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    if (res.ok) {
      const data = await res.json();
      setOrders((prev) => prev.map((o) => (o.id === data.id ? data : o)));
    }
  }

  const orderTotal = (order: FullOrder) =>
    order.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Orders</h1>
        <button
          onClick={refresh}
          disabled={loading}
          className="flex items-center gap-2 border border-gray-200 px-3 py-2 rounded-lg text-sm hover:bg-gray-50 transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 w-fit">
        {["active", "done", "all"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-4 py-1.5 rounded-lg text-sm font-medium transition capitalize",
              filter === f ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-900"
            )}
          >
            {f === "active" ? "Active" : f === "done" ? "Done" : "All"}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <p className="text-gray-500">
            {filter === "active" ? "No active orders right now" : "No orders found"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((order) => (
            <div key={order.id} className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{order.customerName}</p>
                    {order.table && (
                      <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                        {order.table.name}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{formatDate(order.createdAt)}</p>
                </div>
                <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full", STATUS_COLORS[order.status])}>
                  {STATUS_LABELS[order.status]}
                </span>
              </div>

              <div className="space-y-1 mb-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-700">
                      {item.quantity}x {item.menuItem.name}
                      {item.notes && <span className="text-gray-400"> ({item.notes})</span>}
                    </span>
                    <span className="text-gray-500">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              {order.notes && (
                <p className="text-sm text-gray-500 bg-gray-50 rounded-lg px-3 py-2 mb-3">
                  Note: {order.notes}
                </p>
              )}

              <div className="flex items-center justify-between">
                <p className="font-semibold text-sm">Total: {formatPrice(orderTotal(order))}</p>
                {NEXT_STATUS[order.status] && (
                  <button
                    onClick={() => advance(order)}
                    className="text-sm bg-orange-500 text-white px-4 py-1.5 rounded-lg hover:bg-orange-600 transition font-medium"
                  >
                    {NEXT_LABEL[order.status]}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
