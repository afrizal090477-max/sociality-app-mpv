'use client';

import React, { useState, useEffect, use, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link'; 
import { useRouter } from 'next/navigation';
import { Grid3X3, Heart, ArrowLeft, Loader2, User, Send, CheckCircle } from 'lucide-react';
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
  likesCount: number;
  bio?: string;
  isFollowing: boolean; 
}

interface PostItem {
  id: number;
  imageUrl: string;
}

export default function FriendProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params);
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [likedPosts, setLikedPosts] = useState<PostItem[]>([]);
  const [activeTab, setActiveTab] = useState<'gallery' | 'liked'>('gallery');
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isLoadingContent, setIsLoadingContent] = useState(true);
  const [isFollowLoading, setIsFollowLoading] = useState(false);

  const [isFollowModalOpen, setIsFollowModalOpen] = useState(false);
  const [followModalType, setFollowModalType] = useState<'followers' | 'following'>('followers');

  const fetchGallery = useCallback(async () => {
    setIsLoadingContent(true);
    try {
      const res = await axiosInstance.get(`/users/${username}/posts?page=1&limit=50&t=${Date.now()}`);
      const payload = res.data?.data || res.data;
      const dataArray = payload?.posts || payload?.items || [];
      setPosts(Array.isArray(dataArray) ? dataArray : []);
    } catch (error) {
      console.error('Fetch gallery error:', error);
    } finally {
      setIsLoadingContent(false);
    }
  }, [username]);

  const fetchLiked = useCallback(async () => {
    setIsLoadingContent(true);
    try {
      const res = await axiosInstance.get(`/users/${username}/likes?page=1&limit=50&t=${Date.now()}`);
      const payload = res.data?.data || res.data;
      const dataArray = payload?.posts || payload?.items || payload?.likes || [];
      setLikedPosts(Array.isArray(dataArray) ? dataArray : []);
    } catch (error) {
      console.error('Fetch liked error:', error);
    } finally {
      setIsLoadingContent(false);
    }
  }, [username]);

  const fetchProfileData = useCallback(async () => {
    try {
      const [profileRes, followersRes, followingRes, postsRes, likesRes] = await Promise.all([
        axiosInstance.get(`/users/${username}`),
        axiosInstance.get(`/users/${username}/followers`).catch(() => ({ data: { data: [] } })),
        axiosInstance.get(`/users/${username}/following`).catch(() => ({ data: { data: [] } })),
        axiosInstance.get(`/users/${username}/posts`).catch(() => ({ data: { data: [] } })),
        axiosInstance.get(`/users/${username}/likes`).catch(() => ({ data: { data: [] } }))
      ]);

      const data = profileRes.data?.data || {};
      const profileData = data.profile || data.user || data;

      const followersArray = followersRes.data?.data?.users || followersRes.data?.data?.followers || followersRes.data?.data || [];
      const followingArray = followingRes.data?.data?.users || followingRes.data?.data?.following || followingRes.data?.data || [];
      const postsArray = postsRes.data?.data?.posts || postsRes.data?.data?.items || postsRes.data?.data || [];
      const likesArray = likesRes.data?.data?.likes || likesRes.data?.data?.posts || likesRes.data?.data || [];

      setProfile({
        id: profileData.id,
        name: profileData.name || profileData.username,
        username: profileData.username,
        avatarUrl: profileData.avatarUrl || null,
        bio: profileData.bio || '',
        
        postCount: Array.isArray(postsArray) ? postsArray.length : 0,
        followersCount: Array.isArray(followersArray) ? followersArray.length : 0,
        followingCount: Array.isArray(followingArray) ? followingArray.length : 0,
        likesCount: Array.isArray(likesArray) ? likesArray.length : 0,
        
        isFollowing: profileData.isFollowing || false,
      });
    } catch (error) {
      console.error('Fetch profile error:', error);
      toast.error('Profil tidak ditemukan');
      router.push('/'); 
    }
  }, [username, router]);

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
  }, [fetchProfileData, fetchGallery]); 

  const handleTabChange = (tab: 'gallery' | 'liked') => {
    if (tab === activeTab) return; 
    setActiveTab(tab); 
    if (tab === 'gallery') {
      fetchGallery();
    } else {
      fetchLiked();
    }
  };

  const handleFollowToggle = async () => {
    if (!profile) return;
    const previousState = profile.isFollowing;
    setIsFollowLoading(true);
    
    setProfile({ 
      ...profile, 
      isFollowing: !previousState, 
      followersCount: previousState ? profile.followersCount - 1 : profile.followersCount + 1 
    });
    
    try {
      if (previousState) {
        await axiosInstance.delete(`/follow/${profile.username}`);
      } else {
        await axiosInstance.post(`/follow/${profile.username}`);
      }
      window.dispatchEvent(new Event("profileUpdated"));
    } catch (error) {
      console.error('Follow toggle error:', error);
      toast.error('Gagal memproses aksi');
      setProfile({ ...profile, isFollowing: previousState, followersCount: profile.followersCount });
    } finally {
      setIsFollowLoading(false);
    }
  };

  const handleShareProfile = async () => {
    if (!profile) return;
    const shareUrl = `${window.location.origin}/profile/${profile.username}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: `${profile.username} di Sociality`, url: shareUrl });
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
  
  if (!profile) return null;
  
  const currentContent = activeTab === 'gallery' ? posts : likedPosts;

  return (
    <div className="min-h-screen bg-[#000000] text-white font-['SF_Pro'] relative pb-[100px] md:pb-0">
      
      {/* Cuma tampil di Mobile, di Desktop hilang */}
      <div className="md:hidden sticky top-0 z-50 w-full h-[64px] bg-[#000000] border-b border-[#181D27] flex items-center justify-between px-[16px]">
        <div className="flex items-center gap-[8px]">
          <Link href="/" className="p-1 -ml-1 cursor-pointer hover:opacity-80">
            <ArrowLeft className="w-[24px] h-[24px] text-[#FDFDFD]" />
          </Link>
          <span className="text-[16px] font-bold text-[#FDFDFD] truncate max-w-[200px]">
            {profile.username}
          </span>
        </div>
        
        <div className="relative w-[40px] h-[40px] rounded-full overflow-hidden bg-neutral-900 border border-[#181D27] shrink-0">
          {profile.avatarUrl ? (
            <Image src={profile.avatarUrl} alt={profile.username} fill sizes="40px" className="object-cover" />
          ) : (
            <User className="w-5 h-5 text-neutral-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          )}
        </div>
      </div>

      <div className="flex flex-col items-center w-full max-w-[812px] mx-auto pt-[16px] md:pt-[40px] px-[16px] md:px-0 gap-[24px] md:gap-[40px]">
        {/* 🚀 FIX: Tombol "Back to Home" versi Desktop resmi dihanguskan sesuai Figma! */}

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
              <button 
                onClick={handleFollowToggle}
                disabled={isFollowLoading}
                className={`flex justify-center items-center gap-[8px] h-[40px] md:h-[48px] rounded-[100px] transition-colors cursor-pointer flex-1 md:flex-none ${
                  profile.isFollowing 
                    ? 'md:w-[135px] border border-[#181D27] bg-transparent hover:bg-[#181D27]' 
                    : 'md:w-[99px] bg-[#6936F2] hover:bg-[#522BC8]'
                }`}
              >
                {profile.isFollowing && (
                  <CheckCircle className="w-[16px] h-[16px] md:w-[20px] md:h-[20px] text-[#FDFDFD]" />
                )}
                
                <span className="text-[14px] md:text-[16px] font-bold text-[#FDFDFD] leading-[28px] md:leading-[30px] tracking-[-0.01em] md:tracking-[-0.02em]">
                  {profile.isFollowing ? 'Following' : 'Follow'}
                </span>
              </button>

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
              {profile.bio || "No bio yet."}
            </p>
          </div>

          <div className="flex flex-row items-center justify-between w-full h-[50px] md:h-[66px]">
            <div className="flex flex-col items-center flex-1">
              <span className="text-[16px] md:text-[20px] font-bold text-[#FDFDFD] leading-[32px] md:leading-[34px] tracking-[-0.03em]">{profile.postCount || 0}</span>
              <span className="text-[12px] md:text-[16px] font-normal text-[#A4A7AE] leading-[16px] md:leading-[30px]">Post</span>
            </div>

            <div className="w-px h-[40px] md:h-[66px] bg-[#181D27]"></div>
            
            <button 
              onClick={() => { setFollowModalType('followers'); setIsFollowModalOpen(true); }}
              className="flex flex-col items-center flex-1 cursor-pointer group hover:opacity-80 transition-opacity"
            >
              <span className="text-[16px] md:text-[20px] font-bold text-[#FDFDFD] leading-[32px] md:leading-[34px] tracking-[-0.03em] group-hover:underline">{profile.followersCount || 0}</span>
              <span className="text-[12px] md:text-[16px] font-normal text-[#A4A7AE] leading-[16px] md:leading-[30px]">Followers</span>
            </button>

            <div className="w-px h-[40px] md:h-[66px] bg-[#181D27]"></div>
            
            <button 
              onClick={() => { setFollowModalType('following'); setIsFollowModalOpen(true); }}
              className="flex flex-col items-center flex-1 cursor-pointer group hover:opacity-80 transition-opacity"
            >
              <span className="text-[16px] md:text-[20px] font-bold text-[#FDFDFD] leading-[32px] md:leading-[34px] tracking-[-0.03em] group-hover:underline">{profile.followingCount || 0}</span>
              <span className="text-[12px] md:text-[16px] font-normal text-[#A4A7AE] leading-[16px] md:leading-[30px]">Following</span>
            </button>

            <div className="w-px h-[40px] md:h-[66px] bg-[#181D27]"></div>
            
            <div className="flex flex-col items-center flex-1">
              <span className="text-[16px] md:text-[20px] font-bold text-[#FDFDFD] leading-[32px] md:leading-[34px] tracking-[-0.03em]">{profile.likesCount || 0}</span>
              <span className="text-[12px] md:text-[16px] font-normal text-[#A4A7AE] leading-[16px] md:leading-[30px]">Likes</span>
            </div>
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
              onClick={() => handleTabChange('liked')}
              className={`flex-1 flex justify-center items-center gap-[8px] md:gap-[12px] h-[48px] transition-colors cursor-pointer ${activeTab === 'liked' ? 'border-b-[2px] border-[#FDFDFD] text-[#FDFDFD]' : 'border-b border-[#181D27] text-[#A4A7AE] hover:text-[#FDFDFD]'}`}
            >
              <Heart className={`w-[20px] h-[20px] md:w-[24px] md:h-[24px] ${activeTab === 'liked' ? 'fill-[#FDFDFD]' : ''}`} />
              <span className={`text-[14px] md:text-[16px] leading-[28px] md:leading-[30px] ${activeTab === 'liked' ? 'font-bold tracking-[-0.01em]' : 'font-medium'}`}>Liked</span>
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
                  {activeTab === 'gallery' ? 'No posts yet' : 'No liked posts'}
                </h2>
                <p className="text-[14px] md:text-[16px] font-normal text-[#A4A7AE] leading-[28px] md:leading-[30px] tracking-[-0.02em] font-['SF_Pro']">
                  {activeTab === 'gallery' 
                    ? 'This user hasn\'t shared any posts yet.' 
                    : 'This user hasn\'t liked any posts yet.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-[2px] md:gap-[4px] w-full">
              {currentContent.map((item, index) => (
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
                    priority={false}
                    loading={index < 3 ? "eager" : "lazy"} 
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
        username={profile.username}
      />
    </div>
  );
}