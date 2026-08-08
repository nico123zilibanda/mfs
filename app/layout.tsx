import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Ongea na DED Mlele",
    template: "%s | Ongea na DED Mlele",
  },
  description:
    "Mfumo wa kupokea maoni na taarifa kutoka kwa wananchi wa Halmashauri ya Wilaya ya Mlele.",
  applicationName: "Ongea na DED Mlele",
  keywords: ["Mlele", "Katavi", "maoni", "malalamiko", "taarifa za wananchi"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sw">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster position="top-right" richColors closeButton expand={false} />
      </body>
    </html>
  );
}
