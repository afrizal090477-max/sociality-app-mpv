'use client';

import React, { useEffect, useState } from 'react';
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
  const [posts, setPosts] = useState<PostType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axiosInstance.get('/posts');
        const rawPosts = response.data.data.posts;

        const formattedPosts = rawPosts.map((item: RawPost) => {
          const dateObj = new Date(item.createdAt);
          const formattedDate = dateObj.toLocaleDateString('id-ID', {
            day: 'numeric', month: 'long', year: 'numeric'
          });

          return {
            id: item.id,
            user: {
              username: item.author.username,
              avatarUrl: item.author.avatarUrl, // Real data, bisa null
            },
            imageUrl: item.imageUrl, // Real data
            caption: item.caption,
            likesCount: item.likeCount,
            commentsCount: item.commentCount,
            sharesCount: 0, // Di API lu emang gak ada, jadi hardcode 0 buat UI
            createdAt: formattedDate,
            isLiked: item.likedByMe,
            isSaved: false, // Di explore post lu gak ada indikator saved
          };
        });

        setPosts(formattedPosts);
      } catch (error) {
        console.error("Gagal mengambil postingan:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return (
    <div className="flex flex-col items-center w-full min-h-screen pt-4 md:pt-[120px] pb-20 px-4">
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        </div>
      ) : posts.length > 0 ? (
        <div className="flex flex-col gap-4 md:gap-[24px] w-full items-center">
          {posts.map((post, index) => (
            <PostCard 
              key={post.id} 
              post={post} 
              priority={index === 0} // 👈 Tambahkan ini: cuma post pertama yang dapet priority LCP
            />
          ))}
        </div>
      ) : (
        <div className="text-center text-neutral-500 mt-20">
          <h2 className="text-display-xs font-bold mb-2 text-neutral-25">Belum ada postingan</h2>
          <p>Jadilah yang pertama membagikan momen!</p>
        </div>
      )}
    </div>
  );
}