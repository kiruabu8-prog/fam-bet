import React, { useState, useEffect } from "react";
import { Language, InvestmentPlan, UserProfile, InvestmentOrder } from "../types";
import { getTranslation } from "../translations";
import { Check, Flame, HelpCircle, ShieldCheck, Sparkles, TrendingUp, AlertCircle } from "lucide-react";

const INVESTMENT_PLANS: InvestmentPlan[] = [
  {
    id: "ft-match",
    nameEn: "Full Time Match VIP",
    nameAm: "ሙሉ ሰዓት ጨዋታ ቪአይፒ (Full Time Match)",
    minInvestment: 5000,
    expectedRoiPercent: 150, // 2.5x multiplier
    durationDays: 1,
    commissionPercent: 10,
    descriptionEn: "Highly vetted premium 1-day Full Time outcome selection ticket. Extremely reliable and high probability.",
    descriptionAm: "ለ1 ቀን የሚቆይ አስተማማኝ ሙሉ ሰዓት (FT) የጨዋታ ውጤትን ያካተተ ምርጥ የፋም ቤት የኢንቨስትመንት ጥቅል።",
  },
  {
    id: "single-correct-score",
    nameEn: "Single Correct Score VIP",
    nameAm: "ነጠላ ኮሬክት ስኮር ቪአይፒ (Single Correct Score)",
    minInvestment: 15000,
    expectedRoiPercent: 350, // 4.5x multiplier
    durationDays: 1,
    commissionPercent: 12,
    descriptionEn: "High-probability premium single-day correct score selection for secure maximization.",
    descriptionAm: "የዕለቱ ከፍተኛ ዕድልና ሚስጥራዊ ትንታኔ የተሰራበት ነጠላ የኮሬክት ስኮር ውጤት ጥቅል።",
  },
  {
    id: "vip-3-correct-score",
    nameEn: "VIP 3 Correct Score",
    nameAm: "ቪአይፒ 3 ኮሬክት ስኮር (VIP 3 Correct Score)",
    minInvestment: 40000,
    expectedRoiPercent: 850, // 9.5x multiplier
    durationDays: 1,
    commissionPercent: 15,
    descriptionEn: "Exclusive premium high-stake VIP syndicate. Covers all 3 absolute correct score selections for ultimate yield.",
    descriptionAm: "3ቱንም የኮሬክት ስኮር ምርጫዎች በአንድ ላይ ያካተተ እጅግ ታላቅ የ1 ቀን ቪአይፒ ጥቅል።",
  }
];

interface RoiPlannerProps {
  lang: Language;
  currentUser: UserProfile | null;
  onTriggerLogin: () => void;
  activeOrders: InvestmentOrder[];
  setActiveOrders: React.Dispatch<React.SetStateAction<InvestmentOrder[]>>;
}


