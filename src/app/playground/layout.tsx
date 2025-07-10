import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import { SessionProvider } from "next-auth/react";
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "API Playground – OZ-MCP",
  description: "Try our Opportunity Zone API with temporary access keys. No signup required for testing.",
  keywords: ["API Playground", "Opportunity Zones", "OZ", "Testing", "Free API", "Temporary Access"],
};

export default function PlaygroundLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
} 