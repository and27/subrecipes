import type { Metadata, Viewport } from "next";
import { Source_Sans_3, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import { PwaRegistrar } from "@/ui/pwa/PwaRegistrar";

const bodyFont = Source_Sans_3({
  variable: "--font-body",
  subsets: ["latin"],
});

const displayFont = Source_Serif_4({
  variable: "--font-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Subrecetas · Costing Recipes V0",
    template: "%s · Subrecetas",
  },
  description:
    "PWA offline-first para costeo de recetas y subrecetas con correccion manual.",
  applicationName: "Subrecetas",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#1f1a17",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${bodyFont.variable} ${displayFont.variable} antialiased`}
      >
        <PwaRegistrar />
        {children}
      </body>
    </html>
  );
}
