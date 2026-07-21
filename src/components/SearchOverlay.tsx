import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Play, Eye, Flame, Award } from 'lucide-react';
import { VideoItem, ShortVideoItem, UserProfile } from '../types';
import { MOCK_LONG_VIDEOS, MOCK_SHORT_VIDEOS } from '../data';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onPlayLongVideo: (video: VideoItem) => void;
  onPlayShortVideo: (video: ShortVideoItem) => void;
  currentTabPreference: 'long' | 'short';
  profile: UserProfile;
  onOpenTopup: (type: 'vip' | 'coin') => void;
}

export default function SearchOverlay({
  isOpen,
  onClose,
  onPlayLongVideo,
  onPlayShortVideo,
  currentTabPreference,
  profile,
  onOpenTopup
}: SearchOverlayProps) {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeSearchTab, setActiveSearchTab] = useState<'long' | 'short'>(currentTabPreference);
  const [searchFilterType, setSearchFilterType] = useState<'all' | 'free'>('all');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // Popular Tags from Figure 1
  const guessYouLikeTags = ['少女', '诱惑', '美乳', '自慰', '白虎', 'COS', '无码', '制服', '口交'];

  // Load history on mount or when opened
  useEffect(() => {
    try {
      const stored = localStorage.getItem('banana_search_history');
      if (stored) {
        setSearchHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }
  }, [isOpen]);

  // Reset search when overlay opens
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setActiveSearchTab(currentTabPreference);
      setSearchFilterType('all');
    }
  }, [isOpen, currentTabPreference]);

  // Helper to record search query
  const recordQuery = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    const nextHistory = [trimmed, ...searchHistory.filter((h) => h !== trimmed)].slice(0, 10);
    setSearchHistory(nextHistory);
    try {
      localStorage.setItem('banana_search_history', JSON.stringify(nextHistory));
    } catch (e) {
      console.error(e);
    }
  };

  // Filter Long Videos
  const filteredLongVideos = MOCK_LONG_VIDEOS.filter((video) => {
    // 1. Filter by "全部" vs "免费"
    if (searchFilterType === 'free' && video.isVipOnly) {
      return false;
    }

    // 2. Filter by search text
    if (!searchQuery.trim()) return true; // Show all as recommendation when empty
    const q = searchQuery.toLowerCase().trim();
    return (
      video.title.toLowerCase().includes(q) ||
      video.category.toLowerCase().includes(q) ||
      video.tags.some((tag) => tag.toLowerCase().includes(q))
    );
  });

  // Filter Short Videos
  const filteredShortVideos = MOCK_SHORT_VIDEOS.filter((video) => {
    // 1. Filter by "全部" vs "免费"
    if (searchFilterType === 'free' && video.isVipOnly) {
      return false;
    }

    // 2. Filter by search text
    if (!searchQuery.trim()) return true; // Show all as recommendation when empty
    const q = searchQuery.toLowerCase().trim();
    return (
      video.title.toLowerCase().includes(q) ||
      video.category.toLowerCase().includes(q) ||
      video.tags.some((tag) => tag.toLowerCase().includes(q)) ||
      video.uploader.name.toLowerCase().includes(q)
    );
  });

  const handleTagClick = (tag: string) => {
    setSearchQuery(tag);
    recordQuery(tag);
  };

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      recordQuery(searchQuery);
    }
  };

  const removeHistoryItem = (term: string) => {
    const nextHistory = searchHistory.filter((h) => h !== term);
    setSearchHistory(nextHistory);
    try {
      localStorage.setItem('banana_search_history', JSON.stringify(nextHistory));
    } catch (e) {
      console.error(e);
    }
  };

  const clearHistory = () => {
    setSearchHistory([]);
    try {
      localStorage.removeItem('banana_search_history');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="search-overlay-modal"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="absolute inset-0 w-full bg-[#121214] z-45 flex flex-col text-white shadow-2xl pb-[60px]"
        >
        {/* Figure 1 Top Search Bar Header */}
        <div className="p-3 bg-[#1e1e21] border-b border-neutral-800 flex items-center gap-2 shrink-0">
          {/* Back Arrow */}
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-neutral-800 text-gray-300 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Search Input Container */}
          <div className="flex-1 bg-[#2b2b2e] rounded-full pl-3 pr-1 py-1 flex items-center border border-neutral-800 focus-within:border-brand-purple/40">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearchSubmit();
                }
              }}
              placeholder="输入您想要搜索的内容"
              className="bg-transparent text-xs w-full text-white placeholder-gray-500 focus:outline-none py-1"
            />
            {/* Yellow Search Button exactly matching Figure 1 */}
            <button
              onClick={handleSearchSubmit}
              className="bg-[#fec33d] hover:bg-[#ffd15c] text-black text-[10px] font-black px-4 py-1.5 rounded-full transition-all active:scale-95 shrink-0 shadow-md"
            >
              搜索
            </button>
          </div>

          {/* Options Column on the Right: 全部 vs 免费 */}
          <div className="flex flex-col gap-1.5 pl-1 shrink-0 text-[10px]">
            {/* 全部 Option */}
            <button
              onClick={() => setSearchFilterType('all')}
              className="flex items-center gap-1 text-gray-300 hover:text-white"
            >
              <span
                className={`w-2.5 h-2.5 rounded-full border flex items-center justify-center ${
                  searchFilterType === 'all' ? 'border-white bg-white' : 'border-gray-500'
                }`}
              >
                {searchFilterType === 'all' && (
                  <span className="w-1 h-1 rounded-full bg-[#1e1e21]"></span>
                )}
              </span>
              <span>全部</span>
            </button>

            {/* 免费 Option */}
            <button
              onClick={() => setSearchFilterType('free')}
              className="flex items-center gap-1 text-[#00bfff] hover:brightness-110"
            >
              <span
                className={`w-2.5 h-2.5 rounded-full border-2 flex items-center justify-center ${
                  searchFilterType === 'free' ? 'border-[#00bfff] bg-transparent' : 'border-gray-500'
                }`}
              >
                {searchFilterType === 'free' && (
                  <span className="w-1 h-1 rounded-full bg-[#00bfff]"></span>
                )}
              </span>
              <span>免费</span>
            </button>
          </div>
        </div>

        {/* Search Body area */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-5 pb-24">
          {/* 猜你喜欢 Section */}
          <div className="space-y-2.5">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-1.5">
              <span>猜你喜欢</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {guessYouLikeTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleTagClick(tag)}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-medium transition-all ${
                    searchQuery === tag
                      ? 'bg-brand-purple text-white border border-brand-purple'
                      : 'bg-[#25252a] text-gray-300 hover:bg-[#323238] hover:text-white border border-transparent'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* 历史搜索 Section (搜索录入) */}
          {searchHistory.length > 0 && (
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                  <span>历史搜索</span>
                </h3>
                <button
                  onClick={clearHistory}
                  className="text-[10px] text-gray-400 hover:text-red-400 font-bold transition-colors"
                >
                  🗑️ 清空记录
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {searchHistory.map((term) => (
                  <div 
                    key={term} 
                    className="flex items-center gap-1.5 bg-[#25252a] hover:bg-[#323238] border border-neutral-800 rounded-full pl-3 pr-2 py-1 text-[11px] text-gray-300 transition-all hover:text-white"
                  >
                    <button
                      onClick={() => handleTagClick(term)}
                      className="font-medium focus:outline-none"
                    >
                      {term}
                    </button>
                    <button
                      onClick={() => removeHistoryItem(term)}
                      className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] text-gray-500 hover:text-white hover:bg-neutral-800 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Long/Short Video Tab Switcher matching Figure 1 */}
          <div className="border-b border-neutral-800">
            <div className="flex gap-1">
              <button
                onClick={() => setActiveSearchTab('long')}
                className={`flex-1 text-center py-2.5 text-xs font-extrabold transition-all relative ${
                  activeSearchTab === 'long' ? 'text-brand-purple' : 'text-gray-400 hover:text-white'
                }`}
              >
                长视频
                {activeSearchTab === 'long' && (
                  <motion.div
                    layoutId="searchActiveLine"
                    className="absolute bottom-0 inset-x-0 mx-auto w-12 h-0.5 bg-brand-purple rounded-full"
                  />
                )}
              </button>
              <button
                onClick={() => setActiveSearchTab('short')}
                className={`flex-1 text-center py-2.5 text-xs font-extrabold transition-all relative ${
                  activeSearchTab === 'short' ? 'text-brand-purple' : 'text-gray-400 hover:text-white'
                }`}
              >
                短视频
                {activeSearchTab === 'short' && (
                  <motion.div
                    layoutId="searchActiveLine"
                    className="absolute bottom-0 inset-x-0 mx-auto w-12 h-0.5 bg-brand-purple rounded-full"
                  />
                )}
              </button>
            </div>
          </div>

          {/* Result Section Header */}
          <div className="flex items-center justify-between border-l-2 border-brand-purple pl-2">
            <h4 className="text-xs font-black tracking-wide text-gray-200">
              {searchQuery ? `关于 “${searchQuery}” 的搜索结果` : '热片推荐'}
            </h4>
            <span className="text-[10px] text-gray-500 font-mono">
              共 {activeSearchTab === 'long' ? filteredLongVideos.length : filteredShortVideos.length} 部
            </span>
          </div>

          {/* Results Stream Grid */}
          {activeSearchTab === 'long' ? (
            filteredLongVideos.length === 0 ? (
              <div className="py-12 text-center text-gray-500 text-xs">
                🏜️ 暂无搜索结果。试试其他关键词，或者点击“猜你喜欢”的标签吧！
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3.5">
                {filteredLongVideos.map((video) => (
                  <div
                    key={video.id}
                    onClick={() => {
                      onPlayLongVideo(video);
                      onClose();
                    }}
                    className="group bg-brand-card rounded-xl overflow-hidden border border-neutral-800 flex flex-col justify-between shadow-lg cursor-pointer"
                  >
                    <div className="relative aspect-[16/10] bg-black overflow-hidden">
                      <img
                        src={video.coverUrl}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                        loading="lazy"
                      />
                      <span className="absolute bottom-1 right-1 bg-black/75 px-1 py-0.2 rounded text-[8px] font-mono">
                        {video.duration}
                      </span>
                      {video.isVipOnly && (
                        <span className="absolute top-1 left-1 bg-brand-gold text-black text-[8px] font-black px-1 rounded shadow">
                          VIP
                        </span>
                      )}
                    </div>
                    <div className="p-2 space-y-1">
                      <h4 className="text-[10px] font-bold text-gray-200 line-clamp-2 leading-relaxed group-hover:text-brand-purple transition-colors">
                        {video.title}
                      </h4>
                      <div className="flex justify-between items-center text-[8px] text-gray-500">
                        <span>🔥 {(video.views / 1000).toFixed(1)}k</span>
                        <span>⭐ {video.favorites}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : filteredShortVideos.length === 0 ? (
            <div className="py-12 text-center text-gray-500 text-xs">
              🏜️ 暂无搜索结果。试试其他关键词，或者点击“猜你喜欢”的标签吧！
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3.5">
              {filteredShortVideos.map((video) => (
                <div
                  key={video.id}
                  onClick={() => {
                    onPlayShortVideo(video);
                    onClose();
                  }}
                  className="group bg-brand-card rounded-xl overflow-hidden border border-neutral-800 flex flex-col justify-between shadow-lg cursor-pointer"
                >
                  <div className="relative aspect-[3/4] bg-black overflow-hidden">
                    <img
                      src={video.coverUrl}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />
                    <span className="absolute bottom-1.5 right-1.5 bg-black/60 px-1 py-0.2 rounded text-[8px] font-mono">
                      {video.duration || '0:30'}
                    </span>
                    {video.isVipOnly && (
                      <span className="absolute top-1.5 left-1.5 bg-brand-gold text-black text-[8px] font-black px-1 rounded shadow">
                        VIP
                      </span>
                    )}
                  </div>
                  <div className="p-2 space-y-1">
                    <h4 className="text-[10px] font-bold text-gray-200 line-clamp-2 leading-relaxed group-hover:text-brand-purple transition-colors">
                      {video.title}
                    </h4>
                    <div className="flex justify-between items-center text-[8px] text-gray-500">
                      <span>👍 {video.likes >= 1000 ? `${(video.likes / 1000).toFixed(0)}k` : video.likes} 赞</span>
                      <span className="text-brand-purple">@{video.uploader.name}</span>
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
  );
}
