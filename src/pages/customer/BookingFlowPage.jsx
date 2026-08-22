import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { VehicleCard } from '../../components/customer/VehicleCard';
import { ServiceCard } from '../../components/customer/ServiceCard';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Modal } from '../../components/common/Modal';
import { INITIAL_SERVICES, ADD_ONS, INITIAL_COUPONS, VEHICLE_CATEGORIES } from '../../data/mockData';
import {
  Car,
  Sparkles,
  MapPin,
  Calendar,
  Clock,
  Plus,
  Tag,
  CreditCard,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Navigation,
  ShieldCheck,
  Building,
  Check
} from 'lucide-react';

export const BookingFlowPage = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const {
    vehicles,
    addVehicle,
    addresses,
    addAddress,
    addBooking,
    bookingDraft,
    setBookingDraft
  } = useAuth();

  // Wizard Steps: 1: Vehicle, 2: Service, 3: Location, 4: Schedule, 5: Addons & Coupons, 6: Summary & Payment, 7: Success
  const [currentStep, setCurrentStep] = useState(1);

  // Modal toggles for inline adding
  const [showAddVehModal, setShowAddVehModal] = useState(false);
  const [showAddAddrModal, setShowAddAddrModal] = useState(false);

  // New vehicle form
  const [newVehData, setNewVehData] = useState({
    type: 'sedan',
    brand: '',
    model: '',
    regNumber: '',
    color: ''
  });

  // New address form
  const [newAddrData, setNewAddrData] = useState({
    label: 'Home',
    house: '',
    street: '',
    area: '',
    landmark: '',
    city: 'Mysuru',
    state: 'Karnataka',
    pincode: '570002'
  });

  // Time Slots
  const timeSlots = [
    { time: '08:00 AM – 09:00 AM', available: true },
    { time: '09:00 AM – 10:00 AM', available: true },
    { time: '10:00 AM – 11:00 AM', available: false },
    { time: '02:00 PM – 03:00 PM', available: true },
    { time: '04:00 PM – 05:00 PM', available: true },
    { time: '06:00 PM – 07:00 PM', available: true }
  ];

  // Selection states inside draft
  const selectedVehicle = bookingDraft.vehicle || vehicles[0];
  const selectedService = bookingDraft.service || INITIAL_SERVICES[1];
  const selectedAddress = bookingDraft.address || addresses[0];
  const selectedDate = bookingDraft.date || new Date().toISOString().split('T')[0];
  const selectedTimeSlot = bookingDraft.timeSlot || timeSlots[0].time;
  const selectedAddons = bookingDraft.addons || [];
  const appliedCoupon = bookingDraft.couponCode;
  const paymentMethod = bookingDraft.paymentMethod || 'UPI';

  // Price Calculations
  const basePrice = selectedService?.price || 0;
  const addonsTotal = selectedAddons.reduce((acc, curr) => acc + curr.price, 0);

  let discountAmount = 0;
  if (appliedCoupon === 'FIRSTWASH') discountAmount = 150;
  else if (appliedCoupon === 'SAVE10') discountAmount = Math.min(200, Math.round((basePrice + addonsTotal) * 0.1));
  else if (appliedCoupon === 'WEEKEND20') discountAmount = Math.min(300, Math.round((basePrice + addonsTotal) * 0.2));

  const taxAmount = Math.round((basePrice + addonsTotal - discountAmount) * 0.05); // 5% eco tax
  const finalAmount = Math.max(0, basePrice + addonsTotal - discountAmount + taxAmount);

  const [couponInput, setCouponInput] = useState('');
  const [createdBooking, setCreatedBooking] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const steps = [
    { num: 1, name: 'Vehicle' },
    { num: 2, name: 'Service' },
    { num: 3, name: 'Location' },
    { num: 4, name: 'Schedule' },
    { num: 5, name: 'Add-ons' },
    { num: 6, name: 'Payment' }
  ];

  const handleNextStep = () => {
    if (currentStep === 1 && !selectedVehicle) {
      addToast('Please select a vehicle or add a new vehicle', 'warning');
      return;
    }
    if (currentStep === 2 && !selectedService) {
      addToast('Please select a washing service', 'warning');
      return;
    }
    if (currentStep === 3 && !selectedAddress) {
      addToast('Please select a service address', 'warning');
      return;
    }
    setCurrentStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
  };

  const handleApplyCoupon = (codeToApply) => {
    const code = codeToApply || couponInput.toUpperCase();
    const couponObj = INITIAL_COUPONS.find(c => c.code === code);
    if (!couponObj) {
      addToast('Invalid coupon code. Try FIRSTWASH or SAVE10.', 'error');
      return;
    }
    setBookingDraft(prev => ({ ...prev, couponCode: code }));
    addToast(`Coupon ${code} applied successfully!`, 'success');
  };

  const handleAddonToggle = (addon) => {
    const exists = selectedAddons.some(a => a.id === addon.id);
    let updated;
    if (exists) {
      updated = selectedAddons.filter(a => a.id !== addon.id);
    } else {
      updated = [...selectedAddons, addon];
    }
    setBookingDraft(prev => ({ ...prev, addons: updated }));
  };

  const handleSaveNewVehicle = (e) => {
    e.preventDefault();
    if (!newVehData.brand || !newVehData.model || !newVehData.regNumber) {
      addToast('Please fill all vehicle details', 'warning');
      return;
    }
    const added = addVehicle(newVehData);
    setBookingDraft(prev => ({ ...prev, vehicle: added }));
    setShowAddVehModal(false);
    addToast('Vehicle added successfully!', 'success');
  };

  const handleSaveNewAddress = (e) => {
    e.preventDefault();
    if (!newAddrData.house || !newAddrData.area) {
      addToast('Please fill house number and area', 'warning');
      return;
    }
    const added = addAddress(newAddrData);
    setBookingDraft(prev => ({ ...prev, address: added }));
    setShowAddAddrModal(false);
    addToast('Address added successfully!', 'success');
  };

  const handleConfirmBooking = async () => {
    if (!selectedService || !selectedVehicle || !selectedAddress) {
      addToast('Please complete all selection steps before confirming', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const newB = await addBooking({
        service: selectedService,
        serviceId: selectedService.id,
        vehicle: selectedVehicle,
        vehicleId: selectedVehicle.id,
        address: selectedAddress,
        addressId: selectedAddress.id,
        date: selectedDate,
        timeSlot: selectedTimeSlot,
        addons: selectedAddons,
        couponApplied: appliedCoupon,
        basePrice,
        addonsTotal,
        discountAmount,
        taxAmount,
        finalAmount,
        paymentMethod
      });
      setCreatedBooking(newB);
      setCurrentStep(7); // Success screen
      addToast(`Booking #${newB.bookingNumber || newB.id} Confirmed! Placed in database.`, 'success');
    } catch (err) {
      console.error('Booking submission failed:', err);
      addToast(`Booking failed: ${err.message || 'Server error'}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">
      {/* Step Progress Indicator Header */}
      {currentStep < 7 && (
        <div className="glass-panel p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between overflow-x-auto gap-2 pb-1 scrollbar-none">
            {steps.map((s) => (
              <div key={s.num} className="flex items-center gap-2 shrink-0">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    s.num === currentStep
                      ? 'bg-cyan-500 text-slate-950 ring-4 ring-cyan-500/20 shadow-md'
                      : s.num < currentStep
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {s.num < currentStep ? <Check className="w-4 h-4" /> : s.num}
                </div>
                <span className={`text-xs font-semibold ${s.num === currentStep ? 'text-white' : 'text-slate-400'}`}>
                  {s.name}
                </span>
                {s.num < 6 && <ChevronRight className="w-3.5 h-3.5 text-slate-700" />}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 1: SELECT VEHICLE */}
      {currentStep === 1 && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-white">Select Vehicle</h2>
              <p className="text-xs text-slate-400">Choose vehicle for doorstep wash or add a new one</p>
            </div>

            <Button
              onClick={() => setShowAddVehModal(true)}
              variant="outline"
              size="sm"
              icon={Plus}
            >
              Add Vehicle
            </Button>
          </div>

          <div className="space-y-3">
            {vehicles.map((v) => (
              <VehicleCard
                key={v.id}
                vehicle={v}
                isSelected={selectedVehicle?.id === v.id}
                onSelect={() => setBookingDraft(prev => ({ ...prev, vehicle: v }))}
              />
            ))}
          </div>
        </div>
      )}

      {/* STEP 2: SELECT SERVICE */}
      {currentStep === 2 && (
        <div className="space-y-4 animate-fadeIn">
          <div>
            <h2 className="text-xl font-extrabold text-white">Select Washing Service</h2>
            <p className="text-xs text-slate-400">Choose package suitable for your {selectedVehicle?.brand || 'vehicle'}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {INITIAL_SERVICES.map((srv) => (
              <div
                key={srv.id}
                onClick={() => setBookingDraft(prev => ({ ...prev, service: srv }))}
                className={`cursor-pointer rounded-2xl transition-all ${
                  selectedService?.id === srv.id ? 'ring-2 ring-cyan-500 shadow-xl' : ''
                }`}
              >
                <ServiceCard
                  service={srv}
                  onSelect={() => setBookingDraft(prev => ({ ...prev, service: srv }))}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 3: LOCATION & MAP */}
      {currentStep === 3 && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-white">Select Doorstep Address</h2>
              <p className="text-xs text-slate-400">Where should our washing technician arrive?</p>
            </div>
            <Button onClick={() => setShowAddAddrModal(true)} variant="outline" size="sm" icon={Plus}>
              Add Address
            </Button>
          </div>

          <div className="space-y-3">
            {addresses.map((addr) => {
              const isSelected = selectedAddress?.id === addr.id;
              return (
                <div
                  key={addr.id}
                  onClick={() => setBookingDraft(prev => ({ ...prev, address: addr }))}
                  className={`glass-card p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected ? 'border-cyan-500 bg-cyan-500/10' : 'border-slate-800'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2.5 rounded-xl ${isSelected ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-cyan-400'}`}>
                      <Building className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{addr.label}</span>
                        {addr.isDefault && <span className="text-[10px] bg-slate-800 text-cyan-400 px-2 py-0.5 rounded-full font-mono">Default</span>}
                      </div>
                      <p className="text-xs text-slate-300 mt-1">
                        {addr.house}, {addr.street}, {addr.area}, {addr.city} – {addr.pincode}
                      </p>
                      {addr.landmark && <p className="text-[11px] text-slate-400 mt-0.5">Landmark: {addr.landmark}</p>}
                    </div>
                  </div>

                  {isSelected && <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" />}
                </div>
              );
            })}
          </div>

          {/* MAP PLACEHOLDER */}
          <div className="glass-card p-4 rounded-2xl border border-slate-800 flex items-center justify-between bg-slate-900/60">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl">
                <Navigation className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Live GPS Location Integration Ready</h4>
                <p className="text-[11px] text-slate-400">Map pin location accuracy within 5 meters.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => addToast('Fetched current GPS coordinates (12.3051° N, 76.6551° E)', 'info')}
              className="text-xs font-bold text-cyan-400 hover:underline shrink-0"
            >
              Use Current GPS
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: SCHEDULE DATE & TIME */}
      {currentStep === 4 && (
        <div className="space-y-5 animate-fadeIn">
          <div>
            <h2 className="text-xl font-extrabold text-white">Schedule Wash Date & Time</h2>
            <p className="text-xs text-slate-400">Technicians available 7 days a week, 7 AM to 8 PM</p>
          </div>

          {/* Date Picker */}
          <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-2">
            <label className="text-xs font-bold text-slate-300 block">Select Date</label>
            <input
              type="date"
              value={selectedDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setBookingDraft(prev => ({ ...prev, date: e.target.value }))}
              className="w-full bg-slate-900 border border-slate-700 text-slate-100 text-sm rounded-xl p-3 outline-none focus:border-cyan-500"
            />
          </div>

          {/* Time Slots */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-2.5">Available Time Slots</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {timeSlots.map((slot, idx) => {
                const isSelected = selectedTimeSlot === slot.time;
                return (
                  <button
                    key={idx}
                    disabled={!slot.available}
                    onClick={() => setBookingDraft(prev => ({ ...prev, timeSlot: slot.time }))}
                    className={`p-3 rounded-2xl border text-center transition-all ${
                      isSelected
                        ? 'border-cyan-500 bg-cyan-500/15 text-cyan-300 font-bold shadow-md'
                        : slot.available
                        ? 'border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800'
                        : 'border-slate-800/40 bg-slate-950 text-slate-600 cursor-not-allowed opacity-50'
                    }`}
                  >
                    <span className="text-xs font-semibold block">{slot.time}</span>
                    <span className={`text-[10px] mt-1 block font-mono ${slot.available ? (isSelected ? 'text-cyan-300' : 'text-emerald-400') : 'text-rose-400'}`}>
                      {slot.available ? 'Available' : 'Slot Full'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* STEP 5: ADD-ONS & COUPON */}
      {currentStep === 5 && (
        <div className="space-y-5 animate-fadeIn">
          <div>
            <h2 className="text-xl font-extrabold text-white">Enhance Your Wash (Optional Add-ons)</h2>
            <p className="text-xs text-slate-400">Select extra polish or sanitization services</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ADD_ONS.map((addon) => {
              const isAdded = selectedAddons.some(a => a.id === addon.id);
              return (
                <div
                  key={addon.id}
                  onClick={() => handleAddonToggle(addon)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    isAdded ? 'border-cyan-500 bg-cyan-500/10' : 'border-slate-800 bg-slate-900/60 hover:bg-slate-800'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">{addon.name}</h4>
                      <span className="text-xs font-extrabold text-cyan-400">+₹{addon.price}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">{addon.description}</p>
                  </div>

                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    isAdded ? 'bg-cyan-500 border-cyan-500 text-slate-950' : 'border-slate-700'
                  }`}>
                    {isAdded && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Coupon Section */}
          <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-cyan-400" /> Apply Promo Code / Coupon
            </h4>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter coupon e.g. FIRSTWASH"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-100 uppercase rounded-xl px-3 py-2.5 outline-none focus:border-cyan-500"
              />
              <Button onClick={() => handleApplyCoupon()} variant="primary" size="sm">
                Apply
              </Button>
            </div>

            {appliedCoupon && (
              <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/30 p-2.5 rounded-xl text-xs text-emerald-300">
                <span>Coupon <strong>{appliedCoupon}</strong> Applied! (₹{discountAmount} OFF)</span>
                <button
                  onClick={() => setBookingDraft(prev => ({ ...prev, couponCode: '' }))}
                  className="text-[10px] text-rose-400 font-bold hover:underline"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* STEP 6: SUMMARY & PAYMENT */}
      {currentStep === 6 && (
        <div className="space-y-5 animate-fadeIn">
          <div>
            <h2 className="text-xl font-extrabold text-white">Booking Summary & Payment</h2>
            <p className="text-xs text-slate-400">Review your doorstep wash details before confirming</p>
          </div>

          {/* Summary Details Card */}
          <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <span className="text-slate-400 font-medium">Service</span>
              <span className="font-bold text-white">{selectedService?.name} (₹{basePrice})</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <span className="text-slate-400 font-medium">Vehicle</span>
              <span className="font-bold text-white">{selectedVehicle?.brand} {selectedVehicle?.model} ({selectedVehicle?.regNumber})</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <span className="text-slate-400 font-medium">Address</span>
              <span className="font-bold text-white truncate max-w-xs">{selectedAddress?.area}, {selectedAddress?.city}</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <span className="text-slate-400 font-medium">Schedule</span>
              <span className="font-bold text-cyan-400">{selectedDate} ({selectedTimeSlot})</span>
            </div>

            {selectedAddons.length > 0 && (
              <div className="border-b border-slate-800 pb-2.5">
                <span className="text-slate-400 font-medium block mb-1">Add-ons Selected</span>
                {selectedAddons.map(a => (
                  <div key={a.id} className="flex justify-between text-slate-300">
                    <span>• {a.name}</span>
                    <span>+₹{a.price}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Price Calculations */}
            <div className="pt-2 space-y-1.5">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal</span>
                <span>₹{basePrice + addonsTotal}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400 font-semibold">
                  <span>Coupon Discount</span>
                  <span>-₹{discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-400">
                <span>Eco Tax & Materials (5%)</span>
                <span>+₹{taxAmount}</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-white pt-2 border-t border-slate-700">
                <span>Final Payable Amount</span>
                <span className="text-cyan-400">₹{finalAmount}</span>
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-cyan-400" /> Select Payment Method
            </h4>

            <div className="grid grid-cols-2 gap-2.5">
              {[
                { id: 'UPI', label: 'UPI (Google Pay / PhonePe)', icon: '📱' },
                { id: 'Card', label: 'Credit / Debit Card', icon: '💳' },
                { id: 'Wallet', label: 'AquaGo Wallet', icon: '👛' },
                { id: 'Cash After Service', label: 'Cash After Wash', icon: '💵' },
              ].map((pm) => (
                <button
                  key={pm.id}
                  type="button"
                  onClick={() => setBookingDraft(prev => ({ ...prev, paymentMethod: pm.id }))}
                  className={`p-3 rounded-xl border text-left text-xs transition-all ${
                    paymentMethod === pm.id
                      ? 'border-cyan-500 bg-cyan-500/10 font-bold text-white'
                      : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="mr-1.5">{pm.icon}</span> {pm.label}
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={handleConfirmBooking}
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isSubmitting}
            icon={CheckCircle2}
            className="shadow-xl shadow-cyan-500/25"
          >
            Confirm Booking (₹{finalAmount})
          </Button>
        </div>
      )}

      {/* STEP 7: BOOKING SUCCESS CONFIRMATION */}
      {currentStep === 7 && createdBooking && (
        <div className="glass-card p-8 rounded-3xl border border-cyan-500/40 text-center space-y-6 animate-fadeIn">
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto shadow-xl shadow-emerald-950/40 animate-bounce">
            <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
          </div>

          <div>
            <span className="text-xs uppercase font-mono tracking-widest text-emerald-400 font-bold">Success!</span>
            <h2 className="text-2xl font-extrabold text-white mt-1">Booking Confirmed</h2>
            <p className="text-xs text-slate-400 mt-1">
              Booking ID: <span className="font-mono font-bold text-cyan-400">{createdBooking.id}</span>
            </p>
          </div>

          <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 max-w-md mx-auto text-xs text-left space-y-2">
            <div className="flex justify-between"><span className="text-slate-400">Service:</span> <span className="font-bold text-white">{createdBooking.service.name}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Vehicle:</span> <span className="font-bold text-white">{createdBooking.vehicle.brand} {createdBooking.vehicle.model}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Date & Slot:</span> <span className="font-bold text-cyan-400">{createdBooking.date} ({createdBooking.timeSlot})</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Amount Paid:</span> <span className="font-bold text-white">₹{createdBooking.finalAmount} ({createdBooking.paymentMethod})</span></div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button onClick={() => navigate('/bookings')} variant="primary" size="md" icon={Calendar}>
              View My Bookings
            </Button>
            <Button onClick={() => navigate('/')} variant="secondary" size="md">
              Back to Home
            </Button>
          </div>
        </div>
      )}

      {/* Navigation Buttons for Steps 1-6 */}
      {currentStep < 7 && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <Button
            onClick={handlePrevStep}
            variant="ghost"
            size="md"
            isDisabled={currentStep === 1}
            icon={ChevronLeft}
          >
            Back
          </Button>

          {currentStep < 6 && (
            <Button
              onClick={handleNextStep}
              variant="primary"
              size="md"
              icon={ChevronRight}
            >
              Continue to {steps[currentStep]?.name || 'Next'}
            </Button>
          )}
        </div>
      )}

      {/* MODAL: ADD VEHICLE */}
      <Modal isOpen={showAddVehModal} onClose={() => setShowAddVehModal(false)} title="Add New Vehicle">
        <form onSubmit={handleSaveNewVehicle} className="space-y-3">
          <Select
            label="Vehicle Category"
            value={newVehData.type}
            onChange={(e) => setNewVehData({ ...newVehData, type: e.target.value })}
            options={VEHICLE_CATEGORIES.map(c => ({ value: c.id, label: c.name }))}
          />
          <Input label="Brand / Make" placeholder="e.g. Honda" value={newVehData.brand} onChange={(e) => setNewVehData({ ...newVehData, brand: e.target.value })} required />
          <Input label="Model" placeholder="e.g. City ZX" value={newVehData.model} onChange={(e) => setNewVehData({ ...newVehData, model: e.target.value })} required />
          <Input label="Registration Number" placeholder="e.g. KA-09-MA-7821" value={newVehData.regNumber} onChange={(e) => setNewVehData({ ...newVehData, regNumber: e.target.value })} required />
          <Input label="Color" placeholder="e.g. White" value={newVehData.color} onChange={(e) => setNewVehData({ ...newVehData, color: e.target.value })} />
          
          <div className="pt-2 flex gap-2">
            <Button onClick={() => setShowAddVehModal(false)} variant="secondary" fullWidth type="button">Cancel</Button>
            <Button variant="primary" fullWidth type="submit">Save Vehicle</Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: ADD ADDRESS */}
      <Modal isOpen={showAddAddrModal} onClose={() => setShowAddAddrModal(false)} title="Add Doorstep Address">
        <form onSubmit={handleSaveNewAddress} className="space-y-3">
          <Select
            label="Label"
            value={newAddrData.label}
            onChange={(e) => setNewAddrData({ ...newAddrData, label: e.target.value })}
            options={[{ value: 'Home', label: 'Home' }, { value: 'Office', label: 'Office' }, { value: 'Other', label: 'Other' }]}
          />
          <Input label="House / Flat / Building No." placeholder="e.g. No. 42, 3rd Floor" value={newAddrData.house} onChange={(e) => setNewAddrData({ ...newAddrData, house: e.target.value })} required />
          <Input label="Street / Layout" placeholder="e.g. Gokulam 2nd Stage" value={newAddrData.street} onChange={(e) => setNewAddrData({ ...newAddrData, street: e.target.value })} />
          <Input label="Area" placeholder="e.g. Vijayanagar" value={newAddrData.area} onChange={(e) => setNewAddrData({ ...newAddrData, area: e.target.value })} required />
          <Input label="Landmark" placeholder="e.g. Near Water Tank" value={newAddrData.landmark} onChange={(e) => setNewAddrData({ ...newAddrData, landmark: e.target.value })} />
          <Input label="City" value={newAddrData.city} onChange={(e) => setNewAddrData({ ...newAddrData, city: e.target.value })} />
          <Input label="PIN Code" value={newAddrData.pincode} onChange={(e) => setNewAddrData({ ...newAddrData, pincode: e.target.value })} />
          
          <div className="pt-2 flex gap-2">
            <Button onClick={() => setShowAddAddrModal(false)} variant="secondary" fullWidth type="button">Cancel</Button>
            <Button variant="primary" fullWidth type="submit">Save Address</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
