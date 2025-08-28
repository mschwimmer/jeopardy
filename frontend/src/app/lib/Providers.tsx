// src/app/lib/Providers.tsx
"use client"; // This ensures the component is treated as a Client component

import { useEffect, useState } from "react";
import {
  ApolloProvider,
  ApolloClient,
  NormalizedCacheObject,
} from "@apollo/client";
import AuthProvider, { useAuth } from "./AuthProvider";
import { createApolloClient } from "./apolloClient";
import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";

import theme from "./theme";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v14-appRouter";
import { BackendUserProvider } from "./BackendUserContext";

interface ProviderProps {
  children: React.ReactNode;
}

const ApolloWrapper = ({ children }: { children: React.ReactNode }) => {
  const [client, setClient] =
    useState<ApolloClient<NormalizedCacheObject> | null>(null);
  const { loadingFBase } = useAuth();

  useEffect(() => {
    if (!loadingFBase) {
      createApolloClient().then(setClient);
    }
  }, [loadingFBase]);

  if (loadingFBase || !client) return null; // Show nothing or a loading spinner

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};

const Providers = ({ children }: ProviderProps) => {
  return (
    <AuthProvider>
      <ApolloWrapper>
        <BackendUserProvider>
          <AppRouterCacheProvider>
            <ThemeProvider theme={theme} defaultMode="system">
              <CssBaseline />
              {children}
            </ThemeProvider>
          </AppRouterCacheProvider>
        </BackendUserProvider>
      </ApolloWrapper>
    </AuthProvider>
  );
};

export default Providers;
