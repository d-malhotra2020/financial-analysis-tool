import type { Metadata } from "next";
import { Source_Serif_4, JetBrains_Mono } from "next/font/google";
import TopNav from "@/components/TopNav";
import Footer from "@/components/Footer";
import "./globals.css";

const sourceSerif = Source_Serif_4({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Financial Analysis — Drew Malhotra",
  description:
    "A real-time market analysis tool with technical indicators and an ML prediction layer.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${sourceSerif.variable} ${jetbrainsMono.variable} antialiased`}>
        <TopNav />
        {children}
        <Footer />
      </body>
    </html>
  );
}
