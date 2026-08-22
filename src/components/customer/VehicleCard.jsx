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

  const Icon = getIcon(vehicle.type);

  return (
    <div
      onClick={onSelect}
      className={`glass-card p-4 rounded-2xl border transition-all duration-200 cursor-pointer relative overflow-hidden flex items-center justify-between ${
        isSelected
          ? 'border-cyan-500 bg-cyan-500/10 shadow-lg shadow-cyan-950/30'
          : 'border-slate-800 hover:border-slate-700'
      }`}
    >
      <div className="flex items-center gap-3.5">
        <div className={`p-3 rounded-xl flex items-center justify-center ${
          isSelected ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 text-cyan-400'
        }`}>
          <Icon className="w-6 h-6 stroke-[2]" />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-white">{vehicle.brand} {vehicle.model}</h4>
            <span className="text-[10px] uppercase font-mono bg-slate-800 border border-slate-700 text-cyan-300 px-2 py-0.5 rounded-full">
              {vehicle.regNumber}
            </span>
          </div>

          <p className="text-xs text-slate-400 mt-0.5 capitalize">
            {vehicle.color} • {vehicle.type}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {isSelected && (
          <CheckCircle2 className="w-5 h-5 text-cyan-400 fill-cyan-500/20" />
        )}
        
        {onEdit && (
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(vehicle); }}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <Edit className="w-4 h-4" />
          </button>
        )}
        {onDelete && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(vehicle.id); }}
            className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
