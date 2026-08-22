import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ServiceCard } from '../../components/customer/ServiceCard';
import { ServiceComparisonModal } from '../../components/customer/ServiceComparisonModal';
import { VEHICLE_CATEGORIES, INITIAL_SERVICES } from '../../data/mockData';
import { serviceService } from '../../services/api';
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
  Tag
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
    navigate('/book');
  };

  const categoryIcons = {
    bike: Bike,
    scooter: Zap,
    hatchback: Car,
    sedan: Car,
    suv: Truck,
    luxury: Crown
  };

  return (
    <div className="space-y-6 pb-12">
      {/* HOME HEADER: Greeting & Location Selector */}
      <div className="glass-panel p-4 sm:p-6 rounded-3xl border border-slate-800 shadow-xl bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                Good Morning, {user?.name?.split(' ')[0] || 'Rahul'} 👋
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white mt-0.5">
              Your vehicle deserves the best care
            </h1>
          </div>

          {/* Location Selector Card */}
          <Link
            to="/saved-addresses"
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 p-2.5 rounded-2xl transition-colors shrink-0 text-left"
          >
            <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-xl">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="hidden sm:block">
              <span className="text-[10px] text-slate-400 block font-semibold">Service Location</span>
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1">
                {selectedAddress ? `${selectedAddress.label} – ${selectedAddress.city}` : 'Select Location'}
                <ChevronRight className="w-3 h-3 text-slate-400" />
              </span>
            </div>
          </Link>
        </div>

        {/* SEARCH BAR WITH INTELLIGENT SUGGESTIONS */}
        <div className="mt-5 relative z-30">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            placeholder="Search washing services e.g. foam wash, interior cleaning, bike wash..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950/90 text-slate-100 text-sm rounded-2xl border border-slate-800 py-3.5 pl-12 pr-4 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 placeholder:text-slate-500 shadow-inner"
          />

          {/* Search Suggestions Dropdown */}
          {searchQuery.trim().length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden max-h-96 overflow-y-auto divide-y divide-slate-800 z-50">
              {searchResults.length > 0 ? (
                searchResults.map((srv) => (
                  <div
                    key={srv.id}
                    onClick={() => {
                      setSearchQuery('');
                      navigate(`/service/${srv.id}`);
                    }}
                    className="p-3.5 hover:bg-slate-800/80 cursor-pointer transition-colors flex items-center justify-between gap-4 group"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={srv.image}
                        alt={srv.name}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-700 group-hover:scale-105 transition-transform"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-100 group-hover:text-cyan-400 transition-colors">
                            {srv.name}
                          </h4>
                          {srv.badge && (
                            <span className="text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-1.5 py-0.5 rounded-full font-semibold">
                              {srv.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                          {srv.description}
                        </p>
                        <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                          <span className="flex items-center gap-1 text-amber-400 font-semibold">
                            <Star className="w-3 h-3 fill-amber-400" /> {srv.rating}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-cyan-400" /> {srv.duration}
                          </span>
                          <span className="capitalize text-slate-300 font-medium">
                            🚗 {srv.category}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-sm font-extrabold text-cyan-400 block">₹{srv.price}</span>
                      <span className="text-[10px] text-slate-400 line-through">₹{srv.originalPrice}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-slate-400 text-xs">
                  No services found for "{searchQuery}".
                  <button
                    onClick={() => setSearchQuery('')}
                    className="block mx-auto mt-2 text-cyan-400 font-bold hover:underline"
                  >
                    Browse All Services
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* HERO SECTION */}
      <div className="relative rounded-3xl overflow-hidden p-6 sm:p-8 bg-gradient-to-r from-cyan-900/40 via-slate-900 to-blue-950/40 border border-cyan-500/30 shadow-2xl">
        <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20 pointer-events-none bg-cover bg-right" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=600&q=80')" }} />
        
        <div className="relative z-10 max-w-lg">
          <span className="inline-flex items-center gap-1.5 bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-extrabold text-[11px] uppercase tracking-wider px-3 py-1 rounded-full mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Doorstep Eco Wash Technology
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
            Premium Car Wash at Your Doorstep
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 mb-6 leading-relaxed">
            Book today and get sparkling-clean, scratch-free results without leaving home. Equipped with silent pressure washers.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => handleBookService(services[1] || INITIAL_SERVICES[1])}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold px-6 py-3 rounded-2xl shadow-lg shadow-cyan-950/50 flex items-center gap-2 text-sm transition-all transform hover:scale-105"
            >
              <Calendar className="w-4 h-4" /> Book a Wash Now
            </button>

            <button
              onClick={() => setShowComparison(true)}
              className="bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold px-4 py-3 rounded-2xl text-xs flex items-center gap-1.5 transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4 text-cyan-400" /> Compare Packages
            </button>
          </div>
        </div>
      </div>

      {/* VEHICLE TYPES CATEGORIES */}
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="text-base font-extrabold text-white flex items-center gap-2">
            Select Your Vehicle Type
          </h3>
          <span className="text-xs text-slate-400">Filter services</span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
              selectedCategory === 'all'
                ? 'bg-cyan-500/20 border-cyan-500 text-white shadow-lg shadow-cyan-500/10'
                : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
            }`}
          >
            <div className={`p-2 rounded-xl ${selectedCategory === 'all' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-300'}`}>
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold">All</span>
          </button>

          {VEHICLE_CATEGORIES.map((cat) => {
            const Icon = categoryIcons[cat.id] || Car;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                  isSelected
                    ? 'bg-cyan-500/20 border-cyan-500 text-white shadow-lg shadow-cyan-500/10'
                    : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <div className={`p-2 rounded-xl ${isSelected ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-300'}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold">{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SERVICES LIST */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-extrabold text-white">Popular Wash Packages</h3>
            <p className="text-xs text-slate-400">Professional doorstep washing & detailing</p>
          </div>
          <Link to="/services" className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
            View All ({services.length}) <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((srv) => (
            <ServiceCard
              key={srv.id}
              service={srv}
              onBook={() => handleBookService(srv)}
            />
          ))}
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
