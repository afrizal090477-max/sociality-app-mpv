import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import { BottomNav } from "@/components/layout/BottomNav"; 
import { Toaster } from "sonner";
import { AppProvider } from "@/providers/AppProvider"; 

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
      <body className="font-['SF_Pro'] bg-black min-h-screen text-white antialiased">
  
        <AppProvider>
          <Toaster richColors position="top-center" />
          <Navbar />
          
          <main>
            {children}
          </main>

          <BottomNav />
        </AppProvider>

      </body>
    </html>
  );
}