"use client";

// src/app/lib/AuthContext
// TODO - Create an AuthContext to manage user authentication
import { createContext } from "react";
import { UserCredential, User } from "firebase/auth";
import { User as BackendUser } from "@/__generated__/types";

interface AuthContextType {
  user: User | null;
  backendUser: BackendUser | null;
  loading: boolean;
  loadingBackendUser: boolean;
  signUp: (email: string, password: string) => Promise<UserCredential>;
  signIn: (email: string, password: string) => Promise<UserCredential>;
  signInWithGoogle: () => Promise<UserCredential>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export default AuthContext;
