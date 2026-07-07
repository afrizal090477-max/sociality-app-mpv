'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import axiosInstance from '@/lib/axios';
import { PostCard, PostType } from '@/components/features/PostCard';
import { Loader2 } from 'lucide-react';

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

export default function Home() {
  const searchParams = useSearchParams();
  const currentSearchQuery = searchParams.get('search') || '';

  const [posts, setPosts] = useState<PostType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axiosInstance.get('/posts');
        // Pake tipe data RawPost[] buat gantiin 'any'
        const rawPosts: RawPost[] = response.data.data.posts || [];

        const formattedPosts: PostType[] = rawPosts.map((item: RawPost) => ({
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
          createdAt: new Date(item.createdAt).toLocaleDateString('id-ID', {
            day: 'numeric', month: 'long', year: 'numeric'
          }),
          isLiked: item.likedByMe,
          isSaved: false,
        }));

        setPosts(formattedPosts);
      } catch (error) {
        console.error("Gagal mengambil postingan:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const filteredPosts = useMemo(() => {
    if (!currentSearchQuery) return posts;
    
    const query = currentSearchQuery.toLowerCase().trim();
    return posts.filter((post) => 
      post.user.username.toLowerCase().includes(query) || 
      post.caption.toLowerCase().includes(query)
    );
  }, [posts, currentSearchQuery]);

  return (
    <div className="flex flex-col items-center w-full min-h-screen pt-4 md:pt-[120px] pb-20 px-4">
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        </div>
      ) : filteredPosts.length > 0 ? (
        <div className="flex flex-col gap-4 md:gap-[24px] w-full items-center">
          {filteredPosts.map((post, index) => (
            <PostCard 
              key={post.id} 
              post={post} 
              priority={index === 0}
            />
          ))}
        </div>
      ) : (
        <div className="text-center text-neutral-500 mt-20">
          <h2 className="text-display-xs font-bold mb-2 text-neutral-25">
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