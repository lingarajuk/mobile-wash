import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { bookingService } from '@shared/services/api';
import { useAuth } from '@shared/context/AuthContext';
import { useToast } from '@shared/context/ToastContext';
import { StatusBadge } from '@shared/components/StatusBadge';
import { Button } from '@shared/components/Button';
import { Modal } from '@shared/components/Modal';
import { CardSkeleton } from '@shared/components/SkeletonLoader';
import { ErrorState } from '@shared/components/ErrorState';
import {
  ArrowLeft,
  RefreshCw,
  Calendar,
  Clock,
  MapPin,
  CreditCard,
  CheckCircle2,
  Phone,
  Car,
  Camera,
  Compass,
  Navigation,
  Sparkles,
  ShieldCheck,
  Star,
  Check,
  X,
  Truck,
  User,
  AlertCircle
} from 'lucide-react';

const STATUS_STEPS = [
  { key: 'Pending Verification', label: 'Submitted' },
  { key: 'Verified', label: 'Verified' },
  { key: 'Assigned', label: 'Assigned' },
  { key: 'Accepted', label: 'Accepted' },
  { key: 'On The Way', label: 'On The Way' },
  { key: 'Arrived', label: 'Arrived' },
  { key: 'In Progress', label: 'In Progress' },
  { key: 'Completed', label: 'Completed' }
];

