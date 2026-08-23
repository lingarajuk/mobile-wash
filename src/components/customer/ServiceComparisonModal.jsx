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
              <th className="p-3 bg-[#F8FAFC] text-[#64748B] font-bold border-b border-[#E6ECF5] rounded-tl-xl w-1/4">
                Feature
              </th>
              <th className="p-3 bg-[#F8FAFC] text-center border-b border-[#E6ECF5] w-1/4">
                <span className="font-bold text-[#10213F] text-sm block">{basic.name}</span>
                <span className="text-[#1264F5] font-black text-base">₹{basic.price}</span>
                <span className="text-[10px] text-[#64748B] block">{basic.duration}</span>
              </th>
              <th className="p-3 bg-[#F0F6FF] text-center border-b border-[#BFDBFE] border-t-2 border-t-[#1264F5] w-1/4">
                <span className="font-bold text-[#1264F5] text-sm block flex items-center justify-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" /> {premium.name}
                </span>
                <span className="text-[#1264F5] font-black text-base">₹{premium.price}</span>
                <span className="text-[10px] text-[#64748B] block">{premium.duration}</span>
              </th>
              <th className="p-3 bg-[#F8FAFC] text-center border-b border-[#E6ECF5] rounded-tr-xl w-1/4">
                <span className="font-bold text-[#10213F] text-sm block">{combo.name}</span>
                <span className="text-[#1264F5] font-black text-base">₹{combo.price}</span>
                <span className="text-[10px] text-[#64748B] block">{combo.duration}</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E6ECF5]">
            {features.map((feat, idx) => (
              <tr key={idx} className="hover:bg-[#F8FAFC]">
                <td className="p-3 font-semibold text-[#10213F]">{feat.name}</td>
                
                <td className="p-3 text-center">
                  {feat.basic ? (
                    <Check className="w-4 h-4 text-[#16A34A] mx-auto stroke-[3]" />
                  ) : (
                    <X className="w-4 h-4 text-[#94A3B8] mx-auto opacity-40" />
                  )}
                </td>

                <td className="p-3 text-center bg-[#F0F6FF]/50">
                  {feat.premium ? (
                    <Check className="w-4 h-4 text-[#16A34A] mx-auto stroke-[3]" />
                  ) : (
                    <X className="w-4 h-4 text-[#94A3B8] mx-auto opacity-40" />
                  )}
                </td>

                <td className="p-3 text-center">
                  {feat.combo ? (
                    <Check className="w-4 h-4 text-[#16A34A] mx-auto stroke-[3]" />
                  ) : (
                    <X className="w-4 h-4 text-[#94A3B8] mx-auto opacity-40" />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td className="p-3" />
              <td className="p-3 text-center">
                <Button
                  onClick={() => { onClose(); onSelectService && onSelectService(basic.id); }}
                  variant="secondary"
                  size="sm"
                  fullWidth
                >
                  Book Basic
                </Button>
              </td>
              <td className="p-3 text-center bg-[#F0F6FF]/50">
                <Button
                  onClick={() => { onClose(); onSelectService && onSelectService(premium.id); }}
                  variant="primary"
                  size="sm"
                  fullWidth
                >
                  Book Premium
                </Button>
              </td>
              <td className="p-3 text-center">
                <Button
                  onClick={() => { onClose(); onSelectService && onSelectService(combo.id); }}
                  variant="secondary"
                  size="sm"
                  fullWidth
                >
                  Book Combo
                </Button>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </Modal>
  );
};
