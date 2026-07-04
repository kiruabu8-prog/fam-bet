import React, { useState } from "react";
import { Language, UserProfile, InvestmentOrder, BettingTicket, CorrectScoreSelection } from "../types";
import { 
  Shield, 
  Check, 
  X, 
  User, 
  Layers, 
  Calendar, 
  PlusCircle, 
  Trash2, 
  CheckCircle,
  Eye,
  Settings,
  Plus,
  Lock,
  Unlock,
  UserCheck,
  UserX,
  Star,
  PlusSquare,
  Sparkles,
  Trophy,
  Activity
} from "lucide-react";

interface AdminPanelProps {
  lang: Language;
  currentUser: UserProfile | null;
  activeOrders: InvestmentOrder[];
  setActiveOrders: React.Dispatch<React.SetStateAction<InvestmentOrder[]>>;
  tickets: BettingTicket[];
  setTickets: React.Dispatch<React.SetStateAction<BettingTicket[]>>;
  registeredUsers: UserProfile[];
  setRegisteredUsers: React.Dispatch<React.SetStateAction<UserProfile[]>>;
  approvedEmails: string[];
  setApprovedEmails: React.Dispatch<React.SetStateAction<string[]>>;
}

export default function AdminPanel({ 
  lang, 
  currentUser, 
  activeOrders, 
  setActiveOrders,
  tickets,
  setTickets,
  registeredUsers,
  setRegisteredUsers,
  approvedEmails,
  setApprovedEmails
}: AdminPanelProps) {
  const [subTab, setSubTab] = useState<"deposits" | "matches" | "clients">("deposits");
  
  // States for deposits tab
  const [orderFilter, setOrderFilter] = useState<"ALL" | "PENDING" | "ACTIVE">("ALL");
  
  // States for clients tab
  const [clientSearch, setClientSearch] = useState<string>("");

  // States for ticket publisher
  const [ticketTitle, setTicketTitle] = useState<string>("");
  const [ticketStake, setTicketStake] = useState<number>(3000);
  const [ticketStatus, setTicketStatus] = useState<"PENDING" | "WON" | "LOST">("PENDING");
  const [matchesToPublish, setMatchesToPublish] = useState<Omit<CorrectScoreSelection, "matchId">[]>([
    { homeTeam: "", awayTeam: "", league: "", predictedScore: "", odds: 2.5 }
  ]);

  // Approve client order payment
  const handleApproveOrder = (orderId: string) => {
    const updated = activeOrders.map((order) => {
      if (order.orderId === orderId) {
        return { ...order, status: "ACTIVE" as const };
      }
      return order;
    });
    setActiveOrders(updated);
    try {
      localStorage.setItem("fambet_investment_orders", JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  // Switch client order back to pending/locked
  const handleLockOrder = (orderId: string) => {
    const updated = activeOrders.map((order) => {
      if (order.orderId === orderId) {
        return { ...order, status: "PENDING_PAYMENT" as const };
      }
      return order;
    });
    setActiveOrders(updated);
    try {
      localStorage.setItem("fambet_investment_orders", JSON.stringify(updated));
    } catch {}
  };

  // Cancel / Delete client book order
  const handleDeleteOrder = (orderId: string) => {
    const filtered = activeOrders.filter((o) => o.orderId !== orderId);
    setActiveOrders(filtered);
    try {
      localStorage.setItem("fambet_investment_orders", JSON.stringify(filtered));
    } catch {}
  };

  // Permanently approve all deposits in one click
  const handleApproveAllDeposits = () => {
    const updated = activeOrders.map((o) => ({ ...o, status: "ACTIVE" as const }));
    setActiveOrders(updated);
    try {
      localStorage.setItem("fambet_investment_orders", JSON.stringify(updated));
    } catch {}
  };

  // --- CLIENT ACCESS CONTROLS ---
  // Approve a Client's Google Email Account for Full App Access
  const handleApproveClientAccess = (email: string) => {
    const emailLower = email.toLowerCase();
    if (approvedEmails.some(e => e.toLowerCase() === emailLower)) return;
    const updated = [...approvedEmails, emailLower];
    setApprovedEmails(updated);
  };

  // Revoke / Lock Client Access
  const handleRevokeClientAccess = (email: string) => {
    const emailLower = email.toLowerCase();
    if (emailLower === "kiruabu8@gmail.com") return; // cannot revoke own access
    const updated = approvedEmails.filter(e => e.toLowerCase() !== emailLower);
    setApprovedEmails(updated);
  };

  // Create a new simulated client to test approval mechanics
  const handleSimulateNewRegistration = () => {
    const names = ["Fasil Merga", "Yared Negash", "Almaz Daniel", "Henok Alemu", "Mahlet Girma"];
    const emails = ["fasil@gmail.com", "yared@gmail.com", "almaz@gmail.com", "henok@gmail.com", "mahlet@gmail.com"];
    const randIndex = Math.floor(Math.random() * names.length);
    const mockEmail = emails[randIndex];
    const mockName = names[randIndex];
    const mockId = `FB0132${Math.floor(1000 + Math.random() * 9000)}`;

    const alreadyExist = registeredUsers.some(u => u.email.toLowerCase() === mockEmail.toLowerCase());
    if (alreadyExist) return;

    const newUser: UserProfile = {
      id: mockId,
      displayName: mockName,
      email: mockEmail,
      isLoggedIn: false
    };

    setRegisteredUsers([newUser, ...registeredUsers]);
  };

  // Delete registered client from system lists
  const handleDeleteClient = (email: string) => {
    if (email.toLowerCase() === "kiruabu8@gmail.com") return;
    const filteredUsers = registeredUsers.filter(u => u.email.toLowerCase() !== email.toLowerCase());
    setRegisteredUsers(filteredUsers);
    
    // also remove from approved list if present
    const filteredApproved = approvedEmails.filter(e => e.toLowerCase() !== email.toLowerCase());
    setApprovedEmails(filteredApproved);
  };

  // --- MATCHES & TICKETS PUBLISHER ---
  const handleAddMatchField = () => {
    setMatchesToPublish([...matchesToPublish, { homeTeam: "", awayTeam: "", league: "", predictedScore: "", odds: 2.5 }]);
  };

  const handleRemoveMatchField = (index: number) => {
    if (matchesToPublish.length === 1) return;
    setMatchesToPublish(matchesToPublish.filter((_, idx) => idx !== index));
  };

  const handleUpdateMatchField = (index: number, field: keyof Omit<CorrectScoreSelection, "matchId">, value: any) => {
    const updated = [...matchesToPublish];
    updated[index] = { ...updated[index], [field]: value };
    setMatchesToPublish(updated);
  };

  // Publish dynamic ticket
  const handlePublishTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketTitle.trim()) return;

    const selectionsWithIds: CorrectScoreSelection[] = matchesToPublish.map((m, idx) => ({
      ...m,
      matchId: `m-${Date.now()}-${idx}`
    }));

    const calculatedTotalOdds = Number(selectionsWithIds.reduce((acc, m) => acc * m.odds, 1).toFixed(2));

    const newTicket: BettingTicket = {
      id: `FAM-TKT-${Math.floor(100 + Math.random() * 900)}`,
      title: ticketTitle,
      date: new Date().toLocaleDateString(lang === "en" ? "en-US" : "am-ET", {
        month: "short",
        day: "numeric",
        year: "numeric"
      }),
      selections: selectionsWithIds,
      stake: ticketStake,
      totalOdds: calculatedTotalOdds,
      status: ticketStatus,
      investorsCount: Math.floor(Math.random() * 200) + 15,
      totalInvested: Math.floor(Math.random() * 500000) + 50000
    };

    setTickets([newTicket, ...tickets]);

    // reset forms
    setTicketTitle("");
    setTicketStake(3000);
    setTicketStatus("PENDING");
    setMatchesToPublish([{ homeTeam: "", awayTeam: "", league: "", predictedScore: "", odds: 2.5 }]);
  };

  // Delete a ticket
  const handleDeleteTicket = (id: string) => {
    const updated = tickets.filter(t => t.id !== id);
    setTickets(updated);
  };

  // Toggle ticket win status
  const handleToggleTicketStatus = (id: string, stat: "PENDING" | "WON" | "LOST") => {
    const updated = tickets.map(t => {
      if (t.id === id) {
        return { ...t, status: stat };
      }
      return t;
    });
    setTickets(updated);
  };

  // Create a realistic dummy client payment deposit
  const handleCreateDummyBooking = (pkgId: string, pkgName: string, price: number, clientName: string) => {
    const randSuffix = Math.floor(1000 + Math.random() * 9000).toString();
    const mockOrder: InvestmentOrder = {
      orderId: `FB0132-${randSuffix}`,
      planId: pkgId,
      planName: pkgName,
      amount: price,
      expectedReturn: 0,
      status: "PENDING_PAYMENT",
      createdAt: new Date().toLocaleDateString(lang === "en" ? "en-US" : "am-ET", {
        month: "short",
        day: "numeric",
        year: "numeric"
      }) + " " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      bankName: Math.random() > 0.4 ? "CBE" : "Telebirr",
      bankAccountNo: "1000" + Math.floor(10000000 + Math.random() * 90000000).toString(),
      bankAccountHolder: clientName,
      depositMethod: "CBE Bank Mobile Transfer Receipt Reference"
    };

    const updated = [mockOrder, ...activeOrders];
    setActiveOrders(updated);
    try {
      localStorage.setItem("fambet_investment_orders", JSON.stringify(updated));
    } catch {}
  };

  // Filter criteria for orders
  const filteredOrders = activeOrders.filter((order) => {
    if (orderFilter === "PENDING") return order.status === "PENDING_PAYMENT";
    if (orderFilter === "ACTIVE") return order.status === "ACTIVE";
    return true;
  });

  // Filter clients
  const filteredClients = registeredUsers.filter((u) => {
    if (!clientSearch) return true;
    const query = clientSearch.toLowerCase();
    return u.displayName.toLowerCase().includes(query) || u.email.toLowerCase().includes(query);
  });

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto pb-12">
      
      {/* Visual Admin Header Banner */}
      <div className="bg-gradient-to-r from-red-950/20 via-zinc-900 to-amber-950/10 p-6 md:p-8 rounded-[32px] border border-zinc-900/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-red-500/5 blur-3xl"></div>
        <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-amber-500/5 blur-3xl flex"></div>
        
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl">
              <Shield className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-red-400 font-bold bg-red-950/40 px-3 py-1 rounded-full">
              FAM Bet Super Admin Workspace
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-sans font-black text-white tracking-tight">
            {lang === "en" ? "System Core Management Desk" : "የስርዓቱ ዋና መቆጣጠሪያ ማዕከል"}
          </h2>
          <p className="text-sm text-zinc-400 max-w-xl leading-normal">
            {lang === "en" 
              ? "You are logged in as kiruabu8@gmail.com. Control client application permissions, configure real-time target scores, and verify digital deposits instantly."
              : "በ kiruabu8@gmail.com ገብተዋል። የደንበኞችን የመግባት ፈቃድ ይቆጣጠሩ፣ የኮሬክት ስኮር ጨዋታዎችን ይጨምሩ እና ክፍያዎችን ያረጋግጡ።"}
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5 shrink-0 relative z-10 font-mono">
          <div className="bg-zinc-950 border border-zinc-900 px-3 py-1.5 rounded-xl">
            <span className="block text-[8px] text-zinc-500 uppercase">Registered Clients</span>
            <span className="text-xs text-white font-bold">{registeredUsers.length}</span>
          </div>
          <div className="bg-zinc-950 border border-zinc-900 px-3 py-1.5 rounded-xl">
            <span className="block text-[8px] text-zinc-500 uppercase">Approved Accounts</span>
            <span className="text-xs text-emerald-400 font-bold">{approvedEmails.length}</span>
          </div>
          <div className="bg-zinc-950 border border-zinc-900 px-3 py-1.5 rounded-xl">
            <span className="block text-[8px] text-zinc-500 uppercase">Total Tickets</span>
            <span className="text-xs text-amber-500 font-bold">{tickets.length}</span>
          </div>
        </div>
      </div>

      {/* Admin Panel Sub-Tabs Navigation */}
      <div className="flex border-b border-zinc-900 pb-px text-sm font-mono gap-5">
        <button
          onClick={() => setSubTab("deposits")}
          className={`pb-3 border-b-2 transition-all font-semibold uppercase ${
            subTab === "deposits" 
              ? "border-red-500 text-white" 
              : "border-transparent text-zinc-500 hover:text-zinc-300"
          }`}
        >
          💳 {lang === "en" ? "Client Deposits & Bookings" : "የደንበኞች ክፍያዎች"}
        </button>
        <button
          onClick={() => setSubTab("matches")}
          className={`pb-3 border-b-2 transition-all font-semibold uppercase ${
            subTab === "matches" 
              ? "border-red-500 text-white" 
              : "border-transparent text-zinc-500 hover:text-zinc-300"
          }`}
        >
          ⚽ {lang === "en" ? "Matches & Tickets Board" : "የጨዋታዎች መለጠፊያ"}
        </button>
        <button
          onClick={() => setSubTab("clients")}
          className={`pb-3 border-b-2 transition-all font-semibold uppercase ${
            subTab === "clients" 
              ? "border-red-500 text-white" 
              : "border-transparent text-zinc-500 hover:text-zinc-300"
          }`}
        >
          🔐 {lang === "en" ? "Client Access Approval" : "የመግቢያ ፈቃድ መቆጣጠሪያ"}
        </button>
      </div>

      {/* --- SUB-TAB 1: CLIENT DEPOSITS --- */}
      {subTab === "deposits" && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Quick Emulator inside deposits tab */}
          <div className="bg-zinc-900/30 p-4 rounded-2xl border border-zinc-900 space-y-3.5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <h4 className="text-xs font-mono font-bold text-zinc-300 uppercase">
                {lang === "en" ? "Instant Mobile Deposit Order Spawner" : "ፈጣን የደንበኛ ትዕዛዝ ማስመሰያ መሳሪያ"}
              </h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => handleCreateDummyBooking("ft-match", "Full Time Match VIP", 5000, "Selamawit Kebede")}
                className="p-2.5 bg-zinc-950/80 hover:bg-zinc-900 border border-zinc-850 text-left rounded-xl transition-all text-xs"
              >
                <div className="flex justify-between items-center text-zinc-550 mb-1">
                  <span className="font-mono text-[9px] uppercase">Single FT / CBE</span>
                  <span className="text-amber-500 font-bold">5000 ETB</span>
                </div>
                <span className="font-semibold text-white block">+ Selamawit (CBE)</span>
              </button>

              <button
                onClick={() => handleCreateDummyBooking("single-correct-score", "Single Correct Score VIP", 15000, "Minassie Yilma")}
                className="p-2.5 bg-zinc-950/80 hover:bg-zinc-900 border border-zinc-850 text-left rounded-xl transition-all text-xs"
              >
                <div className="flex justify-between items-center text-zinc-550 mb-1">
                  <span className="font-mono text-[9px] uppercase">Correct Score / Telebirr</span>
                  <span className="text-amber-500 font-bold">15000 ETB</span>
                </div>
                <span className="font-semibold text-white block">+ Minassie (Telebirr)</span>
              </button>

              <button
                onClick={() => handleCreateDummyBooking("vip-3-correct-score", "VIP 3 Correct Score Bundle", 40000, "Kidus Abebe (kiruabu8)")}
                className="p-2.5 bg-zinc-950/80 hover:bg-zinc-900 border border-zinc-850 text-left rounded-xl transition-all text-xs"
              >
                <div className="flex justify-between items-center text-zinc-550 mb-1">
                  <span className="font-mono text-[9px] uppercase">VIP Bundle / CBE</span>
                  <span className="text-amber-500 font-bold">40000 ETB</span>
                </div>
                <span className="font-semibold text-white block">+ Kidus Abebe (CBE)</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-2">
            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span>{lang === "en" ? "Verify Digital Invoices" : "በንግድ ባንክና ቴሌቢር የመጡ ደረሰኞች"}</span>
            </h3>

            {/* Order status filters */}
            <div className="flex bg-zinc-950 border border-zinc-900 p-1 rounded-xl text-xs font-mono">
              <button
                onClick={() => setOrderFilter("ALL")}
                className={`px-3 py-1 bg-zinc-900/10 rounded-lg transition-all ${orderFilter === "ALL" ? "bg-zinc-800 text-white font-bold" : "text-zinc-500 hover:text-zinc-300"}`}
              >
                All ({activeOrders.length})
              </button>
              <button
                onClick={() => setOrderFilter("PENDING")}
                className={`px-3 py-1 rounded-lg transition-all ${orderFilter === "PENDING" ? "bg-amber-500/10 text-yellow-500 font-bold" : "text-zinc-500 hover:text-yellow-500"}`}
              >
                Pending ({activeOrders.filter(o => o.status === "PENDING_PAYMENT").length})
              </button>
              <button
                onClick={() => setOrderFilter("ACTIVE")}
                className={`px-3 py-1 rounded-lg transition-all ${orderFilter === "ACTIVE" ? "bg-emerald-500/10 text-emerald-400 font-bold" : "text-zinc-500 hover:text-emerald-400"}`}
              >
                Approved ({activeOrders.filter(o => o.status === "ACTIVE").length})
              </button>
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-zinc-950/50 border border-zinc-900 text-zinc-500 space-y-3">
              <div className="w-12 h-12 rounded-full bg-zinc-900/60 flex items-center justify-center mx-auto text-zinc-655 text-zinc-500">
                <Trash2 className="w-6 h-6" />
              </div>
              <p className="text-sm font-sans">{lang === "en" ? "No bookmaker orders listed matching criteria." : "ምንም ዓይነት የክፍያ ጥያቄ አልተመዘገበም።"}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredOrders.map((order) => {
                const isPending = order.status === "PENDING_PAYMENT";
                return (
                  <div
                    key={order.orderId}
                    className={`bg-zinc-950 border rounded-3xl p-5 md:p-6 space-y-4 relative overflow-hidden transition-all duration-300 ${
                      isPending 
                        ? "border-zinc-900"
                        : "border-emerald-500/20 bg-gradient-to-b from-zinc-950 to-emerald-950/5"
                    }`}
                  >
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-900 pb-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-zinc-500 uppercase">TICKET BOOKING REFERENCE: {order.orderId}</span>
                        </div>
                        <h4 className="text-base font-bold text-white capitalize">
                          {order.bankAccountHolder} <span className="text-xs font-mono font-medium text-zinc-500">({order.bankName})</span>
                        </h4>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[8px] font-mono font-bold uppercase tracking-wider ${
                          isPending ? "bg-amber-500/10 text-yellow-500" : "bg-emerald-500/10 text-emerald-400"
                        }`}>
                          {isPending ? "Awaiting Deposit" : "Approved & Access Granted"}
                        </span>
                        <span className="text-xs font-mono text-zinc-500">{order.createdAt}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
                      <div className="bg-zinc-900/30 p-3 rounded-xl border border-zinc-900/50">
                        <span className="text-[9px] text-zinc-500 block uppercase">Requested Service Package</span>
                        <span className="text-white font-bold block mt-1">{order.planName}</span>
                      </div>
                      <div className="bg-zinc-900/30 p-3 rounded-xl border border-zinc-900/50">
                        <span className="text-[9px] text-zinc-500 block uppercase">Client Paid Reference</span>
                        <span className="text-amber-500 font-bold block mt-1 text-sm">{order.amount.toLocaleString()} ETB</span>
                      </div>
                      <div className="bg-zinc-900/30 p-3 rounded-xl border border-zinc-900/50">
                        <span className="text-[9px] text-zinc-500 block uppercase">Client Backing Account</span>
                        <span className="text-zinc-300 block mt-1 truncate" title={order.bankAccountNo}>{order.bankAccountNo}</span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-2">
                      <p className="text-[10px] text-zinc-500 leading-normal max-w-lg font-mono">
                        💡 <span className="text-zinc-400 font-semibold">Validation Step:</span> Confirm from your phone bank transfer log before clicking approve.
                      </p>
                      
                      <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
                        {isPending ? (
                          <>
                            <button
                              onClick={() => handleApproveOrder(order.orderId)}
                              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-mono font-bold rounded-xl transition-all flex items-center gap-1 uppercase"
                            >
                              <Check className="w-3.5 h-3.5 stroke-[3px]" />
                              <span>Approve Deposit</span>
                            </button>
                            <button
                              onClick={() => handleDeleteOrder(order.orderId)}
                              className="p-2.5 bg-zinc-900 border border-zinc-850 hover:text-red-400 rounded-xl text-zinc-500 transition-colors"
                              title="Delete Reference"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[11px] flex items-center gap-1 font-bold">
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Unlocked</span>
                            </div>
                            <button
                              onClick={() => handleLockOrder(order.orderId)}
                              className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-850 text-zinc-400 rounded-xl text-[10px] font-mono hover:text-white transition-all"
                            >
                              Revoke Access
                            </button>
                            <button
                              onClick={() => handleDeleteOrder(order.orderId)}
                              className="p-2 bg-zinc-950 text-zinc-700 hover:text-red-400 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}


      {/* --- SUB-TAB 2: MATCHES & TICKETS PUBLISHER --- */}
      {subTab === "matches" && (
        <div className="space-y-8 animate-fade-in">
          
          {/* Main Visual Form for Adding Matches */}
          <form onSubmit={handlePublishTicket} className="bg-zinc-950 p-6 md:p-8 rounded-[32px] border border-zinc-900 space-y-6">
            <div className="flex justify-between items-center border-b border-zinc-900 pb-4">
              <div className="flex items-center gap-2">
                <PlusSquare className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-bold font-mono text-amber-500 uppercase tracking-wider">
                  {lang === "en" ? "Publish New VIP Ticket (Choice 1-2-3 Match)" : "አዲስ የቪአይፒ ኮሬክት ስኮር ጨዋታዎችን መለጠፊያ"}
                </h3>
              </div>
              <span className="text-[10px] font-mono text-zinc-500">AUTO-SAVED IN LOCAL ENGINE</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-mono uppercase text-zinc-500 mb-2">Ticket Title Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. VIP Double Saturday Correct Score"
                  value={ticketTitle}
                  onChange={(e) => setTicketTitle(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-850 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-zinc-500 mb-2">Fixed Ticket Charge (ETB)</label>
                <input
                  type="number"
                  required
                  value={ticketStake}
                  onChange={(e) => setTicketStake(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-zinc-900 border border-zinc-850 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500 animate-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-zinc-500 mb-2">Publish Status</label>
                <select
                  value={ticketStatus}
                  onChange={(e) => setTicketStatus(e.target.value as any)}
                  className="w-full bg-zinc-900 border border-zinc-850 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  <option value="PENDING">PENDING (Keep Active/Live)</option>
                  <option value="WON">WON (Publish as Won Success)</option>
                  <option value="LOST">LOST (Publish as Lost)</option>
                </select>
              </div>
            </div>

            {/* Dynamic Matches List Builder */}
            <div className="space-y-4 pt-2">
              <span className="block text-[10px] font-mono uppercase text-zinc-400 tracking-wider">Selections List Selection (Multiple Allowed)</span>
              
              {matchesToPublish.map((match, idx) => (
                <div key={idx} className="grid grid-cols-2 lg:grid-cols-5 gap-3 bg-zinc-900/40 p-4 rounded-2xl border border-zinc-900">
                  <div>
                    <label className="block text-[9px] font-mono text-zinc-500 uppercase mb-1">Championship/League</label>
                    <input
                      type="text"
                      placeholder="e.g. English Premier League"
                      required
                      value={match.league}
                      onChange={(e) => handleUpdateMatchField(idx, "league", e.target.value)}
                      className="w-full bg-zinc-950 text-xs px-3 py-2.5 rounded-xl border border-zinc-850 text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-mono text-zinc-500 uppercase mb-1">Local Team (Home)</label>
                    <input
                      type="text"
                      placeholder="Home Club"
                      required
                      value={match.homeTeam}
                      onChange={(e) => handleUpdateMatchField(idx, "homeTeam", e.target.value)}
                      className="w-full bg-zinc-950 text-xs px-3 py-2.5 rounded-xl border border-zinc-850 text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-mono text-zinc-500 uppercase mb-1">Guest Team (Away)</label>
                    <input
                      type="text"
                      placeholder="Away Club"
                      required
                      value={match.awayTeam}
                      onChange={(e) => handleUpdateMatchField(idx, "awayTeam", e.target.value)}
                      className="w-full bg-zinc-950 text-xs px-3 py-2.5 rounded-xl border border-zinc-850 text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-mono text-zinc-500 uppercase mb-1">Correct Score Prediction</label>
                    <input
                      type="text"
                      placeholder="e.g. 2 - 1"
                      required
                      value={match.predictedScore}
                      onChange={(e) => handleUpdateMatchField(idx, "predictedScore", e.target.value)}
                      className="w-full bg-zinc-950 text-xs px-3 py-2.5 rounded-xl border border-zinc-850 text-white focus:outline-none"
                    />
                  </div>
                  <div className="flex items-end gap-2 col-span-2 lg:col-span-1">
                    <div className="flex-1">
                      <label className="block text-[9px] font-mono text-zinc-500 uppercase mb-1">Match Specific Odds</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={match.odds}
                        onChange={(e) => handleUpdateMatchField(idx, "odds", Number(e.target.value))}
                        className="w-full bg-zinc-950 text-xs px-3 py-2.5 rounded-xl border border-zinc-850 text-white focus:outline-none"
                      />
                    </div>
                    {matchesToPublish.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMatchField(idx)}
                        className="p-2.5 rounded-xl bg-red-950/20 text-red-400 hover:bg-red-550 hover:text-white transition-all border border-red-900/35"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={handleAddMatchField}
                className="text-xs text-amber-400 font-mono hover:text-amber-350 transition-colors inline-flex items-center gap-1.5 mt-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Another Match Choice in this Ticket</span>
              </button>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-zinc-900">
              <button
                type="submit"
                className="px-6 py-3 bg-amber-500 hover:bg-amber-450 text-black text-xs font-mono font-bold rounded-xl uppercase tracking-wider transition-all"
              >
                🚀 Publish Dynamic VIP match Ticket
              </button>
            </div>
          </form>

          {/* Currently published tickets manager */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white font-sans flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-500 text-amber-500" />
              <span>Published Premium Tickets List ({tickets.length})</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tickets.map((t) => {
                const totalCalculatedOdds = t.selections.reduce((acc, s) => acc * s.odds, 1).toFixed(2);
                return (
                  <div key={t.id} className="bg-zinc-950 border border-zinc-900 p-5 rounded-3xl space-y-4 relative overflow-hidden">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[9px] font-mono text-amber-500 uppercase font-semibold">{t.id} - PUBLISHED</span>
                        <h4 className="text-sm font-bold text-white mt-0.5">{t.title}</h4>
                      </div>
                      <button
                        onClick={() => handleDeleteTicket(t.id)}
                        className="p-2 bg-zinc-900 hover:bg-zinc-850 hover:text-red-400 text-zinc-500 rounded-lg transition-all"
                        title="Delete Ticket"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="space-y-2">
                      {t.selections.map((sel, sIdx) => (
                        <div key={sel.matchId || sIdx} className="bg-zinc-900/50 p-2.5 rounded-xl text-xs flex justify-between items-center text-zinc-400">
                          <div>
                            <span className="text-[8px] font-mono uppercase text-zinc-650 tracking-wider block">{sel.league}</span>
                            <span className="font-semibold text-white">{sel.homeTeam} vs {sel.awayTeam}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-emerald-400 font-bold block">{sel.predictedScore}</span>
                            <span className="text-[10px] text-zinc-500 font-mono">Odds: {sel.odds}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center pt-3 border-t border-zinc-90 w-full pt-3 border-t border-zinc-900 font-mono text-xs text-zinc-450">
                      <div>
                        <span className="text-[9px] text-zinc-500 uppercase block">Combined Odds Multiplier</span>
                        <span className="text-white font-bold">{totalCalculatedOdds}x</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] text-zinc-500 uppercase block">Ticket State status</span>
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold ${
                          t.status === "WON" ? "bg-emerald-500/10 text-emerald-400" :
                          t.status === "LOST" ? "bg-red-500/10 text-red-400" : "bg-zinc-900 border border-zinc-800 text-yellow-500"
                        }`}>
                          {t.status}
                        </span>
                      </div>
                    </div>

                    {/* Status Changers */}
                    <div className="grid grid-cols-3 gap-2 pt-2 text-[9px] font-mono text-center">
                      <button
                        onClick={() => handleToggleTicketStatus(t.id, "PENDING")}
                        className={`p-1.5 rounded transition-all ${t.status === "PENDING" ? "bg-amber-600/30 text-yellow-400 font-bold border border-yellow-500/30" : "bg-zinc-900 hover:bg-zinc-850 hover:text-white text-zinc-500"}`}
                      >
                        SET PENDING
                      </button>
                      <button
                        onClick={() => handleToggleTicketStatus(t.id, "WON")}
                        className={`p-1.5 rounded transition-all ${t.status === "WON" ? "bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30" : "bg-zinc-900 hover:bg-zinc-850 hover:text-white text-zinc-500"}`}
                      >
                        SET WON 👍
                      </button>
                      <button
                        onClick={() => handleToggleTicketStatus(t.id, "LOST")}
                        className={`p-1.5 rounded transition-all ${t.status === "LOST" ? "bg-red-500/20 text-red-400 font-bold border border-red-500/30" : "bg-zinc-900 hover:bg-zinc-850 hover:text-white text-zinc-500"}`}
                      >
                        SET LOST ✕
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}


      {/* --- SUB-TAB 3: CLIENT ACCESS CONTROLS --- */}
      {subTab === "clients" && (
        <div className="space-y-6 animate-fade-in">
          
          <div className="bg-gradient-to-r from-teal-950/20 to-zinc-900 border border-zinc-900 p-5 rounded-[28px] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-1">
              <h4 className="text-xs font-mono font-bold text-teal-400 uppercase tracking-wider">
                💡 Access Permissions Framework Rule
              </h4>
              <p className="text-xs text-zinc-400 max-w-xl leading-normal">
                Clients who sign in using Gmail cannot access any system matches, predictors, pools, or checkout features until approved here. Approved clients gain full instant unlock.
              </p>
            </div>
            
            <button
              onClick={handleSimulateNewRegistration}
              className="px-4 py-2 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-teal-400 text-xs font-mono font-bold rounded-xl transition-all uppercase flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Simulate Client Registration</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h3 className="text-base font-bold text-white font-sans flex items-center gap-2">
              <Star className="w-4 h-4 text-emerald-500 text-amber-500" />
              <span>Security Access Register ledger</span>
            </h3>

            {/* Client search */}
            <input
              type="text"
              placeholder="Search via client name or email..."
              value={clientSearch}
              onChange={(e) => setClientSearch(e.target.value)}
              className="bg-zinc-950 border border-zinc-900 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500 w-full sm:w-64"
            />
          </div>

          <div className="bg-zinc-950 border border-zinc-900 rounded-3xl overflow-hidden">
            <div className="hidden sm:grid grid-cols-4 bg-zinc-900/60 px-6 py-3.5 border-b border-zinc-900 text-[10px] font-mono text-zinc-550 uppercase tracking-wider font-bold">
              <span>Client Identity</span>
              <span>Gmail Account</span>
              <span>Permission Status</span>
              <span className="text-right">Access Console toggle</span>
            </div>

            {filteredClients.length === 0 ? (
              <div className="p-12 text-center text-zinc-500 italic text-sm font-sans">
                No clients registers match the search target query.
              </div>
            ) : (
              <div className="divide-y divide-zinc-900">
                {filteredClients.map((client) => {
                  const isAdminSelf = client.email.toLowerCase() === "kiruabu8@gmail.com";
                  const isApproved = isAdminSelf || approvedEmails.some(e => e.toLowerCase() === client.email.toLowerCase());
                  
                  return (
                    <div key={client.email} className="grid grid-cols-1 sm:grid-cols-4 gap-4 px-6 py-4.5 items-center hover:bg-white/[0.01] transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500/10 to-orange-600/10 border border-amber-500/20 flex items-center justify-center font-black text-xs text-amber-500 shrink-0">
                          {client.displayName.charAt(0)}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-white block">{client.displayName}</span>
                          <span className="text-[9px] font-mono text-zinc-550 block select-all uppercase">ID: {client.id || "MOCK-TSTR"}</span>
                        </div>
                      </div>

                      <div className="text-xs font-mono text-zinc-400 break-all select-all">
                        {client.email}
                      </div>

                      <div className="flex items-center">
                        {isAdminSelf ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[8px] font-mono font-bold uppercase tracking-wider bg-red-500/10 text-red-400">
                            ⭐ Super Admin Power
                          </span>
                        ) : isApproved ? (
                          <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-mono">
                            <Unlock className="w-3.5 h-3.5" />
                            <span>APPROVED ACTIVE</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-zinc-500 text-xs font-mono">
                            <Lock className="w-3.5 h-3.5" />
                            <span>AITING APPROVAL</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-end gap-2 text-right">
                        {isAdminSelf ? (
                          <span className="text-[10px] text-zinc-500 font-mono">Self Authenticating System</span>
                        ) : (
                          <>
                            {isApproved ? (
                              <button
                                type="button"
                                onClick={() => handleRevokeClientAccess(client.email)}
                                className="px-3 py-1.5 bg-zinc-900 hover:bg-red-950/20 text-zinc-400 hover:text-red-400 rounded-xl text-[10px] font-mono transition-all border border-zinc-850 hover:border-red-950/40 uppercase"
                              >
                                Revoke Approval
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleApproveClientAccess(client.email)}
                                className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-black rounded-xl text-[10px] font-mono font-bold transition-all border border-emerald-500/20 uppercase"
                              >
                                Approve Access
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleDeleteClient(client.email)}
                              className="p-1.5 bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 text-zinc-550 hover:text-red-400 rounded-lg transition-all"
                              title="Delete Client Register"
                            >
                              <UserX className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
