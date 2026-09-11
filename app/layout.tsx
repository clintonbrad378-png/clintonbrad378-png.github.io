import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { getSiteSettings } from "@/lib/settings";
import "./globals.css";

const display = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const body = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

const SITE_URL = "https://rosasls.jrprogramsofficial.workers.dev";
const SITE_TITLE = "Rosas LS · Ramos y Arreglos";
const SITE_DESC =
  "Ramos y arreglos artesanales con rosas eternas y girasoles. Elige tu favorita y pide por WhatsApp.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: "%s · Rosas LS",
  },
  description: SITE_DESC,
  icons: {
    icon: [
      { url: "/logo/logo.jpeg", type: "image/jpeg" },
    ],
    apple: [{ url: "/logo/logo.jpeg", type: "image/jpeg" }],
  },
  // Previsualización bonita al compartir en WhatsApp / redes
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: SITE_URL,
    siteName: "Rosas LS",
    title: SITE_TITLE,
    description: SITE_DESC,
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        type: "image/jpeg",
        alt: "Rosas LS — Ramos y Arreglos",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESC,
    images: ["/og-image.jpg"],
  },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const settings = await getSiteSettings();
  return (
    <html lang="es" className={`${display.variable} ${body.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-noir-950 text-cream-100">
        <Navbar />
        <div className="flex-1">{children}</div>
        <Footer
          whatsappNumber={settings.whatsappNumber}
          whatsappDisplay={settings.whatsappDisplay}
          instagram={settings.instagram}
        />
        <WhatsAppFloat whatsappNumber={settings.whatsappNumber} />
      </body>
    </html>
  );
}
