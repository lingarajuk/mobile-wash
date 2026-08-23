import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@shared/context/AuthContext';
import { useToast } from '@shared/context/ToastContext';
import { serviceService, bookingService } from '@shared/services/api';
import { INITIAL_SERVICES, ADD_ONS, VEHICLE_CATEGORIES, INITIAL_COUPONS } from '@shared/data/mockData';
import { Button } from '@shared/components/Button';
import { Input } from '@shared/components/Input';
import { Select } from '@shared/components/Select';
import { CardSkeleton } from '@shared/components/SkeletonLoader';
import {
  Car,
  Bike,
  Sparkles,
  MapPin,
  Calendar,
  Clock,
  Camera,
  Upload,
  CheckCircle2,
  AlertCircle,
  Tag,
  CreditCard,
  X,
  Compass,
  Navigation,
  ShieldCheck,
  Building,
  Check,
  ArrowRight,
  Info,
  Layers,
  Wand2,
  Trash2
} from 'lucide-react';

export const BookingFlowPage = () => {
  const { serviceId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, vehicles, addresses, addBooking, bookingDraft, setBookingDraft } = useAuth();
  const { addToast } = useToast();

  // 1. Fetch Service from Database
  const [selectedService, setSelectedService] = useState(null);
  const [loadingService, setLoadingService] = useState(true);
  const [availableAddons, setAvailableAddons] = useState(ADD_ONS);

  // Determine active service ID from URL param, location state, or default
  const activeServiceId = serviceId || location.state?.serviceId || bookingDraft?.service?.id || 'srv-2';

  useEffect(() => {
    let isMounted = true;
    setLoadingService(true);

    // Fetch Service
    serviceService.getServiceById(activeServiceId)
      .then((srv) => {
        if (isMounted && srv) {
          setSelectedService(srv);
        }
      })
      .catch(() => {
        if (isMounted) {
          const fallback = INITIAL_SERVICES.find(s => s.id === activeServiceId) || INITIAL_SERVICES[1];
          setSelectedService(fallback);
        }
      })
      .finally(() => {
        if (isMounted) setLoadingService(false);
      });

    // Fetch Addons from Database
    serviceService.getAddons()
      .then((adds) => {
        if (isMounted && Array.isArray(adds) && adds.length > 0) {
          setAvailableAddons(adds);
        }
      })
      .catch(() => {});

    return () => { isMounted = false; };
  }, [activeServiceId]);

  // 2. Customer Information (Auto-populated if logged in)
  const [customerInfo, setCustomerInfo] = useState({
    fullName: user?.name || user?.full_name || 'Rahul Sharma',
    phone: user?.phone || '+91 98765 43210',
    email: user?.email || 'rahul.sharma@example.com'
  });

  useEffect(() => {
    if (user) {
      setCustomerInfo(prev => ({
        fullName: user.name || user.full_name || prev.fullName,
        phone: user.phone || prev.phone,
        email: user.email || prev.email
      }));
    }
  }, [user]);

  // 3. Vehicle Information
  const [vehicleSelectionMode, setVehicleSelectionMode] = useState('saved'); // saved | new
  const [selectedSavedVehicleId, setSelectedSavedVehicleId] = useState(null);
  const [vehicleData, setVehicleData] = useState({
    type: 'sedan',
    brand: 'Honda',
    model: 'City ZX',
    regNumber: 'KA-09-MA-7821',
    color: 'Platinum White'
  });

  // Auto-select first vehicle if available
  useEffect(() => {
    if (vehicles && vehicles.length > 0 && !selectedSavedVehicleId) {
      const def = vehicles.find(v => v.isDefault) || vehicles[0];
      setSelectedSavedVehicleId(def.id);
      setVehicleData({
        type: def.type || def.vehicle_type || 'sedan',
        brand: def.brand || 'Honda',
        model: def.model || 'City',
        regNumber: def.regNumber || def.registration_number || 'KA-09-MA-7821',
        color: def.color || 'White'
      });
    }
  }, [vehicles]);

  const handleSelectSavedVehicle = (vId) => {
    setSelectedSavedVehicleId(vId);
    const found = vehicles.find(v => v.id === vId);
    if (found) {
      setVehicleData({
        type: found.type || found.vehicle_type || 'sedan',
        brand: found.brand,
        model: found.model,
        regNumber: found.regNumber || found.registration_number,
        color: found.color || 'White'
      });
    }
  };

  // 4. Vehicle Condition & Problem Notes
  const [vehicleCondition, setVehicleCondition] = useState('Normal Dirt');
  const [conditionNotes, setConditionNotes] = useState('');

  // 5. Vehicle Photos (5 slots)
  const [photos, setPhotos] = useState({
    front: null,
    back: null,
    left: null,
    right: null,
    additional: null
  });

  // 6. Doorstep Service Location
  const [addressData, setAddressData] = useState({
    house: 'No. 42, 3rd Floor',
    street: 'Gokulam 2nd Stage',
    area: 'Gokulam',
    landmark: 'Near Water Tank',
    city: 'Mysuru',
    state: 'Karnataka',
    pincode: '570002',
    latitude: 12.3118,
    longitude: 76.6529
  });

  useEffect(() => {
    if (addresses && addresses.length > 0) {
      const def = addresses.find(a => a.isDefault) || addresses[0];
      setAddressData({
        house: def.house || 'No. 42',
        street: def.street || '',
        area: def.area || 'Mysuru',
        landmark: def.landmark || '',
        city: def.city || 'Mysuru',
        state: def.state || 'Karnataka',
        pincode: def.pincode || '570002',
        latitude: def.latitude || 12.3118,
        longitude: def.longitude || 76.6529
      });
    }
  }, [addresses]);

  const [isLocating, setIsLocating] = useState(false);
  const [locationConfirmed, setLocationConfirmed] = useState(true);

  // 7. Schedule Date & Time Slot
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('10:00 AM - 11:00 AM');

  const timeSlots = [
    { time: '08:00 AM - 09:00 AM', available: true },
    { time: '09:00 AM - 10:00 AM', available: true },
    { time: '10:00 AM - 11:00 AM', available: true },
    { time: '11:00 AM - 12:00 PM', available: false },
    { time: '01:00 PM - 02:00 PM', available: true },
    { time: '02:00 PM - 03:00 PM', available: true },
    { time: '03:00 PM - 04:00 PM', available: true },
    { time: '04:00 PM - 05:00 PM', available: true },
    { time: '05:00 PM - 06:00 PM', available: true }
  ];

  // 8. Add-On Services
  const [selectedAddonIds, setSelectedAddonIds] = useState([]);

  // 9. Special Customer Instructions
  const [specialInstructions, setSpecialInstructions] = useState('');

  // 10. Coupons & Payment Method
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('UPI (Google Pay)');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Photo handlers
  const handlePhotoSelect = (slotName, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      addToast('Please upload a valid image file (JPEG, PNG, WEBP)', 'warning');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      addToast('File size must be under 10MB', 'warning');
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setPhotos(prev => ({
      ...prev,
      [slotName]: { file, preview: previewUrl, url: null }
    }));

    addToast(`${slotName.toUpperCase()} photo selected`, 'info');
  };

  const removePhotoSlot = (slotName) => {
    setPhotos(prev => ({
      ...prev,
      [slotName]: null
    }));
  };

  // GPS Geolocation Handler
  const handleGetLiveLocation = () => {
    if (!navigator.geolocation) {
      addToast('Geolocation is not supported by your browser', 'error');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setAddressData(prev => ({
          ...prev,
          latitude: parseFloat(latitude.toFixed(6)),
          longitude: parseFloat(longitude.toFixed(6))
        }));
        setIsLocating(false);
        setLocationConfirmed(true);
        addToast(`GPS Coordinates detected: ${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° E`, 'success');
      },
      (err) => {
        setIsLocating(false);
        console.warn('Geolocation error:', err);
        addToast('Could not fetch GPS automatically. Please enter address manually.', 'warning');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Toggle Addon
  const toggleAddon = (addonId) => {
    setSelectedAddonIds(prev =>
      prev.includes(addonId) ? prev.filter(id => id !== addonId) : [...prev, addonId]
    );
  };

  // Pricing Calculations
  const basePrice = selectedService ? Number(selectedService.price) : 499;

  const addonsTotal = useMemo(() => {
    return selectedAddonIds.reduce((sum, id) => {
      const found = availableAddons.find(a => a.id === id);
      return sum + (found ? Number(found.price) : 0);
    }, 0);
  }, [selectedAddonIds, availableAddons]);

  const discountAmount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.type === 'fixed') {
      return Number(appliedCoupon.discount || appliedCoupon.value || 50);
    }
    if (appliedCoupon.type === 'percent' || appliedCoupon.type === 'percentage') {
      const pct = Number(appliedCoupon.discount || appliedCoupon.value || 10);
      return Math.round((basePrice + addonsTotal) * (pct / 100));
    }
    return 50;
  }, [appliedCoupon, basePrice, addonsTotal]);

  const taxAmount = useMemo(() => {
    const taxable = Math.max(0, basePrice + addonsTotal - discountAmount);
    return Math.round(taxable * 0.05); // 5% GST on consumables
  }, [basePrice, addonsTotal, discountAmount]);

  const finalAmount = useMemo(() => {
    return Math.max(0, basePrice + addonsTotal - discountAmount + taxAmount);
  }, [basePrice, addonsTotal, discountAmount, taxAmount]);

  // Handle Apply Coupon
  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (!couponCode.trim()) {
      addToast('Please enter a coupon code', 'warning');
      return;
    }
    const clean = couponCode.trim().toUpperCase();
    const found = INITIAL_COUPONS.find(c => c.code.toUpperCase() === clean);
    if (found) {
      setAppliedCoupon(found);
      addToast(`Coupon "${clean}" applied successfully!`, 'success');
    } else {
      addToast(`Invalid coupon "${clean}". Try "FIRSTWASH" or "SUPER50".`, 'error');
    }
  };

  // AI Vehicle Smart Suggestions
  const smartSuggestions = useMemo(() => {
    const list = [];
    const vType = vehicleData.type.toLowerCase();
    const vCond = vehicleCondition.toLowerCase();

    if (vCond.includes('mud') || vCond.includes('heavy')) {
      list.push('High-pressure underbody mud blast recommended to prevent suspension rust.');
    }
    if (vType === 'suv' || vType === 'sedan') {
      list.push('Ceramic Gloss Coating add-on will protect your vehicle clearcoat from road grime for up to 30 days.');
    }
    if (vType === 'bike') {
      list.push('Chain degreasing and chain lube is included with the bike care wash package.');
    }
    list.push('Our specialist carries pure demineralized water for spotless drying.');
    return list;
  }, [vehicleData.type, vehicleCondition]);

  // SUBMIT BOOKING
  const handleConfirmBooking = async (e) => {
    e.preventDefault();

    if (!selectedService) {
      addToast('Please select a wash service package', 'error');
      return;
    }
    if (!vehicleData.regNumber || !vehicleData.brand) {
      addToast('Please provide your vehicle make and registration number', 'error');
      return;
    }
    if (!addressData.house || !addressData.area) {
      addToast('Please provide your complete doorstep address', 'error');
      return;
    }
    if (!selectedDate || !selectedTimeSlot) {
      addToast('Please select a service date and time slot', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const uploadedPhotoList = [];
      const photoSlots = [
        { slot: 'front', type: 'FRONT' },
        { slot: 'back', type: 'BACK' },
        { slot: 'left', type: 'LEFT' },
        { slot: 'right', type: 'RIGHT' },
        { slot: 'additional', type: 'ADDITIONAL' }
      ];

      for (const item of photoSlots) {
        const pObj = photos[item.slot];
        if (pObj && pObj.file) {
          try {
            const upRes = await bookingService.uploadPhoto(pObj.file, item.type);
            if (upRes && upRes.fileUrl) {
              uploadedPhotoList.push({
                photoType: item.type,
                fileUrl: upRes.fileUrl
              });
            }
          } catch (upErr) {
            console.warn(`Photo upload failed for ${item.type}:`, upErr);
            uploadedPhotoList.push({
              photoType: item.type,
              fileUrl: pObj.preview
            });
          }
        }
      }

      const bookingPayload = {
        serviceId: selectedService.id,
        date: selectedDate,
        timeSlot: selectedTimeSlot,

        customerName: customerInfo.fullName,
        customerPhone: customerInfo.phone,
        customerEmail: customerInfo.email,

        vehicleType: vehicleData.type,
        vehicleBrand: vehicleData.brand,
        vehicleModel: vehicleData.model,
        vehicleRegNumber: vehicleData.regNumber,
        vehicleColor: vehicleData.color,

        vehicleCondition: vehicleCondition,
        conditionNotes: conditionNotes,
        specialInstructions: specialInstructions,

        photos: uploadedPhotoList,

        fullAddress: `${addressData.house}, ${addressData.street}`,
        landmark: addressData.landmark,
        city: addressData.city,
        state: addressData.state,
        pincode: addressData.pincode,
        latitude: addressData.latitude,
        longitude: addressData.longitude,

        addonIds: selectedAddonIds,
        couponCode: appliedCoupon ? appliedCoupon.code : null,
        paymentMethod: paymentMethod
      };

      const created = await addBooking(bookingPayload);
      addToast(`Booking #${created.bookingNumber || created.id} confirmed and saved to database!`, 'success');
      navigate(`/booking/success/${created.id || created.bookingNumber}`);
    } catch (err) {
      console.error('Booking creation error:', err);
      addToast(`Booking failed: ${err.message || 'Server error. Please try again.'}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingService) {
    return (
      <div className="max-w-4xl mx-auto py-8 space-y-6">
        <CardSkeleton />
      </div>
    );
  }

  const srv = selectedService || INITIAL_SERVICES[1];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24 animate-fadeIn">
      {/* 1. SELECTED SERVICE HERO BANNER */}
      <div className="bg-white rounded-3xl overflow-hidden border border-[#E6ECF5] shadow-xs relative">
        <div className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-gradient-to-r from-white via-[#F8FAFC] to-[#F0F6FF]">
          <img
            src={srv.image || srv.image_url}
            alt={srv.name}
            className="w-full sm:w-48 h-36 rounded-2xl object-cover border border-[#E6ECF5] shadow-sm shrink-0"
          />

          <div className="flex-1 space-y-2 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="bg-[#F0F6FF] text-[#1264F5] border border-[#BFDBFE] text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full">
                Selected Package
              </span>
              {srv.badge && (
                <span className="bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A] text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full">
                  {srv.badge}
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-[#10213F]">{srv.name}</h1>
            <p className="text-xs text-[#64748B] line-clamp-2 leading-relaxed">{srv.description}</p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-1 text-xs text-[#64748B]">
              <span className="flex items-center gap-1.5 text-[#10213F] font-bold bg-white px-2.5 py-1 rounded-lg border border-[#E6ECF5]">
                <Clock className="w-3.5 h-3.5 text-[#1264F5]" /> {srv.duration || `${srv.duration_minutes || 30} mins`}
              </span>
              <span className="flex items-center gap-1 text-[#10213F] font-extrabold text-sm">
                Base: <strong className="text-[#1264F5] text-lg">₹{srv.price}</strong>
                {(srv.originalPrice || srv.original_price) && (
                  <span className="text-xs text-[#94A3B8] line-through ml-1">₹{srv.originalPrice || srv.original_price}</span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Included Features Strip */}
        {(srv.included || srv.included_json) && (
          <div className="bg-[#F8FAFC] border-t border-[#E6ECF5] px-6 py-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-[#64748B]">
            <span className="font-bold text-[#10213F] flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A]" /> Includes:
            </span>
            {(srv.included || srv.included_json).slice(0, 4).map((inc, i) => (
              <span key={i} className="flex items-center gap-1">
                • {inc}
              </span>
            ))}
          </div>
        )}
      </div>

      <form onSubmit={handleConfirmBooking} className="space-y-6">
        {/* 2. CUSTOMER INFORMATION */}
        <div className="bg-white p-6 rounded-3xl border border-[#E6ECF5] space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#E6ECF5] pb-3">
            <div>
              <h2 className="text-base font-black text-[#10213F] flex items-center gap-2">
                1. Customer Information
              </h2>
              <p className="text-xs text-[#64748B]">Contact details for doorstep wash confirmation</p>
            </div>
            {user && (
              <span className="text-[11px] bg-[#F0F6FF] text-[#1264F5] border border-[#BFDBFE] px-2.5 py-1 rounded-full font-bold">
                Auto-filled from Account
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Full Name *"
              placeholder="e.g. Rahul Sharma"
              value={customerInfo.fullName}
              onChange={(e) => setCustomerInfo({ ...customerInfo, fullName: e.target.value })}
              required
            />
            <Input
              label="Mobile Number *"
              placeholder="e.g. +91 98765 43210"
              value={customerInfo.phone}
              onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
              required
            />
            <Input
              label="Email Address *"
              type="email"
              placeholder="e.g. rahul@example.com"
              value={customerInfo.email}
              onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
              required
            />
          </div>
        </div>

        {/* 3. VEHICLE INFORMATION */}
        <div className="bg-white p-6 rounded-3xl border border-[#E6ECF5] space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E6ECF5] pb-3">
            <div>
              <h2 className="text-base font-black text-[#10213F] flex items-center gap-2">
                2. Vehicle Information
              </h2>
              <p className="text-xs text-[#64748B]">Specify the vehicle that needs washing</p>
            </div>

            {vehicles.length > 0 && (
              <div className="flex items-center gap-1.5 bg-[#F8FAFC] p-1 rounded-xl border border-[#E6ECF5]">
                <button
                  type="button"
                  onClick={() => {
                    setVehicleSelectionMode('saved');
                    if (vehicles[0]) handleSelectSavedVehicle(vehicles[0].id);
                  }}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    vehicleSelectionMode === 'saved' ? 'bg-[#1264F5] text-white shadow-sm' : 'text-[#64748B] hover:text-[#10213F]'
                  }`}
                >
                  My Saved Vehicles ({vehicles.length})
                </button>
                <button
                  type="button"
                  onClick={() => setVehicleSelectionMode('new')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    vehicleSelectionMode === 'new' ? 'bg-[#1264F5] text-white shadow-sm' : 'text-[#64748B] hover:text-[#10213F]'
                  }`}
                >
                  Enter New
                </button>
              </div>
            )}
          </div>

          {vehicleSelectionMode === 'saved' && vehicles.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-2">
              {vehicles.map((v) => {
                const isSelected = selectedSavedVehicleId === v.id;
                return (
                  <div
                    key={v.id}
                    onClick={() => handleSelectSavedVehicle(v.id)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-[#1264F5] bg-[#F0F6FF] text-[#10213F] shadow-sm'
                        : 'border-[#E6ECF5] bg-[#F8FAFC] text-[#64748B] hover:bg-white hover:border-[#CBD5E1]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${isSelected ? 'bg-[#1264F5] text-white' : 'bg-white border border-[#E6ECF5] text-[#1264F5]'}`}>
                        {v.type === 'bike' || v.vehicle_type === 'bike' ? <Bike className="w-4 h-4" /> : <Car className="w-4 h-4" />}
                      </div>
                      <div>
                        <span className="text-xs font-bold block text-[#10213F]">{v.brand} {v.model}</span>
                        <span className="text-[11px] font-mono text-[#64748B]">{v.regNumber || v.registration_number} • {v.color}</span>
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-[#1264F5] stroke-[3]" />}
                  </div>
                );
              })}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="Vehicle Type *"
              value={vehicleData.type}
              onChange={(e) => setVehicleData({ ...vehicleData, type: e.target.value })}
              options={[
                { value: 'bike', label: 'Bike' },
                { value: 'scooter', label: 'Scooter' },
                { value: 'hatchback', label: 'Hatchback' },
                { value: 'sedan', label: 'Sedan' },
                { value: 'suv', label: 'SUV' },
                { value: 'other', label: 'Other' }
              ]}
            />
            <Input
              label="Vehicle Brand / Make *"
              placeholder="e.g. Honda, Hyundai, Tata, RE"
              value={vehicleData.brand}
              onChange={(e) => setVehicleData({ ...vehicleData, brand: e.target.value })}
              required
            />
            <Input
              label="Vehicle Model *"
              placeholder="e.g. City ZX, Creta, Nexon, Classic 350"
              value={vehicleData.model}
              onChange={(e) => setVehicleData({ ...vehicleData, model: e.target.value })}
              required
            />
            <Input
              label="Vehicle Registration Number *"
              placeholder="e.g. KA-09-MA-7821"
              value={vehicleData.regNumber}
              onChange={(e) => setVehicleData({ ...vehicleData, regNumber: e.target.value.toUpperCase() })}
              required
            />
            <Input
              label="Vehicle Color *"
              placeholder="e.g. Platinum White, Stealth Black"
              value={vehicleData.color}
              onChange={(e) => setVehicleData({ ...vehicleData, color: e.target.value })}
              required
            />
          </div>
        </div>

        {/* 4. VEHICLE CONDITION & PROBLEM NOTES */}
        <div className="bg-white p-6 rounded-3xl border border-[#E6ECF5] space-y-4 shadow-xs">
          <div className="border-b border-[#E6ECF5] pb-3">
            <h2 className="text-base font-black text-[#10213F] flex items-center gap-2">
              3. Vehicle Condition & Problem Notes
            </h2>
            <p className="text-xs text-[#64748B]">Helps our wash specialist bring the right equipment and foam pressure</p>
          </div>

          <div>
            <label className="text-xs font-bold text-[#10213F] block mb-2">Select Current Vehicle Condition *</label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {[
                { id: 'Light Dust', label: 'Light Dust', emoji: '✨' },
                { id: 'Normal Dirt', label: 'Normal Dirt', emoji: '🚗' },
                { id: 'Heavy Dirt', label: 'Heavy Dirt', emoji: '🌧️' },
                { id: 'Muddy', label: 'Muddy', emoji: '🟤' },
                { id: 'Other', label: 'Other', emoji: '⚙️' }
              ].map((cond) => {
                const isSelected = vehicleCondition === cond.id;
                return (
                  <button
                    key={cond.id}
                    type="button"
                    onClick={() => setVehicleCondition(cond.id)}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                      isSelected
                        ? 'border-[#1264F5] bg-[#F0F6FF] text-[#1264F5] font-bold shadow-sm'
                        : 'border-[#E6ECF5] bg-[#F8FAFC] text-[#64748B] hover:border-[#CBD5E1] hover:text-[#10213F]'
                    }`}
                  >
                    <span className="text-lg">{cond.emoji}</span>
                    <span className="text-xs">{cond.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#10213F] block mb-1">
              Additional Vehicle Condition / Problem Notes (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Stains on back seat fabric, tree sap on roof, brake dust on alloy rims..."
              value={conditionNotes}
              onChange={(e) => setConditionNotes(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-[#E6ECF5] text-xs text-[#10213F] rounded-2xl p-3 outline-none focus:border-[#1264F5] focus:bg-white transition-colors placeholder:text-[#94A3B8]"
            />
          </div>
        </div>

        {/* 5. VEHICLE PHOTOS UPLOAD */}
        <div className="bg-white p-6 rounded-3xl border border-[#E6ECF5] space-y-4 shadow-xs">
          <div className="border-b border-[#E6ECF5] pb-3">
            <h2 className="text-base font-black text-[#10213F] flex items-center gap-2">
              <Camera className="w-4 h-4 text-[#1264F5]" /> 4. Upload Vehicle Photos (Optional but Recommended)
            </h2>
            <p className="text-xs text-[#64748B]">Upload photos of your vehicle for accurate pre-inspection (Max 10MB each)</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { slot: 'front', label: 'Front' },
              { slot: 'back', label: 'Back' },
              { slot: 'left', label: 'Left Side' },
              { slot: 'right', label: 'Right Side' },
              { slot: 'additional', label: 'Additional' }
            ].map(({ slot, label }) => {
              const photoObj = photos[slot];
              return (
                <div key={slot} className="space-y-1.5 text-center">
                  <span className="text-[11px] font-bold text-[#10213F] block">{label}</span>
                  
                  {photoObj?.preview ? (
                    <div className="relative w-full h-28 rounded-2xl border border-[#1264F5] overflow-hidden group shadow-sm">
                      <img src={photoObj.preview} alt={label} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-[#10213F]/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => removePhotoSlot(slot)}
                          className="bg-[#EF4444] text-white p-1.5 rounded-full hover:bg-[#DC2626] transition-colors shadow-md cursor-pointer"
                          title="Remove photo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <span className="absolute bottom-1 right-1 bg-[#10213F]/80 text-[#16A34A] text-[9px] font-mono px-1.5 py-0.5 rounded font-bold">
                        Ready
                      </span>
                    </div>
                  ) : (
                    <label className="w-full h-28 rounded-2xl border-2 border-dashed border-[#CBD5E1] bg-[#F8FAFC] hover:bg-white hover:border-[#1264F5] flex flex-col items-center justify-center text-[#64748B] hover:text-[#1264F5] cursor-pointer transition-all">
                      <Camera className="w-6 h-6 mb-1 text-[#94A3B8]" />
                      <span className="text-[10px] font-bold">+ Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handlePhotoSelect(slot, e)}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 6. DOORSTEP LOCATION & GPS MAP */}
        <div className="bg-white p-6 rounded-3xl border border-[#E6ECF5] space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E6ECF5] pb-3">
            <div>
              <h2 className="text-base font-black text-[#10213F] flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#1264F5]" /> 5. Doorstep Service Location
              </h2>
              <p className="text-xs text-[#64748B]">Where should our water-equipped wash specialist arrive?</p>
            </div>

            <Button
              type="button"
              onClick={handleGetLiveLocation}
              variant="primary"
              size="sm"
              icon={Navigation}
              isLoading={isLocating}
              className="shrink-0"
            >
              Share Current Location
            </Button>
          </div>

          {/* Coordinates Bar */}
          <div className="bg-[#F8FAFC] border border-[#E6ECF5] p-3.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#F0F6FF] text-[#1264F5] rounded-xl shrink-0">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-[#10213F] block">GPS Map Pin Selected</span>
                <span className="text-[#64748B] font-mono text-[11px]">
                  Latitude: {addressData.latitude}° N • Longitude: {addressData.longitude}° E
                </span>
              </div>
            </div>

            <a
              href={`https://www.google.com/maps?q=${addressData.latitude},${addressData.longitude}`}
              target="_blank"
              rel="noreferrer"
              className="text-[#1264F5] hover:underline font-bold text-xs flex items-center gap-1 shrink-0"
            >
              Preview on Google Maps <ArrowRight className="w-3 h-3" />
            </a>
          </div>

          {/* Address Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Flat / House / Building Number *"
              placeholder="e.g. No. 42, 3rd Floor"
              value={addressData.house}
              onChange={(e) => setAddressData({ ...addressData, house: e.target.value })}
              required
            />
            <Input
              label="Street / Layout Name"
              placeholder="e.g. Gokulam 2nd Stage"
              value={addressData.street}
              onChange={(e) => setAddressData({ ...addressData, street: e.target.value })}
            />
            <Input
              label="Area / Locality *"
              placeholder="e.g. Vijayanagar, Hebbal"
              value={addressData.area}
              onChange={(e) => setAddressData({ ...addressData, area: e.target.value })}
              required
            />
            <Input
              label="Landmark (Optional)"
              placeholder="e.g. Near Water Tank, Opposite Tech Park"
              value={addressData.landmark}
              onChange={(e) => setAddressData({ ...addressData, landmark: e.target.value })}
            />
            <Input
              label="City"
              value={addressData.city}
              onChange={(e) => setAddressData({ ...addressData, city: e.target.value })}
              required
            />
            <Input
              label="PIN Code"
              value={addressData.pincode}
              onChange={(e) => setAddressData({ ...addressData, pincode: e.target.value })}
              required
            />
          </div>
        </div>

        {/* 7. SCHEDULE DATE & TIME SLOT */}
        <div className="bg-white p-6 rounded-3xl border border-[#E6ECF5] space-y-4 shadow-xs">
          <div className="border-b border-[#E6ECF5] pb-3">
            <h2 className="text-base font-black text-[#10213F] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#1264F5]" /> 6. Select Date & Time Slot
            </h2>
            <p className="text-xs text-[#64748B]">Doorstep technicians available 7 days a week, 7 AM to 8 PM</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-[#10213F] block mb-1.5">Service Date *</label>
              <input
                type="date"
                min={todayStr}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                required
                className="w-full bg-[#F8FAFC] border border-[#E6ECF5] text-xs text-[#10213F] rounded-2xl p-3.5 outline-none focus:border-[#1264F5] font-bold"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-[#10213F] block mb-1.5">Available Time Slots *</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {timeSlots.map((slot, idx) => {
                  const isSelected = selectedTimeSlot === slot.time;
                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={!slot.available}
                      onClick={() => setSelectedTimeSlot(slot.time)}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#1264F5] bg-[#F0F6FF] text-[#1264F5] font-bold shadow-sm'
                          : slot.available
                          ? 'border-[#E6ECF5] bg-[#F8FAFC] text-[#10213F] hover:bg-white hover:border-[#CBD5E1]'
                          : 'border-[#E6ECF5] bg-[#F1F5F9] text-[#94A3B8] cursor-not-allowed opacity-50'
                      }`}
                    >
                      <span className="text-[11px] font-semibold block">{slot.time}</span>
                      <span className={`text-[9px] mt-0.5 block font-mono ${slot.available ? (isSelected ? 'text-[#1264F5]' : 'text-[#16A34A]') : 'text-[#EF4444]'}`}>
                        {slot.available ? 'Available' : 'Booked'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* 8. ADD-ON SERVICES (FROM DATABASE) */}
        <div className="bg-white p-6 rounded-3xl border border-[#E6ECF5] space-y-4 shadow-xs">
          <div className="border-b border-[#E6ECF5] pb-3">
            <h2 className="text-base font-black text-[#10213F] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#1264F5]" /> 7. Add-On Services (Optional Extras)
            </h2>
            <p className="text-xs text-[#64748B]">Enhance your wash package with deep sanitization or wax coating</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {availableAddons.map((addon) => {
              const isSelected = selectedAddonIds.includes(addon.id);
              return (
                <div
                  key={addon.id}
                  onClick={() => toggleAddon(addon.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'border-[#1264F5] bg-[#F0F6FF] shadow-sm'
                      : 'border-[#E6ECF5] bg-[#F8FAFC] hover:bg-white hover:border-[#CBD5E1]'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-[#10213F]">{addon.name}</h4>
                      <span className="text-xs font-black text-[#1264F5]">+₹{addon.price}</span>
                    </div>
                    <p className="text-[11px] text-[#64748B]">{addon.description}</p>
                  </div>

                  <div className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 ml-3 ${
                    isSelected ? 'bg-[#1264F5] border-[#1264F5] text-white' : 'border-[#CBD5E1] bg-white'
                  }`}>
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 9. SPECIAL INSTRUCTIONS */}
        <div className="bg-white p-6 rounded-3xl border border-[#E6ECF5] space-y-3 shadow-xs">
          <h2 className="text-base font-black text-[#10213F]">
            8. Special Instructions
          </h2>
          <textarea
            rows={2}
            placeholder="e.g. Please be careful with the alloy wheels, do not spray water into intake vents..."
            value={specialInstructions}
            onChange={(e) => setSpecialInstructions(e.target.value)}
            className="w-full bg-[#F8FAFC] border border-[#E6ECF5] text-xs text-[#10213F] rounded-2xl p-3 outline-none focus:border-[#1264F5] focus:bg-white transition-colors placeholder:text-[#94A3B8]"
          />
        </div>

        {/* 10. AI / SMART VEHICLE SUGGESTIONS */}
        <div className="bg-gradient-to-br from-[#F0F6FF] to-white p-6 rounded-3xl border border-[#BFDBFE] space-y-3 shadow-xs">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#1264F5] text-white rounded-xl">
              <Wand2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-black text-[#10213F] uppercase tracking-wider">
                Smart Vehicle Suggestions
              </h3>
              <p className="text-[11px] text-[#64748B]">Contextual advice generated for your {vehicleData.brand} ({vehicleCondition})</p>
            </div>
          </div>

          <div className="space-y-1.5 text-xs text-[#10213F]">
            {smartSuggestions.map((sugg, i) => (
              <div key={i} className="flex items-start gap-2 bg-white p-2.5 rounded-xl border border-[#E6ECF5] shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-[#F59E0B] shrink-0 mt-0.5" />
                <span className="text-[11px] font-medium">{sugg}</span>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-[#94A3B8] italic">
            * These are smart recommendations and do not automatically add charges to your booking.
          </p>
        </div>

        {/* 11. PRICE SUMMARY & PAYMENT */}
        <div className="bg-white p-6 rounded-3xl border border-[#E6ECF5] space-y-4 shadow-xs">
          <div className="border-b border-[#E6ECF5] pb-3">
            <h2 className="text-base font-black text-[#10213F] flex items-center gap-2">
              9. Price Summary & Payment Method
            </h2>
            <p className="text-xs text-[#64748B]">Calculated strictly using database rates</p>
          </div>

          {/* Promo Code Input */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter coupon code e.g. FIRSTWASH"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              className="flex-1 bg-[#F8FAFC] border border-[#E6ECF5] text-xs text-[#10213F] uppercase rounded-2xl px-4 py-3 outline-none focus:border-[#1264F5] font-bold"
            />
            <Button type="button" onClick={handleApplyCoupon} variant="primary" size="md">
              Apply
            </Button>
          </div>

          {appliedCoupon && (
            <div className="flex items-center justify-between bg-[#F0FDF4] border border-[#BBF7D0] p-2.5 rounded-xl text-xs text-[#15803D]">
              <span>Coupon <strong>{appliedCoupon.code}</strong> Applied! (₹{discountAmount} OFF)</span>
              <button
                type="button"
                onClick={() => setAppliedCoupon(null)}
                className="text-[10px] text-[#EF4444] font-bold hover:underline cursor-pointer"
              >
                Remove
              </button>
            </div>
          )}

          {/* Itemized Calculation */}
          <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-[#E6ECF5] space-y-2 text-xs">
            <div className="flex justify-between text-[#64748B]">
              <span>{srv.name} (Base Price)</span>
              <span className="font-bold text-[#10213F]">₹{basePrice}</span>
            </div>

            {selectedAddonIds.length > 0 && (
              <div className="flex justify-between text-[#64748B]">
                <span>Add-ons Total ({selectedAddonIds.length} items)</span>
                <span className="font-bold text-[#1264F5]">+₹{addonsTotal}</span>
              </div>
            )}

            {discountAmount > 0 && (
              <div className="flex justify-between text-[#16A34A] font-bold">
                <span>Promo Discount</span>
                <span>-₹{discountAmount}</span>
              </div>
            )}

            <div className="flex justify-between text-[#64748B]">
              <span>Eco Washing Materials & Tax (5%)</span>
              <span>+₹{taxAmount}</span>
            </div>

            <div className="pt-2 border-t border-[#E6ECF5] flex justify-between items-center text-sm font-extrabold text-[#10213F]">
              <span>Final Payable Amount</span>
              <span className="text-xl font-black text-[#1264F5]">₹{finalAmount}</span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="text-xs font-bold text-[#10213F] block mb-2">Select Payment Method</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { id: 'UPI (Google Pay)', label: 'UPI / GPay', icon: '📱' },
                { id: 'Credit / Debit Card', label: 'Card', icon: '💳' },
                { id: 'AquaGo Wallet', label: 'Wallet', icon: '👛' },
                { id: 'Cash After Service', label: 'Cash After Wash', icon: '💵' }
              ].map((pm) => (
                <button
                  key={pm.id}
                  type="button"
                  onClick={() => setPaymentMethod(pm.id)}
                  className={`p-3 rounded-2xl border text-center text-xs transition-all cursor-pointer ${
                    paymentMethod === pm.id
                      ? 'border-[#1264F5] bg-[#F0F6FF] font-bold text-[#1264F5] shadow-xs'
                      : 'border-[#E6ECF5] bg-[#F8FAFC] text-[#64748B] hover:text-[#10213F] hover:bg-white'
                  }`}
                >
                  <span className="text-base block mb-1">{pm.icon}</span>
                  <span>{pm.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 12. CONFIRM BOOKING SUBMISSION BUTTON */}
        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isSubmitting}
            icon={CheckCircle2}
            className="py-4 text-base font-black shadow-lg shadow-[#1264F5]/20 cursor-pointer"
          >
            Confirm Booking (₹{finalAmount})
          </Button>
          <p className="text-center text-[11px] text-[#94A3B8] mt-2">
            By clicking Confirm Booking, your request is submitted for supervisor verification.
          </p>
        </div>
      </form>
    </div>
  );
};
