import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface ScheduledJob {
  id: string;
  date: string;
  time: string;
  clientName: string;
  jobType: string;
  address: string;
  notes: string;
  assignedTo: string;
  color?: string;
  revenue: string;
  createdAt: number;
}

const JOB_TYPES = [
  { label: 'Service Call', color: 'bg-blue-500 text-white' },
  { label: 'Rough-In', color: 'bg-orange-500 text-white' },
  { label: 'Trim/Finishing', color: 'bg-purple-500 text-white' },
  { label: 'Panel Upgrade', color: 'bg-red-500 text-white' },
  { label: 'EV Charger', color: 'bg-green-500 text-white' },
  { label: 'Solar', color: 'bg-amber-500 text-white' },
  { label: 'Inspection', color: 'bg-teal-500 text-white' },
  { label: 'Other', color: 'bg-slate-500 text-white' },
];

const LS_KEY = 'ep_schedule';

function uid() { return Math.random().toString(36).slice(2, 9); }

function getColor(type: string) {
  return JOB_TYPES.find(j => j.label === type)?.color || 'bg-slate-500 text-white';
}

function getWeekDays(base: Date) {
  const days = [];
  const monday = new Date(base);
  monday.setDate(base.getDate() - base.getDay() + 1);
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push(d);
  }
  return days;
}

function fmtDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function fmtLabel(d: Date) {
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export default function JobSchedulerPage() {
  const [weekStart, setWeekStart] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay() + 1);
    return d;
  });
  const [jobs, setJobs] = useState<ScheduledJob[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formDate, setFormDate] = useState(fmtDate(new Date()));
  const [form, setForm] = useState({ time: '09:00', clientName: '', jobType: 'Service Call', address: '', notes: '', assignedTo: 'Self', revenue: '' });
  const [selectedJob, setSelectedJob] = useState<ScheduledJob | null>(null);

  useEffect(() => {
    setJobs(JSON.parse(localStorage.getItem(LS_KEY) || '[]'));
  }, []);

  function saveJob() {
    const job: ScheduledJob = { id: uid(), date: formDate, ...form, color: getColor(form.jobType), createdAt: Date.now() };
    const updated = [...jobs.filter(j => j.id !== selectedJob?.id), job];
    setJobs(updated);
    localStorage.setItem(LS_KEY, JSON.stringify(updated));
    setShowForm(false);
    setSelectedJob(null);
  }

  function deleteJob(id: string) {
    const updated = jobs.filter(j => j.id !== id);
    setJobs(updated);
    localStorage.setItem(LS_KEY, JSON.stringify(updated));
    setSelectedJob(null);
  }

  function openForm(date: string, time?: string) {
    setFormDate(date);
    if (time) setForm(f => ({ ...f, time }));
    setForm({ time: time || '09:00', clientName: '', jobType: 'Service Call', address: '', notes: '', assignedTo: 'Self', revenue: '' });
    setSelectedJob(null);
    setShowForm(true);
  }

  const days = getWeekDays(weekStart);
  const weekJobs = jobs.filter(j => days.some(d => fmtDate(d) === j.date));
  const weekRevenue = weekJobs.reduce((s, j) => s + parseFloat(j.revenue || '0'), 0);

  function prevWeek() {
    const d = new Date(weekStart);
    d.setDate(d.getDate() - 7);
    setWeekStart(d);
  }
  function nextWeek() {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7);
    setWeekStart(d);
  }

  const hours = Array.from({ length: 13 }, (_, i) => i + 7);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="text-slate-400 hover:text-white text-sm mr-4">← Dashboard</Link>
          <h1 className="text-xl font-black">📅 Job Scheduling Calendar</h1>
        </div>
        <button onClick={() => openForm(fmtDate(new Date()))} className="bg-amber-400 text-slate-900 font-bold px-4 py-2 rounded-xl text-sm hover:bg-amber-300">+ Add Job</button>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Week Summary */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={prevWeek} className="bg-gray-100 rounded-xl px-3 py-2 text-slate-600 hover:bg-gray-200">←</button>
            <span className="font-black text-slate-900">{days[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} — {days[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            <button onClick={nextWeek} className="bg-gray-100 rounded-xl px-3 py-2 text-slate-600 hover:bg-gray-200">→</button>
          </div>
          <div className="bg-amber-50 rounded-xl px-4 py-2 text-center">
            <div className="text-xs text-slate-500 font-semibold">This Week</div>
            <div className="font-black text-amber-600">{weekJobs.length} jobs · ${weekRevenue.toFixed(2)} est.</div>
          </div>
        </div>

        {/* Mobile: Daily List */}
        <div className="lg:hidden space-y-4">
          {days.map(d => {
            const dayJobs = jobs.filter(j => j.date === fmtDate(d));
            return (
              <div key={fmtDate(d)} className="bg-white rounded-2xl border border-gray-200 p-4">
                <div className="font-black text-slate-900 mb-3">{fmtLabel(d)}</div>
                {dayJobs.length === 0 ? (
                  <button onClick={() => openForm(fmtDate(d))} className="w-full border-2 border-dashed border-gray-200 rounded-xl py-4 text-slate-400 text-sm hover:border-amber-300 hover:text-amber-600">+ Add job</button>
                ) : (
                  <div className="space-y-2">
                    {dayJobs.map(job => (
                      <div key={job.id} className={`${getColor(job.jobType)} rounded-xl px-4 py-3 cursor-pointer`} onClick={() => setSelectedJob(job)}>
                        <div className="font-black">{job.time} — {job.clientName}</div>
                        <div className="opacity-80 text-sm">{job.jobType} · {job.address}</div>
                        {job.revenue && <div className="text-sm font-bold mt-1">${job.revenue}</div>}
                      </div>
                    ))}
                    <button onClick={() => openForm(fmtDate(d))} className="w-full text-blue-600 font-bold text-xs py-1">+ Add job</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Desktop: Week Grid */}
        <div className="hidden lg:block bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="grid grid-cols-7 border-b border-gray-100">
            {days.map(d => (
              <div key={fmtDate(d)} className={`px-2 py-3 text-center border-r border-gray-50 last:border-r-0 ${fmtDate(d) === fmtDate(new Date()) ? 'bg-amber-50' : ''}`}>
                <div className="text-xs text-slate-400 uppercase">{d.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                <div className="text-lg font-black text-slate-900">{d.getDate()}</div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 min-h-96">
            {days.map(d => {
              const dayJobs = jobs.filter(j => j.date === fmtDate(d));
              return (
                <div key={fmtDate(d)} className={`border-r border-gray-50 last:border-r-0 p-2 ${fmtDate(d) === fmtDate(new Date()) ? 'bg-amber-50/30' : ''}`}>
                  <button onClick={() => openForm(fmtDate(d))} className="w-full text-blue-400 hover:text-blue-600 text-xs font-bold mb-2 opacity-0 hover:opacity-100 transition-opacity">+ Add</button>
                  <div className="space-y-1">
                    {dayJobs.map(job => (
                      <div key={job.id} className={`${getColor(job.jobType)} rounded-lg px-2 py-1.5 cursor-pointer`} onClick={() => setSelectedJob(job)}>
                        <div className="text-xs font-black">{job.time}</div>
                        <div className="text-xs font-semibold truncate">{job.clientName}</div>
                        <div className="text-xs opacity-80 truncate">{job.address}</div>
                        {job.revenue && <div className="text-xs font-bold mt-0.5">${job.revenue}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Add/Edit Job Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="font-black text-slate-900 mb-4">📅 Schedule Job</h2>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Date</label>
                  <input type="date" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" value={formDate} onChange={e => setFormDate(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Time</label>
                  <input type="time" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} />
                </div>
              </div>
              <input className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" placeholder="Client Name" value={form.clientName} onChange={e => setForm(f => ({ ...f, clientName: e.target.value }))} />
              <select className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" value={form.jobType} onChange={e => setForm(f => ({ ...f, jobType: e.target.value }))}>
                {JOB_TYPES.map(j => <option key={j.label} value={j.label}>{j.label}</option>)}
              </select>
              <input className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" placeholder="Job Address" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
              <input className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" placeholder="Est. Revenue ($)" type="number" value={form.revenue} onChange={e => setForm(f => ({ ...f, revenue: e.target.value }))} />
              <select className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" value={form.assignedTo} onChange={e => setForm(f => ({ ...f, assignedTo: e.target.value }))}>
                <option>Self</option>
                <option>Subcontractor</option>
              </select>
              <textarea className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" placeholder="Notes..." rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => { setShowForm(false); setSelectedJob(null); }} className="flex-1 border border-gray-200 text-slate-600 font-bold py-2.5 rounded-xl text-sm">Cancel</button>
              <button onClick={saveJob} className="flex-1 bg-amber-400 text-slate-900 font-black py-2.5 rounded-xl text-sm hover:bg-amber-300">Save Job</button>
            </div>
          </div>
        </div>
      )}

      {/* Job Detail Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className={`${getColor(selectedJob.jobType)} rounded-xl px-4 py-3 mb-4`}>
              <div className="font-black text-sm">{selectedJob.time} — {selectedJob.clientName}</div>
              <div className="text-sm opacity-80">{selectedJob.jobType}</div>
            </div>
            <div className="space-y-2 text-sm">
              <div><span className="text-slate-500 font-semibold">Date:</span> {selectedJob.date}</div>
              <div><span className="text-slate-500 font-semibold">Address:</span> {selectedJob.address || '—'}</div>
              <div><span className="text-slate-500 font-semibold">Revenue:</span> {selectedJob.revenue ? `$${selectedJob.revenue}` : '—'}</div>
              <div><span className="text-slate-500 font-semibold">Assigned:</span> {selectedJob.assignedTo}</div>
              {selectedJob.notes && <div><span className="text-slate-500 font-semibold">Notes:</span> {selectedJob.notes}</div>}
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => { setSelectedJob(null); openForm(selectedJob.date, selectedJob.time); setForm(f => ({ ...f, clientName: selectedJob.clientName, jobType: selectedJob.jobType, address: selectedJob.address, notes: selectedJob.notes, assignedTo: selectedJob.assignedTo, revenue: selectedJob.revenue })); }} className="flex-1 bg-slate-100 text-slate-700 font-bold py-2.5 rounded-xl text-sm">Edit</button>
              <button onClick={() => deleteJob(selectedJob.id)} className="flex-1 bg-red-500 text-white font-bold py-2.5 rounded-xl text-sm hover:bg-red-600">Delete</button>
              <button onClick={() => setSelectedJob(null)} className="flex-1 border border-gray-200 text-slate-600 font-bold py-2.5 rounded-xl text-sm">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
