'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import axiosInstance from '@/lib/axios';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';

const registerSchema = z.object({
  name: z.string().min(2, "Nama terlalu pendek"),
  username: z.string().min(3, "Username minimal 3 karakter"),
  phone: z.string().min(9, "Nomor telepon tidak valid"),
  email: z.string().email("Email tidak valid"), 
  password: z.string().min(6, "Password minimal 6 karakter"),
  confirmPassword: z.string().min(6, "Password minimal 6 karakter"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Password tidak sama",
  path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  
  // State Management untuk UI
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    try {
      const payload = {
        name: data.name,
        username: data.username,
        phone: data.phone,
        email: data.email,
        password: data.password,
      };
      
      await axiosInstance.post('/auth/register', payload);
      
      toast.success("Registrasi Berhasil! Silakan Login.");
      router.push('/login'); 
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || "Gagal Register, silakan cek kembali data lu.";
        toast.error(message);
      } else {
        toast.error("Terjadi kesalahan yang tidak diketahui");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-black py-[40px] md:py-0 overflow-x-hidden">
      
      {/* ==================== GRADIENT GLOW (PERFECT U-SHAPE) ==================== */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute -bottom-[20%] -left-[20%] w-[80vw] h-[85vh] rounded-full"
          style={{
            background: 'linear-gradient(230.59deg, #AC88FF 33.13%, #AD3AE7 63.19%)',
            filter: 'blur(160px)',
            opacity: 0.7
          }}
        />
        <div 
          className="absolute -bottom-[20%] -right-[20%] w-[80vw] h-[85vh] rounded-full"
          style={{
            background: 'linear-gradient(270deg, #5613A3 38.99%, #522BC8 77.96%)',
            filter: 'blur(160px)',
            opacity: 0.7
          }}
        />
        <div 
          className="absolute -bottom-[40%] left-0 right-0 w-full h-[60vh] rounded-full"
          style={{
            background: '#522BC8',
            filter: 'blur(150px)',
            opacity: 0.9
          }}
        />
      </div>

      {/* ==================== REGISTER CARD ==================== */}
      <div className="z-10 flex flex-col items-center w-[345px] md:w-[523px] p-[32px_16px] md:p-[40px_24px] gap-[16px] md:gap-[24px] bg-[rgba(0,0,0,0.2)] border border-[#181D27] rounded-[16px] backdrop-blur-[50px] my-auto">
        
        {/* Logo & Title */}
        <div className="flex flex-col items-center gap-[16px] w-full">
          <div className="flex items-center gap-[11px]">
            <Image src="/assets/Logo.svg" alt="Sociality Logo" width={30} height={30} />
            <h1 className="text-[24px] font-bold text-white leading-[36px] font-['SF_Pro']">Sociality</h1>
          </div>
          <h2 className="text-[24px] font-bold text-white leading-[36px] font-['SF_Pro'] text-center">Register</h2>
        </div>

        {/* Form */}
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full md:w-[475px] flex flex-col gap-[16px]">
          
          {/* Name */}
          <div className="flex flex-col gap-[2px]">
            <label className="text-[14px] font-bold text-white leading-[28px] tracking-[-0.02em] font-['SF_Pro']">Name</label>
            <div className="flex items-center w-full h-[48px] p-[8px_16px] gap-[8px] bg-[#0A0D12] border border-[#181D27] rounded-[12px] focus-within:border-[#7F51F9] transition-colors">
              <input
                {...form.register("name")}
                placeholder="Enter your name"
                className="w-full bg-transparent text-[16px] text-white leading-[30px] tracking-[-0.02em] placeholder:text-[#535862] outline-none font-['SF_Pro']"
              />
            </div>
            {form.formState.errors.name && <span className="text-sm text-red-500">{form.formState.errors.name.message}</span>}
          </div>

          {/* Username */}
          <div className="flex flex-col gap-[2px]">
            <label className="text-[14px] font-bold text-white leading-[28px] tracking-[-0.02em] font-['SF_Pro']">Username</label>
            <div className="flex items-center w-full h-[48px] p-[8px_16px] gap-[8px] bg-[#0A0D12] border border-[#181D27] rounded-[12px] focus-within:border-[#7F51F9] transition-colors">
              <input
                {...form.register("username")}
                placeholder="Enter your username"
                className="w-full bg-transparent text-[16px] text-white leading-[30px] tracking-[-0.02em] placeholder:text-[#535862] outline-none font-['SF_Pro']"
              />
            </div>
            {form.formState.errors.username && <span className="text-sm text-red-500">{form.formState.errors.username.message}</span>}
          </div>

          {/* Number Phone */}
          <div className="flex flex-col gap-[2px]">
            <label className="text-[14px] font-bold text-white leading-[28px] tracking-[-0.02em] font-['SF_Pro']">Number Phone</label>
            <div className="flex items-center w-full h-[48px] p-[8px_16px] gap-[8px] bg-[#0A0D12] border border-[#181D27] rounded-[12px] focus-within:border-[#7F51F9] transition-colors">
              <input
                {...form.register("phone")}
                type="tel"
                placeholder="Enter your number phone"
                className="w-full bg-transparent text-[16px] text-white leading-[30px] tracking-[-0.02em] placeholder:text-[#535862] outline-none font-['SF_Pro']"
              />
            </div>
            {form.formState.errors.phone && <span className="text-sm text-red-500">{form.formState.errors.phone.message}</span>}
          </div>

          {/* Email (YANG TADI HILANG KITA TAMBAHIN DI SINI) */}
          <div className="flex flex-col gap-[2px]">
            <label className="text-[14px] font-bold text-white leading-[28px] tracking-[-0.02em] font-['SF_Pro']">Email</label>
            <div className="flex items-center w-full h-[48px] p-[8px_16px] gap-[8px] bg-[#0A0D12] border border-[#181D27] rounded-[12px] focus-within:border-[#7F51F9] transition-colors">
              <input
                {...form.register("email")}
                type="email"
                placeholder="Enter your email"
                className="w-full bg-transparent text-[16px] text-white leading-[30px] tracking-[-0.02em] placeholder:text-[#535862] outline-none font-['SF_Pro']"
              />
            </div>
            {form.formState.errors.email && <span className="text-sm text-red-500">{form.formState.errors.email.message}</span>}
          </div>

          {/* Password */}
          <div className="flex flex-col gap-[2px]">
            <label className="text-[14px] font-bold text-white leading-[28px] tracking-[-0.02em] font-['SF_Pro']">Password</label>
            <div className="relative flex items-center w-full h-[48px] p-[8px_16px] gap-[8px] bg-[#0A0D12] border border-[#181D27] rounded-[12px] focus-within:border-[#7F51F9] transition-colors">
              <input
                {...form.register("password")}
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="w-full bg-transparent text-[16px] text-white leading-[30px] tracking-[-0.02em] placeholder:text-[#535862] outline-none pr-8 font-['SF_Pro']"
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-[16px] flex items-center justify-center text-[#717680] hover:text-[#FDFDFD] transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {form.formState.errors.password && <span className="text-sm text-red-500">{form.formState.errors.password.message}</span>}
          </div>

          {/* Confirm Password */}
          <div className="flex flex-col gap-[2px]">
            <label className="text-[14px] font-bold text-white leading-[28px] tracking-[-0.02em] font-['SF_Pro']">Confirm Password</label>
            <div className="relative flex items-center w-full h-[48px] p-[8px_16px] gap-[8px] bg-[#0A0D12] border border-[#181D27] rounded-[12px] focus-within:border-[#7F51F9] transition-colors">
              <input
                {...form.register("confirmPassword")}
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Enter your confirm password"
                className="w-full bg-transparent text-[16px] text-white leading-[30px] tracking-[-0.02em] placeholder:text-[#535862] outline-none pr-8 font-['SF_Pro']"
              />
              <button 
                type="button" 
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-[16px] flex items-center justify-center text-[#717680] hover:text-[#FDFDFD] transition-colors cursor-pointer"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {form.formState.errors.confirmPassword && <span className="text-sm text-red-500">{form.formState.errors.confirmPassword.message}</span>}
          </div>

          {/* Button & Links */}
          <div className="flex flex-col gap-[16px] w-full mt-2">
            <button 
              type="submit"
              disabled={isLoading}
              className="flex justify-center items-center w-full h-[48px] p-[8px] gap-[8px] bg-[#6936F2] hover:bg-[#522BC8] disabled:opacity-50 disabled:cursor-not-allowed rounded-[100px] text-[16px] font-bold text-white leading-[30px] tracking-[-0.02em] font-['SF_Pro'] transition-colors cursor-pointer"
            >
              {isLoading ? 'Submitting...' : 'Submit'}
            </button>

            <div className="flex justify-center items-center gap-[4px] h-[30px]">
              <span className="text-[14px] md:text-[16px] font-semibold text-white leading-[28px] md:leading-[30px] tracking-[-0.02em] font-['SF_Pro']">
                Already have an account?
              </span>
              <Link href="/login" className="text-[14px] md:text-[16px] font-bold text-[#7F51F9] leading-[28px] md:leading-[30px] tracking-[-0.01em] font-['SF_Pro'] hover:underline">
                Log in
              </Link>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
}