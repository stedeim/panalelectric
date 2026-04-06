import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface FollowUpStep {
  type: string;
  subject: string;
  body: string;
}

interface LeadGenData {
  // Step 1
  markets: string[];
  otherMarket: string;
  // Step 2
  magnetType: string;
  magnetOffer: string;
  // Step 3
  followUps: FollowUpStep[];
  // Step 4
  channels: string[];
}

const MARKET_OPTIONS = [
  'Residential homeowners',
  'Commercial properties',
  'New construction',
  'EV charger clients',
  'Solar clients',
  'Property managers',
];

const CHANNEL_OPTIONS = [
  { id: 'google-ads', label: 'Google Ads', tip: 'Target "electrician near me" + location keywords. Start with $10-15/day budget. Use call-only ads for immediate leads.' },
  { id: 'facebook', label: 'Facebook / Instagram', tip: 'Run lead gen forms with a free guide offer. Target homeowners 35-65 within 25-mile radius. Retarget website visitors.' },
  { id: 'referrals', label: 'Referrals', tip: 'Ask every client for 2 referrals at job completion. Offer a $25 gift card or service discount per referral.' },
  { id: 'seo', label: 'Local SEO', tip: 'Claim/optimize Google Business Profile. Get 10+ reviews. Publish monthly blog posts about electrical topics in your area.' },
  { id: 'partnerships', label: 'Partnerships', tip: 'Partner with home inspectors, realtors, property managers. Offer 10-15% referral fee. Provide them with referral cards.' },
  { id: 'nextdoor', label: 'Nextdoor', tip: 'Post tips, specials, and behind-the-scenes on Nextdoor. Respond to "recommend an electrician" posts in your neighborhood.' },
];

const FOLLOW_UP_TYPES = [
  { value: 'email-intro', label: 'Email — Introduction', subject: 'Great working with you! [First Name]', body: 'Hi {{first_name}},\n\nIt was great working with you on {{service}}!\n\nI wanted to make sure you have my contact info for any future electrical needs. I specialize in {{service}} and offer free estimates.\n\nDon\'t hesitate to reach out — even for small jobs.\n\nBest,\n{{business_name}}' },
  { value: 'value-email', label: 'Email — Value Add', subject: 'Tip: [Electrical tip related to their job]', body: 'Hi {{first_name}},\n\nSince we just wrapped up your {{service}}, here\'s a quick tip that might help you around the house...\n\n[Insert helpful electrical safety tip or energy-saving advice here]\n\nIf you ever need us again or know anyone who does — we\'re always happy to help.\n\nWarmly,\n{{business_name}}' },
  { value: 'case-study', label: 'Email — Case Study', subject: '[First Name], see what we did for a neighbor', body: 'Hi {{first_name}},\n\nJust finished a similar project in your area — here\'s the story:\n\n[Describe a recent successful job — the problem, your solution, the result]\n\nWe\'d love to help you with your next project too.\n\nCheers,\n{{business_name}}' },
  { value: 'discount', label: 'Email — Discount Offer', subject: '[First Name] — Special offer just for you', body: 'Hi {{first_name}},\n\nAs a valued past client, I\'m offering you {{offer}} on your next service.\n\nJust mention this email when you book and we\'ll apply the discount.\n\nBook here: {{link}}\n\nHope to hear from you soon!\n\n{{business_name}}' },
  { value: 'urgency', label: 'Email — Urgency / Seasonal', subject: '[Seasonal reminder] Time for your electrical checkup', body: 'Hi {{first_name}},\n\nWinter/summer is just around the corner — have you had your electrical system inspected lately?\n\nWe\'re booking up fast. If you\'d like to get on the schedule, reply to this email or call us directly.\n\n{{business_name}}\n{{business_phone}}' },
];

const DEFAULT_FOLLOW_UPS: FollowUpStep[] = [
  { type: 'email-intro', subject: FOLLOW_UP_TYPES[0].subject, body: FOLLOW_UP_TYPES[0].body },
  { type: 'value-email', subject: FOLLOW_UP_TYPES[1].subject, body: FOLLOW_UP_TYPES[1].body },
];

