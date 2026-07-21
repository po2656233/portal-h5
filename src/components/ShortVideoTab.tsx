import React, { useState, useEffect, useRef } from 'react';
import { ShortVideoItem, UserProfile, UserWallet, VideoComment } from '../types';
import { Heart, MessageCircle, Star, Maximize2, Minimize2, ChevronUp, ChevronDown, Plus, Music, Send, Check, Play, Pause, Search, ThumbsUp, Gift, Compass, Trophy, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BananaApiService } from '../apiService';
import SearchOverlay from './SearchOverlay';

interface ShortVideoTabProps {
  profile: UserProfile;
  wallet: UserWallet;
  onUpdateWallet: (wallet: Partial<UserWallet>) => void;
  onUpdateProfile: (profile: Partial<UserProfile>) => void;
  onOpenTopup: (type: 'vip' | 'coin') => void;
  onFullscreenChange?: (isFullscreen: boolean) => void;
}

export default function ShortVideoTab({
  profile,
  wallet,
  onUpdateWallet,
  onUpdateProfile,
  onOpenTopup,
  onFullscreenChange
}: ShortVideoTabProps) {
  // Navigation tabs: 'recommend' (推荐) vs 'curated' (精选 - Image 5 style)
  const [activeSubTab, setActiveSubTab] = useState<'recommend' | 'curated'>('recommend');

  // Video playback states
  const [activeIdx, setActiveIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isLiked, setIsLiked] = useState<{ [key: string]: boolean }>({});
  const [isFavorited, setIsFavorited] = useState<{ [key: string]: boolean }>({});
  const [likesCount, setLikesCount] = useState<{ [key: string]: number }>({});
  const [isFollowed, setIsFollowed] = useState<{ [key: string]: boolean }>({});
  
  // Title expansion state & reply target username state & search
  const [isTitleExpanded, setIsTitleExpanded] = useState<boolean>(false);
  const [replyToUser, setReplyToUser] = useState<string | null>(null);
  const [replyToCommentId, setReplyToCommentId] = useState<string | null>(null);
  const [filterStyle, setFilterStyle] = useState<string>('全部');
  const [filterSort, setFilterSort] = useState<string>('推荐');
  const [showFilterOverlay, setShowFilterOverlay] = useState<boolean>(false);
  const commentInputRef = useRef<HTMLInputElement | null>(null);

  // Immersive Fullscreen override mode state (要铺满当前页 + 全屏)
  const [isImmersiveFullscreen, setIsImmersiveFullscreen] = useState<boolean>(false);

  useEffect(() => {
    if (onFullscreenChange) {
      onFullscreenChange(isImmersiveFullscreen);
    }
  }, [isImmersiveFullscreen, onFullscreenChange]);

  // Comments management
  const [showComments, setShowComments] = useState<boolean>(false);
  const [commentsList, setCommentsList] = useState<{ [key: string]: VideoComment[] }>({});
  const [newComment, setNewComment] = useState<string>('');

  // Comment & reply like states
  const [isCommentLiked, setIsCommentLiked] = useState<{ [key: string]: boolean }>({});

  // Unified Search Screen overlay state
  const [showSearchScreen, setShowSearchScreen] = useState<boolean>(false);

  // Curated page data states
  const [curatedData, setCuratedData] = useState<{
    hotVideos: ShortVideoItem[];
    latestVideos: ShortVideoItem[];
    amazingDiscoveries: ShortVideoItem[];
  } | null>(null);

  // Play video list
  const [videoList, setVideoList] = useState<ShortVideoItem[]>([]);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Load API data on mount
  useEffect(() => {
    // 1. Load recommend video feed
    BananaApiService.getRecommendShortVideos().then(res => {
      if (res.code === 200) {
        setVideoList(res.data);
        
        // Initialize state mappings with localStorage overrides!
        const localLiked = JSON.parse(localStorage.getItem('banana_liked_shorts') || '{}');
        const localFavorited = JSON.parse(localStorage.getItem('banana_favorited_shorts') || '{}');
        const localFollowed = JSON.parse(localStorage.getItem('banana_followed_shorts') || '{}');
        const localLikesCount = JSON.parse(localStorage.getItem('banana_likes_count_shorts') || '{}');
        const localComments = JSON.parse(localStorage.getItem('banana_comments_list_shorts') || '{}');

        const initialLikes: { [key: string]: number } = {};
        const initialLiked: { [key: string]: boolean } = {};
        const initialFav: { [key: string]: boolean } = {};
        const initialFollow: { [key: string]: boolean } = {};
        const initialComments: { [key: string]: VideoComment[] } = {};

        res.data.forEach(v => {
          initialLiked[v.id] = localLiked[v.id] !== undefined ? localLiked[v.id] : false;
          initialFav[v.id] = localFavorited[v.id] !== undefined ? localFavorited[v.id] : false;
          initialFollow[v.id] = localFollowed[v.id] !== undefined ? localFollowed[v.id] : v.uploader.isFollowed;
          initialLikes[v.id] = localLikesCount[v.id] !== undefined ? localLikesCount[v.id] : v.likes;
          initialComments[v.id] = localComments[v.id] !== undefined ? localComments[v.id] : (v.comments || []);
        });

        setLikesCount(initialLikes);
        setIsLiked(initialLiked);
        setIsFavorited(initialFav);
        setIsFollowed(initialFollow);
        setCommentsList(initialComments);

        // Load comment like mappings
        const localCommentLiked = JSON.parse(localStorage.getItem('banana_liked_comments_shorts') || '{}');
        setIsCommentLiked(localCommentLiked);
      }
    });

    // 2. Load curated metadata
    BananaApiService.getCuratedShortVideos().then(res => {
      if (res.code === 200) {
        setCuratedData(res.data);
      }
    });
  }, []);

  // Autoplay watcher for switching tabs from Long Video Search results
  useEffect(() => {
    if (videoList.length === 0) return;
    const interval = setInterval(() => {
      const autoplayId = localStorage.getItem('banana_autoplay_short_video_id');
      if (autoplayId) {
        localStorage.removeItem('banana_autoplay_short_video_id');
        const targetIdx = videoList.findIndex(v => v.id === autoplayId);
        if (targetIdx !== -1) {
          setActiveIdx(targetIdx);
          setIsImmersiveFullscreen(true);
          setIsPlaying(true);
          setActiveSubTab('recommend');
        }
      }
    }, 300);
    return () => clearInterval(interval);
  }, [videoList]);

  // Comment and reply liking handler
  const toggleLikeComment = (commentId: string, isReply: boolean, rootCommentId?: string) => {
    if (!currentVideo) return;
    const vId = currentVideo.id;
    const liked = !isCommentLiked[commentId];

    setCommentsList(prev => {
      const list = prev[vId] || [];
      const newList = list.map(c => {
        if (!isReply && c.id === commentId) {
          return {
            ...c,
            likes: liked ? c.likes + 1 : c.likes - 1
          };
        } else if (isReply && c.id === rootCommentId) {
          const updatedReplies = (c.replies || []).map(r => {
            if (r.id === commentId) {
              return {
                ...r,
                likes: liked ? r.likes + 1 : r.likes - 1
              };
            }
            return r;
          });
          return {
            ...c,
            replies: updatedReplies
          };
        }
        return c;
      });
      const next = { ...prev, [vId]: newList };
      try {
        localStorage.setItem('banana_comments_list_shorts', JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });

    setIsCommentLiked(prev => {
      const next = { ...prev, [commentId]: liked };
      try {
        localStorage.setItem('banana_liked_comments_shorts', JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  // Handle play/pause on space bar or click
  const togglePlayState = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const filteredVideoList = [...videoList]
    .filter(v => {
      if (filterStyle === '全部') return true;
      const titleLower = v.title.toLowerCase();
      const styleLower = filterStyle.toLowerCase();
      return titleLower.includes(styleLower) || 
             (v.category && v.category.toLowerCase().includes(styleLower)) ||
             v.tags.some(tag => tag.toLowerCase().includes(styleLower)) ||
             v.uploader.name.toLowerCase().includes(styleLower);
    })
    .sort((a, b) => {
      if (filterSort === '最多点赞') {
        const likesA = likesCount[a.id] ?? a.likes;
        const likesB = likesCount[b.id] ?? b.likes;
        return likesB - likesA;
      }
      if (filterSort === '最多浏览') {
        return (b.views || 0) - (a.views || 0);
      }
      return 0; // '推荐' maintains original order
    });

  const currentVideo: ShortVideoItem | undefined = filteredVideoList[activeIdx] || filteredVideoList[0] || videoList[0];

  const handleNextVideo = () => {
    if (filteredVideoList.length === 0) return;
    if (activeIdx < filteredVideoList.length - 1) {
      setActiveIdx(prev => prev + 1);
    } else {
      setActiveIdx(0); // Loop
    }
    setIsPlaying(true);
    setShowComments(false);
    setIsTitleExpanded(false);
    setReplyToUser(null);
  };

  const handlePrevVideo = () => {
    if (filteredVideoList.length === 0) return;
    if (activeIdx > 0) {
      setActiveIdx(prev => prev - 1);
    } else {
      setActiveIdx(filteredVideoList.length - 1); // Loop
    }
    setIsPlaying(true);
    setShowComments(false);
    setIsTitleExpanded(false);
    setReplyToUser(null);
  };

  const toggleLike = (id: string) => {
    const liked = !isLiked[id];
    const newLikesCount = liked ? (likesCount[id] || 0) + 1 : (likesCount[id] || 0) - 1;

    setIsLiked(prev => {
      const next = { ...prev, [id]: liked };
      try {
        localStorage.setItem('banana_liked_shorts', JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });

    setLikesCount(prev => {
      const next = { ...prev, [id]: newLikesCount };
      try {
        localStorage.setItem('banana_likes_count_shorts', JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  const toggleFavorite = (id: string) => {
    const fav = !isFavorited[id];
    setIsFavorited(prev => {
      const next = { ...prev, [id]: fav };
      try {
        localStorage.setItem('banana_favorited_shorts', JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
    if (fav) {
      alert('🌟 成功将该短视频加入收藏夹！可在【我的】-【我的收藏】中回看。');
    }
  };

  const toggleFollow = (id: string) => {
    const followed = !isFollowed[id];
    setIsFollowed(prev => {
      const next = { ...prev, [id]: followed };
      try {
        localStorage.setItem('banana_followed_shorts', JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !currentVideo) return;

    const vId = currentVideo.id;
    const author = profile.isLoggedIn ? profile.username : '游客老司机';
    const authorAvatar = profile.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80';

    const commentObj: VideoComment = {
      id: `new_c_${Date.now()}`,
      username: author,
      avatar: authorAvatar,
      content: newComment,
      time: '刚刚',
      likes: 0,
      replies: []
    };

    if (replyToCommentId) {
      setCommentsList(prev => {
        const list = prev[vId] || [];
        const newList = list.map(c => {
          if (c.id === replyToCommentId) {
            return {
              ...c,
              replies: [...(c.replies || []), commentObj]
            };
          }
          return c;
        });
        const next = { ...prev, [vId]: newList };
        try {
          localStorage.setItem('banana_comments_list_shorts', JSON.stringify(next));
        } catch (e) {
          console.error(e);
        }
        return next;
      });
      setReplyToCommentId(null);
      setReplyToUser(null);
    } else {
      setCommentsList(prev => {
        const next = {
          ...prev,
          [vId]: [commentObj, ...(prev[vId] || [])]
        };
        try {
          localStorage.setItem('banana_comments_list_shorts', JSON.stringify(next));
        } catch (e) {
          console.error(e);
        }
        return next;
      });
    }
    setNewComment('');
  };

  // Launch immersive player from curated cards
  const launchVideoDirectly = (video: ShortVideoItem) => {
    setFilterStyle('全部');
    setFilterSort('推荐');
    // Look up if video exists in standard list or prepend it
    const existIdx = videoList.findIndex(v => v.id === video.id);
    if (existIdx !== -1) {
      setActiveIdx(existIdx);
    } else {
      // Prepend to current playlist
      setVideoList(prev => [video, ...prev]);
      setActiveIdx(0);
      
      // Seed default states for the new video
      setLikesCount(prev => ({ ...prev, [video.id]: video.likes }));
      setIsLiked(prev => ({ ...prev, [video.id]: false }));
      setIsFavorited(prev => ({ ...prev, [video.id]: false }));
      setIsFollowed(prev => ({ ...prev, [video.id]: false }));
      setCommentsList(prev => ({ ...prev, [video.id]: [] }));
    }
    setActiveSubTab('recommend');
    setIsPlaying(true);
    setIsImmersiveFullscreen(true); // Auto launch fully fullscreen!
    setIsTitleExpanded(false);
    setReplyToUser(null);
  };

  if (videoList.length === 0 || !currentVideo) {
    return <div className="text-center py-20 text-gray-500">正在调配短视频流...</div>;
  }

  const vLikes = likesCount[currentVideo.id] ?? currentVideo.likes;
  const vLiked = isLiked[currentVideo.id] ?? false;
  const vFav = isFavorited[currentVideo.id] ?? false;
  const vFollowed = isFollowed[currentVideo.id] ?? false;
  const vComments = commentsList[currentVideo.id] || [];

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative bg-black select-none text-white">
      
      {/* 1. Header with Recommend vs Curated Selector (Image 5 Style) */}
      {!isImmersiveFullscreen && (
        <div className={`flex items-center justify-between p-4 z-30 transition-all ${
          activeSubTab === 'recommend' 
            ? 'absolute top-0 inset-x-0 bg-gradient-to-b from-black/80 via-black/40 to-transparent border-none' 
            : 'bg-brand-bg/95 border-b border-neutral-900 sticky top-0'
        }`}>
          <div className="flex gap-4">
            <button
              onClick={() => setActiveSubTab('recommend')}
              className={`text-sm font-black relative pb-1 transition-all ${
                activeSubTab === 'recommend' ? 'text-white scale-105 drop-shadow-md' : 'text-gray-400 hover:text-white'
              }`}
            >
              推荐
              {activeSubTab === 'recommend' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-purple rounded-full shadow-lg"></span>
              )}
            </button>
            <button
              onClick={() => setActiveSubTab('curated')}
              className={`text-sm font-black relative pb-1 transition-all ${
                activeSubTab === 'curated' ? 'text-white scale-105 drop-shadow-md' : 'text-gray-400 hover:text-white'
              }`}
            >
              精选
              {activeSubTab === 'curated' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-purple rounded-full shadow-lg"></span>
              )}
            </button>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowSearchScreen(true)}
              className="p-2 rounded-full border bg-black/50 border-white/10 text-white hover:border-brand-purple hover:text-brand-purple transition-all relative"
              title="搜索影片"
            >
              <Search className="w-4 h-4" />
            </button>
            <span className="text-[10px] bg-brand-purple/20 text-brand-purple border border-brand-purple/40 px-2 py-0.5 rounded-full font-bold shadow-md">
              金币：{wallet.goldCoins}
            </span>
          </div>
        </div>
      )}

      {/* Compact Advanced Filter Popover */}
      <AnimatePresence>
        {showFilterOverlay && (
          <motion.div 
            key="short-filter-overlay"
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="absolute top-[60px] inset-x-0 z-40 mx-4 mt-2 p-4 rounded-2xl bg-[#121212]/95 backdrop-blur-md border border-neutral-800/80 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <h4 className="text-xs font-black text-brand-purple flex items-center gap-1">
                <span>🎯 短视频极速高级筛选</span>
              </h4>
              <button 
                onClick={() => {
                  setFilterStyle('全部');
                  setFilterSort('推荐');
                }}
                className="text-[10px] text-gray-400 hover:text-white"
              >
                重置
              </button>
            </div>

            {/* Row 1: Style / Tags */}
            <div className="space-y-1.5">
              <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">首选类型</p>
              <div className="flex flex-wrap gap-1.5">
                {['全部', '热舞', '黑丝', '制服', '户外', '清纯'].map((style) => (
                  <button
                    key={style}
                    onClick={() => {
                      setFilterStyle(style);
                      setActiveIdx(0);
                    }}
                    className={`py-1 px-3 rounded-full text-[10px] font-bold transition-all ${
                      filterStyle === style 
                        ? 'bg-brand-purple text-white shadow-md' 
                        : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            {/* Row 2: Sorting */}
            <div className="space-y-1.5 pt-1">
              <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">智能排序</p>
              <div className="flex flex-wrap gap-1.5">
                {['推荐', '最多点赞', '最多浏览'].map((sort) => (
                  <button
                    key={sort}
                    onClick={() => {
                      setFilterSort(sort);
                      setActiveIdx(0);
                    }}
                    className={`py-1 px-3 rounded-full text-[10px] font-bold transition-all ${
                      filterSort === sort 
                        ? 'bg-brand-gold text-black shadow-md' 
                        : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {sort}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setShowFilterOverlay(false)}
              className="w-full py-2 bg-brand-gradient hover:opacity-90 rounded-xl text-center text-xs font-bold text-white transition-all shadow"
            >
              确 定 (共 {filteredVideoList.length} 部视频)
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==========================================
          SUB-VIEW A: RECOMMEND SWIPE PLAYER (推荐全屏播放)
         ========================================== */}
      {activeSubTab === 'recommend' && (
        <div 
          className={`relative w-full bg-black overflow-hidden flex items-center justify-center ${
            isImmersiveFullscreen 
              ? 'fixed inset-0 z-50 h-screen' 
              : 'flex-1 h-full'
          }`}
        >
          {/* Background Loop Player */}
          <div className="absolute inset-0 z-0 flex items-center justify-center bg-zinc-950" onClick={togglePlayState}>
            <video 
              ref={videoRef}
              key={currentVideo.id}
              src={currentVideo.videoUrl} 
              autoPlay={isPlaying}
              loop 
              muted={false} // Allow standard audio in production
              playsInline
              className="w-full h-full object-cover opacity-90"
            />
            {/* Visual gradient covers for readable overlay labels */}
            <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none"></div>
            <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/60 to-transparent pointer-events-none"></div>
          </div>

          {/* LARGE INTERACTIVE CENTRAL PLAY BUTTON (Only visible when paused) */}
          <AnimatePresence>
            {!isPlaying && (
              <motion.div 
                key="short-play-button"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={togglePlayState}
                className="absolute z-20 w-16 h-16 rounded-full bg-black/60 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white cursor-pointer hover:bg-black/80 shadow-2xl"
              >
                <Play className="w-8 h-8 fill-current ml-1 text-brand-purple" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Floating Tickets Left badge */}
          {!isImmersiveFullscreen && (
            <div className="absolute top-20 left-4 z-10 flex flex-col gap-2">
              <div className="bg-black/70 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-brand-purple/40 text-[10px] text-brand-purple flex items-center gap-1.5 shadow-xl">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>短视频观影额度: <strong>{profile.shortVideoTickets}</strong> 次</span>
                {profile.shortVideoTickets <= 5 && (
                  <button 
                    onClick={() => onOpenTopup('vip')}
                    className="text-brand-gold font-bold hover:underline ml-1"
                  >
                    充值
                  </button>
                )}
              </div>

              {/* Floating Sponsor Ad Badge */}
              <div 
                onClick={() => {
                  alert('🎰 官方赞助商 澳门新葡京：已为您加赠 ¥1,888 游戏体验金！正在跳转到游戏大厅...');
                  onUpdateWallet({ gameBalance: wallet.gameBalance + 1888 });
                  document.getElementById('nav-chess')?.click();
                }}
                className="bg-gradient-to-r from-red-600 via-amber-600 to-yellow-500 text-white px-3 py-1.5 rounded-2xl border border-yellow-300 shadow-[0_0_15px_rgba(234,179,8,0.5)] cursor-pointer flex items-center gap-1.5 text-[10px] font-black hover:scale-105 transition-all animate-pulse"
              >
                <span className="text-sm">🎰</span>
                <span>新葡京放水领 ¥1888 ➔</span>
              </div>
            </div>
          )}

          {/* CLOSE FULLSCREEN BUTTON (Only visible in immersive fullscreen) */}
          {isImmersiveFullscreen && (
            <button 
              onClick={() => setIsImmersiveFullscreen(false)}
              className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 text-white hover:bg-brand-purple"
            >
              <Minimize2 className="w-5 h-5" />
            </button>
          )}

          {/* Left vertical slide controllers (Swipe simulation buttons) */}
          {!isImmersiveFullscreen && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-3">
              <button 
                onClick={handlePrevVideo}
                className="p-2.5 rounded-full bg-black/50 border border-white/10 text-white hover:bg-brand-purple transition-all shadow"
                title="上一个"
              >
                <ChevronUp className="w-5 h-5" />
              </button>
              <button 
                onClick={handleNextVideo}
                className="p-2.5 rounded-full bg-black/50 border border-white/10 text-white hover:bg-brand-purple transition-all shadow"
                title="下一个"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* RIGHT ACTION BUTTONS */}
          {!isImmersiveFullscreen ? (
            <div className="absolute right-4 bottom-32 z-10 flex flex-col items-center gap-4">
              {/* Uploader Avatar with Follow */}
              <div className="relative mb-2">
                <div className="w-11 h-11 rounded-full border-2 border-brand-purple p-0.5 overflow-hidden bg-black">
                  <img 
                    src={currentVideo.uploader.avatar} 
                    alt={currentVideo.uploader.name} 
                    className="w-full h-full object-cover rounded-full"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <button 
                  onClick={() => toggleFollow(currentVideo.id)}
                  className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full flex items-center justify-center text-white transition-all shadow-md ${vFollowed ? 'bg-emerald-500' : 'bg-pink-500'}`}
                >
                  {vFollowed ? <Check className="w-2.5 h-2.5" /> : <Plus className="w-3 h-3" />}
                </button>
              </div>

              {/* Like */}
              <button onClick={() => toggleLike(currentVideo.id)} className="flex flex-col items-center group cursor-pointer">
                <div className={`p-2.5 rounded-full bg-black/50 border border-white/5 shadow-lg group-hover:scale-105 transition-transform ${vLiked ? 'text-pink-500' : 'text-white'}`}>
                  <Heart className="w-5 h-5 fill-current" />
                </div>
                <span className="text-[10px] text-gray-200 font-bold mt-1 shadow">
                  {(vLikes / 1000).toFixed(1)}k
                </span>
              </button>

              {/* Favorite */}
              <button onClick={() => toggleFavorite(currentVideo.id)} className="flex flex-col items-center group cursor-pointer">
                <div className={`p-2.5 rounded-full bg-black/50 border border-white/5 shadow-lg group-hover:scale-105 transition-transform ${vFav ? 'text-amber-400' : 'text-white'}`}>
                  <Star className="w-5 h-5 fill-current" />
                </div>
                <span className="text-[10px] text-gray-200 font-bold mt-1 shadow">收藏</span>
              </button>

              {/* Comments */}
              <button onClick={() => setShowComments(true)} className="flex flex-col items-center group cursor-pointer">
                <div className="p-2.5 rounded-full bg-black/50 border border-white/5 shadow-lg text-white group-hover:scale-105 transition-transform">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <span className="text-[10px] text-gray-200 font-bold mt-1 shadow">{vComments.length}</span>
              </button>

              {/* Fullscreen Button */}
              {!isImmersiveFullscreen && (
                <button 
                  onClick={() => {
                    setIsImmersiveFullscreen(true);
                    setIsPlaying(true);
                  }} 
                  className="flex flex-col items-center group cursor-pointer"
                >
                  <div className="p-2.5 rounded-full bg-black/50 border border-white/5 shadow-lg text-white group-hover:scale-105 transition-transform">
                    <Maximize2 className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] text-gray-200 font-bold mt-1 shadow">全屏</span>
                </button>
              )}
            </div>
          ) : null}

          {/* BOTTOM OVERLAY LABELS */}
          {!isImmersiveFullscreen && (
            <div className="absolute bottom-18 left-4 right-20 z-10 space-y-3.5 pr-4">
              <div className="flex items-center gap-2">
                <h4 className="font-extrabold text-sm tracking-wide">@{currentVideo.uploader.name}</h4>
                <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-pink-500/20 text-pink-300 border border-pink-500/30">签约主播</span>
              </div>

              <p 
                onClick={() => setIsTitleExpanded(!isTitleExpanded)}
                className={`text-xs text-gray-100 leading-relaxed drop-shadow cursor-pointer transition-all ${isTitleExpanded ? 'line-clamp-none' : 'line-clamp-2'}`}
              >
                {currentVideo.title}
                {!isTitleExpanded && currentVideo.title.length > 24 && (
                  <span className="text-brand-purple text-[10px] ml-1.5 font-bold hover:underline">... 展开</span>
                )}
              </p>

              <div className="flex items-center gap-2 text-[10px] text-brand-purple">
                <Music className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '4s' }} />
                <div className="overflow-hidden whitespace-nowrap w-40">
                  <p className="animate-marquee inline-block font-medium">
                    原声 - {currentVideo.uploader.name} 专属高保真声轨
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==========================================
          SUB-VIEW B: CURATED FEEDS GRID (精选页面 - Image 5 style)
         ========================================== */}
      {activeSubTab === 'curated' && curatedData && (
        <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-6 pb-20">
          
          {/* A. 热门视频 (NO.1 to NO.4 - Image 5 replica) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-white">
                <Trophy className="w-4 h-4 text-brand-gold" />
                <h3 className="font-extrabold text-xs tracking-wider">热门视频</h3>
              </div>
              <button 
                onClick={() => alert('🔥 已为您加载最新24小时全网热门排行榜单！')}
                className="text-[10px] text-gray-400 hover:text-brand-purple flex items-center gap-0.5"
              >
                <span>查看热门榜</span>
                <ChevronDown className="w-3 h-3 transform -rotate-90" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {curatedData.hotVideos.map((video, idx) => (
                <div 
                  key={video.id}
                  onClick={() => launchVideoDirectly(video)}
                  className="group bg-brand-card rounded-xl overflow-hidden border border-neutral-800 flex flex-col justify-between shadow cursor-pointer"
                >
                  <div className="relative aspect-[3/4] bg-black overflow-hidden">
                    <img src={video.coverUrl} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" referrerPolicy="no-referrer" />
                    
                    {/* Rank badges NO.1 - NO.4 */}
                    <span className={`absolute top-2 left-2 text-[9px] font-black px-2 py-0.5 rounded-full shadow-md ${
                      idx === 0 ? 'bg-red-600 text-white' : idx === 1 ? 'bg-amber-500 text-black' : idx === 2 ? 'bg-blue-600 text-white' : 'bg-neutral-700 text-gray-300'
                    }`}>
                      NO.{idx + 1}
                    </span>
                    
                    <span className="absolute bottom-1.5 right-1.5 bg-black/60 px-1 py-0.2 rounded text-[8px] font-mono">
                      {video.duration || '0:30'}
                    </span>
                  </div>
                  <div className="p-2 space-y-1">
                    <h4 className="text-[10px] font-bold text-gray-200 line-clamp-2 leading-relaxed hover:text-brand-purple transition-colors">
                      {video.title}
                    </h4>
                    <div className="flex justify-between items-center text-[8px] text-gray-500 font-bold">
                      <span>👍 {(video.likes / 1000).toFixed(0)}k赞</span>
                      <span className="text-brand-purple">立即点播</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* B. 热门排行 (Interactive Leaderboard filters - Image 5 style) */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-[10px] uppercase tracking-wider text-gray-400 px-1">🔥 热门排行数据统计</h4>
            <div className="grid grid-cols-3 gap-2">
              <button 
                onClick={() => alert('👍 已为您成功加载今日最多点赞排行榜！')}
                className="py-3.5 px-1 bg-brand-card border border-neutral-800 hover:border-pink-500/20 rounded-xl flex flex-col items-center justify-center gap-1 transition-all"
              >
                <Heart className="w-4 h-4 text-pink-500 animate-pulse" />
                <span className="text-[10px] font-black text-gray-200">最多点赞</span>
                <span className="text-[8px] text-gray-500">12.5M 次</span>
              </button>

              <button 
                onClick={() => alert('💬 已为您成功加载今日评论讨论最热榜单！')}
                className="py-3.5 px-1 bg-brand-card border border-neutral-800 hover:border-brand-purple/20 rounded-xl flex flex-col items-center justify-center gap-1 transition-all"
              >
                <MessageCircle className="w-4 h-4 text-brand-purple" />
                <span className="text-[10px] font-black text-gray-200">最多评论</span>
                <span className="text-[8px] text-gray-500">35.4k 条</span>
              </button>

              <button 
                onClick={() => alert('🪙 已为您成功加载大额豪气打赏排行榜！')}
                className="py-3.5 px-1 bg-brand-card border border-neutral-800 hover:border-brand-gold/20 rounded-xl flex flex-col items-center justify-center gap-1 transition-all"
              >
                <Gift className="w-4 h-4 text-brand-gold" />
                <span className="text-[10px] font-black text-gray-200">最多打赏</span>
                <span className="text-[8px] text-gray-500">2.4M 金币</span>
              </button>
            </div>
          </div>

          {/* C. 最新视频 (Latest Videos - Image 5 grid) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-white">
                <Compass className="w-4 h-4 text-brand-purple animate-spin" style={{ animationDuration: '8s' }} />
                <h3 className="font-extrabold text-xs tracking-wider">最新上传</h3>
              </div>
              <button 
                onClick={() => alert('⚡ 正在拉取最新的优质老司机独家投递！')}
                className="text-[10px] text-gray-400 hover:text-brand-purple flex items-center gap-0.5"
              >
                <span>查看更多</span>
                <ChevronDown className="w-3 h-3 transform -rotate-90" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {curatedData.latestVideos.map((video) => (
                <div 
                  key={video.id}
                  onClick={() => launchVideoDirectly(video)}
                  className="group bg-brand-card rounded-xl overflow-hidden border border-neutral-800 flex flex-col justify-between shadow cursor-pointer"
                >
                  <div className="relative aspect-[3/4] bg-black overflow-hidden">
                    <img src={video.coverUrl} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" referrerPolicy="no-referrer" />
                    <span className="absolute bottom-1.5 right-1.5 bg-black/60 px-1 py-0.2 rounded text-[8px] font-mono">NEW</span>
                  </div>
                  <div className="p-2 space-y-1">
                    <h4 className="text-[10px] font-bold text-gray-200 line-clamp-2 leading-relaxed">
                      {video.title}
                    </h4>
                    <div className="flex justify-between items-center text-[8px] text-gray-500 font-medium">
                      <span>🎬 超清播放</span>
                      <span className="text-gray-400 font-bold">刚刚</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* D. 精彩发现 (Amazing Discoveries - Large horizontal list) */}
          <div className="space-y-3">
            <h3 className="font-extrabold text-xs text-white px-1">🌟 精彩发现</h3>
            <div className="space-y-3">
              {curatedData.amazingDiscoveries.map((video) => (
                <div
                  key={video.id}
                  onClick={() => launchVideoDirectly(video)}
                  className="bg-brand-card border border-neutral-800 hover:border-brand-purple/30 rounded-xl p-3 flex gap-3.5 cursor-pointer group"
                >
                  <div className="w-20 h-24 bg-black rounded-lg overflow-hidden shrink-0">
                    <img src={video.coverUrl} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" referrerPolicy="no-referrer" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[8px] font-black uppercase text-brand-purple border border-brand-purple/30 bg-brand-purple/5 px-2 py-0.5 rounded">独家栏目</span>
                      <h4 className="text-[11px] font-bold text-gray-200 mt-2 line-clamp-2 leading-relaxed">
                        {video.title}
                      </h4>
                    </div>
                    <span className="text-[9px] text-brand-gold font-bold">点击进入 VR/3D 沉浸式观影 &gt;</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ==========================================
          SLIDING COMMENTS DRAWER (Inside Swipe player)
         ========================================== */}
      <AnimatePresence>
        {showComments && activeSubTab === 'recommend' && (
          <motion.div
            key="short-comments-drawer"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="absolute bottom-0 inset-x-0 h-[65%] rounded-t-3xl bg-neutral-950/98 backdrop-blur-md border-t border-neutral-800 z-50 flex flex-col text-white shadow-2xl overflow-hidden"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-4 border-b border-neutral-800">
              <span className="text-xs text-gray-300 font-extrabold tracking-wide">精彩老司机评论 ({vComments.length})</span>
              <button 
                onClick={() => {
                  setShowComments(false);
                  setReplyToUser(null);
                  setReplyToCommentId(null);
                }}
                className="text-gray-400 hover:text-white font-bold text-xs py-1 px-3.5 bg-neutral-800 hover:bg-neutral-700 rounded-full transition-all"
              >
                关闭
              </button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
              {vComments.length === 0 ? (
                <div className="py-12 text-center text-gray-500 text-xs">
                  💬 暂无评论。老司机快留评，楼下坐等指教！
                </div>
              ) : (
                vComments.map((comment) => (
                  <div key={comment.id} className="flex gap-3 text-xs border-b border-neutral-900/40 pb-3 last:border-b-0">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-neutral-800 shrink-0 border border-brand-purple/20">
                      <img src={comment.avatar} alt={comment.username} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between font-bold">
                        <div className="flex items-center gap-1.5">
                          <span className="text-brand-purple font-black">{comment.username}</span>
                          <span className="px-1 py-0.2 rounded text-[8px] bg-brand-purple/20 text-brand-purple border border-brand-purple/30 font-extrabold">VIP 老司机</span>
                        </div>
                        <span className="text-[10px] text-gray-500 font-normal">{comment.time}</span>
                      </div>
                      <p className="text-gray-200 leading-relaxed pr-2 text-xs">{comment.content}</p>
                      
                      <div className="flex items-center gap-3 pt-1 text-[10px] text-gray-500 font-bold">
                        <button 
                          type="button"
                          onClick={() => toggleLikeComment(comment.id, false)}
                          className={`hover:text-pink-500 cursor-pointer flex items-center gap-1 px-1.5 py-0.5 rounded-full transition-colors ${isCommentLiked[comment.id] ? 'text-pink-500 bg-pink-500/10' : 'text-gray-400'}`}
                        >
                          <span>👍</span>
                          <span>{comment.likes}</span>
                        </button>
                        <button 
                          type="button"
                          onClick={() => {
                            setReplyToUser(comment.username);
                            setReplyToCommentId(comment.id);
                            setNewComment(`回复 @${comment.username}：`);
                            commentInputRef.current?.focus();
                          }}
                          className="text-gray-400 hover:text-brand-purple cursor-pointer flex items-center gap-1 bg-neutral-900 hover:bg-neutral-800 px-2 py-0.5 rounded-full transition-colors"
                        >
                          回复
                        </button>
                      </div>

                      {/* Nested Replies */}
                      {comment.replies && comment.replies.length > 0 && (
                        <div className="mt-2.5 pl-3 border-l-2 border-brand-purple/20 space-y-2.5 bg-white/[0.02] p-2 rounded-r-lg">
                          {comment.replies.map((reply) => (
                            <div key={reply.id} className="flex gap-2.5 text-xs">
                              <div className="w-6 h-6 rounded-full overflow-hidden bg-neutral-800 shrink-0">
                                <img src={reply.avatar} alt={reply.username} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              </div>
                              <div className="flex-1 space-y-0.5">
                                <div className="flex items-center justify-between font-bold">
                                  <span className="text-gray-300 text-[10px]">{reply.username}</span>
                                  <span className="text-[9px] text-gray-500 font-normal">{reply.time}</span>
                                </div>
                                <p className="text-gray-300 text-[11px] leading-relaxed pr-2">{reply.content}</p>
                                <div className="flex items-center gap-2 pt-0.5 text-[9px] text-gray-500 font-bold">
                                  <button 
                                    type="button"
                                    onClick={() => toggleLikeComment(reply.id, true, comment.id)}
                                    className={`hover:text-pink-500 cursor-pointer flex items-center gap-1 px-1 py-0.2 rounded transition-colors ${isCommentLiked[reply.id] ? 'text-pink-500' : 'text-gray-500'}`}
                                  >
                                    <span>👍</span>
                                    <span>{reply.likes}</span>
                                  </button>
                                  <button 
                                    type="button"
                                    onClick={() => {
                                      setReplyToUser(reply.username);
                                      setReplyToCommentId(comment.id);
                                      setNewComment(`回复 @${reply.username}：`);
                                      commentInputRef.current?.focus();
                                    }}
                                    className="hover:text-brand-purple cursor-pointer bg-neutral-900 px-1.5 py-0.2 rounded text-gray-400"
                                  >
                                    回复
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Submit Comment */}
            <form onSubmit={handleAddComment} className="p-3 border-t border-neutral-800 bg-[#0c0c0c] flex flex-col gap-1.5">
              {replyToUser && (
                <div className="flex items-center justify-between px-2.5 py-1 bg-brand-purple/10 border border-brand-purple/20 rounded text-[9px] text-brand-purple font-bold">
                  <span>正在回复 @{replyToUser}</span>
                  <button 
                    type="button" 
                    onClick={() => {
                      setReplyToUser(null);
                      setReplyToCommentId(null);
                      setNewComment('');
                    }}
                    className="font-black text-xs hover:text-white"
                  >
                    ×
                  </button>
                </div>
              )}
              <div className="flex items-center gap-2">
                <input 
                  ref={commentInputRef}
                  type="text" 
                  placeholder={replyToUser ? `回复 @${replyToUser}...` : "老司机指教：说点骚话顶上去..."}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-1 bg-neutral-900 text-white rounded-full py-2 px-4 text-xs focus:outline-none focus:ring-1 focus:ring-brand-purple border border-neutral-800 transition-all placeholder-gray-500"
                />
                <button 
                  type="submit"
                  className="p-2.5 rounded-full bg-brand-gradient text-white transition-all hover:scale-105"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Unified Figure 1 Search Overlay */}
      <SearchOverlay
        isOpen={showSearchScreen}
        onClose={() => setShowSearchScreen(false)}
        onPlayShortVideo={(video) => {
          launchVideoDirectly(video);
        }}
        onPlayLongVideo={(video) => {
          // Store long video ID to trigger autoplay after tab change
          localStorage.setItem('banana_autoplay_long_video_id', video.id);
          // Auto switch to long video tab
          document.getElementById('nav-long-video')?.click();
        }}
        currentTabPreference="short"
        profile={profile}
        onOpenTopup={onOpenTopup}
      />

    </div>
  );
}
