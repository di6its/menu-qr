import Link from "next/link";
import { QrCode, UtensilsCrossed, ClipboardList, Users } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100 px-4 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <QrCode className="w-6 h-6 text-orange-500" />
            <span className="font-bold text-lg">MenuQR</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">
              Sign in
            </Link>
            <Link
              href="/register"
              className="text-sm bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-4 py-20 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-700 text-sm px-3 py-1 rounded-full mb-6">
            <span>No app download needed for customers</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight mb-6">
            QR ordering for your
            <span className="text-orange-500"> restaurant or cafe</span>
          </h1>
          <p className="text-lg text-gray-600 mb-10 text-balance">
            Let customers scan a QR code, browse your menu, and place their order while they wait.
            No more long lines, no more missed orders.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/register"
              className="bg-orange-500 text-white px-8 py-3 rounded-xl font-semibold hover:bg-orange-600 transition text-lg"
            >
              Set up your store free
            </Link>
            <Link
              href="/login"
              className="border border-gray-300 text-gray-700 px-8 py-3 rounded-xl font-semibold hover:bg-gray-50 transition text-lg"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-12">How it works</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: UtensilsCrossed,
                title: "Add your menu",
                desc: "Create categories and add all your dishes with prices.",
              },
              {
                icon: Users,
                title: "Set up tables",
                desc: "Add your tables or skip if you only do takeaway.",
              },
              {
                icon: QrCode,
                title: "Print QR codes",
                desc: "Download and print a QR for each table or one for your counter.",
              },
              {
                icon: ClipboardList,
                title: "Receive orders",
                desc: "Customers scan, choose, and you see their order instantly.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-orange-600" />
                </div>
                <h3 className="font-semibold mb-2">{title}</h3>
                <p className="text-sm text-gray-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-4 py-8 text-center text-sm text-gray-500">
        <div className="flex items-center justify-center gap-2 mb-2">
          <QrCode className="w-4 h-4 text-orange-500" />
          <span className="font-semibold text-gray-700">MenuQR</span>
        </div>
        <p>Simple digital ordering for small restaurants and cafes.</p>
      </footer>
    </div>
  );
}
