import React from "react";
import { Language, BettingTicket } from "../types";
import { getTranslation } from "../translations";
import { Award, Calendar, CheckCircle, ShieldAlert, Zap } from "lucide-react";

interface TicketCardProps {
  ticket: BettingTicket;
  lang: Language;
  key?: string;
}

export default function TicketCard({ ticket, lang }: TicketCardProps) {
  const isWon = ticket.status === "WON";
  const isPending = ticket.status === "PENDING";

  return (
    <div className="relative bg-zinc-900 border-2 border-zinc-800 rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 hover:border-amber-500/50 hover:shadow-orange-950/20 hover:shadow-2xl">
      {/* Visual top strip */}
      <div className={`h-2 w-full ${isWon ? "bg-emerald-500" : isPending ? "bg-amber-500" : "bg-red-500"}`} />

      {/* Ticket header */}
      <div className="p-6 pb-4 border-b border-dashed border-zinc-800">
        <div className="flex justify-between items-start">
          <div>
            <span className="font-mono text-[10px] tracking-wider text-amber-500 uppercase font-semibold">
              {ticket.id}
            </span>
            <h3 className="text-lg font-sans font-medium text-white tracking-tight mt-1">
              {ticket.title}
            </h3>
            <div className="flex items-center gap-2 mt-1.5 text-zinc-500 font-mono text-xs">
              <Calendar className="w-3.5 h-3.5" />
              <span>{ticket.date}</span>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex flex-col items-end">
            <span
              className={`px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider uppercase shadow-sm ${
                isWon
                  ? "bg-emerald-550/15 text-emerald-400 border border-emerald-500/30"
                  : isPending
                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                  : "bg-red-500/10 text-red-400 border border-red-500/30"
              }`}
            >
              {isWon
                ? getTranslation(lang, "wonStatus")
                : isPending
                ? getTranslation(lang, "pendingStatus")
                : getTranslation(lang, "lostStatus")}
            </span>
          </div>
        </div>
      </div>

      {/* Selections/Matches */}
      <div className="p-6 space-y-4">
        {ticket.selections.map((selection, idx) => (
          <div
            key={selection.matchId}
            className="group relative p-3.5 rounded-2xl bg-zinc-950/60 border border-zinc-900/40 hover:border-zinc-800 hover:bg-zinc-950 transition-all"
          >
            <div className="flex justify-between items-start">
              <div>
                <span className="inline-block px-2 py-0.5 rounded text-[10px] uppercase tracking-wide font-mono bg-zinc-900 text-zinc-400 border border-zinc-800 font-medium">
                  {selection.league}
                </span>
                <p className="text-sm font-medium text-zinc-200 mt-2 font-sans tracking-tight">
                  {selection.homeTeam} <span className="text-zinc-600 font-normal">vs</span> {selection.awayTeam}
                </p>
              </div>

              {/* Prediction details */}
              <div className="text-right flex flex-col items-end">
                <span className="text-[10px] tracking-wider font-mono text-zinc-500 uppercase">
                  {getTranslation(lang, "predictScore")}
                </span>
                <span className="text-sm font-extrabold font-mono text-amber-450 mt-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2.5 py-0.5 rounded-lg">
                  {selection.predictedScore}
                </span>
                <span className="text-xs font-mono text-zinc-400 mt-1">
                  @ {selection.odds.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Display actual result if concluded */}
            {selection.actualScore && (
              <div className="mt-2.5 pt-2 border-t border-zinc-900/80 flex justify-between items-center text-[11px] font-mono">
                <span className="text-zinc-600">Actual Score:</span>
                <span className="text-emerald-400 font-semibold">{selection.actualScore}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pricing / Odds Footer */}
      <div className="mx-6 p-4 rounded-2xl bg-zinc-950 border border-zinc-900">
        <div className="grid grid-cols-2 gap-y-3 font-mono text-xs">
          <div className="text-zinc-500">{getTranslation(lang, "totalOdds")}</div>
          <div className="text-right text-white font-bold text-sm">
            {ticket.totalOdds.toFixed(2)}x
          </div>

          <div className="text-zinc-500">{getTranslation(lang, "stake")}</div>
          <div className="text-right text-zinc-300 font-medium">
            {ticket.stake.toLocaleString()} ETB
          </div>

          <div className="col-span-2 border-t border-zinc-900 my-1"></div>

          <div className="text-amber-500 font-medium">{getTranslation(lang, "possibleWin")}</div>
          <div className="text-right text-amber-400 font-bold text-base">
            {(ticket.stake * ticket.totalOdds).toLocaleString(undefined, {
              maximumFractionDigits: 0,
            })}{" "}
            ETB
          </div>
        </div>
      </div>

      {/* Decorative Stamp for yesterday's won ticket */}
      {isWon && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-12 pointer-events-none opacity-20 transform scale-125 border-4 border-dashed border-emerald-500 px-6 py-2 rounded-xl text-emerald-500 font-mono font-black text-center tracking-widest text-[15px] shadow-lg animate-pulse whitespace-nowrap">
          {getTranslation(lang, "payoutStamp")}
        </div>
      )}

      {/* Paper Slot Barcode styling */}
      <div className="mt-6 px-6 pb-5 flex flex-col items-center border-t border-zinc-800/40 pt-4">
        {/* Procedural barcode generator */}
        <div className="flex h-10 w-full max-w-sm justify-between bg-zinc-950 p-2.5 rounded-xl border border-zinc-900 overflow-hidden opacity-75">
          <div className="w-1.5 h-full bg-zinc-750" />
          <div className="w-0.5 h-full bg-zinc-750" />
          <div className="w-1 h-full bg-zinc-750" />
          <div className="w-2.5 h-full bg-zinc-750" />
          <div className="w-0.5 h-full bg-zinc-750" />
          <div className="w-1.5 h-full bg-zinc-750" />
          <div className="w-3 h-full bg-zinc-750" />
          <div className="w-0.5 h-full bg-zinc-750" />
          <div className="w-1 h-full bg-zinc-750" />
          <div className="w-2 h-full bg-zinc-750" />
          <div className="w-0.5 h-full bg-zinc-750" />
          <div className="w-1.5 h-full bg-zinc-750" />
          <div className="w-2 h-full bg-zinc-750" />
          <div className="w-0.5 h-full bg-zinc-750" />
          <div className="w-1 h-full bg-zinc-750" />
          <div className="w-3 h-full bg-zinc-750" />
        </div>
        <div className="mt-2 text-[9px] font-mono text-zinc-650 tracking-[0.3em]">
          TICKET-SECURE-ID-{ticket.id.slice(-6)}
        </div>
      </div>
    </div>
  );
}
