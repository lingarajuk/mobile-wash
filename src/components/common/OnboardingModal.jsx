import React, { useState } from 'react';
import { Button } from './Button';
import { MapPin, CalendarCheck, ShieldCheck, ChevronRight } from 'lucide-react';

export const OnboardingModal = ({ onFinish }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      icon: MapPin,
      title: 'Doorstep Vehicle Washing',
      description: 'No more waiting in long service center queues. Our trained professionals bring premium eco-water pressure washing directly to your home or office.',
      bgGradient: 'from-cyan-500/20 to-blue-600/10'
    },
    {
      icon: CalendarCheck,
      title: 'Book in Minutes',
      description: 'Select your vehicle type, pick a customized washing package or add-on, and schedule your preferred date & time slot in just a few simple taps.',
      bgGradient: 'from-blue-500/20 to-indigo-600/10'
    },
    {
      icon: ShieldCheck,
      title: 'Clean. Convenient. Reliable.',
      description: 'Track your washing expert live on map, enjoy transparent fixed pricing with 100% satisfaction guarantee, and pay cash or online after completion.',
      bgGradient: 'from-teal-500/20 to-cyan-600/10'
    }
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onFinish();
    }
  };

  const SlideIcon = slides[currentSlide].icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-lg">
      <div className="w-full max-w-md glass-panel border border-slate-700/60 rounded-3xl p-6 sm:p-8 flex flex-col justify-between min-h-[500px] shadow-2xl relative overflow-hidden">
        {/* Top Header & Skip */}
        <div className="flex justify-between items-center z-10">
          <div className="flex items-center gap-1.5">
            {slides.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentSlide ? 'w-8 bg-cyan-400' : 'w-2 bg-slate-700'
                }`}
              />
            ))}
          </div>
          <button
            onClick={onFinish}
            className="text-xs font-semibold text-slate-400 hover:text-white px-2 py-1 rounded-lg transition-colors"
          >
            Skip
          </button>
        </div>

        {/* Dynamic Slide Content */}
        <div className="my-auto py-6 flex flex-col items-center text-center z-10 animate-fadeIn">
          <div className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${slides[currentSlide].bgGradient} border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-6 shadow-xl`}>
            <SlideIcon className="w-12 h-12 stroke-[1.8]" />
          </div>

          <h2 className="text-2xl font-bold text-white mb-3">
            {slides[currentSlide].title}
          </h2>

          <p className="text-sm text-slate-300 leading-relaxed max-w-xs">
            {slides[currentSlide].description}
          </p>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center gap-3 pt-4 border-t border-slate-800/80 z-10">
          {currentSlide === slides.length - 1 ? (
            <Button
              onClick={onFinish}
              variant="primary"
              size="lg"
              fullWidth
              className="shadow-lg shadow-cyan-500/25"
            >
              Get Started
            </Button>
          ) : (
            <>
              <Button
                onClick={onFinish}
                variant="ghost"
                size="md"
                className="text-slate-400"
              >
                Skip
              </Button>
              <Button
                onClick={handleNext}
                variant="primary"
                size="md"
                fullWidth
                icon={ChevronRight}
              >
                Next
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
