"use client";

import React, { useEffect, useMemo } from "react";
import { useAuth } from "../lib/AuthProvider";
import { useRouter, usePathname } from "next/navigation";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, backendUser, loading, loadingBackendUser } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const publicRoutes = useMemo(() => ["/", "/sign-in", "/sign-up"], []);

  useEffect(() => {
    // Redirect to sign-in if user is not authenticated and on a protected route
    if (!loading && !user && !publicRoutes.includes(pathname)) {
      // TODO tell user they're not signed in, and redirecting to sign-in
      router.push("/sign-in");
      return;
    }

    // Redirect users to their own profile page if they try to access someone else's
    if (!loadingBackendUser && backendUser && pathname.startsWith("/users/")) {
      const currentUserId: string = backendUser.id.toString();
      const routeUserId: string = pathname.split("/")[2]; // Extract user ID from URL

      if (currentUserId !== routeUserId) {
        router.push(`/users/${currentUserId}`);
        return;
      }
    }
  }, [
    user,
    backendUser,
    loading,
    loadingBackendUser,
    router,
    pathname,
    publicRoutes,
  ]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh", // Full viewport height
          width: "100%",
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 9999,
          backgroundColor: "rgba(255, 255, 255, 0.9)", // Semi-transparent background
        }}
      >
        <CircularProgress
          size={120} // Much larger size
          thickness={4} // Optional: adjust thickness
          sx={{
            color: "primary.main",
          }}
        />
        <Box mt={3} fontSize="1.2rem" fontWeight="500">
          Loading data from our Google overlords...
        </Box>
      </Box>
    );
  }

  if (!loading && loadingBackendUser) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh", // Full viewport height
          width: "100%",
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 9999,
          backgroundColor: "rgba(255, 255, 255, 0.9)", // Semi-transparent background
        }}
      >
        <CircularProgress
          size={120} // Much larger size
          thickness={4} // Optional: adjust thickness
          sx={{
            color: "primary.main",
          }}
        />
        <Box mt={3} fontSize="1.2rem" fontWeight="500">
          Loading data from our backend...
        </Box>
      </Box>
    );
  }

  return <>{children}</>;
}
