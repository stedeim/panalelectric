import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

// ─── Types ────────────────────────────────────────────────────────────────────
type Tier = "none" | "starter" | "pro" | "business" | "growth" | "dfy";

interface NecCode {
  code: string; section: string; category: string;
  description: string; violation: string; penalty: string;
}

interface SeoItem { id: string; text: string; difficulty: "Easy"|"Medium"|"Hard"; minutes: number; impact: "Low"|"Medium"|"High"; checked: boolean; notes: string; }

interface Candidate {
  id: string; name: string; role: string; experience: string;
  email: string; phone: string; source: string; salary: string;
  stage: string; hireDate: string;
  refCheck: boolean; insuranceVerified: boolean; w9Collected: boolean;
  drugTest: boolean; orientationComplete: boolean;
  onboardingItems: { text: string; done: boolean; date: string }[];
  notes: string; createdAt: number;
}

interface AdScenario {
  id: string; name: string; budget: string; jobValue: string; closeRate: string; cpl: string;
}

interface InsuranceItem {
  id: string; type: string; provider: string; policyNumber: string;
  expiry: string; premium: string; reminder: string;
}

interface PricingLineItem {
  id: string; description: string; laborHours: string;
  laborRate: string; materialCost: string; markup: string;
}

interface PricingCategory {
  id: string; name: string; items: PricingLineItem[];
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const DOCS = [
  { name: "Residential Proposal Template", emoji: "📄", tier: "starter", desc: "Win more jobs with a professional, clear proposal." },
  { name: "Change Order Form", emoji: "🔄", tier: "starter", desc: "Protect yourself when the scope changes on a job." },
  { name: "Client Communication Templates", emoji: "💬", tier: "starter", desc: "Professional texts and emails for every situation." },
  { name: "Commercial Bid Proposal", emoji: "📁", tier: "pro", desc: "Professional bid format for commercial projects." },
  { name: "Master Electrical Service Agreement", emoji: "📜", tier: "pro", desc: "Protect your business with every signature." },
  { name: "Commercial Maintenance Agreement", emoji: "🔧", tier: "pro", desc: "Set up recurring revenue with maintenance clients." },
  { name: "Subcontractor Agreement", emoji: "🤝", tier: "pro", desc: "Clean contracts for the subs you hire." },
  { name: "NEC 2023 Update Summary", emoji: "📖", tier: "pro", desc: "Stay code-compliant with the latest NEC changes." },
  { name: "Google Local SEO Guide", emoji: "🔍", tier: "pro", desc: "Get found on Google Maps and in AI search." },
  { name: "Hiring & Onboarding Kit", emoji: "🧑‍🔧", tier: "pro", desc: "Hire, onboard, and train employees properly." },
  { name: "Lead Generation Machine", emoji: "🚀", tier: "business", desc: "Complete system to generate leads every month." },
  { name: "Reputation Management System", emoji: "⭐", tier: "business", desc: "Automate your 5-star review requests." },
  { name: "Social Media Kit", emoji: "📱", tier: "business", desc: "30 ready-to-post captions and image ideas." },
  { name: "Email Marketing Templates", emoji: "📧", tier: "business", desc: "Newsletters, referral, and re-engagement campaigns." },
  { name: "Google Ads Playbook", emoji: "🎯", tier: "business", desc: "Step-by-step $500/month campaign that works." },
  { name: "Referral Marketing System", emoji: "🎁", tier: "business", desc: "Scripts and templates to get more referrals." },
  { name: "Partner Program Playbook", emoji: "🏗️", tier: "business", desc: "Get referred by builders, property managers, Realtors." },
];

const APPS = [
  { id: "nec", name: "NEC 2023 Code Lookup", desc: "Search 50+ NEC codes, bookmark violations, copy penalty text.", emoji: "📖", tier: "pro" as Tier, thumb: "/doc-thumbs/nec.png" },
  { id: "seo", name: "SEO Audit Tool", desc: "40-point audit with scoring, notes, and exportable report.", emoji: "🔍", tier: "pro" as Tier, thumb: "/doc-thumbs/seo.png" },
  { id: "hiring", name: "Hiring & Onboarding Tracker", desc: "Full candidate pipeline with 15-item onboarding checklists.", emoji: "🧑‍🔧", tier: "pro" as Tier, thumb: "/doc-thumbs/hiring.png" },
  { id: "ads", name: "Google Ads Calculator", desc: "Calculate leads, revenue, ROAS, and build your campaign plan.", emoji: "🎯", tier: "business" as Tier, thumb: "/doc-thumbs/ads.png" },
  { id: "insurance", name: "Insurance & Permit Tracker", desc: "Track policies, premiums, expiry dates, and compliance.", emoji: "🛡️", tier: "business" as Tier, thumb: "/doc-thumbs/insurance.png" },
  { id: "pricing", name: "Job Pricing Template Builder", desc: "Price 6 job categories with line items, margins, and quotes.", emoji: "💰", tier: "pro" as Tier, thumb: "/doc-thumbs/pricing.png" },
];

const NEC_CODES: NecCode[] = [
  { code: "210.8(A)(1)", section: "210.8(A)(1)", category: "GFCI", description: "GFCI protection required for 125V, 15A and 20A receptacles in dwelling unit bathrooms.", violation: "Installing non-GFCI receptacle in a bathroom without GFCI protection.", penalty: "Up to $5,000 per violation per day in some jurisdictions." },
  { code: "210.8(A)(2)", section: "210.8(A)(2)", category: "GFCI", description: "GFCI protection required for garage receptacles.", violation: "Receptacle in garage not protected by GFCI.", penalty: "Failed inspection, must correct before occupancy." },
  { code: "210.8(A)(3)", section: "210.8(A)(3)", category: "GFCI", description: "GFCI protection required for outdoor receptacles.", violation: "Outdoor receptacle without GFCI protection.", penalty: "Failed inspection, weather exposure risk." },
  { code: "210.8(A)(5)", section: "210.8(A)(5)", category: "GFCI", description: "GFCI protection required for basement receptacles (unfinished).", violation: "Basement receptacle without GFCI protection.", penalty: "Failed inspection." },
  { code: "210.8(A)(6)", section: "210.8(A)(6)", category: "GFCI", description: "GFCI protection required for kitchen countertop receptacles.", violation: "Kitchen counter receptacle without GFCI.", penalty: "Failed inspection." },
  { code: "210.8(A)(7)", section: "210.8(A)(7)", category: "GFCI", description: "GFCI protection required for receptacles within 6 ft of the edge of a sink.", violation: "Receptacle within 6 ft of sink without GFCI.", penalty: "Failed inspection." },
  { code: "210.11(C)(1)", section: "210.11(C)(1)", category: "Panel Clearances", description: "Bathroom branch circuits must have at least one 20A dedicated circuit for bathroom receptacles only.", violation: "Bathroom receptacles on shared circuit with other rooms.", penalty: "Failed inspection." },
  { code: "210.12(A)", section: "210.12(A)", category: "Arc Fault", description: "AFCI protection required for dwelling unit bedrooms, living rooms, dining rooms, kitchens, and more.", violation: "Bedroom circuit without AFCI protection.", penalty: "Failed inspection, fire hazard." },
  { code: "210.12(B)", section: "210.12(B)", category: "Arc Fault", description: "AFCI protection required for branch circuit extensions or modifications in existing dwelling units.", violation: "Adding a circuit without upgrading to AFCI.", penalty: "Failed inspection." },
  { code: "210.19(A)", section: "210.19(A)", category: "Wiring Methods", description: "Conductors must be sized to prevent voltage drop exceeding 3% in branch circuits.", violation: "Using undersized conductors causing excessive voltage drop.", penalty: "Failed inspection, equipment damage liability." },
  { code: "210.52(A)(1)", section: "210.52(A)(1)", category: "Wiring Methods", description: "Receptacles in dwelling kitchens must be spaced no more than 48 inches apart.", violation: "Receptacle spacing exceeds 48 inches on counter.", penalty: "Failed inspection." },
  { code: "210.52(A)(2)", section: "210.52(A)(2)", category: "Wiring Methods", description: "At least two small appliance branch circuits required for kitchen receptacles.", violation: "Kitchen on fewer than 2 dedicated circuits.", penalty: "Failed inspection." },
  { code: "210.52(E)", section: "210.52(E)", category: "Wiring Methods", description: "Dwelling unit laundry area requires a 20A dedicated circuit for laundry receptacles.", violation: "Laundry receptacle not on dedicated 20A circuit.", penalty: "Failed inspection." },
  { code: "220.12", section: "220.12", category: "Service Sizing", description: "Lighting load calculated at 3 VA per sq ft of dwelling unit area.", violation: "Undersizing service based on incorrect square footage.", penalty: "Failed inspection, overloaded service." },
  { code: "220.14(H)", section: "220.14(H)", category: "Service Sizing", description: "Dwelling unit air conditioning loads must be included in service load calculations.", violation: "Omitting AC load from service calculation.", penalty: "Oversized service, code violation." },
  { code: "220.53", section: "220.53", category: "Service Sizing", description: "Appliance loads: apply demand factor for 4 or more fixed appliances.", violation: "Not applying demand factor to multiple appliances.", penalty: "Undersized service." },
  { code: "220.83", section: "220.83", category: "Service Sizing", description: "Dwelling load calculation for existing services: first 8 kVA at 100%, remainder at 40%.", violation: "Incorrect load calculation for service upgrade.", penalty: "Failed inspection." },
  { code: "230.24(A)", section: "230.24(A)", category: "Service Sizing", description: "Service conductors must be installed at least 8 ft above finished grade.", violation: "Overhead service conductors below 8 ft at any point.", penalty: "Failed inspection, safety hazard." },
  { code: "230.70(A)(1)", section: "230.70(A)(1)", category: "Panel Clearances", description: "Service disconnect must be readily accessible and located within sight of the building served.", violation: "Service disconnect not readily accessible.", penalty: "Failed inspection." },
  { code: "230.79(C)", section: "230.79(C)", category: "Panel Clearances", description: "Dwelling unit service disconnect must have a minimum 100A rating.", violation: "Installing service panel smaller than 100A.", penalty: "Failed inspection." },
  { code: "240.4(B)", section: "240.4(B)", category: "Panel Clearances", description: "Overcurrent protection must not exceed the ampacity of conductors.", violation: "Oversized breaker for conductor size.", penalty: "Fire hazard, failed inspection." },
  { code: "240.6(A)", section: "240.6(A)", category: "Panel Clearances", description: "Standard ampere ratings for overcurrent devices: 15, 20, 25, 30, 35, 40, 45, 50, 60, 70, 80, 90, 100A and above.", violation: "Using non-standard ampere-rated breaker.", penalty: "Failed inspection." },
  { code: "240.21(B)(1)", section: "240.21(B)(1)", category: "Panel Clearances", description: "Feeder tap conductors 10 ft or less in length must be sized per table and within enclosure.", violation: "Tap conductor not properly sized or protected.", penalty: "Failed inspection." },
  { code: "250.4(A)(1)", section: "250.4(A)(1)", category: "Grounding", description: "Electrical equipment must be bonded and grounded to limit voltage to ground.", violation: "Missing equipment grounding conductor.", penalty: "Shock hazard, failed inspection." },
  { code: "250.52(A)(1)", section: "250.52(A)(1)", category: "Grounding", description: "Grounding electrode must use a metal underground water pipe in contact with earth for 10 ft or more.", violation: "Using water pipe that doesn't meet 10 ft requirement.", penalty: "Failed inspection." },
  { code: "250.66(A)", section: "250.66(A)", category: "Grounding", description: "Grounding electrode conductor sizing for 100A services: minimum #8 copper or #6 aluminum.", violation: "Undersized grounding electrode conductor.", penalty: "Failed inspection." },
  { code: "250.104(A)", section: "250.104(A)", category: "Grounding", description: "Metal water piping systems in buildings must be bonded to the service equipment.", violation: "Water pipe not bonded to service grounding.", penalty: "Shock hazard, failed inspection." },
  { code: "250.122(A)", section: "250.122(A)", category: "Grounding", description: "Equipment grounding conductor sized per Table 250.122 based on overcurrent device rating.", violation: "Undersized equipment grounding conductor.", penalty: "Failed inspection." },
  { code: "250.148", section: "250.148", category: "Grounding", description: "Equipment grounding conductor must be spliced in boxes with a pigtail.", violation: "Grounding conductor continuity broken at junction box.", penalty: "Failed inspection." },
  { code: "300.3(B)", section: "300.3(B)", category: "Wiring Methods", description: "All conductors of the same circuit must be contained in the same raceway or cable.", violation: "Hot and neutral in separate conduits without dedicated return.", penalty: "Failed inspection, induced voltage." },
  { code: "300.4(A)", section: "300.4(A)", category: "Wiring Methods", description: "Protection against physical damage required where cables pass through bored holes or notches.", violation: "Cable installed without protection through studs.", penalty: "Failed inspection, damage risk." },
  { code: "300.5", section: "300.5", category: "Wiring Methods", description: "Direct-buried conductors/cables must meet burial depth requirements: 24 inches for 600V conductors.", violation: "Burial depth less than 24 inches.", penalty: "Failed inspection, damage risk." },
  { code: "300.11", section: "300.11", category: "Wiring Methods", description: "Cables and raceways must be secured and supported per NEC requirements (every 4.5 ft).", violation: "Unsupported cable runs or loose wiring.", penalty: "Failed inspection." },
  { code: "300.14", section: "300.14", category: "Wiring Methods", description: "At least 6 inches of free conductor required at each outlet and junction box.", violation: "Conductor cut too short at box.", penalty: "Failed inspection." },
  { code: "310.12", section: "310.12", category: "Service Sizing", description: "Dwelling unit service conductors: 100A service requires #4 copper or #2 aluminum minimum.", violation: "Service conductors undersized for 100A service.", penalty: "Failed inspection." },
  { code: "314.16(A)", section: "314.16(A)", category: "Panel Clearances", description: "Box fill calculations: each conductor counts as 1 or 2 conductor equivalents based on size.", violation: "Junction box too small for conductors installed.", penalty: "Failed inspection." },
  { code: "314.16(B)(1)", section: "314.16(B)(1)", category: "Panel Clearances", description: "Each device (receptacle, switch) counts as 2 conductor equivalents in box fill.", violation: "Box too small for device and conductors.", penalty: "Failed inspection." },
  { code: "334.10", section: "334.10", category: "Wiring Methods", description: "Type NM (Romex) cable permitted in dwellings: must not be used in exposed locations or wet areas.", violation: "NM cable used outdoors or in wet location.", penalty: "Failed inspection, moisture damage." },
  { code: "334.15", section: "334.15", category: "Wiring Methods", description: "Type NM cable exposed in workmanlike manner and protected from physical damage.", violation: "Exposed NM cable in garage or basement without protection.", penalty: "Failed inspection." },
  { code: "334.30", section: "334.30", category: "Wiring Methods", description: "NM cables must be secured at intervals not exceeding 4.5 ft and within 12 inches of each box.", violation: "Cable not properly stapled or secured.", penalty: "Failed inspection." },
  { code: "404.2(B)", section: "404.2(B)", category: "Wiring Methods", description: "Grounding-type receptacles must be installed where a grounding means exists.", violation: "Non-grounding receptacle where grounding is available.", penalty: "Failed inspection." },
  { code: "406.3(D)", section: "406.3(D)", category: "GFCI", description: "Tamper-resistant receptacles required in dwelling units: all 15A and 20A, 125V receptacles.", violation: "Non-TR receptacle installed in dwelling.", penalty: "Failed inspection." },
  { code: "408.3(A)", section: "408.3(A)", category: "Panel Clearances", description: "Panelboard enclosures: minimum 6 inches working space depth in front of panel.", violation: "Insufficient working space in front of panel.", penalty: "Failed inspection." },
  { code: "408.3(B)", section: "408.3(B)", category: "Panel Clearances", description: "Panelboard working space width: minimum 30 inches or width of equipment, whichever is greater.", violation: "Panel too close to wall or obstruction.", penalty: "Failed inspection." },
  { code: "408.3(C)", section: "408.3(C)", category: "Panel Clearances", description: "Panelboard working space height: minimum 6.5 ft or height of panel, whichever is greater.", violation: "Panel in low-clearance area.", penalty: "Failed inspection." },
  { code: "422.5(A)", section: "422.5(A)", category: "GFCI", description: "GFCI protection required for specific appliances: dishwashers, garbage disposals.", violation: "Dishwasher not on GFCI-protected circuit.", penalty: "Failed inspection." },
  { code: "422.12", section: "422.12", category: "Service Sizing", description: "Storage water heaters require a dedicated circuit.", violation: "Water heater on shared circuit.", penalty: "Failed inspection." },
  { code: "422.16(A)", section: "422.16(A)", category: "Wiring Methods", description: "Range circuits: 40A or 50A dedicated circuits for household electric ranges.", violation: "Range on undersized circuit.", penalty: "Failed inspection." },
  { code: "430.6(A)(1)", section: "430.6(A)(1)", category: "Service Sizing", description: "Motor conductor ampacity based on Table 430.147 or 430.148 full-load current values.", violation: "Undersized motor circuit conductors.", penalty: "Failed inspection." },
  { code: "430.24", section: "430.24", category: "Service Sizing", description: "Motor feeder conductors must be at least 125% of the largest motor FLC plus the sum of other motors.", violation: "Feeder undersized for motor load.", penalty: "Failed inspection." },
  { code: "680.22(A)(1)", section: "680.22(A)(1)", category: "GFCI", description: "Pool pump receptacles must be at least 10 ft from pool edge and GFCI protected.", violation: "Pool pump receptacle too close to pool without GFCI.", penalty: "Electrocution hazard, failed inspection." },
  { code: "680.71", section: "680.71", category: "GFCI", description: "Spas and hot tubs require GFCI protection for all 125V receptacles within 10 ft.", violation: "Spa receptacle within 10 ft not GFCI protected.", penalty: "Electrocution hazard, failed inspection." },
];

const SEO_CATEGORIES = [
  { name: "Google Business Profile", items: [
    { id: "s1", text: "Claim and verify your Google Business Profile", difficulty: "Easy" as const, minutes: 15, impact: "High" as const },
    { id: "s2", text: "Complete every field in your GBP (hours, services, attributes)", difficulty: "Easy" as const, minutes: 20, impact: "High" as const },
    { id: "s3", text: "Add all 10 required photos (exterior, interior, team, work)", difficulty: "Easy" as const, minutes: 30, impact: "Medium" as const },
    { id: "s4", text: "Write a 750+ character business description", difficulty: "Easy" as const, minutes: 20, impact: "Medium" as const },
    { id: "s5", text: "Set primary and secondary service categories", difficulty: "Easy" as const, minutes: 5, impact: "High" as const },
    { id: "s6", text: "Add all service areas (cities/neighborhoods you serve)", difficulty: "Easy" as const, minutes: 10, impact: "High" as const },
    { id: "s7", text: "Respond to every review (all 5-star and 1-star)", difficulty: "Easy" as const, minutes: 10, impact: "High" as const },
    { id: "s8", text: "Post to GBP weekly with offers, updates, or photos", difficulty: "Medium" as const, minutes: 30, impact: "Medium" as const },
    { id: "s9", text: "Enable messaging and set quick responses", difficulty: "Easy" as const, minutes: 10, impact: "Low" as const },
    { id: "s10", text: "Add your GBP Q&A section with common questions", difficulty: "Easy" as const, minutes: 20, impact: "Medium" as const },
    { id: "s11", text: "Verify 3-5 relevant service-area cities in GBP", difficulty: "Easy" as const, minutes: 15, impact: "Medium" as const },
    { id: "s12", text: "Fix NAP consistency across all directory listings", difficulty: "Medium" as const, minutes: 60, impact: "High" as const },
  ]},
  { name: "On-Page SEO", items: [
    { id: "o1", text: "Title tag includes city + primary keyword (50-60 chars)", difficulty: "Easy" as const, minutes: 5, impact: "High" as const },
    { id: "o2", text: "Meta description includes call-to-action + keyword (150-160 chars)", difficulty: "Easy" as const, minutes: 5, impact: "Medium" as const },
    { id: "o3", text: "H1 contains primary keyword", difficulty: "Easy" as const, minutes: 5, impact: "Medium" as const },
    { id: "o4", text: "H2s include secondary/long-tail keywords", difficulty: "Easy" as const, minutes: 10, impact: "Medium" as const },
    { id: "o5", text: "Add schema markup (LocalBusiness + Service schema)", difficulty: "Medium" as const, minutes: 45, impact: "High" as const },
    { id: "o6", text: "Optimize images with alt text (keyword-rich descriptions)", difficulty: "Medium" as const, minutes: 20, impact: "Low" as const },
    { id: "o7", text: "Internal linking to 3+ relevant service pages", difficulty: "Easy" as const, minutes: 15, impact: "Medium" as const },
    { id: "o8", text: "Page speed score ≥ 85 on PageSpeed Insights", difficulty: "Hard" as const, minutes: 120, impact: "High" as const },
    { id: "o9", text: "Mobile responsiveness verified (no horizontal scroll)", difficulty: "Easy" as const, minutes: 10, impact: "High" as const },
    { id: "o10", text: "SSL certificate installed (HTTPS redirect active)", difficulty: "Medium" as const, minutes: 15, impact: "High" as const },
  ]},
  { name: "Reviews & Reputation", items: [
    { id: "r1", text: "Set up automated review request (Google CLI or third-party)", difficulty: "Medium" as const, minutes: 30, impact: "High" as const },
    { id: "r2", text: "Request reviews from 10 past clients", difficulty: "Easy" as const, minutes: 20, impact: "High" as const },
    { id: "r3", text: "Respond to all existing Google reviews (positive + negative)", difficulty: "Easy" as const, minutes: 30, impact: "High" as const },
    { id: "r4", text: "Get listed on 3 review platforms (Yelp, Houzz, HomeAdvisor)", difficulty: "Medium" as const, minutes: 45, impact: "Medium" as const },
    { id: "r5", text: "Create a review generating workflow (job completion step)", difficulty: "Medium" as const, minutes: 30, impact: "High" as const },
    { id: "r6", text: "Add testimonials to website with photos", difficulty: "Easy" as const, minutes: 20, impact: "Medium" as const },
    { id: "r7", text: "Monitor brand mentions monthly (Google Alerts)", difficulty: "Easy" as const, minutes: 10, impact: "Low" as const },
    { id: "r8", text: "Create a negative review response policy", difficulty: "Easy" as const, minutes: 15, impact: "Medium" as const },
  ]},
  { name: "Citations & Links", items: [
    { id: "c1", text: "List on 20+ citation sites (NAP consistency verified)", difficulty: "Medium" as const, minutes: 60, impact: "High" as const },
    { id: "c2", text: "List on Angi, HomeAdvisor, Thumbtack", difficulty: "Easy" as const, minutes: 20, impact: "Medium" as const },
    { id: "c3", text: "List on local chamber of commerce and electrical associations", difficulty: "Easy" as const, minutes: 15, impact: "Low" as const },
    { id: "c4", text: "Build 3-5 backlinks from local partners, suppliers, or media", difficulty: "Hard" as const, minutes: 120, impact: "High" as const },
    { id: "c5", text: "Submit to local business directories (city, county)", difficulty: "Easy" as const, minutes: 30, impact: "Medium" as const },
  ]},
  { name: "Content & Social", items: [
    { id: "a1", text: "Create service area pages (one per city/neighborhood)", difficulty: "Medium" as const, minutes: 90, impact: "High" as const },
    { id: "a2", text: "Publish 1 blog post per week (electrical tips, guides)", difficulty: "Medium" as const, minutes: 60, impact: "Medium" as const },
    { id: "a3", text: "Share 3 before/after project photos on social media/week", difficulty: "Easy" as const, minutes: 20, impact: "Medium" as const },
    { id: "a4", text: "Create a FAQ page answering 20 common electrical questions", difficulty: "Medium" as const, minutes: 60, impact: "High" as const },
    { id: "a5", text: "Set up Google Search Console and submit sitemap", difficulty: "Medium" as const, minutes: 30, impact: "High" as const },
  ]},
  { name: "Technical & Tracking", items: [
    { id: "t1", text: "Install Google Analytics 4", difficulty: "Easy" as const, minutes: 15, impact: "High" as const },
    { id: "t2", text: "Set up Google Tag Manager", difficulty: "Medium" as const, minutes: 30, impact: "High" as const },
    { id: "t3", text: "Configure call tracking numbers (different number per source)", difficulty: "Medium" as const, minutes: 45, impact: "High" as const },
    { id: "t4", text: "Add a contact form with submission tracking", difficulty: "Easy" as const, minutes: 30, impact: "Medium" as const },
    { id: "t5", text: "Set up Google Ads conversion tracking (calls + form submits)", difficulty: "Medium" as const, minutes: 45, impact: "High" as const },
  ]},
];

const SEO_POINTS: Record<string, number> = { Easy: 5, Medium: 8, Hard: 12 };

const HIRING_STAGES = ["applied","phone","skills","interview","offer","hired","rejected"] as const;
const HIRING_STAGE_LABELS: Record<string,string> = { applied:"Applied", phone:"Phone Screen", skills:"Skills Test", interview:"Interview", offer:"Offer", hired:"Hired ✅", rejected:"Rejected ❌" };
const HIRING_ONBOARDING_ITEMS = ["Signed employment agreement","W-4 form completed","I-9 verification","Background check cleared","Drug test completed","Workers comp enrollment","General liability acknowledgment","Tool list received","Uniform/ID issued","Company vehicle assigned","Safety orientation completed","OSHA 10 certification started","Job site orientation","First paycheck processed","90-day review scheduled"];

const INSURANCE_TYPES = ["General Liability","Workers Compensation","Contractor's Bond","Electrical License Bond","Master Electrician License","Business License","Commercial Vehicle Insurance","EPA Section 608 Certification","OSHA 10 Card"];

const PRICING_CATEGORIES_DEFAULT: PricingCategory[] = [
  { id: "res", name: "Residential Service Call", items: [
    { id: "r1", description: "Service call & trip charge", laborHours: "1", laborRate: "95", materialCost: "0", markup: "0" },
    { id: "r2", description: "Diagnostic & troubleshooting (per hour)", laborHours: "1.5", laborRate: "95", materialCost: "0", markup: "0" },
    { id: "r3", description: "Standard outlet/switch replacement", laborHours: "1", laborRate: "95", materialCost: "15", markup: "50" },
    { id: "r4", description: "GFCI outlet installation", laborHours: "1.5", laborRate: "95", materialCost: "25", markup: "50" },
    { id: "r5", description: "Light fixture installation (basic)", laborHours: "1", laborRate: "95", materialCost: "45", markup: "50" },
  ]},
  { id: "panel", name: "Panel Upgrade", items: [
    { id: "p1", description: "100A to 200A panel upgrade", laborHours: "8", laborRate: "95", materialCost: "650", markup: "40" },
    { id: "p2", description: "Panel relocation (with new conduit)", laborHours: "12", laborRate: "95", materialCost: "800", markup: "40" },
    { id: "p3", description: "Subpanel installation (8-space)", laborHours: "6", laborRate: "95", materialCost: "250", markup: "40" },
    { id: "p4", description: "AFCI/GFCI breaker installation (each)", laborHours: "0.5", laborRate: "95", materialCost: "65", markup: "50" },
  ]},
  { id: "ev", name: "EV Charger Installation", items: [
    { id: "e1", description: "Level 2 EV charger install (dedicated circuit)", laborHours: "4", laborRate: "95", materialCost: "200", markup: "40" },
    { id: "e2", description: "Panel upgrade for EV charger (if needed)", laborHours: "8", laborRate: "95", materialCost: "650", markup: "40" },
    { id: "e3", description: "Conduit run for EV charger (per 10ft)", laborHours: "1.5", laborRate: "95", materialCost: "80", markup: "50" },
    { id: "e4", description: "Permit and inspection fee (pass-through)", laborHours: "0", laborRate: "0", materialCost: "150", markup: "0" },
  ]},
  { id: "lighting", name: "Lighting Installation", items: [
    { id: "l1", description: "Recessed can lights (per light, existing ceiling)", laborHours: "1", laborRate: "95", materialCost: "55", markup: "50" },
    { id: "l2", description: "Chandelier or pendant installation", laborHours: "2", laborRate: "95", materialCost: "120", markup: "50" },
    { id: "l3", description: "Under-cabinet LED strip installation", laborHours: "2.5", laborRate: "95", materialCost: "90", markup: "50" },
    { id: "l4", description: "Dimmer switch installation", laborHours: "0.75", laborRate: "95", materialCost: "35", markup: "50" },
  ]},
  { id: "comm", name: "Commercial T&M", items: [
    { id: "c1", description: "Commercial service call (minimum 2hr)", laborHours: "2", laborRate: "125", materialCost: "25", markup: "50" },
    { id: "c2", description: "Commercial wiring per device (receptacle/switch)", laborHours: "1", laborRate: "125", materialCost: "20", markup: "50" },
    { id: "c3", description: "3-phase motor connection", laborHours: "4", laborRate: "125", materialCost: "150", markup: "40" },
    { id: "c4", description: "Emergency lighting system install (per head)", laborHours: "2", laborRate: "125", materialCost: "95", markup: "40" },
  ]},
  { id: "emergency", name: "Emergency Service", items: [
    { id: "em1", description: "Emergency service call (after-hours, 2hr min)", laborHours: "2", laborRate: "175", materialCost: "50", markup: "40" },
    { id: "em2", description: "Emergency repair - wire replacement (per ft)", laborHours: "1", laborRate: "175", materialCost: "12", markup: "40" },
    { id: "em3", description: "Emergency panel repair/replacement", laborHours: "6", laborRate: "175", materialCost: "400", markup: "40" },
  ]},
];

// ─── Tier Helpers ─────────────────────────────────────────────────────────────
function tierGte(userTier: Tier, required: Tier): boolean {
  const order: Tier[] = ["none","starter","pro","business","growth","dfy"];
  return order.indexOf(userTier) >= order.indexOf(required);
}

function TierBadge({ tier }: { tier: Tier }) {
  const m: Record<Tier, string> = { none:"None", starter:"Foundation", pro:"Business", business:"Growth", growth:"Growth+", dfy:"Done-For-You" };
  const c: Record<Tier, string> = { none:"bg-gray-100 text-gray-500", starter:"bg-blue-100 text-blue-700", pro:"bg-slate-100 text-slate-700", business:"bg-amber-100 text-amber-700", growth:"bg-amber-200 text-amber-800", dfy:"bg-green-100 text-green-700" };
  return <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${c[tier]}`}>{m[tier]}</span>;
}

function TierGate({ required, children }: { required: Tier; children: React.ReactNode }) {
  const { subscription } = useAuth();
  const userTier = subscription.tier as Tier;
  if (!tierGte(userTier, required)) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="text-5xl mb-4">🔒</div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">Business Tier Required</h2>
        <p className="text-slate-500 mb-6 max-w-md">This tool requires the <strong>Business</strong> plan or higher. Upgrade to unlock full access.</p>
        <Link to="/dashboard" className="bg-amber-400 text-slate-900 font-bold px-6 py-3 rounded-xl hover:bg-amber-300 transition-colors">
          Upgrade Plan →
        </Link>
      </div>
    );
  }
  return <>{children}</>;
}

// ─── Shared UI Components ─────────────────────────────────────────────────────
function SectionHeader({ title, subtitle, icon }: { title: string; subtitle?: string; icon?: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-black text-slate-900">{icon && <span className="mr-2">{icon}</span>}{title}</h2>
      {subtitle && <p className="text-slate-500 mt-1">{subtitle}</p>}
    </div>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-4 text-sm font-semibold transition-colors">
      <span>←</span> Back to Apps & Downloads
    </button>
  );
}

// ─── APP 1: NEC 2023 Code Lookup Tool ─────────────────────────────────────────
function NecApp({ onBack }: { onBack: () => void }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [favorites, setFavorites] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("ep_nec_favorites") || "[]"); } catch { return []; }
  });
  const [expanded, setExpanded] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>(() => {
    try { return JSON.parse(localStorage.getItem("ep_nec_notes") || "{}"); } catch { return {}; }
  });
  const [copied, setCopied] = useState<string | null>(null);

  const categories = ["All", ...Array.from(new Set(NEC_CODES.map(c => c.category)))];

  const filtered = NEC_CODES.filter(code => {
    const matchCat = category === "All" || code.category === category;
    const q = search.toLowerCase();
    const matchSearch = !q || code.code.toLowerCase().includes(q) || code.description.toLowerCase().includes(q) || code.violation.toLowerCase().includes(q) || code.penalty.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  const toggleFav = (code: string) => {
    const next = favorites.includes(code) ? favorites.filter(f => f !== code) : [...favorites, code];
    setFavorites(next);
    localStorage.setItem("ep_nec_favorites", JSON.stringify(next));
  };

  const copyViolation = (code: NecCode) => {
    const text = `NEC ${code.code}: ${code.violation} — ${code.penalty}`;
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(code.code);
    setTimeout(() => setCopied(null), 2000);
  };

  const saveNote = (code: string, note: string) => {
    const next = { ...notes, [code]: note };
    setNotes(next);
    localStorage.setItem("ep_nec_notes", JSON.stringify(next));
  };

  const catColors: Record<string, string> = {
    GFCI: "bg-rose-100 text-rose-700", AFCI: "bg-purple-100 text-purple-700",
    ArcFault: "bg-purple-100 text-purple-700", Grounding: "bg-green-100 text-green-700",
    PanelClearances: "bg-amber-100 text-amber-700", ServiceSizing: "bg-blue-100 text-blue-700",
    WiringMethods: "bg-slate-100 text-slate-700", SmokeCO: "bg-orange-100 text-orange-700",
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="bg-slate-800 border-b border-slate-700 px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-slate-400 hover:text-white text-sm">← Back</button>
          <span className="text-2xl">📖</span>
          <div><h1 className="font-black text-lg">NEC 2023 Code Lookup</h1><p className="text-slate-400 text-xs">{filtered.length} codes</p></div>
        </div>
        <TierBadge tier="pro" />
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search codes, violations, penalties..."
            className="flex-1 bg-slate-800 border border-slate-600 text-white rounded-xl px-4 py-3 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
          <select value={category} onChange={e => setCategory(e.target.value)}
            className="bg-slate-800 border border-slate-600 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-400">
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button onClick={() => setCategory("All")} className="bg-amber-400 text-slate-900 font-bold px-4 py-3 rounded-xl hover:bg-amber-300 transition-colors text-sm">
            Show Favorites ({favorites.length})
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {categories.slice(1).map(cat => {
            const count = NEC_CODES.filter(n => n.category === cat).length;
            return (
              <button key={cat} onClick={() => setCategory(cat)}
                className={`bg-slate-800 border rounded-xl px-4 py-3 text-center hover:bg-slate-700 transition-colors ${category === cat ? "border-amber-400" : "border-slate-700"}`}>
                <div className="text-lg font-black">{count}</div>
                <div className="text-xs text-slate-400">{cat}</div>
              </button>
            );
          })}
        </div>

        {/* Code List */}
        <div className="space-y-3">
          {filtered.map(code => (
            <div key={code.code} className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
              <button className="w-full text-left p-4 hover:bg-slate-750 transition-colors" onClick={() => setExpanded(expanded === code.code ? null : code.code)}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-mono font-bold text-amber-400 text-sm">{code.code}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${catColors[code.category] || "bg-slate-600"}`}>{code.category}</span>
                    </div>
                    <p className="text-slate-300 text-sm">{code.description}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={(e) => { e.stopPropagation(); toggleFav(code.code); }}
                      className={`text-xl transition-colors ${favorites.includes(code.code) ? "text-amber-400" : "text-slate-500 hover:text-amber-400"}`}>
                      {favorites.includes(code.code) ? "★" : "☆"}
                    </button>
                    <span className="text-slate-400 text-sm">{expanded === code.code ? "▲" : "▼"}</span>
                  </div>
                </div>
              </button>
              {expanded === code.code && (
                <div className="border-t border-slate-700 p-4 bg-slate-850 space-y-4">
                  <div>
                    <div className="text-xs font-bold text-red-400 uppercase mb-1">Common Violation</div>
                    <p className="text-slate-300 text-sm">{code.violation}</p>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-red-300 uppercase mb-1">Penalty / Consequence</div>
                    <p className="text-red-200 text-sm font-medium">{code.penalty}</p>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase mb-1">Your Notes</div>
                    <textarea value={notes[code.code] || ""} onChange={e => saveNote(code.code, e.target.value)}
                      placeholder="Add your notes, examples, or reminders..."
                      className="w-full bg-slate-900 border border-slate-600 text-slate-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-amber-400"
                      rows={2} />
                  </div>
                  <button onClick={() => copyViolation(code)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${copied === code.code ? "bg-green-600 text-white" : "bg-amber-400 text-slate-900 hover:bg-amber-300"}`}>
                    {copied === code.code ? "✓ Copied!" : "📋 Copy Violation Text"}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── APP 2: SEO Audit Tool ────────────────────────────────────────────────────
function SeoApp({ onBack }: { onBack: () => void }) {
  const [items, setItems] = useState<SeoItem[]>(() => {
    try {
      const saved = localStorage.getItem("ep_seo_items");
      if (saved) return JSON.parse(saved);
    } catch {}
    return SEO_CATEGORIES.flatMap(cat => cat.items.map(i => ({ ...i, checked: false, notes: "" })));
  });
  const [auditName, setAuditName] = useState(() => localStorage.getItem("ep_seo_name") || "My SEO Audit");
  const [showCat, setShowCat] = useState<string>("All");

  useEffect(() => { localStorage.setItem("ep_seo_items", JSON.stringify(items)); }, [items]);

  const toggle = (id: string) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, checked: !i.checked } : i));
  };

  const totalPoints = items.filter(i => i.checked).reduce((sum, i) => sum + SEO_POINTS[i.difficulty], 0);
  const maxPoints = items.reduce((sum, i) => sum + SEO_POINTS[i.difficulty], 0);
  const checked = items.filter(i => i.checked).length;
  const pct = maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 100) : 0;

  const saveNotes = (id: string, notes: string) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, notes } : i));
  };

  const reset = () => {
    if (confirm("Reset all checkboxes and notes?")) {
      setItems(SEO_CATEGORIES.flatMap(cat => cat.items.map(i => ({ ...i, checked: false, notes: "" }))));
    }
  };

  const exportReport = () => {
    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>SEO Audit Report - ${auditName}</title>
<style>
  body{font-family:system-ui,sans-serif;max-width:900px;margin:40px auto;padding:0 20px;color:#1e293b}
  h1{background:#0f172a;color:#fff;padding:20px 24px;border-radius:12px;margin-bottom:24px}
  .score{font-size:80px;font-weight:900;text-align:center;color:#f59e0b;margin:20px 0}
  .pct{text-align:center;color:#64748b;font-size:20px;margin-bottom:30px}
  .bar{background:#e2e8f0;border-radius:8px;height:24px;overflow:hidden;margin-bottom:30px}
  .bar-fill{background:#f59e0b;height:100%;transition:width 1s;border-radius:8px}
  .cat{margin-bottom:30px}
  h2{color:#334155;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-bottom:12px}
  .item{display:flex;align-items:flex-start;gap:12px;padding:10px 0;border-bottom:1px solid #f1f5f9}
  .item.checked{opacity:.7}
  .badge{padding:2px 8px;border-radius:999px;font-size:11px;font-weight:700;flex-shrink:0}
  .easy{background:#d1fae5;color:#065f46} .medium{background:#fef3c7;color:#92400e} .hard{background:#fee2e2;color:#991b1b}
  .hi{background:#dbeafe;color:#1e40af} .lo{background:#f1f5f9;color:#475569}
  .notes{font-size:12px;color:#64748b;font-style:italic}
  @media print{body{margin:0;padding:20px}}
</style></head><body>
<h1>⚡ ${auditName} — SEO Audit Report</h1>
<div class="score">${pct}/100</div>
<div class="pct">${checked} of ${items.length} items complete — ${totalPoints} points earned</div>
<div class="bar"><div class="bar-fill" style="width:${pct}%"></div></div>
${SEO_CATEGORIES.map(cat => {
  const catItems = items.filter(i => i.category === cat.name);
  const catPts = catItems.filter(i=>i.checked).reduce((s,i)=>s+SEO_POINTS[i.difficulty],0);
  return `<div class="cat"><h2>${cat.name} (${catPts} pts)</h2>
${catItems.map(i => `<div class="item ${i.checked?'checked':''}">
<input type="checkbox" ${i.checked?'checked':''} disabled style="margin-top:3px"/>
<span>${i.text}</span>
<span class="badge ${i.difficulty.toLowerCase()}">${i.difficulty}</span>
<span class="badge hi">${i.minutes}min</span>
${i.notes ? `<div class="notes">Note: ${i.notes}</div>` : ""}
</div>`).join("")}
</div>`;
}).join("")}
<p style="color:#94a3b8;font-size:12px;margin-top:40px">Generated by PanelElectric PRO — ${new Date().toLocaleDateString()}</p>
</body></html>`;
    const win = window.open("","_blank");
    if (win) { win.document.write(html); win.document.close(); }
  };

  const scoreColor = pct >= 80 ? "text-green-400" : pct >= 50 ? "text-amber-400" : "text-red-400";

  const visibleCats = showCat === "All" ? SEO_CATEGORIES : SEO_CATEGORIES.filter(c => c.name === showCat);

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="bg-slate-800 border-b border-slate-700 px-4 py-4 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-slate-400 hover:text-white text-sm">← Back</button>
          <span className="text-2xl">🔍</span>
          <div><h1 className="font-black text-lg">SEO Audit Tool</h1><p className="text-slate-400 text-xs">{checked}/{items.length} complete</p></div>
        </div>
        <div className="flex gap-2">
          <button onClick={reset} className="text-slate-400 hover:text-white text-sm px-3 py-1 rounded-lg border border-slate-600">Reset</button>
          <button onClick={exportReport} className="bg-amber-400 text-slate-900 font-bold px-4 py-2 rounded-xl hover:bg-amber-300 text-sm transition-colors">📄 Export Report</button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Score Header */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <input value={auditName} onChange={e => { setAuditName(e.target.value); localStorage.setItem("ep_seo_name", e.target.value); }}
                className="bg-transparent font-black text-2xl text-white focus:outline-none border-b border-transparent focus:border-amber-400" />
              <p className="text-slate-400 text-sm mt-1">SEO Score</p>
            </div>
            <div className={`text-5xl font-black ${scoreColor}`}>{pct}</div>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-4 mb-3">
            <div className="bg-amber-400 h-4 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
          </div>
          <div className="flex justify-between text-sm text-slate-400">
            <span>0 pts</span><span>{totalPoints} / {maxPoints} points</span><span>{maxPoints} pts</span>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="bg-slate-700 rounded-xl p-3 text-center"><div className="text-xl font-black text-green-400">{items.filter(i=>i.checked&&i.difficulty==="Easy").reduce((s,i)=>s+SEO_POINTS[i.difficulty],0)}</div><div className="text-xs text-slate-400">Easy Points</div></div>
            <div className="bg-slate-700 rounded-xl p-3 text-center"><div className="text-xl font-black text-amber-400">{items.filter(i=>i.checked&&i.difficulty==="Medium").reduce((s,i)=>s+SEO_POINTS[i.difficulty],0)}</div><div className="text-xs text-slate-400">Medium Points</div></div>
            <div className="bg-slate-700 rounded-xl p-3 text-center"><div className="text-xl font-black text-red-400">{items.filter(i=>i.checked&&i.difficulty==="Hard").reduce((s,i)=>s+SEO_POINTS[i.difficulty],0)}</div><div className="text-xs text-slate-400">Hard Points</div></div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button onClick={() => setShowCat("All")} className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${showCat==="All"?"bg-amber-400 text-slate-900":"bg-slate-800 text-slate-300 border border-slate-700"}`}>All</button>
          {SEO_CATEGORIES.map(cat => (
            <button key={cat.name} onClick={() => setShowCat(cat.name)}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${showCat===cat.name?"bg-amber-400 text-slate-900":"bg-slate-800 text-slate-300 border border-slate-700"}`}>
              {cat.name} ({cat.items.length})
            </button>
          ))}
        </div>

        {/* Audit Items */}
        {visibleCats.map(cat => {
          const catChecked = items.filter(i => i.category === cat.name && i.checked).length;
          const catMax = items.filter(i => i.category === cat.name).length;
          const catPts = items.filter(i => i.category === cat.name && i.checked).reduce((s,i)=>s+SEO_POINTS[i.difficulty],0);
          return (
            <div key={cat.name} className="bg-slate-800 border border-slate-700 rounded-2xl p-5 mb-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-black text-lg">{cat.name}</h3>
                <span className="text-sm text-slate-400">{catChecked}/{catMax} · {catPts} pts</span>
              </div>
              <div className="space-y-3">
                {items.filter(i => i.category === cat.name).map(item => (
                  <div key={item.id} className={`flex items-start gap-3 p-3 rounded-xl border transition-colors ${item.checked ? "bg-slate-700 border-green-700/50" : "bg-slate-750 border-slate-600 hover:border-slate-500"}`}>
                    <input type="checkbox" checked={item.checked} onChange={() => toggle(item.id)}
                      className="mt-1 w-5 h-5 rounded accent-amber-400 cursor-pointer" />
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${item.checked ? "line-through text-slate-400" : "text-slate-200"}`}>{item.text}</p>
                      <div className="flex gap-2 mt-2 flex-wrap">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${item.difficulty==="Easy"?"bg-green-900/50 text-green-400":item.difficulty==="Medium"?"bg-amber-900/50 text-amber-400":"bg-red-900/50 text-red-400"}`}>{item.difficulty} +{SEO_POINTS[item.difficulty]}pts</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-900/50 text-blue-300">⏱ {item.minutes}min</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${item.impact==="High"?"bg-rose-900/50 text-rose-300":item.impact==="Medium"?"bg-purple-900/50 text-purple-300":"bg-slate-700 text-slate-400"}`}>Impact: {item.impact}</span>
                      </div>
                      <textarea value={item.notes} onChange={e => saveNotes(item.id, e.target.value)}
                        placeholder="Add notes..."
                        className="w-full mt-2 bg-slate-900 border border-slate-600 text-slate-300 rounded-lg px-3 py-1.5 text-xs resize-none focus:outline-none focus:ring-1 focus:ring-amber-400"
                        rows={1} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── APP 3: Hiring & Onboarding Tracker ──────────────────────────────────────
function HiringApp({ onBack }: { onBack: () => void }) {
  const [candidates, setCandidates] = useState<Candidate[]>(() => {
    try { return JSON.parse(localStorage.getItem("ep_candidates") || "[]"); } catch { return []; }
  });
  const [showForm, setShowForm] = useState(false);
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [form, setForm] = useState({ name:"", role:"Apprentice", experience:"1-2 years", email:"", phone:"", source:"Indeed", salary:"" });

  useEffect(() => { localStorage.setItem("ep_candidates", JSON.stringify(candidates)); }, [candidates]);

  const addCandidate = () => {
    if (!form.name) return;
    const c: Candidate = {
      id: Date.now().toString(), ...form, stage: "applied", hireDate: "",
      refCheck: false, insuranceVerified: false, w9Collected: false, drugTest: false, orientationComplete: false,
      onboardingItems: HIRING_ONBOARDING_ITEMS.map(t => ({ text: t, done: false, date: "" })),
      notes: "", createdAt: Date.now(),
    };
    setCandidates(prev => [...prev, c]);
    setForm({ name:"", role:"Apprentice", experience:"1-2 years", email:"", phone:"", source:"Indeed", salary:"" });
    setShowForm(false);
  };

  const moveStage = (id: string, dir: 1|-1) => {
    setCandidates(prev => prev.map(c => {
      if (c.id !== id) return c;
      const idx = HIRING_STAGES.indexOf(c.stage as typeof HIRING_STAGES[number]);
      const next = HIRING_STAGES[idx + dir];
      return next ? { ...c, stage: next } : c;
    }));
  };

  const toggleOnboard = (cid: string, itemIdx: number) => {
    setCandidates(prev => prev.map(c => {
      if (c.id !== cid) return c;
      const items = [...c.onboardingItems];
      items[itemIdx] = { ...items[itemIdx], done: !items[itemIdx].done, date: items[itemIdx].done ? "" : new Date().toLocaleDateString() };
      return { ...c, onboardingItems: items };
    }));
  };

  const deleteCandidate = (id: string) => {
    if (confirm("Remove this candidate?")) setCandidates(prev => prev.filter(c => c.id !== id));
  };

  const exportCSV = () => {
    const headers = ["Name","Role","Stage","Source","Salary","Ref Check","Insurance","W-9","Drug Test","Orientation","Notes"];
    const rows = candidates.map(c => [c.name, c.role, c.stage, c.source, c.salary, c.refCheck?"Yes":"No", c.insuranceVerified?"Yes":"No", c.w9Collected?"Yes":"No", c.drugTest?"Yes":"No", c.orientationComplete?"Yes":"No", `"${c.notes}"`]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv],{type:"text/csv"})); a.download = "candidates.csv"; a.click();
  };

  const stageColors: Record<string,string> = { applied:"bg-blue-100 text-blue-700", phone:"bg-purple-100 text-purple-700", skills:"bg-indigo-100 text-indigo-700", interview:"bg-amber-100 text-amber-700", offer:"bg-orange-100 text-orange-700", hired:"bg-green-100 text-green-700", rejected:"bg-red-100 text-red-700" };

  const cand = candidates.find(c => c.id === selected);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-slate-900 text-white px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-slate-400 hover:text-white text-sm">← Back</button>
          <span className="text-2xl">🧑‍🔧</span>
          <div><h1 className="font-black text-lg">Hiring & Onboarding Tracker</h1><p className="text-slate-400 text-xs">{candidates.length} candidates</p></div>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="text-slate-300 hover:text-white text-sm px-3 py-2 rounded-xl border border-slate-600">📊 Export CSV</button>
          <button onClick={() => setShowForm(true)} className="bg-amber-400 text-slate-900 font-bold px-4 py-2 rounded-xl hover:bg-amber-300 text-sm transition-colors">+ Add Candidate</button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Pipeline */}
        <div className="mb-8">
          <h2 className="font-black text-slate-900 text-lg mb-3">Pipeline</h2>
          <div className="flex overflow-x-auto gap-2 pb-2">
            {HIRING_STAGES.map(stage => {
              const count = candidates.filter(c => c.stage === stage).length;
              return (
                <div key={stage} className={`flex-shrink-0 min-w-28 rounded-xl border-2 p-3 text-center ${count > 0 ? "border-amber-400 bg-amber-50" : "border-slate-200 bg-white"}`}>
                  <div className={`text-2xl font-black ${count > 0 ? "text-amber-500" : "text-slate-300"}`}>{count}</div>
                  <div className={`text-xs font-semibold mt-1 ${count > 0 ? "text-slate-700" : "text-slate-400"}`}>{HIRING_STAGE_LABELS[stage]}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Candidate List */}
        <div className="space-y-3">
          {candidates.length === 0 && (
            <div className="text-center py-16 text-slate-400">
              <div className="text-4xl mb-3">🧑‍🔧</div>
              <p className="font-semibold">No candidates yet. Add your first one!</p>
            </div>
          )}
          {candidates.map(c => (
            <div key={c.id} className="bg-white rounded-2xl border border-slate-200 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-bold text-slate-900">{c.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${stageColors[c.stage]}`}>{HIRING_STAGE_LABELS[c.stage]}</span>
                  </div>
                  <p className="text-slate-500 text-sm">{c.role} · {c.experience} experience · {c.source}</p>
                  {c.salary && <p className="text-slate-400 text-xs mt-1">${Number(c.salary).toLocaleString()}/yr</p>}
                  {c.email && <p className="text-slate-400 text-xs">{c.email}</p>}
                  <div className="flex gap-3 mt-2">
                    {c.refCheck && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">✓ Ref Check</span>}
                    {c.w9Collected && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">✓ W-9</span>}
                    {c.drugTest && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">✓ Drug Test</span>}
                    {c.orientationComplete && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">✓ Orient.</span>}
                  </div>
                </div>
                <div className="flex flex-col gap-1 items-end">
                  <button onClick={() => setSelected(selected === c.id ? null : c.id)} className="text-amber-500 hover:text-amber-700 text-xs font-bold px-3 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 transition-colors">
                    {selected === c.id ? "Close" : "Details"}
                  </button>
                  {HIRING_STAGES.indexOf(c.stage) > 0 && (
                    <button onClick={() => moveStage(c.id, -1)} className="text-slate-400 hover:text-slate-600 text-xs px-2 py-1 rounded border border-slate-200 hover:bg-slate-50">←</button>
                  )}
                  {HIRING_STAGES.indexOf(c.stage) < HIRING_STAGES.length - 1 && c.stage !== "rejected" && (
                    <button onClick={() => moveStage(c.id, 1)} className="text-amber-500 hover:text-amber-700 text-xs px-2 py-1 rounded border border-amber-200 hover:bg-amber-50">→</button>
                  )}
                  <button onClick={() => deleteCandidate(c.id)} className="text-red-400 hover:text-red-600 text-xs mt-1">✕</button>
                </div>
              </div>

              {/* Expanded Detail */}
              {selected === c.id && (
                <div className="mt-4 border-t border-slate-200 pt-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={c.refCheck} onChange={() => setCandidates(prev => prev.map(x => x.id === c.id ? {...x, refCheck: !x.refCheck} : x))}
                        className="rounded accent-amber-400" />
                      <span className="text-slate-700">Ref Check</span>
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={c.insuranceVerified} onChange={() => setCandidates(prev => prev.map(x => x.id === c.id ? {...x, insuranceVerified: !x.insuranceVerified} : x))}
                        className="rounded accent-amber-400" />
                      <span className="text-slate-700">Insurance Verified</span>
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={c.w9Collected} onChange={() => setCandidates(prev => prev.map(x => x.id === c.id ? {...x, w9Collected: !x.w9Collected} : x))}
                        className="rounded accent-amber-400" />
                      <span className="text-slate-700">W-9 Collected</span>
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={c.drugTest} onChange={() => setCandidates(prev => prev.map(x => x.id === c.id ? {...x, drugTest: !x.drugTest} : x))}
                        className="rounded accent-amber-400" />
                      <span className="text-slate-700">Drug Test</span>
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={c.orientationComplete} onChange={() => setCandidates(prev => prev.map(x => x.id === c.id ? {...x, orientationComplete: !x.orientationComplete} : x))}
                        className="rounded accent-amber-400" />
                      <span className="text-slate-700">Orientation Done</span>
                    </label>
                    <div className="text-sm">
                      <span className="text-slate-500">Hire Date: </span>
                      <input type="date" value={c.hireDate} onChange={e => setCandidates(prev => prev.map(x => x.id === c.id ? {...x, hireDate: e.target.value} : x))}
                        className="border border-slate-200 rounded px-2 py-0.5 text-slate-700" />
                    </div>
                  </div>

                  <h4 className="font-bold text-slate-800 text-sm mb-2">15-Point Onboarding Checklist</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mb-4">
                    {c.onboardingItems.map((item, idx) => (
                      <label key={idx} className="flex items-start gap-2 text-sm p-2 rounded-lg hover:bg-slate-50 cursor-pointer">
                        <input type="checkbox" checked={item.done} onChange={() => toggleOnboard(c.id, idx)}
                          className="mt-0.5 rounded accent-amber-400" />
                        <span className={item.done ? "line-through text-slate-400" : "text-slate-700"}>{item.text}</span>
                        {item.date && <span className="text-xs text-green-600 ml-auto flex-shrink-0">{item.date}</span>}
                      </label>
                    ))}
                  </div>

                  <textarea value={c.notes} onChange={e => setCandidates(prev => prev.map(x => x.id === c.id ? {...x, notes: e.target.value} : x))}
                    placeholder="Candidate notes..."
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-400" rows={3} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Add Candidate Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-black text-slate-900 text-lg">Add Candidate</h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 text-xl">✕</button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Full Name *</label>
                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="John Smith"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Trade Role</label>
                  <select value={form.role} onChange={e => setForm({...form, role: e.target.value})}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400">
                    {["Apprentice","Journeyman","Master Electrician","Estimator","Project Manager","Service Technician"].map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Experience</label>
                  <select value={form.experience} onChange={e => setForm({...form, experience: e.target.value})}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400">
                    {["< 1 year","1-2 years","3-5 years","5-10 years","10+ years"].map(v => <option key={v}>{v}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Email</label>
                <input value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="john@email.com" type="email"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Phone</label>
                <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="555-123-4567" type="tel"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Source</label>
                  <select value={form.source} onChange={e => setForm({...form, source: e.target.value})}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400">
                    {["Indeed","LinkedIn","Referral","Facebook","ZipRecruiter","Indeed","Indeed","Company Website","Other"].filter((v,i,a)=>a.indexOf(v)===i).map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Salary Expectation</label>
                  <input value={form.salary} onChange={e => setForm({...form, salary: e.target.value})} placeholder="55000" type="number"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400" />
                </div>
              </div>
              <button onClick={addCandidate} disabled={!form.name}
                className="w-full bg-amber-400 text-slate-900 font-bold py-3 rounded-xl hover:bg-amber-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                Add Candidate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── APP 4: Google Ads Calculator ────────────────────────────────────────────
function AdsApp({ onBack }: { onBack: () => void }) {
  const [scenarios, setScenarios] = useState<AdScenario[]>(() => {
    try {
      const s = JSON.parse(localStorage.getItem("ep_ads_scenarios") || "null");
      if (s) return s;
    } catch {}
    return [
      { id: "1", name: "Starter", budget: "500", jobValue: "500", closeRate: "10", cpl: "45" },
      { id: "2", name: "Recommended", budget: "1000", jobValue: "500", closeRate: "10", cpl: "35" },
      { id: "3", name: "Aggressive", budget: "2000", jobValue: "500", closeRate: "10", cpl: "30" },
    ];
  });
  const [city, setCity] = useState(() => localStorage.getItem("ep_ads_city") || "your city");

  useEffect(() => { localStorage.setItem("ep_ads_scenarios", JSON.stringify(scenarios)); }, [scenarios]);
  useEffect(() => { localStorage.setItem("ep_ads_city", city); }, [city]);

  const update = (id: string, field: keyof AdScenario, val: string) => {
    setScenarios(prev => prev.map(s => s.id === id ? { ...s, [field]: val } : s));
  };

  const calc = (s: AdScenario) => {
    const budget = parseFloat(s.budget) || 0;
    const jobValue = parseFloat(s.jobValue) || 0;
    const closeRate = (parseFloat(s.closeRate) || 0) / 100;
    const cpl = parseFloat(s.cpl) || 1;
    const leads = budget / cpl;
    const jobs = leads * closeRate;
    const revenue = jobs * jobValue;
    const roas = budget > 0 ? revenue / budget : 0;
    const profit = revenue - budget;
    return { leads, jobs, revenue, roas, profit };
  };

  const keywords = [
    "electrician near me","emergency electrician","24 hour electrician","electrician [city]",
    "electrical repair near me","panel upgrade","EV charger installation","ceiling fan installation",
    "outlet installation","light fixture installation","commercial electrician","residential electrician",
    "electrical inspection","generator installation","smoke detector installation","electrical wiring",
    "circuit breaker replacement","electrical panel replacement","home rewiring","subpanel installation",
  ];

  const recommendedDaily = (scenario: AdScenario) => {
    const dailyBudget = (parseFloat(scenario.budget) || 0) / 30;
    return dailyBudget;
  };

  const generateReport = () => {
    const s = scenarios[1];
    const r = calc(s);
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Google Ads Campaign Plan</title>
<style>body{font-family:system-ui;max-width:800px;margin:40px auto;padding:0 20px;color:#1e293b}
h1{background:#0f172a;color:#fff;padding:24px;border-radius:12px}
h2{color:#334155;border-bottom:2px solid #e2e8f0;padding-bottom:8px}
.metric{display:inline-block;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:12px 16px;margin:4px;text-align:center}
.metric strong{display:block;font-size:24px;color:#f59e0b}
table{width:100%;border-collapse:collapse;margin:20px 0}
th,td{padding:10px 12px;border:1px solid #e2e8f0;text-align:center}
th{background:#f1f5f9;font-weight:700}
tr:nth-child(even){background:#f8fafc}
.keyword{display:inline-block;background:#fff;border:1px solid #e2e8f0;border-radius:999px;padding:4px 12px;margin:3px;font-size:13px}
section{margin-bottom:30px}
@media print{body{margin:10px}}
</style></head><body>
<h1>⚡ My Custom Google Ads Campaign Plan — ${new Date().toLocaleDateString()}</h1>
<section>
<h2>📊 Recommended Campaign Summary</h2>
<p><strong>Monthly Budget:</strong> $${s.budget} ($${recommendedDaily(s).toFixed(0)}/day)</p>
<p><strong>Estimated Leads:</strong> ${r.leads.toFixed(1)} per month</p>
<p><strong>Estimated Jobs Won:</strong> ${r.jobs.toFixed(1)} per month</p>
<p><strong>Revenue Potential:</strong> $${r.revenue.toFixed(0)}</p>
<p><strong>ROAS:</strong> ${r.roas.toFixed(1)}x</p>
<p><strong>Net Profit:</strong> $${r.profit.toFixed(0)}</p>
</section>
<section>
<h2>🎯 Recommended Keywords</h2>
<div>${keywords.map(k => `<span class="keyword">${k.replace("[city]", city)}</span>`).join("")}</div>
</section>
<section>
<h2>📋 Campaign Comparison</h2>
<table>
<tr><th>Scenario</th><th>Budget</th><th>Leads</th><th>Jobs</th><th>Revenue</th><th>ROAS</th><th>Profit</th></tr>
${scenarios.map(sc => {
  const res = calc(sc);
  return `<tr>
<td>${sc.name}</td><td>$${sc.budget}</td><td>${res.leads.toFixed(1)}</td>
<td>${res.jobs.toFixed(1)}</td><td>$${res.revenue.toFixed(0)}</td>
<td>${res.roas.toFixed(1)}x</td><td>$${res.profit.toFixed(0)}</td>
</tr>`;}).join("")}
</table>
</section>
<section>
<h2>📝 Social Proof Snippet Generator</h2>
<p style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:16px;font-size:16px;line-height:1.6">
"Trusted by ${city.charAt(0).toUpperCase()+city.slice(1)} homeowners — rated ⭐⭐⭐⭐⭐ 4.9/5 on Google with 50+ five-star reviews. Licensed, bonded, and insured. Call now for a free estimate!"
</p>
</section>
<p style="color:#94a3b8;font-size:12px;margin-top:40px">Generated by PanelElectric PRO</p></body></html>`;
    const win = window.open("","_blank");
    if (win) { win.document.write(html); win.document.close(); }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-slate-900 text-white px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-slate-400 hover:text-white text-sm">← Back</button>
          <span className="text-2xl">🎯</span>
          <div><h1 className="font-black text-lg">Google Ads Calculator</h1><p className="text-slate-400 text-xs">3 campaign scenarios</p></div>
        </div>
        <button onClick={generateReport} className="bg-amber-400 text-slate-900 font-bold px-4 py-2 rounded-xl hover:bg-amber-300 text-sm transition-colors">📄 Get Campaign Plan</button>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Inputs */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h2 className="font-black text-slate-900 text-lg mb-4">Campaign Inputs</h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {["Starter","Recommended","Aggressive"].map((_, i) => (
              <div key={i} className="font-bold text-sm text-center text-slate-500 col-span-2 sm:col-span-1">{scenarios[i]?.name}</div>
            ))}
          </div>
          <div className="space-y-3 mt-3">
            {(["budget","jobValue","closeRate","cpl"] as const).map(field => {
              const labels = { budget:"Monthly Budget ($)", jobValue:"Avg Job Value ($)", closeRate:"Close Rate (%)", cpl:"Cost Per Lead ($)" };
              return (
                <div key={field} className="grid grid-cols-2 sm:grid-cols-5 gap-3 items-center">
                  <label className="text-sm font-semibold text-slate-700">{labels[field]}</label>
                  {scenarios.map(s => (
                    <input key={s.id} type="number" value={s[field]} onChange={e => update(s.id, field, e.target.value)}
                      className="border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                  ))}
                </div>
              );
            })}
          </div>
        </div>

        {/* Results */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h2 className="font-black text-slate-900 text-lg mb-4">📊 Results</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left text-slate-500 font-semibold text-sm py-2">Metric</th>
                  {scenarios.map(s => <th key={s.id} className="text-center text-sm py-2 font-bold text-slate-900">{s.name}</th>)}
                </tr>
              </thead>
              <tbody>
                {([
                  ["leads","Est. Monthly Leads"],
                  ["jobs","Jobs Won / Month"],
                  ["revenue","Revenue Potential"],
                  ["roas","ROAS"],
                  ["profit","Net Profit"],
                ] as const).map(([key, label]) => (
                  <tr key={key} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-2.5 text-sm font-semibold text-slate-700">{label}</td>
                    {scenarios.map(s => {
                      const r = calc(s);
                      const val = r[key as keyof typeof r];
                      const display = key === "roas" ? `${(val as number).toFixed(1)}x` : key === "revenue" || key === "profit" ? `$${(val as number).toLocaleString("en-US",{maximumFractionDigits:0})}` : (val as number).toFixed(1);
                      const color = (key === "profit" && (val as number) < 0) ? "text-red-600" : key === "profit" ? "text-green-600" : "text-slate-900";
                      return <td key={s.id} className={`py-2.5 text-center text-sm font-bold ${color}`}>{display}</td>;
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-sm font-bold text-amber-800">💡 Recommended Daily Budget for Recommended campaign: <span className="text-amber-900">${recommendedDaily(scenarios[1]).toFixed(2)}/day</span></p>
          </div>
        </div>

        {/* Keywords */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h2 className="font-black text-slate-900 text-lg mb-3">🎯 Keyword Ideas</h2>
          <div className="flex flex-wrap gap-2">
            {keywords.map((k, i) => (
              <span key={i} className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full text-sm font-medium">{k.replace("[city]", city)}</span>
            ))}
          </div>
        </div>

        {/* Social Proof */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h2 className="font-black text-slate-900 text-lg mb-3">⭐ Social Proof Snippet</h2>
          <div className="mb-3">
            <label className="text-xs font-bold text-slate-500 uppercase">Your City</label>
            <input value={city} onChange={e => setCity(e.target.value)}
              className="w-full sm:w-64 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-amber-800 font-medium text-sm leading-relaxed">
              "Trusted by {city.charAt(0).toUpperCase()+city.slice(1)} homeowners — rated ⭐⭐⭐⭐⭐ 4.9/5 on Google with 50+ five-star reviews. Licensed, bonded, and insured. Call now for a free estimate!"
            </p>
          </div>
          <button onClick={() => navigator.clipboard.writeText(`"Trusted by ${city.charAt(0).toUpperCase()+city.slice(1)} homeowners — rated ⭐⭐⭐⭐⭐ 4.9/5 on Google with 50+ five-star reviews. Licensed, bonded, and insured. Call now for a free estimate!"`).catch(()=>{})}
            className="mt-3 text-sm text-amber-600 font-bold hover:text-amber-800">📋 Copy to clipboard</button>
        </div>
      </div>
    </div>
  );
}

// ─── APP 5: Insurance & Permit Tracker ─────────────────────────────────────────
function InsuranceApp({ onBack }: { onBack: () => void }) {
  const [items, setItems] = useState<InsuranceItem[]>(() => {
    try { return JSON.parse(localStorage.getItem("ep_insurance") || "null") || defaultInsurance(); } catch { return defaultInsurance(); }
  });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Omit<InsuranceItem,"id">>({ type:"", provider:"", policyNumber:"", expiry:"", premium:"", reminder:"30" });

  useEffect(() => { localStorage.setItem("ep_insurance", JSON.stringify(items)); }, [items]);

  const totalMonthly = items.reduce((s, i) => s + (parseFloat(i.premium) || 0), 0);

  const getStatus = (expiry: string) => {
    if (!expiry) return "none";
    const d = new Date(expiry);
    const now = new Date();
    const daysLeft = Math.ceil((d.getTime() - now.getTime()) / 86400000);
    if (daysLeft < 0) return "red";
    if (daysLeft <= 30) return "amber";
    return "green";
  };

  const addItem = () => {
    if (!form.type) return;
    setItems(prev => [...prev, { ...form, id: Date.now().toString() }]);
    setForm({ type:"", provider:"", policyNumber:"", expiry:"", premium:"", reminder:"30" });
    setShowForm(false);
  };

  const deleteItem = (id: string) => setItems(prev => prev.filter(i => i.id !== id));
  const updateItem = (id: string, field: keyof InsuranceItem, val: string) => setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: val } : i));

  // Calendar: next 6 months
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(); d.setMonth(d.getMonth() + i);
    return { label: d.toLocaleDateString("en-US", { month: "short", year: "numeric" }), year: d.getFullYear(), month: d.getMonth() };
  });

  const expiringThisMonth = (m: number, y: number) => items.filter(i => {
    if (!i.expiry) return false;
    const d = new Date(i.expiry);
    return d.getMonth() === m && d.getFullYear() === y;
  });

  const statusColors = { green: "bg-green-100 text-green-700", amber: "bg-amber-100 text-amber-700", red: "bg-red-100 text-red-700", none: "bg-slate-100 text-slate-400" };
  const statusLabel = { green: "✓ Current", amber: "⚠ Expiring Soon", red: "🔴 Expired", none: "—" };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-slate-900 text-white px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-slate-400 hover:text-white text-sm">← Back</button>
          <span className="text-2xl">🛡️</span>
          <div><h1 className="font-black text-lg">Insurance & Permit Tracker</h1><p className="text-slate-400 text-xs">{items.length} policies</p></div>
        </div>
        <button onClick={() => window.print()} className="text-slate-300 hover:text-white text-sm px-3 py-2 rounded-xl border border-slate-600 mr-2">🖨️ Print</button>
        <button onClick={() => setShowForm(true)} className="bg-amber-400 text-slate-900 font-bold px-4 py-2 rounded-xl hover:bg-amber-300 text-sm transition-colors">+ Add</button>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
            <div className="text-2xl font-black text-green-600">{items.filter(i => getStatus(i.expiry)==="green").length}</div>
            <div className="text-xs text-green-700 font-semibold">Current</div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center">
            <div className="text-2xl font-black text-amber-600">{items.filter(i => getStatus(i.expiry)==="amber").length}</div>
            <div className="text-xs text-amber-700 font-semibold">Expiring Soon</div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center">
            <div className="text-2xl font-black text-red-600">{items.filter(i => getStatus(i.expiry)==="red").length}</div>
            <div className="text-xs text-red-700 font-semibold">Expired</div>
          </div>
          <div className="bg-slate-800 text-white rounded-2xl p-4 text-center">
            <div className="text-2xl font-black text-amber-400">${totalMonthly.toLocaleString()}</div>
            <div className="text-xs text-slate-300 font-semibold">Total Monthly</div>
          </div>
        </div>

        {/* Policy List */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
            <h2 className="font-black text-slate-900">Policies & Permits</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {items.length === 0 && <div className="text-center py-12 text-slate-400">No policies added yet.</div>}
            {items.map(item => {
              const status = getStatus(item.expiry);
              return (
                <div key={item.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-bold text-slate-900">{item.type}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${statusColors[status]}`}>{statusLabel[status]}</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1 text-xs text-slate-500">
                        <div><span className="font-semibold">Provider:</span> {item.provider || "—"}</div>
                        <div><span className="font-semibold">Policy #:</span> {item.policyNumber || "—"}</div>
                        <div><span className="font-semibold">Expires:</span> {item.expiry || "—"}</div>
                        <div><span className="font-semibold">Monthly:</span> {item.premium ? `$${parseFloat(item.premium).toLocaleString()}` : "—"}</div>
                      </div>
                    </div>
                    <button onClick={() => deleteItem(item.id)} className="text-red-400 hover:text-red-600 text-xs">✕</button>
                  </div>
                  <div className="mt-2 flex gap-2 flex-wrap">
                    {(["type","provider","policyNumber","expiry","premium"] as const).map(field => (
                      <input key={field} type={field === "expiry" ? "date" : field === "premium" ? "number" : "text"}
                        placeholder={field.charAt(0).toUpperCase()+field.slice(1)}
                        value={item[field]} onChange={e => updateItem(item.id, field, e.target.value)}
                        className="border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-400 w-36" />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 6-Month Calendar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h2 className="font-black text-slate-900 text-lg mb-4">📅 6-Month Expiry Calendar</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {months.map(m => {
              const expiring = expiringThisMonth(m.month, m.year);
              return (
                <div key={m.label} className={`rounded-xl p-3 border-2 ${expiring.length > 0 ? "border-amber-300 bg-amber-50" : "border-slate-200 bg-white"}`}>
                  <div className="font-bold text-sm text-slate-700 mb-2">{m.label}</div>
                  {expiring.length === 0 && <div className="text-xs text-slate-300">No renewals</div>}
                  {expiring.map(i => (
                    <div key={i.id} className="text-xs bg-red-100 text-red-700 rounded px-1.5 py-0.5 mb-1 font-semibold truncate">{i.type}</div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Add Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-black text-slate-900 text-lg">Add Insurance / Permit</h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 text-xl">✕</button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Type</label>
                <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400">
                  <option value="">Select type...</option>
                  {INSURANCE_TYPES.map(t => <option key={t}>{t}</option>)}
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Provider / Issuing Body</label>
                <input value={form.provider} onChange={e => setForm({...form, provider: e.target.value})} placeholder="e.g. State Farm, City of Toronto"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Policy / License #</label>
                  <input value={form.policyNumber} onChange={e => setForm({...form, policyNumber: e.target.value})}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Expiry Date</label>
                  <input type="date" value={form.expiry} onChange={e => setForm({...form, expiry: e.target.value})}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400" />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Monthly Premium ($)</label>
                <input type="number" value={form.premium} onChange={e => setForm({...form, premium: e.target.value})} placeholder="0"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
              <button onClick={addItem} disabled={!form.type}
                className="w-full bg-amber-400 text-slate-900 font-bold py-3 rounded-xl hover:bg-amber-300 transition-colors disabled:opacity-40">
                Add Policy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── APP 6: Job Pricing Template Builder ─────────────────────────────────────
function PricingApp({ onBack }: { onBack: () => void }) {
  const [categories, setCategories] = useState<PricingCategory[]>(() => {
    try { return JSON.parse(localStorage.getItem("ep_pricing_templates") || "null") || PRICING_CATEGORIES_DEFAULT; } catch { return PRICING_CATEGORIES_DEFAULT; }
  });
  const [expandedCat, setExpandedCat] = useState<string | null>(null);
  const [clientName, setClientName] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [showAddCat, setShowAddCat] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => { localStorage.setItem("ep_pricing_templates", JSON.stringify(categories)); }, [categories]);

  const calcItem = (item: PricingLineItem) => {
    const laborCost = parseFloat(item.laborHours) * parseFloat(item.laborRate);
    const materialCost = parseFloat(item.materialCost);
    const markupAmount = materialCost * (parseFloat(item.markup) / 100);
    const total = laborCost + materialCost + markupAmount;
    return { laborCost, materialCost, markupAmount, total };
  };

  const calcCategory = (cat: PricingCategory) => {
    const items = cat.items.map(i => calcItem(i));
    const laborCost = items.reduce((s, i) => s + i.laborCost, 0);
    const materialCost = items.reduce((s, i) => s + i.materialCost, 0);
    const total = items.reduce((s, i) => s + i.total, 0);
    const profit = total - laborCost - materialCost;
    const margin = total > 0 ? (profit / total) * 100 : 0;
    return { laborCost, materialCost, total, profit, margin };
  };

  const grandTotal = categories.reduce((s, c) => s + calcCategory(c).total, 0);

  const addLineItem = (catId: string) => {
    const id = Date.now().toString();
    setCategories(prev => prev.map(c => c.id === catId ? { ...c, items: [...c.items, { id, description:"", laborHours:"1", laborRate:"95", materialCost:"0", markup:"50" }] } : c));
  };

  const removeLineItem = (catId: string, itemId: string) => {
    setCategories(prev => prev.map(c => c.id === catId ? { ...c, items: c.items.filter(i => i.id !== itemId) } : c));
  };

  const updateLineItem = (catId: string, itemId: string, field: keyof PricingLineItem, val: string) => {
    setCategories(prev => prev.map(c => c.id === catId ? { ...c, items: c.items.map(i => i.id === itemId ? { ...i, [field]: val } : i) } : c));
  };

  const addCategory = () => {
    if (!newCatName) return;
    setCategories(prev => [...prev, { id: Date.now().toString(), name: newCatName, items: [] }]);
    setNewCatName("");
    setShowAddCat(false);
  };

  const removeCategory = (catId: string) => {
    if (confirm("Remove this category?")) setCategories(prev => prev.filter(c => c.id !== catId));
  };

  const saveToStorage = () => { localStorage.setItem("ep_pricing_templates", JSON.stringify(categories)); setSaved(true); setTimeout(() => setSaved(false), 2000); };

  const printQuote = () => {
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Quote</title>
<style>body{font-family:system-ui;max-width:800px;margin:40px auto;padding:0 20px;color:#1e293b}
h1{font-size:28px;font-weight:900;margin-bottom:4px} .addr{color:#64748b;margin-bottom:24px}
table{width:100%;border-collapse:collapse;margin:20px 0} th{background:#f1f5f9;padding:10px 12px;text-align:left;font-size:13px}
td{padding:9px 12px;border-bottom:1px solid #f1f5f9;font-size:13px} .total-row td{font-weight:900;background:#fffbeb}
.cat-header{font-size:16px;font-weight:900;color:#0f172a;margin:24px 0 8px;border-bottom:2px solid #e2e8f0;padding-bottom:6px}
.grand{font-size:24px;font-weight:900;text-align:right;padding:16px 0}
footer{color:#94a3b8;font-size:11px;margin-top:40px;text-align:center}
@media print{body{margin:20px}}
</style></head><body>
<h1>⚡ PanelElectric</h1>
<p>${clientName ? `Prepared for: <strong>${clientName}</strong>` : ""}<br>${clientAddress ? clientAddress : ""}</p>
<p>Date: ${new Date().toLocaleDateString()} &nbsp;|&nbsp; Quote valid for 30 days</p>
<table>
<thead><tr><th>Description</th><th>Labor Hrs</th><th>Labor Rate</th><th>Labor Cost</th><th>Material</th><th>Markup</th><th>Total</th></tr></thead>
<tbody>
${categories.map(cat => {
  const r = calcCategory(cat);
  return `<tr><td colspan="7" class="cat-header">${cat.name}</td></tr>
${cat.items.map(item => {
  const i = calcItem(item);
  return `<tr>
<td>${item.description}</td><td>${item.laborHours}</td><td>$${item.laborRate}/hr</td>
<td>$${i.laborCost.toFixed(2)}</td><td>$${i.materialCost.toFixed(2)}</td>
<td>${item.markup}%</td><td><strong>$${i.total.toFixed(2)}</strong></td>
</tr>`;}).join("")}
<tr class="total-row"><td colspan="7">${cat.name} Total: $${r.total.toFixed(2)} &nbsp;|&nbsp; Profit Margin: ${r.margin.toFixed(1)}%</td></tr>`;}).join("")}
</tbody></table>
<div class="grand">Grand Total: $${grandTotal.toFixed(2)}</div>
<footer>Generated by PanelElectric PRO — Licensed, Bonded & Insured<br>${new Date().toLocaleDateString()}</footer>
</body></html>`;
    const win = window.open("","_blank");
    if (win) { win.document.write(html); win.document.close(); }
  };

  const emailQuote = () => {
    const subject = encodeURIComponent(`Your PanelElectric Quote`);
    const body = encodeURIComponent(`Hi${clientName ? " " + clientName : ""},\n\nPlease find your quote below. This quote is valid for 30 days.\n\nGrand Total: $${grandTotal.toFixed(2)}\n\n${categories.map(cat => `${cat.name}: $${calcCategory(cat).total.toFixed(2)}`).join("\n")}\n\nThank you for considering PanelElectric!\n`);
    window.open(`mailto:${clientName ? clientName : ""}?subject=${subject}&body=${body}`);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-slate-900 text-white px-4 py-4 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-slate-400 hover:text-white text-sm">← Back</button>
          <span className="text-2xl">💰</span>
          <div><h1 className="font-black text-lg">Job Pricing Template Builder</h1><p className="text-slate-400 text-xs">{categories.length} categories</p></div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={saveToStorage} className={`text-slate-300 hover:text-white text-sm px-3 py-2 rounded-xl border border-slate-600 transition-colors`}>
            {saved ? "✓ Saved!" : "💾 Save"}
          </button>
          <button onClick={printQuote} className="bg-slate-700 hover:bg-slate-600 text-white text-sm px-3 py-2 rounded-xl transition-colors">🖨️ Print</button>
          <button onClick={emailQuote} className="bg-amber-400 text-slate-900 font-bold px-4 py-2 rounded-xl hover:bg-amber-300 text-sm transition-colors">📧 Email Quote</button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-5">
        {/* Client Info */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <h2 className="font-bold text-slate-700 text-sm mb-3">Client Information</h2>
          <div className="grid grid-cols-2 gap-3">
            <input value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Client / Business Name"
              className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400" />
            <input value={clientAddress} onChange={e => setClientAddress(e.target.value)} placeholder="Address"
              className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400" />
          </div>
        </div>

        {/* Grand Total */}
        <div className="bg-slate-900 text-white rounded-2xl p-5 flex items-center justify-between">
          <div>
            <h2 className="font-black text-lg">Grand Total</h2>
            <p className="text-slate-400 text-sm">{categories.reduce((s,c)=>s+c.items.length,0)} line items across {categories.length} categories</p>
          </div>
          <div className="text-4xl font-black text-amber-400">${grandTotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </div>

        {/* Categories */}
        {categories.map(cat => {
          const r = calcCategory(cat);
          const isOpen = expandedCat === cat.id;
          return (
            <div key={cat.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <button className="w-full text-left px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                onClick={() => setExpandedCat(isOpen ? null : cat.id)}>
                <div>
                  <h3 className="font-black text-slate-900">{cat.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{cat.items.length} items · Labor: ${r.laborCost.toFixed(0)} · Materials: ${r.materialCost.toFixed(0)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="font-black text-slate-900 text-lg">${r.total.toFixed(2)}</div>
                    <div className={`text-xs font-bold ${r.margin >= 30 ? "text-green-600" : r.margin >= 15 ? "text-amber-600" : "text-red-600"}`}>{r.margin.toFixed(1)}% margin</div>
                  </div>
                  <span className="text-slate-400">{isOpen ? "▲" : "▼"}</span>
                </div>
              </button>

              {isOpen && (
                <div className="border-t border-slate-200 p-4 bg-slate-50">
                  <table className="w-full text-sm mb-4">
                    <thead>
                      <tr className="border-b border-slate-200 text-xs text-slate-500 uppercase">
                        <th className="text-left py-2 pr-2">Description</th>
                        <th className="text-center py-2 px-1 w-16">Hrs</th>
                        <th className="text-center py-2 px-1 w-16">$/Hr</th>
                        <th className="text-right py-2 px-1 w-16">Labor $</th>
                        <th className="text-right py-2 px-1 w-16">Mat'l $</th>
                        <th className="text-center py-2 px-1 w-14">Mkp%</th>
                        <th className="text-right py-2 pl-1 w-20">Total</th>
                        <th className="w-8"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {cat.items.map(item => {
                        const i = calcItem(item);
                        return (
                          <tr key={item.id} className="border-b border-slate-200 hover:bg-white">
                            <td className="py-1.5 pr-1">
                              <input value={item.description} onChange={e => updateLineItem(cat.id, item.id, "description", e.target.value)}
                                className="w-full border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-400" />
                            </td>
                            {(["laborHours","laborRate","materialCost"] as const).map(field => (
                              <td key={field} className="py-1.5 px-0.5">
                                <input type="number" value={item[field]} onChange={e => updateLineItem(cat.id, item.id, field, e.target.value)}
                                  className="w-full border border-slate-200 rounded-lg px-1 py-1 text-xs text-slate-700 text-center focus:outline-none focus:ring-1 focus:ring-amber-400" />
                              </td>
                            ))}
                            <td className="py-1.5 px-0.5">
                              <input type="number" value={item.markup} onChange={e => updateLineItem(cat.id, item.id, "markup", e.target.value)}
                                className="w-full border border-slate-200 rounded-lg px-1 py-1 text-xs text-slate-700 text-center focus:outline-none focus:ring-1 focus:ring-amber-400" />
                            </td>
                            <td className="py-1.5 pl-1 text-right font-bold text-slate-900 text-xs">${i.total.toFixed(2)}</td>
                            <td className="py-1.5 pl-1">
                              <button onClick={() => removeLineItem(cat.id, item.id)} className="text-red-400 hover:text-red-600 text-xs">✕</button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-slate-300 font-bold text-slate-800 text-xs">
                        <td className="pt-2">Total</td>
                        <td className="pt-2 text-center">{cat.items.reduce((s,i)=>s+parseFloat(i.laborHours||"0"),0).toFixed(1)}</td>
                        <td></td>
                        <td className="pt-2 text-right">${r.laborCost.toFixed(2)}</td>
                        <td className="pt-2 text-right">${r.materialCost.toFixed(2)}</td>
                        <td></td>
                        <td className="pt-2 text-right">${r.total.toFixed(2)}</td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                  <button onClick={() => addLineItem(cat.id)}
                    className="text-sm text-amber-600 font-bold hover:text-amber-800 px-3 py-1.5 rounded-lg border border-amber-200 hover:bg-amber-50 transition-colors">
                    + Add Line Item
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {/* Add Category */}
        {showAddCat ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-4">
            <div className="flex gap-2 items-center">
              <input value={newCatName} onChange={e => setNewCatName(e.target.value)} placeholder="Category name (e.g. Solar Installation)"
                className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400" />
              <button onClick={addCategory} className="bg-amber-400 text-slate-900 font-bold px-4 py-2 rounded-xl hover:bg-amber-300 text-sm">Add</button>
              <button onClick={() => setShowAddCat(false)} className="text-slate-400 hover:text-slate-600 text-sm">Cancel</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setShowAddCat(true)}
            className="w-full border-2 border-dashed border-slate-300 text-slate-500 font-bold py-4 rounded-2xl hover:border-amber-400 hover:text-amber-600 transition-colors text-sm">
            + Add Category
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Default Insurance Data ────────────────────────────────────────────────────
function defaultInsurance(): InsuranceItem[] {
  return [
    { id: "1", type: "General Liability", provider: "", policyNumber: "", expiry: "", premium: "350", reminder: "30" },
    { id: "2", type: "Workers Compensation", provider: "", policyNumber: "", expiry: "", premium: "450", reminder: "30" },
    { id: "3", type: "Contractor's Bond", provider: "", policyNumber: "", expiry: "", premium: "75", reminder: "60" },
    { id: "4", type: "Electrical License Bond", provider: "", policyNumber: "", expiry: "", premium: "50", reminder: "90" },
    { id: "5", type: "Master Electrician License", provider: "", policyNumber: "", expiry: "", premium: "0", reminder: "90" },
    { id: "6", type: "Business License", provider: "", policyNumber: "", expiry: "", premium: "0", reminder: "365" },
    { id: "7", type: "Commercial Vehicle Insurance", provider: "", policyNumber: "", expiry: "", premium: "200", reminder: "30" },
  ];
}

// ─── Main DocumentsPage Component ─────────────────────────────────────────────
function DocumentsPageComponent() {
  const { subscription } = useAuth();
  const userTier = (subscription.tier || "none") as Tier;
  const [tab, setTab] = useState<"apps"|"downloads">("apps");
  const [tier, setTier] = useState<string>("all");
  const [openApp, setOpenApp] = useState<string | null>(null);

  const docsShown = tier === "all" ? DOCS : DOCS.filter(d => d.tier === tier);

  const renderApp = () => {
    switch (openApp) {
      case "nec": return <NecApp onBack={() => setOpenApp(null)} />;
      case "seo": return <SeoApp onBack={() => setOpenApp(null)} />;
      case "hiring": return <HiringApp onBack={() => setOpenApp(null)} />;
      case "ads": return <TierGate required="business"><AdsApp onBack={() => setOpenApp(null)} /></TierGate>;
      case "insurance": return <TierGate required="business"><InsuranceApp onBack={() => setOpenApp(null)} /></TierGate>;
      case "pricing": return <PricingApp onBack={() => setOpenApp(null)} />;
      default: return null;
    }
  };

  if (openApp) return renderApp();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-slate-900 text-white px-6 py-4 flex items-center gap-4">
        <Link to="/dashboard" className="text-slate-400 hover:text-white text-sm">← Back to Dashboard</Link>
        <span className="text-2xl">📄</span>
        <div>
          <h1 className="font-black">Documents &amp; Apps</h1>
          <p className="text-slate-400 text-sm">Tools, templates &amp; calculators</p>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setTab("apps")}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-colors ${tab === "apps" ? "bg-slate-900 text-white" : "bg-white border border-gray-200 text-slate-600 hover:bg-slate-50"}`}
          >
            ⚡ Apps ({APPS.length})
          </button>
          <button
            onClick={() => setTab("downloads")}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-colors ${tab === "downloads" ? "bg-slate-900 text-white" : "bg-white border border-gray-200 text-slate-600 hover:bg-slate-50"}`}
          >
            📥 Downloads ({DOCS.length})
          </button>
        </div>

        {tab === "apps" && (
          <div>
            <p className="text-slate-500 text-sm mb-6">Powerful tools built right into your membership. Click any app to open it.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {APPS.map(app => {
                const locked = !tierGte(userTier, app.tier);
                return (
                  <button
                    key={app.id}
                    onClick={() => !locked && setOpenApp(app.id)}
                    className={`text-left rounded-2xl overflow-hidden border transition-all duration-200 ${locked ? "opacity-60 cursor-not-allowed border-slate-200 bg-slate-100" : "hover:shadow-lg hover:-translate-y-0.5 border-slate-200 bg-white hover:border-amber-300"}`}
                  >
                    <div className="h-36 bg-slate-800 flex items-center justify-center relative">
                      <img
                        src={app.thumb}
                        alt={app.name}
                        className="w-full h-full object-cover opacity-80"
                        onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent flex items-end p-3">
                        <span className="text-3xl">{app.emoji}</span>
                      </div>
                      {locked && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <span className="text-3xl">🔒</span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-black text-slate-900 text-sm">{app.name}</h3>
                        <TierBadge tier={app.tier} />
                      </div>
                      <p className="text-slate-500 text-xs leading-relaxed">{app.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {tab === "downloads" && (
          <div>
            <div className="flex gap-2 mb-6 flex-wrap">
              {(["all", "Foundation", "Business", "Growth"] as string[]).map((l) => {
                const v = l === "all" ? "all" : l.toLowerCase();
                return (
                  <button
                    key={l}
                    onClick={() => setTier(v)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${tier === v ? "bg-slate-900 text-white" : "bg-white border border-gray-200 text-slate-600 hover:bg-slate-50"}`}
                  >
                    {l}
                  </button>
                );
              })}
            </div>
            <div className="space-y-3">
              {docsShown.map(doc => (
                <div
                  key={doc.name}
                  className="bg-white rounded-xl border border-gray-100 p-5 flex items-center justify-between hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{doc.emoji}</span>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-slate-900">{doc.name}</h3>
                        <TierBadge tier={doc.tier as Tier} />
                      </div>
                      <p className="text-slate-500 text-sm">{doc.desc}</p>
                    </div>
                  </div>
                  <a
                    href="#"
                    className="bg-amber-400 text-slate-900 font-bold px-4 py-2 rounded-xl hover:bg-amber-300 text-sm flex-shrink-0 ml-4"
                  >
                    Download
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DocumentsPageComponent;

