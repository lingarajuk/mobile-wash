import React from 'react';
import { Car, Bike, Zap, CheckCircle2, Trash2, Edit } from 'lucide-react';

export const VehicleCard = ({ vehicle, isSelected, onSelect, onEdit, onDelete }) => {
  const getIcon = (type) => {
    switch (type) {
      case 'bike': return Bike;
      case 'scooter': return Zap;
      default: return Car;
    }
  };

  const Icon = getIcon(vehicle.type || vehicle.vehicle_type);

  return (
    <div
      onClick={onSelect}
      className={`bg-white p-4 rounded-2xl border transition-all duration-200 cursor-pointer relative overflow-hidden flex items-center justify-between shadow-xs ${
        isSelected
          ? 'border-[#1264F5] bg-[#F0F6FF] shadow-sm'
          : 'border-[#E6ECF5] hover:border-[#BFDBFE]'
      }`}
    >
      <div className="flex items-center gap-3.5">
        <div className={`p-2.5 rounded-xl flex items-center justify-center ${
          isSelected ? 'bg-[#1264F5] text-white font-bold' : 'bg-[#F8FAFC] text-[#1264F5] border border-[#E6ECF5]'
        }`}>
          <Icon className="w-5 h-5 stroke-[2]" />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-[#10213F]">{vehicle.brand} {vehicle.model}</h4>
            <span className="text-[10px] uppercase font-mono bg-[#F8FAFC] border border-[#E6ECF5] text-[#1264F5] px-2 py-0.5 rounded-full font-bold">
              {vehicle.regNumber || vehicle.registration_number}
            </span>
          </div>

          <p className="text-xs text-[#64748B] mt-0.5 capitalize">
            {vehicle.color} • {vehicle.type || vehicle.vehicle_type}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {isSelected && (
          <CheckCircle2 className="w-5 h-5 text-[#1264F5]" />
        )}
        
        {onEdit && (
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(vehicle); }}
            className="p-1.5 text-[#64748B] hover:text-[#10213F] rounded-lg hover:bg-[#F8FAFC] cursor-pointer"
          >
            <Edit className="w-4 h-4" />
          </button>
        )}
        {onDelete && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(vehicle.id); }}
            className="p-1.5 text-[#94A3B8] hover:text-[#EF4444] rounded-lg hover:bg-[#FEF2F2] cursor-pointer"
            title="Delete Vehicle"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
