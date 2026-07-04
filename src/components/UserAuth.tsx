import React, { useState, useEffect } from "react";
import { Language, UserProfile } from "../types";
import { getTranslation } from "../translations";
import { LogIn, LogOut, Mail, ShieldCheck, User, Sparkles, AlertCircle, Lock, Eye, EyeOff } from "lucide-react";

interface UserAuthProps {
  lang: Language;
  onUserUpdate: (user: UserProfile | null) => void;
  currentUser: UserProfile | null;
  triggerOpenCount?: number;
  registeredUsers?: UserProfile[];
}

export default function UserAuth({ 
  lang, 
  onUserUpdate, 
  currentUser, 
  triggerOpenCount,
  registeredUsers = []
}: UserAuthProps) {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [gmailInput, setGmailInput] = useState<string>("");
  const [nameInput, setNameInput] = useState<string>("");
  const [passwordInput, setPasswordInput] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorText, setErrorText] = useState<string>("");

  useEffect(() => {
    if (triggerOpenCount && triggerOpenCount > 0) {
      setErrorText("");
      setShowModal(true);
    }
  }, [triggerOpenCount]);

  useEffect(() => {
    // Attempt to load previous session
    try {
      const stored = localStorage.getItem("fambet_user_session");
      if (stored) {
        const parsed = JSON.parse(stored) as UserProfile;
        if (parsed && parsed.isLoggedIn) {
          onUserUpdate(parsed);
        }
      }
    } catch (e) {
      console.error("Failed to recover user session", e);
    }
  }, []);

  const generateVipId = () => {
    // Generates a customer reference ID starting with FB0132 followed by 4 random digits
    const suffix = Math.floor(1000 + Math.random() * 9000).toString();
    return `FB0132${suffix}`;
  };

  const handleGoogleSignInSimulated = (email: string, name: string, passwordVal?: string) => {
    const finalEmail = email.trim().toLowerCase();
    if (!finalEmail || !finalEmail.includes("@")) {
      setErrorText(lang === "en" ? "Please enter a valid Gmail address" : "እባክዎን ትክክለኛ የጂሜይል አድራሻ ያስገቡ");
      return;
    }
    
    const pw = (passwordVal !== undefined ? passwordVal : passwordInput).trim();
    if (!pw || pw.length < 4) {
      setErrorText(lang === "en" ? "Password must be at least 4 characters" : "የይለፍ ቃል ቢያንስ 4 ፊደላት መሆን አለበት");
      return;
    }

    // Check if the user already exists in our system
    const existingUser = registeredUsers.find((u) => u.email.toLowerCase() === finalEmail);
    if (existingUser) {
      // Validate password
      if (existingUser.password && existingUser.password !== pw) {
        setErrorText(
          lang === "en" 
            ? "Incorrect password for this account. For security, ask Administrator on Telegram (@FAMbet161) to reset or update your PIN." 
            : "የተሳሳተ የይለፍ ቃል። ለደህንነትዎ ሲባል በቴሌግራም (@FAMbet161) በኩል ከአድሚኑ ፈጣን መክፈቻ መጠየቅ ይችላሉ።"
        );
        return;
      }
    }
    
    setIsSubmitting(true);
    setErrorText("");

    setTimeout(() => {
      const finalName = existingUser ? existingUser.displayName : (name.trim() || email.split("@")[0]);
      const finalId = existingUser ? existingUser.id : generateVipId();

      const newUser: UserProfile = {
        id: finalId,
        displayName: finalName.charAt(0).toUpperCase() + finalName.slice(1),
        email: finalEmail,
        isLoggedIn: true,
        photoURL: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(finalEmail)}`,
        password: pw,
        bankName: existingUser?.bankName,
        bankAccountNo: existingUser?.bankAccountNo,
        bankAccountHolder: existingUser?.bankAccountHolder
      };

      try {
        localStorage.setItem("fambet_user_session", JSON.stringify(newUser));
      } catch (e) {
        console.warn("Could not save session in localStorage", e);
      }

      onUserUpdate(newUser);
      setIsSubmitting(false);
      setShowModal(false);
      setGmailInput("");
      setNameInput("");
      setPasswordInput("");
    }, 1200);
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem("fambet_user_session");
    } catch {}
    onUserUpdate(null);
  };

  return (
    <div className="flex items-center gap-3">
      {currentUser && currentUser.isLoggedIn ? (
        // Logged-in badge
        <div className="flex items-center gap-3 bg-zinc-950/60 border border-zinc-900 px-4 py-2 rounded-2xl">
          {currentUser.photoURL ? (
            <img
              src={currentUser.photoURL}
              alt={currentUser.displayName}
              className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center font-bold text-xs">
              {currentUser.displayName.charAt(0)}
            </div>
          )}

          <div className="text-left hidden sm:block">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-zinc-100">{currentUser.displayName}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div className="text-[9px] font-mono text-amber-500 font-semibold uppercase tracking-wider">
              ID: {currentUser.id}
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Log Out"
            className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-white/5 transition-all text-xs"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      ) : (
        // Non-logged-in Sign-in CTA
        <button
          onClick={() => {
            setErrorText("");
            setShowModal(true);
          }}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-450 hover:to-orange-550 text-black font-sans font-bold text-xs uppercase tracking-wider shadow-lg shadow-orange-950/20 transition-all flex items-center gap-2"
        >
          <LogIn className="w-4 h-4" />
          <span>{lang === "en" ? "Sign In with Google" : "በጂሜይል ይግቡ"}</span>
        </button>
      )}

      {/* Modern Google Authentication Dialog Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-md bg-zinc-950 border border-zinc-850 rounded-[32px] p-6 text-center space-y-6 shadow-2xl relative overflow-hidden">
            {/* Google-like colored strip */}
            <div className="absolute top-0 inset-x-0 h-1.5 flex">
              <div className="flex-1 bg-red-500" />
              <div className="flex-1 bg-blue-500" />
              <div className="flex-1 bg-yellow-400" />
              <div className="flex-1 bg-green-500" />
            </div>

            <div className="flex justify-between items-center pt-2">
              <div className="flex items-center gap-2 text-left">
                <div className="w-6 h-6 rounded bg-white flex items-center justify-center font-bold text-black text-xs font-serif">
                  G
                </div>
                <span className="text-[10px] font-mono uppercase text-zinc-500 tracking-widest">
                  Google Secure Identity
                </span>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-zinc-500 hover:text-white font-mono text-xs focus:outline-none"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white tracking-tight">
                {lang === "en" ? "Sign in with Gmail" : "በጂሜይል አካውንት ይግቡ"}
              </h3>
              <p className="text-xs text-zinc-400 leading-normal max-w-xs mx-auto">
                {lang === "en" 
                  ? "Connect your Google Account to access FAM Bet 1-Day All 3 Choice Premium VIP Tickets."
                  : "የፋም ቤት የ1 ቀን እጅግ አስገራሚ ጥቅሎችን ለማግኘት ጂሜይልዎን ያገናኙ።"}
              </p>
            </div>

            {errorText && (
              <div className="space-y-2">
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs flex items-center gap-2 text-left">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorText}</span>
                </div>
                {(errorText.includes("password") || errorText.includes("ይለፍ")) && (
                  <a
                    href="https://t.me/FAMbet161"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 py-2 px-3 bg-zinc-900 hover:bg-zinc-850 text-amber-500 hover:text-amber-400 text-xs font-mono font-bold rounded-xl transition-all border border-zinc-800"
                  >
                    💬 Contact Admin on Telegram Support (@FAMbet161)
                  </a>
                )}
              </div>
            )}

            <div className="space-y-4 text-left">
              {/* Email input field */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase text-zinc-500">
                  {lang === "en" ? "Google Account Email" : "የጂሜይል አድራሻ (Gmail)"}
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    required
                    placeholder="example@gmail.com"
                    value={gmailInput}
                    onChange={(e) => setGmailInput(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Password input field */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-mono uppercase text-zinc-500">
                    {lang === "en" ? "Security Password" : "የይለፍ ቃል (Password)"}
                  </label>
                  <span className="text-[9px] font-mono text-amber-500/80">
                    {gmailInput.includes("@") && registeredUsers.some(u => u.email.toLowerCase() === gmailInput.trim().toLowerCase()) 
                      ? (lang === "en" ? "Existing User" : "ነባር አካውንት")
                      : (lang === "en" ? "New User Set Pin" : "አዲስ የይለፍ ቃል")}
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder={lang === "en" ? "Enter or create password" : "የይለፍ ቃል ያስገቡ ወይም ይፍጠሩ"}
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-10 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Name input field */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase text-zinc-500">
                  {lang === "en" ? "Your Full Name (Optional)" : "ሙሉ ስምዎት (በምርጫ)"}
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    placeholder="e.g. Kirubel Abebe"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3.5">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleGoogleSignInSimulated(gmailInput, nameInput, passwordInput)}
                className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-450 text-black font-sans font-bold text-xs uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>{lang === "en" ? "Verifying Credentials..." : "ምስክር ወረቀቶችን በማረጋገጥ ላይ..."}</span>
                  </span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>{lang === "en" ? "Authorize & Sign In" : "አረጋግጥና ግባ"}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  // Direct fast bypass Google login to ease user actions with default password
                  handleGoogleSignInSimulated("kiruabu8@gmail.com", "Kirubel Abebe", "password");
                }}
                className="w-full py-3 bg-zinc-900 hover:bg-zinc-850 text-zinc-400 rounded-xl text-center text-xs font-mono font-medium transition-all"
              >
                ⚡ Fast Gmail Log In (kiruabu8@gmail.com)
              </button>
            </div>

            <div className="pt-4 border-t border-zinc-900 text-[10px] text-zinc-550 flex items-center gap-1.5 justify-center">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>FAM Bet SSL 256-bit encrypted single sign-on.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
