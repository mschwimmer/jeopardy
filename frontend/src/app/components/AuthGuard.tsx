"use client";

import React, { useEffect } from "react";
import { useAuth } from "../lib/AuthProvider";
import { useRouter, usePathname } from "next/navigation";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const publicRoutes = ["/", "/sign-in", "/sign-up"];
    if (!loading && !user && !publicRoutes.includes(pathname)) {
      // TODO tell user they're not signed in, and redirecting to sign-in
      router.push("/sign-in");
    }
  }, [user, loading, router, pathname]);

  if (loading && !user) {
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
          Loading...
        </Box>
      </Box>
    );
  }

  return <>{children}</>;
}
