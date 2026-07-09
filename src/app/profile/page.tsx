'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Grid3X3, Bookmark, Send, ArrowLeft, Loader2, User } from 'lucide-react';
import axiosInstance from '@/lib/axios';
import { toast } from 'sonner';
import FollowListModal from '@/components/features/FollowListModal';

interface UserProfile {
  id: number;
  name: string;
  username: string;
  avatarUrl: string | null;
  postCount: number;
  followersCount: number;
  followingCount: number;
  bio?: string;
}

interface PostItem {
  id: number;
  imageUrl: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [savedPosts, setSavedPosts] = useState<PostItem[]>([]);
  const [activeTab, setActiveTab] = useState<'gallery' | 'saved'>('gallery');
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isLoadingContent, setIsLoadingContent] = useState(true);

  const [isFollowModalOpen, setIsFollowModalOpen] = useState(false);
  const [followModalType, setFollowModalType] = useState<'followers' | 'following'>('followers');
   
  const fetchGallery = async () => {
    setIsLoadingContent(true);
    try {
      const res = await axiosInstance.get(`/me/posts?page=1&limit=50&t=${Date.now()}`);
      const payload = res.data?.data || res.data;
      const dataArray = payload?.posts || payload?.items || [];
      setPosts(Array.isArray(dataArray) ? dataArray : []);
    } catch (error) {
      console.error('Fetch gallery error:', error);
    } finally {
      setIsLoadingContent(false);
    }
  };

  const fetchSaved = async () => {
    setIsLoadingContent(true);
    try {
      const res = await axiosInstance.get(`/me/saved?page=1&limit=50&t=${Date.now()}`);
      const payload = res.data?.data || res.data;
      const dataArray = payload?.posts || payload?.items || payload?.saved || [];
      setSavedPosts(Array.isArray(dataArray) ? dataArray : []);
    } catch (error) {
      console.error('Fetch saved error:', error);
      toast.error('Gagal memuat daftar tersimpan');
    } finally {
      setIsLoadingContent(false);
    }
  };

  const fetchProfileData = async () => {
    try {
      const resProfile = await axiosInstance.get(`/me?t=${Date.now()}`);
      const data = resProfile.data?.data || {};
      const profileData = data.profile || data.user || data;
      const statsData = data.stats || {};

      setProfile({
        id: profileData.id,
        name: profileData.name || profileData.username,
        username: profileData.username,
        avatarUrl: profileData.avatarUrl || null,
        bio: profileData.bio || '',
        postCount: statsData.posts || 0,
        followersCount: statsData.followers || 0,
        followingCount: statsData.following || 0,
      });
    } catch (error) {
      console.error('Fetch profile error:', error);
      toast.error('Gagal memuat profil');
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      await fetchProfileData();
      setIsLoadingProfile(false);
      fetchGallery();
    };
    loadInitialData();

    const handleProfileUpdate = () => {
      fetchProfileData(); 
    };
    window.addEventListener("profileUpdated", handleProfileUpdate);

    return () => window.removeEventListener("profileUpdated", handleProfileUpdate);
  }, []);

  const handleTabChange = (tab: 'gallery' | 'saved') => {
    if (tab === activeTab) return; 
    setActiveTab(tab);  
    if (tab === 'gallery') {
      fetchGallery();
    } else {
      fetchSaved();
    }
  };

  const handleShareProfile = async () => {
    if (!profile) return;
    const shareUrl = `${window.location.origin}/profile/${profile.username}`; 
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${profile.username} di Sociality`,
          url: shareUrl
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Link profil disalin!");
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoadingProfile) {
    return (
      <div className="min-h-screen bg-[#000000] flex justify-center items-center">
        <Loader2 className="w-8 h-8 text-[#7F51F9] animate-spin" />
      </div>
    );
  }
  
  if (!profile) {
    return (
      <div className="min-h-screen bg-[#000000] flex justify-center items-center text-white">
        Profil tidak ditemukan.
      </div>
    );
  }
  
  const currentContent = activeTab === 'gallery' ? posts : savedPosts;

  return (
    <div className="min-h-screen bg-[#000000] text-white font-['SF_Pro'] relative pb-[100px] md:pb-0">
      <div className="md:hidden sticky top-0 z-50 flex flex-row items-center px-[16px] h-[64px] bg-[#000000] border-b border-[#181D27]">
        <button onClick={() => router.back()} className="p-1 cursor-pointer">
          <ArrowLeft className="w-[24px] h-[24px] text-[#FDFDFD]" />
        </button>
        <span className="flex-1 text-[16px] font-bold text-[#FDFDFD] text-center ml-[-32px]">
          {profile.username}
        </span>
      </div>

      <div className="flex flex-col items-center w-full max-w-[812px] mx-auto pt-[16px] md:pt-[40px] px-[16px] md:px-0 gap-[24px] md:gap-[40px]">
        <div className="flex flex-col w-full gap-[24px]">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center w-full gap-[16px] md:gap-0">
            <div className="flex flex-row items-center gap-[12px] md:gap-[20px]">
              <div className="w-[64px] h-[64px] md:w-[80px] md:h-[80px] rounded-full overflow-hidden bg-neutral-900 border border-[#181D27] shrink-0 relative flex items-center justify-center">
                {profile.avatarUrl ? (
                  <Image 
                    src={profile.avatarUrl} 
                    alt={profile.username} 
                    fill  
                    sizes="(max-width: 768px) 64px, 80px"
                    className="object-cover" 
                  />
                ) : (
                  <User className="w-8 h-8 text-neutral-500" />
                )}
              </div>
              <div className="flex flex-col justify-center">
                <h1 className="text-[16px] md:text-[20px] font-bold text-[#FDFDFD] leading-[28px] md:leading-[34px] tracking-[-0.01em]">
                  {profile.name || profile.username}
                </h1>
                <p className="text-[14px] md:text-[16px] font-normal text-[#A4A7AE] leading-[28px] md:leading-[30px] tracking-[-0.02em]">
                  @{profile.username}
                </p>
              </div>
            </div>

            <div className="flex flex-row items-center gap-[12px] w-full md:w-auto">
              <Link 
                href="/edit-profile"
                className="flex-1 md:flex-none flex justify-center items-center h-[40px] md:h-[48px] px-[16px] md:px-[24px] border border-[#181D27] rounded-[100px] hover:bg-[#181D27] transition-colors cursor-pointer"
              >
                <span className="text-[14px] md:text-[16px] font-bold text-[#FDFDFD] leading-[28px] md:leading-[30px] tracking-[-0.01em]">
                  Edit Profile
                </span>
              </Link>
              <button 
                onClick={handleShareProfile}
                className="flex justify-center items-center w-[40px] h-[40px] md:w-[48px] md:h-[48px] border border-[#181D27] rounded-full hover:bg-[#181D27] transition-colors shrink-0 cursor-pointer"
              >
                <Send className="w-[20px] h-[20px] md:w-[24px] md:h-[24px] text-[#FDFDFD]" />
              </button>
            </div>
          </div>

          <div className="w-full">
            <p className="text-[14px] md:text-[16px] font-normal text-[#FDFDFD] leading-[28px] md:leading-[30px] tracking-[-0.02em]">
              {profile.bio || "Welcome to my profile!"}
            </p>
          </div>

          <div className="flex flex-row items-center justify-between w-full h-[50px] md:h-[66px]">
            <div className="flex flex-col items-center flex-1">
              <span className="text-[18px] md:text-[20px] font-bold text-[#FDFDFD] leading-[32px] md:leading-[34px] tracking-[-0.03em]">{profile.postCount || 0}</span>
              <span className="text-[12px] md:text-[16px] font-normal text-[#A4A7AE] leading-[16px] md:leading-[30px]">Posts</span>
            </div>
            <div className="w-px h-[50px] md:h-[66px] bg-[#181D27]"></div>
            
            <button 
              onClick={() => { setFollowModalType('followers'); setIsFollowModalOpen(true); }}
              className="flex flex-col items-center flex-1 cursor-pointer group hover:opacity-80 transition-opacity"
            >
              <span className="text-[18px] md:text-[20px] font-bold text-[#FDFDFD] leading-[32px] md:leading-[34px] tracking-[-0.03em] group-hover:underline">{profile.followersCount || 0}</span>
              <span className="text-[12px] md:text-[16px] font-normal text-[#A4A7AE] leading-[16px] md:leading-[30px]">Followers</span>
            </button>
            <div className="w-px h-[50px] md:h-[66px] bg-[#181D27]"></div>
            
            <button 
              onClick={() => { setFollowModalType('following'); setIsFollowModalOpen(true); }}
              className="flex flex-col items-center flex-1 cursor-pointer group hover:opacity-80 transition-opacity"
            >
              <span className="text-[18px] md:text-[20px] font-bold text-[#FDFDFD] leading-[32px] md:leading-[34px] tracking-[-0.03em] group-hover:underline">{profile.followingCount || 0}</span>
              <span className="text-[12px] md:text-[16px] font-normal text-[#A4A7AE] leading-[16px] md:leading-[30px]">Following</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col w-full gap-[24px]">
          
          <div className="flex flex-row items-center w-full">
            <button 
              onClick={() => handleTabChange('gallery')}
              className={`flex-1 flex justify-center items-center gap-[8px] md:gap-[12px] h-[48px] transition-colors cursor-pointer ${activeTab === 'gallery' ? 'border-b-[2px] border-[#FDFDFD] text-[#FDFDFD]' : 'border-b border-[#181D27] text-[#A4A7AE] hover:text-[#FDFDFD]'}`}
            >
              <Grid3X3 className="w-[20px] h-[20px] md:w-[24px] md:h-[24px]" />
              <span className={`text-[14px] md:text-[16px] leading-[28px] md:leading-[30px] ${activeTab === 'gallery' ? 'font-bold tracking-[-0.01em]' : 'font-medium'}`}>Gallery</span>
            </button>
            <button 
              onClick={() => handleTabChange('saved')}
              className={`flex-1 flex justify-center items-center gap-[8px] md:gap-[12px] h-[48px] transition-colors cursor-pointer ${activeTab === 'saved' ? 'border-b-[2px] border-[#FDFDFD] text-[#FDFDFD]' : 'border-b border-[#181D27] text-[#A4A7AE] hover:text-[#FDFDFD]'}`}
            >
              <Bookmark className="w-[20px] h-[20px] md:w-[24px] md:h-[24px]" />
              <span className={`text-[14px] md:text-[16px] leading-[28px] md:leading-[30px] ${activeTab === 'saved' ? 'font-bold tracking-[-0.01em]' : 'font-medium'}`}>Saved</span>
            </button>
          </div>

          {isLoadingContent ? (
            <div className="flex justify-center items-center py-20 w-full">
              <Loader2 className="w-8 h-8 text-[#7F51F9] animate-spin" />
            </div>
          ) : currentContent.length === 0 ? (
            <div className="flex flex-col items-center justify-center pt-[40px] md:pt-[60px] gap-[16px] md:gap-[24px] w-full max-w-[361px] md:max-w-[453px] mx-auto text-center">
              <div className="flex flex-col items-center gap-[4px] w-full">
                <h2 className="text-[16px] md:text-[18px] font-bold text-[#FDFDFD] leading-[30px] md:leading-[32px] tracking-[-0.02em] md:tracking-[-0.03em] font-['SF_Pro']">
                  {activeTab === 'gallery' ? 'Your story starts here' : 'No saved posts yet'}
                </h2>
                <p className="text-[14px] md:text-[16px] font-normal text-[#A4A7AE] leading-[28px] md:leading-[30px] tracking-[-0.02em] font-['SF_Pro']">
                  {activeTab === 'gallery' 
                    ? 'Share your first post and let the world see your moments, passions, and memories. Make this space truly yours.' 
                    : 'Posts you save will appear here. Start exploring and save your favorites!'}
                </p>
              </div>
              
              {activeTab === 'gallery' && (
                <Link 
                  href="/add-post"
                  className="flex justify-center items-center px-[24px] h-[40px] md:h-[48px] bg-[#6936F2] hover:bg-[#522BC8] rounded-[100px] transition-colors cursor-pointer mt-[8px]"
                >
                  <span className="text-[14px] md:text-[16px] font-bold text-[#FDFDFD] leading-[28px] md:leading-[30px] tracking-[-0.01em] md:tracking-[-0.02em] font-['SF_Pro']">
                    Create First Post
                  </span>
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-[2px] md:gap-[4px] w-full">
              {currentContent.map((item) => (
                <Link 
                  href={`/post/${item.id}`} 
                  key={item.id} 
                  className="relative aspect-square w-full bg-neutral-900 overflow-hidden hover:opacity-90 transition-opacity rounded-[3px] md:rounded-[6px]"
                >
                  <Image 
                    src={item.imageUrl} 
                    alt={`Post ${item.id}`} 
                    fill 
                    className="object-cover"
                    sizes="(max-width: 768px) 33vw, 268px"
                  />
                </Link>
              ))}
            </div>
          )}

        </div>
      </div>
      
      <FollowListModal 
        isOpen={isFollowModalOpen} 
        onClose={() => setIsFollowModalOpen(false)} 
        type={followModalType} 
      />
    </div>
  );
}