import React from "react";
import { Link } from "react-router-dom";

const DOCS = [
  { name: "Residential Proposal Template", emoji: "📄", tier: "t1", desc: "Win more jobs with a professional, clear proposal." },
  { name: "Change Order Form", emoji: "🔄", tier: "t1", desc: "Protect yourself when the scope changes on a job." },
  { name: "Client Communication Templates", emoji: "💬", tier: "t1", desc: "Professional texts and emails for every situation." },
  { name: "Commercial Bid Proposal", emoji: "📁", tier: "t2", desc: "Professional bid format for commercial projects." },
  { name: "Master Electrical Service Agreement", emoji: "📜", tier: "t2", desc: "Protect your business with every signature." },
  { name: "Commercial Maintenance Agreement", emoji: "🔧", tier: "t2", desc: "Set up recurring revenue with maintenance clients." },
  { name: "Subcontractor Agreement", emoji: "🤝", tier: "t2", desc: "Clean contracts for the subs you hire." },
  { name: "NEC 2023 Update Summary", emoji: "📖", tier: "t2", desc: "Stay code-compliant with the latest NEC changes." },
  { name: "Google Local SEO Guide", emoji: "🔍", tier: "t2", desc: "Get found on Google Maps and in AI search." },
  { name: "Hiring & Onboarding Kit", emoji: "🧑‍🔧", tier: "t2", desc: "Hire, onboard, and train employees properly." },
  { name: "Lead Generation Machine", emoji: "🚀", tier: "t3", desc: "Complete system to generate leads every month." },
  { name: "Reputation Management System", emoji: "⭐", tier: "t3", desc: "Automate your 5-star review requests." },
  { name: "Social Media Kit", emoji: "📱", tier: "t3", desc: "30 ready-to-post captions and image ideas." },
  { name: "Email Marketing Templates", emoji: "📧", tier: "t3", desc: "Newsletters, referral, and re-engagement campaigns." },
  { name: "Google Ads Playbook", emoji: "🎯", tier: "t3", desc: "Step-by-step $500/month campaign that works." },
  { name: "Referral Marketing System", emoji: "🎁", tier: "t3", desc: "Scripts and templates to get more referrals." },
  { name: "Partner Program Playbook", emoji: "🏗️", tier: "t3", desc: "Get referred by builders, property managers, Realtors." },
];

function DocBadge({ tier }: { tier: string }) {
  const m: Record<string, string> = { t1: "Foundation", t2: "Business", t3: "Growth" };
  const c: Record<string, string> = { t1: "bg-blue-100 text-blue-700", t2: "bg-slate-100 text-slate-700", t3: "bg-amber-100 text-amber-700" };
  return <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${c[tier]}`}>{m[tier]}</span>;
}

export default function DocumentsPage() {
  const [tier, setTier] = React.useState<string>("all");
  const shown = tier === "all" ? DOCS : DOCS.filter(d => d.tier === tier);
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-slate-900 text-white px-6 py-4 flex items-center gap-4">
        <Link to="/dashboard" className="text-slate-400 hover:text-white text-sm">Back to Dashboard</Link>
        <span className="text-2xl">📄</span>
        <div><h1 className="font-black">Documents and Templates</h1><p className="text-slate-400 text-sm">{shown.length} documents available</p></div>
      </header>
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex gap-2 mb-6">
          {(["all","Foundation","Business","Growth"] as string[]).map((l, i) => {
            const v = l === "all" ? "all" : `t${["Foundation","Business","Growth"].indexOf(l) + 1}`;
            return (
              <button key={l} onClick={() => setTier(v)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold ${tier === v ? "bg-slate-900 text-white" : "bg-white border border-gray-200 text-slate-600"}`}>
                {l}
              </button>
            );
          })}
        </div>
        <div className="space-y-3">
          {shown.map(doc => (
            <div key={doc.name} className="bg-white rounded-xl border border-gray-100 p-5 flex items-center justify-between hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <span className="text-3xl">{doc.emoji}</span>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-slate-900">{doc.name}</h3>
                    <DocBadge tier={doc.tier} />
                  </div>
                  <p className="text-slate-500 text-sm">{doc.desc}</p>
                </div>
              </div>
              <a href="#" className="bg-amber-400 text-slate-900 font-bold px-4 py-2 rounded-xl hover:bg-amber-300 text-sm flex-shrink-0 ml-4">
                Download
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
