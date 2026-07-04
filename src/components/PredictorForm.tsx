import React, { useState } from "react";
import { Language, PredictionResult } from "../types";
import { getTranslation } from "../translations";
import { AlertCircle, BrainCircuit, Check, Flame, Trophy, Loader, ShieldAlert } from "lucide-react";

interface PredictorFormProps {
  lang: Language;
}

export default function PredictorForm({ lang }: PredictorFormProps) {
  const [homeTeam, setHomeTeam] = useState<string>("");
  const [awayTeam, setAwayTeam] = useState<string>("");
  const [league, setLeague] = useState<string>("");
  const [context, setContext] = useState<string>("");
  const [analysisLang, setAnalysisLang] = useState<Language>(lang);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PredictionResult | null>(null);

  const fetchPrediction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!homeTeam.trim() || !awayTeam.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          homeTeam,
          awayTeam,
          league,
          context,
          language: analysisLang,
        }),
      });

      if (!response.ok) {
        throw new Error("Prediction API failed to initialize calculations.");
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const loadExample = (home: string, away: string, lg: string, ctx: string) => {
    setHomeTeam(home);
    setAwayTeam(away);
    setLeague(lg);
    setContext(ctx);
  };

  return (
    <div className="space-y-8">
      {/* Intro info */}
      <div className="text-center max-w-xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono font-bold uppercase">
          <BrainCircuit className="w-3.5 h-3.5" />
          <span>Gemini Flash 3.5 Assistant</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-sans font-bold text-white tracking-tight">
          {getTranslation(lang, "aiPredictor")}
        </h2>
        <p className="text-zinc-400 text-sm">
          {lang === "en"
            ? "Leverage artificial intelligence to process team formats, missing strikers, and defensive statistics."
            : "የተጫዋቾችን ቅጽ፣ የጉዳት ዜናዎችን እና የመከላከል ስታቲስቲክስን በመተንተን ትክክለኛውን ኮሬክት ስኮር ያግኙ።"}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left column - Form */}
        <form
          onSubmit={fetchPrediction}
          className="lg:col-span- così-5 bg-zinc-900 border border-zinc-850 p-6 md:p-8 rounded-3xl space-y-5 shadow-xl lg:col-span-5"
        >
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-semibold font-mono text-zinc-400 uppercase tracking-wider">
              {getTranslation(lang, "enterFixture")}
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-zinc-500 mb-2 uppercase">
                {getTranslation(lang, "league")}
              </label>
              <input
                type="text"
                placeholder="e.g. English Premier League, UEFA"
                value={league}
                onChange={(e) => setLeague(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 focus:outline-none rounded-2xl px-4 py-3 text-sm text-white placeholder-zinc-700 transition-all font-sans"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-zinc-500 mb-2 uppercase">
                  {getTranslation(lang, "homeTeam")}
                </label>
                <input
                  type="text"
                  placeholder="Home Team"
                  required
                  value={homeTeam}
                  onChange={(e) => setHomeTeam(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 focus:outline-none rounded-2xl px-4 py-3 text-sm text-white placeholder-zinc-700 transition-all font-sans"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-zinc-500 mb-2 uppercase">
                  {getTranslation(lang, "awayTeam")}
                </label>
                <input
                  type="text"
                  placeholder="Away Team"
                  required
                  value={awayTeam}
                  onChange={(e) => setAwayTeam(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 focus:outline-none rounded-2xl px-4 py-3 text-sm text-white placeholder-zinc-700 transition-all font-sans"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-500 mb-2 uppercase">
                {getTranslation(lang, "customContext")}
              </label>
              <textarea
                placeholder="Detail key team forms (e.g., Star striker injured, Chelsea won 3 in a row, rainy conditions)"
                value={context}
                onChange={(e) => setContext(e.target.value)}
                rows={3}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 focus:outline-none rounded-2xl p-4 text-sm text-white placeholder-zinc-700 transition-all resize-none font-sans leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pb-2">
              <span className="text-xs font-mono text-zinc-500 self-center uppercase">
                {getTranslation(lang, "langPrompt")}
              </span>
              <div className="grid grid-cols-2 gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-850">
                <button
                  type="button"
                  onClick={() => setAnalysisLang("en")}
                  className={`py-1.5 rounded-lg text-xs font-semibold uppercase ${
                    analysisLang === "en" ? "bg-zinc-800 text-amber-400" : "text-zinc-500"
                  }`}
                >
                  EN
                </button>
                <button
                  type="button"
                  onClick={() => setAnalysisLang("am")}
                  className={`py-1.5 rounded-lg text-xs font-semibold uppercase ${
                    analysisLang === "am" ? "bg-zinc-800 text-amber-400" : "text-zinc-500"
                  }`}
                >
                  አማ
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !homeTeam.trim() || !awayTeam.trim()}
              className="w-full py-4 px-6 bg-amber-500 hover:bg-amber-450 disabled:bg-zinc-805 disabled:text-zinc-600 disabled:cursor-not-allowed text-black font-sans font-bold text-sm tracking-wide rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>{getTranslation(lang, "analyzingText").slice(0, 20)}...</span>
                </>
              ) : (
                <>
                  <BrainCircuit className="w-4 h-4" />
                  <span>{getTranslation(lang, "generateAnalysis")}</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Examples Selection */}
          <div className="border-t border-zinc-850 pt-5 space-y-3">
            <span className="block text-[10px] uppercase font-mono text-zinc-650 tracking-wider">
              {lang === "en" ? "Popular upcoming fixtures" : "የሚመከሩ ታዋቂ ጨዋታዎች"}
            </span>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() =>
                  loadExample(
                    "Real Madrid",
                    "Barcelona",
                    "La Liga",
                    "Madrid playing at Bernabeu. Vinicius in top-form; Barcelona goalkeeper still recovering from injury."
                  )
                }
                className="w-full text-left p-2.5 rounded-xl bg-zinc-950 border border-zinc-900 text-[11px] text-zinc-400 hover:border-zinc-800 hover:text-white transition-all font-mono flex justify-between"
              >
                <span>Real Madrid vs Barcelona</span>
                <span className="text-zinc-600 font-semibold text-[10px] uppercase">La Liga</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  loadExample(
                    "Arsenal",
                    "Chelsea",
                    "English Premier League",
                    "Arsenal won last 4 home clean sheets. Chelsea dangerous on away counters with Palmer."
                  )
                }
                className="w-full text-left p-2.5 rounded-xl bg-zinc-950 border border-zinc-900 text-[11px] text-zinc-400 hover:border-zinc-800 hover:text-white transition-all font-mono flex justify-between"
              >
                <span>Arsenal vs Chelsea</span>
                <span className="text-zinc-600 font-semibold text-[10px] uppercase">Premier League</span>
              </button>
            </div>
          </div>
        </form>

        {/* Right column - Output Analysis */}
        <div className="lg:col-span-7 space-y-6 min-h-[350px]">
          {loading && (
            <div className="h-full flex flex-col items-center justify-center space-y-4 p-8 bg-zinc-900/40 rounded-3xl border border-dashed border-zinc-800 min-h-[450px]">
              <div className="relative">
                <Loader className="w-10 h-10 text-amber-500 animate-spin" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-amber-500 animate-pulse" />
              </div>
              <p className="text-sm font-sans text-amber-400 font-medium">
                {getTranslation(lang, "analyzingText")}
              </p>
              <p className="text-xs font-mono text-zinc-600">Gemini-3.5-Flash Active</p>
            </div>
          )}

          {error && (
            <div className="p-6 rounded-3xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <div>
                <span className="font-bold block">Calculation Failed</span>
                <span className="mt-1 block text-zinc-400 leading-normal">{error}</span>
              </div>
            </div>
          )}

          {!loading && !error && !result && (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-zinc-900/40 rounded-3xl border border-dashed border-zinc-850 min-h-[450px]">
              <BrainCircuit className="w-12 h-12 text-zinc-800 mb-3" />
              <h4 className="text-sm font-medium text-zinc-350">
                {lang === "en" ? "Awaiting Fixture Formulation" : "የጨዋታ ትንታኔን በመጠባበቅ ላይ"}
              </h4>
              <p className="text-xs text-zinc-600 max-w-sm mt-1.5 leading-normal">
                {lang === "en"
                  ? "Input home and away club forms. Gemini will query neural parameters and construct probable scoring matrices."
                  : "የክለቦቹን ታሪካዊ መረጃዎችንና የአሰላለፍ ሁኔታ ያስገቡና የአይ ትንተናውን ይጀምሩ።"}
              </p>
            </div>
          )}

          {!loading && !error && result && (
            <div className="space-y-6 bg-zinc-900 border border-zinc-850 p-6 md:p-8 rounded-3xl">
              {/* Demo Mode / Active API Notice */}
              <div className="flex gap-2.5 items-start p-3 bg-zinc-950 rounded-xl border border-zinc-900">
                {result.isDemo ? (
                  <>
                    <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <span className="text-[11px] text-zinc-400 leading-normal">
                      {getTranslation(lang, "demoNotification")}
                    </span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-[11px] text-emerald-400 font-medium font-mono leading-normal">
                      {getTranslation(lang, "activeAnalysis")}
                    </span>
                  </>
                )}
              </div>

              {/* Match Details Title */}
              <div className="flex justify-between items-center border-b border-zinc-850 pb-4">
                <div>
                  <span className="font-mono text-[10px] tracking-wider text-amber-500 uppercase font-semibold">
                    {league || "International Fixture"}
                  </span>
                  <h4 className="text-lg font-bold text-white mt-0.5">
                    {homeTeam} vs {awayTeam}
                  </h4>
                </div>

                <div className="text-right">
                  <span className="block text-[10px] font-mono text-zinc-500 uppercase">
                    {getTranslation(lang, "confidenceLevel")}
                  </span>
                  <span className="block text-xl font-mono font-black text-amber-400">
                    {result.confidence}%
                  </span>
                </div>
              </div>

              {/* Correct Score Outcomes */}
              <div className="space-y-3">
                <span className="block text-[10px] font-mono uppercase text-zinc-500">
                  {getTranslation(lang, "possibleOutcomes")}
                </span>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {result.predictions.map((pred, i) => (
                    <div
                      key={pred.score}
                      className="bg-zinc-950 p-4 rounded-2xl border border-zinc-850/50 flex flex-col justify-between"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-black font-mono text-amber-450 text-amber-400 mt-0.5">
                          {pred.score}
                        </span>
                        <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                          {pred.probability}%
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-550 mt-1 pb-1 leading-normal border-t border-zinc-900 pt-1.5">
                        {pred.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Insight advisory box */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                <span className="block text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider mb-1">
                  {getTranslation(lang, "keyInsight")}
                </span>
                <p className="text-xs text-white leading-normal font-medium">{result.keyInsight}</p>
              </div>

              {/* Holistic written commentary */}
              <div className="space-y-2 pt-2 border-t border-zinc-850">
                <span className="block text-[10px] font-mono uppercase text-zinc-500">
                  {getTranslation(lang, "overallAnalysis")}
                </span>
                <p className="text-xs text-zinc-400 leading-relaxed text-justify">
                  {result.analysis}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
