'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation'; // 👈 Tambahkan ini
import { Home, Plus, User } from 'lucide-react';

export function BottomNav() {
  // Cukup 1 state saja, by default false (jadi aman di server / SSR)
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // 👈 JALAN KSATRIA: Deteksi URL saat ini buat menyembunyikan menu di "Tampilan Full"
  const pathname = usePathname();

  useEffect(() => {
    // JALAN KSATRIA: Bungkus pakai async function.
    const verifyAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        setIsLoggedIn(true);
      }
    };

    verifyAuth();
  }, []);

  // 👈 LOGIKA SMART HIDE:
  // 1. Sembunyikan kalau belum login
  // 2. Sembunyikan kalau lagi di tampilan Full Screen (misal: /post/kristaakawai)
  const isFullScreenMode = pathname.startsWith('/post/');

  if (!isLoggedIn || isFullScreenMode) return null;

  return (
    // JALAN KSATRIA: Wrapper Responsif sesuai CSS Figma lu (Mobile 345x64 -> Desktop 360x80)
    <div className="fixed bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 z-50 flex flex-row justify-center items-center p-0 gap-[45px] w-[345px] md:w-[360px] h-[64px] md:h-[80px] bg-[rgba(10,13,18,0.8)] border border-[#181D27] rounded-[1000px] shadow-2xl backdrop-blur-[50px]">
      
      {/* 1. Home Menu (Active State) */}
      {/* Mobile: gap-2, h-46px | Desktop: gap-4, h-58px */}
      <Link href="/" className="flex flex-col justify-center items-center gap-[2px] md:gap-[4px] w-[94px] h-[46px] md:h-[58px] group">
        <Home className="w-[20px] h-[20px] md:w-[24px] md:h-[24px] text-[#7F51F9] group-hover:opacity-80 transition-opacity" />
        <span className="text-[12px] md:text-[16px] font-bold text-[#7F51F9] leading-[24px] md:leading-[30px] tracking-[-0.02em] font-['SF_Pro']">
          Home
        </span>
      </Link>

      {/* 2. Add Button (FAB) */}
      {/* Mobile: 44x44, icon 22x22 | Desktop: 48x48, icon 24x24 */}
      <button className="flex flex-row justify-center items-center p-[7.33px] md:p-[8px] w-[44px] h-[44px] md:w-[48px] md:h-[48px] bg-[#6936F2] hover:bg-[#522BC8] rounded-[9999px] transition-colors cursor-pointer shrink-0">
        <Plus className="w-[22px] h-[22px] md:w-[24px] md:h-[24px] text-[#FDFDFD]" strokeWidth={2.5} />
      </button>

      {/* 3. Profile Menu (Inactive State) */}
      {/* Mobile: h-38px | Desktop: h-58px */}
      <Link href="/profile" className="flex flex-col justify-center items-center gap-[2px] md:gap-[4px] w-[94px] h-[38px] md:h-[58px] group">
        <User className="w-[20px] h-[20px] md:w-[24px] md:h-[24px] text-[#FDFDFD] group-hover:text-[#7F51F9] transition-colors" />
        <span className="text-[12px] md:text-[16px] font-normal text-[#FDFDFD] group-hover:text-[#7F51F9] leading-[16px] md:leading-[30px] tracking-[-0.02em] font-['SF_Pro'] transition-colors">
          Profile
        </span>
      </Link>

    </div>
  );
}