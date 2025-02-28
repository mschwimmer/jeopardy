// /app/user/[user_uuid]/layout.tsx
"use client";

import React, { useEffect } from "react";
import { useAuth } from "../../lib/AuthProvider";
import { useRouter, usePathname } from "next/navigation";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { backendUser, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && backendUser) {
      const currentUserId = backendUser.id;
      const routeUserId = Number(pathname.split("/")[2]);
      if (currentUserId !== routeUserId) {
        // Maybe tell user they're being redirected to the proper page
        router.push(`/users/${currentUserId}`);
      }
    }
  }, [backendUser, loading, router, pathname]);

  if (loading || !backendUser) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
}
