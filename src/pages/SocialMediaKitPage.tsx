import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

type PostType = 'tip' | 'story' | 'reel' | 'case-study' | 'promo';
type Platform = 'facebook' | 'instagram' | 'linkedin' | 'google';

interface Post {
  type: PostType;
  caption: string;
  imageIdea: string;
  bestTime: string;
}

interface MonthlyKit {
  [week: string]: {
    [platform: string]: Post;
  };
}

const POST_TYPES: { value: PostType; label: string; emoji: string; desc: string }[] = [
  { value: 'tip', label: 'Tip', emoji: '💡', desc: 'Educational, builds trust' },
  { value: 'story', label: 'Story', emoji: '📖', desc: 'Behind the scenes' },
  { value: 'reel', label: 'Reel/Video', emoji: '🎬', desc: 'Engaging, algorithm boost' },
  { value: 'case-study', label: 'Case Study', emoji: '📋', desc: 'Proven results, social proof' },
  { value: 'promo', label: 'Promo', emoji: '🏷️', desc: 'Offer, call to action' },
];

const PLATFORMS: { value: Platform; label: string; emoji: string; bestTimes: string[] }[] = [
  { value: 'facebook', label: 'Facebook', emoji: '📘', bestTimes: ['Tue–Thu 10am–12pm', 'Sat 12–3pm'] },
  { value: 'instagram', label: 'Instagram', emoji: '📸', bestTimes: ['Mon–Wed 11am–1pm', 'Fri 10am–12pm'] },
  { value: 'linkedin', label: 'LinkedIn', emoji: '💼', bestTimes: ['Tue–Thu 7–9am', 'Wed 12pm'] },
  { value: 'google', label: 'Google Business', emoji: '🔍', bestTimes: ['Friday 3–5pm', 'Saturday 9am–12pm'] },
];

const WEEKS = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const CAPTION_TEMPLATES: Record<PostType, string[]> = {
  tip: [
    "⚡ Did you know? [Surprising electrical fact]. Knowing this could save you money on your next bill. #ElectricalTips #HomeSafety",
    "💡 Most homeowners don't know this about their electrical panel... [Tip]. What's your experience? Drop it below 👇 #ElectricianLife #HomeTips",
    "🔌 Quick safety check: [Actionable tip]. Takes 2 minutes and could prevent a serious issue. Share this with a homeowner who needs to hear it! #ElectricalSafety",
  ],
  story: [
    "📖 We just wrapped up a job at [Location] and had to [Challenge]. Here's how we solved it... [Brief story]. Great working with [Client]! #BehindTheScenes #ElectricalWork",
    "👷‍♂️ Ever wonder what goes into [Service type]? Here's a quick look at today's project... [Description]. Every job is unique and we're ready for yours! #Electrician",
    "🏠 Another happy customer in [Neighborhood]! [Brief testimonial or outcome]. Check our reviews → [Link]. #CustomerLove #LocalElectrician",
  ],
  'case-study': [
    "📋 Case Study: [Client Type] needed [Problem]. Here's what we did: [Solution steps]. Result: [Outcome]. Ready to solve YOUR electrical challenge? DM us 💬",
    "🏆 Before & After: [Project description]. We transformed [Problem area] into [Solution]. See why [Client type] trust us for their electrical needs. #SuccessStory",
    "📊 Real Results: [Client] called us for [Problem]. 48 hours later: [Result]. Call-to-action: Ready for your own success story? Link in bio! #Electrical",
  ],
  reel: [
    "🎬 POV: You call an electrician for [Common problem]... and we show up ready to solve it! ⚡ Tag someone who needs this! #POV #Electrician #Shorts",
    "⚡ Watch this before you DIY your next electrical project! [Quick tip]. Still want to do it yourself? 😂 Comment below! #DIYFail #ElectricianLife",
    "🏠 We fixed [Problem] in under [Time] today! ⚡ Here's what happened... Follow for more behind-the-scenes electrical content! #Electrician #Service",
  ],
  promo: [
    "🏷️ [Season/Promo] SPECIAL: [Offer details]. For the next [Time period], get [Discount/Incentive] when you mention this post! Limited spots — DM us or call [Number] today!",
    "⚡ [Season] is here — and so is our [Season] special! [Specific offer]. Book before [Date] and [Benefit]. Tag a friend who needs electrical work! #SpecialOffer",
    "🎁 Referral Special: You love us? Share us! Refer a neighbor and we'll both get [Incentive]. It's that simple. DM us to get started! #ReferralProgram",
  ],
};

