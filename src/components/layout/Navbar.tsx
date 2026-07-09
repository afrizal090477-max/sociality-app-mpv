'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Search, Plus, User } from 'lucide-react';
import axiosInstance from '@/lib/axios';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Sembunyikan Navbar di halaman Auth
  if (pathname === '/login' || pathname === '/register') return null;
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    const fetchMyProfile = async () => {
      try {
        const res = await axiosInstance.get('/me');
        const profileData = res.data?.data?.profile || res.data?.data?.user || res.data?.data;
        if (profileData?.avatarUrl) {
          setAvatarUrl(profileData.avatarUrl);
        }
      } catch (error) {
        console.error('Gagal mengambil avatar untuk Navbar:', error);
      }
    };

    // Cuma fetch kalau ada token (user udah login) biar gak error 401
    if (typeof window !== 'undefined' && localStorage.getItem('token')) {
      fetchMyProfile();
    }
  }, [pathname]); // Refresh effect kalau user pindah halaman

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?search=${encodeURIComponent(searchQuery)}`);
    } else {
      router.push(`/`);
    }
  };

  return (
    <nav className="hidden md:flex flex-row justify-between items-center px-[120px] h-[80px] bg-[#000000] border-b border-[#181D27] sticky top-0 z-50 w-full">
      
      {/* LOGO */}
      <Link href="/" className="flex flex-row items-center gap-[11px] h-[36px] hover:opacity-80 transition-opacity">
        <div className="relative w-[30px] h-[30px]">
          {/* Logo Bintang/Matahari (sesuai Figma) */}
          <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M15 0C15 8.28427 8.28427 15 0 15C8.28427 15 15 21.7157 15 30C15 21.7157 21.7157 15 30 15C21.7157 15 15 8.28427 15 0Z" fill="#FDFDFD"/>
          </svg>
        </div>
        <span className="text-[24px] font-bold text-[#FDFDFD] leading-[36px] font-['SF_Pro']">
          Sociality
        </span>
      </Link>

      {/* SEARCH BAR */}
      <form onSubmit={handleSearch} className="flex flex-row items-center px-[16px] py-[8px] gap-[6px] w-[491px] h-[48px] bg-[#0A0D12] border border-[#181D27] rounded-full">
        <Search className="w-[20px] h-[20px] text-[#717680]" />
        <input 
          type="text" 
          placeholder="Search user..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-transparent border-none outline-none text-[14px] text-[#FDFDFD] placeholder:text-[#535862] w-full h-[28px] font-['SF_Pro']"
        />
      </form>

      {/* ACTIONS (Add Post & Profile Avatar) */}
      <div className="flex flex-row items-center gap-[13px] h-[48px]">
        {/* Tombol Add Post (+) */}
        <Link 
          href="/add-post"
          className="flex justify-center items-center p-[8px] w-[48px] h-[48px] bg-[#6936F2] hover:bg-[#522BC8] rounded-full transition-colors cursor-pointer"
        >
          <Plus className="w-[24px] h-[24px] text-[#FDFDFD] border-[2px] border-transparent" strokeWidth={3} />
        </Link>

        {/* Avatar Profile yang sekarang dinamis nembak URL asli! */}
        <Link 
          href="/profile"
          className="relative w-[48px] h-[48px] rounded-full overflow-hidden bg-neutral-900 border border-[#181D27] hover:opacity-80 transition-opacity flex items-center justify-center cursor-pointer"
        >
          {avatarUrl ? (
            <Image 
              src={avatarUrl} 
              alt="My Profile" 
              fill 
              sizes="48px"
              className="object-cover" 
            />
          ) : (
            <User className="w-[24px] h-[24px] text-neutral-500" />
          )}
        </Link>
      </div>

    </nav>
  );
}