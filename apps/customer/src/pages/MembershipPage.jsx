import React from 'react';
import { Button } from '@shared/components/Button';
import { useToast } from '@shared/context/ToastContext';
import { Crown, Check, Sparkles, ShieldCheck } from 'lucide-react';

export const MembershipPage = () => {
  const { addToast } = useToast();

  const plans = [
    {
      id: 'plan-1',
      name: 'Standard Monthly Plan',
      price: 999,
      validity: '30 Days',
      washes: '2 Premium Doorstep Washes / Month',
      badge: 'Popular',
      benefits: [
        '2 Full exterior & interior vacuum washes',
        'Priority technician booking slots',
        'Flat 10% discount on all add-on polishes',
        'Free rescheduling up to 1 hr before slot'
      ]
    },
    {
      id: 'plan-2',
      name: 'Premium Detailing Plan',
      price: 1899,
      validity: '30 Days',
      washes: '4 Premium Doorstep Washes / Month',
      badge: 'Best Value',
      benefits: [
        '4 Full interior + exterior detailing washes',
        'Free tyre polish & AC steam sanitization',
        'Zero cancellation fees anytime',
        'Dedicated senior technician assigned'
      ]
    },
    {
      id: 'plan-3',
      name: 'Unlimited Eco-Wash Pass',
      price: 3499,
      validity: '60 Days',
      washes: 'Unlimited Doorstep Waterless Washes',
      badge: 'VIP Care',
      benefits: [
        'Unlimited eco-waterless shiny washes',
        '2 Hard wax Carnauba shine coatings included',
        '24/7 VIP priority support hotline',
        'Covers up to 2 vehicles in your family'
      ]
    }
  ];

  const handleSubscribe = (plan) => {
    addToast(`Successfully subscribed to ${plan.name}! Membership activated.`, 'success');
  };

  return (
    <div className="space-y-8 pb-16 animate-fadeIn max-w-[1400px] mx-auto">
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="inline-flex items-center gap-1 bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
          <Crown className="w-3.5 h-3.5" /> AquaGo Club Membership
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-[#10213F]">Save Up to 40% With Monthly Wash Subscription</h1>
        <p className="text-xs sm:text-sm text-[#64748B]">Keep your vehicle spotless month after month without booking hassle</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E6ECF5] hover:border-[#BFDBFE] hover:shadow-lg flex flex-col justify-between relative overflow-hidden shadow-xs transition-all"
          >
            {plan.badge && (
              <span className="absolute top-4 right-4 text-[10px] uppercase font-bold bg-[#1264F5] text-white px-2.5 py-0.5 rounded-full shadow-xs">
                {plan.badge}
              </span>
            )}

            <div>
              <h3 className="text-lg font-bold text-[#10213F] mb-1">{plan.name}</h3>
              <p className="text-xs text-[#64748B] mb-4">{plan.washes}</p>

              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-3xl font-black text-[#10213F]">₹{plan.price}</span>
                <span className="text-xs text-[#64748B]">/ {plan.validity}</span>
              </div>

              <ul className="space-y-2.5 mb-6 text-xs text-[#64748B]">
                {plan.benefits.map((b, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Button
              onClick={() => handleSubscribe(plan)}
              variant="primary"
              fullWidth
              size="md"
            >
              Subscribe Now
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
