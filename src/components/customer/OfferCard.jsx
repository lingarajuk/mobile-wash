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
    <div className="glass-card rounded-2xl p-5 border border-slate-800 hover:border-cyan-500/40 transition-all duration-300 relative overflow-hidden flex flex-col justify-between shadow-lg">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            {offer.category}
          </span>
          <h3 className="text-base font-bold text-white mt-2">{offer.title}</h3>
        </div>

        <div className="bg-slate-900 border border-slate-700 text-cyan-300 font-extrabold px-3 py-1.5 rounded-xl text-sm shrink-0">
          {offer.discount}
        </div>
      </div>

      <p className="text-xs text-slate-300 mb-4 leading-relaxed">
        {offer.description}
      </p>

      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3 mt-auto">
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span>Expires: {offer.validTill}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={copyCode}
            className="flex items-center gap-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs px-2.5 py-1.5 rounded-xl transition-colors font-mono"
            title="Copy Code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
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
