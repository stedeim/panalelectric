import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { WATT_SYSTEM_PROMPT, WATT_WELCOME_MESSAGE, WATT_STARTER_QUESTIONS } from '../lib/watt';

interface Message {
  role: 'user' | 'watt';
  text: string;
  time: string;
}

const WATT_JOKES = [
  "Why do electricians make terrible secret-keepers? They always spill the current.",
  "What did the outlet say to the plug? I'm socket-ing you a question.",
  "Why was the electrician so good at relationships? They knew all the right connections.",
  "What do you call an electrician who doesn't do their work? A current disappointment.",
  "Why did the electrons cross the road? Because the resistivity was too high on their side.",
];

function getWattResponse(userMessage: string): string {
  const msg = userMessage.toLowerCase();

  // Pricing questions
  if (msg.includes('price') || msg.includes('charge') || msg.includes('flat rate') || msg.includes('hourly')) {
    return "Great question! Here's how to think about pricing:\n\n1. **Calculate your true hourly cost** — overhead + your desired income ÷ billable hours\n2. **Add your markup** on materials — usually 45-60% on top of cost\n3. **Flat rate = total cost × 1.25** — that gives you 25% profit before you've even started\n\nMost solo operators undercharge by 20-30%. If you're unsure what to charge, check your overhead calculator — that'll tell you your absolute minimum. Then add 20% on top and you're in the right zone.";
  }

  // Overhead questions
  if (msg.includes('overhead') || msg.includes('expense') || msg.includes('cost')) {
    return "Overhead is everything you spend that isn't direct job labor. Here's what to include:\n\n• Truck, fuel, insurance\n• Tools, equipment, consumables\n• Software, phone, marketing\n• Health insurance, taxes, retirement\n• License, permits, CE credits\n\nMost electricians forget to factor in their own time. That's the biggest mistake. Your overhead calculator in the members portal handles this — use it every time you price a job.";
  }

  // Lead generation / marketing
  if (msg.includes('lead') || msg.includes('customer') || msg.includes('client')) {
    return "Best leads for solo electricians, ranked:\n\n🥇 Referrals from happy customers — your best customers know people like them\n🥈 Google Maps / Local SEO — when someone searches 'electrician near me'\n🥉 Facebook groups — post useful content, not ads\n\nFor the full system, check out the Lead Generation Machine in your Growth tier. But start with this: after every job, ask one question: 'Do you know anyone else who might need an electrician?'";
  }

  // EV charger questions
  if (msg.includes('ev charger') || msg.includes('electric vehicle') || msg.includes('tesla')) {
    return "EV charger installs are one of the best money-makers right now. Here's what to charge:\n\n• Level 2 residential: $350–$800 labor typically\n• Permit + inspection: $100–$250\n• Panel upgrade (if needed): $800–$2,500\n\nThe EV Charger Calculator in your tools does this automatically — put in the hours and materials and it'll tell you exactly what to quote. Always check if the panel needs upgrading before you give a price.";
  }

  // Contract questions
  if (msg.includes('contract') || msg.includes('agreement') || msg.includes('legal')) {
    return "Never start a job without a signed agreement. Essential clauses:\n\n• Scope of work — exactly what you're doing (and what you're NOT)\n• Payment terms — deposit upfront, balance on completion\n• Change order process — how extra work gets approved\n• Liability cap — limit your exposure\n• Permit responsibilities — who pulls what\n\nYour Growth tier has the Master Service Agreement and Subcontractor Agreement templates ready to use. Download them, get them reviewed by an attorney, and use them on every job.";
  }

  // Job costing questions
  if (msg.includes('profit') || msg.includes('margin') || msg.includes('job cost')) {
    return "Rule of thumb: your markup should cover your overhead AND leave you profit. Here's the simple version:\n\nLabor cost × 2.5 = minimum billable rate for solo operators\n\nThe Job Costing Tracker in your dashboard tracks this for every job. After each job, ask: did I make what I expected? If not, what changed? That's how you get better every single job.";
  }

  // Motivation / getting started
  if (msg.includes('start') || msg.includes('begin') || msg.includes('solo') || msg.includes('new business')) {
    return "You're in the best trade in the world, mate. Here's what separates electricians who make it from those who don't:\n\n1. **Price properly from day one** — don't race to the bottom\n2. **Get every agreement in writing** — no exceptions\n3. **Track every job's cost** — so you know if you're actually making money\n4. **Ask for referrals after every single job** — just ask\n5. **Build your Google presence** — it compounds over time\n\nYou're already ahead by being here. Most electricians never think about any of this.";
  }

  // Small talk / greeting
  if (msg.includes('hi') || msg.includes('hey') || msg.includes('hello') || msg === 'watt') {
    return "Hey mate! 👋 Good to have you here.\n\nI'm Watt — your AI business advisor. I know the electrical trade and I know how to run a profitable business. Ask me anything about pricing, jobs, contracts, marketing, hiring — whatever you're working through.\n\nWhat are you tackling today?";
  }

  // Ask about product
  if (msg.includes('tier') || msg.includes('upgrade') || msg.includes('plan') || msg.includes('subscription')) {
    return "We've got three tiers:\n\n🥉 **Foundation — $97/mo** — 6 core business tools including pricing guides and calculators\n\n🏆 **Business — $297/mo** — All 17 tools for running your business properly\n\n🚀 **Growth — $497/mo** — Everything in Business plus the full marketing system, GEO audit, and AI Marketing Assistant (that's me!)\n\nMost electricians start at Foundation and move up when they're ready to grow. Want to upgrade? I can tell you what's worth it based on what you're working on right now.";
  }

  // Default — friendly
  return `I love that question. Let me give you my best thinking on it:\n\nHere's the thing about running an electrical business — most guys are brilliant tradespeople but they never got taught the business side. That's exactly why ElectricianPro exists.\n\nBased on what you've told me, here's what I'd do:\n\n**Step 1:** Nail your pricing (use the overhead calculator to find your real minimum)\n**Step 2:** Track every job in the costing tracker so you know your margins\n**Step 3:** After every job, ask for a referral\n\nKeep showing up and keep asking good questions — that's how you build a real business. You've got this. ⚡`;
}

