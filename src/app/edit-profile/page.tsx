"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, User, X } from "lucide-react";
import axiosInstance from "@/lib/axios";

export default function EditProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [errors, setErrors] = useState({
    name: "",
    username: "",
    bio: "",
    avatar: "",
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  
  const triggerToast = (
    message: string,
    type: "success" | "error" = "error",
  ) => {
    setToastMsg(message);
    setToastType(type);
    setShowToast(true);
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axiosInstance.get("/me");
        const data = res.data?.data || {};
        const profileData = data.profile || data.user || data;
        setName(profileData.name || "");
        setUsername(profileData.username || "");
        setEmail(profileData.email || "");
        setPhone(profileData.phone || "");
        setBio(profileData.bio || "");
        setPreviewAvatar(profileData.avatarUrl || null);
      } catch (error) {
        console.error("Failed to fetch profile", error);
        triggerToast("Gagal memuat data profil", "error");
      } finally {
        setIsLoadingInitial(false);
      }
    };
    fetchProfile();
  }, []);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, avatar: "Ukuran foto maksimal 5MB." }));
      triggerToast("Ukuran foto maksimal 5MB.", "error");
      return;
    }

    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        avatar: "Format foto harus JPG, PNG, atau WEBP.",
      }));
      triggerToast("Format foto tidak didukung.", "error");
      return;
    }
    setErrors((prev) => ({ ...prev, avatar: "" }));
    setAvatarFile(file);
    setPreviewAvatar(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    setErrors({ name: "", username: "", bio: "", avatar: "" });
    let hasError = false;
    const newErrors = { name: "", username: "", bio: "", avatar: "" };
    if (!name.trim()) {
      newErrors.name = "Name is required";
      hasError = true;
    }
    if (!username.trim()) {
      newErrors.username = "Username is required";
      hasError = true;
    }
    if (hasError) {
      setErrors(newErrors);
      triggerToast("Mohon lengkapi data yang wajib!", "error");
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("username", username.trim());
    if (phone.trim()) formData.append("phone", phone.trim());
    if (bio.trim()) formData.append("bio", bio.trim());
    if (avatarFile) {
      formData.append("avatar", avatarFile);
    }
    try {
      await axiosInstance.patch("/me", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      triggerToast("Success Update Profile", "success");
      if (avatarFile && previewAvatar) URL.revokeObjectURL(previewAvatar);
      
      // Update global event biar navbar ikut ke-refresh
      window.dispatchEvent(new Event("profileUpdated"));
      
      setTimeout(() => {
        router.push("/profile");
        router.refresh();
      }, 1500);
    } catch (error) {
      console.error("Failed to update profile:", error);
      triggerToast("Gagal memperbarui profil.", "error");
      setErrors((prev) => ({
        ...prev,
        username: "Username mungkin sudah terpakai.",
      }));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoadingInitial) {
    return (
      <div className="min-h-screen bg-black flex justify-center items-center">
        <Loader2 className="w-8 h-8 text-[#7F51F9] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#000000] text-white font-['SF_Pro'] relative pb-[100px] md:pb-[100px] flex flex-col items-center">
      
      {/* 🚀 FIX: Posisi Toast Desktop Kanan, Mobile Tengah */}
      {showToast && (
        <div className={`fixed z-[999] top-[83px] md:top-[117px] left-1/2 md:left-auto md:right-[120px] transform -translate-x-1/2 md:translate-x-0 flex flex-row justify-center items-center px-[12px] py-[8px] gap-[8px] w-[353px] md:w-[291px] h-[40px] rounded-[8px] transition-all animate-in fade-in slide-in-from-top-5 ${toastType === 'success' ? 'bg-[#079455]' : 'bg-[#B41759]'}`}>
          <span className="flex-1 text-[14px] font-semibold text-[#FFFFFF] leading-[28px] tracking-[-0.02em] font-['SF_Pro']">
            {toastMsg}
          </span>
          <button onClick={() => setShowToast(false)} className="w-[16px] h-[16px] shrink-0 flex justify-center items-center cursor-pointer opacity-80 hover:opacity-100">
            <X className="w-[12px] h-[12px] text-[#FFFFFF]" strokeWidth={2.5} />
          </button>
        </div>
      )}

      {/* Header Mobile (Panah + Edit Profile Text di Kiri) */}
      <div className="md:hidden sticky top-0 z-50 w-full h-[64px] bg-[#000000] border-b border-[#181D27] flex items-center justify-between px-[16px]">
        <div className="flex items-center gap-[8px]">
          <Link href="/profile" className="p-1 -ml-1 cursor-pointer hover:opacity-80">
            <ArrowLeft className="w-[24px] h-[24px] text-[#FDFDFD]" />
          </Link>
          <span className="text-[16px] font-bold text-[#FDFDFD] leading-[30px] tracking-[-0.02em] truncate max-w-[200px]">
            Edit Profile
          </span>
        </div>
        
        {/* Avatar Mobile */}
        <div className="relative w-[40px] h-[40px] rounded-full overflow-hidden bg-neutral-900 border border-[#181D27] shrink-0">
          {previewAvatar ? (
            <Image 
              src={previewAvatar} 
              alt="Avatar" 
              fill 
              sizes="40px" 
              className="object-cover" 
              priority 
            />
          ) : (
            <User className="w-5 h-5 text-neutral-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          )}
        </div>
      </div>

      {/* Layout Utama disesuaikan Figma */}
      <div className="flex flex-col w-full max-w-[361px] md:max-w-[800px] pt-[24px] md:pt-[40px] px-[16px] md:px-0 gap-[16px] md:gap-[32px]">
        
        {/* Desktop Title & Back Button */}
        <div className="hidden md:flex flex-row items-center gap-[12px] w-full">
           <Link href="/profile" className="flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity">
              <ArrowLeft className="w-[32px] h-[32px] text-[#FDFDFD]" strokeWidth={2.5} />
           </Link>
           <span className="text-[24px] font-bold text-[#FDFDFD] leading-[36px] font-['SF_Pro']">
             Edit Profile
           </span>
        </div>

        {/* Content Wrapper (Kiri: Avatar | Kanan: Form) */}
        <div className="flex flex-col md:flex-row items-center md:items-start w-full gap-[16px] md:gap-[48px]">
          
          {/* Avatar Section (Kiri) */}
          <div className="flex flex-col items-center gap-[16px] shrink-0 w-full md:w-[160px]">
            <div
              className={`relative flex items-center justify-center w-[80px] h-[80px] md:w-[130px] md:h-[130px] rounded-full bg-neutral-900 border overflow-hidden shrink-0 ${errors.avatar ? "border-[#B41759]" : "border-[#181D27]"}`}
            >
              {previewAvatar ? (
                <Image
                  src={previewAvatar}
                  alt="Avatar"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 80px, 130px"
                  priority 
                />
              ) : (
                <User className="w-10 h-10 md:w-16 md:h-16 text-neutral-500" />
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              accept="image/png, image/jpeg, image/webp"
              className="hidden"
            />
            <div className="flex flex-col items-center gap-[2px] w-full">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex justify-center items-center px-[16px] h-[40px] md:h-[48px] border border-[#181D27] rounded-[100px] hover:bg-[#181D27] transition-colors cursor-pointer w-[160px]"
              >
                <span className="text-[14px] md:text-[16px] font-bold text-[#FDFDFD] leading-[28px] md:leading-[30px] tracking-[-0.01em] md:tracking-[-0.02em]">
                  Change Photo
                </span>
              </button>
              {errors.avatar && (
                <span className="text-[12px] text-[#B41759] font-medium mt-1 text-center w-full">
                  {errors.avatar}
                </span>
              )}
            </div>
          </div>

          {/* Form Inputs Section (Kanan) */}
          <div className="flex flex-col w-full md:w-[592px] gap-[16px] md:gap-[24px]">
            
            {/* Name */}
            <div className="flex flex-col gap-[2px] w-full">
              <label className="text-[14px] font-bold text-[#FFFFFF] leading-[28px] tracking-[-0.02em]">
                Name
              </label>
              <div
                className={`flex items-center px-[16px] w-full h-[48px] bg-[#0A0D12] border rounded-[12px] transition-colors ${errors.name ? "border-[#B41759]" : "border-[#181D27] focus-within:border-[#7F51F9]"}`}
              >
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Masukkan nama Anda"
                  className="w-full bg-transparent border-none outline-none text-[16px] font-semibold text-[#FDFDFD] leading-[30px] tracking-[-0.02em] placeholder-[#535862]"
                />
              </div>
              {errors.name && (
                <span className="text-[14px] text-[#B41759] font-medium tracking-[-0.03em] mt-1">
                  {errors.name}
                </span>
              )}
            </div>

            {/* Username */}
            <div className="flex flex-col gap-[2px] w-full">
              <label className="text-[14px] font-bold text-[#FFFFFF] leading-[28px] tracking-[-0.02em]">
                Username
              </label>
              <div
                className={`flex items-center px-[16px] w-full h-[48px] bg-[#0A0D12] border rounded-[12px] transition-colors ${errors.username ? "border-[#B41759]" : "border-[#181D27] focus-within:border-[#7F51F9]"}`}
              >
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="username_anda"
                  className="w-full bg-transparent border-none outline-none text-[16px] font-semibold text-[#FDFDFD] leading-[30px] tracking-[-0.02em] placeholder-[#535862]"
                />
              </div>
              {errors.username && (
                <span className="text-[14px] text-[#B41759] font-medium tracking-[-0.03em] mt-1">
                  {errors.username}
                </span>
              )}
            </div>
            
            {/* Email (Read-Only) */}
            <div className="flex flex-col gap-[2px] w-full opacity-60">
              <label className="text-[14px] font-bold text-[#FFFFFF] leading-[28px] tracking-[-0.02em]">
                Email
              </label>
              <div className="flex items-center px-[16px] w-full h-[48px] bg-[#0A0D12] border border-[#181D27] rounded-[12px] cursor-not-allowed">
                <input
                  type="email"
                  value={email}
                  disabled
                  placeholder="email@domain.com"
                  className="w-full bg-transparent border-none outline-none text-[16px] font-semibold text-[#FDFDFD] leading-[30px] tracking-[-0.02em] cursor-not-allowed"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div className="flex flex-col gap-[2px] w-full">
              <label className="text-[14px] font-bold text-[#FFFFFF] leading-[28px] tracking-[-0.02em]">
                Phone Number
              </label>
              <div className="flex items-center px-[16px] w-full h-[48px] bg-[#0A0D12] border border-[#181D27] rounded-[12px] focus-within:border-[#7F51F9] transition-colors">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0812xxxxxx"
                  className="w-full bg-transparent border-none outline-none text-[16px] font-semibold text-[#FDFDFD] leading-[30px] tracking-[-0.02em] placeholder-[#535862]"
                />
              </div>
            </div>

            {/* Bio */}
            <div className="flex flex-col gap-[2px] w-full">
              <label className="text-[14px] font-bold text-[#FFFFFF] leading-[28px] tracking-[-0.02em]">
                Bio
              </label>
              <div
                className={`flex w-full bg-[#0A0D12] border rounded-[12px] px-[16px] py-[8px] transition-colors h-[101px] ${errors.bio ? "border-[#B41759]" : "border-[#181D27] focus-within:border-[#7F51F9]"}`}
              >
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tulis sesuatu tentang dirimu..."
                  className="w-full h-full bg-transparent border-none outline-none text-[16px] font-normal text-[#FDFDFD] leading-[30px] tracking-[-0.02em] placeholder-[#535862] resize-none"
                />
              </div>
              {errors.bio && (
                <span className="text-[14px] text-[#B41759] font-medium tracking-[-0.03em] mt-1">
                  {errors.bio}
                </span>
              )}
            </div>

            {/* Tombol Save Changes */}
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`flex justify-center items-center w-full md:w-[592px] h-[40px] md:h-[48px] rounded-[100px] transition-colors mt-[8px] cursor-pointer shrink-0 ${isSubmitting ? "bg-[#181D27] text-[#A4A7AE] cursor-not-allowed" : "bg-[#6936F2] hover:bg-[#522BC8] text-[#FDFDFD]"}`}
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <span className="text-[14px] md:text-[16px] font-bold leading-[28px] md:leading-[30px] tracking-[-0.01em] md:tracking-[-0.02em]">
                  Save Changes
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}