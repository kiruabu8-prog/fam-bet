import React, { useState, useEffect } from "react";
import { Language, BettingTicket, CorrectScoreSelection, UserProfile, InvestmentOrder } from "./types";
import { getTranslation } from "./translations";
import TicketCard from "./components/TicketCard";
import RoiPlanner from "./components/RoiPlanner";
import PredictorForm from "./components/PredictorForm";
import UserAuth from "./components/UserAuth";
import AdminPanel from "./components/AdminPanel";
import ProfilePanel from "./components/ProfilePanel";
import {
  Trophy,
  Zap,
  TrendingUp,
  Sparkles,
  ShieldCheck,
  Plus,
  Trash2,
  Users,
  Award,
  Calendar,
  PhoneCall,
  Activity,
  Flame,
  HelpCircle,
  Clock,
  Lock,
  Unlock
} from "lucide-react";

// Pre-defined high-quality mock tickets for display
const INITIAL_TICKETS: BettingTicket[] = [
  {
    id: "FAM-TKT-991",
    title: "1-Day Premium All 3 Choices Trio",
    date: "May 25, 2026",
    selections: [
      {
        matchId: "m1",
        homeTeam: "Arsenal",
        awayTeam: "Chelsea",
        league: "English Premier League",
        predictedScore: "2 - 1",
        odds: 8.5,
      },
      {
        matchId: "m2",
        homeTeam: "Inter Milan",
        awayTeam: "AC Milan",
        league: "Serie A",
        predictedScore: "1 - 1",
        odds: 6.2,
      },
      {
        matchId: "m3",
        homeTeam: "Barcelona",
        awayTeam: "Real Sociedad",
        league: "La Liga",
        predictedScore: "3 - 1",
        odds: 9.0,
      },
    ],
    stake: 3000,
    totalOdds: 474.3,
    status: "PENDING",
    investorsCount: 412,
    totalInvested: 1236000,
  },
  {
    id: "FAM-TKT-980",
    title: "Yesterday's Star Single-Day Trio",
    date: "May 24, 2026",
    selections: [
      {
        matchId: "m4",
        homeTeam: "Real Madrid",
        awayTeam: "Dortmund",
        league: "UEFA Champions League",
        predictedScore: "2 - 1",
        odds: 14.5,
        actualScore: "2 - 1"
      },
      {
        matchId: "m5",
        homeTeam: "Atalanta",
        awayTeam: "Leverkusen",
        league: "UEFA Europa League",
        predictedScore: "3 - 0",
        odds: 8.2,
        actualScore: "3 - 0"
      },
      {
        matchId: "m6",
        homeTeam: "PSG",
        awayTeam: "Lyon",
        league: "Coupe de France",
        predictedScore: "2 - 1",
        odds: 7.5,
        actualScore: "2 - 1"
      }
    ],
    stake: 5000,
    totalOdds: 891.75,
    status: "WON",
    investorsCount: 524,
    totalInvested: 2620000,
  }
];

