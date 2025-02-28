// src/app/layout.tsx

import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Providers from "./lib/Providers";
import { Roboto } from "next/font/google";
import NavBar from "./components/NavBar";
import AuthGuard from "./components/AuthGuard";

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-roboto",
});

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Trivia Friends",
  description: "The best Trivia app you've ever laid your eggs in",
  icons: {
    icon: "/dog-but-orange.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${roboto.variable}`}
      >
        <Providers>
          {" "}
          {/* Wrap children with Providers */}
          <AuthGuard>
            <NavBar />

            {/* Main Content */}
            <main>{children}</main>
          </AuthGuard>
        </Providers>
      </body>
    </html>
  );
}
