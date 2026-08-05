import type { Metadata, Viewport } from "next";
import { Forum, Fraunces, Montserrat } from "next/font/google";
import SiteChromeServer from "@/components/layout/SiteChromeServer";
import { CookieBanner } from "@/components/analytics/CookieBanner";
import { AnalyticsTracker } from "@/components/analytics/AnalyticsTracker";
import { SITE_NAME, SITE_URL, DEFAULT_OG_IMAGE } from "@/lib/seo";
import "./globals.css";

const forum = Forum({
  weight: "400",
  variable: "--font-forum",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

// The brand book lists Helvetica for general text, but the live
// themomcoaching.com site actually ships Montserrat — matching that so
// the site is consistent with what the business currently has published.
const montserrat = Montserrat({
  variable: "--font-inter",
  subsets: ["latin"],
});

const defaultTitle = "The Mom Coach | Coach de Sueño Infantil y Alimentación Complementaria";
const defaultDescription =
  "Asesorías personalizadas de sueño infantil y alimentación complementaria para bebés y niños. Programas gentiles, sin métodos que impliquen dejar llorar, guiados por Denisse, consultora certificada.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: defaultTitle,
  description: defaultDescription,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: defaultTitle,
    description: defaultDescription,
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: "es_CO",
    type: "website",
    images: [{ url: DEFAULT_OG_IMAGE, width: 381, height: 381, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: defaultDescription,
    images: [DEFAULT_OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#71b0b4",
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: SITE_NAME,
  url: SITE_URL,
  logo: DEFAULT_OG_IMAGE,
  image: DEFAULT_OG_IMAGE,
  description: defaultDescription,
  founder: {
    "@type": "Person",
    name: "Denisse",
  },
  areaServed: "Worldwide",
  serviceType: ["Consultoría de sueño infantil", "Coaching de alimentación complementaria"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${forum.variable} ${fraunces.variable} ${montserrat.variable}`}>
      <head>
        <link rel="preconnect" href="https://app.cal.com" />
        <link rel="preconnect" href="https://cal.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </head>
      <body>
        <AnalyticsTracker />
        <SiteChromeServer>{children}</SiteChromeServer>
        <CookieBanner />
      </body>
    </html>
  );
}
