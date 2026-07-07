'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation'; // <-- Tambahan untuk redirect
import axios from 'axios'; // <-- Tambahan untuk cek tipe error
import axiosInstance from '@/lib/axios'; // <-- Tambahan kurir API kita

const registerSchema = z.object({
  name: z.string().min(2, "Nama terlalu pendek"),
  username: z.string().min(3, "Username minimal 3 karakter"),
  phone: z.string().min(9, "Nomor telepon tidak valid"),
  
  // RAHASIANYA DI SINI BRO, TAMBAHIN BARIS INI:
  email: z.string().email("Email tidak valid"), 
  
  password: z.string().min(6, "Password minimal 6 karakter"),
  confirmPassword: z.string().min(6, "Password minimal 6 karakter"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Password tidak sama",
  path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter(); // <-- Inisialisasi router

  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    try {
      // Kita susun payload-nya secara manual aja, ini lebih aman 
      // dan disukai sama TypeScript/ESLint (nggak ada variabel nganggur)
      const payload = {
        name: data.name,
        username: data.username,
        phone: data.phone,
        email: data.email,
        password: data.password,
      };
      
      // Tembak API Register pakai payload yang udah bersih
      await axiosInstance.post('/auth/register', payload);
      
      alert("Registrasi Berhasil! Silakan Login.");
      router.push('/login'); // Redirect ke login kalau sukses
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || "Gagal Register, silakan cek kembali data lu.";
        alert(message);
      } else {
        alert("Terjadi kesalahan yang tidak diketahui");
      }
    }
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-black py-[40px] md:py-0 overflow-x-hidden">
      
      {/* ==================== GRADIENT GLOW (PERFECT U-SHAPE) ==================== */}
      {/* Fix: Menggunakan 'fixed' agar gradasi tetap di tempat saat halaman di-scroll */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        
        {/* 1. Pilar Kiri */}
        <div 
          className="absolute -bottom-[20%] -left-[20%] w-[80vw] h-[85vh] rounded-full"
          style={{
            background: 'linear-gradient(230.59deg, #AC88FF 33.13%, #AD3AE7 63.19%)',
            filter: 'blur(160px)',
            opacity: 0.7
          }}
        />

        {/* 2. Pilar Kanan */}
        <div 
          className="absolute -bottom-[20%] -right-[20%] w-[80vw] h-[85vh] rounded-full"
          style={{
            background: 'linear-gradient(270deg, #5613A3 38.99%, #522BC8 77.96%)',
            filter: 'blur(160px)',
            opacity: 0.7
          }}
        />

        {/* 3. Penambal Dasar (Membentuk U Sempurna) */}
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
            <Image 
              src="/assets/Logo.svg" 
              alt="Sociality Logo" 
              width={30} 
              height={30} 
            />
            <h1 className="text-[24px] font-bold text-white leading-[36px] font-['SF_Pro']">Sociality</h1>
          </div>
          <h2 className="text-[24px] font-bold text-white leading-[36px] font-['SF_Pro'] text-center">Register</h2>
        </div>

        {/* Form */}
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full md:w-[475px] flex flex-col gap-[20px]">
          
          {/* Name */}
          <div className="flex flex-col gap-[2px]">
            <label className="text-[14px] font-bold text-white leading-[28px] tracking-[-0.02em] font-['SF_Pro']">Name</label>
            <div className="flex items-center w-full h-[48px] p-[8px_16px] gap-[8px] bg-[#0A0D12] border border-[#181D27] rounded-[12px]">
              <input
                {...form.register("name")}
                placeholder="Enter your name"
                className="w-full bg-transparent text-[16px] text-white leading-[30px] tracking-[-0.02em] placeholder:text-[#535862] outline-none font-['SF_Pro']"
              />
            </div>
          </div>

          {/* Username */}
          <div className="flex flex-col gap-[2px]">
            <label className="text-[14px] font-bold text-white leading-[28px] tracking-[-0.02em] font-['SF_Pro']">Username</label>
            <div className="flex items-center w-full h-[48px] p-[8px_16px] gap-[8px] bg-[#0A0D12] border border-[#181D27] rounded-[12px]">
              <input
                {...form.register("username")}
                placeholder="Enter your username"
                className="w-full bg-transparent text-[16px] text-white leading-[30px] tracking-[-0.02em] placeholder:text-[#535862] outline-none font-['SF_Pro']"
              />
            </div>
          </div>

          {/* Number Phone */}
          <div className="flex flex-col gap-[2px]">
            <label className="text-[14px] font-bold text-white leading-[28px] tracking-[-0.02em] font-['SF_Pro']">Number Phone</label>
            <div className="flex items-center w-full h-[48px] p-[8px_16px] gap-[8px] bg-[#0A0D12] border border-[#181D27] rounded-[12px]">
              <input
                {...form.register("phone")}
                type="tel"
                placeholder="Enter your number phone"
                className="w-full bg-transparent text-[16px] text-white leading-[30px] tracking-[-0.02em] placeholder:text-[#535862] outline-none font-['SF_Pro']"
              />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-[2px]">
            <label className="text-[14px] font-bold text-white leading-[28px] tracking-[-0.02em] font-['SF_Pro']">Password</label>
            <div className="relative flex items-center w-full h-[48px] p-[8px_16px] gap-[8px] bg-[#0A0D12] border border-[#181D27] rounded-[12px]">
              <input
                {...form.register("password")}
                type="password"
                placeholder="Enter your password"
                className="w-full bg-transparent text-[16px] text-white leading-[30px] tracking-[-0.02em] placeholder:text-[#535862] outline-none pr-8 font-['SF_Pro']"
              />
              <div className="absolute right-[16px] top-[18px] w-[16.4px] h-[11.6px] border-[1.67px] border-[#717680] rounded-[2px]" />
            </div>
          </div>

          {/* Confirm Password */}
          <div className="flex flex-col gap-[2px]">
            <label className="text-[14px] font-bold text-white leading-[28px] tracking-[-0.02em] font-['SF_Pro']">Confirm Password</label>
            <div className="relative flex items-center w-full h-[48px] p-[8px_16px] gap-[8px] bg-[#0A0D12] border border-[#181D27] rounded-[12px]">
              <input
                {...form.register("confirmPassword")}
                type="password"
                placeholder="Enter your confirm password"
                className="w-full bg-transparent text-[16px] text-white leading-[30px] tracking-[-0.02em] placeholder:text-[#535862] outline-none pr-8 font-['SF_Pro']"
              />
              <div className="absolute right-[16px] top-[18px] w-[16.4px] h-[11.6px] border-[1.67px] border-[#717680] rounded-[2px]" />
            </div>
          </div>

          {/* Button */}
          <div className="flex flex-col gap-[16px] w-full mt-2">
            <button 
              type="submit"
              className="flex justify-center items-center w-full h-[48px] p-[8px] gap-[8px] bg-[#6936F2] hover:bg-[#522BC8] rounded-[100px] text-[16px] font-bold text-white leading-[30px] tracking-[-0.02em] font-['SF_Pro'] transition-colors"
            >
              Submit
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