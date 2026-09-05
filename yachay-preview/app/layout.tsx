import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Yachay Ayacucho — Lugares patrimoniales destacados",
  description: "Preview del componente FeaturedPlaces",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${geistSans.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="flex min-h-full flex-col bg-[#FAF9F7] dark:bg-[#0A0A0A]">{children}</body>
    </html>
  );
}
