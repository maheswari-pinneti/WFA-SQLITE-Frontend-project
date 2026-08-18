import React, { useEffect, useState } from 'react';
import { FileText, Plus, Send, AlertCircle } from 'lucide-react';
import { workforceApi, LeaveRequest } from '../../../api/endpoints/workforce.api';

export const EmployeeRequestsPage: React.FC = () => {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ type: 'Annual Leave', startDate: '', endDate: '', reason: '' });

  const loadRequests = async () => {
    setIsLoading(true);
    try {
      setRequests(await workforceApi.getLeaveRequests());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load leave requests.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { void loadRequests(); }, []);

  const submitRequest = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await workforceApi.createLeaveRequest(form);
      setForm({ type: 'Annual Leave', startDate: '', endDate: '', reason: '' });
      setShowForm(false);
      await loadRequests();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to submit leave request.');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[var(--border-color)] pb-4">
        <div>
          <span className="badge badge-success mb-1">Employee Self Service</span>
          <h1 className="text-2xl font-black tracking-tight text-[var(--text-primary)]">
            My Self-Service Requests & Submissions
          </h1>
          <p className="text-xs text-slate-400">
            Submit leave requests, expense reimbursements, and remote work permissions.
          </p>
        </div>
        <button onClick={() => setShowForm((value) => !value)} className="btn btn-primary btn-sm flex items-center gap-2">
          <Plus size={14} /> {showForm ? 'Close Request Form' : 'Submit New Request'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={submitRequest} className="glass-panel p-6 rounded-2xl border-[var(--border-color)] grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="text-xs font-bold text-[var(--text-muted)]">Request type
            <select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })} className="input mt-1 w-full">
              <option>Annual Leave</option><option>Sick Leave</option><option>Remote Work</option><option>Personal Leave</option>
            </select>
          </label>
          <label className="text-xs font-bold text-[var(--text-muted)]">Reason
            <input required value={form.reason} onChange={(event) => setForm({ ...form, reason: event.target.value })} className="input mt-1 w-full" placeholder="Tell your approver why" />
          </label>
          <label className="text-xs font-bold text-[var(--text-muted)]">Start date
            <input required type="date" value={form.startDate} onChange={(event) => setForm({ ...form, startDate: event.target.value })} className="input mt-1 w-full" />
          </label>
          <label className="text-xs font-bold text-[var(--text-muted)]">End date
            <input required type="date" value={form.endDate} onChange={(event) => setForm({ ...form, endDate: event.target.value })} className="input mt-1 w-full" />
          </label>
          <button type="submit" className="btn btn-primary md:col-span-2 flex items-center justify-center gap-2"><Send size={14} /> Submit for approval</button>
        </form>
      )}

      {/* Request History */}
      <div className="glass-panel p-6 rounded-2xl border-[var(--border-color)] space-y-4">
        <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
          <FileText size={18} className="text-amber-400" /> Submitted Request History
        </h3>

        {error && <p className="text-xs text-rose-400 flex items-center gap-2"><AlertCircle size={14} /> {error}</p>}
        <div className="space-y-3">
          {isLoading ? <p className="text-sm text-[var(--text-muted)]">Loading requests…</p> : requests.length === 0 ? <p className="text-sm text-[var(--text-muted)]">No leave requests yet.</p> : requests.map((r) => (
            <div key={r.id} className="p-4 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] flex items-center justify-between text-xs">
              <div>
                <span className="font-mono text-[10px] text-slate-400">{r.id}</span>
                <h4 className="font-bold text-sm text-[var(--text-primary)]">{r.type}</h4>
                <p className="text-xs text-slate-400">{r.startDate} - {r.endDate} · {r.reason}</p>
              </div>
              <span className={`badge ${r.status === 'APPROVED' ? 'badge-success' : r.status === 'REJECTED' ? 'badge-danger' : 'badge-info'} text-[10px] uppercase font-bold`}>
                {r.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
