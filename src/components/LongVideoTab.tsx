import React, { useState, useEffect, useRef } from 'react';
import Hls from 'hls.js';
import { VideoItem, UserProfile, UserWallet } from '../types';
import { MOCK_LONG_VIDEOS, DEFAULT_FALLBACK_VIDEO, handleImageError } from '../data';
import { Play, Pause, FastForward, Rewind, Maximize2, Minimize2, Flame, Search, ChevronRight, Heart, Volume2, VolumeX, ArrowUp, Sparkles, AlertCircle, X, SlidersHorizontal, ArrowLeft, Clock, Gem } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BananaApiService } from '../apiService';
import SearchOverlay from './SearchOverlay';

interface LongVideoTabProps {
  profile: UserProfile;
  wallet: UserWallet;
  onUpdateWallet: (wallet: Partial<UserWallet>) => void;
  onUpdateProfile: (profile: Partial<UserProfile>) => void;
  onOpenTopup: (type: 'vip' | 'coin') => void;
  onOpenAiScanner: () => void;
  onFullscreenChange?: (isFullscreen: boolean) => void;
}

export default function LongVideoTab({
  profile,
  wallet,
  onUpdateWallet,
  onUpdateProfile,
  onOpenTopup,
  onOpenAiScanner,
  onFullscreenChange
}: LongVideoTabProps) {
  // Navigation tabs at the top (Image 4)
  const topTabs = ['水晶晶头条', '水晶晶短剧', '自拍偷拍', '制服诱惑', '清纯少女', '无码视频'];
  const [activeTopTab, setActiveTopTab] = useState<string>('水晶晶头条');
  
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showSearchInput, setShowSearchInput] = useState<boolean>(false);
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);
  const [playerLoading, setPlayerLoading] = useState<boolean>(false);
  
  // Footprints (足迹) state backed by localStorage
  const [footprints, setFootprints] = useState<VideoItem[]>([]);
  const [showFootprints, setShowFootprints] = useState<boolean>(false);

  // Guess Like shuffle seed
  const [guessLikeSeed, setGuessLikeSeed] = useState<number>(0);

  // Long video interactions
  const [likedVideos, setLikedVideos] = useState<{ [key: string]: boolean }>({});
  const [dislikedVideos, setDislikedVideos] = useState<{ [key: string]: boolean }>({});
  const [localLikesCount, setLocalLikesCount] = useState<{ [key: string]: number }>({});
  const [favoritedVideos, setFavoritedVideos] = useState<{ [key: string]: boolean }>({});

  // Unified Search Screen overlay state
  const [showSearchScreen, setShowSearchScreen] = useState<boolean>(false);

  // Load footprints, favorites, and likes on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('banana_footprints');
      if (saved) {
        setFootprints(JSON.parse(saved));
      }

      const savedFavs = localStorage.getItem('banana_favorites_long');
      const arr = savedFavs ? JSON.parse(savedFavs) : [];
      const favMap: { [key: string]: boolean } = {};
      arr.forEach((v: any) => {
        favMap[v.id] = true;
      });
      setFavoritedVideos(favMap);

      // Seed baseline likes count & liked/disliked from localStorage
      const localLiked = JSON.parse(localStorage.getItem('banana_liked_long') || '{}');
      const localDisliked = JSON.parse(localStorage.getItem('banana_disliked_long') || '{}');
      const localLikesCountMap = JSON.parse(localStorage.getItem('banana_likes_count_long') || '{}');

      setLikedVideos(localLiked);
      setDislikedVideos(localDisliked);

      const baselineLikes: { [key: string]: number } = {};
      MOCK_LONG_VIDEOS.forEach(v => {
        baselineLikes[v.id] = localLikesCountMap[v.id] !== undefined ? localLikesCountMap[v.id] : (v.favorites || 500);
      });
      setLocalLikesCount(baselineLikes);

      // Load comments map
      const savedComments = localStorage.getItem('banana_long_comments_map');
      if (savedComments) {
        setCommentsMap(JSON.parse(savedComments));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);
  const [hoveredVideoId, setHoveredVideoId] = useState<string | null>(null);
  const [showBackToTop, setShowBackToTop] = useState<boolean>(false);
  const [showPlayOverlay, setShowPlayOverlay] = useState<boolean>(false);
  const longVideoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [isPlayerFullscreen, setIsPlayerFullscreen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Auto-scrolling 3rd-party software ads banner state
  const bannerScrollRef = useRef<HTMLDivElement>(null);
  const softwareAds = [
    {
      id: 'app-tg',
      name: 'Telegram',
      desc: '隐私加密社交',
      tag: '热门',
      icon: '✈️',
      bgGradient: 'from-blue-950/90 via-slate-900/90 to-neutral-950',
      badgeBg: 'bg-sky-400/90 text-black',
      url: 'https://telegram.org',
    },
    {
      id: 'app-tt',
      name: 'TikTok',
      desc: '免拔卡短视频',
      tag: '爆款',
      icon: '🎵',
      bgGradient: 'from-pink-950/90 via-slate-900/90 to-neutral-950',
      badgeBg: 'bg-pink-400/90 text-black',
      url: 'https://tiktok.com',
    },
    {
      id: 'app-pg',
      name: 'PG 电子',
      desc: '爆率全开送金',
      tag: '高返',
      icon: '🎰',
      bgGradient: 'from-amber-950/90 via-slate-900/90 to-neutral-950',
      badgeBg: 'bg-amber-400/90 text-black',
      url: 'https://pgsoft.com',
    },
    {
      id: 'app-bat',
      name: '蝙蝠通讯',
      desc: '端到端私密防封',
      tag: '防封',
      icon: '🦇',
      bgGradient: 'from-purple-950/90 via-slate-900/90 to-neutral-950',
      badgeBg: 'bg-purple-300/90 text-black',
      url: 'https://batchat.com',
    },
  ];

  // Continuous Rightward Smooth Infinite Auto-Scroller
  useEffect(() => {
    let animationFrameId: number;
    const speed = 0.5; // Smooth steady rightward movement speed
    let isInteracting = false;

    const el = bannerScrollRef.current;
    if (!el) return;

    let currentPos = el.scrollLeft;

    const handleInteractionStart = () => { 
      isInteracting = true; 
    };
    const handleInteractionEnd = () => { 
      if (el) currentPos = el.scrollLeft;
      isInteracting = false; 
    };

    el.addEventListener('touchstart', handleInteractionStart, { passive: true });
    el.addEventListener('touchend', handleInteractionEnd, { passive: true });
    el.addEventListener('touchcancel', handleInteractionEnd, { passive: true });
    el.addEventListener('mouseenter', handleInteractionStart);
    el.addEventListener('mouseleave', handleInteractionEnd);

    const step = () => {
      if (!isInteracting && el) {
        const totalSets = 6;
        const singleSetWidth = el.scrollWidth / totalSets;
        if (singleSetWidth > 0) {
          currentPos += speed;
          // When scrolled past set 3, seamlessly jump back by 1 set
          if (currentPos >= singleSetWidth * 3) {
            currentPos -= singleSetWidth;
          }
          el.scrollLeft = currentPos;
        }
      } else if (el) {
        currentPos = el.scrollLeft;
      }
      animationFrameId = requestAnimationFrame(step);
    };

    animationFrameId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(animationFrameId);
      el.removeEventListener('touchstart', handleInteractionStart);
      el.removeEventListener('touchend', handleInteractionEnd);
      el.removeEventListener('touchcancel', handleInteractionEnd);
      el.removeEventListener('mouseenter', handleInteractionStart);
      el.removeEventListener('mouseleave', handleInteractionEnd);
    };
  }, []);

  useEffect(() => {
    if (onFullscreenChange) {
      onFullscreenChange(isPlayerFullscreen);
    }
  }, [isPlayerFullscreen, onFullscreenChange]);

  // HLS stream playback & default video fallback
  useEffect(() => {
    if (!showPlayOverlay || !activeVideo || !longVideoRef.current) return;
    const videoElement = longVideoRef.current;
    const initialUrl = activeVideo.videoUrl || DEFAULT_FALLBACK_VIDEO;

    let hls: Hls | null = null;

    const playStream = (srcUrl: string) => {
      const isHlsStream = srcUrl.includes('.m3u8') || srcUrl.includes('m3u8');
      if (Hls.isSupported() && isHlsStream) {
        if (hls) hls.destroy();
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
        });
        hls.loadSource(srcUrl);
        hls.attachMedia(videoElement);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          videoElement.play().catch(() => {});
        });
        hls.on(Hls.Events.ERROR, (_, data) => {
          if (data.fatal) {
            if (srcUrl !== DEFAULT_FALLBACK_VIDEO) {
              playStream(DEFAULT_FALLBACK_VIDEO);
            } else if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
              hls?.startLoad();
            } else {
              hls?.destroy();
            }
          }
        });
      } else {
        videoElement.src = srcUrl;
        videoElement.play().catch(() => {});
      }
    };

    playStream(initialUrl);

    const handleError = () => {
      if (videoElement.src !== DEFAULT_FALLBACK_VIDEO) {
        playStream(DEFAULT_FALLBACK_VIDEO);
      }
    };

    videoElement.addEventListener('error', handleError);

    return () => {
      videoElement.removeEventListener('error', handleError);
      if (hls) hls.destroy();
    };
  }, [activeVideo?.id, activeVideo?.videoUrl, showPlayOverlay, playerLoading]);

  const togglePlay = () => {
    if (!longVideoRef.current) return;
    if (isPlaying) {
      longVideoRef.current.pause();
      setIsPlaying(false);
    } else {
      longVideoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!longVideoRef.current) return;
    longVideoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleRewind = (seconds: number = 10) => {
    if (!longVideoRef.current) return;
    longVideoRef.current.currentTime = Math.max(0, longVideoRef.current.currentTime - seconds);
    setCurrentTime(longVideoRef.current.currentTime);
  };

  const handleFastForward = (seconds: number = 10) => {
    if (!longVideoRef.current) return;
    const newTime = Math.min(duration || 1000, longVideoRef.current.currentTime + seconds);
    longVideoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = Number(e.target.value);
    if (longVideoRef.current) {
      longVideoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackRate(speed);
    if (longVideoRef.current) {
      longVideoRef.current.playbackRate = speed;
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handlePlayTestVideo = () => {
    const testVideoItem: VideoItem = {
      id: 'test-demo-1080p',
      title: '🎬【官方测试视频】支持播放、暂停、快进+10s、快退-10s、倍速与全屏无遮罩',
      category: '测试视频',
      coverUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=500&q=80',
      gifUrl: 'https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3ZpcjJzdGptZnJpdXB0ZTN3ZWZmaThpdXZzNTY5dm5mOWt0NzA5MyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l0ExdFnI6g8A6SclO/giphy.gif',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      views: 999900,
      favorites: 88800,
      duration: '09:56',
      tags: ['测试视频', '4K超清', '流畅播放', '快进快退'],
      isVipOnly: false
    };
    setActiveVideo(testVideoItem);
    setShowPlayOverlay(true);
    setIsPlaying(true);
    setPlayerLoading(true);
    setTimeout(() => setPlayerLoading(false), 500);
  };

  // Perfecting details page features states
  const [activeDetailTab, setActiveDetailTab] = useState<'info' | 'comments'>('info');
  const [showErrorReportModal, setShowErrorReportModal] = useState<boolean>(false);
  const [errorReportType, setErrorReportType] = useState<string>('加载卡顿/慢');
  const [errorReportDesc, setErrorReportDesc] = useState<string>('');
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [shareVideoTarget, setShareVideoTarget] = useState<VideoItem | null>(null);

  // Comments mapping with localStorage persistence
  const [commentsMap, setCommentsMap] = useState<{[key: string]: Array<{id: string, username: string, avatar: string, content: string, likes: number, date: string, liked?: boolean, isVip?: boolean}>}>({});
  const [newCommentText, setNewCommentText] = useState<string>('');

  // 影片分类 (Detailed multi-filter overlay - Image 1) state
  const [showCategoryOverlay, setShowCategoryOverlay] = useState<boolean>(false);

  // Multi-dimensional filters (Image 1)
  const [filterType, setFilterType] = useState<string>('全部类型');
  const [filterRegion, setFilterRegion] = useState<string>('全部类型');
  const [filterYear, setFilterYear] = useState<string>('全部类型');
  const [filterResolution, setFilterResolution] = useState<string>('全部类型');
  const [filterLength, setFilterLength] = useState<string>('全部类型');
  const [filterCensorship, setFilterCensorship] = useState<string>('全部类型');
  const [filterSubtitle, setFilterSubtitle] = useState<string>('全部类型');
  const [filterSort, setFilterSort] = useState<string>('全部类型');

  // Monitor scroll for back-to-top button
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Autoplay watcher for switching tabs from Short Video Search results
  useEffect(() => {
    const interval = setInterval(() => {
      const autoplayId = localStorage.getItem('banana_autoplay_long_video_id');
      if (autoplayId) {
        localStorage.removeItem('banana_autoplay_long_video_id');
        const video = MOCK_LONG_VIDEOS.find(v => v.id === autoplayId);
        if (video) {
          handlePlayVideo(video);
        }
      }
    }, 300);
    return () => clearInterval(interval);
  }, []);

  // Long video interaction helpers
  const handleLikeVideo = (id: string) => {
    const isLiked = likedVideos[id] ?? false;
    const isDisliked = dislikedVideos[id] ?? false;

    const nextLiked = !isLiked;
    const nextDisliked = isDisliked ? false : isDisliked;
    const nextLikesCount = nextLiked 
      ? (localLikesCount[id] || 500) + 1 
      : (localLikesCount[id] || 500) - 1;

    setLikedVideos(prev => {
      const next = { ...prev, [id]: nextLiked };
      try {
        localStorage.setItem('banana_liked_long', JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });

    if (isDisliked) {
      setDislikedVideos(prev => {
        const next = { ...prev, [id]: false };
        try {
          localStorage.setItem('banana_disliked_long', JSON.stringify(next));
        } catch (e) {
          console.error(e);
        }
        return next;
      });
    }

    setLocalLikesCount(prev => {
      const next = { ...prev, [id]: nextLikesCount };
      try {
        localStorage.setItem('banana_likes_count_long', JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });

    if (nextLiked) {
      alert('👍 感谢点赞！老司机懂行！');
    }
  };

  const handleDislikeVideo = (id: string) => {
    const isLiked = likedVideos[id] ?? false;
    const isDisliked = dislikedVideos[id] ?? false;

    const nextDisliked = !isDisliked;
    const nextLiked = isLiked ? false : isLiked;
    const nextLikesCount = isLiked 
      ? (localLikesCount[id] || 501) - 1 
      : (localLikesCount[id] || 500);

    setDislikedVideos(prev => {
      const next = { ...prev, [id]: nextDisliked };
      try {
        localStorage.setItem('banana_disliked_long', JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });

    if (isLiked) {
      setLikedVideos(prev => {
        const next = { ...prev, [id]: false };
        try {
          localStorage.setItem('banana_liked_long', JSON.stringify(next));
        } catch (e) {
          console.error(e);
        }
        return next;
      });

      setLocalLikesCount(prev => {
        const next = { ...prev, [id]: nextLikesCount };
        try {
          localStorage.setItem('banana_likes_count_long', JSON.stringify(next));
        } catch (e) {
          console.error(e);
        }
        return next;
      });
    }

    if (nextDisliked) {
      alert('👎 已记录您的不感兴趣反馈。我们将为您减少类似影片推荐。');
    }
  };

  const handleFavoriteVideo = (video: VideoItem) => {
    const isFav = favoritedVideos[video.id] ?? false;
    
    try {
      const savedFavs = localStorage.getItem('banana_favorites_long');
      let arr = savedFavs ? JSON.parse(savedFavs) : [];
      if (isFav) {
        arr = arr.filter((f: any) => f.id !== video.id);
        alert('⭐ 已成功取消收藏！');
      } else {
        arr.push(video);
        alert('⭐ 收藏成功！已放入【我的】-【我的收藏】中。');
      }
      localStorage.setItem('banana_favorites_long', JSON.stringify(arr));
      
      setFavoritedVideos(prev => ({
        ...prev,
        [video.id]: !isFav
      }));
    } catch (e) {
      console.error(e);
    }
  };

  const handleShareVideo = (video: VideoItem) => {
    setShareVideoTarget(video);
    setShowShareModal(true);
  };

  // Get comments list with realistic community fallback
  const getCommentsForVideo = (videoId: string) => {
    if (commentsMap[videoId]) {
      return commentsMap[videoId];
    }
    const presets = [
      {
        id: `${videoId}_c1`,
        username: '午夜狂飙老湿',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80',
        content: '画质太牛逼了！1080P无删减，女主角这身材和声音简直让人欲罢不能，冲爆！',
        likes: 128,
        date: '2026-07-16 22:15',
        isVip: true,
        liked: false
      },
      {
        id: `${videoId}_c2`,
        username: '清纯学妹收割机',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80',
        content: '这个剧情绝了，制服教师系列我的最爱。剧情越看越带劲，求多更新同类型的视频！',
        likes: 85,
        date: '2026-07-16 19:40',
        isVip: false,
        liked: false
      },
      {
        id: `${videoId}_c3`,
        username: '秋名山老狼',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
        content: '自营的线路是真的稳定。挂了特制分流专线加载特别快，一秒开播，赞！',
        likes: 54,
        date: '2026-07-15 14:02',
        isVip: true,
        liked: false
      }
    ];
    return presets;
  };

  const handleAddComment = (videoId: string) => {
    if (!newCommentText.trim()) return;
    
    const currentList = getCommentsForVideo(videoId);
    const newComment = {
      id: `${videoId}_user_${Date.now()}`,
      username: profile.username || '神秘游客_586',
      avatar: profile.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
      content: newCommentText,
      likes: 0,
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
      isVip: profile.vipDaysLeft > 0,
      liked: false
    };
    
    const nextList = [newComment, ...currentList];
    const nextMap = { ...commentsMap, [videoId]: nextList };
    
    setCommentsMap(nextMap);
    localStorage.setItem('banana_long_comments_map', JSON.stringify(nextMap));
    setNewCommentText('');
    
    // Reward user
    onUpdateWallet({ goldCoins: wallet.goldCoins + 2 });
    alert('🎉 影评发表成功！感谢您的热辣分享，后台已自动打赏您 2 个金币！');
  };

  const handleLikeComment = (videoId: string, commentId: string) => {
    const currentList = getCommentsForVideo(videoId);
    const nextList = currentList.map(c => {
      if (c.id === commentId) {
        const liked = !c.liked;
        return {
          ...c,
          liked,
          likes: liked ? c.likes + 1 : c.likes - 1
        };
      }
      return c;
    });
    const nextMap = { ...commentsMap, [videoId]: nextList };
    setCommentsMap(nextMap);
    localStorage.setItem('banana_long_comments_map', JSON.stringify(nextMap));
  };

  // Helper method to open categories screen with optional category auto-focus
  const openCategoriesScreen = (categoryFocus?: string) => {
    if (categoryFocus) {
      setFilterType(categoryFocus);
    } else {
      setFilterType('全部类型');
    }
    setShowCategoryOverlay(true);
  };

  // Process video list with both filters
  const processVideos = (videos: VideoItem[], isCategoryPage: boolean) => {
    return videos.filter((v) => {
      // Basic Search filter
      const matchesSearch = searchQuery
        ? v.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
          v.tags.some(tag => tag.includes(searchQuery))
        : true;
      if (!matchesSearch) return false;

      // Category page filters
      if (isCategoryPage) {
        // Row 1: 类型
        if (filterType !== '全部类型') {
          // Map tags or categories
          if (filterType === '水晶晶短剧' && v.category !== '水晶晶短剧' && v.category !== '水晶晶原创' && v.category !== '短剧' && v.category !== '香蕉原创' && !v.title.includes('短剧') && !v.title.includes('原创')) return false;
          if (filterType === '制服诱惑' && v.category !== '制服诱惑' && !v.title.includes('制服')) return false;
          if (filterType === '清纯少女' && v.category !== '清纯少女' && v.category !== '清纯校花' && !v.title.includes('清纯') && !v.title.includes('少女')) return false;
          if (filterType === '水晶晶头条' && v.category !== '水晶晶头条' && v.category !== '香蕉头条' && !v.title.includes('头条')) return false;
        }

        // Row 2: 地区
        if (filterRegion !== '全部类型') {
          if (filterRegion === '国产' && !v.title.includes('国模') && !v.title.includes('网红') && !v.title.includes('自拍')) return false;
          if (filterRegion === '日本' && v.title.includes('国模')) return false;
        }

        // Row 5: 长度
        if (filterLength !== '全部类型') {
          const durationMinutes = parseInt(v.duration.split(':')[0]) || 0;
          if (filterLength === '长片' && durationMinutes < 15) return false;
          if (filterLength === '短片' && durationMinutes >= 15) return false;
        }

        // Row 6: 有无码
        if (filterCensorship !== '全部类型') {
          if (filterCensorship === '无码' && !v.title.includes('无码') && v.id !== 'l5') return false;
          if (filterCensorship === '有码' && (v.title.includes('无码') || v.id === 'l5')) return false;
        }
      } else {
        // Main page tab selection
        if (activeTopTab === '水晶晶头条') {
          // Show headline videos
          return v.category === '香蕉头条' || v.category === '水晶晶头条' || v.title.includes('头条');
        } else if (activeTopTab === '水晶晶短剧') {
          return v.category === '水晶晶短剧' || v.category === '短剧' || v.category === '香蕉原创' || v.category === '水晶晶原创' || v.title.includes('短剧') || v.title.includes('原创');
        } else if (activeTopTab === '制服诱惑') {
          return v.category === '制服诱惑' || v.title.includes('制服');
        } else if (activeTopTab === '清纯少女') {
          return v.category === '清纯校花' || v.title.includes('清纯') || v.title.includes('少女');
        } else if (activeTopTab === '无码视频') {
          return v.title.includes('无码') || v.id === 'l5';
        } else if (activeTopTab === '自拍偷拍') {
          return v.category === '自拍交流' || v.title.includes('自拍');
        }
      }

      return true;
    }).sort((a, b) => {
      if (isCategoryPage && filterSort !== '全部类型') {
        if (filterSort === '最多播放') return b.views - a.views;
        if (filterSort === '最多好评' || filterSort === '最高评分') return b.favorites - a.favorites;
      }
      return 0; // maintain default
    });
  };

  const handlePlayVideo = (video: VideoItem) => {
    if (video.isVipOnly && profile.vipDaysLeft <= 0) {
      alert(`⚠️ 【VIP专属视频】“${video.title}”仅供尊贵VIP专享，请先升级您的会员！`);
      onOpenTopup('vip');
      return;
    }

    if (profile.longVideoTickets <= 0 && profile.vipDaysLeft <= 0) {
      alert('⚠️ 您的长视频免费观影次数已耗尽！请升级尊贵VIP获取无限权益，或兑换充值卡。');
      onOpenTopup('vip');
      return;
    }

    // Deduct ticket if not VIP
    if (profile.vipDaysLeft <= 0) {
      onUpdateProfile({ longVideoTickets: profile.longVideoTickets - 1 });
    }

    // Save to footprints / browsing history
    const nextFootprints = [video, ...footprints.filter((f) => f.id !== video.id)].slice(0, 30);
    setFootprints(nextFootprints);
    try {
      localStorage.setItem('banana_footprints', JSON.stringify(nextFootprints));
    } catch (e) {
      console.error(e);
    }

    setActiveVideo(video);
    setShowPlayOverlay(true);
    setPlayerLoading(true);
    setTimeout(() => setPlayerLoading(false), 1200);
  };

  // Define section-specific video lists for the main screen feed (Image 2 & 3 style)
  const bananaHeadlines = MOCK_LONG_VIDEOS.filter(v => v.category === '香蕉头条' || v.category === '水晶晶头条' || v.title.includes('头条'));
  const uniformVideos = MOCK_LONG_VIDEOS.filter(v => v.category === '制服诱惑' || v.title.includes('制服'));
  const pureMaidenVideos = MOCK_LONG_VIDEOS.filter(v => v.category === '清纯校花' || v.title.includes('清纯'));
  const uncensoredVideos = MOCK_LONG_VIDEOS.filter(v => v.title.includes('无码') || v.id === 'l5');

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar pb-24 text-white">
      
      {/* 1. Top Navigation & App Banner */}
      <div className="bg-gradient-to-r from-brand-purple to-[#4a00e0] px-4 py-2 flex items-center justify-between text-xs sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-2">
          <span className="text-xl">🔥</span>
          <div>
            <p className="font-bold text-white flex items-center gap-1">
              水晶晶-官方影视 <span className="text-[9px] bg-brand-gold text-black px-1.5 py-0.5 rounded font-black">PRO</span>
            </p>
            <p className="text-[10px] text-purple-200">极速线路 · 超清画质 · 无感翻墙</p>
          </div>
        </div>
        <button 
          onClick={() => openCategoriesScreen()}
          className="px-3 py-1 rounded-full bg-brand-gold hover:brightness-110 text-black font-black text-[11px] transition-all flex items-center gap-0.5 shadow-sm"
        >
          <SlidersHorizontal className="w-3 h-3" />
          <span>影片分类</span>
        </button>
      </div>

      {/* 2. Brand Studio Header with icons (Image 4 style) */}
      <div className="p-4 pb-2 bg-brand-bg flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {/* Beautified Crystal Gem Logo Icon */}
          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-neutral-900 via-slate-900 to-black border border-cyan-400/30 shadow-[0_0_8px_rgba(34,211,238,0.25)] shrink-0">
            <Gem className="w-4.5 h-4.5 text-amber-300 drop-shadow-[0_0_6px_rgba(251,191,36,0.8)]" />
          </div>

          <div className="flex flex-col justify-center w-fit">
            {/* "水晶晶视频" Title */}
            <h1 
              className="text-xl sm:text-2xl font-black tracking-tight select-none font-sans leading-none whitespace-nowrap"
              style={{
                backgroundImage: `linear-gradient(135deg, #fef08a 0%, #38bdf8 30%, #c084fc 60%, #f472b6 85%, #fef08a 100%), url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23ffffff' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 3h12l4 6-10 12L2 9z'/%3E%3C/svg%3E")`,
                backgroundSize: '200% 200%, 16px 16px',
                backgroundBlendMode: 'overlay',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              水晶晶视频
            </h1>
            {/* "Crystal Vision" spanned to exact full width of "水晶晶视频" so 'n' ends at '频' */}
            <div 
              className="w-full flex justify-between items-center text-[8.5px] font-serif font-bold text-cyan-200/90 mt-1 select-none leading-none"
              style={{ fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif' }}
            >
              <span>C</span><span>r</span><span>y</span><span>s</span><span>t</span><span>a</span><span>l</span><span className="w-1 inline-block"></span><span>V</span><span>i</span><span>s</span><span>i</span><span>o</span><span>n</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <button 
            onClick={() => setShowFootprints(true)}
            className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-800 hover:border-brand-purple flex items-center justify-center text-brand-purple transition-all"
            title="足迹 (历史记录)"
          >
            <Clock className="w-4 h-4 text-brand-purple" />
          </button>
          <button 
            onClick={() => setShowSearchScreen(true)}
            className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-800 hover:border-brand-purple flex items-center justify-center text-gray-400 hover:text-white transition-all"
            title="分类检索"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4-Column Continuous Rightward Auto-Scrolling Sleek 3rd-Party Ads Banner */}
      <div className="px-4 pb-2">
        <div 
          ref={bannerScrollRef}
          className="w-full overflow-x-auto touch-pan-x no-scrollbar flex gap-2 select-none py-0.5"
        >
          {Array(6).fill(softwareAds).flat().map((ad, idx) => (
            <div
              key={`${ad.id}-${idx}`}
              onClick={() => {
                try {
                  window.open(ad.url, '_blank', 'noopener,noreferrer');
                } catch {
                  window.location.href = ad.url;
                }
              }}
              className="shrink-0 w-[calc(25%-6px)] h-[68px] rounded-xl bg-gradient-to-b from-neutral-900/95 via-neutral-900/70 to-black/95 p-1.5 flex flex-col items-center justify-center text-center border border-white/10 hover:border-amber-400/60 shadow-md cursor-pointer hover:scale-[1.03] active:scale-95 transition-all relative overflow-hidden group"
            >
              {/* Badge Tag */}
              <span className={`text-[7.5px] font-black px-1.5 py-0.2 rounded-full absolute top-1 right-1 shadow-sm ${ad.badgeBg}`}>
                {ad.tag}
              </span>

              {/* Icon */}
              <div className="w-6 h-6 rounded-lg bg-black/50 border border-white/10 flex items-center justify-center text-xs shadow-inner shrink-0 group-hover:scale-110 transition-transform">
                {ad.icon}
              </div>

              {/* Text Info */}
              <div className="min-w-0 w-full mt-1">
                <h4 className="text-[10px] font-black text-white truncate leading-tight drop-shadow-sm">{ad.name}</h4>
                <p className="text-[8px] text-gray-400 truncate opacity-80 mt-0.5">{ad.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Horizontal Category Tabs (Image 4 top menu) */}
      <div className="px-4 pb-2">
        <div className="flex bg-[#1d1d1d] p-1 rounded-full gap-1 border border-neutral-800/80 overflow-x-auto no-scrollbar">
          {topTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTopTab(tab);
                setSearchQuery('');
              }}
              className={`flex-1 py-1.5 px-4 text-[11px] font-bold rounded-full whitespace-nowrap transition-all ${
                activeTopTab === tab 
                  ? 'bg-brand-gradient text-white shadow-md' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* 4. High-Fidelity Promotional Ad Banner (Image 4 mockup) */}
      <div className="px-4 py-2">
        <div 
          onClick={() => {
            alert('🎰 官方直营 新葡京大放水 模拟开启！已为您派送 ¥1,888 注册模拟彩金，即将为您跳转到游戏大厅中查收！');
            onUpdateWallet({ gameBalance: wallet.gameBalance + 1888 });
            document.getElementById('nav-chess')?.click();
          }}
          className="relative bg-gradient-to-r from-red-600 via-amber-600 to-yellow-500 p-3 rounded-2xl border-2 border-yellow-300/90 overflow-hidden cursor-pointer shadow-[0_0_20px_rgba(234,179,8,0.4)] hover:scale-[1.01] transition-all flex items-center gap-3 group"
        >
          {/* Ad Badge */}
          <span className="absolute top-0 left-0 bg-gradient-to-r from-red-700 to-pink-600 text-white text-[9px] font-black px-2 py-0.5 rounded-br-xl shadow-md border-r border-b border-yellow-300/80">
            🔥 顶级赞助商
          </span>
          
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-yellow-300 via-amber-400 to-yellow-500 border-2 border-white flex items-center justify-center text-2xl font-bold text-black shrink-0 shadow-lg group-hover:rotate-6 transition-transform">
            🎰
          </div>
          <div className="flex-1 min-w-0 pt-1">
            <h4 className="text-xs font-black text-white flex items-center gap-1">
              澳门新葡京 <span className="text-yellow-200 font-extrabold bg-red-950/80 px-1.5 py-0.5 rounded border border-yellow-400/60 shadow-sm">PG放水送1888</span>
            </h4>
            <p className="text-[10px] text-yellow-100 font-bold truncate mt-0.5 drop-shadow">
              💥 注册即赠 1888 金币！爆率 99.8% · 极速自动提款
            </p>
          </div>
          <div className="bg-gradient-to-r from-yellow-300 to-amber-400 hover:from-yellow-200 hover:to-amber-300 text-black text-[11px] font-black py-1.5 px-3 rounded-xl shrink-0 transition-all shadow-lg shadow-yellow-500/40 flex items-center gap-1 group-hover:scale-105">
            <span>领彩金</span>
            <span className="text-xs">➔</span>
          </div>
        </div>
      </div>

      {/* 5. Main Feed Sections Layout */}
      {activeTopTab !== '水晶晶头条' || searchQuery ? (
        <div className="p-4">
          <h3 className="text-xs font-black tracking-wider text-gray-400 mb-3">
            {searchQuery ? `🔍 搜索结果: "${searchQuery}"` : `📂 ${activeTopTab} 影片列表`}
          </h3>
          <div className="grid grid-cols-2 gap-3 pb-24">
            {processVideos(MOCK_LONG_VIDEOS, false).map((video) => (
              <div 
                key={video.id} 
                onClick={() => handlePlayVideo(video)}
                className="group bg-brand-card rounded-xl overflow-hidden border border-neutral-800 flex flex-col justify-between shadow-sm cursor-pointer"
              >
                <div className="relative aspect-[16/10] bg-black overflow-hidden">
                  <img src={video.coverUrl} alt={video.title} onError={handleImageError} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" referrerPolicy="no-referrer" />
                  <span className="absolute bottom-1 right-1 bg-black/75 px-1 py-0.2 rounded text-[8px] font-mono">{video.duration}</span>
                  {video.isVipOnly && <span className="absolute top-1 left-1 bg-brand-gold text-black text-[8px] font-black px-1 rounded">VIP</span>}
                </div>
                <div className="p-2 space-y-1">
                  <h4 className="text-[10px] font-bold text-gray-200 line-clamp-2 leading-relaxed hover:text-brand-purple transition-colors">{video.title}</h4>
                  <div className="flex justify-between items-center text-[8px] text-gray-500">
                    <span>🔥 {(video.views / 1000).toFixed(1)}k</span>
                    <span>⭐ {video.favorites}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-4 space-y-6 pb-24">

          {/* 1. 最新视频 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-brand-purple/20 pb-2 bg-gradient-to-r from-brand-purple/10 to-transparent p-2 rounded-lg">
              <div className="flex items-center gap-1.5 text-white">
                <span className="text-brand-purple font-black">//</span>
                <h3 className="font-extrabold text-xs tracking-wider">最新视频</h3>
              </div>
              <button 
                onClick={() => openCategoriesScreen('最新视频')}
                className="text-[10px] text-gray-400 hover:text-brand-purple flex items-center gap-0.5"
              >
                <span>更多</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {MOCK_LONG_VIDEOS.filter(v => v.category === '最新视频').slice(0, 2).map((video) => (
                <div 
                  key={video.id} 
                  onClick={() => handlePlayVideo(video)}
                  className="group bg-brand-card rounded-xl overflow-hidden border border-neutral-800 flex flex-col justify-between shadow-sm cursor-pointer"
                >
                  <div className="relative aspect-[16/10] bg-black overflow-hidden">
                    <img src={video.coverUrl} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" referrerPolicy="no-referrer" />
                    <span className="absolute bottom-1 right-1 bg-black/75 px-1 py-0.2 rounded text-[8px] font-mono">{video.duration}</span>
                    {video.isVipOnly && <span className="absolute top-1 left-1 bg-brand-gold text-black text-[8px] font-black px-1 rounded">VIP</span>}
                  </div>
                  <div className="p-2 space-y-1">
                    <h4 className="text-[10px] font-bold text-gray-200 line-clamp-2 leading-relaxed hover:text-brand-purple transition-colors">{video.title}</h4>
                    <div className="flex justify-between items-center text-[8px] text-gray-500">
                      <span>🔥 {(video.views / 1000).toFixed(1)}k</span>
                      <span>⭐ {video.favorites}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2. 热门视频 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-brand-purple/20 pb-2 bg-gradient-to-r from-brand-purple/10 to-transparent p-2 rounded-lg">
              <div className="flex items-center gap-1.5 text-white">
                <span className="text-brand-purple font-black">//</span>
                <h3 className="font-extrabold text-xs tracking-wider">热门视频</h3>
              </div>
              <button 
                onClick={() => openCategoriesScreen('热门视频')}
                className="text-[10px] text-gray-400 hover:text-brand-purple flex items-center gap-0.5"
              >
                <span>更多</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {MOCK_LONG_VIDEOS.filter(v => v.category === '热门视频').slice(0, 2).map((video) => (
                <div 
                  key={video.id} 
                  onClick={() => handlePlayVideo(video)}
                  className="group bg-brand-card rounded-xl overflow-hidden border border-neutral-800 flex flex-col justify-between shadow-sm cursor-pointer"
                >
                  <div className="relative aspect-[16/10] bg-black overflow-hidden">
                    <img src={video.coverUrl} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" referrerPolicy="no-referrer" />
                    <span className="absolute bottom-1 right-1 bg-black/75 px-1 py-0.2 rounded text-[8px] font-mono">{video.duration}</span>
                    {video.isVipOnly && <span className="absolute top-1 left-1 bg-brand-gold text-black text-[8px] font-black px-1 rounded">VIP</span>}
                  </div>
                  <div className="p-2 space-y-1">
                    <h4 className="text-[10px] font-bold text-gray-200 line-clamp-2 leading-relaxed hover:text-brand-purple transition-colors">{video.title}</h4>
                    <div className="flex justify-between items-center text-[8px] text-gray-500">
                      <span>🔥 {(video.views / 1000).toFixed(1)}k</span>
                      <span>⭐ {video.favorites}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ad Slot 1 (After 2 items) */}
          <div 
            onClick={() => {
              alert('🎰 官方直营 太阳城集团 PG电子大放水！已为您模拟加赠 ¥888 游戏金币，并正在跳转至娱乐游戏大厅...');
              onUpdateWallet({ goldCoins: wallet.goldCoins + 888 });
              document.getElementById('nav-chess')?.click();
            }}
            className="relative bg-gradient-to-r from-red-900 via-amber-900 to-red-950 p-3 rounded-2xl border-2 border-yellow-400/80 overflow-hidden cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.35)] flex items-center justify-between text-xs hover:scale-[1.01] transition-all group"
          >
            <span className="absolute top-0 right-0 bg-yellow-400 text-black text-[8px] font-black px-2 py-0.5 rounded-bl-xl shadow-md">
              💥 爆率 99.8%
            </span>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-300 to-amber-500 border border-white flex items-center justify-center text-xl shadow-md shrink-0 group-hover:scale-110 transition-transform">
                🎰
              </div>
              <div>
                <h4 className="font-black text-white text-xs flex items-center gap-1">
                  PG麻将胡了：<span className="text-yellow-300 font-black">单发独赢爆巨彩！</span>
                </h4>
                <p className="text-[10px] text-amber-200 mt-0.5 font-bold">太阳城首存送包赔，100%极速提款到账</p>
              </div>
            </div>
            <span className="text-[10px] bg-gradient-to-r from-yellow-300 to-amber-400 text-black px-3 py-1.5 rounded-xl font-black shadow-md shrink-0 group-hover:brightness-110 flex items-center gap-1">
              <span>立即爆金</span>
              <span>➔</span>
            </span>
          </div>

          {/* 3. 猜你喜欢 (Interactive deterministic shuffle) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-brand-purple/20 pb-2 bg-gradient-to-r from-brand-purple/10 to-transparent p-2 rounded-lg">
              <div className="flex items-center gap-1.5 text-white">
                <span className="text-brand-purple font-black">//</span>
                <h3 className="font-extrabold text-xs tracking-wider">猜你喜欢</h3>
              </div>
              <button 
                onClick={() => setGuessLikeSeed(prev => prev + 1)}
                className="text-[10px] text-brand-purple font-bold hover:brightness-110 flex items-center gap-1 bg-brand-purple/10 border border-brand-purple/20 px-2.5 py-1 rounded-full transition-all active:scale-95"
              >
                <span>换一批</span>
                <span className="inline-block animate-spin" style={{ animationDuration: '4s' }}>🔄</span>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {MOCK_LONG_VIDEOS.filter(v => v.category === '猜你喜欢')
                .sort((a, b) => Math.sin(a.id.charCodeAt(1) + guessLikeSeed) - Math.sin(b.id.charCodeAt(1) + guessLikeSeed))
                .slice(0, 2).map((video) => (
                  <div 
                    key={video.id} 
                    onClick={() => handlePlayVideo(video)}
                    className="group bg-brand-card rounded-xl overflow-hidden border border-neutral-800 flex flex-col justify-between shadow-sm cursor-pointer"
                  >
                    <div className="relative aspect-[16/10] bg-black overflow-hidden">
                      <img src={video.coverUrl} alt={video.title} onError={handleImageError} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" referrerPolicy="no-referrer" />
                      <span className="absolute bottom-1 right-1 bg-black/75 px-1 py-0.2 rounded text-[8px] font-mono">{video.duration}</span>
                      {video.isVipOnly && <span className="absolute top-1 left-1 bg-brand-gold text-black text-[8px] font-black px-1 rounded">VIP</span>}
                    </div>
                    <div className="p-2 space-y-1">
                      <h4 className="text-[10px] font-bold text-gray-200 line-clamp-2 leading-relaxed hover:text-brand-purple transition-colors">{video.title}</h4>
                      <div className="flex justify-between items-center text-[8px] text-gray-500">
                        <span>🔥 {(video.views / 1000).toFixed(1)}k</span>
                        <span>⭐ {video.favorites}</span>
                      </div>
                    </div>
                  </div>
              ))}
            </div>
          </div>

          {/* 4. 自拍偷拍 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-brand-purple/20 pb-2 bg-gradient-to-r from-brand-purple/10 to-transparent p-2 rounded-lg">
              <div className="flex items-center gap-1.5 text-white">
                <span className="text-brand-purple font-black">//</span>
                <h3 className="font-extrabold text-xs tracking-wider">自拍偷拍</h3>
              </div>
              <button 
                onClick={() => openCategoriesScreen('自拍偷拍')}
                className="text-[10px] text-gray-400 hover:text-brand-purple flex items-center gap-0.5"
              >
                <span>更多</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {MOCK_LONG_VIDEOS.filter(v => v.category === '自拍偷拍').slice(0, 2).map((video) => (
                <div 
                  key={video.id} 
                  onClick={() => handlePlayVideo(video)}
                  className="group bg-brand-card rounded-xl overflow-hidden border border-neutral-800 flex flex-col justify-between shadow-sm cursor-pointer"
                >
                  <div className="relative aspect-[16/10] bg-black overflow-hidden">
                    <img src={video.coverUrl} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" referrerPolicy="no-referrer" />
                    <span className="absolute bottom-1 right-1 bg-black/75 px-1 py-0.2 rounded text-[8px] font-mono">{video.duration}</span>
                    {video.isVipOnly && <span className="absolute top-1 left-1 bg-brand-gold text-black text-[8px] font-black px-1 rounded">VIP</span>}
                  </div>
                  <div className="p-2 space-y-1">
                    <h4 className="text-[10px] font-bold text-gray-200 line-clamp-2 leading-relaxed hover:text-brand-purple transition-colors">{video.title}</h4>
                    <div className="flex justify-between items-center text-[8px] text-gray-500">
                      <span>🔥 {(video.views / 1000).toFixed(1)}k</span>
                      <span>⭐ {video.favorites}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ad Slot 2 (After 4 items) */}
          <div 
            onClick={() => {
              alert('💋 AG亚游真人视讯：性感荷官在线发牌！为您加送 ¥500 模拟彩金，正在为您跳转至游戏大厅...');
              onUpdateWallet({ gameBalance: wallet.gameBalance + 500 });
              document.getElementById('nav-chess')?.click();
            }}
            className="relative bg-gradient-to-r from-purple-900 via-indigo-900 to-blue-950 p-3 rounded-2xl border-2 border-indigo-400/80 overflow-hidden cursor-pointer shadow-[0_0_15px_rgba(99,102,241,0.35)] flex items-center justify-between text-xs hover:scale-[1.01] transition-all group"
          >
            <span className="absolute top-0 right-0 bg-indigo-500 text-white text-[8px] font-black px-2 py-0.5 rounded-bl-xl shadow-md">
              👑 顶级发牌
            </span>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-600 border border-white/60 flex items-center justify-center text-xl shadow-md shrink-0 group-hover:scale-110 transition-transform">
                👩‍💼
              </div>
              <div>
                <h4 className="font-black text-white text-xs flex items-center gap-1">
                  AG真人视讯：<span className="text-indigo-300 font-black">性感空姐、制服荷官实时发牌！</span>
                </h4>
                <p className="text-[10px] text-indigo-200 mt-0.5 font-bold">4K 极速无损推流 · 私人对战体验</p>
              </div>
            </div>
            <span className="text-[10px] bg-gradient-to-r from-indigo-400 to-purple-500 text-white px-3 py-1.5 rounded-xl font-black shadow-md shrink-0 group-hover:brightness-110 flex items-center gap-1">
              <span>立即入桌</span>
              <span>➔</span>
            </span>
          </div>

          {/* 5. 成人动漫 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-brand-purple/20 pb-2 bg-gradient-to-r from-brand-purple/10 to-transparent p-2 rounded-lg">
              <div className="flex items-center gap-1.5 text-white">
                <span className="text-brand-purple font-black">//</span>
                <h3 className="font-extrabold text-xs tracking-wider">成人动漫</h3>
              </div>
              <button 
                onClick={() => openCategoriesScreen('成人动漫')}
                className="text-[10px] text-gray-400 hover:text-brand-purple flex items-center gap-0.5"
              >
                <span>更多</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {MOCK_LONG_VIDEOS.filter(v => v.category === '成人动漫').slice(0, 2).map((video) => (
                <div 
                  key={video.id} 
                  onClick={() => handlePlayVideo(video)}
                  className="group bg-brand-card rounded-xl overflow-hidden border border-neutral-800 flex flex-col justify-between shadow-sm cursor-pointer"
                >
                  <div className="relative aspect-[16/10] bg-black overflow-hidden">
                    <img src={video.coverUrl} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" referrerPolicy="no-referrer" />
                    <span className="absolute bottom-1 right-1 bg-black/75 px-1 py-0.2 rounded text-[8px] font-mono">{video.duration}</span>
                    {video.isVipOnly && <span className="absolute top-1 left-1 bg-brand-gold text-black text-[8px] font-black px-1 rounded">VIP</span>}
                  </div>
                  <div className="p-2 space-y-1">
                    <h4 className="text-[10px] font-bold text-gray-200 line-clamp-2 leading-relaxed hover:text-brand-purple transition-colors">{video.title}</h4>
                    <div className="flex justify-between items-center text-[8px] text-gray-500">
                      <span>🔥 {(video.views / 1000).toFixed(1)}k</span>
                      <span>⭐ {video.favorites}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 6. 经典伦理 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-brand-purple/20 pb-2 bg-gradient-to-r from-brand-purple/10 to-transparent p-2 rounded-lg">
              <div className="flex items-center gap-1.5 text-white">
                <span className="text-brand-purple font-black">//</span>
                <h3 className="font-extrabold text-xs tracking-wider">经典伦理</h3>
              </div>
              <button 
                onClick={() => openCategoriesScreen('经典伦理')}
                className="text-[10px] text-gray-400 hover:text-brand-purple flex items-center gap-0.5"
              >
                <span>更多</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {MOCK_LONG_VIDEOS.filter(v => v.category === '经典伦理').slice(0, 2).map((video) => (
                <div 
                  key={video.id} 
                  onClick={() => handlePlayVideo(video)}
                  className="group bg-brand-card rounded-xl overflow-hidden border border-neutral-800 flex flex-col justify-between shadow-sm cursor-pointer"
                >
                  <div className="relative aspect-[16/10] bg-black overflow-hidden">
                    <img src={video.coverUrl} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" referrerPolicy="no-referrer" />
                    <span className="absolute bottom-1 right-1 bg-black/75 px-1 py-0.2 rounded text-[8px] font-mono">{video.duration}</span>
                    {video.isVipOnly && <span className="absolute top-1 left-1 bg-brand-gold text-black text-[8px] font-black px-1 rounded">VIP</span>}
                  </div>
                  <div className="p-2 space-y-1">
                    <h4 className="text-[10px] font-bold text-gray-200 line-clamp-2 leading-relaxed hover:text-brand-purple transition-colors">{video.title}</h4>
                    <div className="flex justify-between items-center text-[8px] text-gray-500">
                      <span>🔥 {(video.views / 1000).toFixed(1)}k</span>
                      <span>⭐ {video.favorites}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ad Slot 3 (After 6 items) */}
          <div 
            onClick={() => {
              alert('⚽ 沙巴体育：首存送100%返利，投注即送豪礼！正在为您切换至极速游戏体育分会场...');
              // Real jump/navigation!
              document.getElementById('nav-games')?.click();
            }}
            className="bg-gradient-to-r from-emerald-900 via-teal-900 to-green-900 p-2.5 rounded-lg border border-emerald-500/20 overflow-hidden cursor-pointer shadow flex items-center justify-between text-xs hover:brightness-105 transition-all"
          >
            <div className="flex items-center gap-2">
              <span className="text-base">⚽</span>
              <div>
                <h4 className="font-bold text-white flex items-center gap-1">
                  沙巴体育：<span className="text-emerald-300 font-bold">2026年世界杯热门盘口火热开盘！</span>
                </h4>
                <p className="text-[9px] text-emerald-200">滚球极速确认，智能统计助您连红赢大奖</p>
              </div>
            </div>
            <span className="text-[9px] bg-emerald-600 px-1.5 py-0.5 rounded text-white font-bold">立即投注</span>
          </div>

          {/* 7. 中文字幕 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-brand-purple/20 pb-2 bg-gradient-to-r from-brand-purple/10 to-transparent p-2 rounded-lg">
              <div className="flex items-center gap-1.5 text-white">
                <span className="text-brand-purple font-black">//</span>
                <h3 className="font-extrabold text-xs tracking-wider">中文字幕</h3>
              </div>
              <button 
                onClick={() => openCategoriesScreen('中文字幕')}
                className="text-[10px] text-gray-400 hover:text-brand-purple flex items-center gap-0.5"
              >
                <span>更多</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {MOCK_LONG_VIDEOS.filter(v => v.category === '中文字幕').slice(0, 2).map((video) => (
                <div 
                  key={video.id} 
                  onClick={() => handlePlayVideo(video)}
                  className="group bg-brand-card rounded-xl overflow-hidden border border-neutral-800 flex flex-col justify-between shadow-sm cursor-pointer"
                >
                  <div className="relative aspect-[16/10] bg-black overflow-hidden">
                    <img src={video.coverUrl} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" referrerPolicy="no-referrer" />
                    <span className="absolute bottom-1 right-1 bg-black/75 px-1 py-0.2 rounded text-[8px] font-mono">{video.duration}</span>
                    {video.isVipOnly && <span className="absolute top-1 left-1 bg-brand-gold text-black text-[8px] font-black px-1 rounded">VIP</span>}
                  </div>
                  <div className="p-2 space-y-1">
                    <h4 className="text-[10px] font-bold text-gray-200 line-clamp-2 leading-relaxed hover:text-brand-purple transition-colors">{video.title}</h4>
                    <div className="flex justify-between items-center text-[8px] text-gray-500">
                      <span>🔥 {(video.views / 1000).toFixed(1)}k</span>
                      <span>⭐ {video.favorites}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 8. 不雅视频 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-brand-purple/20 pb-2 bg-gradient-to-r from-brand-purple/10 to-transparent p-2 rounded-lg">
              <div className="flex items-center gap-1.5 text-white">
                <span className="text-brand-purple font-black">//</span>
                <h3 className="font-extrabold text-xs tracking-wider">不雅视频</h3>
              </div>
              <button 
                onClick={() => openCategoriesScreen('不雅视频')}
                className="text-[10px] text-gray-400 hover:text-brand-purple flex items-center gap-0.5"
              >
                <span>更多</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {MOCK_LONG_VIDEOS.filter(v => v.category === '不雅视频').slice(0, 2).map((video) => (
                <div 
                  key={video.id} 
                  onClick={() => handlePlayVideo(video)}
                  className="group bg-brand-card rounded-xl overflow-hidden border border-neutral-800 flex flex-col justify-between shadow-sm cursor-pointer"
                >
                  <div className="relative aspect-[16/10] bg-black overflow-hidden">
                    <img src={video.coverUrl} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" referrerPolicy="no-referrer" />
                    <span className="absolute bottom-1 right-1 bg-black/75 px-1 py-0.2 rounded text-[8px] font-mono">{video.duration}</span>
                    {video.isVipOnly && <span className="absolute top-1 left-1 bg-brand-gold text-black text-[8px] font-black px-1 rounded">VIP</span>}
                  </div>
                  <div className="p-2 space-y-1">
                    <h4 className="text-[10px] font-bold text-gray-200 line-clamp-2 leading-relaxed hover:text-brand-purple transition-colors">{video.title}</h4>
                    <div className="flex justify-between items-center text-[8px] text-gray-500">
                      <span>🔥 {(video.views / 1000).toFixed(1)}k</span>
                      <span>⭐ {video.favorites}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ad Slot 4 (After 8 items) */}
          <div 
            onClick={() => {
              alert('👑 恭喜触发超级黄金VIP尊贵名额！正在为您打开特权升舱通道...');
              onOpenTopup('vip');
            }}
            className="bg-gradient-to-r from-yellow-600 via-amber-600 to-amber-700 p-3 rounded-lg border border-yellow-500/40 overflow-hidden cursor-pointer shadow flex items-center justify-between text-xs hover:brightness-105 transition-all animate-pulse"
          >
            <div className="flex items-center gap-2">
              <span className="text-base">👑</span>
              <div>
                <h4 className="font-bold text-white flex items-center gap-1">
                  开通尊贵VIP：<span className="text-yellow-200 font-bold">每日无限次观影超清1080P！</span>
                </h4>
                <p className="text-[9px] text-yellow-100">一次升级，全网长短视频全部免费，独享尊贵特权</p>
              </div>
            </div>
            <span className="text-[9px] bg-yellow-400 text-black px-2 py-1 rounded font-black">限时升级</span>
          </div>

        </div>
      )}

      {/* Floating Sparkles & Back to top */}
      <div className="fixed bottom-24 right-4 flex flex-col gap-2.5 z-40">
        <button
          onClick={onOpenAiScanner}
          className="relative group w-12 h-12 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-pink-500/30 hover:scale-105 transition-all animate-bounce"
        >
          <Sparkles className="w-5 h-5" />
          <span className="absolute right-14 bg-black/80 border border-pink-500/30 text-white text-[10px] font-bold py-1 px-2 rounded-lg whitespace-nowrap shadow-md pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
            ✨ AI 裸体魔镜
          </span>
        </button>

        {showBackToTop && (
          <button
            onClick={handleScrollToTop}
            className="w-12 h-12 rounded-full bg-[#2a2a2a] border border-white/15 text-gray-300 flex items-center justify-center shadow-lg hover:bg-[#363636] transition-colors"
          >
            <ArrowUp className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* 6. HIGH-FIDELITY "影片分类" FULLSCREEN DETAILED FILTER SCREEN (IMAGE 1) */}
      <AnimatePresence>
        {showCategoryOverlay && (
          <motion.div
            key="category-overlay-panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 220 }}
            className="absolute inset-0 w-full bg-brand-bg z-45 flex flex-col text-white shadow-2xl pb-[60px]"
          >
            {/* Header (Back, Title, Search) */}
            <div className="flex items-center justify-between p-4 bg-[#161616] border-b border-neutral-800">
              <button 
                onClick={() => setShowCategoryOverlay(false)}
                className="p-1 rounded-full hover:bg-white/5 text-gray-300 hover:text-white transition-colors flex items-center gap-1 text-xs font-bold"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="text-sm font-black tracking-widest text-center flex-1">影片分类</h2>
              <button 
                onClick={() => {
                  setShowCategoryOverlay(false);
                  setShowSearchScreen(true);
                }}
                className="text-xs font-bold text-gray-300 hover:text-white flex items-center gap-1 bg-brand-card py-1 px-3.5 rounded-full border border-neutral-800"
              >
                <Search className="w-3.5 h-3.5" />
                <span>搜索</span>
              </button>
            </div>

            {/* Filter Buttons Matrix (Image 1 replica layout) */}
            <div className="p-4 space-y-3 bg-[#181818] border-b border-neutral-800/80 overflow-y-auto max-h-[45vh] no-scrollbar">
              
              {/* Row 1: 类型 */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                <span className="text-[10px] font-black text-brand-purple shrink-0 bg-brand-purple/10 px-2 py-1 rounded border border-brand-purple/20">类型</span>
                {['全部类型', '水晶晶短剧', '制服诱惑', '清纯少女', '辣妹大奶', '女同'].map((item) => (
                  <button
                    key={item}
                    onClick={() => setFilterType(item)}
                    className={`px-3 py-1 text-[11px] font-medium rounded-full whitespace-nowrap transition-colors ${filterType === item ? 'bg-brand-purple text-white font-bold' : 'bg-brand-card hover:bg-[#333] text-gray-300'}`}
                  >
                    {item}
                  </button>
                ))}
              </div>

              {/* Row 2: 地区 */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                <span className="text-[10px] font-black text-brand-purple shrink-0 bg-brand-purple/10 px-2 py-1 rounded border border-brand-purple/20">地区</span>
                {['全部类型', '国产', '日本', '台湾省', '韩国', '香港', '欧美'].map((item) => (
                  <button
                    key={item}
                    onClick={() => setFilterRegion(item)}
                    className={`px-3 py-1 text-[11px] font-medium rounded-full whitespace-nowrap transition-colors ${filterRegion === item ? 'bg-brand-purple text-white font-bold' : 'bg-brand-card hover:bg-[#333] text-gray-300'}`}
                  >
                    {item}
                  </button>
                ))}
              </div>

              {/* Row 3: 年份 */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                <span className="text-[10px] font-black text-brand-purple shrink-0 bg-brand-purple/10 px-2 py-1 rounded border border-brand-purple/20">年份</span>
                {['全部类型', '2026', '2024', '2023', '2022', '2021', '2020'].map((item) => (
                  <button
                    key={item}
                    onClick={() => setFilterYear(item)}
                    className={`px-3 py-1 text-[11px] font-medium rounded-full whitespace-nowrap transition-colors ${filterYear === item ? 'bg-brand-purple text-white font-bold' : 'bg-brand-card hover:bg-[#333] text-gray-300'}`}
                  >
                    {item}
                  </button>
                ))}
              </div>

              {/* Row 4: 清晰度 */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                <span className="text-[10px] font-black text-brand-purple shrink-0 bg-brand-purple/10 px-2 py-1 rounded border border-brand-purple/20">清晰度</span>
                {['全部类型', '标清', '高清'].map((item) => (
                  <button
                    key={item}
                    onClick={() => setFilterResolution(item)}
                    className={`px-3 py-1 text-[11px] font-medium rounded-full whitespace-nowrap transition-colors ${filterResolution === item ? 'bg-brand-purple text-white font-bold' : 'bg-brand-card hover:bg-[#333] text-gray-300'}`}
                  >
                    {item}
                  </button>
                ))}
              </div>

              {/* Row 5: 长度 */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                <span className="text-[10px] font-black text-brand-purple shrink-0 bg-brand-purple/10 px-2 py-1 rounded border border-brand-purple/20">长度</span>
                {['全部类型', '长片', '短片'].map((item) => (
                  <button
                    key={item}
                    onClick={() => setFilterLength(item)}
                    className={`px-3 py-1 text-[11px] font-medium rounded-full whitespace-nowrap transition-colors ${filterLength === item ? 'bg-brand-purple text-white font-bold' : 'bg-brand-card hover:bg-[#333] text-gray-300'}`}
                  >
                    {item}
                  </button>
                ))}
              </div>

              {/* Row 6: 有无码 */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                <span className="text-[10px] font-black text-brand-purple shrink-0 bg-brand-purple/10 px-2 py-1 rounded border border-brand-purple/20">编码</span>
                {['全部类型', '有码', '无码'].map((item) => (
                  <button
                    key={item}
                    onClick={() => setFilterCensorship(item)}
                    className={`px-3 py-1 text-[11px] font-medium rounded-full whitespace-nowrap transition-colors ${filterCensorship === item ? 'bg-brand-purple text-white font-bold' : 'bg-brand-card hover:bg-[#333] text-gray-300'}`}
                  >
                    {item}
                  </button>
                ))}
              </div>

              {/* Row 7: 字幕对白 */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                <span className="text-[10px] font-black text-brand-purple shrink-0 bg-brand-purple/10 px-2 py-1 rounded border border-brand-purple/20">字幕</span>
                {['全部类型', '中文字幕', '国语对白', '其它'].map((item) => (
                  <button
                    key={item}
                    onClick={() => setFilterSubtitle(item)}
                    className={`px-3 py-1 text-[11px] font-medium rounded-full whitespace-nowrap transition-colors ${filterSubtitle === item ? 'bg-brand-purple text-white font-bold' : 'bg-brand-card hover:bg-[#333] text-gray-300'}`}
                  >
                    {item}
                  </button>
                ))}
              </div>

              {/* Row 8: 排序 */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                <span className="text-[10px] font-black text-brand-purple shrink-0 bg-brand-purple/10 px-2 py-1 rounded border border-brand-purple/20">排序</span>
                {['全部类型', '最多好评', '最多播放', '最高评分'].map((item) => (
                  <button
                    key={item}
                    onClick={() => setFilterSort(item)}
                    className={`px-3 py-1 text-[11px] font-medium rounded-full whitespace-nowrap transition-colors ${filterSort === item ? 'bg-brand-purple text-white font-bold' : 'bg-brand-card hover:bg-[#333] text-gray-300'}`}
                  >
                    {item}
                  </button>
                ))}
              </div>

            </div>

            {/* Filtered Results Stream */}
            <div className="flex-1 overflow-y-auto p-4 no-scrollbar pb-20">
              <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                <span>过滤筛选出 {processVideos(MOCK_LONG_VIDEOS, true).length} 个资源</span>
                <button 
                  onClick={() => {
                    setFilterType('全部类型');
                    setFilterRegion('全部类型');
                    setFilterYear('全部类型');
                    setFilterResolution('全部类型');
                    setFilterLength('全部类型');
                    setFilterCensorship('全部类型');
                    setFilterSubtitle('全部类型');
                    setFilterSort('全部类型');
                  }}
                  className="text-brand-purple font-bold hover:underline"
                >
                  重置筛选
                </button>
              </div>

              {processVideos(MOCK_LONG_VIDEOS, true).length === 0 ? (
                <div className="py-20 text-center text-gray-500 text-xs">
                  🏜️ 当前条件组合下暂无匹配的高画质大片，请尝试重置或放宽过滤条件。
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3.5">
                  {processVideos(MOCK_LONG_VIDEOS, true).map((video) => (
                    <div 
                      key={video.id}
                      onClick={() => handlePlayVideo(video)}
                      className="group bg-brand-card rounded-xl overflow-hidden border border-neutral-800 flex flex-col justify-between shadow-lg"
                    >
                      <div className="relative aspect-[16/10] bg-black overflow-hidden">
                        <img src={video.coverUrl} alt={video.title} onError={handleImageError} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" referrerPolicy="no-referrer" />
                        <span className="absolute bottom-1 right-1 bg-black/75 px-1 py-0.2 rounded text-[8px] font-mono">{video.duration}</span>
                        {video.isVipOnly && <span className="absolute top-1 left-1 bg-brand-gold text-black text-[8px] font-black px-1 rounded">VIP</span>}
                      </div>
                      <div className="p-2 space-y-1">
                        <h4 className="text-[10px] font-bold text-gray-200 line-clamp-2 leading-relaxed">{video.title}</h4>
                        <div className="flex justify-between items-center text-[8px] text-gray-500">
                          <span>🔥 {(video.views / 1000).toFixed(1)}k</span>
                          <span>⭐ {video.favorites}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 6.5. 我的足迹 (Footprints / Browsing History Drawer) */}
      <AnimatePresence>
        {showFootprints && (
          <motion.div
            key="footprints-panel"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 220 }}
            className="absolute inset-0 w-full bg-brand-bg z-45 flex flex-col text-white shadow-2xl pb-[60px]"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-[#161616] border-b border-neutral-800">
              <button 
                onClick={() => setShowFootprints(false)}
                className="p-1 rounded-full hover:bg-white/5 text-gray-300 hover:text-white transition-colors flex items-center gap-1 text-xs font-bold"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="text-sm font-black tracking-widest text-center flex-1">我的足迹</h2>
              <button 
                onClick={() => {
                  if (confirm('确定要清空您的所有长视频浏览历史吗？')) {
                    setFootprints([]);
                    localStorage.removeItem('banana_footprints');
                  }
                }}
                className="text-xs text-red-400 hover:text-red-300 font-bold flex items-center gap-1 bg-red-950/40 py-1 px-3.5 rounded-full border border-red-900/30"
              >
                <span>清空记录</span>
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 no-scrollbar pb-24 space-y-3.5">
              {footprints.length === 0 ? (
                <div className="py-24 text-center text-gray-500 text-xs flex flex-col items-center gap-3">
                  <span className="text-3xl">👣</span>
                  <p>暂无您的观影足迹，赶快去点播心仪大片吧！</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {footprints.map((video) => (
                    <div 
                      key={video.id}
                      onClick={() => {
                        setShowFootprints(false);
                        handlePlayVideo(video);
                      }}
                      className="group bg-brand-card rounded-xl p-2.5 border border-neutral-800/80 flex gap-3 cursor-pointer hover:bg-neutral-800/80 transition-all"
                    >
                      <div className="relative w-28 aspect-[16/10] bg-black rounded-lg overflow-hidden shrink-0">
                        <img src={video.coverUrl} onError={handleImageError} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <span className="absolute bottom-1 right-1 bg-black/75 px-1 py-0.2 rounded text-[8px] font-mono">{video.duration}</span>
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                        <h4 className="text-[11px] font-bold text-gray-100 group-hover:text-brand-purple line-clamp-1 leading-snug transition-colors">{video.title}</h4>
                        <div className="flex items-center gap-1.5 text-[9px] text-brand-purple font-black">
                          <span>⏱️ 视频时长: {video.duration}</span>
                        </div>
                        <div className="flex justify-between items-center text-[8px] text-gray-500">
                          <span>🔥 已阅数 {(video.views / 1000).toFixed(1)}k</span>
                          <span className="text-brand-gold bg-brand-gold/10 px-1.5 py-0.2 rounded font-black">继续播放</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 7. PORTAL VIDEO PLAYER OVERLAY (IMAGE 1 EXACT DESIGN) */}
      <AnimatePresence>
        {showPlayOverlay && activeVideo && (
          <motion.div 
            key="play-overlay-panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 220 }}
            className="absolute inset-0 w-full bg-brand-bg z-45 flex flex-col text-white shadow-2xl overflow-y-auto no-scrollbar pb-24"
          >
            {/* Header (Back, Title, Search) */}
            <div className="flex items-center justify-between p-4 bg-[#161616] border-b border-neutral-800 sticky top-0 z-45">
              <button 
                onClick={() => {
                  setShowPlayOverlay(false);
                  setActiveVideo(null);
                }}
                className="p-1 rounded-full hover:bg-white/5 text-gray-300 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="text-sm font-black tracking-widest text-center flex-1">影片详情</h2>
              <div className="w-5 h-5" /> {/* Balance spacer */}
            </div>

            {/* Video Player Box with Native Video Controls (Image 1 style) */}
            <div className={`relative bg-black flex flex-col justify-between shrink-0 group transition-all duration-300 ${
              isPlayerFullscreen 
                ? 'fixed inset-0 z-[100] w-screen h-screen bg-black flex flex-col justify-between overflow-hidden' 
                : 'aspect-video w-full'
            }`}>
              {playerLoading ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-3">
                  <div className="w-10 h-10 rounded-full border-2 border-pink-500 border-t-transparent animate-spin"></div>
                  <span className="text-xs text-pink-500 animate-pulse">水晶晶云播专线极速分流中...</span>
                </div>
              ) : (
                <div className="relative w-full h-full flex flex-col justify-between overflow-hidden bg-black">
                  {/* Native Video Stream */}
                  <video 
                    ref={longVideoRef}
                    src={activeVideo.videoUrl || DEFAULT_FALLBACK_VIDEO} 
                    onError={(e) => {
                      const v = e.currentTarget;
                      if (v.src !== DEFAULT_FALLBACK_VIDEO) {
                        v.src = DEFAULT_FALLBACK_VIDEO;
                        v.play().catch(() => {});
                      }
                    }}
                    controls
                    autoPlay 
                    loop 
                    playsInline
                    className="w-full h-full object-contain bg-black"
                  />

                  {/* Top Quality Badge matching Image 1 */}
                  <div className="absolute top-3 right-3 z-20 pointer-events-none">
                    <span className="text-[10px] bg-[#222222]/90 text-[#e6b800] border border-[#333333] font-bold px-2 py-0.5 rounded shadow">
                      1080P超清
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Content Area */}
            <div className="p-4 space-y-4">
              
              {/* Partner Card: PG娱乐城 (Image 1 style) */}
              <div 
                onClick={() => {
                  alert('🎰 PG娱乐城官方指定福利：注册即送模拟体验金￥1000！即将为您跳转到游戏大厅...');
                  onUpdateWallet({ gameBalance: wallet.gameBalance + 1000 });
                  // Real jump/navigation!
                  document.getElementById('nav-chess')?.click();
                  // Also close play overlay so user is back on the new tab cleanly
                  setShowPlayOverlay(false);
                }}
                className="p-3 bg-brand-card rounded-xl border border-neutral-800 flex items-center justify-between cursor-pointer hover:border-pink-500/20 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-yellow-500 to-red-500 flex items-center justify-center text-xl font-bold shadow-md shrink-0 border border-yellow-400/30">
                    🎰
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-white">PG娱乐城</h4>
                    <p className="text-[9px] text-gray-400 mt-0.5">最新电子大放水，极速秒到账</p>
                  </div>
                </div>
                <button className="px-3.5 py-1 rounded-full border border-pink-500 text-pink-500 text-[10px] font-black hover:bg-pink-500/10 transition-colors">
                  进入
                </button>
              </div>

              {/* Sub tabs: 视频详情 vs 评论 */}
              <div className="flex justify-center border-b border-neutral-800/80 pb-1 gap-12 shrink-0">
                <button 
                  onClick={() => setActiveDetailTab('info')}
                  className={`text-xs font-black relative pb-2 transition-all ${activeDetailTab === 'info' ? 'text-pink-500 border-b-2 border-pink-500' : 'text-gray-400 hover:text-white'}`}
                >
                  视频详情
                </button>
                <button 
                  onClick={() => setActiveDetailTab('comments')}
                  className={`text-xs font-black relative pb-2 transition-all ${activeDetailTab === 'comments' ? 'text-pink-500 border-b-2 border-pink-500' : 'text-gray-400 hover:text-white'}`}
                >
                  评论 ({getCommentsForVideo(activeVideo.id).length})
                </button>
              </div>

              {activeDetailTab === 'info' ? (
                <>
                  {/* Video Info Rounded Card (Image 1 exact style) */}
                  <div id="long-detail-view" className="p-4 bg-brand-card rounded-2xl border border-neutral-800/80 space-y-4">
                    <h3 className="text-xs font-extrabold text-gray-100 leading-relaxed">
                      {activeVideo.title}
                    </h3>

                    {/* Info row */}
                    <div className="flex items-center justify-between text-[10px] text-gray-400">
                      <div className="flex items-center gap-3">
                        <span className="text-gray-300">▷ 6w</span>
                        <span>2026-07-16</span>
                        <span className="text-brand-gold font-bold">10.0分</span>
                      </div>
                      
                      <button 
                        onClick={() => setShowErrorReportModal(true)}
                        className="text-[9px] text-pink-400 bg-pink-500/10 px-2.5 py-0.5 rounded border border-pink-500/20 font-bold hover:bg-pink-500/20 transition-all flex items-center gap-1 animate-pulse"
                      >
                        <span>⚠️ 视频报错</span>
                      </button>
                    </div>

                    {/* 4 Interactive action buttons */}
                    <div className="grid grid-cols-4 gap-2 pt-1">
                      <button 
                        onClick={() => handleLikeVideo(activeVideo.id)}
                        className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all border ${
                          likedVideos[activeVideo.id] 
                            ? 'bg-brand-purple/20 border-brand-purple text-brand-purple' 
                            : 'bg-neutral-900/50 hover:bg-neutral-800 border-neutral-800/50 text-gray-300'
                        }`}
                      >
                        <span className="text-sm">👍</span>
                        <span className="text-[9px] font-bold mt-1">
                          {localLikesCount[activeVideo.id] ?? 508}
                        </span>
                      </button>

                      <button 
                        onClick={() => handleDislikeVideo(activeVideo.id)}
                        className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all border ${
                          dislikedVideos[activeVideo.id] 
                            ? 'bg-red-500/20 border-red-500 text-red-500' 
                            : 'bg-neutral-900/50 hover:bg-neutral-800 border-neutral-800/50 text-gray-300'
                        }`}
                      >
                        <span className="text-sm">👎</span>
                        <span className="text-[9px] font-bold mt-1">
                          {dislikedVideos[activeVideo.id] ? 32 : 31}
                        </span>
                      </button>

                      <button 
                        onClick={() => handleFavoriteVideo(activeVideo)}
                        className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all border ${
                          favoritedVideos[activeVideo.id] 
                            ? 'bg-amber-500/20 border-amber-500 text-amber-400' 
                            : 'bg-neutral-900/50 hover:bg-neutral-800 border-neutral-800/50 text-gray-300'
                        }`}
                      >
                        <span className="text-sm">⭐</span>
                        <span className="text-[9px] font-bold mt-1">
                          {favoritedVideos[activeVideo.id] ? '已收藏' : '收藏'}
                        </span>
                      </button>

                      <button 
                        onClick={() => handleShareVideo(activeVideo)}
                        className="flex flex-col items-center justify-center p-2 bg-neutral-900/50 hover:bg-neutral-800 rounded-xl transition-all border border-neutral-800/50 text-gray-300 hover:text-white"
                      >
                        <span className="text-sm">🔗</span>
                        <span className="text-[9px] font-bold mt-1">分享</span>
                      </button>
                    </div>

                    {/* Tag pills list */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {['白虎', '勾引', '少女', '巨乳', '内射', '调教'].map((tag) => (
                        <span 
                          key={tag}
                          className="px-2.5 py-0.5 rounded-full border border-pink-500/30 text-[9px] text-pink-300 bg-pink-500/5 font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Promo advertisement banner (全国空降) */}
                  <div 
                    onClick={() => {
                      alert('🗺️ 同城寻欢已定位！下载专属APP，查看您身边 1.5km 范围内的 18 位空姐/萝莉/少妇会员！');
                    }}
                    className="p-3 rounded-xl bg-gradient-to-r from-purple-900/30 via-[#2a1b3d] to-pink-950/40 border border-pink-500/30 flex items-center justify-between cursor-pointer hover:border-pink-500/50 transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">✈️</span>
                      <div>
                        <h4 className="text-[11px] font-black text-white flex items-center gap-1.5">
                          <span>全国空降</span>
                          <span className="bg-yellow-400 text-black text-[7px] px-1 rounded-sm">真人验证</span>
                        </h4>
                        <p className="text-[9px] text-gray-400 mt-0.5">学生 / 护士 / 御姐 / 萝莉 / 模特 / 少妇</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>

                  {/* 为你推荐 */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-1.5 text-white pl-1">
                      <span className="text-pink-500 font-black">//</span>
                      <h3 className="font-extrabold text-xs tracking-wider">为你推荐</h3>
                    </div>

                    <div className="grid grid-cols-1 gap-3.5 animate-fade-in">
                      {MOCK_LONG_VIDEOS.filter(v => v.id !== activeVideo.id).slice(0, 3).map((video) => (
                        <div 
                          key={`recommend-${video.id}`}
                          onClick={() => {
                            setPlayerLoading(true);
                            setActiveVideo(video);
                            setActiveDetailTab('info');
                            setTimeout(() => setPlayerLoading(false), 800);
                          }}
                          className="flex gap-3 bg-brand-card rounded-xl p-2.5 border border-neutral-800/80 cursor-pointer hover:bg-neutral-800/50 transition-all group"
                        >
                          <div className="relative w-32 aspect-[16/10] bg-black rounded-lg overflow-hidden shrink-0">
                            <img src={video.coverUrl} onError={handleImageError} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            <span className="absolute bottom-1 right-1 bg-black/75 px-1 py-0.2 rounded text-[8px] font-mono">{video.duration}</span>
                            {video.isVipOnly && (
                              <span className="absolute top-1 left-1 bg-brand-gold text-black text-[7px] font-black px-1 rounded shadow">VIP</span>
                            )}
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-1 flex justify-between text-[8px] text-gray-300">
                              <span>▷ 11k</span>
                              <span>❤️ 869</span>
                            </div>
                          </div>

                          <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                            <h4 className="text-[10px] font-bold text-gray-200 group-hover:text-pink-500 line-clamp-2 leading-relaxed transition-colors">
                              {video.title}
                            </h4>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {video.tags.slice(0, 3).map((t) => (
                                <span key={t} className="text-[8px] text-gray-400 bg-[#252525] px-1 rounded">
                                  {t}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                /* Dynamic Interactive Comments Panel */
                <div className="space-y-4">
                  {/* Write comment input */}
                  <div className="p-3 bg-brand-card rounded-xl border border-neutral-800 space-y-2">
                    <p className="text-[10px] text-gray-400 font-bold flex items-center gap-1">
                      <span>✍️</span>
                      <span>发表真实影评 (发表赠送 2 金币奖励)</span>
                    </p>
                    <div className="flex gap-2">
                      <input 
                        type="text"
                        placeholder="说点好听的，文明观影，老司机带带我..."
                        value={newCommentText}
                        onChange={(e) => setNewCommentText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddComment(activeVideo.id);
                        }}
                        className="flex-1 bg-brand-bg border border-neutral-800 rounded-lg p-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-pink-500/40"
                      />
                      <button 
                        onClick={() => handleAddComment(activeVideo.id)}
                        className="px-4 py-1.5 rounded-lg bg-brand-purple hover:bg-brand-purple/80 text-white font-black text-xs transition-colors"
                      >
                        发送
                      </button>
                    </div>
                  </div>

                  {/* Comments Feed List */}
                  <div className="space-y-3.5 max-h-[400px] overflow-y-auto no-scrollbar pr-1">
                    {getCommentsForVideo(activeVideo.id).length === 0 ? (
                      <div className="py-12 text-center text-xs text-gray-500">
                        🏜️ 暂无老司机的观影影评，赶快抢占沙发吧！
                      </div>
                    ) : (
                      getCommentsForVideo(activeVideo.id).map((cmt) => (
                        <div key={cmt.id} className="p-3 bg-brand-card rounded-xl border border-neutral-800/60 flex gap-3 items-start">
                          <img 
                            src={cmt.avatar} 
                            alt={cmt.username}
                            className="w-8 h-8 rounded-full object-cover shrink-0 border border-neutral-800"
                            referrerPolicy="no-referrer"
                          />
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-black text-gray-200">{cmt.username}</span>
                                {cmt.isVip && (
                                  <span className="text-[7px] bg-brand-gold/15 text-brand-gold px-1 py-0.2 rounded font-black scale-90">VIP</span>
                                )}
                              </div>
                              <span className="text-[8px] text-gray-500">{cmt.date}</span>
                            </div>
                            <p className="text-[10px] text-gray-300 leading-relaxed whitespace-pre-wrap">{cmt.content}</p>
                            
                            <div className="flex items-center gap-4 pt-1.5">
                              <button 
                                onClick={() => handleLikeComment(activeVideo.id, cmt.id)}
                                className={`flex items-center gap-1 text-[9px] font-bold ${cmt.liked ? 'text-pink-500' : 'text-gray-500 hover:text-white'}`}
                              >
                                <span>{cmt.liked ? '❤️' : '🤍'}</span>
                                <span>{cmt.likes}</span>
                              </button>
                              <span className="text-[8px] text-gray-600">已验真</span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dynamic Video Error Report Modal */}
      <AnimatePresence>
        {showErrorReportModal && activeVideo && (
          <motion.div 
            key="error-report-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-brand-card w-full max-w-sm rounded-2xl border border-neutral-800 p-5 space-y-4"
            >
              <div className="flex justify-between items-center pb-2 border-b border-neutral-800">
                <div className="flex items-center gap-2">
                  <span className="text-lg">⚠️</span>
                  <h3 className="text-xs font-black text-white">视频播放报错</h3>
                </div>
                <button 
                  onClick={() => setShowErrorReportModal(false)}
                  className="w-6 h-6 rounded-full bg-neutral-900 flex items-center justify-center text-gray-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-3">
                <p className="text-[10px] text-gray-400 font-bold">请选择遇到的问题类型 (反馈核实赠送 5 金币)：</p>
                
                <div className="grid grid-cols-2 gap-2">
                  {[
                    '加载卡顿/慢',
                    '播放黑屏/无图像',
                    '音画不同步',
                    '无声音/杂音',
                    '中文字幕错误',
                    '线路失效/无法开播'
                  ].map((type) => (
                    <button
                      key={type}
                      onClick={() => setErrorReportType(type)}
                      className={`py-1.5 px-2 rounded-lg text-[10px] font-bold text-center border transition-all ${
                        errorReportType === type
                          ? 'bg-brand-purple/20 border-brand-purple text-brand-purple'
                          : 'bg-neutral-950 border-neutral-800 text-gray-400 hover:text-white'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                <div className="space-y-1.5 pt-1">
                  <label className="text-[10px] text-gray-400 font-bold block">具体细节描述 (选填):</label>
                  <textarea
                    rows={3}
                    placeholder="老司机，请详细描述下报错细节（例如播放到第几分钟开始卡顿，或者哪个报错代码），方便我们极速修复..."
                    value={errorReportDesc}
                    onChange={(e) => setErrorReportDesc(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-[10px] text-white placeholder-gray-600 focus:outline-none focus:border-pink-500/30"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setShowErrorReportModal(false)}
                  className="flex-1 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-[11px] font-bold text-gray-400 hover:text-white transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={() => {
                    // Reward user for helping the platform
                    onUpdateWallet({ goldCoins: wallet.goldCoins + 5 });
                    setShowErrorReportModal(false);
                    setErrorReportDesc('');
                    alert(`🙏 感谢报错！值班房管已收到「${errorReportType}」问题反馈。\n系统已自动打赏您 5 个金币，我们会在 15 分钟内完成修复。`);
                  }}
                  className="flex-1 py-2 rounded-lg bg-brand-gradient text-[11px] font-black text-white hover:brightness-105 transition-all"
                >
                  提交报错
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dynamic Exquisite Share Modal */}
      <AnimatePresence>
        {showShareModal && shareVideoTarget && (
          <motion.div 
            key="share-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="bg-brand-card w-full max-w-sm rounded-3xl border border-pink-500/20 p-5 space-y-4 relative overflow-hidden"
            >
              {/* Artistic Background glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-purple/10 rounded-full blur-2xl -z-10" />

              <div className="flex justify-between items-center pb-2 border-b border-neutral-800">
                <div className="flex items-center gap-1.5">
                  <span className="text-base">🎫</span>
                  <h3 className="text-xs font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-yellow-400">
                    老司机专属上车分享票
                  </h3>
                </div>
                <button 
                  onClick={() => setShowShareModal(false)}
                  className="w-6 h-6 rounded-full bg-neutral-900 flex items-center justify-center text-gray-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Share card content */}
              <div className="p-3 bg-neutral-950 rounded-2xl border border-neutral-800 space-y-3">
                <div className="flex gap-3">
                  <img 
                    src={shareVideoTarget.coverUrl} 
                    alt={shareVideoTarget.title}
                    onError={handleImageError}
                    className="w-20 aspect-[16/10] object-cover rounded-lg border border-neutral-800 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                    <h4 className="text-[10px] font-black text-gray-200 line-clamp-2 leading-relaxed">
                      {shareVideoTarget.title}
                    </h4>
                    <p className="text-[8px] text-gray-500 font-bold">1080P 超清 / 自营专线极速</p>
                  </div>
                </div>

                <div className="bg-brand-card p-2 rounded-lg border border-neutral-900 flex justify-between items-center text-[10px]">
                  <div>
                    <span className="text-gray-400 block text-[8px] font-bold">您的专属推广邀请码</span>
                    <span className="text-brand-gold font-black tracking-widest text-xs">BANANA{profile.id ? profile.id.slice(0, 5).toUpperCase() : '888'}</span>
                  </div>
                  <span className="text-[7px] bg-yellow-400/10 text-yellow-400 px-1.5 py-0.5 rounded font-bold border border-yellow-400/20">
                    新客送 1 天 VIP
                  </span>
                </div>
              </div>

              {/* Sharing Channel Buttons */}
              <div className="space-y-2">
                <p className="text-[9px] text-gray-400 font-black">点击选择分享渠道 (分享即送电影券 + VIP体验):</p>
                
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`https://banana.studio/long-video?id=${shareVideoTarget.id}&code=BANANA${profile.id ? profile.id.slice(0, 5).toUpperCase() : '888'}`);
                      onUpdateProfile({ movieTickets: profile.movieTickets + 1 });
                      alert('🔗 分享链接已成功复制至剪贴板！\n已奖励您 1 张观影电影券，快去分享给好友一起上车吧！');
                    }}
                    className="p-2 bg-neutral-950 border border-neutral-800 rounded-xl hover:border-pink-500/20 text-left transition-all flex items-center gap-2"
                  >
                    <span className="text-lg">📋</span>
                    <div>
                      <span className="text-[9px] text-gray-200 font-bold block">复制链接</span>
                      <span className="text-[7px] text-emerald-400 block font-bold">+1 张电影券</span>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      alert('📲 微信模拟分享成功！\n系统已为您自动激活 1 天专属 VIP 会员奖励！');
                      onUpdateProfile({ vipDaysLeft: profile.vipDaysLeft + 1 });
                    }}
                    className="p-2 bg-neutral-950 border border-neutral-800 rounded-xl hover:border-pink-500/20 text-left transition-all flex items-center gap-2"
                  >
                    <span className="text-lg">💬</span>
                    <div>
                      <span className="text-[9px] text-gray-200 font-bold block">微信群</span>
                      <span className="text-[7px] text-pink-400 block font-bold">+1 天 VIP</span>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      alert('✈️ Telegram群分享指令已发出！\n系统已为您自动激活 1 天专属 VIP 会员奖励！');
                      onUpdateProfile({ vipDaysLeft: profile.vipDaysLeft + 1 });
                    }}
                    className="p-2 bg-neutral-950 border border-neutral-800 rounded-xl hover:border-pink-500/20 text-left transition-all flex items-center gap-2"
                  >
                    <span className="text-lg">✈️</span>
                    <div>
                      <span className="text-[9px] text-gray-200 font-bold block">电报群</span>
                      <span className="text-[7px] text-pink-400 block font-bold">+1 天 VIP</span>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      alert('⭐ QQ空间与QQ群分享成功！\n系统已为您自动激活 1 天专属 VIP 会员奖励！');
                      onUpdateProfile({ vipDaysLeft: profile.vipDaysLeft + 1 });
                    }}
                    className="p-2 bg-neutral-950 border border-neutral-800 rounded-xl hover:border-pink-500/20 text-left transition-all flex items-center gap-2"
                  >
                    <span className="text-lg">🐧</span>
                    <div>
                      <span className="text-[9px] text-gray-200 font-bold block">QQ 群/空间</span>
                      <span className="text-[7px] text-pink-400 block font-bold">+1 天 VIP</span>
                    </div>
                  </button>
                </div>
              </div>

              <div className="pt-1.5 text-center text-[8px] text-gray-500 font-bold leading-relaxed">
                📢 推广提示：每成功邀请 1 位好友注册，您和好友均可额外获得 10 金币 + 3 天不限速 VIP 会员！
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Unified Figure 1 Search Overlay */}
      <SearchOverlay
        isOpen={showSearchScreen}
        onClose={() => setShowSearchScreen(false)}
        onPlayLongVideo={(video) => {
          handlePlayVideo(video);
        }}
        onPlayShortVideo={(video) => {
          // Store short video ID to trigger autoplay after tab change
          localStorage.setItem('banana_autoplay_short_video_id', video.id);
          // Auto switch to short video tab
          document.getElementById('nav-short-video')?.click();
        }}
        currentTabPreference="long"
        profile={profile}
        onOpenTopup={onOpenTopup}
      />

    </div>
  );
}
