'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Heart, MessageCircle, Send, Bookmark, User } from 'lucide-react';
import axiosInstance from '@/lib/axios';
import { toast } from 'sonner';

export interface PostType {
  id: number;
  user: {
    username: string;
    avatarUrl: string | null;
  };
  imageUrl: string;
  caption: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  createdAt: string;
  isLiked: boolean;
  isSaved: boolean;
}

interface PostCardProps {
  post: PostType;
  priority?: boolean;
}

export function PostCard({ post, priority = false }: PostCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // State untuk Like
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likesCount, setLikesCount] = useState(post.likesCount);

  // 👈 JALAN KSATRIA: State untuk Save/Bookmark
  const [isSaved, setIsSaved] = useState(post.isSaved);

  // Fungsi Toggle Like
  const handleLikeToggle = async () => {
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    setLikesCount((prev) => newLikedState ? prev + 1 : prev - 1);

    try {
      if (newLikedState) {
        await axiosInstance.post(`/posts/${post.id}/like`);
      } else {
        await axiosInstance.delete(`/posts/${post.id}/like`);
      }
    } catch (error) {
      console.error("Gagal update like:", error);
      setIsLiked(!newLikedState);
      setLikesCount((prev) => !newLikedState ? prev + 1 : prev - 1);
      toast.error("Gagal menyukai postingan. Coba lagi.");
    }
  };

  // 👈 JALAN KSATRIA: Fungsi Toggle Save/Bookmark
  const handleSaveToggle = async () => {
    const newSavedState = !isSaved;
    setIsSaved(newSavedState); // Optimistic Update

    try {
      if (newSavedState) {
        await axiosInstance.post(`/posts/${post.id}/save`);
        toast.success("Postingan disimpan!");
      } else {
        await axiosInstance.delete(`/posts/${post.id}/save`);
        toast.success("Postingan dihapus dari simpanan.");
      }
    } catch (error) {
      console.error("Gagal update save:", error);
      setIsSaved(!newSavedState); // Rollback jika gagal
      toast.error("Gagal menyimpan postingan. Coba lagi.");
    }
  };

  const captionText = post.caption || "";
  const isLongCaption = captionText.length > 90;

  return (
    <article className="flex flex-col items-start p-0 gap-2 md:gap-3 w-full max-w-[361px] md:max-w-[600px] mx-auto">
      
      {/* POST CONTAINER */}
      <div className="flex flex-col items-start p-0 gap-2 md:gap-3 w-full">
        
        {/* HEADER */}
        <div className="flex flex-row items-center p-0 gap-2 md:gap-3 w-full h-[44px] md:h-[64px]">
          <div className="relative flex items-center justify-center w-[44px] h-[44px] md:w-[64px] md:h-[64px] rounded-full overflow-hidden bg-neutral-900 border border-neutral-800 shrink-0">
            {post.user.avatarUrl ? (
              <Image 
                src={post.user.avatarUrl}
                alt={post.user.username}
                fill
                sizes="(max-width: 768px) 44px, 64px"
                className="object-cover"
              />
            ) : (
              <User className="w-5 h-5 md:w-8 md:h-8 text-neutral-500" />
            )}
          </div>

          <div className="flex flex-col items-start p-0 flex-1">
            <h3 className="text-sm md:text-md font-bold text-neutral-25 tracking-[-0.01em] md:tracking-[-0.02em] leading-tight">
              {post.user.username}
            </h3>
            <span className="text-xs md:text-sm font-normal text-neutral-400 tracking-[-0.02em]">
              {post.createdAt}
            </span>
          </div>
        </div>

        {/* IMAGE */}
        <div className="relative w-full aspect-square md:w-[600px] md:h-[600px] bg-neutral-900 rounded-lg overflow-hidden shrink-0">
          <Image 
            src={post.imageUrl} 
            alt="Post Image" 
            fill 
            sizes="(max-width: 768px) 100vw, 600px"
            priority={priority}
            className="object-cover"
          />
        </div>

        {/* ACTIONS */}
        <div className="flex flex-row justify-between items-center p-0 w-full h-[28px] md:h-[30px]">
          <div className="flex flex-row items-center gap-3 md:gap-4">
            
            {/* BUTTON LIKE */}
            <button 
              onClick={handleLikeToggle}
              className="flex flex-row items-center gap-[6px] group hover:opacity-80 transition-opacity cursor-pointer"
            >
              <Heart className={`w-6 h-6 ${isLiked ? 'fill-[#B41759] text-[#B41759]' : 'text-neutral-25'}`} />
              <span className="text-sm md:text-md font-semibold text-neutral-25 tracking-[-0.02em]">
                {likesCount}
              </span>
            </button>

            {/* BUTTON COMMENT (Nanti bakal buka halaman detail post) */}
            <button className="flex flex-row items-center gap-[6px] hover:opacity-80 transition-opacity cursor-pointer">
              <MessageCircle className="w-6 h-6 text-neutral-25" />
              <span className="text-sm md:text-md font-semibold text-neutral-25 tracking-[-0.02em]">
                {post.commentsCount}
              </span>
            </button>

            {/* BUTTON SHARE/SEND */}
            <button className="flex flex-row items-center gap-[6px] hover:opacity-80 transition-opacity cursor-pointer">
              <Send className="w-6 h-6 text-neutral-25" />
              <span className="text-sm md:text-md font-semibold text-neutral-25 tracking-[-0.02em]">
                {post.sharesCount}
              </span>
            </button>

          </div>

          {/* 👈 BUTTON SAVE/BOOKMARK (Terhubung ke state isSaved) */}
          <button 
            onClick={handleSaveToggle}
            className="hover:opacity-80 transition-opacity cursor-pointer"
          >
            <Bookmark className={`w-6 h-6 ${isSaved ? 'fill-neutral-25 text-neutral-25' : 'text-neutral-25'}`} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="flex flex-col items-start p-0 gap-1 w-full">
          <h4 className="text-sm md:text-md font-bold text-neutral-25 tracking-[-0.01em] md:tracking-[-0.02em]">
            {post.user.username}
          </h4>
          
          <p className={`text-sm md:text-md font-normal text-neutral-25 tracking-[-0.02em] break-words w-full ${!isExpanded ? 'line-clamp-2' : ''}`}>
            {captionText}
          </p>
          
          {isLongCaption && (
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-sm md:text-md font-semibold text-[#7F51F9] tracking-[-0.01em] md:tracking-[-0.02em] hover:text-[#522BC8] transition-colors cursor-pointer mt-1"
            >
              {isExpanded ? 'Show Less' : 'Show More'}
            </button>
          )}
        </div>
      </div>

      {/* DIVIDER */}
      <div className="w-full h-px bg-neutral-900 mt-2 md:mt-3"></div>
      
    </article>
  );
}