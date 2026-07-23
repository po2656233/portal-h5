import React, { useState, useEffect } from 'react';
import { UserWallet, UserProfile } from '../types';
import { 
  User, Search, Coins, Sparkles, Star, Eye, ThumbsUp, MapPin, 
  Phone, MessageCircle, Heart, Lock, Check, Send, Grid, List, Compass, Bookmark, ShieldAlert, Image, Home
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LoufengTabProps {
  wallet: UserWallet;
  profile: UserProfile;
  onUpdateWallet: (wallet: Partial<UserWallet>) => void;
  onUpdateProfile: (profile: Partial<UserProfile>) => void;
  onOpenTopup: (type: 'vip' | 'coin' | 'transfer') => void;
}

export interface LoufengItem {
  id: string;
  name: string;
  city: '上海' | '北京' | '广州' | '深圳';
  district: string;
  age: number;
  height: string;
  weight: string;
  cup: string;
  price: string;
  coinCost: number; // Coins required to unlock contact info
  rating: number;
  views: string;
  likes: number;
  tags: string[];
  avatar: string;
  photos: string[]; // 个人生活照
  roomPhotos: string[]; // 生活空间照
  services: string[];
  description: string;
  isVipOnly: boolean;
  contact: {
    wechat: string;
    telegram: string;
    phone: string;
  };
}

const MOCK_LOUFENG: LoufengItem[] = [
  {
    id: 'lf-1',
    name: '樱奈 (Jasmine)',
    city: '上海',
    district: '静安区威海路附近',
    age: 21,
    height: '168cm',
    weight: '47kg',
    cup: '34C Cup',
    price: '1200元 / P (单次)',
    coinCost: 10,
    rating: 4.9,
    views: '1.2w',
    likes: 582,
    tags: ['极品颜值', '温柔御姐', '黑丝高跟', '留学生气质'],
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    photos: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80'
    ],
    roomPhotos: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&q=80'
    ],
    services: ['香薰沐浴', '丝足漫游', '温情独处', '性感制服诱惑', '深度按摩', '激情水疗'],
    description: '哈罗，我是樱奈！目前是一名在读服装设计专业的兼职女生。性格温柔体贴，话不多。我非常注重服务细节与老司机的体验，自己的私人工作室每天严格消毒，香氛宜人，床上用品一客一换。期待高素质的你到来哦！',
    isVipOnly: false,
    contact: {
      wechat: 'Sakura_Ying99',
      telegram: '@jasmine_sakura9',
      phone: '13912884920'
    }
  },
  {
    id: 'lf-2',
    name: '幼熙 (Yumi)',
    city: '北京',
    district: '朝阳区三里屯公馆',
    age: 23,
    height: '165cm',
    weight: '45kg',
    cup: '32D Cup',
    price: '1500元 / P (单次)',
    coinCost: 15,
    rating: 5.0,
    views: '2.5w',
    likes: 890,
    tags: ['爆乳童颜', '蜜桃极品', '绝对安全', '极度配合'],
    avatar: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=400&q=80',
    photos: [
      'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80'
    ],
    roomPhotos: [
      'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=600&q=80'
    ],
    services: ['法式鸳鸯浴', '毒药按摩', '贴身热舞', '极速释放', '女友深度体验', '夜色情调调酒'],
    description: '北京三里屯高档私人公寓，安保严密，绝对隐蔽。幼熙是一位性格开朗、有一点点俏皮的小姐姐。喜欢健身和跳舞，身材凹凸有致，对哥哥们要求不高，只希望你懂礼貌、爱干净。欢迎哥哥微信咨询约拍或深度探讨人生！',
    isVipOnly: true,
    contact: {
      wechat: 'YumiBox_Beijing',
      telegram: '@yumi_lovebj',
      phone: '18610294821'
    }
  },
  {
    id: 'lf-3',
    name: '诗雅 (Shirley)',
    city: '深圳',
    district: '福田区皇岗口岸公寓',
    age: 24,
    height: '172cm',
    weight: '51kg',
    cup: '36C Cup',
    price: '2000元 / PP (双次)',
    coinCost: 12,
    rating: 4.8,
    views: '1.8w',
    likes: 620,
    tags: ['逆天长腿', '御姐白领', '高雅冷艳', '商务气质'],
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    photos: [
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=600&q=80'
    ],
    roomPhotos: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&q=80'
    ],
    services: ['高端SPA', '足部疗愈', '全制服角色扮演', '温柔倾听伴侣', '沐浴擦干服务', '浪漫双人时光'],
    description: '诗雅是一位全职高档会所专属技师，由于会所整改，目前在福田自租高级江景复式公寓单独开展接待。172身高，天生丽质冷白皮，九头身比例。非常健谈，情商高，能够完美配合高难姿势，绝对无死角！',
    isVipOnly: false,
    contact: {
      wechat: 'Shirley_Shenzhen99',
      telegram: '@shirley_sz99',
      phone: '13148293021'
    }
  },
  {
    id: 'lf-4',
    name: '菲菲 (Fiona)',
    city: '广州',
    district: '天河区林和西公寓',
    age: 22,
    height: '163cm',
    weight: '44kg',
    cup: '32B Cup',
    price: '900元 / P (单次)',
    coinCost: 8,
    rating: 4.7,
    views: '9800',
    likes: 310,
    tags: ['甜美萝莉', '纯欲天花板', '配合度满分', '极致亲和'],
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
    photos: [
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=600&q=80'
    ],
    roomPhotos: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80'
    ],
    services: ['小清新泡浴', '肩颈背深度解压', '角色扮演（校服/女仆）', '口舌生香服务', '轻盈释放交互'],
    description: '哈喽，小哥哥！我是天河的小仙女菲菲～ 性格超级黏人，配合度可以说是百分百！不催时间、不机车、不怠慢。如果你在繁华的都市感到疲倦了，就来菲菲的小窝里，喝一杯热茶，享受菲菲温柔的小手给您带来的全身深度放松吧～',
    isVipOnly: false,
    contact: {
      wechat: 'Feifei_GZ_Tianhe',
      telegram: '@feifei_gz_sweet',
      phone: '18520293041'
    }
  },
  {
    id: 'lf-5',
    name: '梓萱 (Chloe)',
    city: '上海',
    district: '徐汇区衡山路洋房',
    age: 25,
    height: '170cm',
    weight: '50kg',
    cup: '36D Cup',
    price: '1800元 / P (单次)',
    coinCost: 18,
    rating: 4.9,
    views: '3.2w',
    likes: 1240,
    tags: ['御姐女神', '留美空姐', '绝世好胸', '极度奢华'],
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
    photos: [
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80'
    ],
    roomPhotos: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=600&q=80'
    ],
    services: ['五星红酒玫瑰浴', '全身游龙推背', '高定情趣香水诱惑', '深度伴侣交互', '角色空姐扮演', '全身顶级精油SPA'],
    description: '前某知名外航空乘，气质高冷高贵。衡山路独栋花园复式房，配套顶级，提供上等红酒。梓萱不属于一般大众化技师，接待的是真正懂品质、有涵养的尊贵贵宾。要求极高配合、完美床品的哥哥不要错过，提供绝对的高端外围质量。',
    isVipOnly: true,
    contact: {
      wechat: 'Chloe_XuHui_Vip',
      telegram: '@chloe_shanghaivip',
      phone: '13810294830'
    }
  }
];

