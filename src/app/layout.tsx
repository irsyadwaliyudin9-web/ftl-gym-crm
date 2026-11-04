import type { Metadata, Viewport } from "next";
import { Inter, Montserrat } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { GymDataProvider } from "@/context/GymDataContext";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-montserrat" });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#FF6B00",
};

export const metadata: Metadata = {
  title: "One O One Gym (101 Gym) — Garut Kota, Jawa Barat",
  description:
    "Sistem Manajemen Gym Terpadu One O One Gym (101 Gym) Garut Kota, Jawa Barat: Portal Pendaftaran Member Online, Presensi Front Desk QR Code, dan Sesi Personal Trainer.",
  keywords: "one o one gym, 101 gym, gym garut kota, gym jawa barat, fitness garut, gym crm garut, check in qr gym, personal trainer 101",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
    shortcut: "/icon.svg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "One O One Gym",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${inter.variable} ${montserrat.variable} dark`}>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="One O One Gym" />
        <link rel="icon" type="image/svg+xml" href="/icon.svg" />
        <link rel="apple-touch-icon" href="/icon.svg" />
      </head>
      <body className="bg-gym-base text-zinc-100 min-h-screen antialiased selection:bg-neon selection:text-black">
        <AuthProvider>
          <GymDataProvider>
            {children}
          </GymDataProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
