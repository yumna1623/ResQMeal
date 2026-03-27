// src/context/AuthContext.tsx
// Global auth state — wraps the whole app so any screen can
// call useAuth() to get the current user + their role

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

// TypeScript: define what our context will hold
type UserRole = 'hall' | 'ngo' | null;

interface AuthContextType {
  user: User | null;       // Firebase user object (has uid, email, etc.)
  userRole: UserRole;      // 'hall' or 'ngo' — fetched from Firestore
  loading: boolean;        // true while we're checking login status
}

// Create context with a default value of null
const AuthContext = createContext<AuthContextType | null>(null);

// AuthProvider wraps App.tsx — all screens inside can read auth state
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // onAuthStateChanged fires whenever user logs in or out
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is logged in — fetch their role from Firestore
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          // Cast to UserRole since we know it's 'hall' or 'ngo'
          setUserRole(userDoc.data().role as UserRole);
        }
        setUser(firebaseUser);
      } else {
        // User logged out — clear everything
        setUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    // Cleanup listener when component unmounts
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, userRole, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook — any screen does: const { user, userRole } = useAuth()
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  // Throw error if used outside AuthProvider — helpful for debugging
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}