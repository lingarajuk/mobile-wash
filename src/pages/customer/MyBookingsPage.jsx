import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { BookingCard } from '../../components/customer/BookingCard';
import { Modal } from '../../components/common/Modal';
import { LiveTrackingModal } from '../../components/customer/LiveTrackingModal';
import { ReviewModal } from '../../components/customer/ReviewModal';
import { EmptyState } from '../../components/common/EmptyState';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/common/Button';
import { Calendar, Clock, MapPin, Phone, ShieldCheck, CheckCircle2, Navigation } from 'lucide-react';

export const MyBookingsPage = () => {
  const { bookings, updateBookingStatus } = useAuth();
  const [activeTab, setActiveTab] = useState('all'); // all | upcoming | ongoing | completed | cancelled

  const [selectedBookingDetails, setSelectedBookingDetails] = useState(null);
  const [trackingBooking, setTrackingBooking] = useState(null);
  const [ratingBooking, setRatingBooking] = useState(null);

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'all') return true;
    return b.status.toLowerCase() === activeTab.toLowerCase();
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">My Vehicle Wash Bookings</h1>
          <p className="text-xs text-slate-400">Track live wash status and service history</p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-2xl overflow-x-auto scrollbar-none">
          {['all', 'upcoming', 'ongoing', 'completed', 'cancelled'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                activeTab === tab
                  ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings List */}
      {filteredBookings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredBookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onViewDetails={(b) => setSelectedBookingDetails(b)}
              onTrack={(b) => setTrackingBooking(b)}
              onRate={(b) => setRatingBooking(b)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Calendar}
          title={`No ${activeTab !== 'all' ? activeTab : ''} bookings found`}
          description="You haven't placed any vehicle washing bookings in this tab."
        />
      )}

      {/* MODAL 31: BOOKING DETAILS & VISUAL TIMELINE */}
      <Modal
        isOpen={!!selectedBookingDetails}
        onClose={() => setSelectedBookingDetails(null)}
        title={`Booking #${selectedBookingDetails?.id}`}
        subtitle="Complete Doorstep Washing Information"
        maxWidth="max-w-xl"
      >
        {selectedBookingDetails && (
          <div className="space-y-5 text-xs">
            <div className="flex items-center justify-between bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">{selectedBookingDetails.service.name}</h3>
                <span className="text-cyan-400 font-extrabold text-sm">₹{selectedBookingDetails.finalAmount} ({selectedBookingDetails.paymentMethod})</span>
              </div>
              <StatusBadge status={selectedBookingDetails.status} />
            </div>

            {/* 31. VISUAL TIMELINE */}
            <div className="bg-slate-900/70 p-4 rounded-2xl border border-slate-800">
              <h4 className="font-bold text-slate-200 mb-3 uppercase tracking-wider text-[11px]">Service Progress Timeline</h4>
              <div className="space-y-3 relative pl-4 border-l-2 border-slate-800">
                <div className="relative">
                  <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-4 ring-slate-900" />
                  <p className="font-bold text-white">Booking Confirmed</p>
                  <p className="text-slate-400 text-[10px]">{selectedBookingDetails.createdAt}</p>
                </div>
                <div className="relative">
                  <span className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full ring-4 ring-slate-900 ${selectedBookingDetails.progressStep >= 1 ? 'bg-emerald-400' : 'bg-slate-700'}`} />
                  <p className="font-bold text-white">Professional Assigned</p>
                  <p className="text-slate-400 text-[10px]">{selectedBookingDetails.employee?.name || 'Venkatesh Kumar'}</p>
                </div>
                <div className="relative">
                  <span className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full ring-4 ring-slate-900 ${selectedBookingDetails.progressStep >= 2 ? 'bg-cyan-400 animate-pulse' : 'bg-slate-700'}`} />
                  <p className="font-bold text-white">Professional On The Way</p>
                  <p className="text-slate-400 text-[10px]">Mobile foam unit driving to doorstep</p>
                </div>
                <div className="relative">
                  <span className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full ring-4 ring-slate-900 ${selectedBookingDetails.progressStep >= 3 ? 'bg-emerald-400' : 'bg-slate-700'}`} />
                  <p className="font-bold text-white">Service Started</p>
                  <p className="text-slate-400 text-[10px]">High pressure foam wash & interior vacuum</p>
                </div>
                <div className="relative">
                  <span className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full ring-4 ring-slate-900 ${selectedBookingDetails.progressStep >= 4 ? 'bg-emerald-400' : 'bg-slate-700'}`} />
                  <p className="font-bold text-white">Service Completed</p>
                  <p className="text-slate-400 text-[10px]">Customer inspected & rating submitted</p>
                </div>
              </div>
            </div>

            {/* Vehicle & Address info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 font-semibold uppercase block">Vehicle</span>
                <p className="font-bold text-white mt-0.5">{selectedBookingDetails.vehicle.brand} {selectedBookingDetails.vehicle.model}</p>
                <p className="text-[11px] text-cyan-400 font-mono">{selectedBookingDetails.vehicle.regNumber}</p>
              </div>

              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 font-semibold uppercase block">Location</span>
                <p className="font-bold text-white mt-0.5">{selectedBookingDetails.address.area}</p>
                <p className="text-[11px] text-slate-400 truncate">{selectedBookingDetails.address.city}</p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3 pt-2">
              {selectedBookingDetails.status === 'Ongoing' && (
                <Button
                  onClick={() => {
                    const b = selectedBookingDetails;
                    setSelectedBookingDetails(null);
                    setTrackingBooking(b);
                  }}
                  variant="primary"
                  fullWidth
                  icon={Navigation}
                >
                  Track Live Map
                </Button>
              )}
              {selectedBookingDetails.status === 'Upcoming' && (
                <Button
                  onClick={() => {
                    updateBookingStatus(selectedBookingDetails.id, 'Cancelled');
                    setSelectedBookingDetails(null);
                  }}
                  variant="danger"
                  fullWidth
                >
                  Cancel Booking
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Live Tracking Modal */}
      <LiveTrackingModal
        isOpen={!!trackingBooking}
        onClose={() => setTrackingBooking(null)}
        booking={trackingBooking}
      />

      {/* Review Modal */}
      <ReviewModal
        isOpen={!!ratingBooking}
        onClose={() => setRatingBooking(null)}
        booking={ratingBooking}
      />
    </div>
  );
};
