'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { X, Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Smile, Loader2 } from 'lucide-react';
import axiosInstance from '@/lib/axios';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';
import { Theme } from 'emoji-picker-react';

const EmojiPicker = dynamic(() => import('emoji-picker-react'), { ssr: false });

interface PostData {
  id: number;
  user: {
    username: string;
    avatarUrl: string | null;
  };
  imageUrl: string;
  caption: string;
  createdAt: string;
  sharesCount: number;
}

interface CommentData {
  id: number;
  comment?: string;
  content?: string;
  text?: string;
  createdAt: string;
  user?: {
    id: number;
    username: string;
    name: string;
    avatarUrl: string | null;
  };
  author?: {
    id: number;
    username: string;
    name: string;
    avatarUrl: string | null;
  };
}

interface CommentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: PostData;
  localIsLiked: boolean;
  localLikesCount: number;
  localIsSaved: boolean;
  localCommentsCount: number;
  onLikeToggle: () => void;
  onSaveToggle: () => void;
  onShare: () => void; 
}

export default function CommentsModal({ 
  isOpen, 
  onClose, 
  post,
  localIsLiked,
  localLikesCount,
  localIsSaved,
  localCommentsCount,
  onLikeToggle,
  onSaveToggle,
  onShare 
}: CommentsModalProps) {
  const [comments, setComments] = useState<CommentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const fetchComments = async () => {
        setIsLoading(true);
        try {
          const response = await axiosInstance.get(`/posts/${post.id}/comments`);
          if (isMounted) {
            const data = response.data?.data?.comments || response.data?.data || [];
            setComments(Array.isArray(data) ? data : []);
          }
        } catch (error) {
          console.error('Failed to fetch comments:', error);
          if (isMounted) toast.error('Gagal memuat komentar');
        } finally {
          if (isMounted) setIsLoading(false);
        }
      };
      fetchComments();
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { 
      isMounted = false;
      document.body.style.overflow = 'unset'; 
    };
  }, [isOpen, post.id]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCloseModal = () => {
    setShowEmojiPicker(false); 
    setCommentText(''); 
    onClose(); 
  };

  const handlePostComment = async () => {
    if (!commentText.trim() || isPosting) return;

    setIsPosting(true);
    try {
      const response = await axiosInstance.post(`/posts/${post.id}/comments`, {
        text: commentText.trim() 
      });
      
      const newComment = response.data?.data;
      if (newComment) {
        setComments((prev) => [newComment, ...prev]);
        toast.success('Komentar berhasil dikirim!');
      } else {
        const fetchResponse = await axiosInstance.get(`/posts/${post.id}/comments`);
        const data = fetchResponse.data?.data?.comments || fetchResponse.data?.data || [];
        setComments(Array.isArray(data) ? data : []);
      }
      
      setCommentText(''); 
      setShowEmojiPicker(false);
    } catch (error) {
      console.error('Failed to post comment:', error);
      toast.error('Gagal mengirim komentar.');
    } finally {
      setIsPosting(false);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onEmojiClick = (emojiObject: any) => {
    setCommentText((prev) => prev + emojiObject.emoji);
  };
  if (!isOpen) return null;
  const getCommentAvatar = (comment: CommentData) => {
    return comment.author?.avatarUrl || comment.user?.avatarUrl || null;
  };
  const getCommentUsername = (comment: CommentData) => {
    return comment.author?.username || comment.user?.username || 'Unknown';
  };

  return (
    <div className="fixed inset-0 z-[999] flex flex-col justify-end md:justify-center items-center bg-[rgba(10,13,18,0.8)] animate-in fade-in duration-200">
      
      <div className="flex flex-col items-end gap-[8px] md:gap-[24px] w-full md:w-[1200px] h-[75vh] md:h-[768px]">
        
        <button 
          onClick={handleCloseModal} 
          className="mr-[16px] md:mr-0 flex justify-center items-center w-[24px] h-[24px] cursor-pointer hover:opacity-80 transition-opacity"
        >
          <X className="w-[24px] h-[24px] text-[#FDFDFD]" />
        </button>

        <div className="flex flex-col md:flex-row w-full h-full bg-[#0A0D12] rounded-t-[16px] md:rounded-none overflow-hidden shadow-2xl animate-in slide-in-from-bottom-full md:slide-in-from-bottom-0 md:zoom-in-95 duration-200">
          <div className="hidden md:block relative w-[720px] h-full bg-neutral-900 border-r border-[#181D27] shrink-0">
            <Image src={post.imageUrl} alt="Post image" fill className="object-cover" sizes="(max-width: 1200px) 100vw, 720px" />
          </div>

          <div className="flex flex-col w-full md:w-[480px] h-full overflow-hidden relative">
            
            <div className="flex flex-col flex-1 overflow-y-auto px-[16px] py-[16px] md:px-[20px] md:py-[20px] gap-[12px] md:gap-[16px]">
              
              <div className="hidden md:flex flex-col gap-[8px] pb-[16px] border-b border-[#181D27]">
                <div className="flex flex-row justify-between items-center h-[46px]">
                  <div className="flex items-center gap-[13px]">
                    <div className="w-[40px] h-[40px] rounded-full bg-neutral-800 overflow-hidden relative shrink-0">
                      {post.user.avatarUrl ? (
                        <Image src={post.user.avatarUrl} alt={post.user.username} fill sizes="40px" className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#A4A7AE] font-bold text-[14px]">
                          {post.user.username.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col justify-center gap-[2px]">
                      <span className="text-[14px] font-bold text-[#FDFDFD] leading-[28px] tracking-[-0.01em] font-['SF_Pro']">
                        {post.user.username}
                      </span>
                      <span className="text-[12px] font-normal text-[#A4A7AE] leading-[16px] font-['SF_Pro']">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <button className="p-1 cursor-pointer hover:bg-[#181D27] rounded-full transition-colors">
                    <MoreHorizontal className="w-[24px] h-[24px] text-[#FDFDFD]" />
                  </button>
                </div>
                <p className="text-[14px] font-normal text-[#FDFDFD] leading-[28px] tracking-[-0.02em] font-['SF_Pro'] md:mt-2">
                  {post.caption}
                </p>
              </div>

              <div className="flex flex-col gap-[8px] md:gap-[10px]">
                
                <h2 className="text-[16px] font-bold text-[#FDFDFD] leading-[30px] tracking-[-0.02em] font-['SF_Pro']">
                  Komentar
                </h2>

                {isLoading ? (
                  <div className="flex justify-center items-center py-10">
                    <Loader2 className="w-8 h-8 text-[#7F51F9] animate-spin" />
                  </div>
                ) : comments.length === 0 ? (
                  <div className="flex flex-col justify-center items-center py-[40px] gap-[4px]">
                    <h3 className="text-[16px] font-bold text-[#FDFDFD] leading-[30px] tracking-[-0.02em] font-['SF_Pro'] text-center">
                      Belum ada komentar
                    </h3>
                    <p className="text-[14px] font-normal text-[#A4A7AE] leading-[28px] tracking-[-0.02em] font-['SF_Pro'] text-center">
                      Jadilah yang pertama!
                    </p>
                  </div>
                ) : (
                  comments.map((comment, index) => {
                    const avatarUrl = getCommentAvatar(comment);
                    const username = getCommentUsername(comment);

                    return (
                      <div key={comment.id} className="flex flex-col gap-[8px]">
                        <div className="flex flex-row items-start gap-[8px]">
                          <div className="w-[40px] h-[40px] rounded-full bg-neutral-800 overflow-hidden relative shrink-0">
                            {avatarUrl ? (
                              <Image src={avatarUrl} alt={username} fill sizes="40px" className="object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[#A4A7AE] font-bold text-[14px]">
                                {username.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col flex-1">
                            <div className="flex items-center gap-[8px]">
                              <span className="text-[14px] font-bold text-[#FDFDFD] leading-[28px] tracking-[-0.01em] font-['SF_Pro']">
                                {username}
                              </span>
                              <span className="text-[12px] font-normal text-[#A4A7AE] leading-[16px] font-['SF_Pro']">
                                {new Date(comment.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-[14px] font-normal text-[#FDFDFD] leading-[28px] tracking-[-0.02em] font-['SF_Pro'] break-all">
                              {comment.text || comment.content || comment.comment}
                            </p>
                          </div>
                        </div>
                        {index !== comments.length - 1 && (
                          <div className="w-full h-px bg-[#181D27] mt-[4px]"></div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {showEmojiPicker && (
              <div className="absolute bottom-[100px] md:bottom-[140px] left-[16px] md:left-[20px] z-50 shadow-2xl" ref={emojiPickerRef}>
                <EmojiPicker onEmojiClick={onEmojiClick} theme={Theme.DARK} />
              </div>
            )}

            <div className="flex flex-col px-[16px] pt-[16px] pb-[32px] md:p-[20px] gap-[16px] border-t border-[#181D27] shrink-0 bg-[#0A0D12]">
              <div className="hidden md:flex flex-row justify-between items-center h-[30px] w-full">
                <div className="flex flex-row items-center gap-[16px]">
                  <button onClick={onLikeToggle} className="flex items-center gap-[6px] hover:opacity-80 transition-opacity cursor-pointer">
                    <Heart className={`w-[24px] h-[24px] ${localIsLiked ? 'fill-[#B41759] text-[#B41759]' : 'text-[#FDFDFD]'}`} />
                    <span className="text-[16px] font-semibold text-[#FDFDFD] leading-[30px] tracking-[-0.02em] font-['SF_Pro']">{localLikesCount}</span>
                  </button>
                  <button onClick={() => inputRef.current?.focus()} className="flex items-center gap-[6px] hover:opacity-80 transition-opacity cursor-pointer">
                    <MessageCircle className="w-[24px] h-[24px] text-[#FDFDFD]" />
                    <span className="text-[16px] font-semibold text-[#FDFDFD] leading-[30px] tracking-[-0.02em] font-['SF_Pro']">
                      {localCommentsCount + comments.length}
                    </span>
                  </button>
                  {/* Tombol Share */}
                  <button onClick={onShare} className="flex items-center gap-[6px] hover:opacity-80 transition-opacity cursor-pointer">
                    <Send className="w-[24px] h-[24px] text-[#FDFDFD]" />
                    <span className="text-[16px] font-semibold text-[#FDFDFD] leading-[30px] tracking-[-0.02em] font-['SF_Pro']">{post.sharesCount}</span>
                  </button>
                </div>
                <button onClick={onSaveToggle} className="hover:opacity-80 transition-opacity cursor-pointer">
                  <Bookmark className={`w-[24px] h-[24px] ${localIsSaved ? 'fill-[#FDFDFD] text-[#FDFDFD]' : 'text-[#FDFDFD]'}`} />
                </button>
              </div>

              <div className="flex flex-row items-center gap-[8px] h-[48px] w-full">
                <button 
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className={`flex justify-center items-center w-[48px] h-[48px] border rounded-[12px] transition-colors shrink-0 cursor-pointer ${showEmojiPicker ? 'bg-[#181D27] border-[#7F51F9]' : 'border-[#181D27] hover:bg-[#181D27]'}`}
                >
                  <Smile className="w-[24px] h-[24px] text-[#FDFDFD]" />
                </button>
                
                <div className="flex flex-row items-center px-[16px] py-[8px] gap-[8px] flex-1 h-[48px] bg-[#0A0D12] border border-[#181D27] rounded-[12px]">
                  <input 
                    ref={inputRef}
                    type="text"
                    placeholder="Tulis komentar..." 
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handlePostComment();
                      }
                    }}
                    className="flex-1 bg-transparent border-none outline-none text-[14px] md:text-[16px] font-medium text-[#FDFDFD] leading-[28px] md:leading-[30px] font-['SF_Pro'] placeholder:text-[#535862]"
                  />
                  
                  <button 
                    onClick={handlePostComment}
                    disabled={!commentText.trim() || isPosting}
                    className={`text-[14px] md:text-[16px] font-bold leading-[28px] md:leading-[30px] tracking-[-0.01em] md:tracking-[-0.02em] font-['SF_Pro'] transition-colors ${
                      commentText.trim() ? 'text-[#7F51F9] hover:text-[#522BC8] cursor-pointer' : 'text-[#535862] cursor-not-allowed'
                    }`}
                  >
                    {isPosting ? '...' : 'Post'}
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}