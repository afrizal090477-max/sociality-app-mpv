'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowLeft, UploadCloud, Loader2 } from 'lucide-react';
import axiosInstance from '@/lib/axios';
import { Toast } from '@/components/ui/Toast'; 


export default function AddPostPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const triggerToast = (message: string, type: 'success' | 'error' = 'error') => {
    setToastMsg(message);
    setToastType(type);
    setShowToast(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('Ukuran file maksimal 5MB.');
      triggerToast('Ukuran file maksimal 5MB.', 'error');
      return;
    }
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(selectedFile.type)) {
      setError('Format file harus JPG, PNG, atau WEBP.');
      triggerToast('Format file tidak didukung.', 'error');
      return;
    }
    setError(null);
    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      const event = { target: { files: [droppedFile] } } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleFileChange(event);
    }
  };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };
  const handleSubmit = async () => {
    if (!file) {
      setError('Foto wajib diunggah!');
      triggerToast('Foto tidak boleh kosong.', 'error');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    const formData = new FormData();
    formData.append('image', file);
    if (caption.trim()) {
      formData.append('caption', caption.trim());
    }
    try {
      await axiosInstance.post('/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      triggerToast('Postingan berhasil dibuat!', 'success');
      if (previewUrl) URL.revokeObjectURL(previewUrl); 
      setTimeout(() => {
        router.push('/');
        router.refresh();
      }, 1500);
    } catch (err) {
      console.error('Failed to create post:', err);
      setError('Gagal membuat postingan. Coba lagi.');
      triggerToast('Gagal membuat postingan.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] text-white font-['SF_Pro'] relative pb-[100px] md:pb-0">
      {showToast && (
        <Toast 
          message={toastMsg} 
          type={toastType} 
          onClose={() => setShowToast(false)} 
        />
      )}
      <div className="sticky top-0 z-50 flex flex-row items-center px-[16px] md:px-[120px] h-[64px] md:h-[80px] bg-[#000000] border-b border-[#181D27]">
        <div className="flex items-center w-full max-w-[452px] mx-auto relative justify-center md:justify-start">
          <button 
            onClick={() => router.back()} 
            className="absolute left-0 p-1 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <ArrowLeft className="w-[24px] h-[24px] md:w-[32px] md:h-[32px] text-[#FDFDFD]" />
          </button>
          <span className="text-[16px] md:text-[24px] font-bold text-[#FDFDFD] md:ml-[50px]">
            Add Post
          </span>
        </div>
      </div>

      <div className="flex flex-col items-center w-full max-w-[452px] mx-auto pt-[24px] px-[16px] md:px-0 gap-[16px]">
        <div className="flex flex-col w-full gap-[2px]">
          <label className="text-[14px] font-bold text-[#FDFDFD] leading-[28px] tracking-[-0.02em]">
            Photo <span className="text-[#B41759]">*</span>
          </label>
          <div 
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className={`flex flex-col items-center justify-center p-[16px] w-full min-h-[144px] bg-[#0A0D12] rounded-[12px] cursor-pointer transition-colors overflow-hidden relative border border-dashed ${error && !file ? 'border-[#B41759]' : 'border-[#181D27] hover:bg-[#181D27]'}`}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/png, image/jpeg, image/webp" 
              className="hidden" 
            />
            {previewUrl ? (
              <div className="relative w-full aspect-square md:w-[404px] md:h-[404px] rounded-[8px] overflow-hidden">
                <Image src={previewUrl} alt="Preview" fill className="object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white font-bold text-[14px]">Click to change image</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-[12px]">
                <div className="w-[40px] h-[40px] border border-[#181D27] rounded-[8px] flex items-center justify-center">
                  <UploadCloud className="w-[20px] h-[20px] text-[#FDFDFD]" />
                </div>
                <div className="flex flex-col items-center gap-[4px]">
                  <p className="text-[14px] text-[#535862] font-medium leading-[28px] tracking-[-0.02em]">
                    <span className="text-[#7F51F9] font-bold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-[14px] text-[#535862] font-medium leading-[28px] tracking-[-0.02em] text-center">
                    SVG, PNG, JPG or WEBP (max. 5MB)
                  </p>
                </div>
              </div>
            )}
          </div>
          {error && !file && (
            <span className="text-[14px] text-[#B41759] font-medium leading-[28px] tracking-[-0.03em]">
              {error}
            </span>
          )}
        </div>

        <div className="flex flex-col w-full gap-[2px]">
          <label className="text-[14px] font-bold text-[#FDFDFD] leading-[28px] tracking-[-0.02em]">
            Caption
          </label>
          <div className={`flex w-full bg-[#0A0D12] border rounded-[12px] p-[8px] px-[16px] ${error && caption.length > 500 ? 'border-[#B41759]' : 'border-[#181D27]'}`}>
            <textarea 
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Create your caption"
              rows={4}
              className="w-full bg-transparent border-none outline-none text-[14px] md:text-[16px] text-[#FDFDFD] font-normal leading-[30px] tracking-[-0.02em] placeholder-[#535862] resize-none"
            />
          </div>
        </div>

        <button 
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`mt-[8px] flex justify-center items-center w-full h-[40px] md:h-[48px] rounded-[100px] transition-colors cursor-pointer ${!file || isSubmitting ? 'bg-[#181D27] text-[#A4A7AE] cursor-not-allowed' : 'bg-[#6936F2] hover:bg-[#522BC8] text-[#FDFDFD]'}`}
        >
          {isSubmitting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <span className="text-[14px] md:text-[16px] font-bold leading-[30px] tracking-[-0.02em]">
              Share
            </span>
          )}
        </button>
      </div>
    </div>
  );
}