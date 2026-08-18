import React, { useEffect, useState } from 'react';
import { Flame, AlertCircle } from 'lucide-react';
import { Task, workforceApi } from '../../../api/endpoints/workforce.api';

export const TaskTrackingPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { workforceApi.getTasks().then(setTasks).catch((err) => setError(err instanceof Error ? err.message : 'Unable to load tasks.')); }, []);

  const updateStatus = async (id: string, status: Task['status']) => {
    try {
      const updated = await workforceApi.updateTask(id, status);
      setTasks((current) => current.map((task) => task.id === id ? updated : task));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update task.');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[var(--border-color)] pb-4">
        <div>
          <span className="badge badge-info mb-1">Sprint Management</span>
          <h1 className="text-2xl font-black tracking-tight text-[var(--text-primary)]">
            Team Task & Sprint Tracking Board
          </h1>
          <p className="text-xs text-slate-400">
            Track active engineering tasks, sprint deliverables, and backlog items.
          </p>
        </div>
      </div>

      {/* Task List */}
      <div className="glass-panel p-6 rounded-2xl border-[var(--border-color)] space-y-4">
        <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
          <Flame size={18} className="text-rose-400" /> Active Sprint Tasks
        </h3>

        {error && <p className="text-xs text-rose-400 flex items-center gap-2"><AlertCircle size={14} /> {error}</p>}
        <div className="space-y-3">
          {tasks.length === 0 && !error ? <p className="text-sm text-[var(--text-muted)]">No tasks are assigned in your scope.</p> : tasks.map((t) => (
            <div key={t.id} className="p-4 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] flex items-center justify-between text-xs">
              <div>
                <span className="font-mono text-[10px] text-slate-400">{t.id}</span>
                <h4 className="font-bold text-sm text-[var(--text-primary)]">{t.title}</h4>
                <p className="text-xs text-slate-400">Assignee: <span className="text-blue-400 font-semibold">{t.assigneeName}</span> · {t.points} points</p>
              </div>
              <select value={t.status} onChange={(event) => void updateStatus(t.id, event.target.value as Task['status'])} className={`badge ${t.status === 'COMPLETED' ? 'badge-success' : 'badge-info'} text-[10px] uppercase font-bold`}>
                <option>TODO</option><option>IN_PROGRESS</option><option>COMPLETED</option><option>BLOCKED</option>
              </select>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
