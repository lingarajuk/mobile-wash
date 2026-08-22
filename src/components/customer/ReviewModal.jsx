import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Star, Camera, Upload, X } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { reviewService } from '../../services/api';

export const ReviewModal = ({ isOpen, onClose, booking, onSubmitReview }) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [photos, setPhotos] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToast();

  if (!booking) return null;

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newUrls = files.map(file => URL.createObjectURL(file));
      setPhotos([...photos, ...newUrls]);
    }
  };

  const removePhoto = (idx) => {
    setPhotos(photos.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      reviewService.createReview({ bookingId: booking.id, rating, comment: feedback }).catch(() => {});
      addToast('Thank you! Your rating & review have been submitted.', 'success');
      if (onSubmitReview) onSubmitReview(booking.id, { rating, feedback, photos });
      onClose();
    }, 400);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Rate Your Vehicle Wash"
      subtitle={`Booking #${booking.id} • ${booking.service.name}`}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Star Selection */}
        <div className="flex flex-col items-center justify-center p-4 bg-slate-900/90 rounded-2xl border border-slate-800">
          <span className="text-xs text-slate-400 mb-2 font-medium">Tap to rate experience</span>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
                className="p-1 transition-transform transform hover:scale-125 focus:outline-none"
              >
                <Star
                  className={`w-8 h-8 ${
                    star <= (hoverRating || rating)
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-slate-700 fill-slate-800'
                  }`}
                />
              </button>
            ))}
          </div>
          <span className="text-xs font-bold text-amber-400 mt-2">
            {rating === 5 ? 'Awesome! 🌟🌟🌟🌟🌟' : rating === 4 ? 'Great Service 👍' : rating === 3 ? 'Average' : 'Could be better'}
          </span>
        </div>

        {/* Written Feedback */}
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1.5">
            Share your feedback
          </label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={3}
            placeholder="Tell us how clean your vehicle is or rate technician behavior..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder:text-slate-500 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
          />
        </div>

        {/* Photo Upload UI */}
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1.5">
            Add Clean Vehicle Photos (Optional)
          </label>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {photos.map((src, i) => (
              <div key={i} className="relative w-16 h-16 rounded-xl border border-slate-700 overflow-hidden shrink-0 group">
                <img src={src} alt="Clean car" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removePhoto(i)}
                  className="absolute top-0.5 right-0.5 bg-slate-950/80 text-rose-400 p-0.5 rounded-full"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}

            <label className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-700 hover:border-cyan-500/50 bg-slate-900/60 flex flex-col items-center justify-center text-slate-400 hover:text-cyan-400 cursor-pointer transition-colors shrink-0">
              <Camera className="w-5 h-5 mb-0.5" />
              <span className="text-[9px]">Upload</span>
              <input type="file" accept="image/*" multiple onChange={handlePhotoUpload} className="hidden" />
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <Button onClick={onClose} variant="secondary" fullWidth type="button">
            Cancel
          </Button>
          <Button variant="primary" fullWidth type="submit" isLoading={isSubmitting}>
            Submit Review
          </Button>
        </div>
      </form>
    </Modal>
  );
};
