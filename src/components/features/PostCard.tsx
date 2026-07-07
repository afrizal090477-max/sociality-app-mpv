import React from 'react';
import Image from 'next/image';
import { Heart, MessageCircle, Send, Bookmark, User } from 'lucide-react';

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
  priority?: boolean; // 👈 Definisi priority di Props
}

// 👈 PERHATIKAN DI SINI: Kita tangkap "priority" dari props dan kasih nilai default "false"
export function PostCard({ post, priority = false }: PostCardProps) {
  return (
    <article className="flex flex-col items-start p-0 gap-2 md:gap-3 w-full max-w-[361px] md:max-w-[600px] mx-auto">
      
      {/* POST CONTAINER */}
      <div className="flex flex-col items-start p-0 gap-2 md:gap-3 w-full">
        
        {/* HEADER: Avatar & User Info */}
        <div className="flex flex-row items-center p-0 gap-2 md:gap-3 w-full h-[44px] md:h-[64px]">
          {/* Avatar */}
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

          {/* User Info */}
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
            priority={priority} // 👈 priority dipasang di sini
            className="object-cover"
          />
        </div>

        {/* ACTIONS */}
        <div className="flex flex-row justify-between items-center p-0 w-full h-[28px] md:h-[30px]">
          <div className="flex flex-row items-center gap-3 md:gap-4">
            
            <button className="flex flex-row items-center gap-[6px] group hover:opacity-80 transition-opacity cursor-pointer">
              <Heart className={`w-6 h-6 ${post.isLiked ? 'fill-[#B41759] text-[#B41759]' : 'text-neutral-25'}`} />
              <span className="text-sm md:text-md font-semibold text-neutral-25 tracking-[-0.02em]">
                {post.likesCount}
              </span>
            </button>

            <button className="flex flex-row items-center gap-[6px] hover:opacity-80 transition-opacity cursor-pointer">
              <MessageCircle className="w-6 h-6 text-neutral-25" />
              <span className="text-sm md:text-md font-semibold text-neutral-25 tracking-[-0.02em]">
                {post.commentsCount}
              </span>
            </button>

            <button className="flex flex-row items-center gap-[6px] hover:opacity-80 transition-opacity cursor-pointer">
              <Send className="w-6 h-6 text-neutral-25" />
              <span className="text-sm md:text-md font-semibold text-neutral-25 tracking-[-0.02em]">
                {post.sharesCount}
              </span>
            </button>

          </div>

          <button className="hover:opacity-80 transition-opacity cursor-pointer">
            <Bookmark className={`w-6 h-6 ${post.isSaved ? 'fill-neutral-25 text-neutral-25' : 'text-neutral-25'}`} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="flex flex-col items-start p-0 gap-1 w-full">
          <h4 className="text-sm md:text-md font-bold text-neutral-25 tracking-[-0.01em] md:tracking-[-0.02em]">
            {post.user.username}
          </h4>
          <p className="text-sm md:text-md font-normal text-neutral-25 tracking-[-0.02em] line-clamp-2 break-all">
            {post.caption}
          </p>
          <button className="text-sm md:text-md font-semibold text-brand-200 tracking-[-0.01em] md:tracking-[-0.02em] hover:text-brand-500 transition-colors cursor-pointer">
            Show More
          </button>
        </div>
      </div>

      {/* DIVIDER */}
      <div className="w-full h-px bg-neutral-900 mt-2 md:mt-3"></div>
      
    </article>
  );
}