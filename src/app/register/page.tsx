'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'sonner';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useMutation } from '@tanstack/react-query';


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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterForm) => {
      const response = await api.post('/auth/register', {
        name: data.name,
        username: data.username,
        phone: data.phone,
        email: data.email,
        password: data.password,
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Registrasi Berhasil! Silakan Login.");
      router.push('/login'); 
    },
    onError: (error: unknown) => {
      let message = "Gagal Register, cek kembali data lu.";
      if (axios.isAxiosError(error)) {
        message = error.response?.data?.message || message;
      }
      toast.error(message);
    }
  });
  const onSubmit = (data: RegisterForm) => {
    registerMutation.mutate(data);
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
      <div className="z-10 flex flex-col items-center w-[345px] md:w-[523px] p-[32px_16px] md:p-[40px_24px] gap-[16px] md:gap-[24px] bg-[rgba(10,13,18,0.2)] border border-[#181D27] rounded-[16px] backdrop-blur-[50px] shadow-2xl">
        <div className="flex flex-col items-center gap-[16px] w-full">
          <div className="flex items-center gap-[11px]">
            <Image src="/assets/Logo.svg" alt="Sociality Logo" width={30} height={30} />
            <h1 className="text-[24px] font-bold text-[#FDFDFD] leading-[36px] font-['SF_Pro']">Sociality</h1>
          </div>
          <h2 className="text-[24px] font-bold text-[#FDFDFD] leading-[36px] font-['SF_Pro'] text-center">Register</h2>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="w-[313px] md:w-[475px] flex flex-col gap-[16px] md:gap-[20px]">
          <div className="flex flex-col gap-[2px] w-full">
            <label className="text-[14px] font-bold text-[#FFFFFF] leading-[28px] tracking-[-0.02em] font-['SF_Pro']">Name</label>
            <div className={`flex items-center w-full h-[48px] p-[8px_16px] gap-[8px] bg-[#0A0D12] border rounded-[12px] transition-colors ${form.formState.errors.name ? 'border-[#B41759]' : 'border-[#181D27] focus-within:border-[#7F51F9]'}`}>
              <input
                {...form.register("name")}
                placeholder="Enter your name"
                className="w-full bg-transparent text-[16px] text-[#FFFFFF] leading-[30px] tracking-[-0.02em] placeholder:text-[#535862] outline-none font-['SF_Pro']"
              />
            </div>
            {form.formState.errors.name && <span className="text-[14px] font-medium text-[#B41759] mt-1">{form.formState.errors.name.message}</span>}
          </div>

          <div className="flex flex-col gap-[2px] w-full">
            <label className="text-[14px] font-bold text-[#FFFFFF] leading-[28px] tracking-[-0.02em] font-['SF_Pro']">Username</label>
            <div className={`flex items-center w-full h-[48px] p-[8px_16px] gap-[8px] bg-[#0A0D12] border rounded-[12px] transition-colors ${form.formState.errors.username ? 'border-[#B41759]' : 'border-[#181D27] focus-within:border-[#7F51F9]'}`}>
              <input
                {...form.register("username")}
                placeholder="Enter your username"
                className="w-full bg-transparent text-[16px] text-[#FFFFFF] leading-[30px] tracking-[-0.02em] placeholder:text-[#535862] outline-none font-['SF_Pro']"
              />
            </div>
            {form.formState.errors.username && <span className="text-[14px] font-medium text-[#B41759] mt-1">{form.formState.errors.username.message}</span>}
          </div>

          <div className="flex flex-col gap-[2px] w-full">
            <label className="text-[14px] font-bold text-[#FFFFFF] leading-[28px] tracking-[-0.02em] font-['SF_Pro']">Number Phone</label>
            <div className={`flex items-center w-full h-[48px] p-[8px_16px] gap-[8px] bg-[#0A0D12] border rounded-[12px] transition-colors ${form.formState.errors.phone ? 'border-[#B41759]' : 'border-[#181D27] focus-within:border-[#7F51F9]'}`}>
              <input
                {...form.register("phone")}
                type="tel"
                placeholder="Enter your number phone"
                className="w-full bg-transparent text-[16px] text-[#FFFFFF] leading-[30px] tracking-[-0.02em] placeholder:text-[#535862] outline-none font-['SF_Pro']"
              />
            </div>
            {form.formState.errors.phone && <span className="text-[14px] font-medium text-[#B41759] mt-1">{form.formState.errors.phone.message}</span>}
          </div>

          <div className="flex flex-col gap-[2px] w-full">
            <label className="text-[14px] font-bold text-[#FFFFFF] leading-[28px] tracking-[-0.02em] font-['SF_Pro']">Email</label>
            <div className={`flex items-center w-full h-[48px] p-[8px_16px] gap-[8px] bg-[#0A0D12] border rounded-[12px] transition-colors ${form.formState.errors.email ? 'border-[#B41759]' : 'border-[#181D27] focus-within:border-[#7F51F9]'}`}>
              <input
                {...form.register("email")}
                type="email"
                placeholder="Enter your email"
                className="w-full bg-transparent text-[16px] text-[#FFFFFF] leading-[30px] tracking-[-0.02em] placeholder:text-[#535862] outline-none font-['SF_Pro']"
              />
            </div>
            {form.formState.errors.email && <span className="text-[14px] font-medium text-[#B41759] mt-1">{form.formState.errors.email.message}</span>}
          </div>

          <div className="flex flex-col gap-[2px] w-full">
            <label className="text-[14px] font-bold text-[#FFFFFF] leading-[28px] tracking-[-0.02em] font-['SF_Pro']">Password</label>
            <div className={`relative flex items-center w-full h-[48px] p-[8px_16px] gap-[8px] bg-[#0A0D12] border rounded-[12px] transition-colors ${form.formState.errors.password ? 'border-[#B41759]' : 'border-[#181D27] focus-within:border-[#7F51F9]'}`}>
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
            {form.formState.errors.password && <span className="text-[14px] font-medium text-[#B41759] mt-1">{form.formState.errors.password.message}</span>}
          </div>

          <div className="flex flex-col gap-[2px] w-full">
            <label className="text-[14px] font-bold text-[#FFFFFF] leading-[28px] tracking-[-0.02em] font-['SF_Pro']">Confirm Password</label>
            <div className={`relative flex items-center w-full h-[48px] p-[8px_16px] gap-[8px] bg-[#0A0D12] border rounded-[12px] transition-colors ${form.formState.errors.confirmPassword ? 'border-[#B41759]' : 'border-[#181D27] focus-within:border-[#7F51F9]'}`}>
              <input
                {...form.register("confirmPassword")}
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Enter your confirm password"
                className="w-full bg-transparent text-[16px] text-[#FFFFFF] leading-[30px] tracking-[-0.02em] placeholder:text-[#535862] outline-none pr-8 font-['SF_Pro']"
              />
              <button 
                type="button" 
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-[16px] flex items-center justify-center text-[#717680] hover:text-[#FDFDFD] transition-colors cursor-pointer"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {form.formState.errors.confirmPassword && <span className="text-[14px] font-medium text-[#B41759] mt-1">{form.formState.errors.confirmPassword.message}</span>}
          </div>

          <div className="flex flex-col gap-[16px] w-full mt-2">
            <button 
              type="submit"
              disabled={registerMutation.isPending}
              className={`flex justify-center items-center w-full h-[48px] p-[8px] gap-[8px] rounded-[100px] text-[16px] font-bold text-[#FDFDFD] leading-[30px] tracking-[-0.02em] font-['SF_Pro'] transition-colors cursor-pointer ${registerMutation.isPending ? 'bg-[#181D27] text-[#A4A7AE] cursor-not-allowed' : 'bg-[#6936F2] hover:bg-[#522BC8] hover:shadow-[0_0_17px_rgba(105,54,242,0.6)]'}`}
            >
              {registerMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit'}
            </button>

            <div className="flex justify-center items-center gap-[4px] h-[30px]">
              <span className="text-[14px] md:text-[16px] font-semibold text-[#FDFDFD] leading-[28px] md:leading-[30px] tracking-[-0.02em] font-['SF_Pro']">
                Already have an account?
              </span>
              <Link href="/login" className="text-[14px] md:text-[16px] font-bold text-[#7F51F9] leading-[28px] md:leading-[30px] tracking-[-0.01em] font-['SF_Pro'] hover:underline">
                Login
              </Link>
            </div>
          </div>
          
        </form>
      </div>
    </div>
  );
}