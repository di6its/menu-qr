"use client";

import { useState, useRef } from "react";
import { Plus, Trash2, QrCode, Download, X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import QRCode from "react-qr-code";
import type { Store, Table } from "@prisma/client";

export default function TablesManager({
  store,
  initialTables,
}: {
  store: Store;
  initialTables: Table[];
}) {
  const [tables, setTables] = useState(initialTables);
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", capacity: "4" });
  const [qrTable, setQrTable] = useState<Table | null>(null);
  const qrRef = useRef<HTMLDivElement>(null);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/tables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to add table");
        return;
      }
      setTables((prev) => [...prev, data]);
      setForm({ name: "", capacity: "4" });
      setShowAdd(false);
      toast.success("Table added");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this table?")) return;
    const res = await fetch(`/api/tables/${id}`, { method: "DELETE" });
    if (res.ok) {
      setTables((prev) => prev.filter((t) => t.id !== id));
      toast.success("Table removed");
    }
  }

  function getOrderUrl(table?: Table) {
    if (table) return `${baseUrl}/order/${store.slug}?table=${table.id}`;
    return `${baseUrl}/order/${store.slug}`;
  }

  function downloadQR(label: string) {
    const svg = qrRef.current?.querySelector("svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const size = 400;
    canvas.width = size;
    canvas.height = size + 60;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 20, 20, size - 40, size - 40);
      ctx.fillStyle = "#1f2937";
      ctx.font = "bold 20px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(label, size / 2, size + 36);

      const link = document.createElement("a");
      link.download = `qr-${label.toLowerCase().replace(/\s+/g, "-")}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
    img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Tables & QR Codes</h1>
        {store.hasTables && (
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-orange-600 transition"
          >
            <Plus className="w-4 h-4" />
            Add table
          </button>
        )}
      </div>

      {/* Store-wide QR */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
        <h2 className="font-semibold mb-1">Store QR Code</h2>
        <p className="text-sm text-gray-500 mb-4">
          Use this if you don&apos;t have tables, or place it at the counter.
        </p>
        <button
          onClick={() => setQrTable({ id: "store", name: store.name } as Table)}
          className="flex items-center gap-2 border border-gray-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
        >
          <QrCode className="w-4 h-4 text-orange-500" />
          View &amp; download store QR
        </button>
      </div>

      {/* Add table modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-lg">Add table</h2>
              <button onClick={() => setShowAdd(false)}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Table name *</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  placeholder="Table 1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Capacity</label>
                <input
                  type="number"
                  min="1"
                  value={form.capacity}
                  onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAdd(false)}
                  className="flex-1 border border-gray-200 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-orange-500 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-orange-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Add table
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR modal */}
      {qrTable && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 text-center">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg">
                {qrTable.id === "store" ? "Store QR Code" : `QR - ${qrTable.name}`}
              </h2>
              <button onClick={() => setQrTable(null)}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div ref={qrRef} className="flex justify-center p-4 bg-white border rounded-xl mb-4">
              <QRCode
                value={qrTable.id === "store" ? getOrderUrl() : getOrderUrl(qrTable)}
                size={200}
              />
            </div>
            <p className="text-xs text-gray-500 mb-4 break-all">
              {qrTable.id === "store" ? getOrderUrl() : getOrderUrl(qrTable)}
            </p>
            <button
              onClick={() => downloadQR(qrTable.id === "store" ? store.name : qrTable.name)}
              className="w-full flex items-center justify-center gap-2 bg-orange-500 text-white py-2.5 rounded-lg font-semibold hover:bg-orange-600 transition text-sm"
            >
              <Download className="w-4 h-4" />
              Download PNG
            </button>
          </div>
        </div>
      )}

      {/* Table list */}
      {store.hasTables && (
        <>
          {tables.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
              <p className="text-gray-500 mb-4">No tables yet</p>
              <button
                onClick={() => setShowAdd(true)}
                className="bg-orange-500 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-orange-600 transition"
              >
                Add your first table
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-100">
              {tables.map((table) => (
                <div key={table.id} className="flex items-center justify-between px-4 py-3.5">
                  <div>
                    <p className="font-medium text-sm">{table.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Seats {table.capacity}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setQrTable(table)}
                      className="flex items-center gap-1.5 text-xs border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition"
                    >
                      <QrCode className="w-3.5 h-3.5 text-orange-500" />
                      QR Code
                    </button>
                    <button
                      onClick={() => handleDelete(table.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 transition text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
