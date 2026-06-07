import { X, Printer } from "lucide-react";
import { Sale } from "../../store";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import logoImg from "../../../imports/F999502A-0064-4725-8E95-818128824C63_L0_001-4_2_2026__6_30_13_PM.png";

function fmt(n: number) { return `₱${n.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`; }

interface Props { sale: Sale; onClose: () => void; }

export default function ReceiptModal({ sale, onClose }: Props) {
  const handlePrint = () => window.print();

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 print:hidden">
          <h2 className="font-bold text-gray-800">Receipt</h2>
          <div className="flex items-center gap-2">
            <button onClick={handlePrint} className="flex items-center gap-1.5 px-3 py-2 bg-pink-500 text-white rounded-xl text-sm font-semibold min-h-[40px]">
              <Printer className="w-4 h-4" /> Print
            </button>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 min-h-[40px] min-w-[40px] flex items-center justify-center">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Business Header */}
          <div className="text-center">
            <ImageWithFallback src={logoImg} alt="Lemon & Lace logo" className="w-20 h-20 object-cover rounded-full mx-auto mb-1" />
            <h1 className="text-lg font-bold text-gray-800">Lemon & Lace</h1>
            <p className="text-sm text-gray-500">Snacks and Drinks</p>
            <div className="border-t border-dashed border-gray-300 mt-3 mb-3" />
            <p className="font-mono text-xs text-gray-500">Transaction #: <strong>{sale.transaction_number}</strong></p>
            <p className="font-mono text-xs text-gray-500">{new Date(sale.created_at).toLocaleString("en-PH", { timeZone: "Asia/Manila" })}</p>
          </div>

          {/* Items */}
          <div className="space-y-2">
            <div className="border-t border-dashed border-gray-300" />
            {sale.items?.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <div className="flex-1 min-w-0 pr-2">
                  <p className="font-medium text-gray-800 truncate">{item.name}</p>
                  <p className="text-xs text-gray-500">{fmt(item.price)} × {item.quantity}</p>
                </div>
                <p className="font-semibold text-gray-800 flex-shrink-0">{fmt(item.price * item.quantity)}</p>
              </div>
            ))}
            <div className="border-t border-dashed border-gray-300" />
          </div>

          {/* Totals */}
          <div className="space-y-1">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span>{fmt((sale.items ?? []).reduce((s, i) => s + i.price * i.quantity, 0))}</span>
            </div>
            {(sale.discount ?? 0) > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Discount</span>
                <span>- {fmt(sale.discount!)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg text-gray-800 pt-2 border-t border-dashed border-gray-300">
              <span>TOTAL</span>
              <span className="text-pink-600">{fmt(sale.total_amount)}</span>
            </div>
          </div>

          {/* Payment */}
          <div className="text-center bg-pink-50 rounded-xl p-3">
            <p className="text-sm text-gray-600">Payment Method</p>
            <p className="text-lg font-bold text-pink-600">{sale.payment_method}</p>
          </div>

          <div className="text-center text-xs text-gray-400 pt-2">
            <p>Thank you for your purchase! 🌸</p>
            <p>Please come again!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
