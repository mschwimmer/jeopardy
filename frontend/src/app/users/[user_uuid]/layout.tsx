// /app/user/[user_uuid]/layout.tsx
"use client";

import React from "react";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
