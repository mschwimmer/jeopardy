// /app/user/[user_id]/layout.tsx
"use client";

import React from "react";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