export default function WattChatPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'watt', text: WATT_WELCOME_MESSAGE, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSend() {
    if (!input.trim()) return;
    const userMsg: Message = { role: 'user', text: input.trim(), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setTyping(true);

    // Simulate Watt "thinking" with a realistic delay
    await new Promise(r => setTimeout(r, 800 + Math.random() * 800));

    const response = getWattResponse(input);
    const joke = Math.random() > 0.7 ? `\n\n${WATT_JOKES[Math.floor(Math.random() * WATT_JOKES.length)]} 😄` : '';
    const signedResponse = `${response}${joke}`;

    setMessages(prev => [...prev, {
      role: 'watt',
      text: signedResponse,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }]);
    setTyping(false);
  }

  function handleStarter(question: string) {
    setInput(question);
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center gap-4">
        <Link to="/dashboard" className="text-slate-400 hover:text-white text-sm">← Dashboard</Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-400 flex items-center justify-center text-xl">💬</div>
          <div>
            <h1 className="font-black text-white text-lg">Ask Watt</h1>
            <p className="text-slate-400 text-xs">⚡ Your AI business advisor</p>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 max-w-3xl mx-auto w-full">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold ${msg.role === 'user' ? 'bg-slate-600 text-white' : 'bg-amber-400 text-slate-900'}`}>
              {msg.role === 'user' ? '👷' : '⚡'}
            </div>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.role === 'user' ? 'bg-slate-700 text-white rounded-tr-sm' : 'bg-slate-800 text-slate-100 rounded-tl-sm border border-slate-700'}`}>
              <div style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</div>
              <div className={`text-xs mt-1 ${msg.role === 'user' ? 'text-slate-400' : 'text-slate-500'}`}>{msg.time}</div>
            </div>
          </div>
        ))}

        {typing && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-400 flex-shrink-0 flex items-center justify-center text-sm font-bold">⚡</div>
            <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        {messages.length === 1 && (
          <div className="space-y-3">
            <p className="text-slate-400 text-sm font-semibold">Try asking about:</p>
            <div className="flex flex-wrap gap-2">
              {WATT_STARTER_QUESTIONS.map(q => (
                <button key={q} onClick={() => handleStarter(q)}
                  className="bg-slate-800 border border-slate-700 text-slate-300 px-4 py-2 rounded-xl text-xs hover:bg-slate-700 hover:text-white transition-colors text-left">
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-slate-700 bg-slate-800 px-4 py-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex gap-3">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Ask Watt anything about your business..."
              className="flex-1 bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <button onClick={handleSend} disabled={!input.trim()}
              className="bg-amber-400 text-slate-900 font-black px-6 py-3 rounded-xl hover:bg-amber-300 transition-colors disabled:opacity-40">
              ⚡ Send
            </button>
          </div>
          <p className="text-slate-500 text-xs text-center mt-2">Watt is AI-powered — for business advice, not legal or code compliance guidance.</p>
        </div>
      </div>
    </div>
  );
}
