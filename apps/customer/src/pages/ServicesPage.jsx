import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@shared/context/AuthContext';
import { ServiceCard } from '../components/ServiceCard';
import { ServiceComparisonModal } from '../components/ServiceComparisonModal';
import { INITIAL_SERVICES, VEHICLE_CATEGORIES } from '@shared/data/mockData';
import { serviceService } from '@shared/services/api';
import { Button } from '@shared/components/Button';
import { Search, SlidersHorizontal, Sparkles } from 'lucide-react';

export const ServicesPage = () => {
  const navigate = useNavigate();
  const { setBookingDraft, selectedVehicle, selectedAddress } = useAuth();

  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [showComparison, setShowComparison] = useState(false);
  const [services, setServices] = useState(INITIAL_SERVICES);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    serviceService.getServices(activeCategory === 'all' ? null : activeCategory, search)
      .then((data) => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setServices(data);
        }
      })
      .catch((err) => {
        console.warn('Failed to load services from API:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [activeCategory, search]);

  const handleBook = (srv) => {
    setBookingDraft(prev => ({
      ...prev,
      service: srv,
      vehicle: selectedVehicle || prev.vehicle,
      address: selectedAddress || prev.address
    }));
    navigate(`/booking/${srv.id}`);
  };

  return (
    <div className="space-y-6 pb-16 animate-fadeIn max-w-[1400px] mx-auto">
      {/* Header & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#10213F]">Doorstep Washing Services</h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">Choose from eco foam wash, deep interior detailing and bike care</p>
        </div>

        <Button
          onClick={() => setShowComparison(true)}
          variant="secondary"
          size="md"
          icon={SlidersHorizontal}
        >
          Compare Packages
        </Button>
      </div>

      {/* Search & Category Chips */}
      <div className="bg-white p-4 rounded-2xl border border-[#E6ECF5] shadow-xs space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by package name or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#F8FAFC] border border-[#E6ECF5] text-xs text-[#10213F] rounded-xl py-2.5 pl-10 pr-4 outline-none focus:border-[#1264F5] focus:bg-white transition-colors placeholder:text-[#94A3B8]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
              activeCategory === 'all' ? 'bg-[#1264F5] text-white shadow-sm' : 'bg-[#F8FAFC] border border-[#E6ECF5] text-[#64748B] hover:text-[#10213F]'
            }`}
          >
            All Packages
          </button>
          {VEHICLE_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                activeCategory === cat.id ? 'bg-[#1264F5] text-white shadow-sm' : 'bg-[#F8FAFC] border border-[#E6ECF5] text-[#64748B] hover:text-[#10213F]'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Service Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((srv) => (
          <ServiceCard
            key={srv.id}
            service={srv}
            onSelect={handleBook}
            onBook={handleBook}
            onViewDetails={(s) => navigate(`/service/${s.id}`)}
          />
        ))}
      </div>

      {/* Package Comparison Modal */}
      {showComparison && (
        <ServiceComparisonModal
          isOpen={showComparison}
          onClose={() => setShowComparison(false)}
          services={services}
          onSelectService={(srv) => {
            setShowComparison(false);
            handleBook(srv);
          }}
        />
      )}
    </div>
  );
};
