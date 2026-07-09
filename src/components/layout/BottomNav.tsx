'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Plus, User } from 'lucide-react';

export function BottomNav() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const verifyAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        setIsLoggedIn(true);
      }
    };
    verifyAuth();
  }, [pathname]);

  const hiddenPages = ['/add-post', '/edit-profile', '/login', '/register'];
  const isFullScreenMode = pathname.startsWith('/post/') || hiddenPages.includes(pathname);

  if (!isLoggedIn || isFullScreenMode) return null;

  // Cek menu mana yang lagi aktif 
  const isHomeActive = pathname === '/';
  const isProfileActive = pathname === '/profile';

  return (
    <div className="fixed bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 z-50 flex flex-row justify-center items-center p-0 gap-[45px] w-[345px] md:w-[360px] h-[64px] md:h-[80px] bg-[rgba(10,13,18,0.8)] border border-[#181D27] rounded-[1000px] shadow-2xl backdrop-blur-[50px]">
      {/* 1. Home Menu */}
      <Link href="/" className="flex flex-col justify-center items-center gap-[2px] md:gap-[4px] w-[94px] h-[46px] md:h-[58px] group">
        <Home className={`w-[20px] h-[20px] md:w-[24px] md:h-[24px] group-hover:opacity-80 transition-all ${isHomeActive ? 'text-[#7F51F9]' : 'text-[#FDFDFD]'}`} />
        <span className={`text-[12px] md:text-[16px] leading-[24px] md:leading-[30px] tracking-[-0.02em] font-['SF_Pro'] transition-colors ${isHomeActive ? 'font-bold text-[#7F51F9]' : 'font-normal text-[#FDFDFD]'}`}>
          Home
        </span>
      </Link>

      {/* 2. Add Button (FAB) - /add-post */}
      <Link 
        href="/add-post" 
        className="flex flex-row justify-center items-center p-[7.33px] md:p-[8px] w-[44px] h-[44px] md:w-[48px] md:h-[48px] bg-[#6936F2] hover:bg-[#522BC8] rounded-[9999px] transition-transform cursor-pointer shrink-0 shadow-lg hover:scale-105"
      >
        <Plus className="w-[22px] h-[22px] md:w-[24px] md:h-[24px] text-[#FDFDFD]" strokeWidth={2.5} />
      </Link>

      {/* 3. Profile Menu */}
      <Link href="/profile" className="flex flex-col justify-center items-center gap-[2px] md:gap-[4px] w-[94px] h-[38px] md:h-[58px] group">
        <User className={`w-[20px] h-[20px] md:w-[24px] md:h-[24px] group-hover:text-[#7F51F9] transition-colors ${isProfileActive ? 'text-[#7F51F9]' : 'text-[#FDFDFD]'}`} />
        <span className={`text-[12px] md:text-[16px] leading-[16px] md:leading-[30px] tracking-[-0.02em] font-['SF_Pro'] transition-colors ${isProfileActive ? 'font-bold text-[#7F51F9]' : 'font-normal text-[#FDFDFD] group-hover:text-[#7F51F9]'}`}>
          Profile
        </span>
      </Link>
    </div>
  );
}