// Static premium advice unlocked for active paid tickets
export const SECRET_TICKETS_DATA: Record<string, {
  fixture: string;
  league: string;
  advice: string;
  adviceAm: string;
  score: string;
  odds: string;
  kickoff: string;
  token: string;
}[]> = {
  "ft-match": [
    {
      fixture: "Real Madrid vs Atletico Madrid",
      league: "La Liga (Spain)",
      advice: "Confidence 98%: Tactical defensive setups align for a clean Home victory.",
      adviceAm: "የእድል መጠን 98%፡ የሁለቱ ቡድኖች ታክቲካዊ የመከላከል ብቃት አስተማማኝ የሜዳው ባለቤት ድልን ያሳያል።",
      score: "Home Win (Expected Score: 2-0)",
      odds: "3.20", // 2.0 - 3.5 range as requested by the user
      kickoff: "Tonight 21:45 LT",
      token: "RM-ATM-FT-98711"
    }
  ],
  "single-correct-score": [
    {
      fixture: "Manchester City vs Arsenal",
      league: "Premier League (England)",
      advice: "Confidence 95%: Confirmed private squad news hints key defensive gaps for guests.",
      adviceAm: "የእድል መጠን 95%፡ የተረጋገጡ የውስጥ ዜናዎች ለእንግዳው ቡድን የመከላከል ክፍተቶች እንዳሉ ይጠቅሳሉ።",
      score: "Correct Score: 2 - 1",
      odds: "9.50", // 5+ range as requested by the user
      kickoff: "Tonight 20:30 LT",
      token: "MC-ARS-CS-61102"
    }
  ],
  "vip-3-correct-score": [
    {
      fixture: "Inter Milan vs AC Milan",
      league: "Serie A (Italy)",
      advice: "Derby masterclass setup with superior midfielder line-ups.",
      adviceAm: "የሚላን ደርቢ ፍልሚያ ታሪካዊ የሜዳ የበላይነት ውጤት ትንታኔ።",
      score: "Correct Score: 2 - 0",
      odds: "8.50",
      kickoff: "Tonight 21:00 LT",
      token: "CS-01"
    },
    {
      fixture: "Bayern Munich vs Dortmund",
      league: "Bundesliga (Germany)",
      advice: "Der Klassiker dynamic high scoring. Guests lack core keeper.",
      adviceAm: "ደር ክላሲከር ደማቅና በርካታ ግቦች የሚቆጠሩበት ጨዋታ።",
      score: "Correct Score: 3 - 1",
      odds: "11.00",
      kickoff: "Tonight 19:30 LT",
      token: "CS-02"
    },
    {
      fixture: "PSG vs Marseille",
      league: "Ligue 1 (France)",
      advice: "Paris home dominance. Key forwards confirm readiness.",
      adviceAm: "የፓሪሱ ንጉስ የፈረንሳይ ሊግ የበላይነት ጨዋታ ውጤት።",
      score: "Correct Score: 3 - 0",
      odds: "9.00",
      kickoff: "Tonight 22:00 LT",
      token: "CS-03"
    }
  ]
};

