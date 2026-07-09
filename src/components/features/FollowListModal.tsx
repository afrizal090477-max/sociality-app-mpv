'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, Loader2 } from 'lucide-react';
import axiosInstance from '@/lib/axios';
import { toast } from 'sonner';

export interface FollowUser {
  id: number;
  username: string;
  name: string;
  avatarUrl: string | null;
  isFollowedByMe?: boolean;
}

interface FollowListModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'followers' | 'following';
  username?: string; 
}

export default function FollowListModal({ isOpen, onClose, type, username }: FollowListModalProps) {
  const [users, setUsers] = useState<FollowUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const endpoint = username ? `/users/${username}/${type}` : `/me/${type}`;
        const res = await axiosInstance.get(endpoint);
        setUsers(res.data?.data?.users || []);
      } catch (error) {
        console.error(`Gagal mengambil data ${type}:`, error);
        toast.error(`Gagal memuat daftar ${type}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [isOpen, type, username]);

  const handleFollowToggle = async (targetUser: FollowUser) => {
    setActionLoading(targetUser.id);
    const isCurrentlyFollowing = targetUser.isFollowedByMe;

    try {
      if (isCurrentlyFollowing) {
        await axiosInstance.delete(`/follow/${targetUser.username}`);
      } else {
        await axiosInstance.post(`/follow/${targetUser.username}`);
      }
      setUsers((prev) =>
        prev.map((u) =>
          u.id === targetUser.id ? { ...u, isFollowedByMe: !isCurrentlyFollowing } : u
        )
      );
      window.dispatchEvent(new Event("profileUpdated"));  
    } catch (error) {
      console.error("Toggle follow error:", error);
      toast.error("Gagal melakukan aksi.");
    } finally {
      setActionLoading(null);
    }
  };
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 animate-in fade-in">
      <div className="bg-[#0A0D12] border border-[#181D27] w-full max-w-[400px] rounded-2xl overflow-hidden flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-[#181D27]">
          <h2 className="text-[16px] font-bold text-[#FDFDFD] font-['SF_Pro'] capitalize">
            {type}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-[#181D27] rounded-full transition-colors cursor-pointer">
            <X className="w-5 h-5 text-[#A4A7AE] hover:text-[#FDFDFD]" />
          </button>
        </div>

        <div className="p-4 flex flex-col gap-4 max-h-[60vh] overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="w-6 h-6 text-[#7F51F9] animate-spin" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center text-[#A4A7AE] py-8 font-['SF_Pro'] text-[14px]">
              Tidak ada {type}.
            </div>
          ) : (
            users.map((u) => (
              <div key={u.id} className="flex items-center justify-between gap-3 w-full">
                <Link
                  href={`/profile/${u.username}`}
                  onClick={onClose}
                  className="flex items-center gap-3 flex-1 hover:opacity-80 transition-opacity"
                >
                  <div className="w-10 h-10 rounded-full bg-neutral-800 overflow-hidden relative shrink-0 border border-[#181D27]">
                    {u.avatarUrl ? (
                      <Image src={u.avatarUrl} alt={u.name} fill sizes="40px" className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#A4A7AE] font-bold text-[14px]">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col flex-1">
                    <span className="text-[14px] font-bold text-[#FDFDFD] line-clamp-1 font-['SF_Pro']">{u.name}</span>
                    <span className="text-[12px] text-[#A4A7AE] line-clamp-1 font-['SF_Pro']">@{u.username}</span>
                  </div>
                </Link>

                <button
                  onClick={() => handleFollowToggle(u)}
                  disabled={actionLoading === u.id}
                  className={`px-4 py-1.5 rounded-full text-[12px] font-bold font-['SF_Pro'] transition-colors disabled:opacity-50 cursor-pointer shrink-0 ${
                    u.isFollowedByMe
                      ? 'bg-transparent border border-[#181D27] text-[#FDFDFD] hover:border-[#ef4444] hover:text-[#ef4444]'
                      : 'bg-[#6936F2] text-[#FDFDFD] hover:bg-[#522BC8]'
                  }`}
                >
                  {actionLoading === u.id ? (
                      <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                  ) : u.isFollowedByMe ? (
                      'Unfollow'
                  ) : (
                      'Follow'
                  )}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}