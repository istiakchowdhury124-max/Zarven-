import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User as FirebaseUser,
  signInWithPopup,
  signOut as fbSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from '../lib/firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  isAdmin: boolean;
  isLoading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  toggleAdminMockMode?: () => void;
  isMockAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  userProfile: null,
  isAdmin: false,
  isLoading: true,
  loginWithGoogle: async () => {},
  logout: async () => {},
  isMockAdmin: false
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isMockAdmin, setIsMockAdmin] = useState<boolean>(() => {
    return typeof window !== 'undefined' && sessionStorage.getItem('zarven_admin_unlocked') === 'true';
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          
          const isUserEmailAdmin = user.email === 'chowdhuryistiak66@gmail.com';

          if (userDoc.exists()) {
            const data = userDoc.data() as UserProfile;
            setUserProfile(data);
            setIsAdmin(data.role === 'admin' || isUserEmailAdmin);
          } else {
            // Create user profile
            const newProfile: UserProfile = {
              uid: user.uid,
              email: user.email || '',
              displayName: user.displayName || 'Distinguished Guest',
              role: isUserEmailAdmin ? 'admin' : 'customer',
              createdAt: new Date().toISOString()
            };
            await setDoc(userDocRef, newProfile);
            setUserProfile(newProfile);
            setIsAdmin(isUserEmailAdmin);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          if (user.email === 'chowdhuryistiak66@gmail.com') {
            setIsAdmin(true);
          }
        }
      } else {
        setUserProfile(null);
        setIsAdmin(false);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error('Google Sign-in failed:', err);
      // If popup is blocked or environment restricts popup, provide friendly feedback
      throw err;
    }
  };

  const logout = async () => {
    try {
      await fbSignOut(auth);
      setCurrentUser(null);
      setUserProfile(null);
      setIsAdmin(false);
      setIsMockAdmin(false);
      sessionStorage.removeItem('zarven_admin_unlocked');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const toggleAdminMockMode = () => {
    setIsMockAdmin(prev => {
      const next = !prev;
      if (next) {
        sessionStorage.setItem('zarven_admin_unlocked', 'true');
      } else {
        sessionStorage.removeItem('zarven_admin_unlocked');
      }
      return next;
    });
  };

  // User is admin if authenticated admin OR mock admin mode is active
  const effectiveIsAdmin = isAdmin || isMockAdmin;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        isAdmin: effectiveIsAdmin,
        isLoading,
        loginWithGoogle,
        logout,
        toggleAdminMockMode,
        isMockAdmin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
