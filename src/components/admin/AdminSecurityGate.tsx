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
      setErrorMessage('Please enter the admin passcode.');
      return;
    }

    if (enteredPin.trim() === correctPin) {
      setSuccessMessage('Passcode verified! Unlocking Admin Studio...');
      sessionStorage.setItem(STORAGE_KEY, 'true');
      setTimeout(() => {
        setIsSessionUnlocked(true);
      }, 400);
    } else {
      setErrorMessage('Incorrect passcode. Please enter the valid admin passcode.');
    }
  };

  const handleGoogleAuth = async () => {
    setErrorMessage(null);
    setIsVerifying(true);
    try {
      await loginWithGoogle();
      // Auth state change will handle unlocking if email matches
    } catch (err: any) {
      setErrorMessage(err?.message || 'Google sign-in could not be completed.');
    } finally {
      setIsVerifying(false);
    }
  };

  // If already authorized (either via owner email or verified session passcode)
  if (isSessionUnlocked || isOwnerEmail) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-gray-900 flex items-center justify-center p-4 selection:bg-gray-900 selection:text-white">
      <div className="relative w-full max-w-md bg-white border border-gray-200/90 rounded-2xl p-6 sm:p-8 shadow-xl shadow-gray-200/60">
        {/* Brand Emblem & Clean Title */}
        <div className="text-center mb-6">
          <div className="relative inline-block mb-3">
            <img
              src={settings?.logoUrl || '/assets/aistudio/1792832789266_1792835490423edit_539d88fb.jpg'}
              alt="Zarven Emblem"
              className="w-14 h-14 rounded-full object-cover mx-auto border-2 border-gray-200 shadow-sm"
            />
            <div className="absolute -bottom-1 -right-1 bg-white border border-gray-300 rounded-full p-1 text-gray-700 shadow-2xs">
              <Lock className="w-3 h-3" />
            </div>
          </div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-gray-900 uppercase">
            Admin Portal
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Secure access to Zarven store management
          </p>
        </div>

        {/* Alert Messages */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{errorMessage}</div>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{successMessage}</span>
          </div>
        )}

        {/* Access Form */}
        <div className="space-y-4">
          {/* Passcode Unlock */}
          <form onSubmit={handlePinUnlock} className="space-y-3">
            <label htmlFor="admin-security-pin" className="block text-xs font-semibold text-gray-700">
              Admin Passcode
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                id="admin-security-pin"
                name="adminPin"
                type={showPin ? 'text' : 'password'}
                value={enteredPin}
                onChange={(e) => setEnteredPin(e.target.value)}
                placeholder="Enter Passcode"
                className="w-full pl-9 pr-10 py-2.5 bg-gray-50 hover:bg-white focus:bg-white border border-gray-300 focus:border-black rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none transition-colors"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-700 cursor-pointer"
                aria-label={showPin ? 'Hide passcode' : 'Show passcode'}
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-gray-900 hover:bg-black text-white font-semibold text-xs tracking-wider uppercase rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-[0.99]"
            >
              <KeyRound className="w-3.5 h-3.5" />
              Unlock Studio
            </button>
          </form>
        </div>

        {/* Back button */}
        <div className="mt-6 pt-4 border-t border-gray-100 text-center">
          <button
            onClick={onExitAdmin}
            className="text-xs text-gray-500 hover:text-gray-900 transition-colors flex items-center justify-center gap-1.5 mx-auto cursor-pointer font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};