function generateReportHTML(data: LeadGenData): string {
  const markets = [...data.markets, data.otherMarket].filter(Boolean);
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Lead Generation Report — ${new Date().toLocaleDateString()}</title>
<style>
  body { font-family: 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 40px; color: #1a1a2e; background: #f8f9fa; }
  .sheet { max-width: 800px; margin: 0 auto; background: white; padding: 48px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); border-radius: 12px; }
  .header { background: #1D2D44; color: white; padding: 32px; border-radius: 12px 12px 0 0; margin: -48px -48px 40px -48px; }
  h1 { margin: 0; font-size: 28px; font-weight: 900; }
  h2 { font-size: 16px; font-weight: 800; color: #1D2D44; border-bottom: 2px solid #F9B934; padding-bottom: 8px; margin: 32px 0 16px 0; }
  .badge { background: #F9B934; color: #1D2D44; font-weight: 800; font-size: 12px; padding: 4px 12px; border-radius: 100px; }
  .channel-block { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 12px; }
  .channel-name { font-weight: 800; color: #1D2D44; margin-bottom: 4px; }
  .channel-tip { color: #64748b; font-size: 14px; line-height: 1.6; }
  .step { border-left: 3px solid #F9B934; padding-left: 16px; margin-bottom: 20px; }
  .step-type { font-weight: 800; color: #1D2D44; font-size: 14px; margin-bottom: 4px; }
  .step-subject { color: #3b82f6; font-size: 13px; margin-bottom: 6px; }
  .step-body { color: #475569; font-size: 13px; white-space: pre-line; line-height: 1.7; background: #f8fafc; padding: 12px; border-radius: 6px; }
  .footer { text-align: center; color: #94a3b8; font-size: 12px; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; }
</style>
</head>
<body>
<div class="sheet">
  <div class="header">
    <span class="badge">⚡ ElectricianPro</span>
    <h1 style="margin-top:16px">Lead Generation Report</h1>
    <p style="margin:8px 0 0 0; opacity:0.8; font-size:14px">Generated ${new Date().toLocaleDateString()} · Your Complete Lead Funnel Strategy</p>
  </div>

  <h2>🎯 Step 1 — Target Markets</h2>
  ${markets.length > 0 ? `<ul>${markets.map(m => `<li style="margin-bottom:4px;font-size:14px">${m}</li>`).join('')}</ul>` : '<p style="color:#94a3b8;font-size:14px">No markets selected yet</p>'}

  <h2>🧲 Step 2 — Lead Magnet</h2>
  <div class="channel-block">
    <div class="channel-name">Type: ${data.magnetType || 'Not selected'}</div>
    <div style="margin-top:6px;font-size:14px;color:#475569">${data.magnetOffer || 'No offer details added yet'}</div>
  </div>

  <h2>📧 Step 3 — Follow-Up Sequence</h2>
  ${data.followUps.length === 0 ? '<p style="color:#94a3b8;font-size:14px">No follow-up steps added yet</p>' : ''}
  ${data.followUps.map((step, i) => {
    const typeInfo = FOLLOW_UP_TYPES.find(t => t.value === step.type);
    return `<div class="step">
      <div class="step-type">Step ${i + 1}: ${typeInfo?.label || step.type}</div>
      <div class="step-subject">Subject: ${step.subject}</div>
      <div class="step-body">${step.body}</div>
    </div>`;
  }).join('')}

  <h2>📢 Step 4 — Channels</h2>
  ${data.channels.length === 0 ? '<p style="color:#94a3b8;font-size:14px">No channels selected yet</p>' : ''}
  ${data.channels.map(ch => {
    const info = CHANNEL_OPTIONS.find(c => c.id === ch);
    return info ? `<div class="channel-block"><div class="channel-name">${info.label}</div><div class="channel-tip">${info.tip}</div></div>` : '';
  }).join('')}

  <div class="footer">⚡ ElectricianPro · Lead Generation Machine · panalelectricianpro.vercel.app</div>
</div>
</body>
</html>`;
}

export default function LeadGenMachinePage() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<LeadGenData>({
    markets: [],
    otherMarket: '',
    magnetType: 'free-guide',
    magnetOffer: '',
    followUps: [...DEFAULT_FOLLOW_UPS],
    channels: [],
  });
  const [savedMsg, setSavedMsg] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newBody, setNewBody] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('ep_leadgen');
    if (saved) setData(JSON.parse(saved));
  }, []);

  function toggleMarket(m: string) {
    setData(prev => ({
      ...prev,
      markets: prev.markets.includes(m) ? prev.markets.filter(x => x !== m) : [...prev.markets, m],
    }));
  }

  function toggleChannel(id: string) {
    setData(prev => ({
      ...prev,
      channels: prev.channels.includes(id) ? prev.channels.filter(x => x !== id) : [...prev.channels, id],
    }));
  }

  function updateFollowUp(i: number, field: keyof FollowUpStep, val: string) {
    setData(prev => ({
      ...prev,
      followUps: prev.followUps.map((s, idx) => idx === i ? { ...s, [field]: val } : s),
    }));
  }

  function addFollowUp() {
    const subject = newSubject.trim() || 'New follow-up step';
    const body = newBody.trim() || 'Enter your message here...';
    setData(prev => ({
      ...prev,
      followUps: [...prev.followUps, { type: 'value-email', subject, body }],
    }));
    setNewSubject('');
    setNewBody('');
  }

  function removeFollowUp(i: number) {
    setData(prev => ({ ...prev, followUps: prev.followUps.filter((_, idx) => idx !== i) }));
  }

  function saveFunnel() {
    localStorage.setItem('ep_leadgen', JSON.stringify(data));
    setSavedMsg('✓ Funnel saved!');
    setTimeout(() => setSavedMsg(''), 2000);
  }

  function emailFunnel() {
    const markets = [...data.markets, data.otherMarket].filter(Boolean);
    const body = encodeURIComponent(
      `MY LEAD GENERATION FUNNEL\n${'='.repeat(40)}\n\nTARGET MARKETS:\n${markets.join(', ')}\n\nLEAD MAGNET:\nType: ${data.magnetType}\nOffer: ${data.magnetOffer}\n\nFOLLOW-UP SEQUENCE:\n${data.followUps.map((s, i) => `${i + 1}. [${s.type}] ${s.subject}\n${s.body}`).join('\n\n')}\n\nCHANNELS:\n${data.channels.map(ch => CHANNEL_OPTIONS.find(c => c.id === ch)?.label || ch).join(', ')}\n\nGenerated with ElectricianPro`
    );
    window.location.href = `mailto:?subject=${encodeURIComponent(`Lead Generation Funnel — ${new Date().toLocaleDateString()}`)}&body=${body}`;
  }

  function openReport() {
    const html = generateReportHTML(data);
    const win = window.open('', '_blank');
    if (win) { win.document.write(html); win.document.close(); }
  }

  const STEPS = ['Target Markets', 'Lead Magnet', 'Follow-Up Sequence', 'Channels', 'Summary'];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-slate-900 text-white px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <Link to="/dashboard" className="text-slate-400 hover:text-white text-sm">← Dashboard</Link>
          <span className="text-slate-600">|</span>
          <span className="text-2xl">🚀</span>
          <div>
            <h1 className="font-black">Lead Generation Machine</h1>
            <p className="text-slate-400 text-sm">Build your complete lead generation funnel</p>
          </div>
        </div>
      </header>

      {/* Step Progress */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-2">
            {STEPS.map((s, i) => (
              <React.Fragment key={i}>
                <button onClick={() => setStep(i + 1)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
                    step === i + 1 ? 'bg-amber-400 text-slate-900' :
                    step > i + 1 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-slate-500'
                  }`}>
                  <span className="text-base">{step > i + 1 ? '✓' : i + 1}</span>
                  <span className="hidden sm:inline">{s}</span>
                </button>
                {i < STEPS.length - 1 && <div className="w-4 h-0.5 bg-gray-200" />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Step 1: Target Markets */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="bg-slate-900 text-white px-5 py-3">
                <h2 className="font-black text-sm">🎯 Step 1 — Select Your Target Markets</h2>
              </div>
              <div className="p-5">
                <p className="text-slate-500 text-sm mb-4">Choose all markets you want to target with your lead generation funnel:</p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {MARKET_OPTIONS.map(m => (
                    <label key={m} className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${data.markets.includes(m) ? 'border-amber-400 bg-amber-50' : 'border-gray-200 hover:border-gray-300'}`}>
                      <input type="checkbox" checked={data.markets.includes(m)} onChange={() => toggleMarket(m)}
                        className="w-5 h-5 accent-amber-400" />
                      <span className="font-semibold text-slate-900 text-sm">{m}</span>
                    </label>
                  ))}
                </div>
                <div className="mt-4">
                  <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Other target market</label>
                  <input value={data.otherMarket} onChange={e => setData(prev => ({ ...prev, otherMarket: e.target.value }))} placeholder="e.g., Industrial facilities, medical offices..."
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Lead Magnet */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="bg-slate-900 text-white px-5 py-3">
                <h2 className="font-black text-sm">🧲 Step 2 — Lead Magnet Builder</h2>
              </div>
              <div className="p-5 space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2 uppercase">Choose your lead magnet type</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { value: 'free-guide', label: '📖 Free Guide', desc: 'PDF download' },
                      { value: 'checklist', label: '✅ Checklist', desc: 'Printable PDF' },
                      { value: 'calculator', label: '🧮 Calculator', desc: 'Interactive tool' },
                      { value: 'quote-generator', label: '💰 Quote Generator', desc: 'Instant estimate' },
                    ].map(opt => (
                      <button key={opt.value} onClick={() => setData(prev => ({ ...prev, magnetType: opt.value }))}
                        className={`p-3 rounded-xl border-2 text-center transition-all ${data.magnetType === opt.value ? 'border-amber-400 bg-amber-50' : 'border-gray-200 hover:border-gray-300'}`}>
                        <div className="text-lg mb-1">{opt.label.split(' ')[0]}</div>
                        <div className="font-bold text-xs text-slate-900">{opt.label.split(' ').slice(1).join(' ')}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{opt.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Describe your offer</label>
                  <textarea value={data.magnetOffer} onChange={e => setData(prev => ({ ...prev, magnetOffer: e.target.value }))} rows={4}
                    placeholder={data.magnetType === 'free-guide' ? 'e.g., "The Homeowner\'s Complete Electrical Safety Guide — 25 things every homeowner should know about their electrical system"' :
                     data.magnetType === 'checklist' ? 'e.g., "The 15-Point Electrical Panel Inspection Checklist — know if your panel is safe"' :
                     data.magnetType === 'calculator' ? 'e.g., "Instant LED Upgrade Calculator — see how much you\'ll save switching to LED lighting"' :
                     'e.g., "Free Same-Day Quote — get a realistic estimate in under 5 minutes"'}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none" />
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <div className="font-bold text-sm text-amber-800 mb-1">📄 Your Lead Capture Page Will Look Like:</div>
                  <p className="text-sm text-amber-700">
                    {data.magnetOffer ? `"${data.magnetOffer}" — with your contact form asking for name, email, and phone number.` :
                     'Enter your offer above to see the preview...'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Follow-Up Sequence */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between">
                <h2 className="font-black text-sm">📧 Step 3 — Follow-Up Sequence Builder</h2>
                <span className="text-xs text-amber-400 font-bold">{data.followUps.length} steps</span>
              </div>
              <div className="p-5 space-y-5">
                {data.followUps.map((s, i) => (
                  <div key={i} className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="bg-amber-400 text-slate-900 font-black text-xs w-6 h-6 rounded-full flex items-center justify-center">{i + 1}</span>
                        <select value={s.type} onChange={e => updateFollowUp(i, 'type', e.target.value)}
                          className="text-xs font-bold border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-amber-400">
                          {FOLLOW_UP_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>
                      </div>
                      <button onClick={() => removeFollowUp(i)} className="text-red-400 hover:text-red-600 font-bold text-lg">×</button>
                    </div>
                    <div className="mb-2">
                      <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Subject Line</label>
                      <input value={s.subject} onChange={e => updateFollowUp(i, 'subject', e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Email Body</label>
                      <textarea value={s.body} onChange={e => updateFollowUp(i, 'body', e.target.value)} rows={5}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none" />
                    </div>
                  </div>
                ))}

                {/* Add New Step */}
                <div className="border border-dashed border-gray-300 rounded-xl p-4">
                  <div className="font-bold text-sm text-slate-600 mb-2">+ Add a new follow-up step</div>
                  <div className="grid sm:grid-cols-2 gap-2 mb-2">
                    <input value={newSubject} onChange={e => setNewSubject(e.target.value)} placeholder="Subject line..."
                      className="border border-gray-200 rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400" />
                    <select onChange={e => {
                      const found = FOLLOW_UP_TYPES.find(t => t.value === e.target.value);
                      if (found) { setNewSubject(found.subject); setNewBody(found.body); }
                    }}
                      className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400">
                      <option value="">Pick a type...</option>
                      {FOLLOW_UP_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                  <textarea value={newBody} onChange={e => setNewBody(e.target.value)} rows={3} placeholder="Email body..."
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-2 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none" />
                  <button onClick={addFollowUp}
                    className="bg-amber-400 text-slate-900 font-bold px-4 py-2 rounded-xl text-xs hover:bg-amber-300 transition-colors">
                    Add Step
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Channels */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="bg-slate-900 text-white px-5 py-3">
                <h2 className="font-black text-sm">📢 Step 4 — Select Your Channels</h2>
              </div>
              <div className="p-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  {CHANNEL_OPTIONS.map(ch => (
                    <div key={ch.id}
                      onClick={() => toggleChannel(ch.id)}
                      className={`cursor-pointer rounded-xl border-2 p-4 transition-all ${data.channels.includes(ch.id) ? 'border-amber-400 bg-amber-50' : 'border-gray-200 hover:border-gray-300'}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${data.channels.includes(ch.id) ? 'bg-amber-400 border-amber-400' : 'border-gray-300'}`}>
                          {data.channels.includes(ch.id) && <span className="text-slate-900 text-xs font-black">✓</span>}
                        </div>
                        <span className="font-black text-sm text-slate-900">{ch.label}</span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed pl-7">{ch.tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Summary */}
        {step === 5 && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="bg-slate-900 text-white px-5 py-3">
                <h2 className="font-black text-sm">📋 Your Lead Generation Funnel — Summary</h2>
              </div>
              <div className="p-5 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="font-bold text-slate-900 mb-1">🎯 Target Markets</div>
                    <div className="text-slate-600 space-y-1">
                      {[...data.markets, data.otherMarket].filter(Boolean).map(m => <div key={m}>• {m}</div>)}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="font-bold text-slate-900 mb-1">🧲 Lead Magnet</div>
                    <div className="text-slate-600 text-xs">{data.magnetType.replace('-', ' ')}</div>
                    <div className="text-slate-800 font-semibold mt-1 text-xs">{data.magnetOffer || 'No offer set yet'}</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="font-bold text-slate-900 mb-1">📧 Follow-Ups</div>
                    <div className="text-slate-600 text-xs">{data.followUps.length} steps in sequence</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="font-bold text-slate-900 mb-1">📢 Channels</div>
                    <div className="text-slate-600 space-y-1">
                      {data.channels.map(ch => <div key={ch} className="text-xs">• {CHANNEL_OPTIONS.find(c => c.id === ch)?.label || ch}</div>)}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <button onClick={saveFunnel}
                    className="bg-amber-400 text-slate-900 font-bold py-3 rounded-xl hover:bg-amber-300 transition-colors text-sm">
                    {savedMsg || '💾 Save Funnel'}
                  </button>
                  <button onClick={emailFunnel}
                    className="bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-colors text-sm">
                    📧 Email Funnel
                  </button>
                  <button onClick={openReport}
                    className="bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-500 transition-colors text-sm">
                    📄 View Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <button onClick={() => setStep(s => Math.max(1, s - 1))}
            disabled={step === 1}
            className="px-6 py-3 rounded-xl font-bold text-sm text-slate-600 bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-40 transition-colors">
            ← Back
          </button>
          {step < 5 && (
            <button onClick={() => setStep(s => Math.min(5, s + 1))}
              className="bg-amber-400 text-slate-900 font-bold px-6 py-3 rounded-xl hover:bg-amber-300 transition-colors text-sm">
              Next Step →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
