import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

type ProgramTab = 'referral' | 'partner';

interface ReferralData {
  rewardType: 'fixed' | 'percent';
  rewardAmount: string;
  message: string;
  askMethod: string;
}

interface PartnerData {
  partnerTypes: string[];
  commissionType: 'percent' | 'flat';
  commissionAmount: string;
  introEmail: string;
}

const PARTNER_TYPES = [
  { id: 'builders', label: 'Builders & Contractors', emoji: '🏗️' },
  { id: 'property-managers', label: 'Property Managers', emoji: '🏢' },
  { id: 'realtors', label: 'Realtors', emoji: '🏠' },
  { id: 'other-electricians', label: 'Other Electricians', emoji: '⚡' },
  { id: 'home-inspectors', label: 'Home Inspectors', emoji: '🔍' },
  { id: 'insurance-agents', label: 'Insurance Agents', emoji: '🛡️' },
];

const ASK_METHODS = [
  { value: 'in-person', label: 'In-Person', desc: 'Ask right after job completion when satisfied', emoji: '💬' },
  { value: 'text', label: 'Text Message', desc: 'Send a polite follow-up text with your request', emoji: '📱' },
  { value: 'email', label: 'Email', desc: 'Include in your post-job follow-up email sequence', emoji: '📧' },
  { value: 'invoice', label: 'On Invoice', desc: 'Add a referral slip or QR code to your invoices', emoji: '🧾' },
];

const DEFAULT_REFERRAL_MSG = `Hi {{first_name}},

Thanks so much for choosing us for your electrical work!

If you had a great experience, I'd love to ask a small favor: do you know anyone else who might need an electrician?

For every referral that books with us, I'll give you [REWARD DETAILS]. No obligation — just a genuine recommendation.

Here's how to refer someone:
• Reply to this email with their name and number
• Or text/call me directly: [YOUR PHONE]

Either way, thank you for thinking of us!

{{business_name}}
[PHONE NUMBER]`;

const DEFAULT_INTRO_EMAIL = `Hi [Partner Name],

My name is [Your Name] and I'm the owner of [{{business_name}}], a licensed electrical contracting company serving [Your City/Region].

I'm reaching out because I'm building a network of trusted trade professionals who refer each other work.

Here's how my referral partnership works:

✅ You refer your clients to me when they need electrical work
✅ I give you a professional referral — I never cold-call your clients directly
✅ You earn [commission/reward] for every confirmed referral
✅ There's no cost or obligation to you

Would you be open to a quick 10-minute call to discuss how we can work together?

Thanks for your time!

Best regards,
[Your Name]
[{{business_name}}]
[PHONE] | [EMAIL]`;

