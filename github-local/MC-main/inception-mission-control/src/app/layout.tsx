import type { Metadata, Viewport } from "next";
import { JetBrains_Mono } from "next/font/google";
import { DashboardProvider } from "@/components/providers/DashboardProvider";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Inception Mission Control",
  description: "CEO Mission Dashboard — Inception, a G42 Company",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={jetbrainsMono.variable}>
      <body className="font-mono bg-bloomberg-bg text-bloomberg-text h-screen overflow-hidden">
        <DashboardProvider>{children}</DashboardProvider>
      </body>
    </html>
  );
}
