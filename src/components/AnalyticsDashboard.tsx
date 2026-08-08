import React from 'react';
import { Bill, Medicine } from '../types';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Receipt, 
  AlertTriangle, 
  ShieldAlert, 
  CreditCard, 
  QrCode, 
  Package 
} from 'lucide-react';

interface AnalyticsDashboardProps {
  bills: Bill[];
  medicines: Medicine[];
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ bills, medicines }) => {
  // Key Metrics
  const totalRevenue = bills.reduce((acc, b) => acc + b.grandTotal, 0);
  const totalBills = bills.length;
  const avgBillValue = totalBills > 0 ? Math.round(totalRevenue / totalBills) : 0;

  // Stock status
  const lowStockCount = medicines.filter(
    (m) => m.batches.reduce((acc, b) => acc + b.stock, 0) <= m.reorderLevel
  ).length;

  const expiringCount = medicines.filter((m) =>
    m.batches.some((b) => {
      const exp = new Date(b.expDate);
      const now = new Date();
      const diffDays = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 3600 * 24));
      return diffDays <= 90;
    })
  ).length;

  // Payment breakdown
  const paymentBreakdown = bills.reduce((acc, b) => {
    acc[b.paymentMode] = (acc[b.paymentMode] || 0) + b.grandTotal;
    return acc;
  }, {} as Record<string, number>);

  // Top Selling Items
  const itemSalesMap = new Map<string, { name: string; qty: number; revenue: number }>();
  bills.forEach((b) => {
    b.items.forEach((it) => {
      const existing = itemSalesMap.get(it.medicineId) || { name: it.medicineName, qty: 0, revenue: 0 };
      itemSalesMap.set(it.medicineId, {
        name: it.medicineName,
        qty: existing.qty + it.quantity,
        revenue: existing.revenue + it.totalAmount,
      });
    });
  });

  const topSellingMedicines = Array.from(itemSalesMap.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  return (
    <div className="p-4 max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 font-serif">Pharmacy Sales & Financial Analytics</h2>
            <p className="text-xs text-slate-500">Live operational overview for Prince Medical Hall</p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500 uppercase">Total Revenue</span>
          <div className="text-2xl font-extrabold text-emerald-700 font-mono">₹{totalRevenue.toFixed(2)}</div>
          <p className="text-[11px] text-slate-400">Calculated from {totalBills} sales bills</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500 uppercase">Total Bills Issued</span>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">{totalBills}</div>
          <p className="text-[11px] text-slate-400">Avg bill: ₹{avgBillValue.toFixed(0)}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-sm space-y-1 bg-amber-50/30">
          <span className="text-xs font-semibold text-amber-800 uppercase flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Low Stock Alerts
          </span>
          <div className="text-2xl font-extrabold text-amber-700 font-mono">{lowStockCount} Items</div>
          <p className="text-[11px] text-amber-600 font-medium">Requires immediate purchase order</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-rose-200 shadow-sm space-y-1 bg-rose-50/30">
          <span className="text-xs font-semibold text-rose-800 uppercase flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600" /> Expiring Soon
          </span>
          <div className="text-2xl font-extrabold text-rose-700 font-mono">{expiringCount} Batches</div>
          <p className="text-[11px] text-rose-600 font-medium">Expiring within 90 days</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Payment Breakdown (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-sm font-serif">Payment Mode Collections</h3>

          <div className="space-y-3 text-xs">
            {(Object.entries(paymentBreakdown) as [string, number][]).map(([mode, amt]) => {
              const pct = totalRevenue > 0 ? (amt / totalRevenue) * 100 : 0;
              return (
                <div key={mode} className="space-y-1">
                  <div className="flex justify-between font-semibold">
                    <span className="flex items-center gap-1.5 text-slate-800">
                      {mode === 'UPI' && <QrCode className="w-3.5 h-3.5 text-emerald-600" />}
                      {mode === 'Cash' && <Receipt className="w-3.5 h-3.5 text-blue-600" />}
                      {mode === 'Card' && <CreditCard className="w-3.5 h-3.5 text-purple-600" />}
                      {mode}
                    </span>
                    <span className="font-mono text-slate-900">₹{amt.toFixed(2)} ({pct.toFixed(0)}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${pct}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Selling Formulations (7 cols) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-sm font-serif">Top Prescribed & Sold Formulations</h3>

          <div className="space-y-2 text-xs">
            {topSellingMedicines.map((m, idx) => (
              <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-[10px]">
                    #{idx + 1}
                  </span>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{m.name}</h4>
                    <span className="text-slate-500 text-[11px]">{m.qty} units sold</span>
                  </div>
                </div>

                <span className="font-bold font-mono text-emerald-800 text-sm">
                  ₹{m.revenue.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
