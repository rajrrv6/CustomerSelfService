import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI-Native Omnichannel Customer Experience Platform",
  description: "Enterprise SaaS mPaaS platform including AI Chatbots, Agent Workspace, Ticketing, and Analytics.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-slate-100 transition-colors duration-200">
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}

