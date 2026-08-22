import React from 'react';
import { useNavigate } from 'react-router-dom';
import { OfferCard } from '../../components/customer/OfferCard';
import { INITIAL_OFFERS } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Tag, Sparkles } from 'lucide-react';

export const OffersPage = () => {
  const navigate = useNavigate();
  const { setBookingDraft } = useAuth();
  const { addToast } = useToast();

  const handleApplyOffer = (code) => {
    setBookingDraft(prev => ({ ...prev, couponCode: code }));
    addToast(`Coupon ${code} activated! Proceed to book your wash.`, 'success');
    navigate('/book');
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <span className="text-xs uppercase font-extrabold tracking-wider text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-3 py-1 rounded-full">
          Promotions & Savings
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">Special Wash Deals & Offers</h1>
        <p className="text-xs text-slate-400 mt-1">
          Apply active promo codes to get discounts on doorstep vehicle washing
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {INITIAL_OFFERS.map((offer) => (
          <OfferCard
            key={offer.id}
            offer={offer}
            onApply={handleApplyOffer}
          />
        ))}
      </div>
    </div>
  );
};