export const CustomerBookingTrackingPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Review Modal
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Lightbox
  const [lightboxImg, setLightboxImg] = useState(null);

  const fetchBookingData = (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    bookingService.getBookingById(bookingId)
      .then((data) => {
        if (data && data.id) {
          setBooking(data);
        } else {
          setError('Booking not found');
        }
      })
      .catch((err) => {
        setError(err.message || 'Failed to load booking details');
      })
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  };

  useEffect(() => {
    fetchBookingData();

    // Auto refresh every 8 seconds when job is active
    const timer = setInterval(() => {
      fetchBookingData(true);
    }, 8000);

    return () => clearInterval(timer);
  }, [bookingId]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      await bookingService.submitReview(bookingId, {
        rating,
        comment: reviewComment,
        serviceQualityRating: rating,
        technicianRating: rating
      });
      addToast('Thank you! Your review has been saved to database.', 'success');
      setShowReviewModal(false);
      fetchBookingData(true);
    } catch (err) {
      addToast(`Review submission failed: ${err.message}`, 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-8 space-y-6">
        <CardSkeleton />
      </div>
    );
  }

  if (error || !booking) {
    return <ErrorState title="Booking Not Found" message={error} onHome={() => navigate('/bookings')} />;
  }

  const b = booking;
  const currentStatusLower = (b.status || '').toLowerCase();
  const currentStepIndex = STATUS_STEPS.findIndex(s => s.key.toLowerCase() === currentStatusLower);

  const beforePhotos = b.beforePhotos || (b.photos || []).filter(p => p.photoType === 'BEFORE');
  const afterPhotos = b.afterPhotos || (b.photos || []).filter(p => p.photoType === 'AFTER');

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24 animate-fadeIn">
      {/* 1. TOP HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E6ECF5] shadow-xs">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/bookings')}
            className="p-2.5 bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E6ECF5] text-[#64748B] hover:text-[#10213F] rounded-2xl transition-colors cursor-pointer"
            title="Back to My Bookings"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase font-bold text-[#1264F5] bg-[#F0F6FF] border border-[#BFDBFE] px-2.5 py-0.5 rounded-full">
                Track Wash Service
              </span>
              <StatusBadge status={b.status} />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#10213F] mt-1">
              Booking #{b.bookingNumber || b.id}
            </h1>
            <p className="text-xs text-[#64748B]">
              {b.service?.name} • {b.date} ({b.timeSlot})
            </p>
          </div>
        </div>

        <button
          onClick={() => fetchBookingData(true)}
          className="bg-white hover:bg-[#F8FAFC] border border-[#E6ECF5] text-[#10213F] px-3.5 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer self-start sm:self-auto shadow-xs"
        >
          <RefreshCw className={`w-4 h-4 text-[#1264F5] ${refreshing ? 'animate-spin' : ''}`} />
          Refresh Status
        </button>
      </div>

      {/* 2. VISUAL BOOKING PROGRESS TIMELINE */}
      <div className="bg-white p-6 rounded-3xl border border-[#E6ECF5] shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#E6ECF5] pb-3">
          <h2 className="text-sm font-black text-[#10213F] uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#1264F5]" /> Wash Service Progress
          </h2>
          <span className="text-xs font-bold text-[#1264F5]">
            Current: {b.status}
          </span>
        </div>

        <div className="overflow-x-auto pb-2">
          <div className="flex items-center min-w-[620px] justify-between relative">
            <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-1 bg-[#E6ECF5] z-0" />
            {STATUS_STEPS.map((step, idx) => {
              const isPassed = currentStepIndex >= idx;
              const isCurrent = currentStepIndex === idx;
              return (
                <div key={step.key} className="relative z-10 flex flex-col items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isCurrent
                        ? 'bg-[#1264F5] text-white ring-4 ring-[#1264F5]/20 scale-110 shadow-sm'
                        : isPassed
                        ? 'bg-[#16A34A] text-white'
                        : 'bg-[#F8FAFC] border border-[#E6ECF5] text-[#94A3B8]'
                    }`}
                  >
                    {isPassed && !isCurrent ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : idx + 1}
                  </div>
                  <span
                    className={`text-[10px] font-bold whitespace-nowrap ${
                      isCurrent ? 'text-[#1264F5]' : isPassed ? 'text-[#10213F]' : 'text-[#94A3B8]'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. LIVE TECHNICIAN TRACKING CARD (IF ON THE WAY / IN PROGRESS) */}
      {(currentStatusLower === 'on the way' || currentStatusLower === 'arrived' || currentStatusLower === 'in progress') && (
        <div className="bg-gradient-to-r from-[#F0F6FF] via-white to-[#F0FDF4] p-6 rounded-3xl border border-[#BFDBFE] shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="inline-flex items-center gap-1.5 text-[10px] uppercase font-mono tracking-widest text-[#1264F5] bg-white px-2.5 py-0.5 rounded-full border border-[#BFDBFE] font-bold mb-1 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-[#1264F5] animate-ping" /> Live Technician Tracking
              </span>
              <h3 className="text-base font-black text-[#10213F]">
                {currentStatusLower === 'on the way'
                  ? 'Your Wash Specialist is on the way!'
                  : currentStatusLower === 'arrived'
                  ? 'Technician has arrived at your doorstep!'
                  : 'Vehicle Wash is currently in progress!'}
              </h3>
            </div>

            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${b.address?.latitude || 12.3118},${b.address?.longitude || 76.6529}`}
              target="_blank"
              rel="noreferrer"
              className="bg-[#1264F5] hover:bg-[#0F52CC] text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-sm self-start sm:self-auto"
            >
              <Navigation className="w-4 h-4" /> Open Live Map
            </a>
          </div>

          {b.employee && (
            <div className="bg-white border border-[#E6ECF5] p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs shadow-xs">
              <div className="flex items-center gap-3">
                <img
                  src={b.employee.photo}
                  alt={b.employee.name}
                  className="w-12 h-12 rounded-xl object-cover border border-[#E6ECF5]"
                />
                <div>
                  <span className="font-extrabold text-[#10213F] text-sm block">{b.employee.name}</span>
                  <span className="text-[11px] text-[#64748B]">Certified Wash Specialist • ⭐ {b.employee.rating}</span>
                </div>
              </div>

              <a
                href={`tel:${b.employee.phone}`}
                className="bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center justify-center gap-1.5 shadow-sm self-stretch sm:self-auto"
              >
                <Phone className="w-3.5 h-3.5" /> Call Technician ({b.employee.phone})
              </a>
            </div>
          )}
        </div>
      )}

      {/* 4. SUMMARY DETAILS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Service & Price */}
        <div className="bg-white p-5 rounded-3xl border border-[#E6ECF5] space-y-3 shadow-xs text-xs">
          <h3 className="font-black text-[#10213F] flex items-center gap-1.5 uppercase text-[11px] tracking-wider">
            <ShieldCheck className="w-4 h-4 text-[#1264F5]" /> Package & Price Details
          </h3>

          <div className="space-y-1.5 bg-[#F8FAFC] p-3.5 rounded-2xl border border-[#E6ECF5]">
            <div className="flex justify-between">
              <span className="text-[#64748B] font-medium">{b.service?.name}</span>
              <span className="text-[#10213F] font-bold">₹{b.basePrice}</span>
            </div>
            {b.addons && b.addons.length > 0 && (
              <div className="pt-1 space-y-1 border-t border-[#E6ECF5]">
                <span className="text-[10px] text-[#64748B] uppercase font-bold">Included Add-ons:</span>
                {b.addons.map((a, i) => (
                  <div key={i} className="flex justify-between text-[11px] text-[#64748B]">
                    <span>+ {a.name}</span>
                    <span className="text-[#1264F5] font-bold">₹{a.price}</span>
                  </div>
                ))}
              </div>
            )}
            {b.discountAmount > 0 && (
              <div className="flex justify-between text-[#16A34A] font-bold">
                <span>Promo Discount ({b.couponApplied})</span>
                <span>-₹{b.discountAmount}</span>
              </div>
            )}
            <div className="pt-2 border-t border-[#E6ECF5] flex justify-between items-center text-sm font-black text-[#10213F]">
              <span>Total Payable</span>
              <span className="text-lg font-black text-[#1264F5]">₹{b.finalAmount}</span>
            </div>
          </div>
        </div>

        {/* Vehicle & Doorstep Address */}
        <div className="bg-white p-5 rounded-3xl border border-[#E6ECF5] space-y-3 shadow-xs text-xs">
          <h3 className="font-black text-[#10213F] flex items-center gap-1.5 uppercase text-[11px] tracking-wider">
            <Car className="w-4 h-4 text-[#1264F5]" /> Vehicle & Location
          </h3>

          <div className="space-y-2 bg-[#F8FAFC] p-3.5 rounded-2xl border border-[#E6ECF5]">
            <div>
              <span className="text-[10px] text-[#64748B] uppercase font-bold block">Vehicle Details</span>
              <p className="font-bold text-[#10213F] mt-0.5">
                {b.vehicle?.brand} {b.vehicle?.model} ({b.vehicle?.color})
              </p>
              <span className="font-mono font-bold text-[#1264F5] text-[11px]">
                {b.vehicle?.regNumber}
              </span>
            </div>

            <div className="pt-2 border-t border-[#E6ECF5]">
              <span className="text-[10px] text-[#64748B] uppercase font-bold block">Doorstep Address</span>
              <p className="text-[#10213F] font-semibold mt-0.5 leading-relaxed">
                {b.address?.house}, {b.address?.street} {b.address?.area}, {b.address?.city}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 5. LIVE WORK UPDATES FROM SPECIALIST */}
      {b.workUpdates && b.workUpdates.length > 0 && (
        <div className="bg-white p-6 rounded-3xl border border-[#E6ECF5] space-y-3 shadow-xs">
          <h3 className="text-sm font-black text-[#10213F] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#16A34A]" /> Live Wash Updates from Specialist
          </h3>

          <div className="space-y-2">
            {b.workUpdates.map((wu) => (
              <div key={wu.id} className="bg-[#F8FAFC] p-3 rounded-2xl border border-[#E6ECF5] flex items-center justify-between gap-3 text-xs">
                <span className="font-semibold text-[#10213F]">{wu.updateText}</span>
                <span className="text-[10px] font-mono text-[#64748B] shrink-0">{wu.createdAt}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. BEFORE & AFTER INSPECTION PHOTOS */}
      {(beforePhotos.length > 0 || afterPhotos.length > 0) && (
        <div className="bg-white p-6 rounded-3xl border border-[#E6ECF5] space-y-4 shadow-xs">
          <h3 className="text-sm font-black text-[#10213F] flex items-center gap-2">
            <Camera className="w-4 h-4 text-[#1264F5]" /> Before & After Wash Verification Photos
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Before */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#F59E0B] block">Before Wash Photos ({beforePhotos.length})</span>
              <div className="grid grid-cols-2 gap-2">
                {beforePhotos.map((p, i) => (
                  <div key={i} onClick={() => setLightboxImg(p.fileUrl)} className="aspect-video rounded-xl overflow-hidden border border-[#E6ECF5] cursor-pointer shadow-xs">
                    <img src={p.fileUrl} alt="Before" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>

            {/* After */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#16A34A] block">After Wash Photos ({afterPhotos.length})</span>
              <div className="grid grid-cols-2 gap-2">
                {afterPhotos.map((p, i) => (
                  <div key={i} onClick={() => setLightboxImg(p.fileUrl)} className="aspect-video rounded-xl overflow-hidden border border-[#E6ECF5] cursor-pointer shadow-xs">
                    <img src={p.fileUrl} alt="After" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. CUSTOMER REVIEW SECTION / RATE BUTTON */}
      {currentStatusLower === 'completed' && (
        <div className="bg-[#F0FDF4] p-6 rounded-3xl border border-[#BBF7D0] space-y-3 shadow-xs">
          {b.review ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#15803D] uppercase tracking-wider">Your Submitted Review</span>
                <div className="flex items-center text-[#F59E0B]">
                  {Array.from({ length: b.review.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#F59E0B]" />
                  ))}
                </div>
              </div>
              <p className="text-xs text-[#166534] italic">"{b.review.comment}"</p>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-black text-[#15803D]">How was your wash experience?</h4>
                <p className="text-xs text-[#166534]">Rate Venkatesh and help us maintain premium 5-star service quality.</p>
              </div>
              <Button onClick={() => setShowReviewModal(true)} variant="success" size="md" icon={Star}>
                Rate Your Wash
              </Button>
            </div>
          )}
        </div>
      )}

      {/* REVIEW MODAL */}
      <Modal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        title="Rate Your Wash Service"
        subtitle="Share your feedback to keep our specialists top-rated"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSubmitReview} className="space-y-4 text-xs">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-[#10213F]">Select Rating</span>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 cursor-pointer focus:outline-none"
                >
                  <Star className={`w-8 h-8 ${star <= rating ? 'text-[#F59E0B] fill-[#F59E0B]' : 'text-[#CBD5E1]'}`} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#10213F] block mb-1">Your Review Comment</label>
            <textarea
              rows={3}
              placeholder="e.g. Excellent doorstep pressure wash, very polite technician, car looks brand new!"
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-[#E6ECF5] text-xs text-[#10213F] rounded-2xl p-3 outline-none focus:border-[#1264F5] placeholder:text-[#94A3B8]"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowReviewModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={submittingReview}>
              Submit Review
            </Button>
          </div>
        </form>
      </Modal>

      {/* LIGHTBOX */}
      {lightboxImg && (
        <div
          onClick={() => setLightboxImg(null)}
          className="fixed inset-0 z-50 bg-[#10213F]/90 flex items-center justify-center p-4 cursor-pointer"
        >
          <img src={lightboxImg} alt="Preview" className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl object-contain" />
        </div>
      )}
    </div>
  );
};
