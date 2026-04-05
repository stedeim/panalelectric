import React, { useState } from "react";
import { Link } from "react-router-dom";

const QUESTIONS = [
  { id: "gbp", category: "Google Business Profile", q: "Is your Google Business Profile fully completed with photos, hours, and services?", options: ["Yes, complete", "Partially done", "Not set up or incomplete"] },
  { id: "reviews", category: "Reviews", q: "How many reviews do you have on Google?", options: ["20+ reviews", "5-19 reviews", "Fewer than 5 reviews"] },
  { id: "citations", category: "Local Citations", q: "How many local directories is your business listed in?", options: ["20+ directories", "5-19 directories", "Not sure / fewer than 5"] },
  { id: "website", category: "Website", q: "Do you have a website that mentions your services?", options: ["Yes, professional", "Basic website", "No website"] },
  { id: "ai", category: "AI Search Visibility", q: "Have you optimized for AI search (ChatGPT, Gemini, Perplexity)?", options: ["Yes", "Heard of it", "What is AI search?"] },
  { id: "photos", category: "Google Photos", q: "Do you post photos of completed work to your Google Business Profile?", options: ["Monthly", "Occasionally", "Never"] },
  { id: "posts", category: "Google Posts", q: "Do you post updates to your Google Business Profile weekly?", options: ["Weekly", "Occasionally", "Never"] },
  { id: "category", category: "Business Category", q: "Is your primary Google Business Category set to the most specific option?", options: ["Yes, very specific", "General category", "Not sure"] },
];

const SCORE: Record<string, number> = {
  "Yes, complete": 10, "Partially done": 5, "Not set up or incomplete": 0,
  "20+ reviews": 10, "5-19 reviews": 6, "Fewer than 5 reviews": 1,
  "20+ directories": 10, "5-19 directories": 5, "Not sure / fewer than 5": 1,
  "Yes, professional": 10, "Basic website": 6, "No website": 1,
  "Yes": 10, "Heard of it": 4, "What is AI search?": 1,
  "Monthly": 10, "Occasionally": 5, "Never": 1,
  "Yes, very specific": 10, "General category": 5, "Not sure": 2,
};

const ACTIONS: Record<string, string> = {
  gbp: "Complete every section of your GBP. Add 10+ photos. Update hours and services today.",
  reviews: "Ask every happy customer for a Google review. Send a direct link via text after every job.",
  citations: "Submit your business to the top 20 local directories. See the Local SEO Guide in your tools.",
  website: "Create a simple one-page site on Canva or Carrd. Include your services, phone, and reviews.",
  ai: "Consistent NAP (name/address/phone) across all directories + structured data on your website.",
  photos: "Take photos on every job. Post to your GBP within 48 hours of completing work.",
  posts: "Post to your GBP weekly. Mix tips, completed job photos, and seasonal offers.",
  category: "In GBP settings, choose the most specific category for your trade.",
};

export default function GeoAuditPage() {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [score, setScore] = useState<number | null>(null);
  const [done, setDone] = useState(false);

  function calc() {
    const s = Math.round(
      QUESTIONS.reduce((sum, q) => sum + (SCORE[answers[q.id]] || 0), 0) /
      (QUESTIONS.length * 10) * 100
    );
    setScore(s);
    setDone(true);
  }

  const color = score !== null
    ? score >= 70 ? "text-green-600" : score >= 40 ? "text-amber-500" : "text-red-500"
    : "";

  const issues = QUESTIONS.filter(q => (SCORE[answers[q.id]] || 0) < 8);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-slate-900 text-white px-6 py-4 flex items-center gap-4">
        <Link to="/dashboard" className="text-slate-400 hover:text-white text-sm">Back to Dashboard</Link>
        <span className="text-2xl">🌐</span>
        <div>
          <h1 className="font-black">Quarterly GEO Audit</h1>
          <p className="text-slate-400 text-sm">Tier 3 Growth</p>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-10">
        {!done ? (
          <>
            <div className="bg-slate-900 text-white rounded-2xl p-6 mb-8">
              <h2 className="text-xl font-black mb-2">🌐 Complete Your GEO Audit</h2>
              <p className="text-slate-300 text-sm">8 questions. 3 minutes. Get your personalized AI search report with exact action steps.</p>
            </div>

            <div className="space-y-5">
              {QUESTIONS.map(q => (
                <div key={q.id} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                  <div className="text-xs font-bold text-amber-500 uppercase mb-2">{q.category}</div>
                  <h3 className="font-semibold text-slate-900 mb-3">{q.q}</h3>
                  <div className="flex flex-wrap gap-2">
                    {q.options.map(opt => (
                      <button
                        key={opt}
                        onClick={() => setAnswers(prev => ({ ...prev, [q.id]: opt }))}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-colors ${
                          answers[q.id] === opt
                            ? "bg-slate-900 text-white border-slate-900"
                            : "border-gray-200 text-slate-600 hover:border-slate-400"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={calc}
              disabled={Object.keys(answers).length < QUESTIONS.length}
              className="w-full mt-6 bg-amber-400 text-slate-900 font-black py-4 rounded-xl hover:bg-amber-300 text-lg disabled:opacity-40"
            >
              Generate My GEO Report
            </button>
          </>
        ) : (
          <div className="text-center">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
              <div className="text-7xl mb-4">
                {score !== null && score >= 70 ? "⚡" : score !== null && score >= 40 ? "🔧" : "📋"}
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-1">
                Your GEO Score: <span className={color}>{score}/100</span>
              </h2>
              <p className="text-slate-500 mb-6">
                {score !== null && score >= 70
                  ? "Strong AI search presence. Fine-tune these items."
                  : score !== null && score >= 40
                  ? "Room to grow. Here is your priority action plan."
                  : "Your AI search presence needs work. Here is exactly what to fix."}
              </p>

              {issues.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-left mb-6">
                  <h3 className="font-bold text-slate-900 mb-3">📋 Your Action Items:</h3>
                  <div className="space-y-3">
                    {issues.map(q => (
                      <div key={q.id} className="flex gap-3">
                        <span className="text-red-500 font-bold text-lg mt-0.5">!</span>
                        <div>
                          <div className="font-semibold text-slate-800 text-sm">{q.category}</div>
                          <div className="text-slate-500 text-xs">{ACTIONS[q.id]}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <a href="#" className="inline-block bg-slate-900 text-white font-black px-6 py-3 rounded-xl hover:bg-slate-800 text-sm">
                📄 Download Full PDF Report
              </a>

              <button
                onClick={() => { setDone(false); setAnswers({}); setScore(null); }}
                className="block mx-auto mt-4 text-slate-400 hover:text-slate-600 text-xs"
              >
                Retake audit
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
