import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { auth } from "./auth";
import { SessionProvider } from "next-auth/react";
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Opportunity Zone MCP Server",
  description: "Secure, OAuth-protected MCP server providing geospatial opportunity zone data and geocoding services for AI applications.",
  keywords: ["MCP", "Model Context Protocol", "Opportunity Zones", "Geocoding", "OAuth", "API", "AI", "Geospatial"],
  authors: [{ name: "Opportunity Zone MCP Team" }],
  creator: "Opportunity Zone MCP",
  publisher: "Opportunity Zone MCP",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://oz-mcp.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Opportunity Zone MCP Server",
    description: "Secure, OAuth-protected MCP server providing geospatial opportunity zone data and geocoding services for AI applications.",
    url: 'https://oz-mcp.vercel.app',
    siteName: 'Opportunity Zone MCP Server',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Opportunity Zone MCP Server",
    description: "Secure, OAuth-protected MCP server providing geospatial opportunity zone data and geocoding services for AI applications.",
    creator: '@oz_mcp',
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
        <link rel="icon" type="image/svg+xml" href="/favicon.ico" />
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
