'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Search, Menu, X, LogOut, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import axiosInstance from '@/lib/axios';

// DEFINISI TIPE DATA (Jalan Ksatria: No 'any')
export interface UserProfile {
  id: number;
  name: string;
  username: string;
  email: string;
  phone: string;
  avatarUrl: string | null;
}

export default function Navbar() {
  const router = useRouter();
  
  // State Management
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Auth State
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);

  // Fetch Data User saat komponen dimuat
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setIsLoading(false);
          return;
        }

        // Hit API My Profile
        const response = await axiosInstance.get('/me');
        // Sesuaikan dengan struktur response lu (asumsi data user ada di response.data.data)
        setUser(response.data.data); 
        setIsLoggedIn(true);
      } catch (error) {
        console.error("Gagal verifikasi token:", error);
        localStorage.removeItem('token');
        setIsLoggedIn(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setUser(null);
    setIsDropdownOpen(false);
    router.push('/login'); // Tendang ke halaman login
  };

  return (
    <>
      <nav className="sticky top-0 z-50 w-full h-16 md:h-20 bg-black border-b border-neutral-900 flex items-center justify-between px-4 md:px-[120px]">
        
        {/* LOGO & BRAND */}
        <Link href="/" className="flex items-center gap-[11px]">
          <Image src="/assets/Logo.svg" alt="Sociality Logo" width={30} height={30} />
          <span className="text-display-xs font-bold text-neutral-25 hidden md:block">
            Sociality
          </span>
        </Link>

        {/* SEARCH BAR (Desktop) */}
        <div className="hidden md:flex items-center w-[491px] h-12 bg-neutral-1000 border border-neutral-900 rounded-full px-4 gap-2">
          <Search className="w-5 h-5 text-neutral-500" />
          <input 
            placeholder="Search" 
            className="bg-transparent border-none outline-none text-neutral-600 text-sm w-full font-sans"
          />
        </div>

        {/* RIGHT ACTIONS (Conditional Rendering) */}
        <div className="flex items-center">
          {isLoading ? (
            // 1. SKELETON LOADING
            <div className="flex items-center gap-[13px] animate-pulse">
              <div className="hidden md:block h-6 w-20 bg-neutral-900 rounded-md"></div>
              <div className="w-10 h-10 md:w-12 md:h-12 bg-neutral-900 rounded-full"></div>
            </div>
          ) : isLoggedIn && user ? (
            // 2. AFTER LOGIN (Desktop & Mobile Profile)
            <div className="flex items-center gap-4 md:gap-[13px] relative">
              {/* Search icon buat mobile */}
              <Search className="w-5 h-5 text-neutral-25 md:hidden" />
              
              {/* Avatar Toggle */}
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-[13px] focus:outline-none"
              >
                <div className="hidden md:block text-md font-bold text-neutral-25 text-right">
                  {user.name}
                </div>
                <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-full bg-neutral-900 border border-neutral-800 overflow-hidden flex items-center justify-center hover:opacity-80 transition-opacity">
                  {user.avatarUrl ? (
                    <Image src={user.avatarUrl} alt={user.username} fill className="object-cover" />
                  ) : (
                    <UserIcon className="w-5 h-5 md:w-6 md:h-6 text-neutral-500" />
                  )}
                </div>
              </button>

              {/* Dropdown Menu Logout */}
              {isDropdownOpen && (
                <div className="absolute right-0 top-[110%] w-48 bg-neutral-1000 border border-neutral-900 rounded-2xl py-2 shadow-2xl flex flex-col z-50 animate-in fade-in slide-in-from-top-2">
                  <button 
                    onClick={handleLogout}
                    className="px-4 py-2 w-full text-left text-sm font-bold text-[#ef4444] hover:bg-neutral-900 transition-colors flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            // 3. BEFORE LOGIN
            <>
              {/* Auth Buttons (Desktop) */}
              <div className="hidden md:flex gap-3">
                <Link href="/login" passHref>
                  <Button variant="outline" className="rounded-full text-neutral-25 border border-neutral-900 hover:bg-neutral-900 px-6">
                    Login
                  </Button>
                </Link>
                <Link href="/register" passHref>
                  <Button className="rounded-full bg-brand-500 hover:bg-brand-700 px-6">
                    Register
                  </Button>
                </Link>
              </div>

              {/* Mobile Icons (Search & Hamburger) */}
              <div className="flex md:hidden items-center gap-4">
                <Search className="w-5 h-5 text-neutral-25" />
                <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
                  {isMenuOpen ? <X className="text-neutral-25" /> : <Menu className="text-neutral-25" />}
                </button>
              </div>
            </>
          )}
        </div>
      </nav>

      {/* MOBILE OPEN MENU (Hanya muncul saat Sebelum Login & Menu diklik) */}
      {isMenuOpen && !isLoggedIn && (
        <div className="md:hidden w-full bg-black border-b border-neutral-900 p-4 flex flex-col gap-4 animate-in slide-in-from-top-5">
          <div className="flex gap-2 w-full">
            <Link href="/login" passHref className="flex-1">
              <Button variant="outline" className="w-full rounded-full border-neutral-900">Login</Button>
            </Link>
            <Link href="/register" passHref className="flex-1">
              <Button className="w-full rounded-full bg-brand-500">Register</Button>
            </Link>
          </div>
        </div>
      )}
    </>
  );
}