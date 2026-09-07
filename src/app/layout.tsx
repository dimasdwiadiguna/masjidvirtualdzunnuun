import type { Metadata, Viewport } from "next";
import { Geologica, Raleway } from "next/font/google";
import "./globals.css";

const geologica = Geologica({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
  adjustFontFallback: true,
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
  variable: "--font-geologica",
});

const raleway = Raleway({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  adjustFontFallback: true,
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
  variable: "--font-raleway",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "Dzun Nuun, komunitas pemuda Masjid Fathul Ummah",
    template: "%s | Dzun Nuun",
  },
  description:
    "Patungan, acara, dan kabar kegiatan komunitas pemuda pemudi Dzun Nuun di Masjid Fathul Ummah.",
  applicationName: "Dzun Nuun",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Dzun Nuun", statusBarStyle: "default" },
  icons: { icon: "/icon-192.png", apple: "/apple-icon.png" },
};

export const viewport: Viewport = {
  themeColor: "#043A43",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${geologica.variable} ${raleway.variable}`}>
      <body>{children}</body>
    </html>
  );
}
