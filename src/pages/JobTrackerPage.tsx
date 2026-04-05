import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

type Stage = 'Lead' | 'Quoted' | 'Negotiating' | 'Won' | 'Completed';

interface Job {
  id: string;
  clientName: string;
  phone: string;
  email: string;
  jobType: string;
  description: string;
  estimatedValue: number;
  stage: Stage;
  date: string;
  notes: string;
  lineItems: { description: string; qty: number; price: number }[];
  timeline: { date: string; event: string }[];
}

const STAGES: Stage[] = ['Lead', 'Quoted', 'Negotiating', 'Won', 'Completed'];
const STAGE_COLORS: Record<Stage, string> = {
  Lead: 'bg-gray-100 border-gray-300 text-gray-700',
  Quoted: 'bg-blue-100 border-blue-300 text-blue-700',
  Negotiating: 'bg-yellow-100 border-yellow-300 text-yellow-700',
  Won: 'bg-green-100 border-green-300 text-green-700',
  Completed: 'bg-slate-900 text-white',
};

function StageBadge({ stage }: { stage: Stage }) {
  return <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${STAGE_COLORS[stage]}`}>{stage}</span>;
}

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

const EMPTY_FORM: Omit<Job, 'id' | 'date'> = {
  clientName: '',
  phone: '',
  email: '',
  jobType: '',
  description: '',
  estimatedValue: 0,
  stage: 'Lead',
  notes: '',
  lineItems: [],
  timeline: [],
};

export default function JobTrackerPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filter, setFilter] = useState<Stage | 'All'>('All');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Omit<Job, 'id' | 'date'>>(EMPTY_FORM);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('ep_jobs');
    if (saved) setJobs(JSON.parse(saved));
  }, []);

  function save(jobsToSave: Job[]) {
    setJobs(jobsToSave);
    localStorage.setItem('ep_jobs', JSON.stringify(jobsToSave));
  }

  function addJob() {
    const job: Job = { ...form, id: genId(), date: new Date().toLocaleDateString() };
    save([...jobs, job]);
    setShowForm(false);
    setForm(EMPTY_FORM);
  }

  function updateStage(jobId: string, newStage: Stage) {
    const updated = jobs.map(j => j.id === jobId ? { ...j, stage: newStage } : j);
    save(updated);
    if (selectedJob) setSelectedJob(updated.find(j => j.id === jobId) || null);
  }

  function deleteJob(jobId: string) {
    if (!confirm('Delete this job?')) return;
    save(jobs.filter(j => j.id !== jobId));
    if (selectedJob?.id === jobId) setSelectedJob(null);
  }

  function addNote(jobId: string, note: string) {
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;
    const updated: Job = {
      ...job,
      notes: job.notes ? `${job.notes}\n[${new Date().toLocaleDateString()}] ${note}` : `[${new Date().toLocaleDateString()}] ${note}`,
      timeline: [...job.timeline, { date: new Date().toLocaleDateString(), event: note }],
    };
    save(jobs.map(j => j.id === jobId ? updated : j));
    setSelectedJob(updated);
  }

  function exportCSV() {
    const headers = ['Client', 'Phone', 'Email', 'Job Type', 'Description', 'Value', 'Stage', 'Date'];
    const rows = filteredJobs.map(j => [j.clientName, j.phone, j.email, j.jobType, j.description, j.estimatedValue, j.stage, j.date]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'jobs-export.csv'; a.click();
    URL.revokeObjectURL(url);
  }

  const filteredJobs = filter === 'All' ? jobs : jobs.filter(j => j.stage === filter);

  const totalLeads = jobs.length;
  const totalValue = jobs.reduce((s, j) => s + j.estimatedValue, 0);
  const wonJobs = jobs.filter(j => j.stage === 'Won' || j.stage === 'Completed').length;
  const winRate = totalLeads > 0 ? Math.round((wonJobs / totalLeads) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-slate-900 text-white px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <Link to="/dashboard" className="text-slate-400 hover:text-white text-sm">← Dashboard</Link>
          <span className="text-slate-600">|</span>
          <span className="text-2xl">📋</span>
          <div>
            <h1 className="font-black">Job Tracker CRM</h1>
            <p className="text-slate-400 text-sm">Manage your pipeline from lead to close</p>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Summary Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Leads', value: totalLeads, icon: '👥', color: 'bg-white border border-gray-100' },
            { label: 'Total Pipeline Value', value: `$${totalValue.toLocaleString()}`, icon: '💰', color: 'bg-white border border-gray-100' },
            { label: 'Won / Completed', value: wonJobs, icon: '✅', color: 'bg-white border border-gray-100' },
            { label: 'Win Rate', value: `${winRate}%`, icon: '📈', color: 'bg-amber-50 border border-amber-200' },
          ].map(({ label, value, icon, color }) => (
            <div key={label} className={`${color} rounded-xl p-4 shadow-sm`}>
              <div className="text-2xl mb-1">{icon}</div>
              <div className="text-2xl font-black text-slate-900">{value}</div>
              <div className="text-slate-500 text-xs mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button onClick={() => { setShowForm(true); setSelectedJob(null); }}
            className="bg-amber-400 text-slate-900 font-bold px-5 py-2 rounded-xl hover:bg-amber-300 transition-colors text-sm">
            + Add Job
          </button>
          <button onClick={exportCSV}
            className="bg-white border border-gray-200 text-slate-700 font-bold px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors text-sm">
            📥 Export CSV
          </button>
          <div className="flex gap-2 ml-auto">
            <button onClick={() => setFilter('All')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors ${filter === 'All' ? 'bg-slate-900 text-white' : 'bg-white border border-gray-200 text-slate-600 hover:bg-gray-50'}`}>
              All
            </button>
            {STAGES.map(s => (
              <button key={s} onClick={() => setFilter(s)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors ${filter === s ? 'bg-slate-900 text-white' : 'bg-white border border-gray-200 text-slate-600 hover:bg-gray-50'}`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Pipeline Kanban */}
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-max">
            {STAGES.map(stage => (
              <div key={stage} className="w-72 flex-shrink-0">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${stage === 'Lead' ? 'bg-gray-400' : stage === 'Quoted' ? 'bg-blue-400' : stage === 'Negotiating' ? 'bg-yellow-400' : stage === 'Won' ? 'bg-green-400' : 'bg-slate-700'}`}></span>
                    <span className="font-bold text-slate-700 text-sm">{stage}</span>
                    <span className="bg-gray-100 text-gray-500 text-xs font-bold px-2 py-0.5 rounded-full">
                      {jobs.filter(j => j.stage === stage).length}
                    </span>
                  </div>
                  <span className="text-slate-500 text-xs font-semibold">
                    ${jobs.filter(j => j.stage === stage).reduce((s, j) => s + j.estimatedValue, 0).toLocaleString()}
                  </span>
                </div>
                <div className="space-y-3">
                  {filteredJobs.filter(j => j.stage === stage).length === 0 && (
                    <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-4 text-center text-slate-400 text-xs">
                      No jobs
                    </div>
                  )}
                  {filteredJobs.filter(j => j.stage === stage).map(job => (
                    <div key={job.id}
                      onClick={() => { setSelectedJob(job); setShowForm(false); }}
                      className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-amber-300 cursor-pointer transition-all">
                      <div className="flex items-start justify-between mb-2">
                        <span className="font-bold text-slate-900 text-sm">{job.clientName}</span>
                        <StageBadge stage={job.stage} />
                      </div>
                      <div className="text-slate-500 text-xs mb-1">{job.jobType}</div>
                      <div className="text-lg font-black text-amber-600 mb-1">${job.estimatedValue.toLocaleString()}</div>
                      <div className="text-slate-400 text-xs">{job.phone} · {job.date}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Job Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="bg-slate-900 text-white px-6 py-4 rounded-t-2xl flex items-center justify-between">
              <h2 className="font-black text-lg">Add New Job</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white text-xl">×</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Client Name *</label>
                  <input value={form.clientName} onChange={e => setForm({ ...form, clientName: e.target.value })} placeholder="Full name or business"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Job Type</label>
                  <input value={form.jobType} onChange={e => setForm({ ...form, jobType: e.target.value })} placeholder="e.g. Panel Upgrade, Rewire"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm" />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Phone</label>
                  <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="Phone number"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Email</label>
                  <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Email address"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Job Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Describe the scope of work..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm resize-none" />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Estimated Value ($)</label>
                  <input type="number" value={form.estimatedValue} onChange={e => setForm({ ...form, estimatedValue: Number(e.target.value) })} placeholder="0"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Stage</label>
                  <select value={form.stage} onChange={e => setForm({ ...form, stage: e.target.value as Stage })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm bg-white">
                    {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={addJob} disabled={!form.clientName}
                  className="flex-1 bg-amber-400 text-slate-900 font-bold py-3 rounded-xl hover:bg-amber-300 transition-colors disabled:opacity-40">
                  Save Job
                </button>
                <button onClick={() => setShowForm(false)}
                  className="px-6 bg-gray-100 text-slate-700 font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Job Detail Panel */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={e => e.target === e.currentTarget && setSelectedJob(null)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="bg-slate-900 text-white px-6 py-4 rounded-t-2xl flex items-center justify-between">
              <div>
                <h2 className="font-black text-lg">{selectedJob.clientName}</h2>
                <p className="text-slate-400 text-sm">{selectedJob.jobType}</p>
              </div>
              <div className="flex items-center gap-2">
                <StageBadge stage={selectedJob.stage} />
                <button onClick={() => setSelectedJob(null)} className="text-slate-400 hover:text-white text-xl ml-2">×</button>
              </div>
            </div>
            <div className="p-6 space-y-5">
              {/* Info grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 rounded-xl p-3">
                  <div className="text-xs text-slate-500 font-bold uppercase mb-1">Value</div>
                  <div className="text-xl font-black text-amber-600">${selectedJob.estimatedValue.toLocaleString()}</div>
                </div>
                <div className="bg-slate-50 rounded-xl p-3">
                  <div className="text-xs text-slate-500 font-bold uppercase mb-1">Date Added</div>
                  <div className="text-base font-bold text-slate-900">{selectedJob.date}</div>
                </div>
                <div className="bg-slate-50 rounded-xl p-3">
                  <div className="text-xs text-slate-500 font-bold uppercase mb-1">Phone</div>
                  <div className="text-base font-semibold text-slate-900">{selectedJob.phone || '—'}</div>
                </div>
                <div className="bg-slate-50 rounded-xl p-3">
                  <div className="text-xs text-slate-500 font-bold uppercase mb-1">Email</div>
                  <div className="text-base font-semibold text-slate-900 truncate">{selectedJob.email || '—'}</div>
                </div>
              </div>

              {/* Description */}
              {selectedJob.description && (
                <div>
                  <h3 className="font-bold text-slate-900 text-sm mb-2">Scope of Work</h3>
                  <p className="text-slate-600 text-sm bg-gray-50 rounded-xl p-3">{selectedJob.description}</p>
                </div>
              )}

              {/* Stage Change */}
              <div>
                <h3 className="font-bold text-slate-900 text-sm mb-2">Move to Stage</h3>
                <div className="flex flex-wrap gap-2">
                  {STAGES.map(s => (
                    <button key={s} onClick={() => updateStage(selectedJob.id, s)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${selectedJob.stage === s ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-gray-200 text-slate-600 hover:border-slate-400'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <h3 className="font-bold text-slate-900 text-sm mb-2">Notes & Timeline</h3>
                {selectedJob.notes && (
                  <div className="text-sm text-slate-600 bg-amber-50 rounded-xl p-3 mb-3 whitespace-pre-line">{selectedJob.notes}</div>
                )}
                <div className="flex gap-2">
                  <input id="note-input" placeholder="Add a note..."
                    className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400" />
                  <button onClick={() => {
                    const input = document.getElementById('note-input') as HTMLInputElement;
                    if (input?.value.trim()) { addNote(selectedJob.id, input.value.trim()); input.value = ''; }
                  }}
                    className="bg-amber-400 text-slate-900 font-bold px-4 py-2 rounded-xl hover:bg-amber-300 text-sm">Add Note</button>
                </div>
              </div>

              {/* Timeline */}
              {selectedJob.timeline.length > 0 && (
                <div>
                  <h3 className="font-bold text-slate-900 text-sm mb-2">Activity</h3>
                  <div className="space-y-2">
                    {selectedJob.timeline.slice().reverse().map((t, i) => (
                      <div key={i} className="flex gap-3 items-start">
                        <div className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 flex-shrink-0"></div>
                        <div>
                          <div className="text-sm font-semibold text-slate-700">{t.event}</div>
                          <div className="text-xs text-slate-400">{t.date}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2 border-t border-gray-100">
                {selectedJob.email && (
                  <a href={`mailto:${selectedJob.email}`}
                    className="flex-1 text-center bg-slate-900 text-white font-bold py-2.5 rounded-xl hover:bg-slate-800 transition-colors text-sm">
                    📧 Email Client
                  </a>
                )}
                <button onClick={() => deleteJob(selectedJob.id)}
                  className="px-4 py-2.5 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-colors text-sm">
                  🗑 Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
