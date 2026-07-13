'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react'; 
import { toast } from 'sonner';
import { PostCard, PostType } from '@/components/features/PostCard';
import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { formatTimeAgo } from '@/lib/dayjs'; 

export default function PostDetail() {
  const params = useParams();
  const id = params.id as string;
  
  const { data: post, isLoading } = useQuery({
    queryKey: ['postDetail', id],
    queryFn: async () => {
      try {
        const response = await api.get(`/posts/${id}`);
        const item = response.data?.data?.post || response.data?.data;
        
        if (!item) throw new Error("Post not found");

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
          createdAt: formatTimeAgo(item.createdAt),
          isLiked: item.likedByMe || false,
          isSaved: item.savedByMe || false, 
        };
        
        return formattedPost;
      } catch (error) {
        console.error("Gagal mengambil detail postingan:", error);
        toast.error("Gagal memuat postingan");
        throw error;
      }
    },
    enabled: !!id, 
    refetchOnWindowFocus: false,
  });

  return (
    <div className="min-h-screen bg-[#000000] text-white font-['SF_Pro'] pb-[100px] md:pb-[40px]">
      <div className="flex flex-col items-center w-full max-w-[812px] mx-auto pt-[16px] md:pt-[40px] px-[16px] md:px-0">
        
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