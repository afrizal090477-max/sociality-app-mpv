"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, UploadCloud, X, User } from "lucide-react";
import { api } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useForm, FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";


const addPostSchema = z.object({
  caption: z.string().optional(),
  photo: z.custom<File>()
    .refine((file) => file !== undefined && file !== null, "Photo is required")
    .refine((file) => file instanceof File, "Format foto tidak didukung.")
    .refine((file) => file?.size <= 5 * 1024 * 1024, "Ukuran foto maksimal 5MB.")
    .refine(
      (file) => ["image/jpeg", "image/png", "image/webp", "image/svg+xml"].includes(file?.type),
      "Format foto tidak didukung."
    ),
});

type AddPostForm = z.infer<typeof addPostSchema>;

export default function AddPostPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const { user } = useSelector((state: RootState) => state.auth);
  const userAvatar = user?.avatarUrl || null;

  // 🚀 FIX 3: Gak usah pakai watch()! React Compiler lu bakal sujud syukur.
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<AddPostForm>({
    resolver: zodResolver(addPostSchema),
  });

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const triggerToast = (message: string, type: "success" | "error" = "error") => {
    setToastMsg(message);
    setToastType(type);
    setShowToast(true);
  };

  const processFile = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      triggerToast("Ukuran foto maksimal 5MB.", "error");
      return;
    } else if (!["image/jpeg", "image/png", "image/webp", "image/svg+xml"].includes(file.type)) {
      triggerToast("Format foto tidak didukung.", "error");
      return;
    }
    
    setValue("photo", file, { shouldValidate: true });
    if (previewUrl) URL.revokeObjectURL(previewUrl); 
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) processFile(selectedFile);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) processFile(droppedFile);
  };

  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setValue("photo", undefined as unknown as File, { shouldValidate: true });
    
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const postMutation = useMutation({
    mutationFn: async (data: AddPostForm) => {
      const formData = new FormData();
      formData.append("image", data.photo);
      if (data.caption?.trim()) {
        formData.append("caption", data.caption.trim());
      }
      const response = await api.post("/posts", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    },
    onSuccess: () => {
      triggerToast("Success Post", "success");
      queryClient.invalidateQueries({ queryKey: ['myGallery'] });
      queryClient.invalidateQueries({ queryKey: ['myProfile'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] }); 

      setTimeout(() => {
        router.push("/");
      }, 1500);
    },
    onError: (error) => {
      console.error("Failed to add post:", error);
      triggerToast("Gagal mengunggah postingan.", "error");
    },
  });

  const onSubmit = (data: AddPostForm) => {
    postMutation.mutate(data);
  };
  const onInvalid = (formErrors: FieldErrors<AddPostForm>) => {
    if (formErrors.photo) {
      triggerToast(formErrors.photo.message || "Pilih foto terlebih dahulu!", "error");
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

        <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="flex flex-col w-full gap-[16px]">
          <div className="flex flex-col gap-[6px] w-full">
            <label className="text-[14px] font-bold text-[#FDFDFD] leading-[28px] tracking-[-0.02em]">
              Photo
            </label>
            
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => !previewUrl && fileInputRef.current?.click()}
              className={`relative flex flex-col items-center justify-center w-full md:w-[452px] h-[144px] bg-[#0A0D12] rounded-[12px] p-[16px_24px] transition-colors overflow-hidden ${previewUrl ? 'border border-[#181D27]' : `border border-dashed cursor-pointer hover:border-[#7F51F9] ${errors.photo ? 'border-[#B41759]' : 'border-[#181D27]'}`}`}
            >
              {previewUrl ? (
                <>
                  <Image src={previewUrl} alt="Preview" fill className="object-contain bg-black/50" />
                  <button 
                    type="button"
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
            
            {errors.photo?.message && (
              <span className="text-[14px] font-medium text-[#B41759] leading-[28px] tracking-[-0.03em]">
                {errors.photo.message as string}
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

          <div className="flex flex-col gap-[2px] w-full">
            <label className="text-[14px] font-bold text-[#FDFDFD] leading-[28px] tracking-[-0.02em]">
              Caption
            </label>
            <div className={`flex w-full md:w-[452px] h-[101px] bg-[#0A0D12] border rounded-[12px] p-[8px_16px] transition-colors ${errors.caption ? 'border-[#B41759]' : 'border-[#181D27] focus-within:border-[#7F51F9]'}`}>
              <textarea
                {...register("caption")}
                placeholder="Create your caption"
                className="w-full h-full bg-transparent border-none outline-none text-[16px] font-normal text-[#FDFDFD] leading-[30px] tracking-[-0.02em] placeholder-[#535862] resize-none"
              />
            </div>
            {errors.caption?.message && (
              <span className="text-[14px] font-medium text-[#B41759] leading-[28px] tracking-[-0.03em]">
                {errors.caption.message as string}
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={postMutation.isPending}
            className={`flex justify-center items-center w-full md:w-[452px] h-[40px] md:h-[48px] rounded-[100px] transition-colors cursor-pointer shrink-0 mt-[8px] ${postMutation.isPending ? "bg-[#181D27] text-[#A4A7AE] cursor-not-allowed" : "bg-[#6936F2] hover:bg-[#522BC8] text-[#FDFDFD]"}`}
          >
            {postMutation.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <span className="text-[14px] md:text-[16px] font-bold leading-[28px] md:leading-[30px] tracking-[-0.01em] md:tracking-[-0.02em]">
                Share
              </span>
            )}
          </button>
          
        </form>
      </div>
    </div>
  );
}