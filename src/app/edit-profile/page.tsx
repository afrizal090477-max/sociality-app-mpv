'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, User } from 'lucide-react';
import axiosInstance from '@/lib/axios';
import { Toast } from '@/components/ui/Toast'; 

export default function EditProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Loading States
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form States
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState(''); // Email dibiarin read-only
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');

  // Form Errors
  const [errors, setErrors] = useState({
    name: '',
    username: '',
    bio: '',
    avatar: '',
  });

  // Avatar States
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);

  // Toast States
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const triggerToast = (message: string, type: 'success' | 'error' = 'error') => {
    setToastMsg(message);
    setToastType(type);
    setShowToast(true);
  };

  // 1. Fetch Data Profil Saat Ini
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axiosInstance.get('/me');
        const data = res.data?.data || {};
        const profileData = data.profile || data.user || data;
        
        setName(profileData.name || '');
        setUsername(profileData.username || '');
        setEmail(profileData.email || '');
        setPhone(profileData.phone || '');
        setBio(profileData.bio || '');
        setPreviewAvatar(profileData.avatarUrl || null);
      } catch (error) {
        console.error('Failed to fetch profile', error);
        triggerToast('Gagal memuat data profil', 'error');
      } finally {
        setIsLoadingInitial(false);
      }
    };

    fetchProfile();
  }, []);

  // 2. Handle Ganti Foto Avatar
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, avatar: 'Ukuran foto maksimal 5MB.' }));
      triggerToast('Ukuran foto maksimal 5MB.', 'error');
      return;
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setErrors((prev) => ({ ...prev, avatar: 'Format foto harus JPG, PNG, atau WEBP.' }));
      triggerToast('Format foto tidak didukung.', 'error');
      return;
    }

    setErrors((prev) => ({ ...prev, avatar: '' }));
    setAvatarFile(file);
    setPreviewAvatar(URL.createObjectURL(file));
  };

  // 3. Handle Submit Update Profil
  const handleSubmit = async () => {
    // Reset errors
    setErrors({ name: '', username: '', bio: '', avatar: '' });
    
    let hasError = false;
    const newErrors = { name: '', username: '', bio: '', avatar: '' };

    if (!name.trim()) {
      newErrors.name = 'Name is required';
      hasError = true;
    }
    if (!username.trim()) {
      newErrors.username = 'Username is required';
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      triggerToast('Mohon lengkapi data yang wajib!', 'error');
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    
    formData.append('name', name.trim());
    formData.append('username', username.trim());
    if (phone.trim()) formData.append('phone', phone.trim());
    if (bio.trim()) formData.append('bio', bio.trim());

    if (avatarFile) {
      formData.append('avatar', avatarFile);
    }

    try {
      await axiosInstance.patch('/me', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      triggerToast('Profile Success Update!', 'success');
      
      if (avatarFile && previewAvatar) URL.revokeObjectURL(previewAvatar);

      // Pindah ke halaman profil setelah 1.5 detik
      setTimeout(() => {
        router.push('/profile');
        router.refresh();
      }, 1500);

    } catch (error) {
      console.error('Failed to update profile:', error);
      triggerToast('Gagal memperbarui profil.', 'error');
      // Set error username kalau API nolak karena duplikat
      setErrors((prev) => ({ ...prev, username: 'Username mungkin sudah terpakai.' }));
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
    <div className="min-h-screen bg-[#000000] text-white font-['SF_Pro'] relative pb-[100px] md:pb-0">
      {showToast && (
        <Toast 
          message={toastMsg} 
          type={toastType} 
          onClose={() => setShowToast(false)} 
        />
      )}

      {/* HEADER */}
      <div className="sticky top-0 z-50 flex flex-row items-center px-[16px] md:px-[120px] h-[64px] md:h-[80px] bg-[#000000] border-b border-[#181D27]">
        <div className="flex items-center w-full max-w-[800px] mx-auto relative justify-center md:justify-start">
          <button 
            onClick={() => router.back()} 
            className="absolute left-0 p-1 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <ArrowLeft className="w-[24px] h-[24px] md:w-[32px] md:h-[32px] text-[#FDFDFD]" />
          </button>
          <span className="text-[16px] md:text-[24px] font-bold text-[#FDFDFD] md:ml-[50px]">
            Edit Profile
          </span>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <div className="flex flex-col md:flex-row items-center md:items-start justify-center w-full max-w-[800px] mx-auto pt-[24px] md:pt-[48px] px-[16px] md:px-0 gap-[32px] md:gap-[48px]">
        
        {/* AVATAR SECTION */}
        <div className="flex flex-col items-center gap-[16px] shrink-0">
          <div className={`relative flex items-center justify-center w-[80px] h-[80px] md:w-[130px] md:h-[130px] rounded-full bg-neutral-900 border overflow-hidden ${errors.avatar ? 'border-[#B41759]' : 'border-[#181D27]'}`}>
            {previewAvatar ? (
              <Image src={previewAvatar} alt="Avatar" fill className="object-cover" sizes="(max-width: 768px) 80px, 130px" />
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
          <div className="flex flex-col items-center gap-1">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex justify-center items-center px-[16px] h-[40px] md:h-[48px] border border-[#181D27] rounded-[100px] hover:bg-[#181D27] transition-colors cursor-pointer"
            >
              <span className="text-[14px] md:text-[16px] font-bold text-[#FDFDFD] leading-[28px] md:leading-[30px] tracking-[-0.01em] md:tracking-[-0.02em]">
                Change Photo
              </span>
            </button>
            {errors.avatar && <span className="text-[12px] text-[#B41759] font-medium mt-1">{errors.avatar}</span>}
          </div>
        </div>

        {/* FORM SECTION */}
        <div className="flex flex-col w-full max-w-[592px] gap-[24px]">
          
          {/* Name */}
          <div className="flex flex-col gap-[2px] w-full">
            <label className="text-[14px] font-bold text-[#FDFDFD] leading-[28px] tracking-[-0.02em]">Name</label>
            <div className={`flex items-center px-[16px] w-full h-[48px] bg-[#0A0D12] border rounded-[12px] transition-colors ${errors.name ? 'border-[#B41759]' : 'border-[#181D27] focus-within:border-[#7F51F9]'}`}>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="John Doe" 
                className="w-full bg-transparent border-none outline-none text-[16px] text-[#FDFDFD] font-medium leading-[30px] tracking-[-0.02em] placeholder-[#535862]" 
              />
            </div>
            {errors.name && <span className="text-[14px] text-[#B41759] font-medium tracking-[-0.03em] mt-1">{errors.name}</span>}
          </div>

          {/* Username */}
          <div className="flex flex-col gap-[2px] w-full">
            <label className="text-[14px] font-bold text-[#FDFDFD] leading-[28px] tracking-[-0.02em]">Username</label>
            <div className={`flex items-center px-[16px] w-full h-[48px] bg-[#0A0D12] border rounded-[12px] transition-colors ${errors.username ? 'border-[#B41759]' : 'border-[#181D27] focus-within:border-[#7F51F9]'}`}>
              <input 
                type="text" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                placeholder="johndoe" 
                className="w-full bg-transparent border-none outline-none text-[16px] text-[#FDFDFD] font-medium leading-[30px] tracking-[-0.02em] placeholder-[#535862]" 
              />
            </div>
            {errors.username && <span className="text-[14px] text-[#B41759] font-medium tracking-[-0.03em] mt-1">{errors.username}</span>}
          </div>

          {/* Email (Read-Only) */}
          <div className="flex flex-col gap-[2px] w-full opacity-60">
            <label className="text-[14px] font-bold text-[#FDFDFD] leading-[28px] tracking-[-0.02em]">Email</label>
            <div className="flex items-center px-[16px] w-full h-[48px] bg-[#0A0D12] border border-[#181D27] rounded-[12px] cursor-not-allowed">
              <input 
                type="email" 
                value={email} 
                disabled
                placeholder="johndoe@email.com" 
                className="w-full bg-transparent border-none outline-none text-[16px] text-[#FDFDFD] font-medium leading-[30px] tracking-[-0.02em] cursor-not-allowed" 
              />
            </div>
            <span className="text-[14px] text-[#535862] font-medium tracking-[-0.03em] mt-1">Email tidak dapat diubah</span>
          </div>

          {/* Phone */}
          <div className="flex flex-col gap-[2px] w-full">
            <label className="text-[14px] font-bold text-[#FDFDFD] leading-[28px] tracking-[-0.02em]">Phone Number</label>
            <div className="flex items-center px-[16px] w-full h-[48px] bg-[#0A0D12] border border-[#181D27] rounded-[12px] focus-within:border-[#7F51F9] transition-colors">
              <input 
                type="tel" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)} 
                placeholder="081234567890" 
                className="w-full bg-transparent border-none outline-none text-[16px] text-[#FDFDFD] font-medium leading-[30px] tracking-[-0.02em] placeholder-[#535862]" 
              />
            </div>
          </div>

          {/* Bio */}
          <div className="flex flex-col gap-[2px] w-full">
            <label className="text-[14px] font-bold text-[#FDFDFD] leading-[28px] tracking-[-0.02em]">Bio</label>
            <div className={`flex w-full bg-[#0A0D12] border rounded-[12px] p-[8px] px-[16px] transition-colors ${errors.bio ? 'border-[#B41759]' : 'border-[#181D27] focus-within:border-[#7F51F9]'}`}>
              <textarea 
                value={bio} 
                onChange={(e) => setBio(e.target.value)} 
                placeholder="Creating unforgettable moments..." 
                rows={4}
                className="w-full bg-transparent border-none outline-none text-[16px] text-[#FDFDFD] font-normal leading-[30px] tracking-[-0.02em] placeholder-[#535862] resize-none" 
              />
            </div>
            {errors.bio && <span className="text-[14px] text-[#B41759] font-medium tracking-[-0.03em] mt-1">{errors.bio}</span>}
          </div>

          {/* Submit Button */}
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`flex justify-center items-center w-full h-[40px] md:h-[48px] rounded-[100px] transition-colors mt-[8px] cursor-pointer ${isSubmitting ? 'bg-[#181D27] text-[#A4A7AE] cursor-not-allowed' : 'bg-[#6936F2] hover:bg-[#522BC8] text-[#FDFDFD]'}`}
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
  );
}