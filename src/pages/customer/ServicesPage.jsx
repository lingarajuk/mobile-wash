import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ServiceCard } from '../../components/customer/ServiceCard';
import { ServiceComparisonModal } from '../../components/customer/ServiceComparisonModal';
import { INITIAL_SERVICES, VEHICLE_CATEGORIES } from '../../data/mockData';
import { Search, SlidersHorizontal, Sparkles } from 'lucide-react';

export const ServicesPage = () => {
  const navigate = useNavigate();
  const { setBookingDraft, selectedVehicle, selectedAddress } = useAuth();

  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [showComparison, setShowComparison] = useState(false);

  const services = INITIAL_SERVICES.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.description.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === 'all' || s.category === activeCategory || s.recommendedVehicles.includes(activeCategory);
    return matchSearch && matchCat;
  });

  const handleBook = (srv) => {
    setBookingDraft(prev => ({
      ...prev,
      service: srv,
      vehicle: selectedVehicle || prev.vehicle,
      address: selectedAddress || prev.address
    }));
    navigate('/book');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Doorstep Washing Services</h1>
          <p className="text-xs text-slate-400">Choose from eco foam wash, deep interior detailing and bike care</p>
        </div>

        <button
          onClick={() => setShowComparison(true)}
          className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-400 font-semibold px-4 py-2.5 rounded-xl text-xs shadow-md"
        >
          <SlidersHorizontal className="w-4 h-4" /> Compare Packages
        </button>
      </div>

      {/* Search & Category Chips */}
      <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by package name or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-100 rounded-xl py-2.5 pl-10 pr-4 outline-none focus:border-cyan-500 placeholder:text-slate-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              activeCategory === 'all' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            All Packages
          </button>
          {VEHICLE_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                activeCategory === cat.id ? 'bg-cyan-500 text-slate-950' : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {services.map(service => (
          <ServiceCard
            key={service.id}
            service={service}
            onSelect={handleBook}
            onViewDetails={(srv) => navigate(`/service/${srv.id}`)}
          />
        ))}
      </div>

      <ServiceComparisonModal
        isOpen={showComparison}
        onClose={() => setShowComparison(false)}
        onSelectService={handleBook}
      />
    </div>
  );
};
