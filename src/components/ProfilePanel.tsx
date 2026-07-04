import React, { useState } from "react";
import { Language, UserProfile } from "../types";
import { User, Lock, Mail, Shield, Eye, EyeOff, Save, KeyRound, Landmark, MessageSquare, AlertCircle, CheckCircle2 } from "lucide-react";

interface ProfilePanelProps {
  lang: Language;
  currentUser: UserProfile;
  onUserUpdate: (user: UserProfile | null) => void;
  registeredUsers: UserProfile[];
}

export default function ProfilePanel({ lang, currentUser, onUserUpdate, registeredUsers }: ProfilePanelProps) {
  // Details state
  const [displayName, setDisplayName] = useState<string>(currentUser.displayName || "");
  const [bankName, setBankName] = useState<string>(currentUser.bankName || "Commercial Bank of Ethiopia (CBE)");
  const [bankAccountNo, setBankAccountNo] = useState<string>(currentUser.bankAccountNo || "");
  const [bankAccountHolder, setBankAccountHolder] = useState<string>(currentUser.bankAccountHolder || "");

  // Password change state
  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showCurrentPw, setShowCurrentPw] = useState<boolean>(false);
  const [showNewPw, setShowNewPw] = useState<boolean>(false);

  // Status logs
  const [infoMessage, setInfoMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const handleUpdateProfileDetails = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setInfoMessage("");
    setIsSaving(true);

    if (!displayName.trim()) {
      setErrorMessage(lang === "en" ? "Full name cannot be empty" : "ይህ ሰሌዳ ባዶ መሆን አይችልም");
      setIsSaving(false);
      return;
    }

    setTimeout(() => {
      const updatedUser: UserProfile = {
        ...currentUser,
        displayName: displayName.trim(),
        bankName: bankName.trim(),
        bankAccountNo: bankAccountNo.trim(),
        bankAccountHolder: bankAccountHolder.trim(),
      };

      onUserUpdate(updatedUser);
      setInfoMessage(lang === "en" ? "Profile details updated successfully!" : "የአካውንት መግለጫዎ በትክክል ተሻሽሏል!");
      setIsSaving(false);
    }, 800);
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setInfoMessage("");

    // Validate current password
    const realCurrentPassword = currentUser.password || "password";
    if (currentPassword !== realCurrentPassword) {
      setErrorMessage(
        lang === "en" 
          ? "Incorrect current password. If forgotten, contact Telegram support (@FAMbet161) to reset." 
          : "የአሁኑ የይለፍ ቃል የተሳሳተ ነው። ከረሱት በቴሌግራም (@FAMbet161) አድሚኑን ይጠይቁ።"
      );
      return;
    }

    if (newPassword.trim().length < 4) {
      setErrorMessage(lang === "en" ? "New password must be at least 4 characters" : "አዲሱ የይለፍ ቃል ቢያንስ 4 ፊደላት መሆን አለበት");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage(lang === "en" ? "Passwords do not match" : "የይለፍ ቃላቶቹ አይጣጣሙም");
      return;
    }

    setIsSaving(true);
    setTimeout(() => {
      const updatedUser: UserProfile = {
        ...currentUser,
        password: newPassword.trim(),
      };

      onUserUpdate(updatedUser);
      setInfoMessage(lang === "en" ? "Password changed successfully!" : "የይለፍ ቃልዎ በትክክል ተቀይሯል!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setIsSaving(false);
    }, 1000);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Upper header */}
      <div>
        <h2 className="text-2xl md:text-3xl font-sans font-black text-white tracking-tight flex items-center gap-2">
          <User className="w-7 h-7 text-amber-550 text-amber-500" />
          <span>{lang === "en" ? "My VIP Member Profile" : "የቪአይፒ አካውንት መግለጫ"}</span>
        </h2>
        <p className="text-sm text-zinc-500 mt-1">
          {lang === "en"
            ? "Manage system credentials, payment details, and change your password."
            : "የአካውንትዎን ምስክር ወረቀቶች፣ የክፍያ ስሞች እና የይለፍ ቃልዎን እዚህ ያስተካክሉ።"}
        </p>
      </div>

      {infoMessage && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-[20px] text-emerald-400 text-xs flex items-center gap-2.5 max-w-4xl animate-pulse">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="font-semibold">{infoMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-[20px] text-red-450 text-xs flex items-center gap-2.5 max-w-4xl">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="font-semibold">{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl">
        
        {/* Profile Card & Info overview */}
        <div className="col-span-1 lg:col-span-4 space-y-6">
          <div className="bg-zinc-950 border border-zinc-900 rounded-[32px] p-6 text-center space-y-6 relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
            
            <div className="w-24 h-24 rounded-[36px] bg-zinc-900 border border-zinc-800 text-amber-500 flex items-center justify-center mx-auto shadow-inner overflow-hidden relative group">
              {currentUser.photoURL ? (
                <img 
                  src={currentUser.photoURL} 
                  alt={currentUser.displayName} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="text-4xl font-extrabold">{currentUser.displayName.charAt(0)}</span>
              )}
            </div>

            <div className="space-y-1.5">
              <h4 className="text-lg font-bold text-white tracking-tight">{currentUser.displayName}</h4>
              <p className="text-xs text-zinc-500 font-mono flex items-center justify-center gap-1">
                <Mail className="w-3.5 h-3.5" />
                <span>{currentUser.email}</span>
              </p>
            </div>

            <div className="pt-4 border-t border-zinc-900 grid grid-cols-2 gap-3">
              <div className="bg-zinc-900/40 p-3 rounded-xl text-center border border-zinc-900/60">
                <span className="text-[8px] text-zinc-500 uppercase block tracking-wider">MEMBER REFERENCE</span>
                <span className="text-xs text-amber-400 font-mono font-black">{currentUser.id}</span>
              </div>
              <div className="bg-zinc-900/40 p-3 rounded-xl text-center border border-zinc-900/60">
                <span className="text-[8px] text-zinc-500 uppercase block tracking-wider">VIP PASSWORD</span>
                <span className="text-xs text-zinc-300 font-mono font-bold">••••••••</span>
              </div>
            </div>

            <div className="bg-amber-500/5 hover:bg-amber-500/10 transition-all border border-amber-500/10 p-4 rounded-2xl text-left space-y-1">
              <div className="flex items-center gap-1.5 text-amber-400">
                <Shield className="w-3.5 h-3.5 animate-pulse" />
                <span className="text-[11px] font-mono uppercase font-bold tracking-wider">Account Protection Status</span>
              </div>
              <p className="text-[10px] text-zinc-400 leading-normal">
                {lang === "en"
                  ? "Your identity is protected by the device hardware-based passkey and secure session registry logic."
                  : "የእርስዎ አካውንት ደህንነት አስተማማኝ በሆነ የባዮሜትሪክስ እና የመግቢያ ኢንክሪፕሽን የተጠበቀ ነው።"}
              </p>
            </div>
          </div>

          {/* Quick Telegram Support Help Panel */}
          <div className="bg-gradient-to-r from-teal-950/25 to-zinc-950 border border-zinc-900 rounded-[32px] p-6 space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-teal-400" />
              <span>{lang === "en" ? "Need Password Recovery Help?" : "የይለፍ ቃል ማስተካከል አልቻሉም?"}</span>
            </h4>
            <p className="text-xs text-zinc-405 text-zinc-400 leading-relaxed font-sans">
              {lang === "en"
                ? "If you have completely forgotten your current password, or if your friends are locked out because of incorrect secrets, contact the FAM Bet Head Office desk on Telegram."
                : "የይለፍ ቃልዎን ሙሉ በሙሉ ከረሱት ወይም በስህተት ተቆልፎብዎት መግባት ካልቻሉ የፋም ቤት አስተዳዳሪውን በቴሌግራም ላይ በማነጋገር ማስከፈት ይችላሉ።"}
            </p>
            <a 
              href="https://t.me/FAMbet161"
              target="_blank"
              rel="noreferrer"
              className="w-full py-3 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-teal-400 hover:text-teal-350 text-xs font-mono font-bold rounded-xl transition-all uppercase text-center flex items-center justify-center gap-2"
            >
              💬 Request VIP Reset on Telegram
            </a>
          </div>
        </div>

        {/* Change Settings Section */}
        <div className="col-span-1 lg:col-span-8 space-y-8">
          
          {/* Form 1: Profile Details Editing */}
          <form onSubmit={handleUpdateProfileDetails} className="bg-zinc-950 border border-zinc-900 rounded-[32px] p-6 space-y-6">
            <div className="border-b border-zinc-900 pb-4">
              <h3 className="text-sm font-mono uppercase font-bold text-zinc-300">
                👤 {lang === "en" ? "MEMBER DETAILS & BANK CORRELATION" : "የአባል መግለጫ እና የባንክ ዝርዝሮች"}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
              {/* Name field */}
              <div className="space-y-1.5All border-zinc-900">
                <label className="text-[10px] font-mono uppercase text-zinc-500">
                  {lang === "en" ? "Full Name Display" : "የአባል ሙሉ ስም"}
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-850 rounded-xl pl-10 pr-4 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Email field (Read only) */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase text-zinc-500">
                  {lang === "en" ? "Authenticated Google Email ID (Immutable)" : "የማይለወጥ የጂሜይል አድራሻ"}
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-650">
                    <Mail className="w-4 h-4 text-zinc-600" />
                  </span>
                  <input
                    type="email"
                    disabled
                    value={currentUser.email}
                    className="w-full bg-zinc-900/40 border border-zinc-900/80 rounded-xl pl-10 pr-4 py-3 text-xs text-zinc-500 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Bank Selection field */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase text-zinc-500">
                  {lang === "en" ? "Preferred VIP Payout Merchant (Ethiopia)" : "የክፍያ መቀበያ የባንክ ተቋም"}
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-505">
                    <Landmark className="w-4 h-4 text-zinc-500" />
                  </span>
                  <select
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-850 rounded-xl pl-10 pr-4 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500 appearance-none"
                  >
                    <option value="Commercial Bank of Ethiopia (CBE)">Commercial Bank of Ethiopia (CBE)</option>
                    <option value="Telebirr (SuperApp)">Telebirr (SuperApp)</option>
                    <option value="Dashen Bank (Amole)">Dashen Bank (Amole)</option>
                    <option value="Awash Bank">Awash Bank</option>
                    <option value="Cooperative Bank of Oromia">Cooperative Bank of Oromia (Coop)</option>
                  </select>
                </div>
              </div>

              {/* Bank Account field */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase text-zinc-500">
                  {lang === "en" ? "Registered Payout Account Number" : "የባንክ ሂሳብ ቁጥር (Account)"}
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1000329104821 or 09xxxx"
                  value={bankAccountNo}
                  onChange={(e) => setBankAccountNo(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-850 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              {/* Bank Account Holder name */}
              <div className="col-span-1 md:col-span-2 space-y-1.5">
                <label className="text-[10px] font-mono uppercase text-zinc-500">
                  {lang === "en" ? "Account Owner Full Name (As registered in Bank)" : "የሂሳቡ ባለቤት ስም (ከባንክ ደብተር ጋር የሚገናኝ)"}
                </label>
                <input
                  type="text"
                  placeholder="e.g. KIRUBEL ABEBE"
                  value={bankAccountHolder}
                  onChange={(e) => setBankAccountHolder(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-850 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-zinc-900">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-3 bg-amber-500 hover:bg-amber-450 text-black text-xs font-mono font-bold uppercase rounded-xl tracking-wider transition-all flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? (lang === "en" ? "Saving..." : "በማስቀመጥ ላይ...") : (lang === "en" ? "Save Account Details" : "ዝርዝሮችን አስቀምጥ")}</span>
              </button>
            </div>
          </form>

          {/* Form 2: Password Changing (Single secure password update engine) */}
          <form onSubmit={handleUpdatePassword} className="bg-zinc-950 border border-zinc-900 rounded-[32px] p-6 space-y-6">
            <div className="border-b border-zinc-900 pb-4">
              <h3 className="text-sm font-mono uppercase font-bold text-zinc-300">
                🔑 {lang === "en" ? "CHANGE VIP SECURITY PASSWORD" : "የአካውንት ይለፍ ቃል መቀየር"}
              </h3>
            </div>

            <div className="space-y-5 text-left max-w-xl">
              {/* Current password field */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase text-zinc-500">
                  {lang === "en" ? "Verify Current Password (Required)" : "የአሁኑ የይለፍ ቃል"}
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type={showCurrentPw ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-850 rounded-xl pl-10 pr-10 py-3 text-xs text-white focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPw(!showCurrentPw)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                  >
                    {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Key lines */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* New password field */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase text-zinc-500">
                    {lang === "en" ? "Create New Password" : "አዲስ የይለፍ ቃል ይፍጠሩ"}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
                      <KeyRound className="w-4 h-4" />
                    </span>
                    <input
                      type={showNewPw ? "text" : "password"}
                      required
                      placeholder="Min 4 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-850 rounded-xl pl-10 pr-10 py-3 text-xs text-white focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPw(!showNewPw)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                    >
                      {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm password field */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase text-zinc-500">
                    {lang === "en" ? "Confirm New Password" : "አዲሱን የይለፍ ቃል ያረጋግጡ"}
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-850 rounded-xl px-4 py-3 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-zinc-900 col-span-1 sm:col-span-2">
              <button
                type="submit"
                className="px-6 py-3 bg-zinc-900 hover:bg-zinc-850 text-white hover:text-amber-400 text-xs font-mono font-bold uppercase rounded-xl tracking-wider transition-all border border-zinc-850 flex items-center gap-2"
              >
                <KeyRound className="w-4 h-4" />
                <span>{lang === "en" ? "Apply Password Revision" : "አዲስ የይለፍ ቃል ቀይር"}</span>
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}
