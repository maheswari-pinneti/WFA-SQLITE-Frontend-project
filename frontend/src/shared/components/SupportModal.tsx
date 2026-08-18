import React, { useState } from 'react';
import {
  LifeBuoy,
  X,
  Send,
  Phone,
  Mail,
  FileText,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  MessageSquare,
  Clock
} from 'lucide-react';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupportModal: React.FC<SupportModalProps> = ({ isOpen, onClose }) => {
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState('Technical Issue');
  const [ticketMessage, setTicketMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 800);
  };

  const handleReset = () => {
    setSubmitted(false);
    setTicketSubject('');
    setTicketMessage('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="glass-panel w-full max-w-2xl bg-[var(--bg-secondary)] border-[var(--border-color)] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--border-color)] flex items-center justify-between bg-blue-600/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-md">
              <LifeBuoy size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[var(--text-primary)]">Company Support & IT Helpdesk</h2>
              <p className="text-xs text-slate-400">Enterprise Support Services & SLA Guarantee</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-[var(--bg-tertiary)] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Quick Contact & SLA Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] space-y-1">
              <div className="flex items-center gap-2 text-blue-400 font-bold text-xs">
                <Phone size={16} /> 24/7 Hotline
              </div>
              <p className="text-sm font-black text-[var(--text-primary)]">+1 (800) 555-WFA</p>
              <p className="text-[10px] text-slate-400">Instant Priority Tech Desk</p>
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] space-y-1">
              <div className="flex items-center gap-2 text-purple-400 font-bold text-xs">
                <Mail size={16} /> Email Support
              </div>
              <p className="text-xs font-black text-[var(--text-primary)] truncate">support@stacklyworkforce.com</p>
              <p className="text-[10px] text-slate-400">Average response &lt; 15 mins</p>
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] space-y-1">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                <ShieldCheck size={16} /> SLA Protection
              </div>
              <p className="text-sm font-black text-emerald-400">99.98% Uptime</p>
              <p className="text-[10px] text-slate-400">Enterprise Tier SLA Verified</p>
            </div>
          </div>

          {/* Quick Help Guides */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Self-Service Knowledge Base</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <a
                href="#rbac-guide"
                onClick={(e) => e.preventDefault()}
                className="p-3 rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] border border-[var(--border-color)] flex items-center justify-between text-[var(--text-primary)] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-blue-400" />
                  <span>Understanding Role Access</span>
                </div>
                <ExternalLink size={14} className="text-slate-400" />
              </a>

              <a
                href="#attendance-guide"
                onClick={(e) => e.preventDefault()}
                className="p-3 rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] border border-[var(--border-color)] flex items-center justify-between text-[var(--text-primary)] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-cyan-400" />
                  <span>Attendance & Clocking Help</span>
                </div>
                <ExternalLink size={14} className="text-slate-400" />
              </a>
            </div>
          </div>

          {/* Submit Support Ticket Section */}
          <div className="border-t border-[var(--border-color)] pt-4">
            <h3 className="text-sm font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
              <MessageSquare size={18} className="text-blue-500" />
              Submit Priority Support Ticket
            </h3>

            {submitted ? (
              <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3">
                <CheckCircle2 size={40} className="text-emerald-400 mx-auto" />
                <h4 className="text-base font-bold text-emerald-300">Ticket Submitted Successfully!</h4>
                <p className="text-xs text-slate-300">
                  Ticket Ref: <span className="font-mono font-bold text-white">#TICK-88492</span>. Our IT Support Engineer will respond to your corporate email within 15 minutes.
                </p>
                <button
                  onClick={handleReset}
                  className="btn btn-secondary btn-sm mt-2"
                >
                  Done
                </button>
              </div>
            ) : (
              <form id="support-ticket-form" onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1.5">Ticket Category</label>
                    <select
                      value={ticketCategory}
                      onChange={(e) => setTicketCategory(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-blue-500"
                    >
                      <option>Technical Issue</option>
                      <option>Role & Permission Access Request</option>
                      <option>Attendance System Inquiry</option>
                      <option>Analytics Export Assistance</option>
                      <option>Security Policy Exception</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1.5">Subject</label>
                    <input
                      type="text"
                      required
                      value={ticketSubject}
                      onChange={(e) => setTicketSubject(e.target.value)}
                      placeholder="Brief summary of your issue..."
                      className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5">Description & Context</label>
                  <textarea
                    rows={3}
                    required
                    value={ticketMessage}
                    onChange={(e) => setTicketMessage(e.target.value)}
                    placeholder="Provide details about the issue or question..."
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Modal Footer (Sticky Actions) */}
        {!submitted && (
          <div className="px-6 py-4 border-t border-[var(--border-color)] bg-[var(--bg-secondary)] flex justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[var(--border-color)] text-xs font-bold text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-all flex items-center justify-center"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                const form = document.getElementById('support-ticket-form') as HTMLFormElement;
                if (form) form.requestSubmit();
              }}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
            >
              <Send size={14} />
              {isSubmitting ? 'Submitting...' : 'Send Support Ticket'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
