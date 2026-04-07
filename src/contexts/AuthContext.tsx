import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { subscribeToKit } from '../lib/kit';
import type { SubscriptionData } from '../lib/tiers';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  subscription: SubscriptionData;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  logOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshSubscription: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionData>({
    tier: 'none',
    status: 'none',
  });

  async function fetchSubscription(userObj: User) {
    try {
      const docRef = doc(db, 'users', userObj.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setSubscription(docSnap.data() as SubscriptionData);
      } else {
        // New user — create a record
        await setDoc(docRef, {
          email: userObj.email,
          tier: 'none',
          status: 'none',
          createdAt: Date.now(),
        });
        setSubscription({ tier: 'none', status: 'none' });
      }
    } catch (err) {
      console.error('Error fetching subscription:', err);
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (userObj) => {
      setUser(userObj);
      if (userObj) {
        await fetchSubscription(userObj);
      } else {
        setSubscription({ tier: 'none', status: 'none' });
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  async function signIn(email: string, password: string) {
    await signInWithEmailAndPassword(auth, email, password);
  }

  async function signUp(email: string, password: string) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, 'users', cred.user.uid), {
      email,
      tier: 'none',
      status: 'none',
      createdAt: Date.now(),
    });
    // Subscribe to Kit welcome sequence
    const firstName = email.split('@')[0].replace(/[._]/g, ' ').trim();
    await subscribeToKit(email, firstName || 'Member', ['new-member', 'email-sequence']);
  }

  async function logOut() {
    await signOut(auth);
  }

  async function resetPassword(email: string) {
    await sendPasswordResetEmail(auth, email);
  }

  async function refreshSubscription() {
    if (user) await fetchSubscription(user);
  }

  return (
    <AuthContext.Provider value={{ user, loading, subscription, signIn, signUp, logOut, resetPassword, refreshSubscription }}>
      {children}
    </AuthContext.Provider>
  );
}
