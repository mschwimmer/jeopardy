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
import { User as BackendUser } from "@/__generated__/types";
import { findUserByFirebaseUid } from "./serverQueries";

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
  const [backendUser, setBackendUser] = useState<BackendUser | null>(null);
  const [loading, setLoading] = useState(true); // Firebase auth loading
  const [loadingBackendUser, setLoadingBackendUser] = useState(true); // Backend user loading

  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(fireBaseAuth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Fetch the backend user only when a firebase user exists
  // Possibly setLoading while looking for backendUser
  useEffect(() => {
    if (user) {
      setLoadingBackendUser(true);
      const fetchBackendUser = async () => {
        try {
          const fetchedUser = await findUserByFirebaseUid(user.uid);
          setBackendUser(fetchedUser);
        } catch (error) {
          console.error("Error fetching backend user:", error);
        } finally {
          setLoadingBackendUser(false);
        }
      };
      fetchBackendUser();
    } else {
      // Clear backend user when there is no firebase user
      setBackendUser(null);
      setLoadingBackendUser(false);
    }
  }, [user]);

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

  // Log out
  const logout = () => {
    return signOut(fireBaseAuth);
  };

  // Context value
  const value = {
    user,
    backendUser,
    loading,
    loadingBackendUser,
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
