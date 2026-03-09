import "./globals.css";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import { AuthProvider } from "@/lib/auth/AuthProvider";
import MaterialSymbolsLoader from "@/components/ui/MaterialSymbolsLoader";
import InstallPrompt from "@/components/ui/InstallPrompt";

import type { Metadata, Viewport } from "next";

export const viewport: Viewport = {
  themeColor: "#ec7f13",
};

export const metadata: Metadata = {
  title: {
    default: "DescubrePR - Descubre lo Mejor de Puerto Rico",
    template: "%s | DescubrePR",
  },
  description: "Descubre y promociona lugares, restaurantes, actividades y servicios en todo Puerto Rico. Playas, chinchorros, rutas y mas.",
  manifest: "/manifest.json",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://descubrepr.com"),
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "DescubrePR",
  },
  openGraph: {
    type: "website",
    siteName: "DescubrePR",
    locale: "es_PR",
    title: "DescubrePR - Descubre lo Mejor de Puerto Rico",
    description: "Descubre y promociona lugares, restaurantes, actividades y servicios en todo Puerto Rico.",
    images: [{ url: "/icon-512x512.png", width: 512, height: 512, alt: "DescubrePR" }],
  },
  twitter: {
    card: "summary",
    title: "DescubrePR",
    description: "Descubre lo mejor de Puerto Rico.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="font-display bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 antialiased">
        <MaterialSymbolsLoader />
        <AuthProvider>
          {children}
          <InstallPrompt />
        </AuthProvider>
      </body>
    </html>
  );
}
