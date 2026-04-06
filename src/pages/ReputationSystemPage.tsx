import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface ReviewTemplate {
  style: 'casual' | 'professional' | 'urgent';
  subject: string;
  body: string;
}

interface ReputationData {
  businessName: string;
  platforms: string[];
  timing: string;
  templates: ReviewTemplate[];
}

const TEMPLATE_PRESETS: Record<string, ReviewTemplate> = {
  casual_google: {
    style: 'casual',
    subject: 'Hey {{first_name}} — quick favor 🙏',
    body: `Hi {{first_name}},

Thanks so much for having us out for your {{service}}. We really enjoyed working with you!

Quick ask: if you had a good experience, we'd love a quick review on Google. It only takes 30 seconds and it really helps us grow.

Here's the link: https://g.page/r/YOUR_BUSINESS/review

Either way, thanks again and don't hesitate to call if you need anything!

— {{business_name}}`,
  },
  casual_facebook: {
    style: 'casual',
    subject: 'Thanks {{first_name}}! 🙏',
    body: `Hey {{first_name}},

Just wanted to say a big thank you for choosing us for your electrical work. We appreciate you!

If you ever want to share your experience on our Facebook page, we'd be so grateful. It really helps other homeowners find us:

[Facebook Page Link]

Thanks a million!

{{business_name}}`,
  },
  casual_yelp: {
    style: 'casual',
    subject: 'Hope everything\'s great {{first_name}}!',
    body: `Hi {{first_name}},

It's been a few days since we wrapped up your {{service}} — hope everything's been working perfectly!

If you have a moment, we'd love to hear your feedback on Yelp. It only takes a minute and helps us keep helping homeowners like you:

[yelp.com/biz/YOUR_BUSINESS]

Thanks so much!

{{business_name}}`,
  },
  professional_google: {
    style: 'professional',
    subject: 'Your feedback matters — {{business_name}} review request',
    body: `Dear {{first_name}},

Thank you for allowing {{business_name}} to serve your electrical needs. We value every client relationship and are committed to excellence on every job.

Your feedback helps us maintain the quality of service you expect and deserve. If you have a few moments, we would greatly appreciate you sharing your experience on Google:

https://g.page/r/YOUR_BUSINESS/review

If there is anything we can do to improve your experience in the future, please do not hesitate to reach out directly.

Warm regards,
{{business_name}}
{{business_phone}}`,
  },
  professional_facebook: {
    style: 'professional',
    subject: 'We appreciate your business — share your experience?',
    body: `Dear {{first_name}},

Thank you for choosing {{business_name}} for your recent {{service}}. We are grateful for the opportunity to serve you.

We would be honored if you could take a moment to share your experience on our Facebook page. Your review helps other homeowners in the community discover reliable electrical services.

[Facebook Page Link]

Thank you for your time and continued trust in our team.

Sincerely,
{{business_name}}`,
  },
  professional_yelp: {
    style: 'professional',
    subject: 'Your opinion counts — {{business_name}} on Yelp',
    body: `Dear {{first_name}},

Thank you for having {{business_name}} handle your {{service}}. It was our pleasure to serve you.

We kindly ask that you consider sharing your experience on Yelp. Your honest review helps us continue delivering exceptional service to homeowners in our area.

[yelp.com/biz/YOUR_BUSINESS]

Thank you for your support.

{{business_name}}`,
  },
  urgent_google: {
    style: 'urgent',
    subject: '⚡ Last chance to share your experience — {{business_name}}',
    body: `Hi {{first_name}},

Just a quick reminder — we'd love to hear how your {{service}} went! Reviews help small businesses like ours so much.

It only takes 30 seconds:
→ https://g.page/r/YOUR_BUSINESS/review

Thanks a ton!

{{business_name}}`,
  },
  urgent_facebook: {
    style: 'urgent',
    subject: 'Quick review? 🙏 {{business_name}}',
    body: `Hey {{first_name}},

We're reaching out one last time — if you had a great experience with us on your {{service}}, a quick Facebook review would mean the world to our small team!

→ [Facebook Page Link]

Thank you! 🙏

{{business_name}}`,
  },
  urgent_yelp: {
    style: 'urgent',
    subject: 'One minute — help us on Yelp? ⏱️',
    body: `Hi {{first_name}},

Got 60 seconds? We'd be so grateful for a quick Yelp review of your recent {{service}}.

→ [yelp.com/biz/YOUR_BUSINESS]

Thanks so much — we appreciate you!

{{business_name}}`,
  },
};

