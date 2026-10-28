import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import { Shield, Lock, KeyRound, ArrowLeft, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';

interface AdminSecurityGateProps {
  children: React.ReactNode;
  onExitAdmin: () => void;
}

const AUTHORIZED_OWNER_EMAIL = 'chowdhuryistiak66@gmail.com';
const STORAGE_KEY = 'zarven_admin_unlocked';

export const AdminSecurityGate: React.FC<AdminSecurityGateProps> = ({
  children,
  onExitAdmin
}) => {
  const { currentUser, loginWithGoogle, logout } = useAuth();
  const { settings } = useSiteSettings();

  const [enteredPin, setEnteredPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSessionUnlocked, setIsSessionUnlocked] = useState<boolean>(() => {
    return typeof window !== 'undefined' && sessionStorage.getItem(STORAGE_KEY) === 'true';
  });

  const correctPin = settings?.adminPasscode || '1971';
  const isOwnerEmail = currentUser?.email?.toLowerCase() === AUTHORIZED_OWNER_EMAIL.toLowerCase();

  // If the signed-in user is the store owner, automatically unlock
  useEffect(() => {
    if (isOwnerEmail) {
      sessionStorage.setItem(STORAGE_KEY, 'true');
      setIsSessionUnlocked(true);
    }
  }, [isOwnerEmail]);

  const handlePinUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!enteredPin.trim()) {
      setErrorMessage('অনুগ্রহ করে এডমিন মাস্টার পাসকোড প্রদান করুন।');
      return;
    }

    if (enteredPin.trim() === correctPin) {
      setSuccessMessage('পাসকোড সঠিক! এডমিন স্টুডিও আনলক হচ্ছে...');
      sessionStorage.setItem(STORAGE_KEY, 'true');
      setTimeout(() => {
        setIsSessionUnlocked(true);
      }, 400);
    } else {
      setErrorMessage('ভুল পাসকোড! সঠিক এডমিন সিক্রেট পাসকোড প্রদান করুন।');
    }
  };

  const handleGoogleAuth = async () => {
    setErrorMessage(null);
    setIsVerifying(true);
    try {
      await loginWithGoogle();
      // Auth state change will handle unlocking if email matches
    } catch (err: any) {
      setErrorMessage(err?.message || 'গুগল সাইন-ইন সম্পন্ন করা সম্ভব হয়নি। পাসকোড ব্যবহার করুন।');
    } finally {
      setIsVerifying(false);
    }
  };

  // If already authorized (either via owner email or verified session passcode)
  if (isSessionUnlocked || isOwnerEmail) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#07070a] text-white flex items-center justify-center p-4 selection:bg-[#d4af37] selection:text-black">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#d4af37]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-[32rem] h-[32rem] bg-indigo-950/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md bg-[#0f0f16] border border-[#262638] rounded-xl p-6 sm:p-8 shadow-2xl shadow-black/90 backdrop-blur-md">
        {/* Zarven Emblem & Header */}
        <div className="text-center mb-6">
          <div className="relative inline-block mb-3">
            <img
              src={settings?.logoUrl || '/assets/aistudio/1792832789266_1792835490423edit_539d88fb.jpg'}
              alt="Zarven Emblem"
              className="w-16 h-16 rounded-full object-cover mx-auto border-2 border-[#d4af37]/70 shadow-lg shadow-[#d4af37]/15"
            />
            <div className="absolute -bottom-1 -right-1 bg-[#161622] border border-[#d4af37] rounded-full p-1 text-[#d4af37]">
              <Lock className="w-3.5 h-3.5" />
            </div>
          </div>

          <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#d4af37] block">
            Administrative Gate // স্টোর সিকিউরিটি
          </span>
          <h1 className="font-serif text-xl sm:text-2xl font-bold tracking-wider text-white uppercase mt-1">
            Zarven Atelier Studio
          </h1>
          <p className="text-xs text-[#a1a1aa] mt-1.5 leading-relaxed">
            অননুমোদিত প্রবেশ সম্পূর্ণ নিষিদ্ধ। এই প্যানেল শুধুমাত্র স্টোর মালিকের জন্য সুরক্ষিত।
          </p>
        </div>

        {/* Security Warning Notice */}
        <div className="mb-6 p-3.5 bg-[#141420] border border-[#2b2b3d] rounded-lg text-xs space-y-1.5">
          <div className="flex items-center gap-2 text-[#d4af37] font-semibold text-[11px]">
            <Shield className="w-4 h-4 shrink-0" />
            <span>নিরাপত্তা সুরক্ষা পলিসি (Dual-Layer Security)</span>
          </div>
          <p className="text-[#9ca3af] text-[11px] leading-relaxed">
            অনুমোদিত এডমিন ইমেইল: <code className="text-[#fef08a] bg-[#1d1d2b] px-1.5 py-0.5 rounded font-mono text-[10px]">{AUTHORIZED_OWNER_EMAIL}</code> অথবা আপনার সিক্রেট এডমিন মাস্টার পাসকোড প্রবেশ করান।
          </p>
        </div>

        {/* Alert Messages */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-950/50 border border-red-500/50 rounded-lg flex items-start gap-2.5 text-xs text-red-200">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">{errorMessage}</div>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 bg-emerald-950/50 border border-emerald-500/50 rounded-lg flex items-center gap-2 text-xs text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Access Form */}
        <div className="space-y-5">
          {/* Option A: Passcode Unlock */}
          <form onSubmit={handlePinUnlock} className="space-y-3">
            <label className="block text-[11px] font-mono uppercase tracking-wider text-[#d4af37]">
              পদ্ধতি ১: সিক্রেট মাস্টার পাসকোড (Admin PIN)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#71717a]">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                type={showPin ? 'text' : 'password'}
                value={enteredPin}
                onChange={(e) => setEnteredPin(e.target.value)}
                placeholder="মাস্টার পাসকোড লিখুন (যেমন: 1971)"
                className="w-full pl-9 pr-10 py-2.5 bg-[#171724] border border-[#2b2b40] rounded-lg text-sm text-white placeholder-[#71717a] focus:outline-none focus:border-[#d4af37] transition-colors"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#71717a] hover:text-white"
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-[#d4af37] text-black font-semibold text-xs tracking-wider uppercase rounded-lg hover:bg-[#dfbe4e] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <KeyRound className="w-3.5 h-3.5" />
              আনলক করুন (Unlock Studio)
            </button>
          </form>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-[#262638]" />
            <span className="text-[10px] font-mono text-[#71717a] uppercase">অথবা</span>
            <div className="flex-1 h-px bg-[#262638]" />
          </div>

          {/* Option B: Google Sign-in */}
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-[#a1a1aa] mb-2">
              পদ্ধতি ২: গুগল সাইন-ইন (স্টোর ওনার অ্যাকাউন্ট)
            </label>
            {currentUser ? (
              <div className="p-3 bg-[#171724] border border-[#2e2e42] rounded-lg flex items-center justify-between text-xs">
                <div className="truncate">
                  <span className="text-[10px] text-[#71717a] block">লগইন করা আছে:</span>
                  <span className="font-mono text-white truncate block">{currentUser.email}</span>
                  {!isOwnerEmail && (
                    <span className="text-[10px] text-amber-400 block mt-0.5">⚠️ এটি অনুমোদিত এডমিন ইমেইল নয়</span>
                  )}
                </div>
                <button
                  onClick={() => logout()}
                  className="text-xs text-red-400 hover:text-red-300 underline shrink-0 ml-2"
                >
                  লগআউট
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={isVerifying}
                className="w-full py-2.5 bg-[#171724] border border-[#2e2e42] hover:border-[#d4af37] text-white text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.1c0 2.8.7 5.4 1.9 7.8l3.7-2.9z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16.5C3.7 20.2 7.5 23.5 12 23.5z"
                  />
                </svg>
                {isVerifying ? 'যাচাই করা হচ্ছে...' : 'Sign in with Google as Store Owner'}
              </button>
            )}
          </div>
        </div>

        {/* Back to Storefront button */}
        <div className="mt-6 pt-5 border-t border-[#1f1f2e] text-center">
          <button
            onClick={onExitAdmin}
            className="text-xs text-[#a1a1aa] hover:text-white transition-colors flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            ওয়েবসাইটে ফিরে যান (Exit to Storefront)
          </button>
        </div>
      </div>
    </div>
  );
};
