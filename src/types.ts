export type MedicineCategory = 
  | 'Tablets & Capsules'
  | 'Syrups & Liquids'
  | 'Injections & Vials'
  | 'Ointments & Creams'
  | 'Cardiac & BP'
  | 'Diabetes Care'
  | 'Respiratory & Asthma'
  | 'Vitamins & Supplements'
  | 'First Aid & Surgical'
  | 'Baby & Mother Care';

export interface Batch {
  batchNo: string;
  mfgDate: string; // YYYY-MM
  expDate: string; // YYYY-MM-DD
  mrp: number;
  sellingPrice: number;
  purchasePrice: number;
  stock: number;
  rackLocation: string; // e.g. "Rack A-04"
}

export interface Medicine {
  id: string;
  name: string;
  genericName: string;
  category: MedicineCategory;
  dosageForm: 'Tablet' | 'Capsule' | 'Syrup' | 'Injection' | 'Cream' | 'Inhaler' | 'Drops' | 'Ointment' | 'Powder' | 'Surgical';
  strength: string; // e.g. "650mg", "100ml", "10mg"
  manufacturer: string;
  requiresPrescription: boolean;
  batches: Batch[];
  reorderLevel: number;
  description?: string;
  sideEffects?: string[];
  gstRate: number; // e.g. 5, 12, 18
}

export interface BillItem {
  medicineId: string;
  medicineName: string;
  genericName: string;
  dosageForm: string;
  batchNo: string;
  expDate: string;
  quantity: number;
  unitMrp: number;
  unitPrice: number;
  discountPercent: number;
  gstPercent: number;
  totalAmount: number;
  dosageInstructions?: string; // e.g. "1-0-1 After Food"
}

export interface Patient {
  id: string;
  name: string;
  phone: string;
  age?: number;
  gender?: 'Male' | 'Female' | 'Other';
  address?: string;
  doctorName?: string;
  allergies?: string[];
  chronicConditions?: string[];
  lastPurchaseDate?: string;
  refillDueMedicine?: string;
  refillDueDate?: string;
}

export interface Bill {
  id: string;
  invoiceNo: string; // e.g. PMH-2026-0892
  date: string;
  time: string;
  patientName: string;
  patientPhone: string;
  doctorName: string;
  items: BillItem[];
  subTotal: number;
  discountAmount: number;
  gstAmount: number;
  roundOff: number;
  grandTotal: number;
  paymentMode: 'Cash' | 'UPI' | 'Card' | 'Credit / Due';
  paymentStatus: 'Paid' | 'Pending' | 'Partial';
  pharmacistName: string;
  notes?: string;
}

export interface ParsedPrescriptionMedicine {
  medicineName: string;
  genericComposition?: string;
  dosageForm: string;
  frequency?: string;
  timing?: string;
  duration?: string;
  totalQuantity?: number;
  specialInstructions?: string;
  matchedInventoryId?: string;
  inStock?: boolean;
  availableStockCount?: number;
  suggestedBatch?: Batch;
}

export interface PrescriptionScanResult {
  patientName: string;
  patientAge?: string;
  doctorName: string;
  doctorRegNo?: string;
  diagnosis?: string;
  date?: string;
  medicines: ParsedPrescriptionMedicine[];
  pharmacistAlerts?: string[];
}

export interface DrugInteractionResult {
  overallRiskLevel: 'Low' | 'Moderate' | 'High' | 'Severe';
  summary: string;
  interactions: Array<{
    drugPair: string;
    severity: 'Minor' | 'Moderate' | 'Major' | 'Contraindicated';
    description: string;
    management: string;
  }>;
  foodInteractions?: string[];
  patientCounselingPoints?: string[];
  genericEquivalents?: Array<{
    brandName: string;
    genericName: string;
    costSavingTip: string;
  }>;
}
