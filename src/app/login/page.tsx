'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import Image from 'next/image';
import axios from 'axios';
import { toast } from 'sonner';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useMutation } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { setCredentials } from '@/store/authSlice';
import { loginSchema, LoginFormData } from '@/lib/validations/auth'; 


export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    }
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormData) => {
      const response = await api.post('/auth/login', data);
      return response.data?.data; 
    },
    onSuccess: (data) => {
      dispatch(setCredentials({
        user: data.user,
        token: data.token
      }));
      toast.success("Welcome Back! Login Berhasil.");
      router.push('/');
    },
    onError: (error: unknown) => {
      let message = "Login gagal, cek kembali email/password";
      if (axios.isAxiosError(error)) {
        message = error.response?.data?.message || message;
      }
      toast.error(message);
    }
  });
  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
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
        <div className="flex flex-col items-center gap-[16px] w-full">
          <div className="flex items-center gap-[11px]">
            <Image src="/assets/Logo.svg" alt="Sociality Logo" width={30} height={30} />
            <h1 className="text-[24px] font-bold text-[#FDFDFD] leading-[36px] font-['SF_Pro']">Sociality</h1>
          </div>
          <h2 className="text-[20px] md:text-[24px] font-bold text-[#FDFDFD] leading-[34px] md:leading-[36px] font-['SF_Pro'] text-center">Welcome Back!</h2>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="w-[313px] md:w-[398px] flex flex-col gap-[20px]">
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
            {form.formState.errors.email && (
              <span className="text-[14px] font-medium text-[#B41759] mt-1">{form.formState.errors.email.message}</span>
            )}
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
            {form.formState.errors.password && (
              <span className="text-[14px] font-medium text-[#B41759] mt-1">{form.formState.errors.password.message}</span>
            )}
          </div>

          <div className="flex flex-col gap-[16px] w-full">
            <button 
              type="submit"
              disabled={loginMutation.isPending}
              className={`flex justify-center items-center w-full h-[44px] md:h-[48px] p-[8px] gap-[8px] rounded-[100px] text-[16px] font-bold text-[#FDFDFD] leading-[30px] tracking-[-0.02em] font-['SF_Pro'] transition-all cursor-pointer ${loginMutation.isPending ? 'bg-[#181D27] text-[#A4A7AE] cursor-not-allowed' : 'bg-[#6936F2] hover:bg-[#522BC8] hover:shadow-[0_0_17px_rgba(105,54,242,0.6)]'}`}
            >
              {loginMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Login'}
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