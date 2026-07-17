import type { Metadata } from "next";
import { Newsreader, Fraunces, Archivo } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/providers/AuthProvider";

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  display: "swap",
  weight: ["400", "500"],
  style: ["normal", "italic"],
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
});

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "SERA — sera.primpla.com",
  description: "SERA is a digital news and magazine platform, part of the Primpla ecosystem.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`scroll-smooth ${newsreader.variable} ${fraunces.variable} ${archivo.variable}`}>
      <body className="antialiased font-serif bg-paper text-ink">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
