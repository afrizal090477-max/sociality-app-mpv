'use client';

import React, { Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import { PostCard, PostType } from '@/components/features/PostCard';
import { Loader2 } from 'lucide-react';
import { formatTimeAgo } from '@/lib/dayjs';

interface RawPost {
  id: number;
  imageUrl: string;
  caption: string;
  createdAt: string;
  author: {
    id: number;
    username: string;
    name: string;
    avatarUrl: string | null;
  };
  likeCount: number;
  commentCount: number;
  likedByMe: boolean;
}

function HomeContent() {
  const searchParams = useSearchParams();
  const currentSearchQuery = searchParams.get('search') || '';
  const { data: posts = [], isLoading, isError } = useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      const response = await axiosInstance.get('/posts');
      const rawPosts: RawPost[] = response.data?.data?.posts || [];
      return rawPosts.map((item: RawPost): PostType => ({
        id: item.id,
        user: {
          username: item.author.username,
          avatarUrl: item.author.avatarUrl,
        },
        imageUrl: item.imageUrl,
        caption: item.caption || "",
        likesCount: item.likeCount,
        commentsCount: item.commentCount,
        sharesCount: 0,
        createdAt: formatTimeAgo(item.createdAt), 
        isLiked: item.likedByMe,
        isSaved: false,
      }));
    }
  });

  const filteredPosts = useMemo(() => {
    if (!currentSearchQuery) return posts;
    const query = currentSearchQuery.toLowerCase().trim();
    return posts.filter((post) => 
      post.user.username.toLowerCase().includes(query) || 
      post.caption.toLowerCase().includes(query)
    );
  }, [posts, currentSearchQuery]);
  
  return (
    <div className="flex flex-col items-center w-full min-h-screen pt-[16px] md:pt-[40px] pb-[100px] px-[16px] md:px-0 bg-[#000000]">
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="w-8 h-8 text-[#7F51F9] animate-spin" />
        </div>
      ) : isError ? (
        <div className="text-center text-[#B41759] mt-20">
          <h2 className="text-[20px] font-bold text-[#FDFDFD]">Oops!</h2>
          <p>Gagal memuat postingan. Silakan coba lagi.</p>
        </div>
      ) : filteredPosts.length > 0 ? (
        <div className="flex flex-col gap-[16px] md:gap-[24px] w-full items-center">
          {filteredPosts.map((post, index) => (
            <PostCard 
              key={post.id} 
              post={post} 
              priority={index === 0}
            />
          ))}
        </div>
      ) : (
        <div className="text-center text-[#A4A7AE] mt-20">
          <h2 className="text-[24px] font-bold mb-2 text-[#FDFDFD]">
            Hasil tidak ditemukan
          </h2>
          <p>
            Tidak ada postingan yang cocok dengan kata kunci &quot;{currentSearchQuery}&quot;
          </p>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#000000] flex justify-center items-center">
        <Loader2 className="w-8 h-8 text-[#7F51F9] animate-spin" />
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}