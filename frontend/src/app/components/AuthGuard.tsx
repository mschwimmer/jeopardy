"use client";

import React, { useEffect, useMemo } from "react";
import { useAuth } from "../lib/AuthProvider";
import { useBackendUser } from "../lib/BackendUserContext";
import { useRouter, usePathname } from "next/navigation";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { firebaseUser, loadingFBase } = useAuth();
  const { backendUser, loadingBackendUser } = useBackendUser();
  const router = useRouter();
  const pathname = usePathname();
  const publicRoutes = useMemo(
    () => ["/", "/sign-in", "/sign-up", "/join"],
    []
  );

  useEffect(() => {
    const isPublicRoute = publicRoutes.some((route) =>
      route === "/" ? pathname === "/" : pathname.startsWith(route)
    );
    // Redirect to sign-in if user is not authenticated and on a protected route
    if (!loadingFBase && !firebaseUser && !isPublicRoute) {
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
    firebaseUser,
    backendUser,
    loadingFBase,
    loadingBackendUser,
    router,
    pathname,
    publicRoutes,
  ]);

  if (loadingFBase) {
    return (
      <FullScreenLoader message="Loading data from our Google overlords..." />
    );
  }

  if (!loadingFBase && loadingBackendUser) {
    return <FullScreenLoader message="Loading data from our backend..." />;
  }

  return <>{children}</>;
}

function FullScreenLoader({ message }: { message: string }) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        width: "100%",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 9999,
        backgroundColor: "rgba(255, 255, 255, 0.9)",
      }}
    >
      <CircularProgress
        size={120}
        thickness={4}
        sx={{ color: "primary.main" }}
      />
      <Box mt={3} fontSize="1.2rem" fontWeight="500">
        {message}
      </Box>
    </Box>
  );
}
