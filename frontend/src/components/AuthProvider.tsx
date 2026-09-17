"use client";

import React, { createContext, useContext, useEffect } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAppStore } from "@/lib/store";
import { api } from "@/lib/api";

const AuthContext = createContext<{ user: User | null; isLoading: boolean }>({
  user: null,
  isLoading: true,
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, setUser, setSupabaseUser, isLoadingUser, setIsLoadingUser } = useAppStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          // Sync with FastAPI & Supabase
          const supabaseProfile = await api.getMe();
          setSupabaseUser(supabaseProfile);
        } catch (err) {
          console.warn("Could not sync with backend user profile (dev mode fallback):", err);
        }
      } else {
        setSupabaseUser(null);
      }
      setIsLoadingUser(false);
    });

    return () => unsubscribe();
  }, [setUser, setSupabaseUser, setIsLoadingUser]);

  return (
    <AuthContext.Provider value={{ user, isLoading: isLoadingUser }}>
      {children}
    </AuthContext.Provider>
  );
}
