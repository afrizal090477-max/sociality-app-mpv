'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import axiosInstance from '@/lib/axios';
import { toast } from 'sonner';
import { PostCard, PostType } from '@/components/features/PostCard';


export default function PostDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [post, setPost] = useState<PostType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPostDetail = async () => {
      try {
        const res = await axiosInstance.get(`/posts/${params.id}`);
        // Asumsi struktur response dari GET /posts/{id} mirip dengan GET /feed
        const postData = res.data?.data?.post || res.data?.data || res.data;
        // Mapping data dari API biar klop sama interface PostType di PostCard.tsx
        const mappedPost: PostType = {
          id: postData.id,
          user: {
            username: postData.author?.username || 'unknown',
            avatarUrl: postData.author?.avatarUrl || null,
          },
          imageUrl: postData.imageUrl,
          caption: postData.caption,
          likesCount: postData.likeCount || 0,
          commentsCount: postData.commentCount || 0,
          sharesCount: 0, // API belum nyediain share count
          createdAt: postData.createdAt,
          isLiked: postData.likedByMe || false,
          isSaved: postData.isSaved || false, // Asumsi ada field isSaved dari API
        }; 
        setPost(mappedPost);
      } catch (error) {
        console.error('Failed to fetch post details:', error);
        toast.error('Gagal memuat detail postingan');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPostDetail();
  }, [params.id]);
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#000000] flex justify-center items-center">
        <Loader2 className="w-8 h-8 text-[#7F51F9] animate-spin" />
      </div>
    );
  }
  if (!post) {
    return (
      <div className="min-h-screen bg-[#000000] text-[#FDFDFD] font-['SF_Pro'] flex flex-col justify-center items-center gap-4">
        <p className="text-[16px] font-bold tracking-[-0.02em]">Postingan tidak ditemukan.</p>
        <button onClick={() => router.back()} className="px-4 py-2 bg-[#181D27] rounded-[100px] hover:bg-[#282f3d] transition-colors font-semibold">
          Kembali
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#000000] text-white font-['SF_Pro'] pb-[100px] md:pb-0">
      {/* HEADER TAMPILAN FULL SCREEN */}
      <div className="sticky top-0 z-50 flex flex-row items-center px-[16px] md:px-[120px] h-[64px] md:h-[80px] bg-[#000000] border-b border-[#181D27]">
        <div className="flex items-center w-full max-w-[600px] mx-auto relative justify-center md:justify-start">
          <button onClick={() => router.back()} className="absolute left-0 p-1 cursor-pointer hover:opacity-80 transition-opacity">
            <ArrowLeft className="w-[24px] h-[24px] md:w-[32px] md:h-[32px] text-[#FDFDFD]" />
          </button>
          <span className="text-[16px] md:text-[24px] font-bold text-[#FDFDFD] md:ml-[50px] tracking-[-0.01em]">
            Post
          </span>
        </div>
      </div>

      {/* RENDER POSTCARD DENGAN PRIORITY=TRUE BIAR GAK KENA WARNING LCP */}
      <div className="w-full pt-[24px] px-[16px] md:px-0">
        <PostCard post={post} priority={true} />
      </div>

    </div>
  );
}