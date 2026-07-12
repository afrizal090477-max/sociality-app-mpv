"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import {
  Search,
  Menu,
  X,
  LogOut,
  User as UserIcon,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import axiosInstance from "@/lib/axios";
import axios from "axios";

export interface UserProfile {
  id: number;
  name: string;
  username: string;
  email: string;
  phone: string;
  avatarUrl: string | null;
}

interface SearchUser {
  id: number;
  name: string;
  username: string;
  avatarUrl: string | null;
}

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isMobileSearchActive, setIsMobileSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setIsLoading(false);
          return;
        }
        const response = await axiosInstance.get(`/me?t=${Date.now()}`);
        const userData =
          response.data?.data?.profile ||
          response.data?.data?.user ||
          response.data?.data;
        setUser(userData);
        setIsLoggedIn(true);
      } catch (error) {
        console.error("Gagal verifikasi token:", error);
        localStorage.removeItem("token");
        setIsLoggedIn(false);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserProfile();

    const handleProfileUpdate = () => fetchUserProfile();
    window.addEventListener("profileUpdated", handleProfileUpdate);
    return () =>
      window.removeEventListener("profileUpdated", handleProfileUpdate);
  }, [pathname]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        !isMobileSearchActive &&
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsSearchDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobileSearchActive]);

  useEffect(() => {
    const handleClickOutsideDropdown = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutsideDropdown);
      document.addEventListener("keydown", handleEscapeKey);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutsideDropdown);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isDropdownOpen]);

  useEffect(() => {
    if (isMobileSearchActive) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileSearchActive]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    let isMounted = true;
    if (!debouncedQuery.trim()) return;
    const fetchResults = async () => {
      if (isMounted) setIsSearching(true);
      try {
        const response = await axiosInstance.get("/users/search", {
          params: { q: debouncedQuery },
        });
        if (isMounted) {
          const usersArray = response.data?.data?.users || [];
          setSearchResults(Array.isArray(usersArray) ? usersArray : []);
        }
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status !== 404) {
          console.error("Search error:", err);
        }
        if (isMounted) setSearchResults([]);
      } finally {
        if (isMounted) setIsSearching(false);
      }
    };
    fetchResults();
    return () => {
      isMounted = false;
    };
  }, [debouncedQuery]);
  
  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setUser(null);
    setIsDropdownOpen(false);
    window.location.href = "/login";
  };
  
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    if (!val.trim()) {
      setSearchResults([]);
      setIsSearchDropdownOpen(false);
    } else {
      setIsSearchDropdownOpen(true);
    }
  };

  const renderSearchResults = (isMobile: boolean = false) => {
    if (isSearching) {
      return (
        <div
          className={`flex flex-col justify-center items-center gap-[4px] ${isMobile ? "h-[155px] mt-[100px]" : "h-[155px]"}`}
        >
          <Loader2 className="w-8 h-8 text-[#7F51F9] animate-spin" />
          <span className="text-[16px] font-bold text-[#FDFDFD] font-['SF_Pro']">
            Mencari...
          </span>
        </div>
      );
    }

    if (searchResults.length > 0) {
      return (
        <div
          className={`flex flex-col ${isMobile ? "gap-[16px] w-full max-w-[361px] mx-auto pt-[16px]" : "gap-[16px]"}`}
        >
          {searchResults.map((resultUser) => (
            <Link
              href={`/profile/${resultUser.username}`}
              key={resultUser.id}
              onClick={() => {
                setIsSearchDropdownOpen(false);
                setIsMobileSearchActive(false);
                setSearchQuery("");
              }}
              className="flex items-center gap-[8px] w-full h-[56px] hover:bg-[#181D27] p-2 -mx-2 rounded-xl transition-colors"
            >
              <div className="w-[48px] h-[48px] rounded-full bg-neutral-800 overflow-hidden relative shrink-0">
                {resultUser.avatarUrl ? (
                  <Image
                    src={resultUser.avatarUrl}
                    alt={resultUser.name}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#A4A7AE] font-bold text-[14px]">
                    {(resultUser.name || resultUser.username)
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex flex-col justify-center items-start flex-1 w-[305px]">
                <span className="w-full text-[14px] font-bold text-[#FDFDFD] leading-[28px] tracking-[-0.01em] font-['SF_Pro'] line-clamp-1">
                  {resultUser.name}
                </span>
                <span className="w-full text-[14px] font-normal text-[#A4A7AE] leading-[28px] tracking-[-0.02em] font-['SF_Pro'] line-clamp-1">
                  @{resultUser.username}
                </span>
              </div>
            </Link>
          ))}
        </div>
      );
    }

    return (
      <div
        className={`flex flex-col justify-center items-center gap-[4px] ${isMobile ? "h-[155px] mt-[100px]" : "h-[155px]"}`}
      >
        <h3 className="w-full text-[16px] font-bold text-[#FDFDFD] leading-[30px] tracking-[-0.02em] font-['SF_Pro'] text-center">
          No results found
        </h3>
        <p className="w-full text-[14px] font-normal text-[#A4A7AE] leading-[28px] tracking-[-0.02em] font-['SF_Pro'] text-center">
          Change your keyword
        </p>
      </div>
    );
  };
  
  // 🔥 FIX 1: Array ini kita KOSONGKAN biar Navbar GAK PERNAH ke-destroy sepenuhnya
  const hiddenPages: string[] = [];
  if (hiddenPages.includes(pathname)) {
    return null;
  }

  // 🔥 FIX 2: Halaman Add Post masuk ke isHideOnMobile biar Navbarnya MINGGIR saat dibuka via HP
  const isHideOnMobile = pathname === "/profile" || pathname.startsWith("/profile/") || pathname === "/edit-profile" || pathname === "/add-post";

  return (
    <>
      {isMobileSearchActive && (
        <div className="fixed inset-0 z-[110] bg-[#000000] flex flex-col md:hidden animate-in fade-in zoom-in-95">
          <div className="flex flex-row items-center px-[16px] gap-[16px] w-full h-[64px] border-b border-[#181D27] shrink-0">
            <div className="flex flex-row items-center px-[12px] py-[8px] gap-[6px] flex-1 h-[40px] bg-[#0A0D12] border border-[#181D27] rounded-[9999px]">
              <Search className="w-[20px] h-[20px] text-[#717680] shrink-0" />
              <input
                suppressHydrationWarning
                autoFocus
                placeholder="Search user..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="flex-1 w-full bg-transparent border-none outline-none text-[14px] font-normal text-[#FDFDFD] leading-[28px] tracking-[-0.02em] font-['SF_Pro'] placeholder-[#717680]"
              />
              {searchQuery && (
                <button
                  onClick={() => handleSearchChange("")}
                  className="shrink-0 cursor-pointer"
                >
                  <X className="w-[16px] h-[16px] text-[#A4A7AE] hover:text-[#FDFDFD]" />
                </button>
              )}
            </div>
            <button
              onClick={() => setIsMobileSearchActive(false)}
              className="shrink-0 cursor-pointer p-1"
            >
              <X className="w-[24px] h-[24px] text-[#FDFDFD]" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-[16px] pb-[80px]">
            {searchQuery.trim() !== "" && renderSearchResults(true)}
          </div>
        </div>
      )}

      {/* Terapkan isHideOnMobile di className nav ini */}
      <nav className={`sticky top-0 z-[100] w-full h-[64px] md:h-[80px] bg-[#000000] border-b border-[#181D27] justify-between px-[16px] md:px-[120px] ${isHideOnMobile ? 'hidden md:flex items-center' : 'flex items-center'}`}>
        <Link href="/" className="flex items-center gap-[11px]">
          <Image
            src="/assets/Logo.svg"
            alt="Sociality Logo"
            width={30}
            height={30}
            priority 
          />
          <span className="text-[24px] font-bold text-[#FDFDFD] leading-[36px] font-['SF_Pro'] hidden md:block">
            Sociality
          </span>
        </Link>

        <div className="hidden md:flex relative" ref={searchContainerRef}>
          <div className="flex flex-row items-center px-[16px] py-[8px] gap-[6px] w-[491px] h-[48px] bg-[#0A0D12] border border-[#181D27] rounded-[9999px]">
            <Search className="w-[20px] h-[20px] text-[#717680] shrink-0" />
            <input
              suppressHydrationWarning
              placeholder="Search user..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => {
                if (searchQuery.trim()) setIsSearchDropdownOpen(true);
              }}
              className="flex-1 bg-transparent border-none outline-none text-[14px] font-normal text-[#FDFDFD] leading-[28px] tracking-[-0.02em] font-['SF_Pro'] placeholder-[#717680]"
            />
            {searchQuery && (
              <button
                onClick={() => handleSearchChange("")}
                className="shrink-0 cursor-pointer p-1"
              >
                <X className="w-[16px] h-[16px] text-[#A4A7AE] hover:text-[#FDFDFD]" />
              </button>
            )}
          </div>

          {isSearchDropdownOpen && searchQuery.trim() !== "" && (
            <div className="absolute top-[calc(100%+12px)] left-0 w-full bg-[#0A0D12] border border-[#181D27] rounded-[20px] p-[20px] shadow-2xl overflow-hidden max-h-[60vh] overflow-y-auto z-[120]">
              {renderSearchResults(false)}
            </div>
          )}
        </div>

        <div className="flex items-center">
          {isLoading ? (
            <div className="flex items-center gap-[13px] animate-pulse">
              <div className="w-[40px] h-[40px] md:w-[48px] md:h-[48px] bg-neutral-900 rounded-full"></div>
              <div className="hidden md:block h-6 w-20 bg-neutral-900 rounded-md"></div>
            </div>
          ) : isLoggedIn && user ? (
            <div className="flex items-center gap-4 md:gap-[13px] relative" ref={dropdownRef}>
              <button
                onClick={() => setIsMobileSearchActive(true)}
                className="md:hidden cursor-pointer p-1"
              >
                <Search className="w-5 h-5 text-[#FDFDFD]" />
              </button>

              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-[13px] focus:outline-none cursor-pointer"
              >
                <div className="relative w-[40px] h-[40px] md:w-[48px] md:h-[48px] rounded-full bg-neutral-900 border border-[#181D27] overflow-hidden flex items-center justify-center hover:opacity-80 transition-opacity">
                  {user.avatarUrl ? (
                    <Image
                      src={user.avatarUrl}
                      alt={user.username}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  ) : (
                    <UserIcon className="w-5 h-5 md:w-6 md:h-6 text-[#A4A7AE]" />
                  )}
                </div>
                <div className="hidden md:block text-[16px] font-bold text-[#FDFDFD] leading-[30px] tracking-[-0.02em] font-['SF_Pro'] text-left">
                  {user.name || user.username}
                </div>
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 top-[110%] w-48 bg-[#0A0D12] border border-[#181D27] rounded-2xl py-2 shadow-2xl flex flex-col z-[120] animate-in fade-in slide-in-from-top-2 overflow-hidden">
                  <Link
                    href="/profile"
                    onClick={() => setIsDropdownOpen(false)}
                    className="px-4 py-2 w-full text-left text-[14px] font-bold text-[#FDFDFD] hover:bg-[#181D27] transition-colors flex items-center gap-3 cursor-pointer font-['SF_Pro']"
                  >
                    <UserIcon className="w-4 h-4" />
                    My Profile
                  </Link>
                  <div className="w-full h-px bg-[#181D27] my-1"></div>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 w-full text-left text-[14px] font-bold text-[#ef4444] hover:bg-[#181D27] transition-colors flex items-center gap-3 cursor-pointer font-['SF_Pro']"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="hidden md:flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => router.push("/login")}
                  className="rounded-full text-[#FDFDFD] border border-[#181D27] hover:bg-[#181D27] px-6 cursor-pointer"
                >
                  Login
                </Button>
                <Button
                  onClick={() => router.push("/register")}
                  className="rounded-full bg-[#6936F2] hover:bg-[#522BC8] px-6 cursor-pointer"
                >
                  Register
                </Button>
              </div>

              <div className="flex md:hidden items-center gap-4">
                <button
                  onClick={() => setIsMobileSearchActive(true)}
                  className="cursor-pointer p-1"
                >
                  <Search className="w-5 h-5 text-[#FDFDFD]" />
                </button>
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="cursor-pointer"
                >
                  {isMenuOpen ? (
                    <X className="text-[#FDFDFD]" />
                  ) : (
                    <Menu className="text-[#FDFDFD]" />
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </nav>

      {isMenuOpen && !isLoggedIn && !isMobileSearchActive && (
        <div className="md:hidden w-full bg-[#000000] border-b border-[#181D27] p-4 flex flex-col gap-4 animate-in slide-in-from-top-5 relative z-[90]">
          <div className="flex gap-2 w-full">
            <Button
              variant="outline"
              onClick={() => {
                setIsMenuOpen(false);
                router.push("/login");
              }}
              className="w-full rounded-full border-[#181D27] text-[#FDFDFD] cursor-pointer"
            >
              Login
            </Button>
            <Button
              onClick={() => {
                setIsMenuOpen(false);
                router.push("/register");
              }}
              className="w-full rounded-full bg-[#6936F2] text-[#FDFDFD] cursor-pointer"
            >
              Register
            </Button>
          </div>
        </div>
      )}
    </>
  );
}