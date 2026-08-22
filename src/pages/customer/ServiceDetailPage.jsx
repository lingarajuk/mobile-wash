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
    navigate('/book');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white font-semibold"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Services
      </button>

      {/* Main Details Banner */}
      <div className="glass-card rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
        <div className="relative h-64 sm:h-80 w-full">
          <img src={service.image} alt={service.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
          
          {service.badge && (
            <span className="absolute top-4 left-4 bg-cyan-500 text-slate-950 font-extrabold text-xs uppercase tracking-wider px-3 py-1 rounded-full shadow-lg">
              {service.badge}
            </span>
          )}

          <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <RatingStars rating={service.rating} count={service.reviewsCount} size="sm" className="mb-2" />
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{service.name}</h1>
              <span className="inline-flex items-center gap-1.5 text-xs text-cyan-300 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-lg border border-slate-700/80 mt-2">
                <Clock className="w-3.5 h-3.5 text-cyan-400" /> Duration: {service.duration}
              </span>
            </div>

            <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700 p-4 rounded-2xl shrink-0 text-right sm:text-left">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Service Price</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-white">₹{service.price}</span>
                {service.originalPrice && <span className="text-sm text-slate-500 line-through">₹{service.originalPrice}</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Description & Requirements */}
        <div className="p-6 sm:p-8 space-y-6">
          <div>
            <h3 className="text-base font-bold text-white mb-2">Description</h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{service.description}</p>
          </div>

          {/* Included vs Not Included Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900/70 p-5 rounded-2xl border border-slate-800">
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> What's Included
              </h4>
              <ul className="space-y-2 text-xs text-slate-300">
                {service.included?.map((inc, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{inc}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-900/70 p-5 rounded-2xl border border-slate-800">
              <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <XCircle className="w-4 h-4" /> What's Not Included
              </h4>
              <ul className="space-y-2 text-xs text-slate-400">
                {service.notIncluded?.length > 0 ? (
                  service.notIncluded.map((exc, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-rose-500 rounded-full shrink-0 mt-1.5" />
                      <span>{exc}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-slate-500">None! Everything is included in this combo.</li>
                )}
              </ul>
            </div>
          </div>

          {/* Recommended Vehicles */}
          <div>
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Recommended For</h4>
            <div className="flex flex-wrap gap-2">
              {service.recommendedVehicles?.map((veh, idx) => (
                <span key={idx} className="bg-slate-800 text-cyan-300 border border-slate-700 px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1">
                  <Car className="w-3.5 h-3.5" /> {veh}
                </span>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 block">Total Payable</span>
              <span className="text-xl font-extrabold text-white">₹{service.price}</span>
            </div>

            <Button onClick={handleBook} variant="primary" size="lg" icon={Sparkles} className="shadow-lg shadow-cyan-500/25">
              Book This Service Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
