import React, { useState } from 'react';
import { Bill } from '../types';
import { 
  X, 
  Printer, 
  Download, 
  Check, 
  Pill, 
  Receipt, 
  Share2, 
  Sparkles, 
  Building2, 
  ShieldCheck 
} from 'lucide-react';

interface InvoiceModalProps {
  bill: Bill | null;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ bill, onClose }) => {
  const [viewFormat, setViewFormat] = useState<'A4' | 'Thermal'>('A4');
  const [copied, setCopied] = useState(false);

  if (!bill) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopySummary = () => {
    const text = `PRINCE MEDICAL HALL - Tax Invoice
Invoice No: ${bill.invoiceNo}
Date: ${bill.date} ${bill.time}
Patient: ${bill.patientName} (${bill.patientPhone})
Doctor: ${bill.doctorName}
---------------------------------
${bill.items.map(i => `${i.medicineName} (${i.batchNo}) x${i.quantity} = ₹${i.totalAmount.toFixed(2)}`).join('\n')}
---------------------------------
Total Amount Paid: ₹${bill.grandTotal.toFixed(2)} (${bill.paymentMode})
Thank you for visiting Prince Medical Hall!`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[90vh]">
        {/* Modal Action Top Bar */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between no-print">
          <div className="flex items-center gap-3">
            <Receipt className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-bold text-base font-serif">Invoice #{bill.invoiceNo}</h3>
              <p className="text-xs text-slate-400">Issued on {bill.date} at {bill.time}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Format Toggle */}
            <div className="bg-slate-800 p-1 rounded-lg flex items-center gap-1 text-xs">
              <button
                onClick={() => setViewFormat('A4')}
                className={`px-2.5 py-1 rounded font-medium transition cursor-pointer ${
                  viewFormat === 'A4' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
                }`}
              >
                Tax Invoice (A4)
              </button>
              <button
                onClick={() => setViewFormat('Thermal')}
                className={`px-2.5 py-1 rounded font-medium transition cursor-pointer ${
                  viewFormat === 'Thermal' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
                }`}
              >
                Thermal Slip
              </button>
            </div>

            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <Printer className="w-4 h-4" /> Print
            </button>

            <button
              onClick={handleCopySummary}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
              {copied ? 'Copied' : 'Copy'}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Bill Content Body */}
        <div className="p-6 overflow-y-auto print:p-0" id="printable-bill">
          {viewFormat === 'A4' ? (
            /* Standard Full Tax Invoice Format */
            <div className="space-y-6 text-slate-800 font-sans border border-slate-200 p-6 rounded-xl bg-white">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-slate-200 pb-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-emerald-600 text-white rounded-xl flex items-center justify-center font-serif text-2xl font-bold shadow-md">
                    Rx
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold font-serif text-slate-900 tracking-tight">
                      PRINCE MEDICAL HALL
                    </h2>
                    <p className="text-xs text-slate-600 font-medium">Chemist & Druggist • Retail & Wholesale Pharmacy</p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      12/A College Street, Kolkata - 700073, WB • Ph: +91 98300 12345
                    </p>
                  </div>
                </div>

                <div className="text-right text-xs space-y-1">
                  <span className="inline-block bg-slate-900 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded">
                    TAX INVOICE
                  </span>
                  <p className="text-slate-600">
                    DL No: <strong>20B/21B-WB-109482</strong>
                  </p>
                  <p className="text-slate-600">
                    GSTIN: <strong>19AABCU9603R1ZM</strong>
                  </p>
                </div>
              </div>

              {/* Patient & Doctor Meta */}
              <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-3.5 rounded-lg border border-slate-100">
                <div>
                  <p className="text-slate-400 font-medium uppercase text-[10px]">Patient Details</p>
                  <p className="font-bold text-slate-900 text-sm">{bill.patientName}</p>
                  <p className="text-slate-600">Phone: {bill.patientPhone || 'N/A'}</p>
                </div>

                <div className="text-right">
                  <p className="text-slate-400 font-medium uppercase text-[10px]">Invoice Info</p>
                  <p className="font-bold text-slate-900">#{bill.invoiceNo}</p>
                  <p className="text-slate-600">Date: {bill.date} {bill.time}</p>
                  <p className="text-slate-600">Doctor: <strong>{bill.doctorName}</strong></p>
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-800 text-slate-700 font-bold uppercase text-[10px]">
                    <th className="py-2">#</th>
                    <th className="py-2">Medicine / Product</th>
                    <th className="py-2">Batch</th>
                    <th className="py-2">Exp</th>
                    <th className="py-2 text-center">Qty</th>
                    <th className="py-2 text-right">Price</th>
                    <th className="py-2 text-right">GST %</th>
                    <th className="py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {bill.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-2.5 text-slate-400">{idx + 1}</td>
                      <td className="py-2.5 font-bold text-slate-900">
                        {item.medicineName}
                        <div className="text-[10px] font-normal text-slate-500 italic">{item.genericName}</div>
                      </td>
                      <td className="py-2.5 font-mono text-slate-700">{item.batchNo}</td>
                      <td className="py-2.5 font-mono text-slate-600">{item.expDate}</td>
                      <td className="py-2.5 text-center font-bold">{item.quantity}</td>
                      <td className="py-2.5 text-right font-mono">₹{item.unitPrice.toFixed(2)}</td>
                      <td className="py-2.5 text-right font-mono text-slate-500">{item.gstPercent}%</td>
                      <td className="py-2.5 text-right font-bold font-mono text-slate-900">₹{item.totalAmount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Summary Totals */}
              <div className="flex flex-col sm:flex-row justify-between items-start pt-4 border-t border-slate-200 gap-4 text-xs">
                <div className="space-y-1 text-slate-500 max-w-xs text-[11px]">
                  <p className="font-semibold text-slate-700">Terms & Conditions:</p>
                  <p>1. Medicines sold are non-returnable after 7 days.</p>
                  <p>2. Keep refrigerated medicines below 8°C.</p>
                  <p>3. Always consult doctor before substituting medicines.</p>
                </div>

                <div className="w-full sm:w-64 space-y-1.5 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <div className="flex justify-between">
                    <span>Sub Total:</span>
                    <span className="font-mono">₹{bill.subTotal.toFixed(2)}</span>
                  </div>

                  {bill.discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-medium">
                      <span>Discount Saved:</span>
                      <span className="font-mono">-₹{bill.discountAmount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-slate-500 text-[11px]">
                    <span>CGST + SGST Tax:</span>
                    <span className="font-mono">₹{bill.gstAmount.toFixed(2)}</span>
                  </div>

                  {bill.roundOff !== 0 && (
                    <div className="flex justify-between text-slate-400 text-[11px]">
                      <span>Round off:</span>
                      <span className="font-mono">{bill.roundOff > 0 ? `+${bill.roundOff}` : bill.roundOff}</span>
                    </div>
                  )}

                  <div className="flex justify-between font-bold text-slate-900 text-sm border-t border-slate-300 pt-1.5">
                    <span>Grand Total:</span>
                    <span className="font-mono text-emerald-700 text-base">₹{bill.grandTotal.toFixed(2)}</span>
                  </div>

                  <div className="pt-2 text-center text-[11px] text-slate-500 border-t border-dashed border-slate-200">
                    Paid via <strong className="text-slate-800">{bill.paymentMode}</strong> ({bill.paymentStatus})
                  </div>
                </div>
              </div>

              {/* Footer Stamp & Barcode */}
              <div className="pt-6 border-t border-slate-200 flex items-center justify-between text-center text-[10px] text-slate-400">
                <div className="font-mono text-slate-500 border border-slate-300 px-3 py-1 rounded bg-slate-50">
                  |||||||||||||||||||||||||||||
                  <br />
                  {bill.invoiceNo}
                </div>

                <div>
                  <p className="font-serif font-bold text-slate-800 text-xs">For PRINCE MEDICAL HALL</p>
                  <p className="mt-4 text-slate-500">Authorized Pharmacist Signature</p>
                </div>
              </div>
            </div>
          ) : (
            /* Thermal Slip Receipt Format */
            <div className="max-w-xs mx-auto p-4 bg-amber-50/40 border border-slate-300 font-mono text-xs text-slate-900 space-y-3 shadow-inner">
              <div className="text-center space-y-0.5 border-b border-dashed border-slate-400 pb-2">
                <h3 className="font-extrabold text-sm font-serif">PRINCE MEDICAL HALL</h3>
                <p className="text-[10px]">12/A College Street, Kolkata</p>
                <p className="text-[10px]">DL: 20B/21B-WB-109482</p>
                <p className="text-[10px]">Ph: +91 98300 12345</p>
              </div>

              <div className="text-[10px] space-y-0.5 border-b border-dashed border-slate-400 pb-2">
                <p>Inv #: {bill.invoiceNo}</p>
                <p>Date: {bill.date} {bill.time}</p>
                <p>Patient: {bill.patientName}</p>
                <p>Doctor: {bill.doctorName}</p>
              </div>

              <div className="space-y-1 border-b border-dashed border-slate-400 pb-2">
                {bill.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-start text-[11px]">
                    <div>
                      <p className="font-bold">{item.medicineName}</p>
                      <p className="text-[9px] text-slate-500">B:{item.batchNo} Exp:{item.expDate}</p>
                    </div>
                    <div className="text-right">
                      <p>{item.quantity} x ₹{item.unitPrice.toFixed(0)}</p>
                      <p className="font-bold">₹{item.totalAmount.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-1 text-right text-[11px] border-b border-dashed border-slate-400 pb-2">
                <div className="flex justify-between">
                  <span>Sub Total:</span>
                  <span>₹{bill.subTotal.toFixed(2)}</span>
                </div>
                {bill.discountAmount > 0 && (
                  <div className="flex justify-between">
                    <span>Discount:</span>
                    <span>-₹{bill.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-sm pt-1 border-t border-slate-400">
                  <span>TOTAL:</span>
                  <span>₹{bill.grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="text-center text-[10px] space-y-1 pt-1">
                <p>Paid via {bill.paymentMode}</p>
                <p className="font-serif italic font-bold">~ Get Well Soon! ~</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