const TIMING_OPTIONS = [
  { value: '1', label: '1 Day After Job', desc: 'Highest response rate but may feel rushed. Best for urgent/simple jobs.' },
  { value: '3', label: '3 Days After Job', desc: 'Balanced timing. Client has used the work and remembers the experience.' },
  { value: '7', label: '7 Days After Job', desc: 'More thoughtful reviews. Good for larger/complex projects.' },
];

const PLATFORMS = ['Google Reviews', 'Facebook', 'Yelp'];

export default function ReputationSystemPage() {
  const [data, setData] = useState<ReputationData>({
    businessName: '',
    platforms: ['Google Reviews'],
    timing: '3',
    templates: [
      { ...TEMPLATE_PRESETS.casual_google },
      { ...TEMPLATE_PRESETS.professional_google },
      { ...TEMPLATE_PRESETS.urgent_google },
    ],
  });
  const [activeStyle, setActiveStyle] = useState<'casual' | 'professional' | 'urgent'>('casual');
  const [savedMsg, setSavedMsg] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('ep_reputation');
    if (saved) setData(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (data.platforms.length > 0) {
      const platform = data.platforms[0];
      const suffix = platform === 'Google Reviews' ? 'google' : platform.toLowerCase();
      const presets = {
        casual: TEMPLATE_PRESETS[`casual_${suffix}`],
        professional: TEMPLATE_PRESETS[`professional_${suffix}`],
        urgent: TEMPLATE_PRESETS[`urgent_${suffix}`],
      };
      setData(prev => ({
        ...prev,
        templates: [
          { ...presets.casual, style: 'casual' },
          { ...presets.professional, style: 'professional' },
          { ...presets.urgent, style: 'urgent' },
        ],
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.platforms]);

  function togglePlatform(p: string) {
    setData(prev => ({
      ...prev,
      platforms: prev.platforms.includes(p) ? prev.platforms.filter(x => x !== p) : [...prev.platforms, p],
    }));
  }

  function updateTemplate(style: string, field: 'subject' | 'body', val: string) {
    setData(prev => ({
      ...prev,
      templates: prev.templates.map(t => t.style === style ? { ...t, [field]: val } : t),
    }));
  }

  function sendTest(style: 'casual' | 'professional' | 'urgent') {
    const tpl = data.templates.find(t => t.style === style);
    if (!tpl) return;
    const body = encodeURIComponent(tpl.body.replace(/\{\{first_name\}\}/g, 'First Name').replace(/\{\{business_name\}\}/g, data.businessName || 'Your Business').replace(/\{\{service\}\}/g, 'electrical service').replace(/\{\{business_phone\}\}/g, '(555) 000-0000'));
    window.location.href = `mailto:?subject=${encodeURIComponent(tpl.subject.replace(/\{\{first_name\}\}/g, 'First Name').replace(/\{\{business_name\}\}/g, data.businessName || 'Your Business'))}&body=${body}`;
  }

  function saveTemplates() {
    localStorage.setItem('ep_reputation', JSON.stringify(data));
    setSavedMsg('✓ Templates saved!');
    setTimeout(() => setSavedMsg(''), 2000);
  }

  const activeTemplate = data.templates.find(t => t.style === activeStyle)!;

  // Timeline events
  const day = parseInt(data.timing);
  const timeline = [
    { day: 0, label: 'Job Complete', icon: '✅', desc: 'You finish the work. Client pays and is happy.' },
    { day, label: `Review Request (Day ${day})`, icon: '📧', desc: 'Send your review request via email or text based on your timing setting.' },
    { day: day + 2, label: 'Second Reminder', icon: '⏰', desc: 'If no review yet, send a polite follow-up using the "urgent" style template.' },
    { day: day + 7, label: 'Final Check-In', icon: '📞', desc: 'Call or text personally. Many reviewers respond to a direct human connection.' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-slate-900 text-white px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <Link to="/dashboard" className="text-slate-400 hover:text-white text-sm">← Dashboard</Link>
          <span className="text-slate-600">|</span>
          <span className="text-2xl">⭐</span>
          <div>
            <h1 className="font-black">Reputation Management System</h1>
            <p className="text-slate-400 text-sm">Automated 5-star review request builder</p>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Builder */}
          <div className="space-y-6">
            {/* Business Info */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="bg-slate-900 text-white px-5 py-3">
                <h2 className="font-black text-sm">🏢 Your Business</h2>
              </div>
              <div className="p-5">
                <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Business Name</label>
                <input value={data.businessName} onChange={e => setData(prev => ({ ...prev, businessName: e.target.value }))}
                  placeholder="Your Company Inc."
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm" />
              </div>
            </div>

            {/* Platforms */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="bg-slate-900 text-white px-5 py-3">
                <h2 className="font-black text-sm">🔗 Review Platforms</h2>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-3 gap-3">
                  {PLATFORMS.map(p => (
                    <button key={p} onClick={() => togglePlatform(p)}
                      className={`p-3 rounded-xl border-2 text-center transition-all ${data.platforms.includes(p) ? 'border-amber-400 bg-amber-50' : 'border-gray-200 hover:border-gray-300'}`}>
                      <div className="text-2xl mb-1">{p === 'Google Reviews' ? '🔍' : p === 'Facebook' ? '📘' : '🐦'}</div>
                      <div className="font-bold text-xs text-slate-900">{p}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Timing */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="bg-slate-900 text-white px-5 py-3">
                <h2 className="font-black text-sm">⏱️ When to Send</h2>
              </div>
              <div className="p-5">
                <div className="space-y-3">
                  {TIMING_OPTIONS.map(opt => (
                    <label key={opt.value}
                      className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${data.timing === opt.value ? 'border-amber-400 bg-amber-50' : 'border-gray-200 hover:border-gray-300'}`}>
                      <input type="radio" name="timing" value={opt.value} checked={data.timing === opt.value}
                        onChange={() => setData(prev => ({ ...prev, timing: opt.value }))}
                        className="mt-1 accent-amber-400" />
                      <div>
                        <div className="font-bold text-sm text-slate-900">{opt.label}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{opt.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Template Builder */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between">
                <h2 className="font-black text-sm">✉️ Review Request Templates</h2>
              </div>
              <div className="p-5 space-y-4">
                {/* Style Tabs */}
                <div className="grid grid-cols-3 gap-2">
                  {(['casual', 'professional', 'urgent'] as const).map(style => (
                    <button key={style} onClick={() => setActiveStyle(style)}
                      className={`px-3 py-2 rounded-xl font-bold text-xs capitalize transition-colors ${
                        activeStyle === style ? 'bg-amber-400 text-slate-900' : 'bg-gray-100 text-slate-600 hover:bg-gray-200'
                      }`}>
                      {style === 'casual' ? '😀 ' : style === 'professional' ? '💼 ' : '⚡ '}{style}
                    </button>
                  ))}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Subject Line</label>
                  <input value={activeTemplate?.subject || ''} onChange={e => updateTemplate(activeStyle, 'subject', e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Email Body</label>
                  <div className="text-xs text-slate-400 mb-1">Use {'{{first_name}}'}, {'{{business_name}}'}, {'{{service}}'}, {'{{business_phone}}'} as placeholders</div>
                  <textarea value={activeTemplate?.body || ''} onChange={e => updateTemplate(activeStyle, 'body', e.target.value)} rows={8}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none" />
                </div>
                <button onClick={() => sendTest(activeStyle)}
                  className="w-full bg-slate-900 text-white font-bold py-2.5 rounded-xl hover:bg-slate-800 transition-colors text-sm">
                  📤 Send Test Email
                </button>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-gradient-to-br from-amber-50 to-white rounded-2xl border border-amber-200 overflow-hidden">
              <div className="bg-amber-400 text-slate-900 px-5 py-3">
                <h2 className="font-black text-sm">💡 Automation Tips</h2>
              </div>
              <div className="p-5 space-y-3">
                {[
                  { t: 'When to ask', d: 'Ask right after job completion when the customer is satisfied — not when they have a complaint.' },
                  { t: 'How to ask', d: 'In-person: "We\'d love a review if you had a great experience!" Email follow-up with template works for text-shy clients.' },
                  { t: 'What to say', d: 'Keep it short, genuine, and specific. Mention the exact job type ("your EV charger install") so it feels personalized.' },
                  { t: 'Make it easy', d: 'Always include a direct link to your review page. The fewer clicks, the more reviews you\'ll get.' },
                  { t: 'Respond to reviews', d: 'Always reply to every review (positive + negative). It shows professionalism and boosts local SEO.' },
                  { t: 'Stack your approach', d: 'Combine email + text + in-person ask for best results. 3 touches = 3x more reviews.' },
                ].map((tip, i) => (
                  <div key={i} className="flex gap-3">
                    <span className="text-amber-500 font-black text-sm mt-0.5">{(i + 1).toString().padStart(2, '0')}.</span>
                    <div>
                      <div className="font-bold text-sm text-amber-800">{tip.t}</div>
                      <div className="text-xs text-amber-700 leading-relaxed">{tip.d}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={saveTemplates}
              className="w-full bg-amber-400 text-slate-900 font-bold py-3 rounded-xl hover:bg-amber-300 transition-colors text-sm">
              {savedMsg || '💾 Save Templates'}
            </button>
          </div>

          {/* Right: Preview + Timeline */}
          <div className="space-y-6">
            {/* Email Preview */}
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase mb-3">✉️ Email Preview</div>
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="bg-gray-100 border-b border-gray-200 px-4 py-3">
                  <div className="text-xs text-slate-500 space-y-1">
                    <div><span className="font-bold text-slate-700">To:</span> {"{{first_name}}"}@email.com</div>
                    <div><span className="font-bold text-slate-700">Subject:</span> {activeTemplate?.subject?.replace(/\{\{first_name\}\}/g, 'First Name').replace(/\{\{business_name\}\}/g, data.businessName || 'Your Business')}</div>
                  </div>
                </div>
                <div className="p-5">
                  <div className="text-sm text-slate-700 whitespace-pre-line font-mono leading-relaxed">
                    {activeTemplate?.body?.replace(/\{\{first_name\}\}/g, 'First Name').replace(/\{\{business_name\}\}/g, data.businessName || 'Your Business').replace(/\{\{service\}\}/g, 'electrical service').replace(/\{\{business_phone\}\}/g, '(555) 000-0000').replace(/\[([^\]]+)\]\(([^)]+)\)/g, '($1: $2)')}
                  </div>
                </div>
              </div>
            </div>

            {/* Review Request Timeline */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="bg-slate-900 text-white px-5 py-3">
                <h2 className="font-black text-sm">📅 Automated Review Schedule</h2>
              </div>
              <div className="p-5">
                <div className="relative">
                  {/* Vertical line */}
                  <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200" />
                  <div className="space-y-5">
                    {timeline.map((event, i) => (
                      <div key={i} className="flex gap-4 relative">
                        <div className="relative z-10 w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm shrink-0">
                          {event.icon}
                        </div>
                        <div className="pt-1">
                          <div className="font-bold text-sm text-slate-900">{event.label}</div>
                          <div className="text-xs text-slate-500 mt-0.5 leading-relaxed">{event.desc}</div>
                          {i < timeline.length - 1 && (
                            <div className="text-xs text-amber-500 font-bold mt-1">↓ {event.day > timeline[i+1].day ? `${timeline[i+1].day - event.day} days later` : 'Next step'}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Platform Quick Links */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="bg-slate-900 text-white px-5 py-3">
                <h2 className="font-black text-sm">🔗 Your Review Links</h2>
              </div>
              <div className="p-5 space-y-3">
                {data.platforms.map(p => (
                  <div key={p} className="bg-gray-50 rounded-xl p-3">
                    <div className="font-bold text-xs text-slate-700 mb-1">{p}</div>
                    <input
                      defaultValue={
                        p === 'Google Reviews' ? 'https://g.page/r/YOUR_BUSINESS/review' :
                        p === 'Facebook' ? 'https://facebook.com/YOUR_PAGE/reviews' :
                        'https://yelp.com/biz/YOUR_BUSINESS'
                      }
                      className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-400"
                      readOnly
                      onClick={e => (e.target as HTMLInputElement).select()} />
                  </div>
                ))}
                <p className="text-xs text-slate-400">Click to select, then paste your actual review link</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