export default function RoiPlanner({ lang, currentUser, onTriggerLogin, activeOrders, setActiveOrders }: RoiPlannerProps) {
  const [selectedPlanId, setSelectedPlanId] = useState<string>(INVESTMENT_PLANS[1].id);
  const [customAmount, setCustomAmount] = useState<number>(INVESTMENT_PLANS[1].minInvestment);
  const [showCheckout, setShowCheckout] = useState<boolean>(false);
  const [selectedBank, setSelectedBank] = useState<string>("CBE");
  const [userBankNo, setUserBankNo] = useState<string>("");
  const [userBankHolder, setUserBankHolder] = useState<string>("");


  const selectedPlan = INVESTMENT_PLANS.find((p) => p.id === selectedPlanId) || INVESTMENT_PLANS[1];

  // Adjust custom amount to exactly match the fixed ticket cost
  const handlePlanSelect = (plan: InvestmentPlan) => {
    setSelectedPlanId(plan.id);
    setCustomAmount(plan.minInvestment);
  };

  // Static Ticket parameters instead of variable investor ROI splits
  const getTicketEstimatedOdds = (id: string) => {
    if (id === "ft-match") return "2.0 - 3.5";
    if (id === "single-correct-score") return "5+";
    return "300+";
  };

  const getTicketAdvicesCount = (id: string) => {
    if (id === "ft-match") return lang === "en" ? "1 Full-Time Selection" : "1 ሙሉ ጊዜ ጨዋታ";
    if (id === "single-correct-score") return lang === "en" ? "1 Correct Score Selection" : "1 ኮሬክት ስኮር ጨዋታ";
    return lang === "en" ? "3 Combined Correct Scores Bundle" : "3 ደራራቢ የኮሬክት ስኮር ጨዋታዎች";
  };

  // Generate simulated growth values based on historical win records
  const steps = 4;
  const chartPoints = [
    { step: 0, value: 12 },
    { step: 1, value: 38 },
    { step: 2, value: 145 },
    { step: 3, value: 410 },
    { step: 4, value: 841 }
  ];

  const maxChartValue = 1000;
  const minChartValue = 10;
  
  const width = 500;
  const height = 150;
  const paddingLeft = 60;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;

  const getX = (index: number) => {
    return paddingLeft + (index / steps) * (width - paddingLeft - paddingRight);
  };

  const getY = (value: number) => {
    const scale = (height - paddingTop - paddingBottom) / (maxChartValue - minChartValue);
    return height - paddingBottom - (value - minChartValue) * scale;
  };

  // Create SVG path string
  let pathStr = `M ${getX(0)} ${getY(chartPoints[0].value)}`;
  for (let i = 1; i <= steps; i++) {
    pathStr += ` L ${getX(i)} ${getY(chartPoints[i].value)}`;
  }

  const areaPathStr = `${pathStr} L ${getX(steps)} ${height - paddingBottom} L ${getX(0)} ${height - paddingBottom} Z`;

  const handleRequestAllocation = () => {
    setShowCheckout(true);
  };

  const handleConfirmOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!userBankNo.trim() || !userBankHolder.trim()) {
      return;
    }

    const randSuffix = Math.floor(1000 + Math.random() * 9000).toString();
    const generatedOrderId = `FB0132-${randSuffix}`;

    const newOrder: InvestmentOrder = {
      orderId: generatedOrderId,
      planId: selectedPlan.id,
      planName: lang === "en" ? selectedPlan.nameEn : selectedPlan.nameAm,
      amount: selectedPlan.minInvestment, // Fixed ticket price
      expectedReturn: 0, // No residual payouts, pure match ticket delivery
      status: "PENDING_PAYMENT",
      createdAt: new Date().toLocaleDateString(lang === "en" ? "en-US" : "am-ET", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      bankName: selectedBank,
      bankAccountNo: userBankNo.trim(),
      bankAccountHolder: userBankHolder.trim(),
      depositMethod: `${selectedBank} Verification Reference`,
    };

    const updatedOrders = [newOrder, ...activeOrders];
    setActiveOrders(updatedOrders);
    
    try {
      localStorage.setItem("fambet_investment_orders", JSON.stringify(updatedOrders));
    } catch (e) {
      console.error(e);
    }

    setShowCheckout(false);
    setUserBankNo("");
    setUserBankHolder("");
  };

  const handleVerifyPayment = (orderId: string) => {
    const updated = activeOrders.map((o) => {
      if (o.orderId === orderId) {
        return { ...o, status: "ACTIVE" as const };
      }
      return o;
    });
    setActiveOrders(updated);
    try {
      localStorage.setItem("fambet_investment_orders", JSON.stringify(updated));
    } catch {}
  };

  const handleCancelOrder = (orderId: string) => {
    const filtered = activeOrders.filter((o) => o.orderId !== orderId);
    setActiveOrders(filtered);
    try {
      localStorage.setItem("fambet_investment_orders", JSON.stringify(filtered));
    } catch {}
  };

  return (
    <div className="space-y-8">
      {/* Introduction */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono font-bold uppercase">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{getTranslation(lang, "quickStats").split("(")[0]}</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-sans font-bold text-white tracking-tight">
          {getTranslation(lang, "investmentPlanTitle")}
        </h2>
        <p className="text-zinc-400 text-sm leading-relaxed">
          {getTranslation(lang, "investmentSubtitle")}
        </p>
      </div>

      {/* Grid of packages */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {INVESTMENT_PLANS.map((plan) => {
          const isActive = plan.id === selectedPlanId;
          return (
            <button
              key={plan.id}
              onClick={() => handlePlanSelect(plan)}
              className={`relative text-left p-6 rounded-3xl border-2 transition-all flex flex-col justify-between ${
                isActive
                   ? "bg-zinc-900 border-amber-500 shadow-xl shadow-amber-500/5 ring-1 ring-amber-500/20"
                  : "bg-zinc-950 border-zinc-850 hover:border-zinc-800"
              }`}
            >
              <div className="w-full">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-2 rounded-xl ${isActive ? "bg-amber-500/10 text-amber-400" : "bg-zinc-900 text-zinc-500"}`}>
                    <Flame className="w-5 h-5" />
                  </div>
                  {isActive && (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-black font-mono font-bold text-[10px] uppercase">
                      Selected
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold text-white">
                  {lang === "en" ? plan.nameEn : plan.nameAm}
                </h3>
                <p className="text-zinc-500 text-xs mt-2 min-h-12">
                  {lang === "en" ? plan.descriptionEn : plan.descriptionAm}
                </p>

                <div className="mt-5 space-y-2 border-t border-zinc-900 pt-4">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-zinc-500">{getTranslation(lang, "minInvestment")}</span>
                    <span className="text-white font-semibold">
                      {plan.minInvestment.toLocaleString()} ETB
                    </span>
                  </div>
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-zinc-500">{getTranslation(lang, "duration")}</span>
                    <span className="text-zinc-300">
                      {plan.durationDays} {lang === "en" ? "Days" : "ቀናት"}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-zinc-500">{getTranslation(lang, "roiRate")}</span>
                    <span className="text-emerald-400 font-bold">{getTicketEstimatedOdds(plan.id)}</span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Simulator Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-zinc-900/60 p-6 md:p-8 rounded-3xl border border-zinc-850">
        
        {/* Left column: fixed ticket info summary */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h4 className="text-base font-semibold text-white">
              {lang === "en" ? "Ticket Order Desk Summary" : "የቲኬት ማዘዣ ሰሌዳ ዝርዝር"}
            </h4>
          </div>

          <div className="space-y-4">
            <div className="bg-zinc-950 p-5 rounded-2.5xl border border-zinc-900 space-y-4">
              <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
                <span className="text-[10px] uppercase font-mono text-zinc-500">{lang === "en" ? "Selected Package" : "የተመረጠው ጥቅል"}</span>
                <span className="text-white font-bold font-mono text-sm">
                  {lang === "en" ? selectedPlan.nameEn : selectedPlan.nameAm}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pb-2">
                <div className="bg-zinc-900/40 p-3.5 rounded-xl border border-zinc-900/40">
                  <span className="block text-[9px] text-zinc-500 font-mono uppercase">
                    {lang === "en" ? "Fixed Cost" : "የትኬት ዋጋ (የማይለወጥ)"}
                  </span>
                  <span className="block text-base font-bold font-mono text-amber-500 mt-0.5">
                    {selectedPlan.minInvestment.toLocaleString()} ETB
                  </span>
                </div>
                <div className="bg-zinc-900/40 p-3.5 rounded-xl border border-zinc-900/40">
                  <span className="block text-[9px] text-zinc-300 font-mono uppercase">
                    {lang === "en" ? "Platform Fee" : "የፕላትፎርም ኮሚሽን"}
                  </span>
                  <span className="block text-xs font-bold font-mono text-zinc-400 mt-1 uppercase">
                    {lang === "en" ? "Included" : "የተካተተ"}
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-xs font-mono text-zinc-400 border-t border-zinc-900 pt-3">
                <div className="flex justify-between">
                  <span>{lang === "en" ? "Est. Total Odds:" : "ግልጽ አማካይ ዕድል:"}</span>
                  <span className="text-emerald-400 font-bold">{getTicketEstimatedOdds(selectedPlan.id)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{lang === "en" ? "Total Matches:" : "የጨዋታዎች ብዛት:"}</span>
                  <span className="text-zinc-200">{getTicketAdvicesCount(selectedPlan.id)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{lang === "en" ? "Delivery Guarantee:" : "የማግኘት ማረጋገጫ:"}</span>
                  <span className="text-white font-bold">{lang === "en" ? "Instant Premium Access" : "ፈጣን የቪአይፒ ሊንክ"}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleRequestAllocation}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-450 hover:to-amber-550 text-black font-sans font-bold text-sm tracking-wide transition-all shadow-lg hover:shadow-orange-950/20 uppercase"
            >
              {lang === "en" ? `Buy VIP Ticket - ${selectedPlan.minInvestment.toLocaleString()} ETB` : `የቪአይፒ ቲኬቱን ይግዙ - ${selectedPlan.minInvestment.toLocaleString()} ብር`}
            </button>
          </div>
        </div>

        {/* Right column: SVG analytics graph */}
        <div className="flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-mono tracking-wider text-amber-500 uppercase font-semibold">
              {lang === "en" ? "99.2% Proven Success Index" : "99.2% የተረጋገጠ የአሸናፊነት ታሪክ"}
            </span>
            <h5 className="text-sm font-sans font-medium text-white tracking-tight mt-1">
              {getTranslation(lang, "roiProjection")}
            </h5>
          </div>

          <div className="my-4 bg-zinc-950 p-4 rounded-2.5xl border border-zinc-900/60 flex items-center justify-center">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full overflow-visible">
              <defs>
                {/* Grid Gradient */}
                <linearGradient id="chart-area-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line
                x1={paddingLeft}
                y1={paddingTop}
                x2={width - paddingRight}
                y2={paddingTop}
                stroke="#18181b"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <line
                x1={paddingLeft}
                y1={getY((maxChartValue + minChartValue) / 2)}
                x2={width - paddingRight}
                y2={getY((maxChartValue + minChartValue) / 2)}
                stroke="#18181b"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <line
                x1={paddingLeft}
                y1={height - paddingBottom}
                x2={width - paddingRight}
                y2={height - paddingBottom}
                stroke="#27272a"
                strokeWidth="1"
              />

              {/* Area Under Curve */}
              <path d={areaPathStr} fill="url(#chart-area-grad)" />

              {/* Main Line */}
              <path
                d={pathStr}
                fill="none"
                stroke="#d97706"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Nodes / Dots */}
              {chartPoints.map((pt, i) => (
                <g key={i}>
                  <circle
                    cx={getX(i)}
                    cy={getY(pt.value)}
                    r="4.5"
                    fill="#09090b"
                    stroke="#f59e0b"
                    strokeWidth="2"
                  />
                  {/* Label Text for endpoints */}
                  {(i === 0 || i === steps) && (
                    <text
                      x={getX(i)}
                      y={getY(pt.value) - 10}
                      textAnchor="middle"
                      fill="#a1a1aa"
                      className="font-mono text-[9px] font-semibold"
                    >
                      {pt.value.toLocaleString()} ETB
                    </text>
                  )}
                </g>
              ))}

              {/* X Axis labels */}
              {Array.from({ length: steps + 1 }).map((_, i) => (
                <text
                  key={i}
                  x={getX(i)}
                  y={height - 12}
                  textAnchor="middle"
                  fill="#52525b"
                  className="font-mono text-[9px]"
                >
                  {i === 0 ? "0h" : `${i * 6}h`}
                </text>
              ))}

              {/* Y Axis labels */}
              <text
                x={paddingLeft - 10}
                y={paddingTop + 4}
                textAnchor="end"
                fill="#52525b"
                className="font-mono text-[9px]"
              >
                1.0k
              </text>
              <text
                x={paddingLeft - 10}
                y={height - paddingBottom}
                textAnchor="end"
                fill="#52525b"
                className="font-mono text-[9px]"
              >
                0.1k
              </text>
            </svg>
          </div>

          <div className="flex gap-4 p-4 rounded-2xl bg-zinc-950/40 text-xs">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <p className="text-zinc-500 leading-normal">
              {getTranslation(lang, "disclaimer")}
            </p>
          </div>
        </div>
      </div>

      {/* RENDER ACTIVE USER FIXED TICKET PURCHASES */}
      {currentUser && currentUser.isLoggedIn && activeOrders.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-zinc-900">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-500" />
            <h3 className="text-lg font-semibold text-zinc-100 font-sans tracking-tight">
              {lang === "en" ? "My Purchased Premium VIP Tickets" : "የእኔ የተገዙ ቪአይፒ ቋሚ ትኬቶች"}
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {activeOrders.map((order) => {
              const matches = SECRET_TICKETS_DATA[order.planId] || [];
              const isPending = order.status === "PENDING_PAYMENT";

              return (
                <div 
                  key={order.orderId}
                  className={`bg-zinc-950 border p-6 rounded-3xl space-y-5 relative overflow-hidden transition-all duration-300 ${
                    isPending 
                      ? "border-zinc-900" 
                      : "border-amber-500/40 shadow-xl shadow-amber-500/5 bg-gradient-to-b from-zinc-950 to-zinc-900/40"
                  }`}
                >
                  <div className="absolute top-0 right-0 p-3 text-[9px] font-mono text-amber-500/10 bg-amber-500/5 uppercase rounded-bl-xl font-bold">
                    {isPending ? "Pending Verification" : "VIP Verified Access"}
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <span className="text-[10px] font-mono text-zinc-500 uppercase">VIP Access Slip ID</span>
                      <h4 className="text-sm font-bold font-mono text-amber-400 tracking-wider">
                        {order.orderId}
                      </h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase">Verification Status:</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider ${
                        isPending 
                          ? "bg-amber-500/10 border border-amber-500/20 text-yellow-500 animate-pulse" 
                          : "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                      }`}>
                        {isPending 
                          ? (lang === "en" ? "Awaiting Deposit Match" : "ዝውውር በመጠባበቅ ላይ") 
                          : (lang === "en" ? "Fully Unlocked" : "ሙሉ በሙሉ የተከፈተ")}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono border-y border-zinc-900/60 py-4">
                    <div>
                      <span className="text-zinc-550 block text-[9px] uppercase">{lang === "en" ? "Package Purchased" : "የተገዛው ጥቅል"}</span>
                      <span className="text-white font-semibold">{order.planName}</span>
                    </div>
                    <div>
                      <span className="text-zinc-550 block text-[9px] uppercase">{lang === "en" ? "Price Paid" : "የተከፈለው ዋጋ"}</span>
                      <span className="text-zinc-250 font-bold block">{order.amount.toLocaleString()} ETB</span>
                    </div>
                    <div>
                      <span className="text-zinc-550 block text-[9px] uppercase">{lang === "en" ? "Payment Channel" : "የክፍያ መስመር"}</span>
                      <span className="text-amber-500 font-bold uppercase">{order.bankName}</span>
                    </div>
                    <div>
                      <span className="text-zinc-550 block text-[9px] uppercase">{lang === "en" ? "Registration Date" : "የምዝገባ ቀን"}</span>
                      <span className="text-zinc-300">{order.createdAt}</span>
                    </div>
                  </div>

                  {/* INTERACTIVE HIDE/REVEAL BLOCK: THAT THEY PAY THEY GET WHAT THEY PURCHASED */}
                  {isPending ? (
                    <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-900 space-y-4 text-center">
                      <div className="max-w-md mx-auto space-y-2">
                        <h5 className="text-sm font-bold text-zinc-200">
                          {lang === "en" ? "🔐 Fixed Matches Locked" : "🔐 ቋሚ ጨዋታዎች ተቆልፈዋል"}
                        </h5>
                        <p className="text-[11px] text-zinc-500 leading-relaxed">
                          {lang === "en" 
                            ? "Complete your bank transfer of the specified amount to our CBE/Telebirr account. The Administrator will review your transfer log and approve VIP ticket access manually. For fast activation, forward your receipt to @FAMbet161 on Telegram."
                            : "እባክዎን ከላይ የተመለከተውን የትኬት ዋጋ በሲቢኢ (CBE) ወይም ቴሌቢር (Telebirr) ያስተላልፉ። አስተዳዳሪው የባንክ ዝውውር መዝገብዎን በማየት የቪአይፒ ጨዋታዎች መመልከቻ ፍቃድዎን በታማኝነት ይከፍታል። ለፈጣን ማረጋገጫ የደረሰኝ ስክሪንሹት በቴሌግራም @FAMbet161 ይላኩልን።"}
                        </p>
                      </div>

                      <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
                        <div className="px-5 py-2.5 bg-zinc-900 border border-zinc-850 text-amber-500 text-xs font-bold font-mono rounded-xl uppercase tracking-wider flex items-center justify-center gap-1.5 animate-pulse">
                          <span>⏳ Awaiting Admin Approval</span>
                        </div>
                        <button
                          onClick={() => handleCancelOrder(order.orderId)}
                          className="px-5 py-2.5 bg-zinc-900 hover:bg-red-950/20 text-zinc-500 hover:text-red-400 text-xs font-mono rounded-xl uppercase transition-all"
                        >
                          {lang === "en" ? "Cancel Order" : "ትዕዛዝ ሰርዝ"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    // REVEALED PORTAL: HIGH FIDELITY LOCKED FIXED TICKETS UNLOCKED HERE DIRECTLY
                    <div className="space-y-4 animate-fade-in p-1">
                      <div className="flex items-center gap-2 text-emerald-400 font-mono text-[10px] uppercase font-bold tracking-wider">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                        <span>{lang === "en" ? "Direct Connection Unlocked - Access Token: Active" : "የቪአይፒ ጨዋታዎች በተሳካ ሁኔታ ተከፍተዋል - የፈቃድ ቁልፍ፡ ገባሪ"}</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {matches.map((match, idx) => (
                          <div 
                            key={idx}
                            className="bg-black/40 border border-emerald-500/20 p-4.5 rounded-2xl space-y-3 relative"
                          >
                            <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[8px] font-mono font-bold uppercase">
                              {match.league}
                            </div>
                            
                            <div className="space-y-1">
                              <span className="text-[9px] font-mono text-zinc-500 uppercase block">{lang === "en" ? "Match Selection" : "የጨዋታ ምርጫ"}</span>
                              <span className="text-white font-bold text-sm">{match.fixture}</span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-zinc-900/30 p-2.5 rounded-xl">
                              <div>
                                <span className="text-zinc-500 text-[9px] uppercase tracking-wider block">{lang === "en" ? "Fixed Correct Score" : "ቋሚ የታሰበ ውጤት"}</span>
                                <span className="text-amber-400 font-bold text-base">{match.score}</span>
                              </div>
                              <div className="text-right">
                                <span className="text-zinc-500 text-[9px] uppercase tracking-wider block">{lang === "en" ? "Odds" : "ዕድል"}</span>
                                <span className="text-white font-extrabold text-base">@{match.odds}</span>
                              </div>
                            </div>

                            <div className="text-[10px] text-zinc-400 leading-relaxed font-mono pt-1">
                              <span className="text-emerald-500 font-bold block text-[8px] uppercase tracking-wider mb-0.5">{lang === "en" ? "CONFIDENTIAL TIPSTER ADVICE:" : "ሚስጥራዊ የተንታኝ መረጃ፡"}</span>
                              {lang === "en" ? match.advice : match.adviceAm}
                            </div>

                            <div className="flex justify-between text-[9px] font-mono text-zinc-550 border-t border-zinc-900 pt-2 mt-2">
                              <span>Kickoff: {match.kickoff}</span>
                              <span>SEC-ID: {match.token}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={() => handleCancelOrder(order.orderId)}
                        className="w-full sm:w-auto px-4 py-2 bg-zinc-900/60 hover:bg-zinc-900 text-zinc-400 hover:text-white transition-all font-mono text-[9px] uppercase rounded-xl border border-zinc-900"
                      >
                        {lang === "en" ? "Archive Ticket" : "ትኬቱን አስቀምጥ (አግልል)"}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CHECKOUT MODAL DRAWER - BANK SETUP AND ORDER GENERATION */}
      {showCheckout && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-lg bg-zinc-950 border border-zinc-850 rounded-[32px] p-6 space-y-6 shadow-2xl relative overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center border-b border-zinc-900 pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase text-amber-500 tracking-wider font-semibold">
                  Secure Checkout Portal
                </span>
                <h3 className="text-base font-bold text-white font-sans mt-0.5">
                  {lang === "en" ? "VIP Ticket Subscription Booking" : "ለቪአይፒ የ1 ቀን ጥቅል መመዝገቢያ ድልድይ"}
                </h3>
              </div>
              <button 
                onClick={() => setShowCheckout(false)}
                className="text-zinc-500 hover:text-white font-mono text-xs focus:outline-none"
              >
                ✕ Close
              </button>
            </div>

            {!currentUser || !currentUser.isLoggedIn ? (
              // Login shield if checkout is triggered but not signed-in
              <div className="text-center py-6 space-y-4">
                <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto text-red-400">
                  <AlertCircle className="w-6 h-6 animate-bounce" />
                </div>
                <div className="space-y-2 max-w-xs mx-auto">
                  <h4 className="text-sm font-bold text-white">Gmail Verification Required</h4>
                  <p className="text-[11px] text-zinc-400 leading-normal">
                    You must authorize your Google account before generating a premium tracking order reference and configuring your receiving bank account.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowCheckout(false);
                    onTriggerLogin();
                  }}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-450 text-black font-sans font-bold text-xs uppercase tracking-widest transition-all shadow-md mx-auto block"
                >
                  Go to Social Sign In
                </button>
              </div>
            ) : (
              // Full checkout flow
              <form onSubmit={handleConfirmOrder} className="space-y-5">
                {/* Plan Highlights summary inside drawer */}
                <div className="bg-zinc-900/60 p-4 rounded-2xl border border-zinc-900 grid grid-cols-2 gap-3 text-xs font-mono">
                  <div>
                    <span className="text-zinc-500 block text-[9px] uppercase">Ticket Package Chosen</span>
                    <span className="text-white font-bold">{lang === "en" ? selectedPlan.nameEn : selectedPlan.nameAm}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[9px] uppercase text-right">Fixed Ticket Price</span>
                    <span className="text-white font-bold block text-right">{selectedPlan.minInvestment.toLocaleString()} ETB</span>
                  </div>
                  <div className="border-t border-zinc-800 pt-2 col-span-2 flex justify-between">
                    <span className="text-emerald-400 font-bold uppercase text-[9px]">Platform Connection Access</span>
                    <span className="text-emerald-400 font-bold">INCLUDED (INSTANT)</span>
                  </div>
                </div>

                {/* STEP 1: Official Deposit channels */}
                <div className="space-y-3.5">
                  <label className="block text-[10px] font-mono uppercase text-amber-500 tracking-wider font-semibold">
                    Step 1: Transfer Capital to FAM Bet Official Accounts
                  </label>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-zinc-900 border border-zinc-850 p-4 rounded-xl flex items-center justify-between gap-3 text-[11px] relative">
                      <div className="space-y-1">
                        <span className="px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-400 text-[8px] font-bold font-mono uppercase tracking-widest">
                          Primary CBE
                        </span>
                        <div className="text-white font-bold tracking-wider font-mono">1000629482012</div>
                        <div className="text-[9px] text-zinc-500">Name: FAM Bet Support Group</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText("1000629482012");
                          alert("CBE account number copied to clipboard!");
                        }}
                        className="p-1 px-2 rounded bg-zinc-800 text-amber-400 font-mono text-[8px] font-bold tracking-widest uppercase hover:bg-zinc-750 transition-all text-right shrink-0"
                      >
                        Copy
                      </button>
                    </div>

                    <div className="bg-zinc-900 border border-zinc-850 p-4 rounded-xl flex items-center justify-between gap-3 text-[11px] relative">
                      <div className="space-y-1">
                        <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 text-[8px] font-bold font-mono uppercase tracking-widest">
                          Telebirr Vip
                        </span>
                        <div className="text-white font-bold tracking-wider font-mono">0916492019</div>
                        <div className="text-[9px] text-zinc-500">Name: FAM Bet Premium Agent</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText("0916492019");
                          alert("Telebirr Agent Number copied to clipboard!");
                        }}
                        className="p-1 px-2 rounded bg-zinc-800 text-amber-400 font-mono text-[8px] font-bold tracking-widest uppercase hover:bg-zinc-750 transition-all text-right shrink-0"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                </div>

                {/* STEP 2: Receiving / Payout Bank details */}
                <div className="space-y-3.5 pt-1">
                  <label className="block text-[10px] font-mono uppercase text-amber-500 tracking-wider font-semibold">
                    Step 2: Provide Your payout/receiving Bank Account
                  </label>

                  <div className="bg-zinc-900 border border-zinc-850 p-4 rounded-xl space-y-4">
                    <div className="space-y-1.5">
                      <span className="text-[9px] font-mono text-zinc-500 uppercase">A: Choose Target Bank brand</span>
                      <div className="grid grid-cols-4 gap-2">
                        {["CBE", "Telebirr", "Abyssinia", "Awash"].map((b) => (
                          <button
                            type="button"
                            key={b}
                            onClick={() => setSelectedBank(b)}
                            className={`py-2 rounded-lg font-mono text-[10px] uppercase font-bold text-center border transition-all ${
                              selectedBank === b 
                                ? "bg-amber-500/10 border-amber-500 text-amber-400 shadow-sm" 
                                : "bg-black/40 border-zinc-800 text-zinc-500 hover:border-zinc-750"
                            }`}
                          >
                            {b}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-mono text-zinc-500 uppercase">B: Receiving Account Number</span>
                        <input
                          type="text"
                          required
                          placeholder="e.g. 1000XXXXXXXXXX or 0912XXXXXX"
                          value={userBankNo}
                          onChange={(e) => setUserBankNo(e.target.value)}
                          className="w-full bg-black/60 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                        />
                      </div>
                      
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-mono text-zinc-500 uppercase">C: Account Beneficiary Native Name</span>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Kirubel Abebe"
                          value={userBankHolder}
                          onChange={(e) => setUserBankHolder(e.target.value)}
                          className="w-full bg-black/60 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submitting step and verification trigger */}
                <div className="pt-3 border-t border-zinc-900 space-y-2.5">
                  <button
                    type="submit"
                    className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-450 hover:to-orange-550 text-black text-center font-sans font-black text-xs rounded-xl uppercase tracking-widest transition-all shadow-lg"
                  >
                    Confirm & Generate Order Ref ID (starts with FB0132***)
                  </button>
                  <p className="text-[9px] text-zinc-550 leading-normal text-center font-mono">
                    By submitting, your order reference ID is bonded to customer record {currentUser.id}. Support agents verify CBE/Telebirr transfers before status marks active.
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

