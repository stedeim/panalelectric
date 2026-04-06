import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

type EmailType = 'welcome' | 'newsletter' | 're-engagement' | 'referral' | 'seasonal';

interface EmailTemplate {
  id: string;
  type: EmailType;
  name: string;
  subject: string;
  preview: string;
  body: string;
}

interface SavedTemplate extends EmailTemplate {}

const VARIABLES = ['{{first_name}}', '{{business_name}}', '{{service}}', '{{offer}}', '{{link}}'];

const TEMPLATES: Record<EmailType, { label: string; emoji: string; defaultSubject: string; defaultPreview: string; defaultBody: string }> = {
  welcome: {
    label: 'Welcome Sequence',
    emoji: '👋',
    defaultSubject: 'Welcome to {{business_name}} — Here\'s what to expect',
    defaultPreview: 'Thanks for reaching out! Let us introduce ourselves...',
    defaultBody: `Hi {{first_name}},

Thank you for choosing {{business_name}} for your electrical needs!

We wanted to take a moment to say hello and let you know what to expect when you work with us:

✅ Licensed & Insured — Every job, every time
✅ Upfront Pricing — No surprises on your bill
✅ On-Time Promise — We respect your schedule
✅ Clean & Professional — We leave your home as neat as we found it

If you have any questions before your appointment, don't hesitate to reach out:

📞 {{business_phone}}
📧 {{business_email}}

We look forward to working with you!

Warmly,
{{business_name}} Team`,
  },
  newsletter: {
    label: 'Newsletter',
    emoji: '📰',
    defaultSubject: '{{business_name}} News — [Month] Edition',
    defaultPreview: 'Your monthly dose of electrical tips, news & special offers...',
    defaultBody: `Hi {{first_name}},

Welcome to your monthly update from {{business_name}}!

---

THIS MONTH'S TOPIC: [Seasonal electrical tip or safety reminder]

As the [season] approaches, it's a good time to think about your home's electrical system. [Brief tip or advice — 2-3 sentences].

---

JOB SPOTLIGHT: [Brief description of a recent project or service you want to highlight]

---

QUICK TIP: [One actionable tip the reader can do right now]

---

{{offer}}

---

Have a question or need to schedule? Just reply to this email — we read every one.

Until next month,

{{business_name}}
📞 {{business_phone}} | 🌐 {{website}}`,
  },
  're-engagement': {
    label: 'Re-Engagement',
    emoji: '🔔',
    defaultSubject: '{{first_name}}, it\'s been a while — We miss you!',
    defaultPreview: 'Has it really been [time]? Here\'s what\'s new at {{business_name}}...',
    defaultBody: `Hi {{first_name}},

It's been a while since we last worked together — we hope everything is going well!

We wanted to reach out because [season/business news/reason for the email]. Here's what's new at {{business_name}}:

✅ [New service or certification]
✅ [Recent 5-star review or achievement]
✅ [Any special offer or update]

If you or someone you know needs electrical work, we'd love to hear from you again. As a past client, we want to offer you:

{{offer}}

No pressure — just wanted to stay in touch. Reply to this email anytime and we'll get back to you personally.

Take care,
{{business_name}}`,
  },
  referral: {
    label: 'Referral Request',
    emoji: '🎁',
    defaultSubject: '{{first_name}} — You\'ve been such a great customer. Want to spread the word?',
    defaultPreview: 'A small ask: help us help more homeowners like you...',
    defaultBody: `Hi {{first_name}},

We've loved working with you on your {{service}}. Thank you for trusting us with your home!

Here's a small ask: do you know anyone else who might benefit from our services?

If you do, we'd like to offer you something special:

{{offer}}

Here's how it works:
1. Give us the name and contact info of a friend, neighbor, or family member who might need electrical help
2. We'll reach out with a friendly introduction (we never cold-call — we always say you referred them)
3. When they book a job, your reward is on its way!

You can reply to this email or call us directly: {{business_phone}}

Thanks so much — referrals are the biggest compliment a customer can give us.

{{business_name}}`,
  },
  seasonal: {
    label: 'Seasonal Offer',
    emoji: '🏷️',
    defaultSubject: '⚡ {{business_name}} [Season] Special — Don\'t miss out!',
    defaultPreview: '[Season] is here — we have a special offer just for you...',
    defaultBody: `Hi {{first_name}},

{{season}} is here, and your electrical system is working harder than ever!

As a valued client of {{business_name}}, we want to make sure you're getting the most out of your home this {{season}}. That's why we're offering:

{{offer}}

This offer is available for a limited time — book before {{deadline}} to lock it in.

Here's what to do next:
👉 {{link}}
📞 Call us: {{business_phone}}
📧 Reply to this email

Don't wait — spots are filling up fast!

{{business_name}} Team

P.S. If this isn't relevant to you right now, feel free to pass this along to a friend who could use it. We appreciate you!`,
  },
};

