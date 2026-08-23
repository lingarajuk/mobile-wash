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
      subtitle={`Booking #${booking.bookingNumber || booking.id} • ${booking.service?.name}`}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Star Selection */}
        <div className="flex flex-col items-center justify-center p-4 bg-[#F8FAFC] rounded-2xl border border-[#E6ECF5]">
          <span className="text-xs text-[#64748B] mb-2 font-bold">Tap to rate experience</span>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
                className="p-1 focus:outline-none transition-transform hover:scale-110 cursor-pointer"
              >
                <Star
                  className={`w-7 h-7 ${
                    (hoverRating || rating) >= star
                      ? 'text-[#F59E0B] fill-[#F59E0B]'
                      : 'text-[#CBD5E1]'
                  }`}
                />
              </button>
            ))}
          </div>
          <span className="text-xs font-black text-[#10213F] mt-2">
            {rating === 5 ? '⭐ Outstanding!' : rating === 4 ? 'Very Good' : rating === 3 ? 'Average' : 'Needs Improvement'}
          </span>
        </div>

        {/* Written Review */}
        <div>
          <label className="text-xs font-bold text-[#10213F] block mb-1.5">
            Your Feedback & Suggestions
          </label>
          <textarea
            rows={3}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="How was the shine, technician punctuality, and door cleaning quality?"
            className="w-full bg-[#F8FAFC] border border-[#E6ECF5] text-xs text-[#10213F] rounded-2xl p-3 outline-none focus:border-[#1264F5] focus:bg-white placeholder:text-[#94A3B8]"
          />
        </div>

        {/* Photo Upload */}
        <div>
          <label className="text-xs font-bold text-[#10213F] block mb-1.5">
            Attach Clean Car Photos (Optional)
          </label>
          <div className="flex flex-wrap gap-2">
            {photos.map((url, i) => (
              <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden border border-[#E6ECF5]">
                <img src={url} alt="Review" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removePhoto(i)}
                  className="absolute top-1 right-1 p-0.5 bg-[#EF4444] text-white rounded-full cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            <label className="w-16 h-16 rounded-xl border-2 border-dashed border-[#CBD5E1] bg-[#F8FAFC] hover:bg-white hover:border-[#1264F5] flex flex-col items-center justify-center text-[#64748B] hover:text-[#1264F5] cursor-pointer transition-colors">
              <Camera className="w-4 h-4 mb-0.5" />
              <span className="text-[9px] font-bold">+ Photo</span>
              <input type="file" multiple accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2 border-t border-[#E6ECF5]">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            Submit Review
          </Button>
        </div>
      </form>
    </Modal>
  );
};