function generateReferralCardHTML(data: ReferralData, businessName: string): string {
  const reward = data.rewardType === 'fixed' ? `$${data.rewardAmount}` : `${data.rewardAmount}% off`;
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Referral Card</title><style>
  body{font-family:'Helvetica Neue',Arial;margin:0;padding:20px;background:#f0f0f0}
  .card{width:3.5in;min-height:2in;background:#1D2D44;color:white;border-radius:16px;padding:24px;margin:0 auto;box-shadow:0 8px 32px rgba(0,0,0,0.15)}
  .name{font-size:20px;font-weight:900;margin-bottom:4px}
  .tagline{font-size:11px;color:#F9B934;font-weight:700;margin-bottom:16px;letter-spacing:1px;text-transform:uppercase}
  .reward{background:#F9B934;color:#1D2D44;border-radius:12px;padding:12px;margin-bottom:16px;text-align:center}
  .reward-label{font-size:10px;font-weight:800;text-transform:uppercase;margin-bottom:2px}
  .reward-amount{font-size:24px;font-weight:900}
  .info{font-size:12px;line-height:1.6;color:rgba(255,255,255,0.8)}
  .contact{margin-top:12px;border-top:1px solid rgba(255,255,255,0.2);padding-top:12px;font-size:11px}
  @media print{body{background:white}.card{box-shadow:none;margin:0}}
</style></head><body>
<div class="card">
  <div class="name">${businessName || 'Your Business'}</div>
  <div class="tagline">⚡ Licensed Electrical Contractor</div>
  <div class="reward">
    <div class="reward-label">Refer a Friend, Earn</div>
    <div class="reward-amount">${reward}</div>
  </div>
  <div class="info">Know someone who needs electrical work? We make it worth your while. No obligation — just a quick referral.</div>
  <div class="contact">Call: (555) 000-0000</div>
</div>
</body></html>`;
}

function generatePartnerKitHTML(partnerData: PartnerData, referralData: ReferralData, businessName: string): string {
  const reward = referralData.rewardType === 'fixed' ? `$${referralData.rewardAmount}` : `${referralData.rewardAmount}% off`;
  const commission = partnerData.commissionType === 'percent' ? `${partnerData.commissionAmount}% of job value` : `$${partnerData.commissionAmount} flat fee per referral`;
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Partner Kit — ${businessName}</title><style>
  body{font-family:'Helvetica Neue',Arial;margin:0;padding:40px;background:#f8f9fa}
  .page{max-width:800px;margin:0 auto;background:white;padding:48px;border-radius:12px;box-shadow:0 4px 24px rgba(0,0,0,0.08)}
  h1{font-size:28px;font-weight:900;color:#1D2D44;margin:0 0 4px 0}
  h2{font-size:16px;font-weight:800;color:#1D2D44;border-bottom:2px solid #F9B934;padding-bottom:8px;margin:32px 0 16px 0}
  .section{background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:20px;margin-bottom:16px}
  .section-title{font-weight:800;font-size:14px;color:#1D2D44;margin-bottom:8px}
  p{font-size:14px;line-height:1.7;color:#475569;white-space:pre-line}
  .referral-card{background:#1D2D44;color:white;border-radius:16px;padding:24px;text-align:center;margin:24px 0}
  .card-name{font-size:22px;font-weight:900;margin-bottom:4px}
  .card-reward{background:#F9B934;color:#1D2D44;border-radius:12px;padding:12px;margin:16px 0;font-size:18px;font-weight:900}
  .footer{text-align:center;color:#94a3b8;font-size:12px;margin-top:40px;padding-top:20px;border-top:1px solid #e2e8f0}
  table{width:100%;border-collapse:collapse;font-size:13px}
  td{padding:8px 12px;border:1px solid #e2e8f0}
  .tip{background:#FFF8E1;border:1px solid #FFE082;border-radius:8px;padding:12px 16px;margin-top:16px;font-size:13px;color:#5D4037}
  .partner-list{list-style:none;padding:0;margin:0}
  .partner-list li{font-size:14px;padding:4px 0;color:#475569}
</style></head><body>
<div class="page">
  <h1>⚡ Partner Program Kit</h1>
  <p style="color:#64748b;margin:8px 0 0;font-size:14px">${businessName} · ${new Date().toLocaleDateString()}</p>
  <h2>🤝 Partner Types</h2>
  <div class="section"><div class="section-title">We partner with:</div>
    <ul class="partner-list">${partnerData.partnerTypes.map(t => {
      const found = PARTNER_TYPES.find(pt => pt.id === t);
      return `<li>${found ? `${found.emoji} ${found.label}` : t}</li>`;
    }).join('')}</ul>
  </div>
  <h2>💰 Partnership Offer</h2>
  <div class="section">
    <div class="section-title">Commission Structure</div>
    <table>
      <tr><td style="background:#f8fafc;font-weight:700;color:#1D2D44">Per Referral Reward</td><td>${commission}</td></tr>
      <tr><td style="background:#f8fafc;font-weight:700;color:#1D2D44">Payment Timing</td><td>Upon client booking confirmation</td></tr>
      <tr><td style="background:#f8fafc;font-weight:700;color:#1D2D44">Tracking Method</td><td>Unique referral code per partner</td></tr>
    </table>
  </div>
  <h2>✉️ Introduction Email Template</h2>
  <div class="section"><div class="section-title">Send this to potential partners:</div><p>${partnerData.introEmail.replace(/</g, '&lt;')}</p></div>
  <h2>🏷️ Client Referral Card</h2>
  <div class="referral-card">
    <div class="card-name">${businessName}</div>
    <div class="card-reward">Refer a friend → ${reward}</div>
    <div style="font-size:13px;color:rgba(255,255,255,0.8)">Know someone who needs electrical work? Tell them about us!</div>
  </div>
  <h2>📊 Referral Tracking System</h2>
  <div class="section">
    <div class="section-title">How tracking works:</div>
    <table>
      <tr><td style="background:#f8fafc;font-weight:700;color:#1D2D44">1. Assign</td><td>Give each partner a unique referral code (e.g., "JM2024")</td></tr>
      <tr><td style="background:#f8fafc;font-weight:700;color:#1D2D44">2. Track</td><td>Client mentions code at booking — log it in your CRM</td></tr>
      <tr><td style="background:#f8fafc;font-weight:700;color:#1D2D44">3. Confirm</td><td>Once client books and pays deposit, pay partner their reward</td></tr>
      <tr><td style="background:#f8fafc;font-weight:700;color:#1D2D44">4. Thank</td><td>Send thank-you note and update partner on rewards earned</td></tr>
    </table>
    <div class="tip">💡 Pro tip: Send partners monthly updates on referrals and earnings. Keep the relationship warm!</div>
  </div>
  <div class="footer">⚡ ${businessName} · Partner Program · panalelectricianpro.vercel.app</div>
</div>
</body></html>`;
}

export default function ReferralPartnerPage() {
  const [tab, setTab] = useState<ProgramTab>('referral');
  const [businessName, setBusinessName] = useState('');
  const [savedMsg, setSavedMsg] = useState('');
  const [referral, setReferral] = useState<ReferralData>({
    rewardType: 'fixed',
    rewardAmount: '25',
    message: DEFAULT_REFERRAL_MSG,
    askMethod: 'email',
  });
  const [partner, setPartner] = useState<PartnerData>({
    partnerTypes: ['builders', 'realtors'],
    commissionType: 'percent',
    commissionAmount: '10',
    introEmail: DEFAULT_INTRO_EMAIL,
  });
  const [showCard, setShowCard] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('ep_referral');
    if (saved) {
      const parsed = JSON.parse(saved);
      setReferral(parsed.referral || referral);
      setPartner(parsed.partner || partner);
      setBusinessName(parsed.businessName || '');
    }
  }, []);

  function saveProgram() {
    localStorage.setItem('ep_referral', JSON.stringify({ referral, partner, businessName }));
    setSavedMsg('✓ Program saved!');
    setTimeout(() => setSavedMsg(''), 2000);
  }

  function openPartnerKit() {
    const html = generatePartnerKitHTML(partner, referral, businessName || 'Your Business');
    const win = window.open('', '_blank');
    if (win) { win.document.write(html); win.document.close(); }
  }

  function openReferralCard() {
    const html = generateReferralCardHTML(referral, businessName || 'Your Business');
    const win = window.open('', '_blank');
    if (win) { win.document.write(html); win.document.close(); }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-slate-900 text-white px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <Link to="/dashboard" className="text-slate-400 hover:text-white text-sm">← Dashboard</Link>
          <span className="text-slate-600">|</span>
          <span className="text-2xl">🤝</span>
          <div>
            <h1 className="font-black">Referral & Partner Program</h1>
            <p className="text-slate-400 text-sm">Build systems that bring in referrals on autopilot</p>
          </div>
        </div>
      </header>

      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex gap-2">
            <button onClick={() => setTab('referral')}
              className={`px-6 py-2 rounded-xl font-bold text-sm transition-colors ${tab === 'referral' ? 'bg-amber-400 text-slate-900' : 'bg-gray-100 text-slate-600 hover:bg-gray-200'}`}>
              🎁 Referral Program
            </button>
            <button onClick={() => setTab('partner')}
              className={`px-6 py-2 rounded-xl font-bold text-sm transition-colors ${tab === 'partner' ? 'bg-amber-400 text-slate-900' : 'bg-gray-100 text-slate-600 hover:bg-gray-200'}`}>
              🏗️ Partner Program
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {tab === 'referral' && (
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="bg-slate-900 text-white px-5 py-3"><h2 className="font-black text-sm">🏢 Your Business</h2></div>
                <div className="p-5">
                  <input value={businessName} onChange={e => setBusinessName(e.target.value)} placeholder="Your Company Inc."
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm" />
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="bg-slate-900 text-white px-5 py-3"><h2 className="font-black text-sm">🎁 Referral Reward Setup</h2></div>
                <div className="p-5 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-2 uppercase">Reward Type</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => setReferral(prev => ({ ...prev, rewardType: 'fixed' }))}
                        className={`p-3 rounded-xl border-2 text-center transition-all ${referral.rewardType === 'fixed' ? 'border-amber-400 bg-amber-50' : 'border-gray-200'}`}>
                        <div className="text-lg mb-1">💵</div><div className="font-bold text-sm text-slate-900">Fixed Amount</div><div className="text-xs text-slate-500">e.g., $25 gift card</div>
                      </button>
                      <button onClick={() => setReferral(prev => ({ ...prev, rewardType: 'percent' }))}
                        className={`p-3 rounded-xl border-2 text-center transition-all ${referral.rewardType === 'percent' ? 'border-amber-400 bg-amber-50' : 'border-gray-200'}`}>
                        <div className="text-lg mb-1">🏷️</div><div className="font-bold text-sm text-slate-900">% Discount</div><div className="text-xs text-slate-500">e.g., 10% off next job</div>
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">{referral.rewardType === 'fixed' ? 'Reward Amount ($)' : 'Discount %'}</label>
                    <input type="number" value={referral.rewardAmount} onChange={e => setReferral(prev => ({ ...prev, rewardAmount: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm" />
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
                    <div className="text-sm font-bold text-amber-800">
                      {referral.rewardType === 'fixed' ? `$${referral.rewardAmount} gift card or cash per referral` : `${referral.rewardAmount}% discount on next service per referral`}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="bg-slate-900 text-white px-5 py-3"><h2 className="font-black text-sm">💬 Referral Message Template</h2></div>
                <div className="p-5 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-2 uppercase">Where to Ask</label>
                    <div className="grid grid-cols-1 gap-2">
                      {ASK_METHODS.map(m => (
                        <label key={m.value}
                          className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${referral.askMethod === m.value ? 'border-amber-400 bg-amber-50' : 'border-gray-200 hover:border-gray-300'}`}>
                          <input type="radio" name="askMethod" value={m.value} checked={referral.askMethod === m.value}
                            onChange={() => setReferral(prev => ({ ...prev, askMethod: m.value }))}
                            className="mt-0.5 accent-amber-400" />
                          <div>
                            <div className="font-bold text-sm text-slate-900">{m.emoji} {m.label}</div>
                            <div className="text-xs text-slate-500">{m.desc}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Referral Message</label>
                    <div className="text-xs text-slate-400 mb-1">Use {'{{first_name}}'}, {'{{business_name}}'}, [REWARD DETAILS] as placeholders</div>
                    <textarea value={referral.message} onChange={e => setReferral(prev => ({ ...prev, message: e.target.value }))} rows={8}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none" />
                  </div>
                </div>
              </div>

              <button onClick={saveProgram}
                className="w-full bg-amber-400 text-slate-900 font-bold py-3 rounded-xl hover:bg-amber-300 transition-colors text-sm">
                {savedMsg || '💾 Save Program'}
              </button>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between">
                  <h2 className="font-black text-sm">🏷️ Referral Card Generator</h2>
                  <button onClick={() => setShowCard(!showCard)} className="text-xs text-amber-400 font-bold hover:text-amber-300">
                    {showCard ? 'Hide' : 'Preview'}
                  </button>
                </div>
                <div className="p-5">
                  <p className="text-slate-500 text-xs mb-4">Printable referral card to hand to clients or include with invoices.</p>
                  <button onClick={openReferralCard}
                    className="w-full bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-500 transition-colors text-sm mb-4">
                    🖨️ Open Printable Referral Card
                  </button>
                  {showCard && (
                    <div className="bg-slate-900 rounded-2xl p-5 text-white text-center">
                      <div className="text-xl font-black mb-1">{businessName || 'Your Business'}</div>
                      <div className="text-xs text-amber-400 font-bold uppercase tracking-wider mb-4">⚡ Licensed Electrical Contractor</div>
                      <div className="bg-amber-400 text-slate-900 rounded-xl p-4 mb-4">
                        <div className="text-xs font-bold uppercase mb-1">Refer a Friend, Earn</div>
                        <div className="text-2xl font-black">
                          {referral.rewardType === 'fixed' ? `$${referral.rewardAmount}` : `${referral.rewardAmount}% off`}
                        </div>
                      </div>
                      <div className="text-xs text-slate-400">Know someone who needs electrical work?</div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gradient-to-br from-amber-50 to-white rounded-2xl border border-amber-200 overflow-hidden">
                <div className="bg-amber-400 text-slate-900 px-5 py-3"><h2 className="font-black text-sm">💡 How to Get More Referrals</h2></div>
                <div className="p-5 space-y-3">
                  {[
                    { t: 'Ask at the right moment', d: 'Right after job completion when the customer is happy.' },
                    { t: 'Make it specific', d: '"Do you know anyone else who might need an electrician?" beats vague "spread the word."' },
                    { t: 'Give first', d: 'Offer your referral reward proactively before asking.' },
                    { t: 'Follow up in writing', d: 'After asking in-person, send the referral message via email or text.' },
                    { t: 'Track everything', d: 'Log every referral in your CRM. Thank every referrer personally.' },
                    { t: 'Make it a habit', d: 'Ask every single client, every single time. Referrals compound!' },
                  ].map((tip, i) => (
                    <div key={i} className="flex gap-3">
                      <span className="text-amber-500 font-black text-sm mt-0.5">{i + 1}.</span>
                      <div>
                        <div className="font-bold text-sm text-amber-800">{tip.t}</div>
                        <div className="text-xs text-amber-700 leading-relaxed">{tip.d}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'partner' && (
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="bg-slate-900 text-white px-5 py-3"><h2 className="font-black text-sm">🏗️ Partner Types</h2></div>
                <div className="p-5">
                  <div className="grid grid-cols-2 gap-3">
                    {PARTNER_TYPES.map(pt => (
                      <label key={pt.id}
                        className={`flex items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all ${partner.partnerTypes.includes(pt.id) ? 'border-amber-400 bg-amber-50' : 'border-gray-200'}`}>
                        <input type="checkbox" checked={partner.partnerTypes.includes(pt.id)}
                          onChange={() => setPartner(prev => ({
                            ...prev,
                            partnerTypes: prev.partnerTypes.includes(pt.id) ? prev.partnerTypes.filter(x => x !== pt.id) : [...prev.partnerTypes, pt.id],
                          }))}
                          className="accent-amber-400" />
                        <span className="text-sm">{pt.emoji}</span>
                        <span className="font-semibold text-xs text-slate-900">{pt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="bg-slate-900 text-white px-5 py-3"><h2 className="font-black text-sm">💰 Partnership Offer</h2></div>
                <div className="p-5 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-2 uppercase">Commission Type</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => setPartner(prev => ({ ...prev, commissionType: 'percent' }))}
                        className={`p-3 rounded-xl border-2 text-center transition-all ${partner.commissionType === 'percent' ? 'border-amber-400 bg-amber-50' : 'border-gray-200'}`}>
                        <div className="font-bold text-sm text-slate-900">% of Job Value</div><div className="text-xs text-slate-500">Better for bigger jobs</div>
                      </button>
                      <button onClick={() => setPartner(prev => ({ ...prev, commissionType: 'flat' }))}
                        className={`p-3 rounded-xl border-2 text-center transition-all ${partner.commissionType === 'flat' ? 'border-amber-400 bg-amber-50' : 'border-gray-200'}`}>
                        <div className="font-bold text-sm text-slate-900">Flat Fee</div><div className="text-xs text-slate-500">Predictable income</div>
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">
                      {partner.commissionType === 'percent' ? 'Commission % per Referral' : 'Flat Fee ($ per Referral)'}
                    </label>
                    <input type="number" value={partner.commissionAmount} onChange={e => setPartner(prev => ({ ...prev, commissionAmount: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm" />
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
                    <div className="text-sm font-bold text-green-800">
                      {partner.commissionType === 'percent' ? `${partner.commissionAmount}% of the job total per referral` : `$${partner.commissionAmount} per confirmed referral`}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="bg-slate-900 text-white px-5 py-3"><h2 className="font-black text-sm">✉️ Partner Introduction Email</h2></div>
                <div className="p-5">
                  <div className="text-xs text-slate-400 mb-2">Personalize this email template for outreach. Replace [brackets] with your actual info.</div>
                  <textarea value={partner.introEmail} onChange={e => setPartner(prev => ({ ...prev, introEmail: e.target.value }))} rows={10}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none" />
                </div>
              </div>

              <button onClick={saveProgram}
                className="w-full bg-amber-400 text-slate-900 font-bold py-3 rounded-xl hover:bg-amber-300 transition-colors text-sm">
                {savedMsg || '💾 Save Program'}
              </button>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="bg-slate-900 text-white px-5 py-3"><h2 className="font-black text-sm">📦 Partner Kit Generator</h2></div>
                <div className="p-5 space-y-4">
                  <p className="text-slate-500 text-xs">Complete partner kit — intro email, referral card, commission structure & tracking guide.</p>
                  <div className="bg-gray-50 rounded-xl p-3 space-y-1">
                    {['Partner types & ideal partners', 'Commission structure', 'Introduction email template', 'Printable referral card', 'Referral tracking guide'].map((item, i) => (
                      <div key={i} className="text-xs text-slate-500 flex gap-2"><span>✓</span><span>{item}</span></div>
                    ))}
                  </div>
                  <button onClick={openPartnerKit}
                    className="w-full bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-500 transition-colors text-sm">
                    🖨️ Generate Partner Kit
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="bg-slate-900 text-white px-5 py-3"><h2 className="font-black text-sm">📊 Referral Tracking System</h2></div>
                <div className="p-5 space-y-4">
                  {[
                    { step: '1. Assign a Code', desc: 'Give each partner a unique referral code (e.g., "SARAH2024"). Log it in your CRM.', icon: '🏷️' },
                    { step: '2. Client Mentions Code', desc: 'When someone books, they mention the partner\'s code. Log it immediately.', icon: '📞' },
                    { step: '3. Confirm & Pay', desc: 'Once client books AND deposits, pay partner their reward within 7 days.', icon: '💰' },
                    { step: '4. Keep Warm', desc: 'Send monthly updates on referrals, earnings, and new services.', icon: '🔥' },
                  ].map((item, i) => (
                    <div key={i} className="flex gap-3">
                      <span className="text-2xl">{item.icon}</span>
                      <div>
                        <div className="font-bold text-sm text-slate-900">{item.step}</div>
                        <div className="text-xs text-slate-500 leading-relaxed">{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-5 text-white">
                <div className="font-black text-sm mb-3">⚡ Partner Program Quick-Start Checklist</div>
                {[
                  'Define your commission structure',
                  'List 5 potential partners in your area',
                  'Personalize the intro email template',
                  'Create a unique referral code per partner',
                  'Send your first outreach email this week',
                  'Set a recurring monthly reminder to check in',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 py-2 border-b border-slate-700 last:border-0">
                    <div className="w-6 h-6 rounded-full border-2 border-amber-400 flex items-center justify-center shrink-0">
                      <span className="text-amber-400 text-xs font-black">{i + 1}</span>
                    </div>
                    <span className="text-sm text-slate-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
