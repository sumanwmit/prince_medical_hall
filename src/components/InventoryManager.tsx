import React, { useState } from 'react';
import { Medicine, Batch, MedicineCategory } from '../types';
import { 
  Search, 
  Plus, 
  Edit3, 
  AlertTriangle, 
  ShieldAlert, 
  Pill, 
  Tag, 
  MapPin, 
  Calendar, 
  TrendingUp, 
  CheckCircle, 
  X, 
  Filter,
  Package
} from 'lucide-react';

interface InventoryManagerProps {
  medicines: Medicine[];
  onAddMedicine: (newMed: Medicine) => void;
  onUpdateMedicine: (updatedMed: Medicine) => void;
}

export const InventoryManager: React.FC<InventoryManagerProps> = ({
  medicines,
  onAddMedicine,
  onUpdateMedicine,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [filterLowStockOnly, setFilterLowStockOnly] = useState(false);
  const [filterExpiringOnly, setFilterExpiringOnly] = useState(false);

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);

  // New Medicine Form State
  const [formName, setFormName] = useState('');
  const [formGeneric, setFormGeneric] = useState('');
  const [formCategory, setFormCategory] = useState<MedicineCategory>('Tablets & Capsules');
  const [formDosageForm, setFormDosageForm] = useState<'Tablet' | 'Capsule' | 'Syrup' | 'Injection' | 'Cream' | 'Inhaler' | 'Drops' | 'Ointment' | 'Powder' | 'Surgical'>('Tablet');
  const [formStrength, setFormStrength] = useState('500mg');
  const [formManufacturer, setFormManufacturer] = useState('Cipla Ltd');
  const [formRequiresRx, setFormRequiresRx] = useState(false);
  const [formGstRate, setFormGstRate] = useState<number>(12);
  const [formReorderLevel, setFormReorderLevel] = useState<number>(15);

  // Batch Form State
  const [formBatchNo, setFormBatchNo] = useState('BT-2026-X1');
  const [formMfgDate, setFormMfgDate] = useState('2025-10');
  const [formExpDate, setFormExpDate] = useState('2027-10-31');
  const [formMrp, setFormMrp] = useState<number>(100);
  const [formSellingPrice, setFormSellingPrice] = useState<number>(90);
  const [formPurchasePrice, setFormPurchasePrice] = useState<number>(65);
  const [formStock, setFormStock] = useState<number>(50);
  const [formRackLocation, setFormRackLocation] = useState('Rack A-01');

  const categories = ['All', 'Tablets & Capsules', 'Syrups & Liquids', 'Injections & Vials', 'Ointments & Creams', 'Cardiac & BP', 'Diabetes Care', 'Respiratory & Asthma', 'Vitamins & Supplements', 'First Aid & Surgical'];

  // Check if batch is expiring soon (within 60 days)
  const isExpiringSoon = (expDateStr: string) => {
    const exp = new Date(expDateStr);
    const now = new Date();
    const diffDays = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 3600 * 24));
    return diffDays <= 90; // within 90 days
  };

  // Filter medicines logic
  const filteredMedicines = medicines.filter((m) => {
    const totalStock = m.batches.reduce((acc, b) => acc + b.stock, 0);
    const isLow = totalStock <= m.reorderLevel;
    const isExpiring = m.batches.some((b) => isExpiringSoon(b.expDate));

    const matchesSearch = 
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.genericName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.manufacturer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.batches.some(b => b.batchNo.toLowerCase().includes(searchQuery.toLowerCase()) || b.rackLocation.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'All' || m.category === selectedCategory;

    if (filterLowStockOnly && !isLow) return false;
    if (filterExpiringOnly && !isExpiring) return false;

    return matchesSearch && matchesCategory;
  });

  // Open Edit Modal
  const handleOpenEdit = (med: Medicine) => {
    setEditingMedicine(med);
    setFormName(med.name);
    setFormGeneric(med.genericName);
    setFormCategory(med.category);
    setFormDosageForm(med.dosageForm);
    setFormStrength(med.strength);
    setFormManufacturer(med.manufacturer);
    setFormRequiresRx(med.requiresPrescription);
    setFormGstRate(med.gstRate);
    setFormReorderLevel(med.reorderLevel);

    const firstBatch = med.batches[0];
    if (firstBatch) {
      setFormBatchNo(firstBatch.batchNo);
      setFormMfgDate(firstBatch.mfgDate);
      setFormExpDate(firstBatch.expDate);
      setFormMrp(firstBatch.mrp);
      setFormSellingPrice(firstBatch.sellingPrice);
      setFormPurchasePrice(firstBatch.purchasePrice);
      setFormStock(firstBatch.stock);
      setFormRackLocation(firstBatch.rackLocation);
    }
  };

  // Save Add / Edit Medicine
  const handleSaveMedicine = (e: React.FormEvent) => {
    e.preventDefault();

    const newBatch: Batch = {
      batchNo: formBatchNo,
      mfgDate: formMfgDate,
      expDate: formExpDate,
      mrp: Number(formMrp),
      sellingPrice: Number(formSellingPrice),
      purchasePrice: Number(formPurchasePrice),
      stock: Number(formStock),
      rackLocation: formRackLocation,
    };

    if (editingMedicine) {
      // Update existing medicine
      const existingBatches = [...editingMedicine.batches];
      const batchIdx = existingBatches.findIndex(b => b.batchNo === formBatchNo);
      if (batchIdx > -1) {
        existingBatches[batchIdx] = newBatch;
      } else {
        existingBatches.unshift(newBatch);
      }

      const updated: Medicine = {
        ...editingMedicine,
        name: formName,
        genericName: formGeneric,
        category: formCategory,
        dosageForm: formDosageForm,
        strength: formStrength,
        manufacturer: formManufacturer,
        requiresPrescription: formRequiresRx,
        gstRate: Number(formGstRate),
        reorderLevel: Number(formReorderLevel),
        batches: existingBatches,
      };

      onUpdateMedicine(updated);
      setEditingMedicine(null);
    } else {
      // Add brand new medicine
      const newMed: Medicine = {
        id: `med-${Date.now()}`,
        name: formName,
        genericName: formGeneric,
        category: formCategory,
        dosageForm: formDosageForm,
        strength: formStrength,
        manufacturer: formManufacturer,
        requiresPrescription: formRequiresRx,
        gstRate: Number(formGstRate),
        reorderLevel: Number(formReorderLevel),
        batches: [newBatch],
      };

      onAddMedicine(newMed);
      setShowAddModal(false);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormName('');
    setFormGeneric('');
    setFormCategory('Tablets & Capsules');
    setFormDosageForm('Tablet');
    setFormStrength('500mg');
    setFormManufacturer('Cipla Ltd');
    setFormRequiresRx(false);
    setFormGstRate(12);
    setFormReorderLevel(15);
    setFormBatchNo('BT-2026-X1');
    setFormMfgDate('2025-10');
    setFormExpDate('2027-10-31');
    setFormMrp(100);
    setFormSellingPrice(90);
    setFormPurchasePrice(65);
    setFormStock(50);
    setFormRackLocation('Rack A-01');
  };

  return (
    <div className="p-4 max-w-7xl mx-auto space-y-4">
      {/* Top Action & Summary Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 font-serif">Pharmacy Inventory & Batch Control</h2>
            <p className="text-xs text-slate-500">
              Total {medicines.length} formulations registered • Live batch stock monitoring
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            resetForm();
            setEditingMedicine(null);
            setShowAddModal(true);
          }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg transition shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add New Medicine / Batch
        </button>
      </div>

      {/* Search & Filter Options */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by medicine name, generic formula, batch no, rack location..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 text-slate-800"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setFilterLowStockOnly(!filterLowStockOnly)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer border ${
                filterLowStockOnly
                  ? 'bg-amber-500 text-slate-950 border-amber-600 font-bold'
                  : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Low Stock Alerts Only</span>
            </button>

            <button
              onClick={() => setFilterExpiringOnly(!filterExpiringOnly)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer border ${
                filterExpiringOnly
                  ? 'bg-rose-600 text-white border-rose-700 font-bold'
                  : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Expiring Soon (&lt;90 days)</span>
            </button>
          </div>
        </div>

        {/* Category Tabs */}
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

      {/* Inventory Master Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-900 text-white uppercase text-[10px] tracking-wider font-bold">
              <tr>
                <th className="p-3.5">Medicine Name & Generic</th>
                <th className="p-3.5">Form / Strength</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Batches & Expiry</th>
                <th className="p-3.5 text-center">Rack Location</th>
                <th className="p-3.5 text-right">Selling / MRP</th>
                <th className="p-3.5 text-center">Total Stock</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredMedicines.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    No medicines match the selected filter criteria.
                  </td>
                </tr>
              ) : (
                filteredMedicines.map((med) => {
                  const totalStock = med.batches.reduce((acc, b) => acc + b.stock, 0);
                  const isLow = totalStock <= med.reorderLevel;
                  const activeBatch = med.batches[0];

                  return (
                    <tr key={med.id} className="hover:bg-slate-50/80 transition">
                      {/* Name & Formula */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 text-sm">{med.name}</span>
                          {med.requiresPrescription && (
                            <span className="text-[9px] bg-rose-100 text-rose-700 border border-rose-200 font-bold px-1 rounded">
                              Rx
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 italic">{med.genericName}</p>
                        <p className="text-[10px] text-slate-400">Mfg: {med.manufacturer}</p>
                      </td>

                      {/* Dosage Form */}
                      <td className="p-3.5">
                        <span className="bg-slate-100 text-slate-800 font-semibold px-2 py-0.5 rounded text-[11px]">
                          {med.dosageForm} • {med.strength}
                        </span>
                      </td>

                      {/* Category */}
                      <td className="p-3.5 text-slate-600 font-medium">
                        {med.category}
                      </td>

                      {/* Batches List */}
                      <td className="p-3.5">
                        <div className="space-y-1">
                          {med.batches.map((b) => {
                            const expiring = isExpiringSoon(b.expDate);
                            return (
                              <div
                                key={b.batchNo}
                                className={`text-[11px] font-mono px-2 py-0.5 rounded border inline-block mr-1.5 ${
                                  expiring
                                    ? 'bg-rose-50 border-rose-300 text-rose-800 font-bold'
                                    : 'bg-slate-50 border-slate-200 text-slate-700'
                                }`}
                              >
                                {b.batchNo} (Exp: {b.expDate}) - {b.stock} units
                              </div>
                            );
                          })}
                        </div>
                      </td>

                      {/* Rack Location */}
                      <td className="p-3.5 text-center font-mono font-medium text-slate-700">
                        {activeBatch?.rackLocation || 'Rack A-01'}
                      </td>

                      {/* Pricing */}
                      <td className="p-3.5 text-right font-mono">
                        <div className="font-bold text-emerald-800">₹{activeBatch?.sellingPrice.toFixed(2)}</div>
                        <div className="text-[10px] text-slate-400 line-through">MRP ₹{activeBatch?.mrp.toFixed(2)}</div>
                      </td>

                      {/* Stock Status Badge */}
                      <td className="p-3.5 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full font-bold text-xs inline-flex items-center gap-1 ${
                            totalStock === 0
                              ? 'bg-rose-100 text-rose-800'
                              : isLow
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {totalStock === 0 ? (
                            'Out of Stock'
                          ) : isLow ? (
                            <>
                              <AlertTriangle className="w-3 h-3" /> {totalStock} (Low)
                            </>
                          ) : (
                            `${totalStock} units`
                          )}
                        </span>
                      </td>

                      {/* Edit Button */}
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => handleOpenEdit(med)}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded text-xs inline-flex items-center gap-1 transition cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-slate-500" /> Edit / Batch
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Medicine Modal */}
      {(showAddModal || editingMedicine) && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden my-auto max-h-[90vh] flex flex-col">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-base font-serif">
                {editingMedicine ? `Edit ${editingMedicine.name}` : 'Add New Medicine & Initial Batch'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingMedicine(null);
                }}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMedicine} className="p-6 overflow-y-auto space-y-4 text-xs">
              {/* Medicine Basic Meta */}
              <div className="space-y-3 border-b border-slate-200 pb-4">
                <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                  <Pill className="w-4 h-4 text-emerald-600" /> General Formulation Information
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Brand Name *</label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="e.g. Dolo 650, Augmentin"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500 text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Generic / Active Formula *</label>
                    <input
                      type="text"
                      required
                      value={formGeneric}
                      onChange={(e) => setFormGeneric(e.target.value)}
                      placeholder="e.g. Paracetamol 650mg"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500 text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Category</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as MedicineCategory)}
                      className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500 text-slate-800"
                    >
                      {categories.filter(c => c !== 'All').map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Form</label>
                    <select
                      value={formDosageForm}
                      onChange={(e) => setFormDosageForm(e.target.value as any)}
                      className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500 text-slate-800"
                    >
                      {['Tablet', 'Capsule', 'Syrup', 'Injection', 'Cream', 'Inhaler', 'Drops', 'Ointment', 'Surgical'].map(f => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Strength / Unit</label>
                    <input
                      type="text"
                      value={formStrength}
                      onChange={(e) => setFormStrength(e.target.value)}
                      placeholder="650mg, 100ml"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Manufacturer</label>
                    <input
                      type="text"
                      value={formManufacturer}
                      onChange={(e) => setFormManufacturer(e.target.value)}
                      placeholder="Micro Labs, Cipla"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-5">
                    <input
                      type="checkbox"
                      id="rxCheck"
                      checked={formRequiresRx}
                      onChange={(e) => setFormRequiresRx(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded"
                    />
                    <label htmlFor="rxCheck" className="font-semibold text-slate-800">
                      Requires Doctor Prescription (Rx)
                    </label>
                  </div>
                </div>
              </div>

              {/* Batch & Inventory Stock Info */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-emerald-600" /> Batch Stock & Pricing Details
                </h4>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Batch Number *</label>
                    <input
                      type="text"
                      required
                      value={formBatchNo}
                      onChange={(e) => setFormBatchNo(e.target.value)}
                      placeholder="BT-9021"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Expiry Date (YYYY-MM-DD) *</label>
                    <input
                      type="date"
                      required
                      value={formExpDate}
                      onChange={(e) => setFormExpDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Shelf / Rack Location</label>
                    <input
                      type="text"
                      value={formRackLocation}
                      onChange={(e) => setFormRackLocation(e.target.value)}
                      placeholder="Rack A-02"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">MRP (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formMrp}
                      onChange={(e) => setFormMrp(Number(e.target.value))}
                      className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Selling Price (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formSellingPrice}
                      onChange={(e) => setFormSellingPrice(Number(e.target.value))}
                      className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded font-mono font-bold text-emerald-800"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Stock Count</label>
                    <input
                      type="number"
                      value={formStock}
                      onChange={(e) => setFormStock(Number(e.target.value))}
                      className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Reorder Alert</label>
                    <input
                      type="number"
                      value={formReorderLevel}
                      onChange={(e) => setFormReorderLevel(Number(e.target.value))}
                      className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingMedicine(null);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold cursor-pointer shadow-sm"
                >
                  Save to Inventory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
