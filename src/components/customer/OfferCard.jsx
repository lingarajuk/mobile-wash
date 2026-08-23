import React, { useState } from 'react';
import { Tag, Copy, Check, Calendar } from 'lucide-react';
import { Button } from '../common/Button';

export const OfferCard = ({ offer, onApply }) => {
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard?.writeText(offer.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-[#E6ECF5] hover:border-[#BFDBFE] hover:shadow-md transition-all duration-300 relative overflow-hidden flex flex-col justify-between shadow-xs">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-[#F0F6FF] text-[#1264F5] border border-[#BFDBFE]">
            {offer.category}
          </span>
          <h3 className="text-base font-bold text-[#10213F] mt-2">{offer.title}</h3>
        </div>

        <div className="bg-[#DCFCE7] border border-[#BBF7D0] text-[#15803D] font-black px-3 py-1.5 rounded-xl text-sm shrink-0">
          {offer.discount}
        </div>
      </div>

      <p className="text-xs text-[#64748B] mb-4 leading-relaxed">
        {offer.description}
      </p>

      <div className="pt-3 border-t border-[#E6ECF5] flex items-center justify-between gap-3 mt-auto">
        <div className="flex items-center gap-1.5 text-[11px] text-[#64748B]">
          <Calendar className="w-3.5 h-3.5 text-[#94A3B8]" />
          <span>Expires: {offer.validTill}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={copyCode}
            className="flex items-center gap-1 bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E6ECF5] text-[#10213F] text-xs px-2.5 py-1.5 rounded-xl transition-colors font-mono font-bold cursor-pointer"
            title="Copy Code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#16A34A]" /> : <Copy className="w-3.5 h-3.5 text-[#64748B]" />}
            <span>{offer.code}</span>
          </button>

          {onApply && (
            <Button
              onClick={() => onApply(offer.code)}
              variant="primary"
              size="sm"
            >
              Apply
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
