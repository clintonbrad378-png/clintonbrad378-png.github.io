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

export const metadata: Metadata = {
  title: "Rosas LS · Ramos y Arreglos",
  description:
    "Catálogo de Rosas LS: ramos y arreglos artesanales con rosas eternas y girasoles. Pedidos por WhatsApp: 5015-04-48.",
  icons: {
    icon: [
      { url: "/logo/logo.jpeg", type: "image/jpeg" },
    ],
    apple: [{ url: "/logo/logo.jpeg", type: "image/jpeg" }],
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
