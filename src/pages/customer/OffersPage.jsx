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
    <div className="space-y-6 pb-16 animate-fadeIn max-w-[1400px] mx-auto">
      <div>
        <span className="text-xs uppercase font-bold tracking-wider text-[#1264F5] bg-[#F0F6FF] border border-[#BFDBFE] px-3 py-1 rounded-full">
          Promotions & Savings
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-[#10213F] mt-2">Special Wash Deals & Offers</h1>
        <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
          Apply active promo codes to get discounts on doorstep vehicle washing
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
