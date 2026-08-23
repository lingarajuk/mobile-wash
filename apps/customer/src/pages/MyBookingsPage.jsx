import React, { useState } from 'react';
import { useAuth } from '@shared/context/AuthContext';
import { BookingCard } from '../components/BookingCard';
import { Modal } from '@shared/components/Modal';
import { LiveTrackingModal } from '../components/LiveTrackingModal';
import { ReviewModal } from '../components/ReviewModal';
import { EmptyState } from '@shared/components/EmptyState';
import { StatusBadge } from '@shared/components/StatusBadge';
import { Button } from '@shared/components/Button';
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
    <div className="space-y-6 pb-16 animate-fadeIn max-w-[1400px] mx-auto">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#10213F]">My Vehicle Wash Bookings</h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">Track live wash status and service history</p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 bg-white border border-[#E6ECF5] p-1 rounded-2xl overflow-x-auto scrollbar-none shadow-xs">
          {['all', 'upcoming', 'ongoing', 'completed', 'cancelled'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                activeTab === tab
                  ? 'bg-[#1264F5] text-white shadow-sm'
                  : 'text-[#64748B] hover:text-[#10213F]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings List */}
      {filteredBookings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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

      {/* MODAL: BOOKING DETAILS & VISUAL TIMELINE */}
      <Modal
        isOpen={!!selectedBookingDetails}
        onClose={() => setSelectedBookingDetails(null)}
        title={`Booking #${selectedBookingDetails?.bookingNumber || selectedBookingDetails?.id}`}
        subtitle="Complete Doorstep Washing Information"
        maxWidth="max-w-xl"
      >
        {selectedBookingDetails && (
          <div className="space-y-5 text-xs">
            <div className="flex items-center justify-between bg-[#F8FAFC] p-4 rounded-2xl border border-[#E6ECF5]">
              <div>
                <h3 className="text-base font-bold text-[#10213F]">{selectedBookingDetails.service?.name}</h3>
                <span className="text-[#1264F5] font-black text-sm">₹{selectedBookingDetails.finalAmount} ({selectedBookingDetails.paymentMethod})</span>
              </div>
              <StatusBadge status={selectedBookingDetails.status} />
            </div>

            {/* VISUAL TIMELINE */}
            <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-[#E6ECF5]">
              <h4 className="font-bold text-[#10213F] mb-3 uppercase tracking-wider text-[11px]">Service Progress Timeline</h4>
              <div className="space-y-3 relative pl-4 border-l-2 border-[#E6ECF5]">
                <div className="relative">
                  <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#16A34A] ring-4 ring-white" />
                  <p className="font-bold text-[#10213F]">Booking Confirmed</p>
                  <p className="text-[#64748B] text-[10px]">{selectedBookingDetails.createdAt}</p>
                </div>
                <div className="relative">
                  <span className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full ring-4 ring-white ${selectedBookingDetails.progressStep >= 1 ? 'bg-[#16A34A]' : 'bg-[#CBD5E1]'}`} />
                  <p className="font-bold text-[#10213F]">Technician Assigned</p>
                  <p className="text-[#64748B] text-[10px]">Specialist assigned from Mysuru central hub</p>
                </div>
                <div className="relative">
                  <span className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full ring-4 ring-white ${selectedBookingDetails.progressStep >= 2 ? 'bg-[#16A34A]' : 'bg-[#CBD5E1]'}`} />
                  <p className="font-bold text-[#10213F]">On The Way & Arrival</p>
                  <p className="text-[#64748B] text-[10px]">Mobile pressure unit traveling to doorstep</p>
                </div>
                <div className="relative">
                  <span className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full ring-4 ring-white ${selectedBookingDetails.progressStep >= 3 ? 'bg-[#16A34A]' : 'bg-[#CBD5E1]'}`} />
                  <p className="font-bold text-[#10213F]">Eco Foam Wash in Progress</p>
                  <p className="text-[#64748B] text-[10px]">Pre-inspection, exterior pressure wash & interior detailing</p>
                </div>
                <div className="relative">
                  <span className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full ring-4 ring-white ${selectedBookingDetails.progressStep >= 4 ? 'bg-[#16A34A]' : 'bg-[#CBD5E1]'}`} />
                  <p className="font-bold text-[#10213F]">Completed & Inspected</p>
                  <p className="text-[#64748B] text-[10px]">Job completed with before/after photos verified</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
