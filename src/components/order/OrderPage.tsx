"use client";

import { useState, useMemo } from "react";
import { ShoppingCart, Plus, Minus, X, Loader2, CheckCircle, ChevronDown } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import type { Store, MenuItem, Table } from "@prisma/client";

type CartItem = {
  menuItem: MenuItem;
  quantity: number;
  notes: string;
};

type Step = "menu" | "cart" | "confirm" | "success";

export default function OrderPage({
  store,
  menuItems,
  tables,
  initialTable,
}: {
  store: Store;
  menuItems: MenuItem[];
  tables: Table[];
  initialTable?: Table;
}) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [step, setStep] = useState<Step>("menu");
  const [customerName, setCustomerName] = useState("");
  const [orderNotes, setOrderNotes] = useState("");
  const [selectedTable, setSelectedTable] = useState<Table | undefined>(initialTable);
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const categories = useMemo(
    () => Array.from(new Set(menuItems.map((i) => i.category))).sort(),
    [menuItems]
  );

  const cartTotal = cart.reduce((sum, i) => sum + i.menuItem.price * i.quantity, 0);
  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  function addToCart(item: MenuItem) {
    setCart((prev) => {
      const existing = prev.find((i) => i.menuItem.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.menuItem.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { menuItem: item, quantity: 1, notes: "" }];
    });
  }

  function removeFromCart(itemId: string) {
    setCart((prev) => {
      const existing = prev.find((i) => i.menuItem.id === itemId);
      if (!existing) return prev;
      if (existing.quantity === 1) return prev.filter((i) => i.menuItem.id !== itemId);
      return prev.map((i) =>
        i.menuItem.id === itemId ? { ...i, quantity: i.quantity - 1 } : i
      );
    });
  }

  function getQty(itemId: string) {
    return cart.find((i) => i.menuItem.id === itemId)?.quantity ?? 0;
  }

  async function placeOrder() {
    if (!customerName.trim()) {
      toast.error("Please enter your name");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeSlug: store.slug,
          tableId: selectedTable?.id,
          customerName: customerName.trim(),
          notes: orderNotes,
          items: cart.map((i) => ({
            menuItemId: i.menuItem.id,
            quantity: i.quantity,
            notes: i.notes,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to place order");
        return;
      }
      setOrderId(data.id);
      setStep("success");
    } finally {
      setLoading(false);
    }
  }

  if (!store.isOpen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <p className="text-4xl mb-4">🔒</p>
          <h1 className="text-xl font-bold">{store.name}</h1>
          <p className="text-gray-500 mt-2">We&apos;re currently closed. Please check back later.</p>
        </div>
      </div>
    );
  }

  if (step === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center max-w-sm">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Order placed!</h1>
          <p className="text-gray-600 mb-6">
            Your order is being prepared. Please pay at the cashier when done.
          </p>
          {selectedTable && (
            <p className="text-sm text-gray-500 mb-6">
              Table: <strong>{selectedTable.name}</strong>
            </p>
          )}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 text-left space-y-1 mb-6">
            {cart.map((i) => (
              <div key={i.menuItem.id} className="flex justify-between text-sm">
                <span>{i.quantity}x {i.menuItem.name}</span>
                <span className="text-gray-500">{formatPrice(i.menuItem.price * i.quantity)}</span>
              </div>
            ))}
            <div className="border-t pt-2 mt-2 flex justify-between font-semibold text-sm">
              <span>Total</span>
              <span>{formatPrice(cartTotal)}</span>
            </div>
          </div>
          <button
            onClick={() => {
              setCart([]);
              setStep("menu");
              setCustomerName("");
              setOrderNotes("");
            }}
            className="text-orange-500 text-sm font-medium hover:underline"
          >
            Place another order
          </button>
        </div>
      </div>
    );
  }

  if (step === "confirm") {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-4 flex items-center gap-3">
          <button onClick={() => setStep("cart")} className="text-gray-500">
            <X className="w-5 h-5" />
          </button>
          <h1 className="font-bold text-lg">Confirm order</h1>
        </div>

        <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="font-semibold mb-4">Your details</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Your name *</label>
                <input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  placeholder="Maria"
                />
              </div>
              {store.hasTables && tables.length > 0 && (
                <div>
                  <label className="block text-sm font-medium mb-1">Table</label>
                  <select
                    value={selectedTable?.id || ""}
                    onChange={(e) =>
                      setSelectedTable(tables.find((t) => t.id === e.target.value))
                    }
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  >
                    <option value="">No table / takeaway</option>
                    {tables.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1">Notes (optional)</label>
                <textarea
                  rows={2}
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                  placeholder="Any allergies or special requests..."
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="font-semibold mb-3">Order summary</h2>
            <div className="space-y-2">
              {cart.map((i) => (
                <div key={i.menuItem.id} className="flex justify-between text-sm">
                  <span className="text-gray-700">{i.quantity}x {i.menuItem.name}</span>
                  <span>{formatPrice(i.menuItem.price * i.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="border-t mt-3 pt-3 flex justify-between font-bold">
              <span>Total</span>
              <span className="text-orange-600">{formatPrice(cartTotal)}</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">Pay at the cashier when your order is ready.</p>
          </div>

          <button
            onClick={placeOrder}
            disabled={loading || !customerName.trim()}
            className="w-full bg-orange-500 text-white py-3.5 rounded-xl font-bold text-lg hover:bg-orange-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
            Place order
          </button>
        </div>
      </div>
    );
  }

  const displayedItems = activeCategory
    ? menuItems.filter((i) => i.category === activeCategory)
    : menuItems;

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-5">
        <h1 className="text-xl font-bold">{store.name}</h1>
        {store.description && <p className="text-sm text-gray-500 mt-1">{store.description}</p>}
        {selectedTable && (
          <span className="inline-block mt-2 text-xs bg-orange-100 text-orange-700 px-2.5 py-1 rounded-full">
            {selectedTable.name}
          </span>
        )}
      </div>

      {/* Category filter */}
      {categories.length > 1 && (
        <div className="bg-white border-b border-gray-100 px-4 overflow-x-auto">
          <div className="flex gap-1 py-2">
            <button
              onClick={() => setActiveCategory(null)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition",
                !activeCategory ? "bg-orange-500 text-white" : "text-gray-600 hover:bg-gray-100"
              )}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat === activeCategory ? null : cat)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition",
                  activeCategory === cat
                    ? "bg-orange-500 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Menu items */}
      <div className="max-w-lg mx-auto px-4 py-4 space-y-3">
        {displayedItems.length === 0 ? (
          <p className="text-center text-gray-500 py-16">No items available right now</p>
        ) : (
          displayedItems.map((item) => {
            const qty = getQty(item.id);
            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{item.name}</p>
                  {item.description && (
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{item.description}</p>
                  )}
                  <p className="text-sm font-bold text-orange-600 mt-1.5">{formatPrice(item.price)}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {qty > 0 ? (
                    <>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 hover:bg-orange-200 transition"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="font-bold text-sm w-4 text-center">{qty}</span>
                      <button
                        onClick={() => addToCart(item)}
                        className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white hover:bg-orange-600 transition"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => addToCart(item)}
                      className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white hover:bg-orange-600 transition"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Floating cart button */}
      {cartCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-gray-50 to-transparent">
          <div className="max-w-lg mx-auto">
            <button
              onClick={() => setStep("confirm")}
              className="w-full bg-orange-500 text-white py-4 rounded-2xl font-bold text-base hover:bg-orange-600 transition flex items-center justify-between px-5 shadow-lg"
            >
              <span className="bg-orange-400 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold">
                {cartCount}
              </span>
              <span>View order</span>
              <span>{formatPrice(cartTotal)}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
