import type { Metadata } from "next";
import "./globals.css";

const BASE_URL = "https://nomsubz.vercel.app";
const TITLE = "NomSubz: Recurring Billing for Nigeria";
const DESCRIPTION =
  "Subscription plans, automated invoicing, and Nomba powered card payments. Manage your entire recurring revenue from one clean dashboard.";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: TITLE,
    template: "%s | NomSubz",
  },
  description: DESCRIPTION,
  keywords: [
    "recurring billing Nigeria",
    "subscription management",
    "Nomba payments",
    "SaaS billing Nigeria",
    "automated invoicing",
    "payment automation Nigeria",
  ],
  authors: [{ name: "NomSubz" }],
  creator: "NomSubz",
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: BASE_URL,
    siteName: "NomSubz",
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: "/og", width: 1200, height: 630, alt: TITLE }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/og"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