function renderEmailPreview(body: string, name: string): string {
  return body
    .replace(/\{\{first_name\}\}/g, name || '{{first_name}}')
    .replace(/\{\{business_name\}\}/g, name || 'Your Business')
    .replace(/\{\{service\}\}/g, 'electrical services')
    .replace(/\{\{offer\}\}/g, '[Your special offer here]')
    .replace(/\{\{link\}\}/g, '[yourwebsite.com/book]')
    .replace(/\{\{business_phone\}\}/g, '(555) 000-0000')
    .replace(/\{\{business_email\}\}/g, 'info@yourbusiness.com')
    .replace(/\{\{website\}\}/g, 'yourbusiness.com')
    .replace(/\{\{season\}\}/g, 'summer')
    .replace(/\{\{deadline\}\}/g, 'June 30')
    .replace(/---/g, '• • •');
}

const BADGE_COLORS: Record<EmailType, string> = {
  welcome: 'bg-blue-100 text-blue-700',
  newsletter: 'bg-slate-100 text-slate-700',
  're-engagement': 'bg-orange-100 text-orange-700',
  referral: 'bg-green-100 text-green-700',
  seasonal: 'bg-purple-100 text-purple-700',
};

export default function EmailMarketingPage() {
  const [activeType, setActiveType] = useState<EmailType>('welcome');
  const [subject, setSubject] = useState('');
  const [previewText, setPreviewText] = useState('');
  const [body, setBody] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [previewName, setPreviewName] = useState('First Name');
  const [savedMsg, setSavedMsg] = useState('');
  const [library, setLibrary] = useState<SavedTemplate[]>([]);
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('mobile');
  const [activeTab, setActiveTab] = useState<'editor' | 'library'>('editor');

  useEffect(() => {
    const saved = localStorage.getItem('ep_emailmarketing');
    if (saved) setLibrary(JSON.parse(saved));
  }, []);

  useEffect(() => {
    const tpl = TEMPLATES[activeType];
    setSubject(tpl.defaultSubject.replace(/\{\{business_name\}\}/g, businessName));
    setPreviewText(tpl.defaultPreview);
    setBody(tpl.defaultBody);
  }, [activeType]);

  useEffect(() => {
    setSubject(prev => prev.replace(/\{\{business_name\}\}/g, businessName));
  }, [businessName]);

  function insertVariable(tag: string) {
    setBody(prev => prev + '\n' + tag);
  }

  function saveTemplate() {
    const newTpl: SavedTemplate = {
      id: Date.now().toString(),
      type: activeType,
      name: `${TEMPLATES[activeType].label} — ${new Date().toLocaleDateString()}`,
      subject,
      preview: previewText,
      body,
    };
    const updated = [newTpl, ...library].slice(0, 50);
    setLibrary(updated);
    localStorage.setItem('ep_emailmarketing', JSON.stringify(updated));
    setSavedMsg('✓ Template saved!');
    setTimeout(() => setSavedMsg(''), 2000);
  }

  function loadTemplate(id: string) {
    const tpl = library.find(t => t.id === id);
    if (tpl) {
      setActiveType(tpl.type);
      setSubject(tpl.subject);
      setPreviewText(tpl.preview);
      setBody(tpl.body);
      setActiveTab('editor');
    }
  }

  function deleteTemplate(id: string) {
    setLibrary(prev => prev.filter(t => t.id !== id));
    localStorage.setItem('ep_emailmarketing', JSON.stringify(library.filter(t => t.id !== id)));
  }

  function sendTest() {
    const renderedBody = renderEmailPreview(body, previewName);
    const fullBody = `Subject: ${subject}\nPreview: ${previewText}\n\n${renderedBody}`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject.replace(/\{\{first_name\}\}/g, previewName).replace(/\{\{business_name\}\}/g, businessName))}&body=${encodeURIComponent(fullBody)}`;
  }

  const renderedBody = renderEmailPreview(body, previewName);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-slate-900 text-white px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <Link to="/dashboard" className="text-slate-400 hover:text-white text-sm">← Dashboard</Link>
          <span className="text-slate-600">|</span>
          <span className="text-2xl">📧</span>
          <div>
            <h1 className="font-black">Email Marketing Templates</h1>
            <p className="text-slate-400 text-sm">Professional email sequences — ready to send</p>
          </div>
        </div>
      </header>

      {/* Type Selector */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex gap-2 flex-wrap">
            {(Object.entries(TEMPLATES) as [EmailType, typeof TEMPLATES[EmailType]][]).map(([key, tpl]) => (
              <button key={key} onClick={() => { setActiveType(key); setActiveTab('editor'); }}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${activeType === key && activeTab === 'editor' ? 'bg-amber-400 text-slate-900' : 'bg-gray-100 text-slate-600 hover:bg-gray-200'}`}>
                {tpl.emoji} {tpl.label}
              </button>
            ))}
            <button onClick={() => setActiveTab('library')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${activeTab === 'library' ? 'bg-amber-400 text-slate-900' : 'bg-gray-100 text-slate-600 hover:bg-gray-200'}`}>
              📚 Library ({library.length})
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'editor' ? (
          <div className="grid lg:grid-cols-5 gap-8">
            {/* Editor */}
            <div className="lg:col-span-3 space-y-5">
              {/* Business Name */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="bg-slate-900 text-white px-5 py-3">
                  <h2 className="font-black text-sm">🏢 Your Business</h2>
                </div>
                <div className="p-5">
                  <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Business Name</label>
                  <input value={businessName} onChange={e => setBusinessName(e.target.value)} placeholder="Your Company Inc."
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm" />
                </div>
              </div>

              {/* Email Fields */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="bg-slate-900 text-white px-5 py-3 flex items-center gap-2">
                  <span className="text-sm">{TEMPLATES[activeType].emoji}</span>
                  <h2 className="font-black text-sm">{TEMPLATES[activeType].label} Template</h2>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ml-auto ${BADGE_COLORS[activeType]}`}>
                    {activeType}
                  </span>
                </div>
                <div className="p-5 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Subject Line</label>
                    <input value={subject} onChange={e => setSubject(e.target.value)}
                      placeholder="Your email subject line..."
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm" />
                    <div className="text-xs text-slate-400 mt-1">{subject.length} chars · {subject.length < 50 ? '⚠️ Consider adding more' : '✓ Good length'}</div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Preview Text</label>
                    <input value={previewText} onChange={e => setPreviewText(e.target.value)}
                      placeholder="Short preview shown in inbox..."
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Email Body</label>
                    <div className="flex gap-1 flex-wrap mb-2">
                      {VARIABLES.map(v => (
                        <button key={v} onClick={() => insertVariable(v)}
                          className="bg-amber-100 text-amber-700 font-bold text-xs px-2 py-1 rounded-lg hover:bg-amber-200 transition-colors">
                          {v}
                        </button>
                      ))}
                    </div>
                    <textarea value={body} onChange={e => setBody(e.target.value)} rows={12}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-mono text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={saveTemplate}
                      className="bg-amber-400 text-slate-900 font-bold py-3 rounded-xl hover:bg-amber-300 transition-colors text-sm">
                      {savedMsg || '💾 Save to Library'}
                    </button>
                    <button onClick={sendTest}
                      className="bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-colors text-sm">
                      📤 Send Test Email
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="lg:col-span-2">
              <div className="sticky top-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs font-bold text-slate-500 uppercase">📱 Email Preview</div>
                  <div className="flex gap-1">
                    <button onClick={() => setViewMode('mobile')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${viewMode === 'mobile' ? 'bg-amber-400 text-slate-900' : 'bg-gray-100 text-slate-600'}`}>
                      📱 Mobile
                    </button>
                    <button onClick={() => setViewMode('desktop')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${viewMode === 'desktop' ? 'bg-amber-400 text-slate-900' : 'bg-gray-100 text-slate-600'}`}>
                      💻 Desktop
                    </button>
                  </div>
                </div>

                {/* Preview Name */}
                <div className="mb-3">
                  <label className="text-xs font-bold text-slate-500 mr-2">Preview as:</label>
                  <input value={previewName} onChange={e => setPreviewName(e.target.value)}
                    className="border border-gray-200 rounded-lg px-3 py-1 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-amber-400 w-32" />
                </div>

                {/* Email Preview */}
                <div className={`mx-auto border border-gray-200 rounded-2xl overflow-hidden shadow-lg bg-white transition-all ${viewMode === 'mobile' ? 'max-w-[375px]' : 'max-w-full'}`}>
                  {/* Email Header */}
                  <div className="bg-slate-900 text-white px-4 py-3 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center text-slate-900 font-black text-xs">⚡</div>
                    <div>
                      <div className="font-black text-sm">{businessName || 'Your Business'}</div>
                      <div className="text-xs text-slate-400">{previewText || 'Email preview text...'}</div>
                    </div>
                  </div>
                  {/* Subject */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="font-black text-slate-900 text-sm">{subject.replace(/\{\{first_name\}\}/g, previewName).replace(/\{\{business_name\}\}/g, businessName)}</div>
                  </div>
                  {/* Body */}
                  <div className="p-4">
                    <div className="text-sm text-slate-700 whitespace-pre-line leading-relaxed font-sans">
                      {renderedBody}
                    </div>
                  </div>
                  {/* Footer */}
                  <div className="bg-gray-50 px-4 py-3 border-t border-gray-100">
                    <div className="text-xs text-slate-400 text-center">
                      {businessName || 'Your Business'} · Unsubscribe
                    </div>
                  </div>
                </div>

                {viewMode === 'mobile' && (
                  <div className="text-center mt-2">
                    <div className="inline-block w-2 h-2 rounded-full bg-gray-300" />
                    <div className="text-xs text-slate-400 mt-1">375px viewport</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Library */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-black text-slate-900 text-lg">📚 Saved Templates ({library.length})</h2>
              <button onClick={() => setActiveTab('editor')}
                className="bg-amber-400 text-slate-900 font-bold px-4 py-2 rounded-xl text-sm hover:bg-amber-300 transition-colors">
                + New Template
              </button>
            </div>
            {library.length === 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                <div className="text-4xl mb-3">📭</div>
                <div className="font-bold text-slate-900 mb-1">No saved templates yet</div>
                <div className="text-slate-500 text-sm mb-4">Create and save templates to build your library</div>
                <button onClick={() => setActiveTab('editor')}
                  className="bg-amber-400 text-slate-900 font-bold px-6 py-3 rounded-xl text-sm hover:bg-amber-300 transition-colors">
                  Start Creating →
                </button>
              </div>
            )}
            {library.map(tpl => (
              <div key={tpl.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="px-5 py-4 flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${BADGE_COLORS[tpl.type]}`}>
                        {TEMPLATES[tpl.type].emoji} {TEMPLATES[tpl.type].label}
                      </span>
                    </div>
                    <div className="font-black text-sm text-slate-900 truncate">{tpl.name}</div>
                    <div className="text-xs text-slate-500 mt-0.5 truncate">Subject: {tpl.subject}</div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => loadTemplate(tpl.id)}
                      className="bg-amber-400 text-slate-900 font-bold px-3 py-2 rounded-xl text-xs hover:bg-amber-300 transition-colors">
                      Open
                    </button>
                    <button onClick={() => deleteTemplate(tpl.id)}
                      className="bg-red-50 text-red-600 font-bold px-3 py-2 rounded-xl text-xs hover:bg-red-100 transition-colors">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
