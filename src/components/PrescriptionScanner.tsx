import React, { useState } from 'react';
import { Medicine, PrescriptionScanResult, BillItem } from '../types';
import { 
  ScanLine, 
  Upload, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Pill, 
  Loader2, 
  Image as ImageIcon, 
  Stethoscope, 
  User, 
  Calendar 
} from 'lucide-react';

interface PrescriptionScannerProps {
  medicines: Medicine[];
  onTransferToCart: (items: BillItem[]) => void;
  onNavigateToPOS: () => void;
}

export const PrescriptionScanner: React.FC<PrescriptionScannerProps> = ({
  medicines,
  onTransferToCart,
  onNavigateToPOS,
}) => {
  const [activeMode, setActiveMode] = useState<'image' | 'text'>('image');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [doctorNotesText, setDoctorNotesText] = useState<string>('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<PrescriptionScanResult | null>(null);

  // Sample quick Doctor Prescription preset for instant testing
  const SAMPLE_DOCTOR_NOTE = `Patient: Ramesh Sen (Age: 52)
Doctor: Dr. S. K. Roy, MD (Cardiology) - Reg No: WBMC-48291
Diagnosis: Hypertension + Chronic Acid Reflux

Rx:
1. Telma 40mg Tab - 1 tablet daily morning after food x 30 days
2. Pan D Capsule - 1 capsule before breakfast x 15 days
3. Dolo 650 Tab - 1 tab SOS for body pain`;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMimeType(file.type || 'image/jpeg');
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
      setScanResult(null);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleScanPrescription = async () => {
    if (activeMode === 'image' && !selectedImage) {
      setError('Please select or upload a prescription image first.');
      return;
    }
    if (activeMode === 'text' && !doctorNotesText.trim()) {
      setError('Please enter or paste doctor notes first.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/prescription/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: activeMode === 'image' ? selectedImage : undefined,
          mimeType: activeMode === 'image' ? mimeType : undefined,
          doctorNotes: activeMode === 'text' ? doctorNotesText : undefined,
        }),
      });

      const resData = await response.json();

      if (!resData.success) {
        throw new Error(resData.error || 'Failed to parse prescription.');
      }

      // Process matched inventory items
      const parsed: PrescriptionScanResult = resData.data;

      const updatedMedicines = parsed.medicines.map((parsedMed) => {
        // Try exact name or fuzzy match
        const matched = medicines.find(
          (m) =>
            m.name.toLowerCase().includes(parsedMed.medicineName.toLowerCase()) ||
            parsedMed.medicineName.toLowerCase().includes(m.name.toLowerCase()) ||
            (parsedMed.genericComposition && m.genericName.toLowerCase().includes(parsedMed.genericComposition.toLowerCase()))
        );

        if (matched) {
          const availableBatch = matched.batches.find((b) => b.stock > 0) || matched.batches[0];
          const totalStock = matched.batches.reduce((acc, b) => acc + b.stock, 0);

          return {
            ...parsedMed,
            matchedInventoryId: matched.id,
            inStock: totalStock > 0,
            availableStockCount: totalStock,
            suggestedBatch: availableBatch,
          };
        }

        return {
          ...parsedMed,
          inStock: false,
          availableStockCount: 0,
        };
      });

      setScanResult({
        ...parsed,
        medicines: updatedMedicines,
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error communicating with Gemini AI Prescription Scanner.');
    } finally {
      setLoading(false);
    }
  };

  // Convert matched medicines into POS Cart items & redirect
  const handleTransferAllToCart = () => {
    if (!scanResult) return;

    const newCartItems: BillItem[] = [];

    scanResult.medicines.forEach((med) => {
      if (med.matchedInventoryId && med.suggestedBatch) {
        const fullMed = medicines.find((m) => m.id === med.matchedInventoryId);
        if (!fullMed) return;

        const qty = med.totalQuantity || 1;
        const unitPrice = med.suggestedBatch.sellingPrice;

        newCartItems.push({
          medicineId: fullMed.id,
          medicineName: fullMed.name,
          genericName: fullMed.genericName,
          dosageForm: fullMed.dosageForm,
          batchNo: med.suggestedBatch.batchNo,
          expDate: med.suggestedBatch.expDate,
          quantity: qty,
          unitMrp: med.suggestedBatch.mrp,
          unitPrice,
          discountPercent: 0,
          gstPercent: fullMed.gstRate,
          totalAmount: qty * unitPrice,
          dosageInstructions: `${med.frequency || ''} ${med.timing || ''}`.trim(),
        });
      }
    });

    if (newCartItems.length === 0) {
      alert('None of the extracted medicines matched available store stock.');
      return;
    }

    onTransferToCart(newCartItems);
    onNavigateToPOS();
  };

  return (
    <div className="p-4 max-w-7xl mx-auto space-y-6">
      {/* Intro Header */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white p-6 rounded-2xl shadow-md border border-emerald-800/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2.5 py-0.5 rounded-full font-bold border border-emerald-500/30 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Powered by Gemini AI OCR
            </span>
          </div>
          <h2 className="text-2xl font-bold font-serif">Smart Prescription Scanner & Parser</h2>
          <p className="text-xs text-slate-300 max-w-2xl">
            Upload doctor prescriptions or handwritten medical notes. Gemini AI extracts structured medicines, dosage, timing, and matches them directly with Prince Medical Hall inventory stock!
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input Form (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            {/* Tab selector */}
            <div className="flex rounded-lg bg-slate-100 p-1 text-xs font-semibold">
              <button
                onClick={() => setActiveMode('image')}
                className={`flex-1 py-2 rounded-md transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeMode === 'image' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ImageIcon className="w-4 h-4 text-emerald-600" />
                Upload Rx Photo
              </button>

              <button
                onClick={() => setActiveMode('text')}
                className={`flex-1 py-2 rounded-md transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeMode === 'text' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="w-4 h-4 text-emerald-600" />
                Paste Doctor Notes
              </button>
            </div>

            {/* Image Mode Upload */}
            {activeMode === 'image' && (
              <div className="space-y-3">
                <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl p-6 text-center transition bg-slate-50 relative group cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {selectedImage ? (
                    <div className="space-y-2">
                      <img
                        src={selectedImage}
                        alt="Prescription preview"
                        className="max-h-48 mx-auto rounded-lg shadow-md object-contain"
                      />
                      <p className="text-xs text-emerald-700 font-semibold">Click or drag to replace image</p>
                    </div>
                  ) : (
                    <div className="space-y-2 py-4">
                      <Upload className="w-10 h-10 text-slate-400 mx-auto group-hover:scale-110 transition" />
                      <p className="text-sm font-bold text-slate-700">Drop Prescription Image Here</p>
                      <p className="text-xs text-slate-400">Supports JPG, PNG, WEBP prescription photos</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Text Mode */}
            {activeMode === 'text' && (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-semibold text-slate-700">Doctor Prescription Notes</label>
                  <button
                    onClick={() => setDoctorNotesText(SAMPLE_DOCTOR_NOTE)}
                    className="text-emerald-600 hover:underline font-semibold"
                  >
                    Load Sample Prescription
                  </button>
                </div>
                <textarea
                  rows={8}
                  value={doctorNotesText}
                  onChange={(e) => setDoctorNotesText(e.target.value)}
                  placeholder="Paste doctor notes or handwritten prescription details here..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-emerald-500 text-slate-800"
                />
              </div>
            )}

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handleScanPrescription}
              disabled={loading}
              className={`w-full py-3 rounded-xl font-bold text-sm text-white transition flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                loading
                  ? 'bg-slate-700 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Gemini AI Analyzing Prescription...</span>
                </>
              ) : (
                <>
                  <ScanLine className="w-5 h-5" />
                  <span>Parse Prescription with Gemini AI</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: AI Extraction Output & Inventory Match (7 cols) */}
        <div className="lg:col-span-7">
          {!scanResult ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center text-slate-400 space-y-3">
              <ScanLine className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-700 text-base">No Prescription Scanned Yet</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Upload a prescription photo or paste handwritten notes on the left panel to trigger automatic medicine identification and stock matching.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-5">
              {/* Header result */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                      AI Prescription Parsed
                    </span>
                    <span className="text-xs text-slate-500">Date: {scanResult.date || 'Today'}</span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base font-serif flex items-center gap-2">
                    <User className="w-4 h-4 text-emerald-600" /> Patient: {scanResult.patientName}
                  </h3>

                  <p className="text-xs text-slate-600 flex items-center gap-1">
                    <Stethoscope className="w-3.5 h-3.5 text-slate-400" /> Doctor: {scanResult.doctorName}
                  </p>
                </div>

                <button
                  onClick={handleTransferAllToCart}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition cursor-pointer shadow-md shrink-0"
                >
                  <span>Transfer to POS Cart</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Pharmacist Alerts */}
              {scanResult.pharmacistAlerts && scanResult.pharmacistAlerts.length > 0 && (
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl space-y-1 text-xs">
                  <h4 className="font-bold text-amber-900 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-600" /> Pharmacist Attention Notes:
                  </h4>
                  <ul className="list-disc list-inside text-amber-800 space-y-0.5">
                    {scanResult.pharmacistAlerts.map((alert, i) => (
                      <li key={i}>{alert}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Medicines Extracted & Inventory Match Cards */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Pill className="w-4 h-4 text-emerald-600" /> Extracted Medicines ({scanResult.medicines.length})
                </h4>

                <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
                  {scanResult.medicines.map((med, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl border border-slate-200 hover:border-emerald-300 transition space-y-2 bg-slate-50/50"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-sm">{med.medicineName}</span>
                            <span className="text-[11px] bg-slate-200 text-slate-700 px-2 py-0.2 rounded font-medium">
                              {med.dosageForm}
                            </span>
                          </div>
                          {med.genericComposition && (
                            <p className="text-xs text-slate-500 italic">{med.genericComposition}</p>
                          )}
                        </div>

                        {/* Stock Match Badge */}
                        <div>
                          {med.inStock ? (
                            <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[11px] font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> In Stock ({med.availableStockCount})
                            </span>
                          ) : (
                            <span className="bg-rose-100 text-rose-800 border border-rose-300 text-[11px] font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5 text-rose-600" /> Out of Stock / Order Needed
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-600 bg-white p-2.5 rounded-lg border border-slate-100">
                        <div>
                          <span className="text-slate-400 block text-[10px]">Frequency:</span>
                          <strong className="text-slate-800">{med.frequency || '1-0-1'}</strong>
                        </div>

                        <div>
                          <span className="text-slate-400 block text-[10px]">Timing:</span>
                          <strong className="text-slate-800">{med.timing || 'After Food'}</strong>
                        </div>

                        <div>
                          <span className="text-slate-400 block text-[10px]">Duration & Qty:</span>
                          <strong className="text-slate-800">{med.duration || '5 Days'} ({med.totalQuantity || 10} units)</strong>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
