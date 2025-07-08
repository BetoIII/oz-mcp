import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { auth } from "./auth";
import { SessionProvider } from "next-auth/react";
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { ThemeProvider } from "@/components/theme-provider";

// Force dynamic rendering since we use auth() which accesses headers
export const dynamic = 'force-dynamic';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OZ-MCP – Instant Opportunity Zone Check",
  description: "Check any U.S. address for Qualified Opportunity Zone status in seconds. First 3 lookups free.",
  keywords: ["Opportunity Zones", "OZ", "Tax Benefits", "Address Check", "Real Estate", "Investment", "QOZ"],
  authors: [{ name: "OZ-MCP Team" }],
  creator: "OZ-MCP",
  publisher: "OZ-MCP",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://oz-mcp.vercel.app'),
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: "OZ-MCP – Instant Opportunity Zone Check",
    description: "Check any U.S. address for Qualified Opportunity Zone status in seconds. First 3 lookups free.",
    url: 'https://oz-mcp.vercel.app',
    siteName: 'OZ-MCP',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'OZ-MCP – Instant Opportunity Zone Check',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "OZ-MCP – Instant Opportunity Zone Check",
    description: "Check any U.S. address for Qualified Opportunity Zone status in seconds. First 3 lookups free.",
    creator: '@oz_mcp',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Handle auth errors gracefully - don't block page rendering if database is down
  let session = null;
  try {
    session = await auth();
  } catch (error) {
    console.warn('Auth error in layout (using fallback):', error);
    // Continue without session - will use client-side session handling
  }

  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#2563eb" />
        <meta name="color-scheme" content="light dark" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body className={`${inter.className} h-full antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SessionProvider session={session}>
            {children}
          </SessionProvider>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
