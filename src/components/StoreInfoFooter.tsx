import React from 'react';
import { Pill, MapPin, Phone, Clock, ShieldCheck, Mail, AlertCircle } from 'lucide-react';

export const StoreInfoFooter: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-12 py-8 px-4 text-xs">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Col 1: Brand Info */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Pill className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base font-serif">PRINCE MEDICAL HALL</h3>
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            Trusted neighborhood pharmacy serving Kolkata for over 35 years. Certified chemist and druggist providing 100% genuine pharmaceuticals, surgicals, and healthcare equipment.
          </p>
        </div>

        {/* Col 2: Licensing & Regulatory */}
        <div className="space-y-1.5">
          <h4 className="font-bold text-white text-xs uppercase tracking-wider">Statutory & Licensing</h4>
          <ul className="space-y-1 text-slate-400">
            <li>Drug License 20B: <strong className="text-slate-200">20B-WB-109482</strong></li>
            <li>Drug License 21B: <strong className="text-slate-200">21B-WB-109483</strong></li>
            <li>GSTIN: <strong className="text-slate-200">19AABCU9603R1ZM</strong></li>
            <li>FSSAI Food Lic: <strong className="text-slate-200">22822010001892</strong></li>
          </ul>
        </div>

        {/* Col 3: Contact & Location */}
        <div className="space-y-1.5">
          <h4 className="font-bold text-white text-xs uppercase tracking-wider">Store Location & Phone</h4>
          <p className="flex items-start gap-1.5 text-slate-400">
            <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>12/A College Street, Opposite Medical College Hospital, Kolkata - 700073, West Bengal</span>
          </p>
          <p className="flex items-center gap-1.5 text-slate-400">
            <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Counter: +91 98300 12345 / 033 2241 8900</span>
          </p>
        </div>

        {/* Col 4: Timings & Emergency */}
        <div className="space-y-1.5">
          <h4 className="font-bold text-white text-xs uppercase tracking-wider">Operating Timings</h4>
          <p className="flex items-center gap-1.5 text-slate-400">
            <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Monday – Sunday: 8:00 AM – 10:30 PM</span>
          </p>
          <div className="bg-emerald-950/60 border border-emerald-800/60 p-2.5 rounded-lg text-emerald-300 text-[11px] mt-2">
            <strong className="block font-bold">24x7 Emergency Medicine Helpline</strong>
            For urgent ICU / Cardiac medicine support, call +91 98300 12345
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-6 mt-6 border-t border-slate-800/80 flex flex-col sm:flex-row justify-between items-center text-[11px] text-slate-500 gap-2">
        <p>© 2026 Prince Medical Hall. All rights reserved.</p>
        <p className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Rx Pharmacist Verified & Safe Medicine Storage
        </p>
      </div>
    </footer>
  );
};
