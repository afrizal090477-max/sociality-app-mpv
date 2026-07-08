'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import Image from 'next/image';
import axios from 'axios';
import axiosInstance from '@/lib/axios';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.post('/auth/login', {
        email: data.email,
        password: data.password,
      });

      localStorage.setItem('token', response.data.data.token);
      toast.success("Welcome Back! Login Berhasil.");
      window.location.assign('/');
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || "Login gagal, cek kembali email/password";
        toast.error(message);
      } else {
        toast.error("Terjadi kesalahan yang tidak diketahui");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="relative flex min-h-screen w-full items-center justify-center py-[40px] px-6"
      style={{
        backgroundImage: "url('/assets/Gradient.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat"
      }}
    >
      <div className="z-10 flex flex-col items-center w-[345px] md:w-[446px] p-[32px_16px] md:p-[40px_24px] gap-[16px] md:gap-[24px] bg-[rgba(10,13,18,0.2)] border border-[#181D27] rounded-[16px] backdrop-blur-[20px] shadow-2xl">
        
        {/* Logo & Title */}
        <div className="flex flex-col items-center gap-[16px] w-full">
          <div className="flex items-center gap-[11px]">
            <Image src="/assets/Logo.svg" alt="Sociality Logo" width={30} height={30} />
            <h1 className="text-[24px] font-bold text-[#FDFDFD] leading-[36px] font-['SF_Pro']">Sociality</h1>
          </div>
          <h2 className="text-[20px] md:text-[24px] font-bold text-[#FDFDFD] leading-[34px] md:leading-[36px] font-['SF_Pro'] text-center">Welcome Back!</h2>
        </div>

        {/* Form */}
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-[313px] md:w-[398px] flex flex-col gap-[20px]">
          
          {/* Email */}
          <div className="flex flex-col gap-[2px] w-full">
            <label className="text-[14px] font-bold text-[#FFFFFF] leading-[28px] tracking-[-0.02em] font-['SF_Pro']">Email</label>
            <div className="flex items-center w-full h-[48px] p-[8px_16px] gap-[8px] bg-[#0A0D12] border border-[#181D27] rounded-[12px] focus-within:border-[#7F51F9] transition-colors">
              <input
                {...form.register("email")}
                type="email"
                placeholder="Enter your email"
                className="w-full bg-transparent text-[16px] text-[#FFFFFF] leading-[30px] tracking-[-0.02em] placeholder:text-[#535862] outline-none font-['SF_Pro']"
              />
            </div>
            {form.formState.errors.email && (
              <span className="text-sm text-red-500 mt-1">{form.formState.errors.email.message}</span>
            )}
          </div>

          {/* Password */}
          <div className="flex flex-col gap-[2px] w-full">
            <label className="text-[14px] font-bold text-[#FFFFFF] leading-[28px] tracking-[-0.02em] font-['SF_Pro']">Password</label>
            <div className="relative flex items-center w-full h-[48px] p-[8px_16px] gap-[8px] bg-[#0A0D12] border border-[#181D27] rounded-[12px] focus-within:border-[#7F51F9] transition-colors">
              <input
                {...form.register("password")}
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="w-full bg-transparent text-[16px] text-[#FFFFFF] leading-[30px] tracking-[-0.02em] placeholder:text-[#535862] outline-none pr-8 font-['SF_Pro']"
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-[16px] flex items-center justify-center text-[#717680] hover:text-[#FDFDFD] transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {form.formState.errors.password && (
              <span className="text-sm text-red-500 mt-1">{form.formState.errors.password.message}</span>
            )}
          </div>

          {/* Button & Links */}
          <div className="flex flex-col gap-[16px] w-full">
            <button 
              type="submit"
              disabled={isLoading}
              className="flex justify-center items-center w-full h-[44px] md:h-[48px] p-[8px] gap-[8px] bg-[#6936F2] hover:bg-[#522BC8] disabled:opacity-50 disabled:cursor-not-allowed rounded-[100px] text-[16px] font-bold text-[#FDFDFD] leading-[30px] tracking-[-0.02em] font-['SF_Pro'] transition-all hover:shadow-[0_0_17px_rgba(105,54,242,0.6)] cursor-pointer"
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>

            <div className="flex justify-center items-center gap-[4px] h-[28px] md:h-[30px]">
              <span className="text-[14px] md:text-[16px] font-semibold text-[#FDFDFD] leading-[28px] md:leading-[30px] tracking-[-0.02em] font-['SF_Pro']">
                Don&apos;t have an account?
              </span>
              <Link href="/register" className="text-[14px] md:text-[16px] font-bold text-[#7F51F9] leading-[28px] md:leading-[30px] tracking-[-0.01em] md:tracking-[-0.02em] font-['SF_Pro'] hover:underline">
                Register
              </Link>
            </div>
          </div>
          
        </form>
      </div>
    </div>
  );
}