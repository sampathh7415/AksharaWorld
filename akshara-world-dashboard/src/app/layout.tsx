import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });
const geist_mono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Akshara World Dashboard",
  description: "Live Command Dashboard for Sam AI CEO",
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geist.variable} ${geist_mono.variable} antialiased bg-white text-slate-900`}>
        {children}
      </body>
    </html>
  );
}