const PRE_WRITTEN_CAPTIONS: { type: PostType; captions: string[] }[] = [
  {
    type: 'tip',
    captions: [
      "⚡ Never run extension cords under rugs or carpet — it's a serious fire hazard. If you need more outlets, let's talk about a permanent solution.",
      "💡 Switching to LED bulbs can cut your lighting energy use by up to 75%. Simple swap, big savings! #EnergySaving",
      "🔌 If a breaker keeps tripping, don't just flip it back — there's an underlying issue. Call a licensed electrician before it becomes dangerous.",
      "✅ Test your GFCI outlets monthly! Press the TEST button — it should click and cut power. Hit RESET to restore. Takes 10 seconds, saves lives.",
      "⚡ Flickering lights aren't always a bulb issue — they can signal loose wiring or an overloaded circuit. Worth getting checked.",
      "🔌 Surge protectors wear out. If your power strip is more than 5 years old, replace it. And for expensive electronics, whole-home surge protection is worth considering.",
    ],
  },
  {
    type: 'story',
    captions: [
      "📖 Quick story: We got called to a home where the owners smelled burning near their panel. Turned out a connection was loose. Caught it just in time. Always trust your nose — electrical issues often smell before they spark.",
      "👷‍♂️ Behind today's job: Upgrading a 200-amp panel in an older home. These upgrades are more common than you'd think — older panels weren't built for today's power demands.",
      "🏠 Nothing beats a satisfied customer. \"Fixed our outlet issue same day. Professional, clean, fair price.\" — that's the review that keeps us going. Thank you!",
      "📖 We just finished a EV charger installation for a homeowner making the switch to electric. Love being part of the green energy transition! ⚡🚗",
      "👷‍♂️ Monday Motivation: Every job is an opportunity to do it right. Showing up on time, doing clean work, treating your home like our own. That's the standard.",
    ],
  },
  {
    type: 'case-study',
    captions: [
      "📋 Case Study: Property manager called us for 12 units with failing electrical. We did a full audit, replaced aging panels, and upgraded all GFCI protection. Result: Zero service calls in 6 months.",
      "🏆 Before & After: Cracked, outdated fuse box → New 200-amp panel with surge protection. Same home, new level of safety and reliability.",
      "📊 This week's win: Commercial office with chronic breaker trips. Traced it to a miswired subpanel — found the root cause in 45 minutes. Fixed, tested, done. No more surprises.",
      "📋 Real story: Family called us after another electrician couldn't figure out why their kitchen lights flickered. Loose neutral — fixed in under an hour. Sometimes the simple fix is the hardest to find.",
      "🏆 Commercial job complete: Full lighting retrofit for a 5,000 sq ft warehouse. Old metal halide → LED. Client is saving $800/month on energy. That pays for itself fast.",
    ],
  },
  {
    type: 'promo',
    captions: [
      "🏷️ Spring Special: 15% OFF any panel upgrade booked before April 30. Your home's electrical system works hard — give it the upgrade it deserves. DM us to book!",
      "⚡ New to the neighborhood? First-time customers get $50 OFF any service of $300+. Same-day availability. Let's introduce ourselves! Tag a new neighbor 👇",
      "🎁 Referral Program: Refer a neighbor, friend, or family member. When they book with us, you get a $50 credit toward your next service. It's that simple. Ask us how!",
      "⚡ No such thing as a small job to us! Outlet not working? Breaker keeps tripping? We'll diagnose it for just [Service Fee]. Honest assessment, upfront pricing.",
      "🏷️ Weekend Warrior Special: Book any job this Saturday and get priority scheduling. Limited spots — message us to lock in your time! ⚡",
    ],
  },
  {
    type: 'reel',
    captions: [
      "🎬 POV: You call us for a flickering light... and here's what happens next. ⚡ Spoiler: We fix it fast and clean. #POV #Electrician #BehindTheScenes",
      "⚡ Don't try this at home! Here's why you should always call a licensed electrician for panel work... 😅 Safe is better than sorry! #ElectricianLife #SafetyFirst",
      "🎬 3 signs your electrical panel is overdue for an upgrade. Watch this before your next electrical issue! ⚡ #HomeTips #Electrical #Electrician",
      "🏠 We replaced THIS old fuse box with a brand new panel in under 3 hours. ⚡ Watch the transformation! #ElectricalUpgrade #Electrician",
    ],
  },
];

