"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link"; 
import { Heart, MessageCircle, Send, Bookmark, User } from "lucide-react";
import { toast } from "sonner";
import LikesModal, { LikedUser } from "./LikesModal";
import CommentsModal from "./CommentsModal";
import { api } from "@/lib/api"; 
import { useMutation } from "@tanstack/react-query";

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

interface ApiLikedUser {
  id: number;
  name?: string;
  username: string;
  avatarUrl?: string | null;
  isFollowing?: boolean;
}

export function PostCard({ post, priority }: PostCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [isSaved, setIsSaved] = useState(post.isSaved);
  const [isLikesModalOpen, setIsLikesModalOpen] = useState(false);
  const [likedUsers, setLikedUsers] = useState<LikedUser[]>([]);
  const [isLoadingLikes, setIsLoadingLikes] = useState(false);
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false);
  const likeMutation = useMutation({
    mutationFn: async (currentlyLiked: boolean) => {
      if (!currentlyLiked) {
        await api.post(`/posts/${post.id}/like`);
      } else {
        await api.delete(`/posts/${post.id}/like`);
      }
    },
    onError: (err, currentlyLiked) => {
      setIsLiked(currentlyLiked);
      setLikesCount((prev) => (currentlyLiked ? prev + 1 : prev - 1));
      toast.error("Gagal menyukai postingan.");
      console.error("Like error:", err);
    },
  });

  const handleLikeToggle = () => {
    const currentlyLiked = isLiked;
    setIsLiked(!currentlyLiked);
    setLikesCount((prev) => (!currentlyLiked ? prev + 1 : prev - 1));
    likeMutation.mutate(currentlyLiked);
  };

  const saveMutation = useMutation({
    mutationFn: async (currentlySaved: boolean) => {
      if (!currentlySaved) {
        await api.post(`/posts/${post.id}/save`);
        return "Disimpan ke koleksi!";
      } else {
        await api.delete(`/posts/${post.id}/save`);
        return "Dihapus dari koleksi.";
      }
    },
    onSuccess: (message) => {
      toast.success(message);
    },
    onError: (err, currentlySaved) => {
      setIsSaved(currentlySaved);
      toast.error("Gagal menyimpan postingan.");
      console.error("Save error:", err);
    },
  });

  const handleSaveToggle = () => {
    const currentlySaved = isSaved;
    setIsSaved(!currentlySaved);
    saveMutation.mutate(currentlySaved);
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/post/${post.id}`;
    const shareData = {
      title: "Sociality Post",
      text: `Lihat postingan keren dari ${post.user.username} di Sociality!`,
      url: shareUrl,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Link postingan disalin ke clipboard!");
      }
    } catch (err) {
      console.error("Error sharing:", err);
    }
  };

  const openLikesModal = async () => {
    setIsLikesModalOpen(true);
    setIsLoadingLikes(true);
    try {
      const [likesRes, followingRes] = await Promise.all([
        api.get(`/posts/${post.id}/likes`),
        api.get(`/me/following`),
      ]);
      let usersData: ApiLikedUser[] = [];
      const rawLikes = likesRes.data;
      if (Array.isArray(rawLikes?.data)) usersData = rawLikes.data;
      else if (Array.isArray(rawLikes)) usersData = rawLikes;
      else if (Array.isArray(rawLikes?.data?.users)) usersData = rawLikes.data.users;
      else if (Array.isArray(rawLikes?.data?.likes)) usersData = rawLikes.data.likes;
      else if (Array.isArray(rawLikes?.users)) usersData = rawLikes.users;
      
      let myFollowingData: { username: string }[] = [];
      const rawFollowing = followingRes.data;
      if (Array.isArray(rawFollowing?.data)) myFollowingData = rawFollowing.data;
      else if (Array.isArray(rawFollowing)) myFollowingData = rawFollowing;
      else if (Array.isArray(rawFollowing?.data?.users)) myFollowingData = rawFollowing.data.users;
      else if (Array.isArray(rawFollowing?.data?.following)) myFollowingData = rawFollowing.data.following;

      const myFollowingUsernames = myFollowingData.map((u) => u.username);
      const mappedUsers: LikedUser[] = usersData.map((user) => ({
        id: user.id,
        name: user.name || user.username,
        username: user.username,
        avatarUrl: user.avatarUrl || null,
        isFollowing: user.isFollowing ?? myFollowingUsernames.includes(user.username),
      }));

      setLikedUsers(mappedUsers);
    } catch (err) {
      console.error("Fetch likes error:", err);
      toast.error("Gagal memuat daftar likes.");
    } finally {
      setIsLoadingLikes(false);
    }
  };
  const captionText = post.caption || "";
  const isLongCaption = captionText.length > 90;
  
  
  return (
    <>
      <article className="flex flex-col items-start px-[16px] md:px-0 py-0 gap-[8px] md:gap-[12px] w-full max-w-[393px] md:max-w-[600px] mx-auto">
        <div className="flex flex-col items-start p-0 gap-[8px] md:gap-[12px] w-full">
          <Link 
            href={`/profile/${post.user.username}`}
            className="flex flex-row items-center p-0 gap-[8px] md:gap-[12px] w-full h-[44px] md:h-[64px] hover:opacity-80 transition-opacity cursor-pointer"
          >
            <div className="relative flex items-center justify-center w-[44px] h-[44px] md:w-[64px] md:h-[64px] rounded-full overflow-hidden bg-neutral-900 border border-neutral-800 shrink-0">
              {post.user.avatarUrl ? (
                <Image src={post.user.avatarUrl} alt={post.user.username} fill sizes="(max-width: 768px) 44px, 64px" className="object-cover" />
              ) : (
                <User className="w-5 h-5 md:w-8 md:h-8 text-neutral-500" />
              )}
            </div>
            <div className="flex flex-col items-start p-0 flex-1">
              <h3 className="text-[14px] md:text-[16px] font-bold text-[#FDFDFD] leading-[28px] md:leading-[30px] tracking-[-0.01em] md:tracking-[-0.02em] font-['SF_Pro']">
                {post.user.username}
              </h3>
              <span className="text-[12px] md:text-[14px] font-normal text-[#A4A7AE] leading-[16px] md:leading-[28px] tracking-[-0.02em] font-['SF_Pro']">
                {post.createdAt}
              </span>
            </div>
          </Link>

          <div className="relative w-full aspect-square md:w-[600px] md:h-[600px] bg-neutral-900 rounded-[8px] overflow-hidden shrink-0 border border-neutral-900">
            <Image src={post.imageUrl} alt="Post Image" fill sizes="(max-width: 768px) 100vw, 600px" className="object-cover" priority={priority} />
          </div>

          <div className="flex flex-row justify-between items-center p-0 w-full h-[28px] md:h-[30px]">
            <div className="flex flex-row items-center gap-[12px] md:gap-[16px]">
              <div className="flex flex-row items-center gap-[6px]">
                <button onClick={handleLikeToggle} className="flex flex-row items-center group hover:opacity-80 transition-opacity cursor-pointer">
                  <Heart className={`w-[24px] h-[24px] ${isLiked ? "fill-[#B41759] text-[#B41759]" : "text-[#FDFDFD]"}`} />
                </button>
                <button onClick={openLikesModal} className="text-[14px] md:text-[16px] font-semibold text-[#FDFDFD] leading-[28px] md:leading-[30px] tracking-[-0.02em] font-['SF_Pro'] hover:underline cursor-pointer">
                  {likesCount}
                </button>
              </div>

              <button onClick={() => setIsCommentsModalOpen(true)} className="flex flex-row items-center gap-[6px] hover:opacity-80 transition-opacity cursor-pointer">
                <MessageCircle className="w-[24px] h-[24px] text-[#FDFDFD]" />
                <span className="text-[14px] md:text-[16px] font-semibold text-[#FDFDFD] leading-[28px] md:leading-[30px] tracking-[-0.02em] font-['SF_Pro']">
                  {post.commentsCount}
                </span>
              </button>

              <button onClick={handleShare} className="flex flex-row items-center gap-[6px] hover:opacity-80 transition-opacity cursor-pointer">
                <Send className="w-[24px] h-[24px] text-[#FDFDFD]" />
                <span className="text-[14px] md:text-[16px] font-semibold text-[#FDFDFD] leading-[28px] md:leading-[30px] tracking-[-0.02em] font-['SF_Pro']">
                  {post.sharesCount}
                </span>
              </button>
            </div>

            <button onClick={handleSaveToggle} className="hover:opacity-80 transition-opacity cursor-pointer">
              <Bookmark className={`w-[24px] h-[24px] ${isSaved ? "fill-[#FDFDFD] text-[#FDFDFD]" : "text-[#FDFDFD]"}`} />
            </button>
          </div>

          <div className="flex flex-col items-start p-0 gap-[0px] md:gap-[4px] w-full">
            <Link href={`/profile/${post.user.username}`} className="hover:underline cursor-pointer">
              <h4 className="text-[14px] md:text-[16px] font-bold text-[#FDFDFD] leading-[28px] md:leading-[30px] tracking-[-0.01em] md:tracking-[-0.02em] font-['SF_Pro']">
                {post.user.username}
              </h4>
            </Link>
            <p className={`text-[14px] md:text-[16px] font-normal text-[#FDFDFD] leading-[28px] md:leading-[30px] tracking-[-0.02em] font-['SF_Pro'] break-words w-full ${!isExpanded ? "line-clamp-2" : ""}`}>
              {captionText}
            </p>
            {isLongCaption && (
              <button onClick={() => setIsExpanded(!isExpanded)} className="text-[14px] md:text-[16px] font-bold md:font-semibold text-[#7F51F9] leading-[28px] md:leading-[30px] tracking-[-0.01em] md:tracking-[-0.02em] hover:text-[#522BC8] transition-colors cursor-pointer font-['SF_Pro']">
                {isExpanded ? "Show Less" : "Show More"}
              </button>
            )}
          </div>
        </div>

        <div className="w-full h-px border border-[#181D27] mt-[0px] md:mt-[12px]"></div>
      </article>

      <LikesModal isOpen={isLikesModalOpen} onClose={() => setIsLikesModalOpen(false)} users={likedUsers} isLoading={isLoadingLikes} />
      <CommentsModal isOpen={isCommentsModalOpen} onClose={() => setIsCommentsModalOpen(false)} post={post} localIsLiked={isLiked} localLikesCount={likesCount} localIsSaved={isSaved} localCommentsCount={post.commentsCount} onLikeToggle={handleLikeToggle} onSaveToggle={handleSaveToggle} onShare={handleShare} />
    </>
  );
}