import React, { useState } from 'react';
import { Medicine, DrugInteractionResult } from '../types';
import { 
  ShieldAlert, 
  Search, 
  Plus, 
  Trash2, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Loader2, 
  Pill, 
  HelpCircle, 
  DollarSign, 
  FileText 
} from 'lucide-react';

interface InteractionCheckerProps {
  medicines: Medicine[];
}

export const InteractionChecker: React.FC<InteractionCheckerProps> = ({ medicines }) => {
  const [activeTab, setActiveTab] = useState<'interaction' | 'generic'>('interaction');

  // Interaction State
  const [selectedMeds, setSelectedMeds] = useState<string[]>(['Telma 40', 'Dolo 650']);
  const [customMedInput, setCustomMedInput] = useState('');
  const [loadingInteraction, setLoadingInteraction] = useState(false);
  const [interactionResult, setInteractionResult] = useState<DrugInteractionResult | null>(null);
  const [interactionError, setInteractionError] = useState<string | null>(null);

  // Generic Finder State
  const [genericQuery, setGenericQuery] = useState('Augmentin 625');
  const [loadingGeneric, setLoadingGeneric] = useState(false);
  const [genericResult, setGenericResult] = useState<any | null>(null);
  const [genericError, setGenericError] = useState<string | null>(null);

  // Add Medicine to interaction check list
  const handleAddMedicine = (medName: string) => {
    if (!medName.trim()) return;
    if (selectedMeds.includes(medName.trim())) return;
    setSelectedMeds((prev) => [...prev, medName.trim()]);
    setCustomMedInput('');
  };

  const handleRemoveMedicine = (index: number) => {
    setSelectedMeds((prev) => prev.filter((_, i) => i !== index));
  };

  // Run Interaction Analysis
  const handleCheckInteractions = async () => {
    if (selectedMeds.length === 0) {
      setInteractionError('Please add at least one medicine to check interactions.');
      return;
    }

    setLoadingInteraction(true);
    setInteractionError(null);

    try {
      const response = await fetch('/api/drug-interaction/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ medicines: selectedMeds }),
      });

      const resData = await response.json();

      if (!resData.success) {
        throw new Error(resData.error || 'Failed to analyze drug interactions.');
      }

      setInteractionResult(resData.data);
    } catch (err: any) {
      console.error(err);
      setInteractionError(err.message || 'Error checking drug interactions.');
    } finally {
      setLoadingInteraction(false);
    }
  };

  // Search Generic Substitutes
  const handleFindGeneric = async () => {
    if (!genericQuery.trim()) return;

    setLoadingGeneric(true);
    setGenericError(null);

    try {
      const response = await fetch('/api/generic/find', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: genericQuery }),
      });

      const resData = await response.json();

      if (!resData.success) {
        throw new Error(resData.error || 'Failed to search generic substitutes.');
      }

      setGenericResult(resData.data);
    } catch (err: any) {
      console.error(err);
      setGenericError(err.message || 'Error searching generic formula.');
    } finally {
      setLoadingGeneric(false);
    }
  };

  return (
    <div className="p-4 max-w-7xl mx-auto space-y-6">
      {/* Navigation Mode Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-md border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-indigo-500/20 text-indigo-300 text-xs px-2.5 py-0.5 rounded-full font-bold border border-indigo-500/30 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Clinical Decision Support
            </span>
          </div>
          <h2 className="text-2xl font-bold font-serif">Drug Interaction & Bio-Equivalent Finder</h2>
          <p className="text-xs text-slate-300">
            Pharmacist safety engine powered by Gemini AI. Check multi-drug interactions, food contraindications, and identify affordable generic substitutes.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="bg-slate-800 p-1 rounded-xl flex items-center gap-1 text-xs font-semibold shrink-0">
          <button
            onClick={() => setActiveTab('interaction')}
            className={`px-4 py-2 rounded-lg transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'interaction' ? 'bg-indigo-600 text-white shadow-sm font-bold' : 'text-slate-300 hover:text-white'
            }`}
          >
            <ShieldAlert className="w-4 h-4" /> Drug Interaction Checker
          </button>

          <button
            onClick={() => setActiveTab('generic')}
            className={`px-4 py-2 rounded-lg transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'generic' ? 'bg-indigo-600 text-white shadow-sm font-bold' : 'text-slate-300 hover:text-white'
            }`}
          >
            <DollarSign className="w-4 h-4" /> Generic Substitute Finder
          </button>
        </div>
      </div>

      {activeTab === 'interaction' ? (
        /* Interaction Checker View */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Panel: Selected Medicines List */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 text-base font-serif flex items-center gap-2">
                <Pill className="w-5 h-5 text-indigo-600" /> Selected Regimen
              </h3>

              {/* Add Quick Medicine Dropdown or Custom Input */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-slate-700">Add Medicine from Inventory</label>
                <select
                  onChange={(e) => {
                    if (e.target.value) handleAddMedicine(e.target.value);
                  }}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500"
                  defaultValue=""
                >
                  <option value="" disabled>-- Select from Store Catalog --</option>
                  {medicines.map((m) => (
                    <option key={m.id} value={m.name}>
                      {m.name} ({m.genericName})
                    </option>
                  ))}
                </select>

                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={customMedInput}
                    onChange={(e) => setCustomMedInput(e.target.value)}
                    placeholder="Or type custom drug name..."
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    onClick={() => handleAddMedicine(customMedInput)}
                    className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Chips List */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <p className="text-xs text-slate-500 font-medium">Medicines in analysis list ({selectedMeds.length}):</p>
                <div className="flex flex-wrap gap-2">
                  {selectedMeds.map((med, idx) => (
                    <span
                      key={idx}
                      className="bg-indigo-50 text-indigo-900 border border-indigo-200 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-2"
                    >
                      {med}
                      <button
                        onClick={() => handleRemoveMedicine(idx)}
                        className="text-indigo-400 hover:text-rose-600 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {interactionError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{interactionError}</span>
                </div>
              )}

              <button
                onClick={handleCheckInteractions}
                disabled={loadingInteraction}
                className={`w-full py-3 rounded-xl font-bold text-sm text-white transition flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                  loadingInteraction
                    ? 'bg-slate-700 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20'
                }`}
              >
                {loadingInteraction ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Analyzing Interactions with Gemini AI...</span>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-5 h-5" />
                    <span>Run Clinical Interaction Check</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Panel: Interaction Analysis Results */}
          <div className="lg:col-span-7">
            {!interactionResult ? (
              <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center text-slate-400 space-y-3">
                <ShieldAlert className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="font-bold text-slate-700 text-base">No Interaction Analysis Generated</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Click "Run Clinical Interaction Check" to evaluate contraindications, severity levels, and counseling safety guidelines.
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
                {/* Risk Level Header */}
                <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-xs font-medium text-slate-500 uppercase">Overall Regimen Risk</span>
                    <h3 className="text-lg font-extrabold text-slate-900 mt-0.5">{interactionResult.summary}</h3>
                  </div>

                  <span
                    className={`px-3.5 py-1.5 rounded-full font-bold text-xs uppercase tracking-wider ${
                      interactionResult.overallRiskLevel === 'Low'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : interactionResult.overallRiskLevel === 'Moderate'
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-rose-100 text-rose-800 border border-rose-300'
                    }`}
                  >
                    {interactionResult.overallRiskLevel} Risk
                  </span>
                </div>

                {/* Specific Pair Interactions */}
                {interactionResult.interactions && interactionResult.interactions.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-bold text-slate-900 text-sm">Identified Drug-Drug Interactions</h4>
                    <div className="space-y-2.5">
                      {interactionResult.interactions.map((item, idx) => (
                        <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 text-sm">{item.drugPair}</span>
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                              {item.severity}
                            </span>
                          </div>
                          <p className="text-slate-700">{item.description}</p>
                          <div className="text-[11px] text-emerald-800 font-medium bg-emerald-50 p-2 rounded border border-emerald-100">
                            <strong>Pharmacist Management:</strong> {item.management}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Food / Alcohol Contraindications */}
                {interactionResult.foodInteractions && interactionResult.foodInteractions.length > 0 && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-1 text-xs">
                    <h4 className="font-bold text-amber-900 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-600" /> Food & Lifestyle Precautions
                    </h4>
                    <ul className="list-disc list-inside text-amber-800 space-y-0.5">
                      {interactionResult.foodInteractions.map((f, i) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Patient Counseling Points */}
                {interactionResult.patientCounselingPoints && interactionResult.patientCounselingPoints.length > 0 && (
                  <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl space-y-1 text-xs">
                    <h4 className="font-bold text-indigo-900 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-indigo-600" /> Key Patient Counseling Advice
                    </h4>
                    <ul className="list-disc list-inside text-indigo-800 space-y-0.5">
                      {interactionResult.patientCounselingPoints.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Generic Substitute Finder View */
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6 max-w-4xl mx-auto">
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-slate-900 font-serif">Search Generic Composition & Substitutes</h3>
            <p className="text-xs text-slate-500">
              Type any expensive brand-name drug to reveal its active chemical formulation and discover bio-equivalent generic brands that save money for patients.
            </p>

            <div className="flex gap-2 pt-2">
              <input
                type="text"
                value={genericQuery}
                onChange={(e) => setGenericQuery(e.target.value)}
                placeholder="e.g. Augmentin 625, Glycomet GP2, Dolo 650, Janumet..."
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 text-slate-800 font-medium"
              />
              <button
                onClick={handleFindGeneric}
                disabled={loadingGeneric}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition cursor-pointer flex items-center gap-2 shadow-md shrink-0"
              >
                {loadingGeneric ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                <span>Find Substitutes</span>
              </button>
            </div>
          </div>

          {genericError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800">
              {genericError}
            </div>
          )}

          {genericResult && (
            <div className="space-y-4 border-t border-slate-200 pt-5">
              {/* Active Formula Card */}
              <div className="bg-slate-900 text-white p-5 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="bg-indigo-500/30 text-indigo-300 text-xs px-2.5 py-0.5 rounded font-bold uppercase">
                    Active Formula
                  </span>
                  <span className="text-xs text-slate-400">{genericResult.therapeuticClass}</span>
                </div>

                <h3 className="text-xl font-bold font-serif text-white">{genericResult.brandName}</h3>
                <p className="text-sm font-semibold text-emerald-400 font-mono">
                  Chemical Composition: {genericResult.activeIngredient}
                </p>

                {genericResult.primaryUses && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {genericResult.primaryUses.map((use: string, i: number) => (
                      <span key={i} className="bg-slate-800 text-slate-300 text-[11px] px-2.5 py-0.5 rounded">
                        {use}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Bio-Equivalent Substitutes */}
              {genericResult.genericSubstitutes && genericResult.genericSubstitutes.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-600" /> Bio-Equivalent Generic Alternatives
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {genericResult.genericSubstitutes.map((sub: any, idx: number) => (
                      <div key={idx} className="p-3.5 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 text-sm">{sub.substituteName}</span>
                          <span className="bg-emerald-200 text-emerald-900 font-bold px-2 py-0.5 rounded text-[10px]">
                            {sub.estimatedSavingsPercent}
                          </span>
                        </div>
                        <p className="text-slate-600">Manufacturer: {sub.manufacturer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