function generateCaption(type: PostType, businessName: string, service: string): string[] {
  return CAPTION_TEMPLATES[type].map(t =>
    t.replace(/\{\{business_name\}\}/g, businessName)
     .replace(/\{\{service\}\}/g, service)
  );
}

const emptyPost = (): Post => ({
  type: 'tip',
  caption: '',
  imageIdea: '',
  bestTime: '10am',
});

export default function SocialMediaKitPage() {
  const [businessName, setBusinessName] = useState('');
  const [service, setService] = useState('');
  const [month, setMonth] = useState(MONTHS[new Date().getMonth()]);
  const [kit, setKit] = useState<MonthlyKit>(() => {
    const k: MonthlyKit = {};
    WEEKS.forEach(w => { k[w] = {}; PLATFORMS.forEach(p => { k[w][p.value] = emptyPost(); }); });
    return k;
  });
  const [savedMsg, setSavedMsg] = useState('');
  const [captionOptions, setCaptionOptions] = useState<string[]>([]);
  const [captionTarget, setCaptionTarget] = useState<{week: string; platform: string} | null>(null);
  const [activePresetTab, setActivePresetTab] = useState<PostType>('tip');

  useEffect(() => {
    const saved = localStorage.getItem('ep_socialmedia');
    if (saved) {
      const parsed = JSON.parse(saved);
      setBusinessName(parsed.businessName || '');
      setService(parsed.service || '');
      setKit(parsed.kit || kit);
    }
  }, []);

  function updatePost(week: string, platform: string, field: keyof Post, val: string) {
    setKit(prev => ({
      ...prev,
      [week]: {
        ...prev[week],
        [platform]: { ...prev[week][platform], [field]: val },
      },
    }));
  }

  function saveKit() {
    localStorage.setItem('ep_socialmedia', JSON.stringify({ businessName, service, kit }));
    setSavedMsg('✓ Kit saved!');
    setTimeout(() => setSavedMsg(''), 2000);
  }

  function openExport() {
    const name = businessName || 'Your Business';
    const svc = service || 'Electrical Services';
    const rows = WEEKS.map(w => `
      <tr>
        <td style="font-weight:800;color:#1D2D44;border:1px solid #e2e8f0;padding:8px;background:#f8fafc" colspan="5">${w}</td>
      </tr>
      ${PLATFORMS.map(p => {
        const post = kit[w]?.[p.value];
        return `
        <tr>
          <td style="border:1px solid #e2e8f0;padding:8px;font-weight:700;color:#1D2D44;font-size:13px">${p.emoji} ${p.label}</td>
          <td style="border:1px solid #e2e8f0;padding:8px;font-size:12px">${post?.type || '-'}</td>
          <td style="border:1px solid #e2e8f0;padding:8px;font-size:12px;max-width:300px">${(post?.caption || '-').replace(/</g, '&lt;')}</td>
          <td style="border:1px solid #e2e8f0;padding:8px;font-size:12px">${post?.imageIdea || '-'}</td>
          <td style="border:1px solid #e2e8f0;padding:8px;font-size:12px">${post?.bestTime || '-'}</td>
        </tr>`;
      }).join('')}
    `).join('');

    const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Social Media Kit — ${name} — ${month}</title>
<style>body{font-family:'Helvetica Neue',Arial;margin:0;padding:40px;background:#f8f9fa} .sheet{max-width:900px;margin:0 auto;background:white;padding:40px;border-radius:12px;box-shadow:0 4px 24px rgba(0,0,0,0.08)} h1{font-size:24px;font-weight:900;color:#1D2D44;margin:0} h2{font-size:16px;color:#1D2D44;border-bottom:2px solid #F9B934;padding-bottom:8px;margin:24px 0 12px} th{background:#1D2D44;color:white;padding:10px;font-size:12px;text-align:left} td{font-size:13px;color:#475569} .footer{text-align:center;color:#94a3b8;font-size:12px;margin-top:32px;padding-top:16px;border-top:1px solid #e2e8f0}</style>
</head><body>
<div class="sheet">
<h1>⚡ ${name} — Social Media Kit</h1>
<p style="color:#64748b;margin:8px 0 0">Services: ${svc} · Month: ${month} · ${new Date().toLocaleDateString()}</p>
<h2>Content Calendar</h2>
<table style="width:100%;border-collapse:collapse;font-size:13px">
<tr><th style="width:100px">Platform</th><th>Type</th><th style="max-width:300px">Caption</th><th>Image Idea</th><th>Best Time</th></tr>
${rows}
</table>
<div class="footer">⚡ ${name} · panalelectricianpro.vercel.app</div>
</div></body></html>`;
    const win = window.open('', '_blank');
    if (win) { win.document.write(html); win.document.close(); }
  }

  function showCaptionOptions(week: string, platform: string) {
    const post = kit[week]?.[platform];
    const type = (post?.type as PostType) || 'tip';
    const options = generateCaption(type, businessName || 'Your Business', service || 'Electrical Services');
    setCaptionOptions(options);
    setCaptionTarget({ week, platform });
  }

  function applyCaption(caption: string) {
    if (!captionTarget) return;
    updatePost(captionTarget.week, captionTarget.platform, 'caption', caption);
    setCaptionOptions([]);
    setCaptionTarget(null);
  }

  const charCount = (week: string, platform: string) => (kit[week]?.[platform]?.caption || '').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-slate-900 text-white px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <Link to="/dashboard" className="text-slate-400 hover:text-white text-sm">← Dashboard</Link>
          <span className="text-slate-600">|</span>
          <span className="text-2xl">📱</span>
          <div>
            <h1 className="font-black">Social Media Kit</h1>
            <p className="text-slate-400 text-sm">4-week content calendar for every platform</p>
          </div>
        </div>
      </header>

      {/* Business + Month */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="bg-slate-900 text-white px-5 py-3">
            <h2 className="font-black text-sm">🏢 Business Info</h2>
          </div>
          <div className="p-5">
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Business Name</label>
                <input value={businessName} onChange={e => setBusinessName(e.target.value)} placeholder="Your Company"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Primary Service</label>
                <input value={service} onChange={e => setService(e.target.value)} placeholder="Electrical services"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Month</label>
                <select value={month} onChange={e => setMonth(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm bg-white">
                  {MONTHS.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="max-w-7xl mx-auto px-6 pb-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between">
            <h2 className="font-black text-sm">📅 {month} Content Calendar</h2>
            <div className="flex gap-2">
              <button onClick={saveKit}
                className="bg-amber-400 text-slate-900 font-bold px-4 py-1.5 rounded-lg text-xs hover:bg-amber-300 transition-colors">
                {savedMsg || '💾 Save Kit'}
              </button>
              <button onClick={openExport}
                className="bg-green-600 text-white font-bold px-4 py-1.5 rounded-lg text-xs hover:bg-green-500 transition-colors">
                📤 Export HTML
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="bg-slate-50">
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase w-32">Week</th>
                  {PLATFORMS.map(p => (
                    <th key={p.value} className="text-left px-3 py-3 text-xs font-bold text-slate-500 uppercase">
                      <div>{p.emoji} {p.label}</div>
                      <div className="font-normal text-slate-400 mt-0.5">{p.bestTimes[0]}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {WEEKS.map(week => (
                  <tr key={week} className="border-t border-gray-100">
                    <td className="px-4 py-3 font-black text-sm text-slate-900 bg-slate-50">{week}</td>
                    {PLATFORMS.map(p => {
                      const post = kit[week]?.[p.value] || emptyPost();
                      const count = charCount(week, p.value);
                      return (
                        <td key={p.value} className="px-2 py-2 align-top border-l border-gray-100">
                          <div className="space-y-2">
                            {/* Post Type */}
                            <select value={post.type} onChange={e => updatePost(week, p.value, 'type', e.target.value)}
                              className="w-full border border-gray-200 rounded-lg px-2 py-1 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-amber-400 bg-white">
                              {POST_TYPES.map(pt => <option key={pt.value} value={pt.value}>{pt.emoji} {pt.label}</option>)}
                            </select>
                            {/* Caption */}
                            <div>
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-bold text-slate-500">Caption</span>
                                <span className={`text-xs ${count > 2200 ? 'text-red-500' : 'text-slate-400'}`}>{count}</span>
                              </div>
                              <textarea value={post.caption} onChange={e => updatePost(week, p.value, 'caption', e.target.value)}
                                rows={4} placeholder={`Write a caption for ${p.label}...`}
                                className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-400 resize-none" />
                            </div>
                            {/* Image Idea */}
                            <div>
                              <span className="text-xs font-bold text-slate-500">🖼️ Image Idea</span>
                              <input value={post.imageIdea} onChange={e => updatePost(week, p.value, 'imageIdea', e.target.value)}
                                placeholder="e.g., Close-up of panel work"
                                className="w-full border border-gray-200 rounded-lg px-2 py-1 text-xs font-semibold mt-1 focus:outline-none focus:ring-1 focus:ring-amber-400" />
                            </div>
                            {/* Best Time + Generate */}
                            <div className="flex gap-1">
                              <input value={post.bestTime} onChange={e => updatePost(week, p.value, 'bestTime', e.target.value)}
                                placeholder="e.g., 10am"
                                className="w-16 border border-gray-200 rounded-lg px-2 py-1 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-amber-400" />
                              <button onClick={() => showCaptionOptions(week, p.value)}
                                className="flex-1 bg-amber-100 text-amber-700 font-bold px-2 py-1 rounded-lg text-xs hover:bg-amber-200 transition-colors">
                                ✨ Generate
                              </button>
                            </div>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Caption Generator Modal */}
        {captionOptions.length > 0 && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl">
              <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between rounded-t-2xl">
                <h3 className="font-black text-sm">✨ 3 Caption Options</h3>
                <button onClick={() => { setCaptionOptions([]); setCaptionTarget(null); }} className="text-slate-400 hover:text-white text-lg font-bold">×</button>
              </div>
              <div className="p-5 space-y-3">
                {captionOptions.map((cap, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-4">
                    <div className="text-xs text-slate-400 mb-2 font-bold uppercase">Option {i + 1}</div>
                    <div className="text-sm text-slate-700 whitespace-pre-line leading-relaxed mb-3">{cap}</div>
                    <button onClick={() => applyCaption(cap)}
                      className="bg-amber-400 text-slate-900 font-bold px-4 py-2 rounded-xl text-xs hover:bg-amber-300 transition-colors">
                      Use This Caption ✓
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Pre-written Captions Library */}
        <div className="mt-8 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="bg-slate-900 text-white px-5 py-3">
            <h2 className="font-black text-sm">📚 Pre-Written Caption Library ({PRE_WRITTEN_CAPTIONS.reduce((s, c) => s + c.captions.length, 0)} captions)</h2>
          </div>
          <div className="p-5">
            <div className="flex gap-2 mb-4 flex-wrap">
              {POST_TYPES.map(pt => (
                <button key={pt.value} onClick={() => setActivePresetTab(pt.value)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${activePresetTab === pt.value ? 'bg-amber-400 text-slate-900' : 'bg-gray-100 text-slate-600 hover:bg-gray-200'}`}>
                  {pt.emoji} {pt.label}
                </button>
              ))}
            </div>
            <div className="space-y-2">
              {(PRE_WRITTEN_CAPTIONS.find(c => c.type === activePresetTab)?.captions || []).map((cap, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-3 flex gap-3 items-start">
                  <div className="text-xs text-slate-400 font-bold mt-1">{String(i + 1).padStart(2, '0')}</div>
                  <div className="text-sm text-slate-700 whitespace-pre-line leading-relaxed flex-1">{cap}</div>
                  <button onClick={() => navigator.clipboard?.writeText(cap)}
                    className="text-xs bg-slate-200 text-slate-700 font-bold px-2 py-1 rounded-lg hover:bg-slate-300 shrink-0">
                    📋 Copy
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