// Helper to store subscriptions in local storage
const SUBSCRIBED_KEY = 'banana_loufeng_subscribed_ids';
// Helper to store unlocked contact details
const UNLOCKED_CONTACTS_KEY = 'banana_loufeng_unlocked_ids';

export default function LoufengTab({
  wallet,
  profile,
  onUpdateWallet,
  onUpdateProfile,
  onOpenTopup
}: LoufengTabProps) {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCity, setActiveCity] = useState<string>('全部');
  const [filterType, setFilterType] = useState<'all' | 'hot' | 'subscribed'>('all');
  const [selectedGirl, setSelectedGirl] = useState<LoufengItem | null>(null);

  // States to keep track of subscriptions & unlocks
  const [subscribedIds, setSubscribedIds] = useState<string[]>(() => {
    const saved = localStorage.getItem(SUBSCRIBED_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  
  const [unlockedIds, setUnlockedIds] = useState<string[]>(() => {
    const saved = localStorage.getItem(UNLOCKED_CONTACTS_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  // Photo gallery slider index
  const [activePhotoType, setActivePhotoType] = useState<'life' | 'room'>('life');
  const [activePhotoIndex, setActivePhotoIndex] = useState<number>(0);

  // Review states inside modal
  const [reviews, setReviews] = useState<{ [girlId: string]: { author: string; content: string; stars: number; date: string }[] }>({
    'lf-1': [
      { author: '老金领_上海', content: '小姑娘态度超级好，说话轻声细语的。水疗手法专业，人很干净白白净净。', stars: 5, date: '2026-07-16' },
      { author: '徐汇张公子', content: '服装设计的留学生，气质绝了，穿那套制服简直让人无法呼吸，必须二刷！', stars: 5, date: '2026-07-18' }
    ],
    'lf-2': [
      { author: '帝都老司机', content: '幼熙的身材真是极品中的极品，公馆安保极好，微信提前预约，服务没有任何水分。', stars: 5, date: '2026-07-15' }
    ],
    'lf-3': [
      { author: '深港双城记', content: '九头身大长腿是真的，进屋就感觉气质不凡。价格稍微有点小贵，但是很值这个质量！', stars: 4, date: '2026-07-17' }
    ]
  });

  const [newCommentText, setNewCommentText] = useState<string>('');
  const [newCommentRating, setNewCommentRating] = useState<number>(5);

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem(SUBSCRIBED_KEY, JSON.stringify(subscribedIds));
  }, [subscribedIds]);

  useEffect(() => {
    localStorage.setItem(UNLOCKED_CONTACTS_KEY, JSON.stringify(unlockedIds));
  }, [unlockedIds]);

  // Subscription action
  const handleToggleSubscribe = (id: string, name: string) => {
    if (subscribedIds.includes(id)) {
      setSubscribedIds(prev => prev.filter(item => item !== id));
      window.customAlert('🔔 已取消订阅', `您已成功取消订阅人物 [${name}] 的动态消息。`);
    } else {
      setSubscribedIds(prev => [...prev, id]);
      window.customRewardAlert(
        '💖 订阅成功',
        `恭喜！您已成功订阅 [${name}] 的私人专栏信息。当她有新照更新、生活空间变动或临时出差通知时，系统将第一时间推送给您！`,
        { coins: 5 } // Give a 5 coin reward for experiencing subscription!
      );
    }
  };

  // Unlock contact information
  const handleUnlockContact = (girl: LoufengItem) => {
    // Check if VIP only and user is not VIP
    if (girl.isVipOnly && (!profile.isLoggedIn || profile.vipDaysLeft <= 0)) {
      window.customConfirm(
        '🔒 尊享会员专属通道',
        `人物 [${girl.name}] 属于顶级特选专栏，仅对 VIP 会员开放解锁。您当前不是 VIP 会员，是否立刻前往升级？`,
        () => {
          onOpenTopup('vip');
        }
      );
      return;
    }

    if (wallet.goldCoins < girl.coinCost) {
      window.customConfirm(
        '💰 金币余额不足',
        `解锁 [${girl.name}] 的私人联系方式需要 ${girl.coinCost} 金币，您当前账户仅有 ${wallet.goldCoins} 金币。\n\n是否立刻前往极速充值？`,
        () => {
          onOpenTopup('coin');
        }
      );
      return;
    }

    window.customConfirm(
      '🔑 确认支付金币解锁',
      `确定消耗 ${girl.coinCost} 社区金币，获取 [${girl.name}] 的微信号、Telegram和私人联系电话吗？`,
      () => {
        onUpdateWallet({ goldCoins: wallet.goldCoins - girl.coinCost });
        setUnlockedIds(prev => [...prev, girl.id]);
        window.customRewardAlert(
          '🎉 联系方式已解锁',
          `恭喜！您已成功解锁人物 [${girl.name}] 的真实私人联系方式。老司机请注意绿色文明交往，遵守当地规定。`,
          { tickets: 5 } // Reward short video tickets as standard incentive!
        );
      }
    );
  };

  // Add a review
  const handleAddReview = (girlId: string) => {
    if (!newCommentText.trim()) {
      window.customAlert('⚠️ 提示', '请输入您对这位小姐姐的评语或体验报告！');
      return;
    }

    const newReview = {
      author: profile.isLoggedIn ? profile.username : '匿名老司机',
      content: newCommentText.trim(),
      stars: newCommentRating,
      date: new Date().toISOString().split('T')[0]
    };

    setReviews(prev => ({
      ...prev,
      [girlId]: [newReview, ...(prev[girlId] || [])]
    }));

    setNewCommentText('');
    window.customRewardAlert(
      '✍️ 体验报告提交成功',
      '感谢老司机的真实反馈与体验评价！您的宝贵意见已实时收录，奖励已发放。',
      { coins: 3 }
    );
  };

  // Filter Loufeng items based on filters and search queries
  const filteredLoufeng = MOCK_LOUFENG.filter(g => {
    // 1. City Filter
    if (activeCity !== '全部' && g.city !== activeCity) return false;

    // 2. Tab Filter
    if (filterType === 'hot' && g.rating < 4.9) return false;
    if (filterType === 'subscribed' && !subscribedIds.includes(g.id)) return false;

    // 3. Search text query
    const text = searchQuery.toLowerCase().trim();
    if (text) {
      const matchesName = g.name.toLowerCase().includes(text);
      const matchesDistrict = g.district.toLowerCase().includes(text);
      const matchesTags = g.tags.some(t => t.toLowerCase().includes(text));
      const matchesServices = g.services.some(s => s.toLowerCase().includes(text));
      const matchesDesc = g.description.toLowerCase().includes(text);
      return matchesName || matchesDistrict || matchesTags || matchesServices || matchesDesc;
    }

    return true;
  });

  return (
    <div className="flex-1 flex flex-col bg-brand-bg text-white overflow-hidden pb-16">
      
      {/* 1. TOP HEADER BAR */}
      <div className="p-4 bg-brand-card border-b border-neutral-800 shrink-0 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-pink-500/15 flex items-center justify-center border border-pink-500/20">
            <Compass className="w-4.5 h-4.5 text-pink-500 animate-spin-slow" />
          </div>
          <div>
            <h1 className="text-sm font-black text-white tracking-wide flex items-center gap-1.5">
              <span>楼凤社区</span>
              <span className="bg-gradient-to-r from-amber-400 to-yellow-500 text-black text-[7px] px-1.5 py-0.2 rounded font-black scale-90">VIP专栏</span>
            </h1>
            <p className="text-[8px] text-pink-500 font-mono uppercase tracking-wider">Escort Community</p>
          </div>
        </div>

        {/* Coins indicator & Recharge */}
        <div 
          onClick={() => onOpenTopup('coin')}
          className="bg-neutral-900 border border-neutral-800 rounded-2xl py-1 px-3 flex items-center gap-1.5 cursor-pointer hover:border-pink-500/20 transition-all"
        >
          <Coins className="w-3.5 h-3.5 text-brand-gold animate-bounce" />
          <span className="text-[10px] font-extrabold text-brand-gold">{wallet.goldCoins} 社区币</span>
          <span className="text-[8px] text-pink-400 bg-pink-500/15 px-1.5 py-0.2 rounded font-black">充值</span>
        </div>
      </div>

      {/* 2. SEARCH BAR & CITY SWITCHERS */}
      <div className="px-4 py-3 bg-brand-bg shrink-0 space-y-3">
        {/* Search input field */}
        <div className="relative">
          <input 
            type="text" 
            placeholder="搜索人物昵称、区域、特色（如：黑丝、爆乳、留学生）..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-brand-card border border-neutral-800 rounded-xl py-2 pl-9 pr-8 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-purple/50 transition-colors"
          />
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-xs text-gray-500 hover:text-white"
            >
              ×
            </button>
          )}
        </div>

        {/* Horizontal Cities Grid Selector */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-0.5">
          {['全部', '上海', '北京', '广州', '深圳'].map((city) => (
            <button
              key={city}
              onClick={() => setActiveCity(city)}
              className={`py-1 px-4 text-[10px] font-black rounded-full whitespace-nowrap transition-all border ${
                activeCity === city
                  ? 'bg-brand-purple border-brand-purple text-white shadow-md'
                  : 'bg-brand-card border-neutral-800 text-gray-400 hover:text-white'
              }`}
            >
              {city}
            </button>
          ))}
        </div>

        {/* Tab Filters Switcher */}
        <div className="grid grid-cols-3 p-1 bg-neutral-900 rounded-xl border border-neutral-800">
          <button
            onClick={() => setFilterType('all')}
            className={`py-1.5 text-[9px] font-black rounded-lg transition-all flex items-center justify-center gap-1 ${
              filterType === 'all' 
                ? 'bg-brand-purple text-white shadow-md' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Grid className="w-3 h-3" />
            <span>全部佳丽</span>
          </button>
          <button
            onClick={() => setFilterType('hot')}
            className={`py-1.5 text-[9px] font-black rounded-lg transition-all flex items-center justify-center gap-1 ${
              filterType === 'hot' 
                ? 'bg-brand-purple text-white shadow-md' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>高分爆款</span>
          </button>
          <button
            onClick={() => setFilterType('subscribed')}
            className={`py-1.5 text-[9px] font-black rounded-lg transition-all flex items-center justify-center gap-1 ${
              filterType === 'subscribed' 
                ? 'bg-brand-purple text-white shadow-md' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Bookmark className="w-3 h-3" />
            <span>我的订阅</span>
            {subscribedIds.length > 0 && (
              <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping" />
            )}
          </button>
        </div>
      </div>

      {/* 3. MAIN CARDS FEED LIST */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 space-y-4">
        
        {/* High-Fidelity VIP Escort Sponsor Ad Banner */}
        <div 
          onClick={() => onOpenTopup('vip')}
          className="relative bg-gradient-to-r from-pink-900 via-rose-900 to-purple-950 p-3.5 rounded-2xl border-2 border-pink-400/80 overflow-hidden cursor-pointer shadow-[0_0_20px_rgba(236,72,153,0.35)] hover:scale-[1.01] transition-all flex items-center justify-between group"
        >
          <span className="absolute top-0 right-0 bg-gradient-to-r from-pink-500 to-rose-600 text-white text-[8px] font-black px-2 py-0.5 rounded-bl-xl shadow">
            💎 尊享VIP极速特权
          </span>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 border border-white flex items-center justify-center text-2xl shadow-md shrink-0 group-hover:scale-110 transition-transform">
              👑
            </div>
            <div>
              <h4 className="font-black text-white text-xs flex items-center gap-1">
                同城极品私人速约：<span className="text-yellow-300 font-black">VIP全免解锁微信号！</span>
              </h4>
              <p className="text-[10px] text-pink-200 mt-0.5 font-bold">已覆盖全国 300+ 城市 · 真实极品全套自查</p>
            </div>
          </div>
          <span className="text-[10px] bg-gradient-to-r from-yellow-300 to-amber-400 text-black px-3 py-1.5 rounded-xl font-black shadow-md shrink-0 group-hover:brightness-110 flex items-center gap-1">
            <span>开通VIP</span>
            <span>➔</span>
          </span>
        </div>

        {/* Banner Alert Advice */}
        <div className="p-3 rounded-2xl bg-gradient-to-r from-brand-purple/15 via-rose-950/15 to-transparent border border-pink-500/10 flex items-start gap-2.5">
          <ShieldAlert className="w-4.5 h-4.5 text-brand-gold shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <h4 className="text-[10px] font-black text-brand-gold flex items-center gap-1">
              <span>老司机绿色文明约见准则</span>
              <span className="bg-amber-500/20 text-amber-400 text-[6px] px-1 rounded">须知</span>
            </h4>
            <p className="text-[8px] text-gray-400 leading-relaxed">
              本平台仅收集真实老司机回执体验，所涉人物照片均为本人生活照和生活工作室空间实拍。请自觉遵守道德，爱护卫生环境。
            </p>
          </div>
        </div>

        {filteredLoufeng.length === 0 ? (
          <div className="py-20 text-center text-xs text-gray-500 space-y-2 flex flex-col items-center">
            <span className="text-3xl">🏜️</span>
            <span>该筛选条件下暂无人物信息</span>
            {filterType === 'subscribed' && (
              <span className="text-[9px] text-gray-600">点击人物卡片中的“订阅”按钮，即可随时随地在这里快速找她哦</span>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3.5 pb-8">
            {filteredLoufeng.map((girl) => {
              const isSubscribed = subscribedIds.includes(girl.id);
              const isUnlocked = unlockedIds.includes(girl.id);

              return (
                <div
                  key={girl.id}
                  className="bg-brand-card rounded-2xl border border-neutral-800/80 p-3 flex gap-3 relative hover:border-brand-purple/30 transition-all cursor-pointer group"
                  onClick={() => {
                    setSelectedGirl(girl);
                    setActivePhotoType('life');
                    setActivePhotoIndex(0);
                  }}
                >
                  {/* Avatar left column with scale effect */}
                  <div className="w-24 h-32 rounded-xl overflow-hidden bg-black shrink-0 relative shadow-md">
                    <img
                      src={girl.avatar}
                      alt={girl.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />

                    {/* VIP Only Marker */}
                    {girl.isVipOnly && (
                      <span className="absolute top-1.5 left-1.5 bg-gradient-to-r from-amber-400 to-yellow-500 text-black text-[7px] font-black px-1.5 py-0.5 rounded shadow flex items-center gap-0.5">
                        👑 VIP
                      </span>
                    )}

                    {/* City Badge overlay */}
                    <span className="absolute bottom-1.5 right-1.5 bg-black/75 backdrop-blur-sm text-pink-400 text-[8px] font-black px-1.5 py-0.5 rounded">
                      {girl.city}
                    </span>
                  </div>

                  {/* Right side info column */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                    <div className="space-y-1">
                      
                      {/* Name & Distance */}
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-extrabold text-white group-hover:text-pink-400 transition-colors truncate">
                          {girl.name}
                        </h3>
                        <div className="flex items-center gap-0.5 text-gray-400 font-bold text-[8px]">
                          <MapPin className="w-2.5 h-2.5 text-rose-500" />
                          <span>{girl.district.split('区')[0]}区</span>
                        </div>
                      </div>

                      {/* Dimensions tags */}
                      <div className="flex items-center gap-1.5 text-[8px] text-gray-400 font-semibold font-mono">
                        <span className="bg-[#191919] px-1.5 py-0.5 rounded text-brand-gold">{girl.age}岁</span>
                        <span>•</span>
                        <span>{girl.height}</span>
                        <span>•</span>
                        <span>{girl.weight}</span>
                        <span>•</span>
                        <span className="text-pink-400 font-extrabold">{girl.cup}</span>
                      </div>

                      {/* Service tags */}
                      <div className="flex flex-wrap gap-1 pt-1">
                        {girl.tags.slice(0, 3).map(tag => (
                          <span 
                            key={tag} 
                            className="text-[7px] bg-neutral-900 border border-neutral-800 text-gray-400 px-1.5 py-0.2 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Bottom stats and price action row */}
                    <div className="flex items-center justify-between pt-2 border-t border-neutral-900">
                      <div>
                        <div className="text-[7px] text-gray-500 font-bold uppercase">消费参考价</div>
                        <div className="text-[11px] font-black text-rose-500 font-mono">{girl.price}</div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {/* Subscription heart button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleSubscribe(girl.id, girl.name);
                          }}
                          className={`p-1.5 rounded-lg border transition-all ${
                            isSubscribed
                              ? 'bg-rose-500/15 border-rose-500 text-rose-500'
                              : 'bg-neutral-900 border-neutral-800 text-gray-500 hover:text-rose-400'
                          }`}
                          title={isSubscribed ? "已订阅" : "订阅动态"}
                        >
                          <Heart className="w-3.5 h-3.5 fill-current" />
                        </button>

                        {/* Direct detailed contact button */}
                        <button
                          type="button"
                          className={`py-1 px-3 text-[9px] font-black rounded-lg transition-all ${
                            isUnlocked 
                              ? 'bg-emerald-500 text-white font-black'
                              : 'bg-brand-purple text-white hover:opacity-90'
                          }`}
                        >
                          {isUnlocked ? '已解锁' : '详情/联系'}
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. DETAILS CAROUSEL OVERLAY SCREEN */}
      <AnimatePresence>
        {selectedGirl && (
          <motion.div 
            key="loufeng-detail-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/90 backdrop-blur-md"
          >
            <motion.div
              initial={{ y: 250, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 250, opacity: 0 }}
              className="bg-brand-card w-full max-w-md rounded-t-[32px] border-t border-neutral-800 text-white relative pb-6 max-h-[90%] overflow-y-auto no-scrollbar"
            >
              
              {/* Swipe down anchor bar */}
              <div 
                onClick={() => setSelectedGirl(null)}
                className="absolute top-2.5 left-1/2 -translate-x-1/2 w-12 h-1 bg-neutral-800 hover:bg-neutral-700 rounded-full cursor-pointer z-55" 
              />

              {/* Close Button top-right */}
              <button
                onClick={() => setSelectedGirl(null)}
                className="absolute top-4 right-4 w-7 h-7 bg-black/55 backdrop-blur-sm text-gray-400 hover:text-white rounded-full flex items-center justify-center text-sm font-bold z-50 border border-neutral-800"
              >
                ×
              </button>

              {/* TOP PICTURE CAROUSEL SLIDER */}
              <div className="relative aspect-[4/3] bg-neutral-950 overflow-hidden shrink-0 group">
                <img
                  src={
                    activePhotoType === 'life'
                      ? selectedGirl.photos[activePhotoIndex] || selectedGirl.avatar
                      : selectedGirl.roomPhotos[activePhotoIndex] || selectedGirl.roomPhotos[0] || selectedGirl.avatar
                  }
                  alt={selectedGirl.name}
                  className="w-full h-full object-cover select-none"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />

                {/* Picture type Switcher Tabs overlay */}
                <div className="absolute top-4 left-4 flex gap-1.5 z-40">
                  <button
                    onClick={() => {
                      setActivePhotoType('life');
                      setActivePhotoIndex(0);
                    }}
                    className={`px-3 py-1 text-[8px] font-black rounded-lg transition-all ${
                      activePhotoType === 'life'
                        ? 'bg-pink-500 text-white shadow-md'
                        : 'bg-black/60 backdrop-blur-md text-gray-300'
                    }`}
                  >
                    <Image className="w-2.5 h-2.5 inline mr-1" />
                    个人生活照 ({selectedGirl.photos.length})
                  </button>
                  <button
                    onClick={() => {
                      setActivePhotoType('room');
                      setActivePhotoIndex(0);
                    }}
                    className={`px-3 py-1 text-[8px] font-black rounded-lg transition-all ${
                      activePhotoType === 'room'
                        ? 'bg-pink-500 text-white shadow-md'
                        : 'bg-black/60 backdrop-blur-md text-gray-300'
                    }`}
                  >
                    <Home className="w-2.5 h-2.5 inline mr-1" />
                    生活空间 ({selectedGirl.roomPhotos.length})
                  </button>
                </div>

                {/* Dots indicator */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-40 bg-black/45 backdrop-blur-sm p-1.5 rounded-full">
                  {(activePhotoType === 'life' ? selectedGirl.photos : selectedGirl.roomPhotos).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActivePhotoIndex(i)}
                      className={`w-1.5 h-1.5 rounded-full transition-all ${activePhotoIndex === i ? 'bg-pink-400 scale-125' : 'bg-gray-500'}`}
                    />
                  ))}
                </div>

                {/* Prev/Next arrows on pictures */}
                <button
                  disabled={activePhotoIndex === 0}
                  onClick={() => setActivePhotoIndex(prev => prev - 1)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/55 backdrop-blur-sm flex items-center justify-center text-gray-400 hover:text-white disabled:opacity-20 transition-all z-40"
                >
                  ◀
                </button>
                <button
                  disabled={activePhotoIndex >= (activePhotoType === 'life' ? selectedGirl.photos.length : selectedGirl.roomPhotos.length) - 1}
                  onClick={() => setActivePhotoIndex(prev => prev + 1)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/55 backdrop-blur-sm flex items-center justify-center text-gray-400 hover:text-white disabled:opacity-20 transition-all z-40"
                >
                  ▶
                </button>
              </div>

              {/* SPECIFICATION DETAILS CARD CONTAINER */}
              <div className="p-5 space-y-4">
                
                {/* Identification & quick badges */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-black text-white">{selectedGirl.name}</h2>
                      <span className="text-[9px] bg-pink-500/15 text-pink-400 font-black px-1.5 py-0.2 rounded">
                        {selectedGirl.city} · {selectedGirl.district.split('区')[0]}区
                      </span>
                    </div>
                    <p className="text-[9px] text-gray-500 font-semibold font-mono mt-0.5">{selectedGirl.district}</p>
                  </div>

                  {/* Rating indicators */}
                  <div className="text-right">
                    <div className="text-brand-gold font-extrabold text-xs flex items-center justify-end gap-1">
                      <Star className="w-3.5 h-3.5 text-brand-gold fill-current animate-spin-slow" />
                      <span>{selectedGirl.rating} 分</span>
                    </div>
                    <p className="text-[8px] text-gray-500 font-bold">人气: {selectedGirl.views} | 赞: {selectedGirl.likes}</p>
                  </div>
                </div>

                {/* Grid metrics row */}
                <div className="grid grid-cols-4 gap-2 text-center bg-[#131313] border border-neutral-900 rounded-2xl p-2.5">
                  <div>
                    <div className="text-[7px] text-gray-500 font-bold">芳龄</div>
                    <div className="text-[11px] font-black text-brand-gold mt-0.5 font-mono">{selectedGirl.age} 岁</div>
                  </div>
                  <div>
                    <div className="text-[7px] text-gray-500 font-bold">身高</div>
                    <div className="text-[11px] font-black text-white mt-0.5 font-mono">{selectedGirl.height}</div>
                  </div>
                  <div>
                    <div className="text-[7px] text-gray-500 font-bold">体重</div>
                    <div className="text-[11px] font-black text-white mt-0.5 font-mono">{selectedGirl.weight}</div>
                  </div>
                  <div>
                    <div className="text-[7px] text-gray-500 font-bold">罩杯</div>
                    <div className="text-[11px] font-black text-pink-400 mt-0.5 font-mono">{selectedGirl.cup.split(' ')[0]}</div>
                  </div>
                </div>

                {/* Subscribing option */}
                <div className="flex items-center justify-between bg-neutral-900 p-2 rounded-xl border border-neutral-800">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-pink-500 fill-current animate-pulse" />
                    <div>
                      <h4 className="text-[9px] font-black text-gray-200">订阅最新动态照和时间通知</h4>
                      <p className="text-[7px] text-gray-500">如有工作室变动或出差通知，系统将第一时间给您推送</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleSubscribe(selectedGirl.id, selectedGirl.name)}
                    className={`py-1 px-3 text-[9px] font-black rounded-lg transition-all border ${
                      subscribedIds.includes(selectedGirl.id)
                        ? 'bg-rose-500/10 border-rose-500 text-rose-500'
                        : 'bg-brand-purple border-brand-purple text-white'
                    }`}
                  >
                    {subscribedIds.includes(selectedGirl.id) ? '已订阅' : '订阅动态'}
                  </button>
                </div>

                {/* Description Text */}
                <div className="space-y-1">
                  <h4 className="text-[9px] text-gray-400 font-black flex items-center gap-1">
                    <span>💬</span>
                    <span>小姐姐自述</span>
                  </h4>
                  <p className="text-[10px] text-gray-300 leading-relaxed bg-[#141414] p-3 rounded-xl border border-neutral-900 text-justify">
                    {selectedGirl.description}
                  </p>
                </div>

                {/* Active Services pills */}
                <div className="space-y-1.5">
                  <h4 className="text-[9px] text-gray-400 font-black">🌸 提供服务项目</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedGirl.services.map((item) => (
                      <span 
                        key={item}
                        className="px-2.5 py-0.5 rounded-md bg-[#191919] border border-neutral-850 text-[9px] font-bold text-gray-300"
                      >
                        ✓ {item}
                      </span>
                    ))}
                  </div>
                </div>

                {/* CONTACT INFORMATION AREA - LOCKED OR REVEALED */}
                <div className="border border-neutral-800 rounded-2xl bg-[#151515] overflow-hidden shadow-lg">
                  <div className="bg-neutral-900 p-2.5 border-b border-neutral-800 flex items-center justify-between">
                    <h4 className="text-[9px] font-black text-brand-gold flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-brand-gold" />
                      <span>老司机联系渠道</span>
                    </h4>
                    <span className="text-[8px] text-rose-500 font-bold bg-rose-500/15 px-2 py-0.2 rounded">真实有效</span>
                  </div>

                  {unlockedIds.includes(selectedGirl.id) ? (
                    /* Revealed State */
                    <div className="p-3.5 space-y-3 animate-fade-in text-xs">
                      <div className="flex items-center justify-between bg-black/40 p-2 rounded-xl border border-neutral-800">
                        <div className="flex items-center gap-2">
                          <MessageCircle className="w-4 h-4 text-emerald-400" />
                          <span className="text-[9px] text-gray-400 font-bold">微信账号</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-white font-extrabold select-all bg-neutral-900 px-2 py-0.5 rounded border border-neutral-850">{selectedGirl.contact.wechat}</span>
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(selectedGirl.contact.wechat);
                              window.customAlert('📋 复制成功', '微信已成功复制到剪贴板，请到微信搜索添加。');
                            }}
                            className="text-[9px] text-brand-purple hover:underline"
                          >
                            复制
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between bg-black/40 p-2 rounded-xl border border-neutral-800">
                        <div className="flex items-center gap-2">
                          <Compass className="w-4 h-4 text-sky-400" />
                          <span className="text-[9px] text-gray-400 font-bold">Telegram 飞机</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-sky-400 font-extrabold select-all bg-neutral-900 px-2 py-0.5 rounded border border-neutral-850">{selectedGirl.contact.telegram}</span>
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(selectedGirl.contact.telegram);
                              window.customAlert('📋 复制成功', 'Telegram用户名已成功复制到剪贴板。');
                            }}
                            className="text-[9px] text-brand-purple hover:underline"
                          >
                            复制
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between bg-black/40 p-2 rounded-xl border border-neutral-800">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-pink-400" />
                          <span className="text-[9px] text-gray-400 font-bold">私人电话</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-white font-extrabold select-all bg-neutral-900 px-2 py-0.5 rounded border border-neutral-850">{selectedGirl.contact.phone}</span>
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(selectedGirl.contact.phone);
                              window.customAlert('📋 复制成功', '私人电话号码已成功复制，支持直接拨打。');
                            }}
                            className="text-[9px] text-brand-purple hover:underline"
                          >
                            复制
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Locked State */
                    <div className="p-6 text-center space-y-4">
                      <div className="w-12 h-12 rounded-full bg-brand-purple/15 flex items-center justify-center mx-auto text-xl animate-pulse">
                        🔒
                      </div>
                      <div className="space-y-1 text-center">
                        <h4 className="text-xs font-black text-brand-gold">小姐姐微信号及手机号尚未解锁</h4>
                        <p className="text-[8px] text-gray-500">
                          本资源属于尊享老司机回执，需要消耗 <span className="text-brand-gold font-black">{selectedGirl.coinCost}</span> 社区金币解锁
                        </p>
                      </div>

                      <button
                        onClick={() => handleUnlockContact(selectedGirl)}
                        className="w-full max-w-xs mx-auto py-2.5 rounded-xl bg-brand-purple hover:brightness-105 font-black text-xs text-white flex items-center justify-center gap-1.5 shadow-md shadow-brand-purple/20 transition-all"
                      >
                        <span>⚡ 消耗 {selectedGirl.coinCost} 金币极速解锁联系方式</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* MOCK COMMENTS / EXPERIENCES FORUM */}
                <div className="space-y-3.5 pt-2">
                  <div className="border-b border-neutral-950 pb-2 flex items-center justify-between">
                    <h4 className="text-[9px] text-gray-400 font-black">老司机回执报告 ({ (reviews[selectedGirl.id] || []).length } 条记录)</h4>
                    <span className="text-[8px] text-pink-500 font-mono">100% 真实回执</span>
                  </div>

                  {/* Add feedback row */}
                  <div className="bg-neutral-900 p-2.5 rounded-xl border border-neutral-850 space-y-2">
                    <textarea
                      placeholder="写下您的回执体验报告（被采纳即可向主钱包派发3枚体验金）..."
                      value={newCommentText}
                      onChange={(e) => setNewCommentText(e.target.value)}
                      className="w-full h-12 bg-black border border-neutral-800 rounded-lg p-2 text-[10px] text-white focus:outline-none focus:border-pink-500/50 resize-none placeholder:text-gray-600"
                    />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-[9px] text-gray-400 font-bold">
                        <span>打分：</span>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => setNewCommentRating(star)}
                              className="text-brand-gold hover:scale-115 transition-transform"
                            >
                              ★
                            </button>
                          ))}
                        </div>
                        <span className="font-mono text-brand-gold ml-1">{newCommentRating}分</span>
                      </div>

                      <button
                        onClick={() => handleAddReview(selectedGirl.id)}
                        className="px-3.5 py-1 bg-brand-purple hover:opacity-90 rounded-md text-[9px] font-black text-white flex items-center gap-1"
                      >
                        <Send className="w-2.5 h-2.5" />
                        <span>提交报告</span>
                      </button>
                    </div>
                  </div>

                  {/* List of reviews */}
                  <div className="space-y-2.5 max-h-48 overflow-y-auto no-scrollbar">
                    {(reviews[selectedGirl.id] || []).map((rev, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-black/30 border border-neutral-900 space-y-1">
                        <div className="flex items-center justify-between text-[9px]">
                          <span className="text-brand-gold font-bold">👤 {rev.author}</span>
                          <span className="text-gray-600 font-mono">{rev.date}</span>
                        </div>
                        <div className="text-[10px] text-gray-300 leading-relaxed text-justify">
                          {rev.content}
                        </div>
                        <div className="text-[8px] text-brand-gold font-extrabold flex items-center gap-0.5">
                          {Array.from({ length: rev.stars }).map((_, i) => '★')}
                          {Array.from({ length: 5 - rev.stars }).map((_, i) => '☆')}
                        </div>
                      </div>
                    ))}
                  </div>

                </div>

                {/* Bottom Close Drawer Actions */}
                <div className="flex gap-3 pt-3">
                  <button
                    onClick={() => setSelectedGirl(null)}
                    className="flex-1 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-xs font-black text-gray-400 hover:text-white transition-colors"
                  >
                    关闭详情
                  </button>
                  <button
                    onClick={() => {
                      if (subscribedIds.includes(selectedGirl.id)) {
                        setSelectedGirl(null);
                        setFilterType('subscribed');
                      } else {
                        handleToggleSubscribe(selectedGirl.id, selectedGirl.name);
                      }
                    }}
                    className="flex-1 py-3 bg-brand-gradient rounded-xl text-xs font-black text-white hover:brightness-105 shadow transition-all"
                  >
                    {subscribedIds.includes(selectedGirl.id) ? '在大厅快速锁定' : '加入我的订阅 💖'}
                  </button>
                </div>

              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
