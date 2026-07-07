import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import { BottomNav } from "@/components/layout/BottomNav"; // 👈 Tambahkan import ini
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sociality | MVP",
  description: "A modern social media MVP",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-black min-h-screen text-white antialiased`}>
        <Toaster richColors position="top-center" />
        <Navbar />
        
        {/* Main Content */}
        <main>
          {children}
        </main>

        {/* 👈 TAMBAHKAN BOTTOM NAV DI SINI */}
        <BottomNav />
        
      </body>
    </html>
  );
}