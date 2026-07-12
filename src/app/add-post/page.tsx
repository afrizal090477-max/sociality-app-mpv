"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, UploadCloud, X, User } from "lucide-react";
import axiosInstance from "@/lib/axios";

export default function AddPostPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [caption, setCaption] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 🚀 FIX: State buat nangkep pesan error di UI form
  const [errors, setErrors] = useState({
    photo: "",
    caption: "",
  });

  const [userAvatar, setUserAvatar] = useState<string | null>(null);

  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const triggerToast = (message: string, type: "success" | "error" = "error") => {
    setToastMsg(message);
    setToastType(type);
    setShowToast(true);
  };

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await axiosInstance.get("/me");
        const data = res.data?.data || {};
        const profileData = data.profile || data.user || data;
        setUserAvatar(profileData.avatarUrl || null);
      } catch (err) {
        console.error("Failed to load user info", err);
      }
    };
    fetchMe();
  }, []);

  // Tiap kali user milih foto, reset error foto-nya
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, photo: "Ukuran foto maksimal 5MB." }));
      triggerToast("Ukuran foto maksimal 5MB.", "error");
      return;
    }

    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];
    if (!validTypes.includes(selectedFile.type)) {
      setErrors((prev) => ({ ...prev, photo: "Format foto tidak didukung." }));
      triggerToast("Format foto tidak didukung.", "error");
      return;
    }

    setErrors((prev) => ({ ...prev, photo: "" }));
    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); 
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (!droppedFile) return;

    if (droppedFile.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, photo: "Ukuran foto maksimal 5MB." }));
      triggerToast("Ukuran foto maksimal 5MB.", "error");
      return;
    }

    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];
    if (!validTypes.includes(droppedFile.type)) {
      setErrors((prev) => ({ ...prev, photo: "Format foto tidak didukung." }));
      triggerToast("Format foto tidak didukung.", "error");
      return;
    }

    setErrors((prev) => ({ ...prev, photo: "" }));
    setFile(droppedFile);
    setPreviewUrl(URL.createObjectURL(droppedFile));
  };

  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    setErrors({ photo: "", caption: "" });
    let hasError = false;
    const newErrors = { photo: "", caption: "" };

    // Validasi kosong
    if (!file) {
      newErrors.photo = "Photo is required";
      hasError = true;
    }
    
    if (hasError) {
      setErrors(newErrors);
      triggerToast("Pilih foto terlebih dahulu!", "error");
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("image", file as File);
    if (caption.trim()) {
      formData.append("caption", caption.trim());
    }

    try {
      await axiosInstance.post("/posts", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      triggerToast("Success Post", "success");
      
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      
      setTimeout(() => {
        router.push("/"); 
        router.refresh();
      }, 1500);
    } catch (error) {
      console.error("Failed to add post:", error);
      triggerToast("Gagal mengunggah postingan.", "error");
      // Kalau ada error dari backend, bisa taruh di newErrors.caption atau photo
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] text-white font-['SF_Pro'] relative pb-[100px] md:pb-[100px] flex flex-col items-center">
      
      {showToast && (
        <div className={`fixed z-[999] top-[86px] md:top-[112px] left-1/2 md:left-auto md:right-[120px] lg:right-[calc(50%-720px+120px)] transform -translate-x-1/2 md:translate-x-0 flex flex-row justify-center items-center px-[12px] py-[8px] gap-[8px] w-[353px] md:w-[291px] h-[40px] rounded-[8px] transition-all animate-in fade-in slide-in-from-top-5 ${toastType === 'success' ? 'bg-[#079455]' : 'bg-[#B41759]'}`}>
          <span className="flex-1 text-[14px] font-semibold text-[#FFFFFF] leading-[28px] tracking-[-0.02em] font-['SF_Pro']">
            {toastMsg}
          </span>
          <button onClick={() => setShowToast(false)} className="w-[16px] h-[16px] shrink-0 flex justify-center items-center cursor-pointer opacity-80 hover:opacity-100">
            <X className="w-[12px] h-[12px] text-[#FFFFFF]" strokeWidth={2.5} />
          </button>
        </div>
      )}

      {/* Header Custom Mobile */}
      <div className="md:hidden sticky top-0 z-50 w-full h-[64px] bg-[#000000] border-b border-[#181D27] flex items-center justify-between px-[16px]">
        <div className="flex items-center gap-[8px]">
          <Link href="/" className="p-1 -ml-1 cursor-pointer hover:opacity-80">
            <ArrowLeft className="w-[24px] h-[24px] text-[#FDFDFD]" />
          </Link>
          <span className="text-[16px] font-bold text-[#FDFDFD] leading-[30px] tracking-[-0.02em] truncate max-w-[200px]">
            Add Post
          </span>
        </div>
        
        <div className="relative w-[40px] h-[40px] rounded-full overflow-hidden bg-neutral-900 border border-[#181D27] shrink-0">
          {userAvatar ? (
            <Image src={userAvatar} alt="Avatar" fill sizes="40px" className="object-cover" priority />
          ) : (
            <User className="w-5 h-5 text-neutral-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          )}
        </div>
      </div>

      <div className="flex flex-col w-full max-w-[361px] md:max-w-[452px] pt-[24px] md:pt-[40px] px-[16px] md:px-0 gap-[24px]">
        
        <div className="hidden md:flex flex-row items-center gap-[12px] w-full">
           <Link href="/" className="flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity">
              <ArrowLeft className="w-[32px] h-[32px] text-[#FDFDFD]" strokeWidth={2.5} />
           </Link>
           <span className="text-[24px] font-bold text-[#FDFDFD] leading-[36px] font-['SF_Pro']">
             Add Post
           </span>
        </div>

        <div className="flex flex-col w-full gap-[16px]">
          
          {/* Upload Photo Section */}
          {/* 🚀 FIX: Tambahin State Error di sini */}
          <div className="flex flex-col gap-[6px] w-full">
            <label className="text-[14px] font-bold text-[#FDFDFD] leading-[28px] tracking-[-0.02em]">
              Photo
            </label>
            
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => !previewUrl && fileInputRef.current?.click()}
              className={`relative flex flex-col items-center justify-center w-full md:w-[452px] h-[144px] bg-[#0A0D12] rounded-[12px] p-[16px_24px] transition-colors overflow-hidden ${previewUrl ? 'border border-[#181D27]' : `border border-dashed cursor-pointer hover:border-[#7F51F9] ${errors.photo ? 'border-[#B41759]' : 'border-[#181D27]'}`}`}
            >
              {previewUrl ? (
                <>
                  <Image src={previewUrl} alt="Preview" fill className="object-contain bg-black/50" />
                  <button 
                    onClick={removeFile}
                    className="absolute top-2 right-2 w-[32px] h-[32px] bg-black/70 rounded-full flex justify-center items-center hover:bg-black transition-colors"
                  >
                    <X className="w-[16px] h-[16px] text-white" />
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center gap-[12px] w-full">
                  <div className="w-[40px] h-[40px] border border-[#181D27] rounded-[8px] flex items-center justify-center shrink-0">
                    <UploadCloud className="w-[20px] h-[20px] text-[#FDFDFD]" />
                  </div>
                  <div className="flex flex-col items-center gap-[4px] w-full text-center">
                    <div className="flex flex-row items-center justify-center gap-[6px] text-[14px] leading-[28px] tracking-[-0.02em]">
                      <span className="font-bold text-[#7F51F9]">Click to upload</span>
                      <span className="font-medium text-[#535862]">or drag and drop</span>
                    </div>
                    <span className="text-[14px] font-medium text-[#535862] leading-[28px] tracking-[-0.02em]">
                      SVG, PNG, JPG or WEBP (max. 5MB)
                    </span>
                  </div>
                </div>
              )}
            </div>
            
            {/* Munculin teks merah kalau ada error */}
            {errors.photo && (
              <span className="text-[14px] font-medium text-[#B41759] leading-[28px] tracking-[-0.03em]">
                {errors.photo}
              </span>
            )}
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/png, image/jpeg, image/webp"
              className="hidden"
            />
          </div>

          {/* Caption Section */}
          {/* 🚀 FIX: State Error Caption */}
          <div className="flex flex-col gap-[2px] w-full">
            <label className="text-[14px] font-bold text-[#FDFDFD] leading-[28px] tracking-[-0.02em]">
              Caption
            </label>
            <div className={`flex w-full md:w-[452px] h-[101px] bg-[#0A0D12] border rounded-[12px] p-[8px_16px] transition-colors ${errors.caption ? 'border-[#B41759]' : 'border-[#181D27] focus-within:border-[#7F51F9]'}`}>
              <textarea
                value={caption}
                onChange={(e) => {
                  setCaption(e.target.value);
                  if (errors.caption) setErrors(prev => ({...prev, caption: ""}));
                }}
                placeholder="Create your caption"
                className="w-full h-full bg-transparent border-none outline-none text-[16px] font-normal text-[#FDFDFD] leading-[30px] tracking-[-0.02em] placeholder-[#535862] resize-none"
              />
            </div>
            {errors.caption && (
              <span className="text-[14px] font-medium text-[#B41759] leading-[28px] tracking-[-0.03em]">
                {errors.caption}
              </span>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`flex justify-center items-center w-full md:w-[452px] h-[40px] md:h-[48px] rounded-[100px] transition-colors cursor-pointer shrink-0 mt-[8px] ${isSubmitting ? "bg-[#181D27] text-[#A4A7AE] cursor-not-allowed" : "bg-[#6936F2] hover:bg-[#522BC8] text-[#FDFDFD]"}`}
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <span className="text-[14px] md:text-[16px] font-bold leading-[28px] md:leading-[30px] tracking-[-0.01em] md:tracking-[-0.02em]">
                Share
              </span>
            )}
          </button>
          
        </div>
      </div>
    </div>
  );
}