"use client";

// src/app/lib/AuthContext
// TODO - Create an AuthContext to manage user authentication
import { createContext } from "react";
import { UserCredential, User } from "firebase/auth";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<UserCredential>;
  signIn: (email: string, password: string) => Promise<UserCredential>;
  signInWithGoogle: () => Promise<UserCredential>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export default AuthContext;
