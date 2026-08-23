import React, { useState } from 'react';
import { Phone, Mail, MessageSquare, AlertCircle, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { useToast } from '../../context/ToastContext';

export const HelpSupportPage = () => {
  const { addToast } = useToast();
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportIssue, setReportIssue] = useState('');

  const faqs = [
    {
      q: 'Do I need to supply water or electricity for the wash?',
      a: 'No! Our mobile wash vehicles are fully equipped with soft water storage tanks and silent power generators. We perform 100% self-sufficient doorstep washing.'
    },
    {
      q: 'What if I am not satisfied with the wash cleanliness?',
      a: 'We offer a 100% satisfaction guarantee. You inspect the vehicle before paying. If any spot is missed, the technician will re-wash it immediately at zero extra cost.'
    },
    {
      q: 'How long does a doorstep car wash take?',
      a: 'Basic exterior foam wash takes ~35 minutes, while Full Interior + Exterior detailing combo takes ~90 minutes.'
    },
    {
      q: 'Can I cancel or reschedule my booking?',
      a: 'Yes, free cancellation and slot rescheduling are available up to 2 hours before the scheduled time slot via the My Bookings tab.'
    },
    {
      q: 'Are the cleaning shampoos safe for luxury car paint & ceramic coating?',
      a: 'Absolutely! We exclusively use pH-neutral, biodegradable snow foam shampoos and ultra-plush microfiber towels that protect wax & ceramic coats.'
    }
  ];

  const handleReportSubmit = (e) => {
    e.preventDefault();
    setShowReportModal(false);
    setReportIssue('');
    addToast('Support ticket raised. Our supervisor will call you within 15 minutes.', 'success');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16 animate-fadeIn">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#10213F]">Help & Customer Support</h1>
        <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">Need assistance with your vehicle wash? We are here 24/7.</p>
      </div>

      {/* Support Action Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <a
          href="tel:+91800278246"
          className="bg-white p-4.5 rounded-2xl border border-[#E6ECF5] hover:border-[#BFDBFE] hover:shadow-sm text-center flex flex-col items-center justify-center gap-2 group transition-all"
        >
          <div className="p-3 bg-[#F0F6FF] text-[#1264F5] rounded-xl group-hover:bg-[#1264F5] group-hover:text-white transition-colors">
            <Phone className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-[#10213F]">Call Support</span>
          <span className="text-[10px] text-[#64748B]">1800-278-246</span>
        </a>

        <a
          href="mailto:support@aquagowash.in"
          className="bg-white p-4.5 rounded-2xl border border-[#E6ECF5] hover:border-[#BFDBFE] hover:shadow-sm text-center flex flex-col items-center justify-center gap-2 group transition-all"
        >
          <div className="p-3 bg-[#F0F6FF] text-[#1264F5] rounded-xl group-hover:bg-[#1264F5] group-hover:text-white transition-colors">
            <Mail className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-[#10213F]">Email Us</span>
          <span className="text-[10px] text-[#64748B]">Quick reply &lt; 2h</span>
        </a>

        <a
          href="https://wa.me/919876543210"
          target="_blank"
          rel="noreferrer"
          className="bg-white p-4.5 rounded-2xl border border-[#E6ECF5] hover:border-[#BFDBFE] hover:shadow-sm text-center flex flex-col items-center justify-center gap-2 group transition-all"
        >
          <div className="p-3 bg-[#F0FDF4] text-[#16A34A] rounded-xl group-hover:bg-[#16A34A] group-hover:text-white transition-colors">
            <MessageSquare className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-[#10213F]">WhatsApp</span>
          <span className="text-[10px] text-[#64748B]">Instant chat</span>
        </a>

        <button
          onClick={() => setShowReportModal(true)}
          className="bg-white p-4.5 rounded-2xl border border-[#E6ECF5] hover:border-[#BFDBFE] hover:shadow-sm text-center flex flex-col items-center justify-center gap-2 group transition-all cursor-pointer"
        >
          <div className="p-3 bg-[#FEF2F2] text-[#EF4444] rounded-xl group-hover:bg-[#EF4444] group-hover:text-white transition-colors">
            <AlertCircle className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-[#10213F]">Report Issue</span>
          <span className="text-[10px] text-[#64748B]">Priority ticket</span>
        </button>
      </div>

      {/* FAQ SECTION */}
      <div className="bg-white rounded-3xl p-6 border border-[#E6ECF5] shadow-xs space-y-4">
        <h2 className="text-base font-black text-[#10213F] flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-[#1264F5]" /> Frequently Asked Questions
        </h2>

        <div className="space-y-2">
          {faqs.map((faq, idx) => {
            const isExp = expandedFaq === idx;
            return (
              <div
                key={idx}
                className="border border-[#E6ECF5] rounded-2xl overflow-hidden bg-[#F8FAFC]"
              >
                <button
                  onClick={() => setExpandedFaq(isExp ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between gap-3 text-xs font-bold text-[#10213F] cursor-pointer hover:bg-white transition-colors"
                >
                  <span>{faq.q}</span>
                  {isExp ? <ChevronUp className="w-4 h-4 text-[#1264F5] shrink-0" /> : <ChevronDown className="w-4 h-4 text-[#94A3B8] shrink-0" />}
                </button>

                {isExp && (
                  <div className="px-4 pb-4 pt-1 text-xs text-[#64748B] leading-relaxed border-t border-[#E6ECF5] bg-white">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* REPORT ISSUE MODAL */}
      <Modal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        title="Report Service Issue"
        subtitle="Our supervisor will review and respond immediately"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleReportSubmit} className="space-y-4 text-xs">
          <div>
            <label className="text-xs font-bold text-[#10213F] block mb-1">Describe Your Issue</label>
            <textarea
              rows={4}
              placeholder="e.g. Technician arrived 15 mins late, or water spots on side mirrors..."
              value={reportIssue}
              onChange={(e) => setReportIssue(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-[#E6ECF5] text-xs text-[#10213F] rounded-2xl p-3 outline-none focus:border-[#1264F5] placeholder:text-[#94A3B8]"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowReportModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Submit Ticket
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
