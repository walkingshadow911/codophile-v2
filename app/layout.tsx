import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SWRegister from "@/components/SWRegister";
import Script from "next/script";

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
    default: "Codophile – Visual CSS Playground, Tailwind Generator & CSS Effects Library",
    template: "%s | Codophile",
  },

  description:
    "Codophile is a visual CSS playground and Tailwind CSS generator with a library of cool CSS effects and animations. Design UI visually, generate code instantly, and copy CSS effects for modern web development.",

  keywords: [
    // Core tool keywords
    "visual css playground online",
    "tailwind css generator online",
    "css playground with live preview",
    "visual css editor online free",
    "generate tailwind classes online",

    // Effects keywords 
    "cool css effects with code",
    "css animations examples",
    "interactive css effects",
    "css effects copy paste",
    "modern css ui effects",

    // Long-tail keywords
    "create css effects visually",
    "tailwind css generator for developers",
    "css playground for web designers",
    "css effects library with code examples",
    "generate css animations online free",

    // Niche keywords
    "css playground for beginners",
    "tailwind css generator for designers",
    "css effects generator online",
    "visual css editor for web development",
    "css playground with code export",
    "visual css playground online free",
    "tailwind css generator for beginners",
    "css effects with code examples",
    "css animation effects for websites",
    "design ui and generate css automatically"
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
    title: "Codophile – Visual CSS Playground & Tailwind Generator + CSS Effects",
    description:
      "Design UI visually, generate Tailwind CSS instantly, and explore a library of cool CSS effects with code. Perfect tool for developers and designers.",
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
    title: "Codophile – CSS Playground, Tailwind Generator & Effects Library",
    description:
      "Create UI visually, generate Tailwind CSS, and explore modern CSS effects with code.",
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
