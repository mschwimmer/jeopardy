"use client";

// src/app/lib/BackendUserContext
// This file provides backend user context to the application, separate from Firebase auth context.

import React, { createContext, useContext } from "react";
import { useAuth } from "./AuthProvider";
import { User } from "@/__generated__/types";
import { useFindUserByFirebaseUidQuery } from "@/__generated__/graphql";

interface BackendUserContextType {
  backendUser: User | null;
  loadingBackendUser: boolean;
}

const BackendUserContext = createContext<BackendUserContextType | null>(null);

export const useBackendUser = () => {
  const context = useContext(BackendUserContext);
  if (!context)
    throw new Error("useBackendUser must be used within BackendUserProvider");
  return context;
};

export const BackendUserProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { firebaseUser } = useAuth();

  const { data, loading } = useFindUserByFirebaseUidQuery({
    skip: !firebaseUser,
    variables: { firebaseUid: firebaseUser?.uid ?? "" },
  });

  return (
    <BackendUserContext.Provider
      value={{
        backendUser: data?.findUserByFirebaseUid ?? null,
        loadingBackendUser: loading,
      }}
    >
      {children}
    </BackendUserContext.Provider>
  );
};
