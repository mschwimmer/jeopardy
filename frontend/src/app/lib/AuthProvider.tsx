"use client";
// src/app/lib/AuthProvider.ts

import React, { useContext, useEffect, useState } from "react";
import AuthContext from "./AuthContext";
import { fireBaseAuth } from "@/utils/firebase";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  // UserCredential,
  User,
} from "firebase/auth";

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

const AuthProvider = ({
  children,
}: {
  children: React.ReactNode;
}): React.ReactNode => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(fireBaseAuth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Sign up with email and password
  const signUp = (email: string, password: string) => {
    return createUserWithEmailAndPassword(fireBaseAuth, email, password);
  };

  // Sign in with email and password
  const signIn = (email: string, password: string) => {
    return signInWithEmailAndPassword(fireBaseAuth, email, password);
  };

  // Sign in with Google
  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(fireBaseAuth, provider);
  };

  // Sign out
  const logout = () => {
    return signOut(fireBaseAuth);
  };

  // Context value
  const value = {
    user,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
