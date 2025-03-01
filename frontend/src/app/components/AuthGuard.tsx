"use client";

import React, { useEffect } from "react";
import { useAuth } from "../lib/AuthProvider";
import { useRouter, usePathname } from "next/navigation";

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
    // TODO replace with MUI loading component
    return <div>Loading...</div>;
  }

  return <>{children}</>;
}
