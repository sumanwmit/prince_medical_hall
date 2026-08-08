import React, { useState } from 'react';
import { Medicine, Patient, Bill, BillItem } from './types';
import { INITIAL_MEDICINES, INITIAL_PATIENTS, INITIAL_BILLS } from './data/initialData';
import { Header } from './components/Header';
import { POSBilling } from './components/POSBilling';
import { InventoryManager } from './components/InventoryManager';
import { PrescriptionScanner } from './components/PrescriptionScanner';
import { InteractionChecker } from './components/InteractionChecker';
import { PatientRecords } from './components/PatientRecords';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { InvoiceModal } from './components/InvoiceModal';
import { StoreInfoFooter } from './components/StoreInfoFooter';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('pos');

  // Application Persistent State
  const [medicines, setMedicines] = useState<Medicine[]>(INITIAL_MEDICINES);
  const [patients, setPatients] = useState<Patient[]>(INITIAL_PATIENTS);
  const [bills, setBills] = useState<Bill[]>(INITIAL_BILLS);

  // Active Billing Cart State
  const [cartItems, setCartItems] = useState<BillItem[]>([]);

  // Invoice Modal State
  const [activeBillModal, setActiveBillModal] = useState<Bill | null>(null);

  // Calculate Low Stock and Expiring Soon Alerts
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

  // Handle Bill Completion
  const handleCompleteBill = (newBill: Bill) => {
    // 1. Deduct stock from inventory batches
    setMedicines((prevMeds) =>
      prevMeds.map((med) => {
        const itemSold = newBill.items.find((it) => it.medicineId === med.id);
        if (!itemSold) return med;

        // Deduct quantity from matched batch
        const updatedBatches = med.batches.map((batch) => {
          if (batch.batchNo === itemSold.batchNo) {
            return {
              ...batch,
              stock: Math.max(0, batch.stock - itemSold.quantity),
            };
          }
          return batch;
        });

        return {
          ...med,
          batches: updatedBatches,
        };
      })
    );

    // 2. Append bill to bill history
    setBills((prev) => [newBill, ...prev]);

    // 3. Open Invoice Modal
    setActiveBillModal(newBill);

    // 4. Clear Cart
    setCartItems([]);
  };

  // Add / Update Medicine
  const handleAddMedicine = (newMed: Medicine) => {
    setMedicines((prev) => [newMed, ...prev]);
  };

  const handleUpdateMedicine = (updatedMed: Medicine) => {
    setMedicines((prev) => prev.map((m) => (m.id === updatedMed.id ? updatedMed : m)));
  };

  // Add Patient
  const handleAddPatient = (newPatient: Patient) => {
    setPatients((prev) => [newPatient, ...prev]);
  };

  // Transfer Extracted Prescription Items to POS Billing
  const handleTransferPrescriptionToCart = (extractedItems: BillItem[]) => {
    setCartItems(extractedItems);
    setActiveTab('pos');
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 flex flex-col justify-between">
      <div>
        {/* Navigation & Header */}
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          lowStockCount={lowStockCount}
          expiringCount={expiringCount}
        />

        {/* Main Content View Switcher */}
        <main className="py-2">
          {activeTab === 'pos' && (
            <POSBilling
              medicines={medicines}
              patients={patients}
              onCompleteBill={handleCompleteBill}
              onOpenPrescriptionScanner={() => setActiveTab('prescription')}
              cartItems={cartItems}
              setCartItems={setCartItems}
            />
          )}

          {activeTab === 'inventory' && (
            <InventoryManager
              medicines={medicines}
              onAddMedicine={handleAddMedicine}
              onUpdateMedicine={handleUpdateMedicine}
            />
          )}

          {activeTab === 'prescription' && (
            <PrescriptionScanner
              medicines={medicines}
              onTransferToCart={handleTransferPrescriptionToCart}
              onNavigateToPOS={() => setActiveTab('pos')}
            />
          )}

          {activeTab === 'interactions' && (
            <InteractionChecker medicines={medicines} />
          )}

          {activeTab === 'patients' && (
            <PatientRecords
              patients={patients}
              bills={bills}
              onAddPatient={handleAddPatient}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsDashboard bills={bills} medicines={medicines} />
          )}
        </main>
      </div>

      {/* Invoice Modal */}
      <InvoiceModal
        bill={activeBillModal}
        onClose={() => setActiveBillModal(null)}
      />

      {/* Footer */}
      <StoreInfoFooter />
    </div>
  );
}
