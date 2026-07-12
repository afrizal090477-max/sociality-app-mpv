import React, { useState } from "react";
import { X, CheckCircle, Loader2 } from "lucide-react";
import Image from "next/image";
import axios from "axios";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useMutation } from "@tanstack/react-query";

export interface LikedUser {
  id: number;
  name: string;
  username: string;
  avatarUrl: string | null;
  isFollowing: boolean;
}

interface LikesModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: LikedUser[];
  isLoading: boolean;
}

export default function LikesModal({
  isOpen,
  onClose,
  users,
  isLoading,
}: LikesModalProps) {
  const [optimisticFollows, setOptimisticFollows] = useState<Record<string, boolean>>({});

  const followMutation = useMutation({
    mutationFn: async ({ username, isFollowing }: { username: string; isFollowing: boolean }) => {
      if (isFollowing) {
        await api.delete(`/follow/${username}`);
        return `Berhenti mengikuti @${username}`;
      } else {
        await api.post(`/follow/${username}`);
        return `Sekarang mengikuti @${username}`;
      }
    },
    onSuccess: (message) => {
      toast.success(message);
    },
    onError: (err, variables) => {
      setOptimisticFollows((prev) => {
        const newState = { ...prev };
        delete newState[variables.username];
        return newState;
      });
      
      let errorMessage = `Gagal mengubah status follow untuk @${variables.username}`;
      if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.message || errorMessage;
      }
      toast.error(errorMessage);
    }
  });

  const handleFollowToggle = (username: string, currentIsFollowing: boolean) => {
    setOptimisticFollows((prev) => ({
      ...prev,
      [username]: !currentIsFollowing,
    }));
    followMutation.mutate({ username, isFollowing: currentIsFollowing });
  };
  if (!isOpen) return null;
  const displayUsers = users.map((u) => ({
    ...u,
    isFollowing: optimisticFollows[u.username] !== undefined ? optimisticFollows[u.username] : u.isFollowing,
  }));

  return (
    <div className="fixed inset-0 z-[999] flex items-end md:items-center justify-center bg-[rgba(10,13,18,0.8)] backdrop-blur-sm sm:p-4">
      <div className="w-full md:w-[548px] bg-[#0A0D12] border-t md:border border-[#181D27] rounded-t-[16px] md:rounded-[16px] p-[16px_16px_32px] md:p-[20px] flex flex-col gap-[12px] md:gap-[20px] animate-in slide-in-from-bottom-full md:slide-in-from-bottom-0 md:zoom-in-95 duration-200">
        <div className="flex justify-between items-center">
          <h2 className="text-[16px] md:text-[20px] font-bold text-[#FDFDFD] leading-[30px] md:leading-[34px] tracking-[-0.02em] font-['SF_Pro']">
            Likes
          </h2>
          <button
            onClick={() => {
              setOptimisticFollows({}); 
              onClose();
            }}
            className="p-1 hover:bg-neutral-900 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-6 h-6 text-[#FDFDFD]" />
          </button>
        </div>

        <div className="flex flex-col gap-[20px] max-h-[50vh] md:max-h-[400px] overflow-y-auto pr-2">
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="w-8 h-8 text-[#7F51F9] animate-spin" />
            </div>
          ) : displayUsers.length === 0 ? (
            <div className="text-center text-[#A4A7AE] py-10 text-[14px]">
              Belum ada yang menyukai postingan ini.
            </div>
          ) : (
            displayUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between w-full h-[56px]"
              >
                <div className="flex items-center gap-[8px] flex-1">
                  <div className="w-[48px] h-[48px] rounded-full bg-neutral-800 overflow-hidden relative shrink-0">
                    {user.avatarUrl ? (
                      <Image
                        src={user.avatarUrl}
                        alt={user.name}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#A4A7AE] font-bold text-[14px]">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col justify-center items-start">
                    <span className="text-[14px] font-bold text-[#FDFDFD] leading-[28px] tracking-[-0.01em] font-['SF_Pro'] line-clamp-1">
                      {user.name}
                    </span>
                    <span className="text-[14px] font-normal text-[#A4A7AE] leading-[28px] tracking-[-0.02em] font-['SF_Pro'] line-clamp-1">
                      @{user.username}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleFollowToggle(user.username, user.isFollowing)}
                  className={`flex items-center justify-center gap-[8px] h-[40px] rounded-[100px] transition-all cursor-pointer shrink-0 ${
                    user.isFollowing
                      ? "px-[16px] border border-[#181D27] text-[#FDFDFD] hover:bg-neutral-900"
                      : "px-[24px] bg-[#6936F2] border-transparent text-[#FDFDFD] hover:bg-[#522BC8]"
                  }`}
                >
                  {user.isFollowing && (
                    <CheckCircle className="w-[20px] h-[20px]" />
                  )}
                  <span className="text-[14px] font-bold leading-[28px] tracking-[-0.01em] font-['SF_Pro']">
                    {user.isFollowing ? "Following" : "Follow"}
                  </span>
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}