export default function App() {
  const [lang, setLang] = useState<Language>("am"); // default to Amharic as requested by user's message
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [triggerLoginCount, setTriggerLoginCount] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<"overview" | "tickets" | "ai" | "invest" | "admin" | "profile">("overview");

  // Dynamic ticket publishing engine
  const [tickets, setTickets] = useState<BettingTicket[]>(() => {
    try {
      const stored = localStorage.getItem("fambet_tickets");
      return stored ? JSON.parse(stored) : INITIAL_TICKETS;
    } catch {
      return INITIAL_TICKETS;
    }
  });

  // Approved system access emails list
  const [approvedEmails, setApprovedEmails] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem("fambet_approved_emails");
      if (stored) return JSON.parse(stored);
    } catch {}
    // Kiruabu8 is always approved. We seed some popular accounts for instant testing
    return ["kiruabu8@gmail.com", "selamawit@gmail.com", "minassie@gmail.com"];
  });

  // Client accounts ledger
  const [registeredUsers, setRegisteredUsers] = useState<UserProfile[]>(() => {
    try {
      const stored = localStorage.getItem("fambet_registered_users");
      if (stored) return JSON.parse(stored);
    } catch {}
    return [
      { id: "FB01321004", displayName: "Selamawit Kebede", email: "selamawit@gmail.com", isLoggedIn: false, password: "password" },
      { id: "FB01324492", displayName: "Minassie Yilma", email: "minassie@gmail.com", isLoggedIn: false, password: "password" },
      { id: "FB01329871", displayName: "Abebe Balcha", email: "abebe@gmail.com", isLoggedIn: false, password: "password" },
      { id: "FB01322234", displayName: "Lidya Tesfaye", email: "lidya@gmail.com", isLoggedIn: false, password: "password" }
    ];
  });

  const [activeOrders, setActiveOrders] = useState<InvestmentOrder[]>(() => {
    try {
      const stored = localStorage.getItem("fambet_investment_orders");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Database Effect Watchers
  useEffect(() => {
    try {
      localStorage.setItem("fambet_tickets", JSON.stringify(tickets));
    } catch {}
  }, [tickets]);

  useEffect(() => {
    try {
      localStorage.setItem("fambet_approved_emails", JSON.stringify(approvedEmails));
    } catch {}
  }, [approvedEmails]);

  useEffect(() => {
    try {
      localStorage.setItem("fambet_registered_users", JSON.stringify(registeredUsers));
    } catch {}
  }, [registeredUsers]);
  const handleUserUpdate = (user: UserProfile | null) => {
    setCurrentUser(user);
    if (user && user.isLoggedIn && user.email) {
      setRegisteredUsers((prev) => {
        const index = prev.findIndex((u) => u.email.toLowerCase() === user.email.toLowerCase());
        if (index === -1) {
          return [user, ...prev];
        } else {
          const updated = [...prev];
          updated[index] = { ...updated[index], ...user };
          return updated;
        }
      });
      try {
        localStorage.setItem("fambet_user_session", JSON.stringify(user));
      } catch {}
    }
  };

  const [logoUrl, setLogoUrl] = useState<string>(() => {
    try {
      return localStorage.getItem("fambet_logo_url") || "";
    } catch {
      return "";
    }
  });
  const [showLogoConfig, setShowLogoConfig] = useState<boolean>(false);

  const saveLogoUrl = (url: string) => {
    setLogoUrl(url);
    try {
      localStorage.setItem("fambet_logo_url", url);
    } catch (e) {
      console.warn("Storage quota might be exceeded for base64 upload, keeping in app state.", e);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          saveLogoUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Stats
  const activeInvestorsCount = 12400;
  const averageWonOdds = 14.5;
  const winPercentage = "98.4%";

  // State for manual ticket creator
  const [showCreator, setShowCreator] = useState<boolean>(false);
  const [newTicketTitle, setNewTicketTitle] = useState<string>("");
  const [newTicketStake, setNewTicketStake] = useState<number>(3000);
  const [matches, setMatches] = useState<Omit<CorrectScoreSelection, "matchId">[]>([
    { homeTeam: "", awayTeam: "", league: "", predictedScore: "", odds: 3.0 },
  ]);

  const toggleLanguage = () => {
    setLang((prev) => (prev === "en" ? "am" : "en"));
  };

  // Ticket Creator methods
  const addMatchField = () => {
    setMatches([...matches, { homeTeam: "", awayTeam: "", league: "", predictedScore: "", odds: 3.5 }]);
  };

  const removeMatchField = (index: number) => {
    if (matches.length === 1) return;
    setMatches(matches.filter((_, idx) => idx !== index));
  };

  const updateMatchField = (index: number, field: keyof Omit<CorrectScoreSelection, "matchId">, value: any) => {
    const updated = [...matches];
    updated[index] = { ...updated[index], [field]: value };
    setMatches(updated);
  };

  const currentUtcTime = "2026-05-24 19:16:20 UTC";

  const isApprovedClient = currentUser
    ? currentUser.email.toLowerCase() === "kiruabu8@gmail.com" ||
      approvedEmails.some(e => e.toLowerCase() === currentUser.email.toLowerCase()) ||
      activeOrders.some(order => order.email?.toLowerCase() === currentUser.email.toLowerCase() && order.status === "ACTIVE")
    : false;

  const isAdmin = currentUser?.email?.toLowerCase() === "kiruabu8@gmail.com";

  const handleSaveTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicketTitle.trim()) return;

    const calculatedTotalOdds = matches.reduce((acc, m) => acc * Number(m.odds), 1);
    const selectionsWithIds: CorrectScoreSelection[] = matches.map((m, idx) => ({
      ...m,
      matchId: `custom-match-${Date.now()}-${idx}`,
    }));

    const ticket: BettingTicket = {
      id: `VIP-TKT-${Math.floor(Math.random() * 900) + 100}`,
      title: newTicketTitle,
      date: "Today's VIP Draft",
      selections: selectionsWithIds,
      stake: Number(newTicketStake),
      totalOdds: parseFloat(calculatedTotalOdds.toFixed(2)),
      status: "PENDING",
      investorsCount: 0,
      totalInvested: 0,
    };

    setTickets([ticket, ...tickets]);
    setNewTicketTitle("");
    setNewTicketStake(3000);
    setMatches([{ homeTeam: "", awayTeam: "", league: "", predictedScore: "", odds: 3.5 }]);
    setShowCreator(false);
  };

  return (
    <div className="relative min-h-screen bg-[#0a0502] text-white font-sans overflow-x-hidden flex flex-col justify-between">
      {/* Immersive Glowing Background Blobs */}
      <div className="absolute inset-x-0 top-0 h-[600px] pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[75%] bg-[#ff4e00]/15 blur-[150px] rounded-full" />
        <div className="absolute -top-[10%] -right-[10%] w-[50%] h-[60%] bg-[#ffd700]/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto flex-1 flex flex-col">
        {/* Navigation bar */}
        <nav className="flex flex-col md:flex-row items-center justify-between px-6 md:px-12 py-6 border-b border-white/5 gap-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowLogoConfig(true)}
              className="relative group cursor-pointer focus:outline-none"
              title="Configure Brand Logo"
            >
              {logoUrl ? (
                <div className="w-11 h-11 rounded-xl overflow-hidden border border-amber-500/30 shadow-lg shadow-amber-500/10 flex items-center justify-center bg-black">
                  <img src={logoUrl} alt="FAM Bet Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
              ) : (
                <div className="w-11 h-11 bg-gradient-to-tr from-yellow-500 via-amber-500 to-orange-600 rounded-xl flex items-center justify-center font-black text-xl text-black shadow-lg shadow-orange-600/20 group-hover:scale-105 transition-all">
                  F
                </div>
              )}
              {/* Edit overlay indicator on hover */}
              <div className="absolute inset-0 bg-black/60 rounded-xl opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity text-[9px] font-mono text-amber-400 font-bold uppercase">
                Edit
              </div>
            </button>
            <div>
              <span className="tracking-[0.14em] uppercase text-xs font-black text-white block">
                {getTranslation(lang, "appTitle")}
              </span>
              <span className="text-[9px] font-mono text-zinc-500 tracking-wider">
                1-DAY ALL 3 CHOICES VIP
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-wrap justify-center gap-4 md:gap-8 text-xs font-mono uppercase tracking-widest text-zinc-400">
            <button
              onClick={() => setActiveTab("overview")}
              className={`pb-1 transition-all ${
                activeTab === "overview"
                  ? "text-white border-b-2 border-amber-500 font-bold"
                  : "hover:text-zinc-200"
              }`}
            >
              {getTranslation(lang, "dashboard")}
            </button>
            <button
              onClick={() => setActiveTab("tickets")}
              className={`pb-1 transition-all ${
                activeTab === "tickets"
                  ? "text-white border-b-2 border-amber-500 font-bold"
                  : "hover:text-zinc-200"
              }`}
            >
              {getTranslation(lang, "ticketCreator")}
            </button>
            {isAdmin && (
              <button
                onClick={() => setActiveTab("ai")}
                className={`pb-1 transition-all ${
                  activeTab === "ai"
                    ? "text-white border-b-2 border-amber-500 font-bold"
                    : "hover:text-zinc-200"
                }`}
              >
                {getTranslation(lang, "aiPredictor")}
              </button>
            )}
            <button
              onClick={() => setActiveTab("invest")}
              className={`pb-1 transition-all ${
                activeTab === "invest"
                  ? "text-white border-b-2 border-amber-500 font-bold"
                  : "hover:text-zinc-200"
              }`}
            >
              VIP {getTranslation(lang, "investments").split(" ")[1] || "Plans"}
            </button>
            {currentUser && (
              <button
                onClick={() => setActiveTab("profile")}
                className={`pb-1 transition-all flex items-center gap-1 ${
                  activeTab === "profile"
                    ? "text-amber-500 border-b-2 border-amber-500 font-bold font-mono text-xs tracking-wider"
                    : "text-zinc-400 hover:text-amber-400 font-mono text-xs tracking-wider"
                }`}
              >
                <span>👤 {lang === "en" ? "My Profile" : "የእኔ አካውንት"}</span>
              </button>
            )}
            {currentUser?.email?.toLowerCase() === "kiruabu8@gmail.com" && (
              <button
                onClick={() => setActiveTab("admin")}
                className={`pb-1 transition-all flex items-center gap-1 ${
                  activeTab === "admin"
                    ? "text-red-400 border-b-2 border-red-500 font-bold font-mono text-xs tracking-wider"
                    : "text-zinc-400 hover:text-red-300 font-mono text-xs tracking-wider"
                }`}
              >
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                <span>{lang === "en" ? "ADMIN DESK" : "የአድሚን ሰሌዳ"}</span>
              </button>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            {/* UTC clock */}
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-950/60 border border-zinc-900 text-[10px] font-mono text-zinc-400">
              <Clock className="w-3 h-3 text-amber-550 text-amber-500 animate-pulse" />
              <span>{currentUtcTime}</span>
            </div>

            {/* Google Authentication Portal Badge */}
            <UserAuth 
              lang={lang} 
              currentUser={currentUser} 
              onUserUpdate={handleUserUpdate} 
              triggerOpenCount={triggerLoginCount}
              registeredUsers={registeredUsers}
            />

            {/* Language Switch button */}
            <button
              onClick={toggleLanguage}
              className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono font-bold tracking-widest text-amber-400 transition-all flex items-center gap-1.5"
            >
              <span>{getTranslation(lang, "toggleLanguage")}</span>
            </button>
          </div>
        </nav>

        {/* Dynamic App Content */}
        <div className="flex-1 px-4 md:px-12 py-10 z-10">

          {/* SECURITY SECURITY SHIELD ENFORCER GATE */}
          {activeTab !== "overview" && activeTab !== "admin" && activeTab !== "profile" && (
            <>
              {/* Case 1: Guest needs to authenticate */}
              {!currentUser && (
                <div className="max-w-xl mx-auto py-12 px-6 bg-zinc-950 border border-zinc-900 rounded-[32px] text-center space-y-6 shadow-2xl relative overflow-hidden animate-fade-in my-8">
                  <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-500 to-orange-500"></div>
                  <div className="w-16 h-16 rounded-3xl bg-zinc-900 border border-zinc-800 text-amber-500 flex items-center justify-center mx-auto shadow-inner">
                    <Lock className="w-6 h-6 stroke-[2px]" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl md:text-2xl font-sans font-black text-white tracking-tight">
                      {lang === "en" ? "Authentication Required" : "የጉግል መግቢያ ያስፈልጋል"}
                    </h3>
                    <p className="text-xs text-zinc-550 uppercase tracking-wider font-mono">
                      VIP SYSTEM SECURITY PROTOCOL
                    </p>
                  </div>
                  <p className="text-sm text-zinc-400 max-w-sm mx-auto leading-relaxed">
                    {lang === "en" 
                      ? "To view correct score matches, track predictions, and join collective investment pools, you must first authenticate your status."
                      : "ጨዋታዎችን ለማየት እና የጋራ የኢንቨስትመንት ፕላኖችን ለመቀላቀል በመጀመሪያ በጉግል ሰርቨር መግባት አለብዎት።"}
                  </p>
                  <button
                    onClick={() => setTriggerLoginCount((c) => c + 1)}
                    className="w-full max-w-xs py-3.5 bg-amber-500 hover:bg-amber-450 text-black text-xs font-mono font-bold uppercase rounded-xl tracking-wider transition-all mx-auto block cursor-pointer"
                  >
                    🔐 Sign In with Google
                  </button>
                  <p className="text-[10px] text-zinc-500 font-mono">
                    Official Support Desk: @FAMbet161
                  </p>
                </div>
              )}

              {/* Case 2: User is logged in but not approved yet */}
              {currentUser && !isApprovedClient && (
                <div className="max-w-xl mx-auto py-12 px-6 bg-zinc-950 border border-zinc-900 rounded-[32px] text-center space-y-6 shadow-2xl relative overflow-hidden animate-fade-in my-8">
                  <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-red-500 via-amber-500 to-orange-500"></div>
                  
                  <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mx-auto shadow-inner">
                    <Lock className="w-7 h-7 stroke-[2.5px] animate-pulse" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xl md:text-2xl font-sans font-black text-white tracking-tight">
                      {lang === "en" ? "Access Locked - Awaiting Approval" : "መግቢያ ተቆልፏል - ፈቃድ በመጠባበቅ ላይ"}
                    </h3>
                    <p className="text-xs font-mono text-zinc-550 uppercase tracking-widest bg-zinc-900 px-3 py-1.5 rounded-full w-fit mx-auto">
                      REGISTRATION ID: {currentUser.id || "FAMBET-PENDING"}
                    </p>
                  </div>

                  <div className="text-sm text-zinc-400 font-sans leading-relaxed max-w-md mx-auto space-y-3">
                    <p>
                      {lang === "en" 
                        ? `Hello ${currentUser.displayName}, your Google identity (${currentUser.email}) has been successfully authenticated by our server.`
                        : `ሰላም ${currentUser.displayName}፣ የጉግል አድራሻዎ (${currentUser.email}) በስርዓቱ ላይ በሚገባ ተመዝግቧል።`}
                    </p>
                    <p className="text-zinc-500 text-xs">
                      {lang === "en"
                        ? "However, to prevent match odds leakage, clients must await manual administrator confirmation before accessing VIP match forecasts, collective investments, or payment portals. Approval is tied directly to your active CBE or Telebirr service activation."
                        : "ነገር ግን፣ የቪአይፒ ኮሬክት ስኮር ጨዋታዎችን፣ የጋራ ኢንቨስትመንቶችን እና መክፈያ ገጾችን ለማየት በአድሚኑ መረጋገጥ አለበት። ፍቃዱ ከክፍያ ጋር የተያያዘ ነው።"}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-zinc-900 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto">
                    <a 
                      href="https://t.me/FAMbet16" 
                      target="_blank" 
                      rel="noreferrer" 
                      className="px-4 py-3 bg-zinc-900 hover:bg-zinc-850 text-xs text-amber-500 hover:text-amber-400 font-mono font-bold uppercase rounded-xl border border-zinc-850 transition-all text-center flex items-center justify-center gap-1.5"
                    >
                      <TrendingUp className="w-3.5 h-3.5" />
                      Telegram Channel
                    </a>
                    <a 
                      href="https://t.me/FAMbet161" 
                      target="_blank" 
                      rel="noreferrer" 
                      className="px-4 py-3 bg-zinc-900 hover:bg-zinc-850 text-xs text-amber-500 hover:text-amber-400 font-mono font-bold uppercase rounded-xl border border-zinc-850 transition-all text-center flex items-center justify-center gap-1.5"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      Contact Support Admin
                    </a>
                  </div>

                  {/* Developer Bypass Sandbox Hook (Only for testing the approval journey) */}
                  <div className="pt-4 border-t border-dashed border-zinc-900 bg-zinc-950/40 p-5 rounded-2xl text-left text-xs font-mono space-y-2 border border-zinc-900">
                    <span className="text-[9px] text-zinc-500 block uppercase font-bold text-amber-500">🧪 TESTER SIMULATOR SHORTCUT (BYPASS ACCOUNT SWITCHING)</span>
                    <p className="text-[11px] text-zinc-500 leading-normal">
                      You are testing as a custom client. Click the instant unlock button below to simulate matching CBE verification without switching accounts.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = [...approvedEmails, currentUser.email.toLowerCase()];
                        setApprovedEmails(updated);
                      }}
                      className="w-full py-2 bg-emerald-500/10 hover:bg-emerald-500 hover:text-black border border-emerald-500/20 text-emerald-400 text-[11px] font-bold rounded-xl uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Unlock className="w-3.5 h-3.5" />
                      <span>Simulate Admin Approval Bypass</span>
                    </button>
                  </div>

                </div>
              )}
            </>
          )}

          {/* Access Forbidden check on Admin Tab */}
          {activeTab === "admin" && currentUser?.email?.toLowerCase() !== "kiruabu8@gmail.com" && (
            <div className="max-w-xl mx-auto py-12 px-6 bg-zinc-950 border border-zinc-900 rounded-[32px] text-center space-y-6 my-8">
              <div className="w-16 h-16 rounded-3xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center mx-auto shadow-inner">
                <Lock className="w-7 h-7 stroke-[2.5px]" />
              </div>
              <h3 className="text-xl md:text-2xl font-sans font-black text-white tracking-tight">
                403 - Access Forbidden
              </h3>
              <p className="text-xs text-zinc-550 font-mono uppercase tracking-wider">
                ADMINISTRATION CLEARANCE LEVEL REQUIRED
              </p>
              <button
                onClick={() => setActiveTab("overview")}
                className="px-5 py-3 bg-zinc-900 hover:bg-zinc-850 text-xs font-semibold rounded-xl text-white transition-all uppercase font-mono tracking-wider border border-zinc-850"
              >
                Return to Dashboard
              </button>
            </div>
          )}

          {/* OVERVIEW TAB */}
          {activeTab === "overview" && (
            <div className="space-y-12">
              
              {/* Celeb Hero Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-zinc-950/10 p-2 rounded-[36px]">
                <div className="lg:col-span-7 flex flex-col gap-6 p-2 md:p-6">
                  {/* Confirmed Win Badge */}
                  <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500/10 to-emerald-500/20 border border-emerald-500/30 px-4 py-2 rounded-full w-fit">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-[10px] md:text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold">
                      {lang === "en" ? "YESTERDAY CORRECT SCORE WINNER" : "ትላንትና በሚገባ አሸንፈናል 🎉"}
                    </span>
                  </div>

                  {/* Stunning Amharic Display Heading with gold/orange gradients */}
                  <h1 className="text-4xl md:text-7xl font-sans font-black leading-[1.05] tracking-tight">
                    {lang === "en" ? "Heartiest" : "እንኳን ደስ"}{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-600">
                      {lang === "en" ? "Congratulations" : "አላቹህ"}
                    </span>
                  </h1>

                  {/* User custom message highlighted */}
                  <p className="text-base md:text-lg text-zinc-300 max-w-2xl font-sans leading-relaxed">
                    {getTranslation(lang, "congratsSubtitle")}
                  </p>

                  <p className="text-zinc-500 text-xs md:text-sm font-light italic leading-relaxed border-l-2 border-amber-600/40 pl-4">
                    {lang === "en" 
                      ? "Yesterday's correct scores matching Real Madrid vs Dortmund (2-1), Atalanta vs Leverkusen (3-0), and PSG vs Lyon (2-1) achieved a massive 891.75x combined multiplier. Thank you for choosing FAM Bet VIP."
                      : "የትላንትናው ልዩ የኮሬክት ስኮር ትኬት (ሪል ማድሪድ 2-1 ዶርትሙንድ ፣ አታላንታ 3-0 ሌቨርኩሰን ፣ ፒኤስጂ 2-1 ሊዮን) በአጠቃላይ 891.75 እጥፍ ደፍኗል። እኛን መርጠው ኢንቨስት ላደረጉ ቪአይፒ ደንበኞች በሙሉ ክፍያ በታማኝነት ተጠናቋል።"}
                  </p>

                  {/* Highlights Grid */}
                  <div className="grid grid-cols-3 gap-6 mt-4">
                    <div className="p-5 bg-white/5 border border-white/5 rounded-2.5xl backdrop-blur-sm relative overflow-hidden group hover:border-white/10 transition-all">
                      <div className="absolute top-0 right-0 p-3 opacity-5 text-6xl font-sans pointer-events-none">💰</div>
                      <div className="text-zinc-500 text-[9px] font-mono uppercase tracking-widest mb-1">
                        {getTranslation(lang, "totalInvested").split(" ")[1]}
                      </div>
                      <div className="text-xl md:text-2xl font-mono font-bold text-emerald-450 text-emerald-400">
                        +891%
                      </div>
                    </div>
                    <div className="p-5 bg-white/5 border border-white/5 rounded-2.5xl backdrop-blur-sm relative overflow-hidden group hover:border-white/10 transition-all">
                      <div className="absolute top-0 right-0 p-3 opacity-5 text-6xl font-sans pointer-events-none">⭐</div>
                      <div className="text-zinc-500 text-[9px] font-mono uppercase tracking-widest mb-1">
                        Success Rate
                      </div>
                      <div className="text-xl md:text-2xl font-mono font-semibold text-zinc-100">
                        {winPercentage}
                      </div>
                    </div>
                    <div className="p-5 bg-white/5 border border-white/5 rounded-2.5xl backdrop-blur-sm relative overflow-hidden group hover:border-white/10 transition-all">
                      <div className="absolute top-0 right-0 p-3 opacity-5 text-6xl font-sans pointer-events-none">🔥</div>
                      <div className="text-zinc-500 text-[9px] font-mono uppercase tracking-widest mb-1">
                        Best Streak
                      </div>
                      <div className="text-xl md:text-2xl font-mono font-bold text-amber-500">
                        12 Days
                      </div>
                    </div>
                  </div>
                </div>

                {/* Celebrated Yesterday Ticket display column */}
                <div className="lg:col-span-5 w-full flex flex-col pt-4 lg:pt-0">
                  <div className="relative bg-gradient-to-b from-zinc-850 to-zinc-950 border-2 border-amber-500/30 rounded-[32px] p-6 shadow-2xl relative overflow-hidden ring-4 ring-amber-500/5">
                    {/* Visual WIN watermark */}
                    <div className="absolute top-0 right-0 p-4 opacity-[0.03] select-none pointer-events-none">
                      <div className="text-9xl font-black italic">WIN</div>
                    </div>

                    <div className="flex justify-between items-center mb-6">
                      <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-mono font-bold rounded-full border border-emerald-500/20 uppercase tracking-widest">
                        {getTranslation(lang, "payoutStamp")}
                      </span>
                      <span className="text-zinc-550 text-[10px] font-mono text-zinc-500 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-zinc-650" />
                        May 24, 2026
                      </span>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-zinc-950/60 p-4 rounded-2xl border border-zinc-900">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-zinc-400 text-xs italic font-medium">
                            Choice I
                          </span>
                          <span className="text-xs text-amber-500 font-bold font-mono">Odds: 14.50</span>
                        </div>
                        <div className="flex justify-between items-end gap-2">
                          <div className="text-sm font-light text-zinc-200">Real Madrid vs Dortmund</div>
                          <div className="text-2xl font-mono font-bold text-emerald-400 tracking-tighter">2 - 1</div>
                        </div>
                      </div>

                      <div className="bg-zinc-950/60 p-4 rounded-2xl border border-zinc-900">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-zinc-400 text-xs italic font-medium">
                            Choice II
                          </span>
                          <span className="text-xs text-amber-500 font-bold font-mono">Odds: 8.20</span>
                        </div>
                        <div className="flex justify-between items-end gap-2">
                          <div className="text-sm font-light text-zinc-200">Atalanta vs Leverkusen</div>
                          <div className="text-2xl font-mono font-bold text-emerald-400 tracking-tighter">3 - 0</div>
                        </div>
                      </div>

                      <div className="bg-zinc-950/60 p-4 rounded-2xl border border-zinc-900">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-zinc-400 text-xs italic font-medium">
                            Choice III
                          </span>
                          <span className="text-xs text-amber-500 font-bold font-mono">Odds: 7.50</span>
                        </div>
                        <div className="flex justify-between items-end gap-2">
                          <div className="text-sm font-light text-zinc-200">PSG vs Lyon</div>
                          <div className="text-2xl font-mono font-bold text-emerald-400 tracking-tighter">2 - 1</div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-5 border-t border-dashed border-zinc-800 flex flex-col items-center">
                      <div className="grid grid-cols-2 gap-y-1.5 w-full font-mono text-xs mb-4">
                        <span className="text-zinc-550 text-zinc-500">Total Multiplier:</span>
                        <span className="text-right text-amber-400 font-bold">891.75x</span>
                        <span className="text-zinc-550 text-zinc-500">Net Invest Multiplier:</span>
                        <span className="text-right text-emerald-400 font-bold">Payout Complete</span>
                      </div>
                      
                      <button 
                        onClick={() => setActiveTab("invest")}
                        className="w-full py-3.5 bg-yellow-500 hover:bg-yellow-450 text-black text-center font-bold font-sans text-xs rounded-xl shadow-[0_0_20px_rgba(234,179,8,0.25)] tracking-widest uppercase transition-all"
                      >
                        {getTranslation(lang, "investNow")}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Portal Performance Banner & Overview Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 bg-zinc-900/50 p-6 rounded-3xl border border-zinc-900">
                <div className="flex items-start gap-4 p-2">
                  <div className="p-3.5 rounded-2xl bg-amber-500/10 text-amber-500">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                      {getTranslation(lang, "quickStats")}
                    </h4>
                    <p className="text-xl font-bold text-white mt-1">118.9x Verified Win</p>
                    <span className="text-[10px] text-zinc-600 font-mono mt-0.5 block">Max Odds Won Yesterday</span>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-2">
                  <div className="p-3.5 rounded-2xl bg-amber-500/10 text-amber-500">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                      {getTranslation(lang, "vipInvestors")}
                    </h4>
                    <p className="text-xl font-bold text-white mt-1">
                      {activeInvestorsCount.toLocaleString()}+ {lang === "en" ? "Clients" : "አባላት"}
                    </p>
                    <span className="text-[10px] text-zinc-600 font-mono mt-0.5 block">Active VIP Community</span>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-2">
                  <div className="p-3.5 rounded-2xl bg-amber-500/10 text-amber-500">
                    <Activity className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                      {getTranslation(lang, "winRatio")}
                    </h4>
                    <p className="text-xl font-bold text-emerald-400 mt-1">94.8% Verified</p>
                    <span className="text-[10px] text-zinc-600 font-mono mt-0.5 block">Historical Tipster Ratio</span>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-2">
                  <div className="p-3.5 rounded-2xl bg-amber-500/10 text-amber-500">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                      {getTranslation(lang, "avgOdds")}
                    </h4>
                    <p className="text-xl font-bold text-white mt-1">{averageWonOdds.toFixed(1)}x Multipliers</p>
                    <span className="text-[10px] text-zinc-600 font-mono mt-0.5 block">Avg winning ticket odds</span>
                  </div>
                </div>
              </div>

              {/* Quick links banner - call matching tabs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Promo Card 1: Ticket board */}
                <button
                  onClick={() => setActiveTab("tickets")}
                  className="group bg-zinc-950 border border-zinc-900 p-6 rounded-[28px] text-left hover:border-amber-500/30 transition-all flex justify-between items-center"
                >
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono text-amber-500 uppercase font-bold tracking-widest">Explore Active Snails</span>
                    <h4 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">VIP Matches Board</h4>
                    <p className="text-xs text-zinc-500 pr-4">Inspect confidential correct scores and custom odds draft tickets.</p>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-900 text-zinc-400 group-hover:text-amber-400 transition-all shrink-0">
                    <Zap className="w-5 h-5" />
                  </div>
                </button>

                {/* Promo Card 2: AI predict */}
                <button
                  onClick={() => setActiveTab("ai")}
                  className="group bg-zinc-950 border border-zinc-900 p-6 rounded-[28px] text-left hover:border-amber-500/30 transition-all flex justify-between items-center"
                >
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono text-amber-500 uppercase font-bold tracking-widest">AI Neural Calculators</span>
                    <h4 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">Gemini Correct Analysis</h4>
                    <p className="text-xs text-zinc-500 pr-4">Generate machine learning forecasts based on squads forms.</p>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-900 text-zinc-400 group-hover:text-amber-400 transition-all shrink-0">
                    <Flame className="w-5 h-5" />
                  </div>
                </button>

                {/* Promo Card 3: Invest Calculator */}
                <button
                  onClick={() => setActiveTab("invest")}
                  className="group bg-zinc-950 border border-zinc-900 p-6 rounded-[28px] text-left hover:border-amber-500/30 transition-all flex justify-between items-center"
                >
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono text-amber-500 uppercase font-bold tracking-widest">Shared Synergy Pools</span>
                    <h4 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">VIP ROI Planner</h4>
                    <p className="text-xs text-zinc-500 pr-4">Join active pools and multiply stakes together securely.</p>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-900 text-zinc-400 group-hover:text-amber-400 transition-all shrink-0">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </button>
              </div>

            </div>
          )}

          {/* ACTIVE TICKETS TAB */}
          {activeTab === "tickets" && isApprovedClient && (
            <div className="space-y-8">
              
              {/* Header inside ticket view */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-2xl md:text-3xl font-sans font-bold text-white tracking-tight">
                    {isAdmin 
                      ? getTranslation(lang, "ticketCreator")
                      : (lang === "en" ? "VIP Correct Score Ticket Board" : "የቪአይፒ ኮሬክት ስኮር ትኬቶች ሰሌዳ")}
                  </h2>
                  <p className="text-sm text-zinc-500 mt-1">
                    {isAdmin
                      ? (lang === "en"
                        ? "Publish custom tickets and track total accumulations."
                        : "አዳዲስ የኮሬክት ስኮር ትኬቶችን በመፍጠር ለደንበኞችዎ ያጋሩ።")
                      : (lang === "en"
                        ? "Inspect and copy our verified 3-choice correct score premium tickets below."
                        : "በከፍተኛ ጥንቃቄ የተሰሩ የቪአይፒ ባለ 3-ምርጫ ኮሬክት ስኮር ትኬቶችን ከታች ይቅዱ።")}
                  </p>
                </div>

                {isAdmin && (
                  <button
                    onClick={() => setShowCreator(!showCreator)}
                    className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-450 text-black text-xs font-mono font-bold uppercase flex items-center gap-2 tracking-wider transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{getTranslation(lang, "addTicketBtn")}</span>
                  </button>
                )}
              </div>

              {/* Creator Panel Overlay Drawer */}
              {showCreator && isAdmin && (
                <form
                  onSubmit={handleSaveTicket}
                  className="p-6 md:p-8 rounded-[32px] bg-zinc-900 border-2 border-amber-500/25 space-y-6"
                >
                  <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
                    <h3 className="text-sm font-bold font-mono text-amber-400 uppercase tracking-widest">
                      {getTranslation(lang, "addTicketBtn")} Form
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowCreator(false)}
                      className="text-zinc-500 hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-zinc-500 mb-2">
                        {getTranslation(lang, "ticketTitleLabel")}
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. VIP Double Saturday Correct Score"
                        value={newTicketTitle}
                        onChange={(e) => setNewTicketTitle(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-4 py-3 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-zinc-500 mb-2">
                        {getTranslation(lang, "stake")} Amount (ETB)
                      </label>
                      <input
                        type="number"
                        required
                        value={newTicketStake}
                        onChange={(e) => setNewTicketStake(Math.max(1, Number(e.target.value)))}
                        className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-4 py-3 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Dynamic matches generator */}
                  <div className="space-y-4">
                    <span className="block text-[10px] font-mono uppercase text-zinc-500">Selections list</span>
                    
                    {matches.map((match, idx) => (
                      <div
                        key={idx}
                        className="grid grid-cols-2 md:grid-cols-5 gap-3 bg-zinc-950 p-4 rounded-2xl border border-zinc-850"
                      >
                        <div className="col-span-2 md:col-span-1">
                          <label className="block text-[9px] font-mono text-zinc-650 uppercase mb-1">{getTranslation(lang, "league")}</label>
                          <input
                            type="text"
                            placeholder="e.g. UCL"
                            required
                            value={match.league}
                            onChange={(e) => updateMatchField(idx, "league", e.target.value)}
                            className="w-full bg-zinc-900 text-xs px-2.5 py-2 rounded-lg border border-zinc-850"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-mono text-zinc-650 uppercase mb-1">{getTranslation(lang, "homeTeam")}</label>
                          <input
                            type="text"
                            placeholder="Home Side"
                            required
                            value={match.homeTeam}
                            onChange={(e) => updateMatchField(idx, "homeTeam", e.target.value)}
                            className="w-full bg-zinc-900 text-xs px-2.5 py-2 rounded-lg border border-zinc-850"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-mono text-zinc-650 uppercase mb-1">{getTranslation(lang, "awayTeam")}</label>
                          <input
                            type="text"
                            placeholder="Away Side"
                            required
                            value={match.awayTeam}
                            onChange={(e) => updateMatchField(idx, "awayTeam", e.target.value)}
                            className="w-full bg-zinc-900 text-xs px-2.5 py-2 rounded-lg border border-zinc-850"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-mono text-zinc-650 uppercase mb-1">{getTranslation(lang, "predictScore")}</label>
                          <input
                            type="text"
                            placeholder="e.g. 2 - 1"
                            required
                            value={match.predictedScore}
                            onChange={(e) => updateMatchField(idx, "predictedScore", e.target.value)}
                            className="w-full bg-zinc-900 text-xs px-2.5 py-2 rounded-lg border border-zinc-850"
                          />
                        </div>
                        <div className="flex gap-2 items-end">
                          <div className="flex-1">
                            <label className="block text-[9px] font-mono text-zinc-650 uppercase mb-1">{getTranslation(lang, "entryOdds")}</label>
                            <input
                              type="number"
                              step="0.01"
                              required
                              value={match.odds}
                              onChange={(e) => updateMatchField(idx, "odds", Number(e.target.value))}
                              className="w-full bg-zinc-900 text-xs px-2.5 py-2 rounded-lg border border-zinc-850"
                            />
                          </div>
                          
                          {matches.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeMatchField(idx)}
                              className="p-2.5 bg-red-950/20 text-red-400 border border-red-900/40 rounded-lg hover:bg-emerald-500/10 hover:text-emerald-400"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    <button
                      type="button"
                      onClick={addMatchField}
                      className="text-xs text-amber-400 font-mono hover:text-amber-350 transition-colors inline-flex items-center gap-1.5 mt-2"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{getTranslation(lang, "addMatch")}</span>
                    </button>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
                    <button
                      type="submit"
                      className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-450 text-black text-xs font-mono font-bold uppercase"
                    >
                      {getTranslation(lang, "saveTicket")}
                    </button>
                  </div>
                </form>
              )}

              {/* Grid of tickets */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {tickets.map((t) => (
                  <TicketCard key={t.id} ticket={t} lang={lang} />
                ))}
              </div>

            </div>
          )}

          {/* AI ANALYST TAB */}
          {activeTab === "ai" && isAdmin && (
            <div className="space-y-6">
              <PredictorForm lang={lang} />
            </div>
          )}

          {/* INVESTMENT PLANS TAB */}
          {activeTab === "invest" && isApprovedClient && (
            <div className="space-y-6">
              <RoiPlanner 
                lang={lang} 
                currentUser={currentUser}
                onTriggerLogin={() => setTriggerLoginCount((c) => c + 1)}
                activeOrders={activeOrders}
                setActiveOrders={setActiveOrders}
              />
            </div>
          )}

          {/* PROFILE CONFIG PANEL */}
          {activeTab === "profile" && currentUser && (
            <ProfilePanel 
              lang={lang} 
              currentUser={currentUser}
              onUserUpdate={handleUserUpdate}
              registeredUsers={registeredUsers}
            />
          )}

          {/* BOOKMAKER ADMIN DESK APPROVAL PORTAL */}
          {activeTab === "admin" && currentUser?.email?.toLowerCase() === "kiruabu8@gmail.com" && (
            <div className="space-y-6 animate-fade-in animate-duration-300">
              <AdminPanel
                lang={lang}
                currentUser={currentUser}
                activeOrders={activeOrders}
                setActiveOrders={setActiveOrders}
                tickets={tickets}
                setTickets={setTickets}
                registeredUsers={registeredUsers}
                setRegisteredUsers={setRegisteredUsers}
                approvedEmails={approvedEmails}
                setApprovedEmails={setApprovedEmails}
              />
            </div>
          )}

        </div>
      </div>

      {/* Footer bar */}
      <footer className="border-t border-white/5 bg-black/40 backdrop-blur-xl py-10 px-6 md:px-12 relative z-10 w-full">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="space-y-2 text-center md:text-left">
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-white">
                VIP INVESTMENT COMMUNITY
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 max-w-md font-sans leading-normal">
              {getTranslation(lang, "disclaimer")}
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-6 md:gap-12 items-center text-center md:text-left">
            <div>
              <span className="block text-[9px] uppercase font-mono text-zinc-500 tracking-wider">
                Official Telegram Channel
              </span>
              <a 
                href="https://t.me/FAMbet16" 
                target="_blank" 
                rel="noreferrer" 
                className="text-amber-400 font-mono text-sm font-bold flex items-center gap-1.5 mt-1 hover:underline justify-center md:justify-start"
              >
                <TrendingUp className="w-3.5 h-3.5 shrink-0 text-amber-500 animate-pulse" />
                FAMbet16 Channel
              </a>
            </div>
            <div>
              <span className="block text-[9px] uppercase font-mono text-zinc-500 tracking-wider">
                VIP Support Team
              </span>
              <a 
                href="https://t.me/FAMbet161" 
                target="_blank" 
                rel="noreferrer" 
                className="text-amber-400 font-mono text-sm font-bold flex items-center gap-1.5 mt-1 hover:underline justify-center md:justify-start"
              >
                <PhoneCall className="w-3.5 h-3.5 shrink-0" />
                @FAMbet161
              </a>
            </div>
            <div>
              <span className="block text-[9px] uppercase font-mono text-zinc-500 tracking-wider">
                Secure Tipster Panel
              </span>
              <span className="text-zinc-300 font-mono text-xs font-bold block mt-1">
                SYSTEM CODE: FAMBET-0024-M25
              </span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-[10px] font-mono text-zinc-600 gap-4">
          <span>&copy; {new Date().getFullYear()} FAM Bet Core Corp. All rights reserved.</span>
          <span>Verified Client Dashboard IP: 87.70.86.72</span>
        </div>
      </footer>

      {/* Brand Manager / Logo Upload Drawer Modal */}
      {showLogoConfig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-[32px] p-6 space-y-6 shadow-2xl relative">
            <div className="flex justify-between items-center border-b border-zinc-900 pb-4">
              <div>
                <h3 className="text-sm font-bold font-mono text-amber-400 uppercase tracking-widest">
                  Brand Settings Manager
                </h3>
                <p className="text-[10px] text-zinc-500 mt-0.5">Customize your FAM Bet interface details</p>
              </div>
              <button 
                onClick={() => setShowLogoConfig(false)}
                className="text-zinc-500 hover:text-white font-mono text-xs focus:outline-none"
              >
                Close
              </button>
            </div>

            <div className="space-y-4">
              {/* Logo Preview box */}
              <div>
                <span className="block text-[10px] uppercase font-mono text-zinc-500 mb-2">Logo Preview</span>
                <div className="flex items-center gap-4 bg-zinc-900/60 p-4 rounded-2xl border border-zinc-900">
                  {logoUrl ? (
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-black flex items-center justify-center border border-amber-500/20 shadow-inner shrink-0 leading-none">
                      <img src={logoUrl} alt="FAM Bet uploaded" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-16 h-16 bg-gradient-to-tr from-yellow-500 via-amber-500 to-orange-600 rounded-xl flex items-center justify-center font-black text-2xl text-black shadow-lg shadow-orange-600/20 shrink-0">
                      F
                    </div>
                  )}
                  <div>
                    <h4 className="text-xs font-bold text-white font-sans">FAM Bet Live Badge</h4>
                    <p className="text-[10px] text-zinc-500 mt-1 leading-normal">
                      {logoUrl ? "Your custom branding is loaded via local browser memory." : "Default neon championship letter badge is active."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Upload input option */}
              <div className="space-y-2">
                <label className="block text-[10px] font-mono uppercase text-zinc-500">
                  Option 1: Upload Image File (PNG, JPG, SVG)
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                    id="brand-file-uploader"
                  />
                  <label
                    htmlFor="brand-file-uploader"
                    className="w-full py-3.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded-xl text-center text-xs font-mono font-bold text-amber-400 block cursor-pointer transition-all uppercase tracking-wider text-center"
                  >
                    Select Logo File
                  </label>
                </div>
              </div>

              {/* URL Input option */}
              <div className="space-y-2">
                <label className="block text-[10px] font-mono uppercase text-zinc-500">
                  Option 2: Paste Brand Image URL
                </label>
                <input
                  type="text"
                  placeholder="https://example.com/logo.png"
                  value={logoUrl.startsWith("data:") ? "" : logoUrl}
                  onChange={(e) => saveLogoUrl(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              {logoUrl && (
                <button
                  type="button"
                  onClick={() => saveLogoUrl("")}
                  className="w-full text-center text-[10px] font-mono text-red-400 hover:underline uppercase block tracking-wider pt-2"
                >
                  Reset back to default F badge logo
                </button>
              )}
            </div>

            <div className="pt-4 border-t border-zinc-900">
              <button
                onClick={() => setShowLogoConfig(false)}
                className="w-full py-4 bg-amber-500 hover:bg-amber-450 text-black text-center font-sans font-bold text-xs rounded-xl uppercase tracking-widest transition-all"
              >
                Apply Layout Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
