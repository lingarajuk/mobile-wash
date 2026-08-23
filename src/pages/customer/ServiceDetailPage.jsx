import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { serviceService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { RatingStars } from '../../components/common/RatingStars';
import { Button } from '../../components/common/Button';
import { CardSkeleton } from '../../components/common/SkeletonLoader';
import { ErrorState } from '../../components/common/ErrorState';
import { Clock, ShieldCheck, XCircle, ArrowLeft, Car, Sparkles, CheckCircle2 } from 'lucide-react';

export const ServiceDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setBookingDraft, selectedVehicle, selectedAddress } = useAuth();

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    serviceService.getServiceById(id)
      .then(data => { setService(data); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  }, [id]);

  if (loading) return <div className="p-8 max-w-2xl mx-auto"><CardSkeleton /></div>;
  if (error || !service) return <ErrorState title="Service Not Found" onHome={() => navigate('/')} />;

  const handleBook = () => {
    setBookingDraft(prev => ({
      ...prev,
      service,
      vehicle: selectedVehicle || prev.vehicle,
      address: selectedAddress || prev.address
    }));
    navigate(`/booking/${service.id}`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16 animate-fadeIn">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-xs text-[#64748B] hover:text-[#10213F] font-bold cursor-pointer transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Services
      </button>

      {/* Main Details Banner */}
      <div className="bg-white rounded-3xl overflow-hidden border border-[#E6ECF5] shadow-xs">
        <div className="relative h-64 sm:h-80 w-full">
          <img src={service.image} alt={service.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#10213F]/80 via-transparent to-transparent" />
          
          {service.badge && (
            <span className="absolute top-4 left-4 bg-[#1264F5] text-white font-extrabold text-xs uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
              {service.badge}
            </span>
          )}

          <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg border border-[#E6ECF5] inline-block mb-2 shadow-xs">
                <RatingStars rating={service.rating} count={service.reviewsCount} size="sm" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white drop-shadow-sm">{service.name}</h1>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#10213F] bg-white/95 backdrop-blur-md px-3 py-1 rounded-lg border border-[#E6ECF5] mt-2 shadow-xs">
                <Clock className="w-3.5 h-3.5 text-[#1264F5]" /> Duration: {service.duration}
              </span>
            </div>

            <div className="bg-white/95 backdrop-blur-md border border-[#E6ECF5] p-4 rounded-2xl shrink-0 text-right sm:text-left shadow-md">
              <span className="text-[10px] text-[#64748B] uppercase font-bold tracking-wider block">Service Price</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-[#10213F]">₹{service.price}</span>
                {service.originalPrice && <span className="text-sm text-[#94A3B8] line-through">₹{service.originalPrice}</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Description & Requirements */}
        <div className="p-6 sm:p-8 space-y-6">
          <div>
            <h3 className="text-base font-bold text-[#10213F] mb-1.5">Description</h3>
            <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">{service.description}</p>
          </div>

          {/* Included vs Not Included Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#F0FDF4] p-5 rounded-2xl border border-[#BBF7D0]">
              <h4 className="text-xs font-bold text-[#15803D] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> What's Included
              </h4>
              <ul className="space-y-2 text-xs text-[#166534]">
                {service.included?.map((inc, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
                    <span className="font-medium">{inc}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-[#FEF2F2] p-5 rounded-2xl border border-[#FECACA]">
              <h4 className="text-xs font-bold text-[#B91C1C] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <XCircle className="w-4 h-4" /> What's Not Included
              </h4>
              <ul className="space-y-2 text-xs text-[#991B1B]">
                {service.notIncluded?.length > 0 ? (
                  service.notIncluded.map((exc, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-[#EF4444] rounded-full shrink-0 mt-1.5" />
                      <span className="font-medium">{exc}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-[#991B1B]">None! Everything is included in this combo.</li>
                )}
              </ul>
            </div>
          </div>

          {/* Recommended Vehicles */}
          <div>
            <h4 className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">Recommended For</h4>
            <div className="flex flex-wrap gap-2">
              {service.recommendedVehicles?.map((veh, idx) => (
                <span key={idx} className="bg-[#F0F6FF] text-[#1264F5] border border-[#BFDBFE] px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1">
                  <Car className="w-3.5 h-3.5" /> {veh}
                </span>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="pt-4 border-t border-[#E6ECF5] flex items-center justify-between">
            <div>
              <span className="text-xs text-[#64748B] block font-medium">Total Payable</span>
              <span className="text-2xl font-black text-[#10213F]">₹{service.price}</span>
            </div>

            <Button onClick={handleBook} variant="primary" size="lg" icon={Sparkles}>
              Book This Service Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
