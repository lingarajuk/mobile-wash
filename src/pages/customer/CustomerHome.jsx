import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ServiceCard } from '../../components/customer/ServiceCard';
import { ServiceComparisonModal } from '../../components/customer/ServiceComparisonModal';
import { VEHICLE_CATEGORIES, INITIAL_SERVICES } from '../../data/mockData';
import { serviceService } from '../../services/api';
import { Button } from '../../components/common/Button';
import {
  MapPin,
  Search,
  Sparkles,
  Calendar,
  ShieldCheck,
  Zap,
  ArrowRight,
  SlidersHorizontal,
  ChevronRight,
  Car,
  Bike,
  Crown,
  Truck,
  Star,
  Clock,
  Tag,
  CheckCircle2,
  Leaf,
  UserCheck,
  Award,
  Layers
} from 'lucide-react';

export const CustomerHome = () => {
  const navigate = useNavigate();
  const { user, selectedAddress, selectedVehicle, setSelectedVehicle, setBookingDraft } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showComparison, setShowComparison] = useState(false);
  const [services, setServices] = useState(INITIAL_SERVICES);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    let isMounted = true;
    serviceService.getServices(selectedCategory, searchQuery)
      .then(data => {
        if (isMounted) {
          setServices(data || []);
          if (searchQuery.trim().length > 0) {
            setSearchResults(data || []);
          } else {
            setSearchResults([]);
          }
        }
      })
      .catch(err => console.warn('Services API fallback active:', err));

    return () => { isMounted = false; };
  }, [selectedCategory, searchQuery]);

  const handleBookService = (service) => {
    setBookingDraft(prev => ({
      ...prev,
      service,
      vehicle: selectedVehicle || prev.vehicle,
      address: selectedAddress || prev.address
    }));
    navigate(`/booking/${service.id}`);
  };

  const categoryIcons = {
    bike: Bike,
    scooter: Zap,
    hatchback: Car,
    sedan: Car,
    suv: Truck,
    luxury: Crown
  };

  const categoryStartingPrices = {
    all: '₹199',
    bike: '₹199',
    scooter: '₹199',
    hatchback: '₹399',
    sedan: '₹499',
    suv: '₹599',
    luxury: '₹899'
  };

  // Dynamic Greeting based on time
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'GOOD MORNING' : hour < 17 ? 'GOOD AFTERNOON' : 'GOOD EVENING';
  const customerName = user?.name ? user.name.split(' ')[0].toUpperCase() : 'RAHUL';

  return (
    <div className="space-y-8 sm:space-y-12 pb-16 animate-fadeIn max-w-[1400px] mx-auto">
      
      {/* 1. HERO SECTION (Requirement 5) */}
      <div className="bg-white rounded-3xl border border-[#E6ECF5] shadow-sm p-6 sm:p-10 lg:p-12 relative overflow-hidden bg-gradient-to-br from-white via-[#F8FAFC] to-[#F0F6FF]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          
          {/* Left Column: Copy & Actions */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-6">
            <span className="inline-flex items-center gap-1.5 text-xs font-black text-[#1264F5] bg-[#F0F6FF] border border-[#BFDBFE] px-3 py-1 rounded-full uppercase tracking-wider">
              {greeting}, {customerName} 👋
            </span>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#10213F] leading-[1.15] tracking-tight">
              Your Vehicle Deserves <span className="text-[#1264F5]">the Best Care</span>
            </h1>

            <p className="text-sm sm:text-base text-[#64748B] leading-relaxed max-w-xl">
              Experience premium car wash at your doorstep. We save your time while we make your vehicle shine.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                onClick={() => handleBookService(services[1] || INITIAL_SERVICES[1])}
                variant="primary"
                size="lg"
                icon={Calendar}
              >
                Book a Wash Now
              </Button>

              <Button
                onClick={() => setShowComparison(true)}
                variant="secondary"
                size="lg"
                icon={SlidersHorizontal}
              >
                Compare Packages
              </Button>
            </div>
          </div>

          {/* Right Column: Hero Image with Natural Blend & Floating Location Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden shadow-md border border-[#E6ECF5] group">
              <img
                src="https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=800&q=80"
                alt="Doorstep Car Detailing"
                className="w-full h-64 sm:h-72 object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#10213F]/40 via-transparent to-transparent"></div>
            </div>

            {/* Floating Location Card */}
            <Link
              to="/saved-addresses"
              className="absolute -bottom-4 right-4 sm:right-6 bg-white/95 backdrop-blur-md p-3 sm:p-3.5 rounded-2xl border border-[#E6ECF5] shadow-lg flex items-center gap-3 hover:border-[#1264F5] transition-all"
            >
              <div className="w-9 h-9 rounded-xl bg-[#F0F6FF] text-[#1264F5] flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-[#64748B] font-semibold block">Service Location</span>
                <span className="text-xs font-bold text-[#10213F] flex items-center gap-1">
                  {selectedAddress ? `${selectedAddress.label} – ${selectedAddress.city}` : 'Home – Mysuru'}
                  <ChevronRight className="w-3 h-3 text-[#1264F5]" />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. SEARCH BAR CARD (Requirement 6) */}
      <div className="bg-white rounded-2xl border border-[#E6ECF5] shadow-sm p-3 relative z-30">
        <div className="flex flex-col sm:flex-row items-center gap-2.5">
          <div className="relative flex-1 w-full">
            <Search className="w-5 h-5 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search washing services e.g. foam wash, interior cleaning, bike wash..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#F8FAFC] text-[#10213F] text-sm rounded-xl border border-[#E6ECF5] h-12 pl-11 pr-4 outline-none focus:border-[#1264F5] focus:bg-white transition-colors placeholder:text-[#94A3B8]"
            />
          </div>

          <button
            onClick={() => setShowComparison(true)}
            className="w-full sm:w-auto h-12 px-5 bg-white hover:bg-[#F8FAFC] border border-[#E6ECF5] hover:border-[#CBD5E1] text-[#10213F] rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shrink-0"
          >
            <SlidersHorizontal className="w-4 h-4 text-[#1264F5]" />
            Filter Services
          </button>
        </div>

        {/* Search Results Autocomplete Dropdown */}
        {searchQuery.trim().length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-[#E6ECF5] rounded-2xl shadow-xl overflow-hidden max-h-96 overflow-y-auto divide-y divide-[#F1F5F9] z-50 animate-fadeIn">
            {searchResults.length > 0 ? (
              searchResults.map((srv) => (
                <div
                  key={srv.id}
                  onClick={() => {
                    setSearchQuery('');
                    navigate(`/service/${srv.id}`);
                  }}
                  className="p-3.5 hover:bg-[#F8FAFC] cursor-pointer transition-colors flex items-center justify-between gap-4 group"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={srv.image}
                      alt={srv.name}
                      className="w-12 h-12 rounded-xl object-cover border border-[#E6ECF5]"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-[#10213F] group-hover:text-[#1264F5] transition-colors">
                        {srv.name}
                      </h4>
                      <p className="text-xs text-[#64748B] line-clamp-1 mt-0.5">
                        {srv.description}
                      </p>
                      <div className="flex items-center gap-3 text-[11px] text-[#64748B] mt-1">
                        <span className="flex items-center gap-1 text-[#F59E0B] font-bold">
                          <Star className="w-3 h-3 fill-[#F59E0B]" /> {srv.rating}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#1264F5]" /> {srv.duration}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-sm font-black text-[#10213F] block">₹{srv.price}</span>
                    <span className="text-[10px] text-[#94A3B8] line-through">₹{srv.originalPrice}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-[#64748B] text-xs">
                No services found for "{searchQuery}".
                <button
                  onClick={() => setSearchQuery('')}
                  className="block mx-auto mt-2 text-[#1264F5] font-bold hover:underline"
                >
                  Browse All Services
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. TRUST / BENEFITS STRIP (Requirement 7) */}
      <div className="bg-white rounded-2xl border border-[#E6ECF5] p-5 shadow-xs">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 divide-y md:divide-y-0 md:divide-x divide-[#E6ECF5]">
          
          <div className="flex items-center gap-3.5 px-2 py-1">
            <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#1264F5] flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-[#10213F]">Doorstep Service</h4>
              <p className="text-[11px] text-[#64748B]">We come to you</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 px-2 py-1 pt-3 md:pt-1">
            <div className="w-10 h-10 rounded-xl bg-[#F0FDF4] text-[#16A34A] flex items-center justify-center shrink-0">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-[#10213F]">Eco Friendly</h4>
              <p className="text-[11px] text-[#64748B]">Safe for your car & nature</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 px-2 py-1 pt-3 md:pt-1">
            <div className="w-10 h-10 rounded-xl bg-[#FFFBEB] text-[#F59E0B] flex items-center justify-center shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-[#10213F]">Trained Experts</h4>
              <p className="text-[11px] text-[#64748B]">Verified & experienced</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 px-2 py-1 pt-3 md:pt-1">
            <div className="w-10 h-10 rounded-xl bg-[#F5F3FF] text-[#7C3AED] flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-[#10213F]">100% Satisfaction</h4>
              <p className="text-[11px] text-[#64748B]">Quality guaranteed</p>
            </div>
          </div>

        </div>
      </div>

      {/* 4. VEHICLE TYPE SECTION (Requirement 8) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#10213F]">Select Your Vehicle Type</h2>
            <p className="text-xs text-[#64748B]">Tailored washing packages for every vehicle</p>
          </div>
          <Link to="/services" className="text-xs font-bold text-[#1264F5] hover:text-[#0F52CC] flex items-center gap-1">
            View all services →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {/* All Vehicles Card */}
          <button
            onClick={() => setSelectedCategory('all')}
            className={`h-[120px] sm:h-[135px] rounded-2xl border text-center transition-all p-3.5 flex flex-col items-center justify-between cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-[#F0F6FF] border-[#1264F5] shadow-sm text-[#1264F5]'
                : 'bg-white border-[#E6ECF5] text-[#64748B] hover:border-[#CBD5E1] hover:text-[#10213F]'
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedCategory === 'all' ? 'bg-[#1264F5] text-white' : 'bg-[#F8FAFC] text-[#64748B]'}`}>
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold block text-[#10213F]">All Vehicles</span>
              <span className="text-[10px] text-[#64748B] font-semibold">Starting ₹199</span>
            </div>
          </button>

          {VEHICLE_CATEGORIES.map((cat) => {
            const Icon = categoryIcons[cat.id] || Car;
            const isSelected = selectedCategory === cat.id;
            const startPrice = categoryStartingPrices[cat.id] || '₹299';

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`h-[120px] sm:h-[135px] rounded-2xl border text-center transition-all p-3.5 flex flex-col items-center justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-[#F0F6FF] border-[#1264F5] shadow-sm text-[#1264F5]'
                    : 'bg-white border-[#E6ECF5] text-[#64748B] hover:border-[#CBD5E1] hover:text-[#10213F]'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isSelected ? 'bg-[#1264F5] text-white' : 'bg-[#F8FAFC] text-[#64748B]'}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold block text-[#10213F]">{cat.name}</span>
                  <span className="text-[10px] text-[#64748B] font-semibold">Starting {startPrice}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. SERVICE CARDS SECTION (Requirement 9) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#10213F]">Popular Wash Packages</h2>
            <p className="text-xs text-[#64748B]">Professional doorstep washing & detailing</p>
          </div>
          <Link to="/services" className="text-xs font-bold text-[#1264F5] hover:text-[#0F52CC] flex items-center gap-1">
            Browse All ({services.length}) →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((srv) => (
            <ServiceCard
              key={srv.id}
              service={srv}
              onSelect={handleBookService}
              onBook={handleBookService}
              onViewDetails={(s) => navigate(`/service/${s.id}`)}
            />
          ))}
        </div>
      </div>

      {/* 6. WHY CHOOSE AQUAGO WASH (Requirement 10) */}
      <div className="bg-white rounded-3xl border border-[#E6ECF5] p-6 sm:p-10 shadow-xs space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-1.5">
          <h2 className="text-2xl sm:text-3xl font-black text-[#10213F]">Why Choose AquaGo Wash?</h2>
          <p className="text-xs sm:text-sm text-[#64748B]">
            India's most trusted on-demand doorstep automotive detailing experience
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          <div className="bg-[#F8FAFC] border border-[#E6ECF5] p-5 rounded-2xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#F0F6FF] text-[#1264F5] flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#10213F]">Doorstep Service</h3>
              <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                We come to your location with our own power, water & mobile setup.
              </p>
            </div>
          </div>

          <div className="bg-[#F8FAFC] border border-[#E6ECF5] p-5 rounded-2xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#F0FDF4] text-[#16A34A] flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#10213F]">Trained Professionals</h3>
              <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                Skilled & background-verified detailing specialists handling your ride.
              </p>
            </div>
          </div>

          <div className="bg-[#F8FAFC] border border-[#E6ECF5] p-5 rounded-2xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFFBEB] text-[#F59E0B] flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#10213F]">Premium Products</h3>
              <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                Best quality pH-neutral shampoos, ceramic gloss & microfiber safe care.
              </p>
            </div>
          </div>

          <div className="bg-[#F8FAFC] border border-[#E6ECF5] p-5 rounded-2xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#F5F3FF] text-[#7C3AED] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#10213F]">Satisfaction Guaranteed</h3>
              <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                100% quality assurance with pre & post wash photo inspections.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* 7. HOW IT WORKS SECTION (Requirement 11) */}
      <div className="bg-gradient-to-br from-[#F8FAFC] via-white to-[#F0F6FF] rounded-3xl border border-[#E6ECF5] p-6 sm:p-10 shadow-xs space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <h2 className="text-2xl sm:text-3xl font-black text-[#10213F]">How It Works?</h2>
          <p className="text-xs sm:text-sm font-semibold text-[#1264F5]">Book in 3 simple steps</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          
          {/* Step 1 */}
          <div className="bg-white p-6 rounded-2xl border border-[#E6ECF5] shadow-xs relative">
            <span className="text-3xl font-black text-[#BFDBFE] block mb-2 font-mono">01</span>
            <h3 className="text-base font-bold text-[#10213F] mb-1">Choose a Service</h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Select from our wide range of bike, car, and SUV foam washes, interior detailing, or paint protection packages.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white p-6 rounded-2xl border border-[#E6ECF5] shadow-xs relative">
            <span className="text-3xl font-black text-[#BFDBFE] block mb-2 font-mono">02</span>
            <h3 className="text-base font-bold text-[#10213F] mb-1">Select Date & Location</h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Pick your convenient date, time slot, and doorstep address. Add vehicle details and any special instructions.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white p-6 rounded-2xl border border-[#E6ECF5] shadow-xs relative">
            <span className="text-3xl font-black text-[#BFDBFE] block mb-2 font-mono">03</span>
            <h3 className="text-base font-bold text-[#10213F] mb-1">Relax While We Wash</h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Track your certified technician live on the map. Review live before & after inspection photos upon completion.
            </p>
          </div>

        </div>
      </div>

      {/* PACKAGE COMPARISON MODAL */}
      {showComparison && (
        <ServiceComparisonModal
          isOpen={showComparison}
          onClose={() => setShowComparison(false)}
          services={services}
          onSelectService={(srv) => {
            setShowComparison(false);
            handleBookService(srv);
          }}
        />
      )}
    </div>
  );
};
