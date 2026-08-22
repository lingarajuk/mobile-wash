import React from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Check, X, Sparkles } from 'lucide-react';
import { INITIAL_SERVICES } from '../../data/mockData';

export const ServiceComparisonModal = ({ isOpen, onClose, onSelectService }) => {
  const basic = INITIAL_SERVICES[0]; // Basic Exterior Wash
  const premium = INITIAL_SERVICES[1]; // Premium Wash
  const combo = INITIAL_SERVICES[3]; // Full Combo

  const features = [
    { name: 'Eco High-Pressure Water Rinse', basic: true, premium: true, combo: true },
    { name: 'pH Snow Foam Body Shampoo', basic: true, premium: true, combo: true },
    { name: 'Exterior Microfiber Drying', basic: true, premium: true, combo: true },
    { name: 'Tire & Rim Pressure Cleaning', basic: true, premium: true, combo: true },
    { name: 'Deep Cabin Vacuuming', basic: false, premium: true, combo: true },
    { name: 'Dashboard UV Polish & Shine', basic: false, premium: true, combo: true },
    { name: 'Seat Shampoo & Stain Removal', basic: false, premium: false, combo: true },
    { name: 'AC Vent Steam Sanitization', basic: false, premium: false, combo: true },
    { name: 'Hydrophobic Carnauba Body Wax', basic: false, premium: false, combo: true },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Compare Washing Packages"
      subtitle="Find the perfect doorstep care package for your vehicle"
      maxWidth="max-w-4xl"
    >
      <div className="overflow-x-auto pb-2">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr>
              <th className="p-3 bg-slate-900/90 text-slate-300 font-bold border-b border-slate-800 rounded-tl-xl w-1/4">
                Feature
              </th>
              <th className="p-3 bg-slate-900/90 text-center border-b border-slate-800 w-1/4">
                <span className="font-bold text-white text-sm block">{basic.name}</span>
                <span className="text-cyan-400 font-extrabold text-base">₹{basic.price}</span>
                <span className="text-[10px] text-slate-400 block">{basic.duration}</span>
              </th>
              <th className="p-3 bg-slate-900/90 text-center border-b border-cyan-500/40 border-t-2 border-t-cyan-400 bg-cyan-500/5 w-1/4">
                <span className="font-bold text-cyan-300 text-sm block flex items-center justify-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" /> {premium.name}
                </span>
                <span className="text-cyan-400 font-extrabold text-base">₹{premium.price}</span>
                <span className="text-[10px] text-slate-400 block">{premium.duration}</span>
              </th>
              <th className="p-3 bg-slate-900/90 text-center border-b border-slate-800 rounded-tr-xl w-1/4">
                <span className="font-bold text-white text-sm block">{combo.name}</span>
                <span className="text-cyan-400 font-extrabold text-base">₹{combo.price}</span>
                <span className="text-[10px] text-slate-400 block">{combo.duration}</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {features.map((feat, idx) => (
              <tr key={idx} className="hover:bg-slate-900/40">
                <td className="p-3 font-medium text-slate-300">{feat.name}</td>
                <td className="p-3 text-center">
                  {feat.basic ? (
                    <Check className="w-4 h-4 text-emerald-400 mx-auto" />
                  ) : (
                    <X className="w-4 h-4 text-slate-600 mx-auto" />
                  )}
                </td>
                <td className="p-3 text-center bg-cyan-500/5">
                  {feat.premium ? (
                    <Check className="w-4 h-4 text-emerald-400 mx-auto" />
                  ) : (
                    <X className="w-4 h-4 text-slate-600 mx-auto" />
                  )}
                </td>
                <td className="p-3 text-center">
                  {feat.combo ? (
                    <Check className="w-4 h-4 text-emerald-400 mx-auto" />
                  ) : (
                    <X className="w-4 h-4 text-slate-600 mx-auto" />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td className="p-3"></td>
              <td className="p-3 text-center">
                <Button
                  onClick={() => { onSelectService(basic); onClose(); }}
                  variant="outline"
                  size="sm"
                  fullWidth
                >
                  Select Basic
                </Button>
              </td>
              <td className="p-3 text-center bg-cyan-500/5">
                <Button
                  onClick={() => { onSelectService(premium); onClose(); }}
                  variant="primary"
                  size="sm"
                  fullWidth
                >
                  Select Premium
                </Button>
              </td>
              <td className="p-3 text-center">
                <Button
                  onClick={() => { onSelectService(combo); onClose(); }}
                  variant="secondary"
                  size="sm"
                  fullWidth
                >
                  Select Combo
                </Button>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </Modal>
  );
};
