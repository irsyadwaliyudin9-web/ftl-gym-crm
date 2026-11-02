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
  themeColor: "#0A0A0A",
};

export const metadata: Metadata = {
  title: "FTL Gym (Faster Than Light) — CRM & Portal Member Resmi",
  description:
    "Sistem Manajemen Gym Terpadu FTL Gym: Portal Pendaftaran Member Online, Presensi Front Desk QR Code, Sesi Coach & Personal Trainer, dan Jadwal Kelas Studio.",
  keywords: "ftl gym, fitness software indonesia, gym crm jakarta, check in qr gym, personal trainer ftl",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "FTL Gym",
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
        <meta name="apple-mobile-web-app-title" content="FTL Gym" />
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
