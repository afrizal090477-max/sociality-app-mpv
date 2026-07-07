import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/providers/AppProvider";
import { Toaster } from "@/components/ui/sonner";
import Navbar  from "@/components/layout/Navbar";

export const metadata: Metadata = {
  title: "Sociality | MVP",
  description: "Connect with the world",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      {/* 'antialiased' memastikan font SF Pro terlihat tajam 
        'font-sans' otomatis menggunakan SF Pro dari konfigurasi @theme di globals.css 
      */}
      <body className="antialiased font-sans bg-black text-neutral-25 min-h-screen">
        <AppProvider>
          <Navbar />
          <main>{children}</main>
          <Toaster position="top-center" richColors />
        </AppProvider>
      </body>
    </html>
  );
}