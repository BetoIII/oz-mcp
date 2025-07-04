import type { Metadata } from "next";
import "./globals.css";
import { auth } from "./auth";
import { SessionProvider } from "next-auth/react";

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
  const session = await auth();
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" type="image/svg+xml" href="/favicon.ico" />
        <meta name="theme-color" content="#2563eb" />
        <meta name="color-scheme" content="light dark" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body className="h-full antialiased">
        <SessionProvider session={session}>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
