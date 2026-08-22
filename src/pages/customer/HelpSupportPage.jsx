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
    <div className="max-w-3xl mx-auto space-y-6 pb-16">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Help & Customer Support</h1>
        <p className="text-xs text-slate-400 mt-1">Need assistance with your vehicle wash? We are here 24/7.</p>
      </div>

      {/* Support Action Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <a
          href="tel:+91800278246"
          className="glass-card p-4 rounded-2xl border border-slate-800 hover:border-cyan-500/40 text-center flex flex-col items-center justify-center gap-2 group transition-all"
        >
          <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl group-hover:bg-cyan-500 group-hover:text-slate-950 transition-colors">
            <Phone className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-white">Call Support</span>
          <span className="text-[10px] text-slate-400">1800-AQUAGO</span>
        </a>

        <button
          onClick={() => alert('Starting live chat with AquaGo Customer Care agent...')}
          className="glass-card p-4 rounded-2xl border border-slate-800 hover:border-cyan-500/40 text-center flex flex-col items-center justify-center gap-2 group transition-all"
        >
          <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl group-hover:bg-cyan-500 group-hover:text-slate-950 transition-colors">
            <MessageSquare className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-white">Live Chat</span>
          <span className="text-[10px] text-slate-400">Instant Reply</span>
        </button>

        <a
          href="mailto:support@aquago.com"
          className="glass-card p-4 rounded-2xl border border-slate-800 hover:border-cyan-500/40 text-center flex flex-col items-center justify-center gap-2 group transition-all"
        >
          <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl group-hover:bg-cyan-500 group-hover:text-slate-950 transition-colors">
            <Mail className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-white">Email Us</span>
          <span className="text-[10px] text-slate-400">support@aquago.com</span>
        </a>

        <button
          onClick={() => setShowReportModal(true)}
          className="glass-card p-4 rounded-2xl border border-rose-500/30 hover:bg-rose-500/10 text-center flex flex-col items-center justify-center gap-2 group transition-all"
        >
          <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl">
            <AlertCircle className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-rose-300">Report Issue</span>
          <span className="text-[10px] text-slate-400">Raise Ticket</span>
        </button>
      </div>

      {/* Expandable FAQs */}
      <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-cyan-400" /> Frequently Asked Questions
        </h3>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isExpanded = expandedFaq === idx;
            return (
              <div
                key={idx}
                className="border border-slate-800 rounded-2xl bg-slate-900/60 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setExpandedFaq(isExpanded ? null : idx)}
                  className="w-full p-4 text-left text-xs font-bold text-white flex items-center justify-between gap-3 hover:bg-slate-800/60 transition-colors"
                >
                  <span>{faq.q}</span>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-cyan-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />}
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 text-xs text-slate-300 border-t border-slate-800/80 pt-3 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Report Problem Modal */}
      <Modal isOpen={showReportModal} onClose={() => setShowReportModal(false)} title="Report a Problem">
        <form onSubmit={handleReportSubmit} className="space-y-4">
          <label className="text-xs font-semibold text-slate-300 block">Describe the issue</label>
          <textarea
            value={reportIssue}
            onChange={(e) => setReportIssue(e.target.value)}
            rows={4}
            placeholder="Tell us what went wrong e.g. technician delayed, wash quality issue..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder:text-slate-500 outline-none focus:border-cyan-500"
            required
          />
          <div className="flex gap-2">
            <Button onClick={() => setShowReportModal(false)} variant="secondary" fullWidth type="button">Cancel</Button>
            <Button variant="danger" fullWidth type="submit">Submit Ticket</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
