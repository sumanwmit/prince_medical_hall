import React, { useState } from 'react';
import { Medicine, Batch, BillItem, Bill, Patient } from '../types';
import { 
  Search, 
  Plus, 
  Trash2, 
  Receipt, 
  ScanLine, 
  User, 
  Phone, 
  Stethoscope, 
  CreditCard, 
  CheckCircle2, 
  AlertCircle, 
  Pill, 
  ChevronRight, 
  Sparkles, 
  QrCode,
  Tag
} from 'lucide-react';

interface POSBillingProps {
  medicines: Medicine[];
  patients: Patient[];
  onCompleteBill: (bill: Bill) => void;
  onOpenPrescriptionScanner: () => void;
  cartItems: BillItem[];
  setCartItems: React.Dispatch<React.SetStateAction<BillItem[]>>;
}

export const POSBilling: React.FC<POSBillingProps> = ({
  medicines,
  patients,
  onCompleteBill,
  onOpenPrescriptionScanner,
  cartItems,
  setCartItems,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Customer / Patient State
  const [patientName, setPatientName] = useState('Walk-in Customer');
  const [patientPhone, setPatientPhone] = useState('');
  const [doctorName, setDoctorName] = useState('Dr. Self / General Consultation');
  const [paymentMode, setPaymentMode] = useState<'Cash' | 'UPI' | 'Card' | 'Credit / Due'>('UPI');
  const [billNotes, setBillNotes] = useState('');
  const [overallDiscountPercent, setOverallDiscountPercent] = useState<number>(0);

  // Quick Patient Autocomplete
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);

  // Filter medicines
  const filteredMedicines = medicines.filter((m) => {
    const matchesSearch = 
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.genericName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.manufacturer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.batches.some(b => b.rackLocation.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'All' || m.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const categories = ['All', 'Tablets & Capsules', 'Syrups & Liquids', 'Cardiac & BP', 'Diabetes Care', 'Respiratory & Asthma', 'First Aid & Surgical'];

  // Add item to cart
  const handleAddToCart = (medicine: Medicine, chosenBatch?: Batch) => {
    // Pick first available batch with stock > 0, or chosenBatch
    const targetBatch = chosenBatch || medicine.batches.find((b) => b.stock > 0) || medicine.batches[0];

    if (!targetBatch || targetBatch.stock <= 0) {
      alert(`Out of stock! ${medicine.name} batch ${targetBatch?.batchNo || ''} has no remaining inventory.`);
      return;
    }

    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.medicineId === medicine.id && item.batchNo === targetBatch.batchNo
      );

      if (existingIndex > -1) {
        const existing = prev[existingIndex];
        if (existing.quantity + 1 > targetBatch.stock) {
          alert(`Cannot add more than available stock (${targetBatch.stock}) for batch ${targetBatch.batchNo}.`);
          return prev;
        }

        const updated = [...prev];
        const newQty = existing.quantity + 1;
        const sub = newQty * existing.unitPrice;
        const disc = sub * (existing.discountPercent / 100);
        updated[existingIndex] = {
          ...existing,
          quantity: newQty,
          totalAmount: sub - disc,
        };
        return updated;
      }

      // New line item
      const unitPrice = targetBatch.sellingPrice;
      const totalAmount = unitPrice;

      return [
        ...prev,
        {
          medicineId: medicine.id,
          medicineName: medicine.name,
          genericName: medicine.genericName,
          dosageForm: medicine.dosageForm,
          batchNo: targetBatch.batchNo,
          expDate: targetBatch.expDate,
          quantity: 1,
          unitMrp: targetBatch.mrp,
          unitPrice,
          discountPercent: 0,
          gstPercent: medicine.gstRate,
          totalAmount,
          dosageInstructions: medicine.requiresPrescription ? '1-0-1 After Food' : 'As directed',
        },
      ];
    });
  };

  // Update Cart Item Quantity
  const handleUpdateQuantity = (medicineId: string, batchNo: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveFromCart(medicineId, batchNo);
      return;
    }

    setCartItems((prev) =>
      prev.map((item) => {
        if (item.medicineId === medicineId && item.batchNo === batchNo) {
          const sub = newQty * item.unitPrice;
          const disc = sub * (item.discountPercent / 100);
          return {
            ...item,
            quantity: newQty,
            totalAmount: sub - disc,
          };
        }
        return item;
      })
    );
  };

  // Update Cart Item Discount
  const handleUpdateDiscount = (medicineId: string, batchNo: string, discount: number) => {
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.medicineId === medicineId && item.batchNo === batchNo) {
          const sub = item.quantity * item.unitPrice;
          const disc = sub * (discount / 100);
          return {
            ...item,
            discountPercent: discount,
            totalAmount: sub - disc,
          };
        }
        return item;
      })
    );
  };

  // Remove Item from Cart
  const handleRemoveFromCart = (medicineId: string, batchNo: string) => {
    setCartItems((prev) => prev.filter((item) => !(item.medicineId === medicineId && item.batchNo === batchNo)));
  };

  // Calculations
  const rawSubTotal = cartItems.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
  const itemsDiscount = cartItems.reduce((acc, item) => acc + (item.quantity * item.unitPrice * (item.discountPercent / 100)), 0);
  const overallDiscountVal = (rawSubTotal - itemsDiscount) * (overallDiscountPercent / 100);
  const totalDiscount = itemsDiscount + overallDiscountVal;

  const netBeforeTax = rawSubTotal - totalDiscount;

  // Calculate GST weighted
  const totalGst = cartItems.reduce((acc, item) => {
    const itemNet = (item.quantity * item.unitPrice) * (1 - item.discountPercent / 100) * (1 - overallDiscountPercent / 100);
    return acc + (itemNet * (item.gstPercent / 100));
  }, 0);

  const rawGrandTotal = netBeforeTax + totalGst;
  const grandTotal = Math.round(rawGrandTotal);
  const roundOff = Number((grandTotal - rawGrandTotal).toFixed(2));

  // Submit & Generate Bill
  const handleCreateBill = () => {
    if (cartItems.length === 0) {
      alert('Your billing cart is empty! Please add medicines first.');
      return;
    }

    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    const timeStr = today.toTimeString().split(' ')[0].substring(0, 5);

    const invoiceNo = `PMH-${today.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newBill: Bill = {
      id: `bill-${Date.now()}`,
      invoiceNo,
      date: dateStr,
      time: timeStr,
      patientName: patientName || 'Walk-in Customer',
      patientPhone: patientPhone || 'N/A',
      doctorName: doctorName || 'Dr. Self',
      items: cartItems,
      subTotal: Number(rawSubTotal.toFixed(2)),
      discountAmount: Number(totalDiscount.toFixed(2)),
      gstAmount: Number(totalGst.toFixed(2)),
      roundOff,
      grandTotal,
      paymentMode,
      paymentStatus: 'Paid',
      pharmacistName: 'Pharm. R. Prince',
      notes: billNotes,
    };

    onCompleteBill(newBill);
  };

  // Populate patient info when selected
  const handleSelectPatient = (p: Patient) => {
    setPatientName(p.name);
    setPatientPhone(p.phone);
    if (p.doctorName) setDoctorName(p.doctorName);
    setShowPatientDropdown(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 max-w-7xl mx-auto">
      {/* Left Column: Medicine Catalog & Quick Search (7 cols on large screens) */}
      <div className="lg:col-span-7 space-y-4">
        {/* Search & AI Scan Header Bar */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by brand name, generic formula, or rack (e.g. Dolo, Paracetamol, Rack A-01)..."
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                >
                  Clear
                </button>
              )}
            </div>

            <button
              onClick={onOpenPrescriptionScanner}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-50 border border-emerald-300 text-emerald-800 hover:bg-emerald-100 rounded-lg text-xs font-semibold transition cursor-pointer shrink-0 shadow-xs"
            >
              <ScanLine className="w-4 h-4 text-emerald-600" />
              <span>AI Prescription Scanner</span>
            </button>
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full whitespace-nowrap font-medium transition cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Medicine Inventory Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[580px] overflow-y-auto pr-1">
          {filteredMedicines.length === 0 ? (
            <div className="col-span-2 bg-white p-8 rounded-xl border border-dashed border-slate-300 text-center text-slate-500">
              <Pill className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="font-medium text-sm">No medicines found matching "{searchQuery}"</p>
              <p className="text-xs text-slate-400 mt-1">Try searching by generic name or changing category filter.</p>
            </div>
          ) : (
            filteredMedicines.map((med) => {
              const activeBatch = med.batches.find((b) => b.stock > 0) || med.batches[0];
              const totalStock = med.batches.reduce((acc, b) => acc + b.stock, 0);
              const isLowStock = totalStock <= med.reorderLevel;

              return (
                <div
                  key={med.id}
                  className="bg-white p-3.5 rounded-xl border border-slate-200 hover:border-emerald-300 hover:shadow-md transition flex flex-col justify-between space-y-2 group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-bold text-slate-900 text-sm group-hover:text-emerald-700 transition">
                            {med.name}
                          </h3>
                          {med.requiresPrescription && (
                            <span className="text-[10px] bg-rose-50 text-rose-600 border border-rose-200 font-bold px-1.5 py-0.2 rounded">
                              Rx
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-1 italic">{med.genericName}</p>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-bold text-emerald-700">₹{activeBatch?.sellingPrice.toFixed(2)}</span>
                        {activeBatch?.mrp > activeBatch?.sellingPrice && (
                          <div className="text-[10px] text-slate-400 line-through">₹{activeBatch.mrp.toFixed(2)}</div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
                      <span className="bg-slate-100 text-slate-700 font-medium px-2 py-0.5 rounded">
                        {med.dosageForm} • {med.strength}
                      </span>
                      <span className="text-slate-400">{med.manufacturer}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="text-[11px]">
                      <span className="text-slate-400">Stock: </span>
                      <span
                        className={`font-semibold ${
                          totalStock === 0
                            ? 'text-rose-600'
                            : isLowStock
                            ? 'text-amber-600'
                            : 'text-emerald-600'
                        }`}
                      >
                        {totalStock} units
                      </span>
                      {activeBatch?.rackLocation && (
                        <span className="text-slate-400 ml-2">({activeBatch.rackLocation})</span>
                      )}
                    </div>

                    <button
                      onClick={() => handleAddToCart(med, activeBatch)}
                      disabled={totalStock === 0}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                        totalStock === 0
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs'
                      }`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Column: Active Bill Cart & Patient Checkout (5 cols) */}
      <div className="lg:col-span-5 bg-white rounded-xl shadow-md border border-slate-200 flex flex-col justify-between overflow-hidden">
        {/* Cart Header */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-emerald-400" />
            <h2 className="font-bold text-base font-serif">Counter Sale Bill</h2>
            <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2 py-0.5 rounded font-mono">
              {cartItems.length} items
            </span>
          </div>

          {cartItems.length > 0 && (
            <button
              onClick={() => setCartItems([])}
              className="text-xs text-slate-400 hover:text-rose-300 flex items-center gap-1 transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear
            </button>
          )}
        </div>

        {/* Patient / Customer Quick Form */}
        <div className="p-3.5 bg-slate-50 border-b border-slate-200 space-y-2 text-xs">
          <div className="grid grid-cols-2 gap-2 relative">
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-0.5 flex items-center gap-1">
                <User className="w-3 h-3 text-slate-400" /> Customer Name
              </label>
              <input
                type="text"
                value={patientName}
                onChange={(e) => {
                  setPatientName(e.target.value);
                  setShowPatientDropdown(true);
                }}
                placeholder="Name or Walk-in"
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs font-medium focus:ring-1 focus:ring-emerald-500"
              />

              {/* Patient Autocomplete Dropdown */}
              {showPatientDropdown && patientName && patients.filter(p => p.name.toLowerCase().includes(patientName.toLowerCase())).length > 0 && (
                <div className="absolute left-0 top-12 z-20 w-64 bg-white rounded-lg shadow-xl border border-slate-200 py-1">
                  {patients
                    .filter((p) => p.name.toLowerCase().includes(patientName.toLowerCase()))
                    .map((p) => (
                      <button
                        key={p.id}
                        onClick={() => handleSelectPatient(p)}
                        className="w-full text-left px-3 py-1.5 hover:bg-emerald-50 text-xs flex flex-col cursor-pointer border-b border-slate-100 last:border-0"
                      >
                        <span className="font-bold text-slate-800">{p.name}</span>
                        <span className="text-[10px] text-slate-500">Ph: {p.phone} • {p.doctorName}</span>
                      </button>
                    ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-0.5 flex items-center gap-1">
                <Phone className="w-3 h-3 text-slate-400" /> Phone Number
              </label>
              <input
                type="text"
                value={patientPhone}
                onChange={(e) => setPatientPhone(e.target.value)}
                placeholder="10-digit mobile"
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-0.5 flex items-center gap-1">
              <Stethoscope className="w-3 h-3 text-slate-400" /> Prescribed By Doctor
            </label>
            <input
              type="text"
              value={doctorName}
              onChange={(e) => setDoctorName(e.target.value)}
              placeholder="Doctor name & clinic"
              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Cart Line Items Table */}
        <div className="flex-1 max-h-[300px] overflow-y-auto p-3 space-y-2">
          {cartItems.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <Pill className="w-10 h-10 mx-auto text-slate-300" />
              <p className="font-medium text-sm text-slate-600">Billing Cart is Empty</p>
              <p className="text-xs text-slate-400">Select medicines from inventory or scan prescription.</p>
            </div>
          ) : (
            cartItems.map((item) => (
              <div
                key={`${item.medicineId}-${item.batchNo}`}
                className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5 text-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-slate-900">{item.medicineName}</h4>
                    <p className="text-[10px] text-slate-500">
                      Batch: <strong className="text-slate-700">{item.batchNo}</strong> • Exp: {item.expDate}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemoveFromCart(item.medicineId, item.batchNo)}
                    className="text-slate-400 hover:text-rose-600 p-0.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200/60">
                  {/* Quantity Controls */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleUpdateQuantity(item.medicineId, item.batchNo, item.quantity - 1)}
                      className="w-6 h-6 rounded bg-white border border-slate-300 flex items-center justify-center font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-bold text-slate-900">{item.quantity}</span>
                    <button
                      onClick={() => handleUpdateQuantity(item.medicineId, item.batchNo, item.quantity + 1)}
                      className="w-6 h-6 rounded bg-white border border-slate-300 flex items-center justify-center font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                    >
                      +
                    </button>
                  </div>

                  {/* Unit price & Discount */}
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 text-[11px]">₹{item.unitPrice.toFixed(2)} ea</span>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-slate-400">Disc:</span>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={item.discountPercent}
                        onChange={(e) => handleUpdateDiscount(item.medicineId, item.batchNo, Number(e.target.value))}
                        className="w-10 px-1 py-0.5 bg-white border border-slate-300 rounded text-center text-[10px]"
                      />
                      <span className="text-[10px]">%</span>
                    </div>
                  </div>

                  {/* Total Line Amount */}
                  <span className="font-bold text-emerald-800 text-sm">₹{item.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Payment & Grand Total Footer */}
        <div className="p-4 bg-slate-900 text-white space-y-3 border-t border-slate-800">
          {/* Payment Mode Toggle */}
          <div className="grid grid-cols-4 gap-1">
            {(['UPI', 'Cash', 'Card', 'Credit / Due'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setPaymentMode(mode)}
                className={`py-1.5 rounded text-[11px] font-semibold transition cursor-pointer flex items-center justify-center gap-1 ${
                  paymentMode === mode
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {mode === 'UPI' && <QrCode className="w-3 h-3" />}
                {mode === 'Cash' && <Receipt className="w-3 h-3" />}
                {mode === 'Card' && <CreditCard className="w-3 h-3" />}
                {mode}
              </button>
            ))}
          </div>

          {/* Pricing Summary Breakdown */}
          <div className="space-y-1 text-xs border-t border-slate-800 pt-2 text-slate-300">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-mono">₹{rawSubTotal.toFixed(2)}</span>
            </div>

            {totalDiscount > 0 && (
              <div className="flex justify-between text-emerald-400">
                <span>Total Discount Saved:</span>
                <span className="font-mono">-₹{totalDiscount.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between text-slate-400 text-[11px]">
              <span>Incl. GST Taxes:</span>
              <span className="font-mono">₹{totalGst.toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center text-lg font-bold text-white pt-1 border-t border-slate-800">
              <span className="font-serif">Grand Total:</span>
              <span className="text-emerald-400 font-mono text-xl">₹{grandTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Checkout Button */}
          <button
            onClick={handleCreateBill}
            disabled={cartItems.length === 0}
            className={`w-full py-3 rounded-xl font-bold text-sm transition cursor-pointer flex items-center justify-center gap-2 ${
              cartItems.length === 0
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-lg shadow-emerald-500/20'
            }`}
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>Generate Official Bill & Print Receipt</span>
          </button>
        </div>
      </div>
    </div>
  );
};
