import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SWRegister from "@/components/SWRegister";
import Script from "next/script";
import NextTopLoader from 'nextjs-toploader';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#030014",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};


export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://codophile.in"),

  title: {
  default: "CSS Animations, Effects & UI Components (Copy-Paste Code) | Codophile",
  template: "%s | Codophile",
  },

  
  description:
  "Explore modern CSS animations, hover effects, and UI components with ready-to-use code. Build interfaces visually, generate Tailwind CSS instantly, and copy clean, production-ready designs with Codophile.",
  keywords: [
   

  "css button hover effects",
  "css animation examples",
  "cool css effects",
  "loading animation css",
  "glassmorphism css",
  "neon button css",
  "css card hover effects",


  "tailwind css components",
  "tailwind button design",
  "tailwind card examples",
  "tailwind ui templates free",


  "css playground",
  "css generator tool",
  "visual css editor",
  "tailwind generator",

 
  "css glowing button hover effect code",
  "glassmorphism login form css",
  "css loader without javascript",
  "neon button animation css",
  "css animation copy paste code"

  ],

  authors: [{ name: "Codophile Team" }],
  creator: "Codophile",
  publisher: "Codophile",

  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },

  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://codophile.in",
    
  title: {
  default: "CSS Animations, Effects & UI Components (Copy-Paste Code) | Codophile",
  template: "%s | Codophile",
  },

  description:
  "Explore CSS animations, hover effects, and UI components with ready-to-use code. Copy-paste modern CSS effects, build interfaces visually, and generate Tailwind CSS instantly with Codophile.",
    siteName: "Codophile",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Codophile CSS Playground and Effects Preview",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    
  title: {
  default: "CSS Animations, Effects & UI Components (Copy-Paste Code) | Codophile",
  template: "%s | Codophile",
  },

  description:
  "Explore CSS animations, hover effects, and UI components with ready-to-use code. Copy-paste modern CSS effects, build interfaces visually, and generate Tailwind CSS instantly with Codophile.",
    creator: "@codophile",
    images: ["/og-image.png"],
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextTopLoader color="#a855f7" height={3} showSpinner={false} />
        <SWRegister />
        {children}
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-E256QGMFZT" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-E256QGMFZT');
          `}
        </Script>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "Codophile",
              "url": "https://codophile.in",
              "description": "Master CSS through real-time experimentation. Control properties visually, see instant changes, and generate production-ready CSS & Tailwind code.",
              "applicationCategory": "DeveloperApplication",
              "operatingSystem": "Any",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "author": {
                "@type": "Organization",
                "name": "Codophile Team",
                "url": "https://codophile.in"
              }
            }),
          }}
        />
      </body>
    </html>
  );
}



