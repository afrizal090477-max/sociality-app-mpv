'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import axiosInstance from '@/lib/axios';
import { toast } from 'sonner';
import { PostCard, PostType } from '@/components/features/PostCard';

export default function PostDetail() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;

  const [post, setPost] = useState<PostType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPostDetail = async () => {
      try {
        // Tembak API detail post Mas Henry
        const response = await axiosInstance.get(`/posts/${id}`);
        const item = response.data?.data?.post || response.data?.data;

        if (item) {
          const formattedPost: PostType = {
            id: item.id,
            user: {
              username: item.author?.username || 'Unknown',
              avatarUrl: item.author?.avatarUrl || null,
            },
            imageUrl: item.imageUrl,
            caption: item.caption || "",
            likesCount: item.likeCount || 0,
            commentsCount: item.commentCount || 0,
            sharesCount: 0,
            createdAt: new Date(item.createdAt).toLocaleDateString('id-ID', {
              day: 'numeric', month: 'long', year: 'numeric'
            }),
            isLiked: item.likedByMe || false,
            isSaved: item.savedByMe || true, // Default true karena kalau diakses dari tab Saved pasti udah tersimpan
          };
          setPost(formattedPost);
        }
      } catch (error) {
        console.error("Gagal mengambil detail postingan:", error);
        toast.error("Gagal memuat postingan");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchPostDetail();
    }
  }, [id]);

  return (
    <div className="min-h-screen bg-[#000000] text-white font-['SF_Pro'] pb-[100px] md:pb-[40px]">
      {/* Header Mobile dengan tombol Back */}
      <div className="sticky top-0 z-50 flex flex-row items-center px-[16px] h-[64px] bg-[#000000] border-b border-[#181D27] md:hidden">
        <button onClick={() => router.back()} className="p-1 cursor-pointer">
          <ArrowLeft className="w-[24px] h-[24px] text-[#FDFDFD]" />
        </button>
        <span className="flex-1 text-[16px] font-bold text-[#FDFDFD] text-center ml-[-32px]">
          Post
        </span>
      </div>

      <div className="flex flex-col items-center w-full max-w-[812px] mx-auto pt-[16px] md:pt-[40px] px-[16px] md:px-0">
        
        {/* Tombol Back Desktop */}
        <div className="hidden md:flex w-full mb-[24px]">
          <button 
            onClick={() => router.back()} 
            className="flex items-center gap-[8px] text-[#A4A7AE] hover:text-[#FDFDFD] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-[20px] h-[20px]" />
            <span className="text-[16px] font-bold">Back to Profile</span>
          </button>
        </div>

        {/* Loading State & Render PostCard */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20 w-full">
            <Loader2 className="w-8 h-8 text-[#7F51F9] animate-spin" />
          </div>
        ) : post ? (
          <PostCard post={post} />
        ) : (
          <div className="text-center text-[#A4A7AE] mt-20">
            Postingan tidak ditemukan.
          </div>
        )}
      </div>
    </div>
  );
}