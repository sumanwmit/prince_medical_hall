import React, { useState } from 'react';
import { Patient, Bill } from '../types';
import { 
  Users, 
  Search, 
  Plus, 
  Phone, 
  Calendar, 
  AlertTriangle, 
  MessageSquare, 
  Receipt, 
  ChevronRight, 
  UserPlus, 
  X,
  Send
} from 'lucide-react';

interface PatientRecordsProps {
  patients: Patient[];
  bills: Bill[];
  onAddPatient: (patient: Patient) => void;
}

export const PatientRecords: React.FC<PatientRecordsProps> = ({
  patients,
  bills,
  onAddPatient,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(patients[0] || null);

  // Add Patient Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState<number>(45);
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [address, setAddress] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [allergies, setAllergies] = useState('');
  const [chronicConditions, setChronicConditions] = useState('');

  const filteredPatients = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.phone.includes(searchQuery) ||
      (p.doctorName && p.doctorName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Get bills for selected patient
  const patientBills = bills.filter(
    (b) => b.patientName.toLowerCase() === selectedPatient?.name.toLowerCase() || b.patientPhone === selectedPatient?.phone
  );

  const handleSavePatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    const newPat: Patient = {
      id: `pat-${Date.now()}`,
      name,
      phone,
      age: Number(age),
      gender,
      address,
      doctorName,
      allergies: allergies ? allergies.split(',').map((s) => s.trim()) : [],
      chronicConditions: chronicConditions ? chronicConditions.split(',').map((s) => s.trim()) : [],
      lastPurchaseDate: new Date().toISOString().split('T')[0],
    };

    onAddPatient(newPat);
    setSelectedPatient(newPat);
    setShowAddModal(false);
    resetForm();
  };

  const resetForm = () => {
    setName('');
    setPhone('');
    setAge(45);
    setGender('Male');
    setAddress('');
    setDoctorName('');
    setAllergies('');
    setChronicConditions('');
  };

  // Generate WhatsApp Refill Link
  const handleSendRefillReminder = (p: Patient) => {
    const text = `Hello ${p.name}, this is a gentle reminder from Prince Medical Hall (12/A College Street, Kolkata).
Your chronic medication refill (${p.refillDueMedicine || 'Monthly Medicine'}) is due around ${p.refillDueDate || 'this week'}.
Reply or call us at +91 98300 12345 for home delivery or counter pickup!`;

    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/91${p.phone}?text=${encoded}`, '_blank');
  };

  return (
    <div className="p-4 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 font-serif">Patient Directory & Chronic Refill Alerts</h2>
            <p className="text-xs text-slate-500">
              Manage patient medication histories, allergy warnings, and automated monthly refill schedules
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg transition shadow-sm cursor-pointer"
        >
          <UserPlus className="w-4 h-4" /> Register New Patient
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Patient Directory List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search patients by name, phone, doctor..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 text-slate-800"
            />
          </div>

          <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
            {filteredPatients.map((p) => {
              const isSelected = selectedPatient?.id === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedPatient(p)}
                  className={`p-3.5 rounded-xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                      : 'bg-white text-slate-800 border-slate-200 hover:border-emerald-300'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm">{p.name}</h4>
                      <span
                        className={`text-[10px] px-2 py-0.2 rounded font-semibold ${
                          isSelected ? 'bg-slate-800 text-emerald-300' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {p.age}y • {p.gender}
                      </span>
                    </div>

                    <p className={`text-xs ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                      Ph: {p.phone} • Doc: {p.doctorName || 'General'}
                    </p>

                    {p.refillDueMedicine && (
                      <span className="inline-block text-[10px] font-bold text-amber-400 bg-amber-950/60 border border-amber-800 px-2 py-0.5 rounded">
                        Refill Due: {p.refillDueMedicine}
                      </span>
                    )}
                  </div>

                  <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-emerald-400' : 'text-slate-300'}`} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Patient Profile & History (7 cols) */}
        <div className="lg:col-span-7">
          {!selectedPatient ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center text-slate-400">
              Select a patient from the list to view medical history and past purchases.
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
              {/* Patient Header Details */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold font-serif text-slate-900">{selectedPatient.name}</h3>
                    <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded">
                      ID: {selectedPatient.id}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Phone: <strong className="text-slate-800">{selectedPatient.phone}</strong> • Address: {selectedPatient.address || 'Kolkata'}
                  </p>
                </div>

                <button
                  onClick={() => handleSendRefillReminder(selectedPatient)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition cursor-pointer shadow-md shrink-0"
                >
                  <Send className="w-4 h-4" /> Send Refill Reminder
                </button>
              </div>

              {/* Clinical Profile Chips */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-1">
                  <span className="font-bold text-rose-900 text-[11px] block uppercase">Drug Allergy Alerts</span>
                  {selectedPatient.allergies && selectedPatient.allergies.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {selectedPatient.allergies.map((a, idx) => (
                        <span key={idx} className="bg-rose-200 text-rose-900 font-bold px-2 py-0.5 rounded text-[10px]">
                          ⚠️ {a}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-slate-500">No known drug allergies reported</span>
                  )}
                </div>

                <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl space-y-1">
                  <span className="font-bold text-indigo-900 text-[11px] block uppercase">Chronic Illness Tracker</span>
                  {selectedPatient.chronicConditions && selectedPatient.chronicConditions.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {selectedPatient.chronicConditions.map((c, idx) => (
                        <span key={idx} className="bg-indigo-200 text-indigo-900 font-bold px-2 py-0.5 rounded text-[10px]">
                          {c}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-slate-500">None logged</span>
                  )}
                </div>
              </div>

              {/* Purchase History */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-emerald-600" /> Purchase History ({patientBills.length} Bills)
                </h4>

                {patientBills.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No previous bills logged under this patient's profile.</p>
                ) : (
                  <div className="space-y-2 max-h-[280px] overflow-y-auto">
                    {patientBills.map((b) => (
                      <div key={b.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">#{b.invoiceNo}</span>
                          <span className="text-slate-500">{b.date} {b.time}</span>
                        </div>

                        <div className="text-slate-600 text-[11px] space-y-0.5">
                          {b.items.map((it, i) => (
                            <div key={i} className="flex justify-between">
                              <span>• {it.medicineName} ({it.batchNo}) x{it.quantity}</span>
                              <span className="font-mono">₹{it.totalAmount.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>

                        <div className="pt-1 border-t border-slate-200 flex justify-between font-bold text-emerald-800">
                          <span>Total Paid ({b.paymentMode}):</span>
                          <span>₹{b.grandTotal.toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Patient Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-base font-serif">Register New Patient</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePatient} className="p-6 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Patient Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full name"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="10-digit mobile"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Age</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Attending Doctor</label>
                  <input
                    type="text"
                    value={doctorName}
                    onChange={(e) => setDoctorName(e.target.value)}
                    placeholder="Dr. Name"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Drug Allergies (comma separated)</label>
                <input
                  type="text"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  placeholder="e.g. Penicillin, Sulfa"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Chronic Illnesses (comma separated)</label>
                <input
                  type="text"
                  value={chronicConditions}
                  onChange={(e) => setChronicConditions(e.target.value)}
                  placeholder="e.g. Hypertension, Diabetes"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg cursor-pointer"
                >
                  Save Patient Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
