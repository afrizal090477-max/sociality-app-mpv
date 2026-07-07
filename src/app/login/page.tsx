'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import axiosInstance from '@/lib/axios';

const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      const response = await axiosInstance.post('/auth/login', {
        email: data.email,
        password: data.password,
      });

      localStorage.setItem('token', response.data.token);
      alert("Login Berhasil!");
      router.push('/'); // Sesuaikan tujuan redirect setelah login sukses
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || "Login gagal, cek kembali email/password";
        alert(message);
      } else {
        alert("Terjadi kesalahan yang tidak diketahui");
      }
    }
  };

  return (
    // Background Hitam Pekat
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#000000]">
      
      {/* ==================== GRADIENT GLOW (Figma Exact Vibe) ==================== */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Layer 1: Ungu Gelap (Base) menyebar dari bawah */}
        <div 
          className="absolute bottom-[-40%] left-[-10%] w-[120%] h-[80%] rounded-[100%]"
          style={{
            background: 'linear-gradient(270deg, #5613A3 38.99%, #522BC8 77.96%)',
            filter: 'blur(150px)', 
            opacity: 0.8
          }}
        />
        {/* Layer 2: Ungu Terang (Highlight) di tengah bawah */}
        <div 
          className="absolute bottom-[-30%] left-[10%] w-[80%] h-[60%] rounded-[100%]"
          style={{
            background: 'linear-gradient(230.59deg, #AC88FF 33.13%, #AD3AE7 63.19%)',
            filter: 'blur(120px)',
            opacity: 0.6
          }}
        />
      </div>

      {/* ==================== LOGIN CARD ==================== */}
      <div className="z-10 flex flex-col items-center w-[446px] p-[40px_24px] gap-[24px] bg-[rgba(0,0,0,0.2)] border border-[#181D27] rounded-[16px] backdrop-blur-[40px]">
        
        {/* Logo & Title */}
        <div className="flex flex-col items-center gap-[16px] w-full">
          <div className="flex items-center gap-[11px]">
            <Image 
              src="/assets/Logo.svg" 
              alt="Sociality Logo" 
              width={30} 
              height={30} 
            />
            <h1 className="text-[24px] font-bold text-[#FDFDFD] leading-[36px] font-['SF_Pro']">Sociality</h1>
          </div>
          <h2 className="text-[24px] font-bold text-[#FDFDFD] leading-[36px] font-['SF_Pro']">Welcome Back!</h2>
        </div>

        {/* Form */}
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-[398px] flex flex-col gap-[20px]">
          
          {/* Email */}
          <div className="flex flex-col gap-[2px]">
            <label className="text-[14px] font-bold text-[#FFFFFF] leading-[28px] tracking-[-0.02em] font-['SF_Pro']">Email</label>
            <div className="flex items-center w-full h-[48px] p-[8px_16px] gap-[8px] bg-[#0A0D12] border border-[#181D27] rounded-[12px]">
              <input
                {...form.register("email")}
                type="email"
                placeholder="Enter your email"
                className="w-full bg-transparent text-[16px] text-[#FFFFFF] leading-[30px] tracking-[-0.02em] placeholder:text-[#535862] outline-none font-['SF_Pro']"
              />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-[2px]">
            <label className="text-[14px] font-bold text-[#FFFFFF] leading-[28px] tracking-[-0.02em] font-['SF_Pro']">Password</label>
            <div className="relative flex items-center w-full h-[48px] p-[8px_16px] gap-[8px] bg-[#0A0D12] border border-[#181D27] rounded-[12px]">
              <input
                {...form.register("password")}
                type="password"
                placeholder="Enter your password"
                className="w-full bg-transparent text-[16px] text-[#FFFFFF] leading-[30px] tracking-[-0.02em] placeholder:text-[#535862] outline-none pr-8 font-['SF_Pro']"
              />
              {/* Eye Icon Shape */}
              <div className="absolute right-[16px] top-[18px] w-[16.4px] h-[11.6px] border-[1.67px] border-[#717680] rounded-[2px]" />
            </div>
          </div>

          {/* Button & Links */}
          <div className="flex flex-col gap-[16px] w-[398px]">
            <button 
              type="submit"
              className="flex justify-center items-center w-full h-[48px] p-[8px] gap-[8px] bg-[#6936F2] hover:bg-[#522BC8] rounded-[100px] text-[16px] font-bold text-[#FDFDFD] leading-[30px] tracking-[-0.02em] font-['SF_Pro'] transition-colors"
            >
              Login
            </button>

            <div className="flex justify-center items-center gap-[4px] h-[30px]">
              <span className="text-[16px] font-semibold text-[#FDFDFD] leading-[30px] tracking-[-0.02em] font-['SF_Pro']">
                Don&apos;t have an account?
              </span>
              <Link href="/register" className="text-[16px] font-bold text-[#7F51F9] leading-[30px] tracking-[-0.02em] font-['SF_Pro'] hover:underline">
                Register
              </Link>
            </div>
          </div>
          
        </form>

      </div>
    </div>
  );
}