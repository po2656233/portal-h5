import React, { useState, useEffect, useRef } from 'react';
import { UserWallet, UserProfile, WinnerAnnouncement } from '../types';
import { MOCK_WINNERS } from '../data';
import { 
  Award, RefreshCw, Volume2, Coins, CreditCard, ChevronRight,
  Gift, Flame, Clock, Video, Trophy, Grid, Sparkles, Gamepad2, 
  HelpCircle, CheckCircle2, User, Play, X, Heart
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ChessTabProps {
  wallet: UserWallet;
  profile: UserProfile;
  onUpdateWallet: (wallet: Partial<UserWallet>) => void;
  onUpdateProfile: (profile: Partial<UserProfile>) => void;
  onOpenTopup: (type: 'vip' | 'coin' | 'transfer' | 'redeem') => void;
  onOpenCustomerService: () => void;
}

interface GameCard {
  id: string;
  name: string;
  icon: string;
  coverUrl: string;
  description: string;
  minLimit: number;
  onlineCount: number;
  category: 'hot' | 'favorite' | 'live' | 'all' | 'sports';
}

export default function ChessTab({
  wallet,
  profile,
  onUpdateWallet,
  onUpdateProfile,
  onOpenTopup,
  onOpenCustomerService
}: ChessTabProps) {
  const [activeCategory, setActiveCategory] = useState<string>('promo');
  const [tickerIndex, setTickerIndex] = useState<number>(0);
  const [tickers] = useState<WinnerAnnouncement[]>(MOCK_WINNERS);
  const [converting, setConverting] = useState<boolean>(false);
  
  // Ref for the right panel container
  const rightContainerRef = useRef<HTMLDivElement | null>(null);
  const isScrollingRef = useRef<boolean>(false);

  // Play simulator state
  const [activePlayGame, setActivePlayGame] = useState<GameCard | null>(null);
  const [playStep, setPlayStep] = useState<'lobby' | 'deal' | 'result'>('lobby');
  const [userBet, setUserBet] = useState<number>(10);
  const [playMessage, setPlayMessage] = useState<string>('');
  const [playWin, setPlayWin] = useState<boolean>(false);
  const [playAmount, setPlayAmount] = useState<number>(0);

  // Interval for announcements banner
  useEffect(() => {
    const interval = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % tickers.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [tickers]);

  // Sidebar list matching Figure 1 style
  const sidebarList = [
    { id: 'promo', label: '活动', icon: '🎁', color: 'text-amber-500' },
    { id: 'hot', label: '热门', icon: '🔥', color: 'text-pink-500' },
    { id: 'favorite', label: '常玩', icon: '⏰', color: 'text-blue-500' },
    { id: 'live', label: '视讯', icon: '👩', color: 'text-purple-500' },
    { id: 'sports', label: '体育', icon: '⚽', color: 'text-emerald-500' },
    { id: 'all', label: '全部', icon: '🎛️', color: 'text-gray-500' },
  ];

  // Exactly the 9 games from Figure 1
  const fig1Games: GameCard[] = [
    {
      id: 'g_zjh',
      name: '百人扎金花',
      icon: '⚔️',
      coverUrl: 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?auto=format&fit=crop&w=400&q=80',
      description: '拼胆略，比智慧，闷牌狂翻倍，单局赢百万！',
      minLimit: 10,
      onlineCount: 8430,
      category: 'hot'
    },
    {
      id: 'g_hb',
      name: '抢红包',
      icon: '🧧',
      coverUrl: 'https://images.unsplash.com/photo-1589758438368-0ad531db3366?auto=format&fit=crop&w=400&q=80',
      description: '秒速开抢，手速拼运气，爆率超高！',
      minLimit: 5,
      onlineCount: 15400,
      category: 'hot'
    },
    {
      id: 'g_pm',
      name: '街机跑马',
      icon: '🏇',
      coverUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=400&q=80',
      description: '经典马场复刻，独赢、连赢超刺激，暴赚翻倍！',
      minLimit: 10,
      onlineCount: 6240,
      category: 'hot'
    },
    {
      id: 'g_ddz',
      name: '斗地主',
      icon: '👑',
      coverUrl: 'https://images.unsplash.com/photo-1511193311914-0346f16efe90?auto=format&fit=crop&w=400&q=80',
      description: '极速匹配，牌局顺畅，农民超级加倍挑落地主。',
      minLimit: 5,
      onlineCount: 12500,
      category: 'hot'
    },
    {
      id: 'g_nn',
      name: '抢庄牛牛',
      icon: '🐂',
      coverUrl: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=400&q=80',
      description: '抢庄狂欢，五花牛、炸弹牛翻倍爽到爆！',
      minLimit: 10,
      onlineCount: 9340,
      category: 'hot'
    },
    {
      id: 'g_hh',
      name: '红黑大战',
      icon: '🔴',
      coverUrl: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=400&q=80',
      description: '红黑两方终极对决，幸运奖池额外派送。',
      minLimit: 20,
      onlineCount: 6240,
      category: 'hot'
    },
    {
      id: 'g_lh',
      name: '龙虎斗',
      icon: '🐯',
      coverUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=400&q=80',
      description: '两雄争霸，一决高下，赔率高，极速开奖！',
      minLimit: 20,
      onlineCount: 11020,
      category: 'hot'
    },
    {
      id: 'g_bjl',
      name: '视讯百家乐',
      icon: '📹',
      coverUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      description: '顶级高清真人，性感女优发牌陪聊。',
      minLimit: 50,
      onlineCount: 4501,
      category: 'hot'
    },
    {
      id: 'g_by',
      name: '捕鱼',
      icon: '🐠',
      coverUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=400&q=80',
      description: '万倍炮台，一炮暴富，捕获金龙赢取终极大奖。',
      minLimit: 10,
      onlineCount: 18450,
      category: 'hot'
    }
  ];

  // Handle wallet balance exchange
  const handleQuickTransferAll = () => {
    if (converting) return;
    setConverting(true);

    setTimeout(() => {
      if (wallet.mainBalance > 0) {
        const totalGame = wallet.gameBalance + wallet.mainBalance;
        onUpdateWallet({
          mainBalance: 0,
          gameBalance: totalGame
        });
        alert(`🔄 一键额度转换完成！已将主钱包 ￥${wallet.mainBalance.toFixed(2)} 全部转入副账户。`);
      } else if (wallet.gameBalance > 0) {
        const totalMain = wallet.mainBalance + wallet.gameBalance;
        onUpdateWallet({
          mainBalance: totalMain,
          gameBalance: 0
        });
        alert(`🔄 一键额度回收完成！已将副账户 ￥${wallet.gameBalance.toFixed(2)} 全部转回主账户。`);
      } else {
        alert('❌ 您的主账户余额不足！请先进行充值。');
        onOpenTopup('coin');
      }
      setConverting(false);
    }, 600);
  };

  // Scroll spy handler for Right Column
  const handleRightScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (isScrollingRef.current) return; // ignore scroll state changes during programmatic clicks

    const container = e.currentTarget;
    const sections = ['promo', 'hot', 'favorite', 'live', 'sports', 'all'];
    let currentActive = 'promo';
    let minDiff = Infinity;

    sections.forEach((secId) => {
      const el = document.getElementById(`chess-sec-${secId}`);
      if (el) {
        const rect = el.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        // Calculate vertical diff relative to container top
        const diff = Math.abs(rect.top - containerRect.top);
        if (diff < minDiff) {
          minDiff = diff;
          currentActive = secId;
        }
      }
    });

    if (activeCategory !== currentActive) {
      setActiveCategory(currentActive);
    }
  };

  // Sidebar tab click handler - scrolls cleanly to section
  const handleSidebarClick = (id: string) => {
    setActiveCategory(id);
    const container = rightContainerRef.current;
    const element = document.getElementById(`chess-sec-${id}`);
    if (container && element) {
      isScrollingRef.current = true;
      const targetScrollTop = element.offsetTop - container.offsetTop;
      container.scrollTo({ top: targetScrollTop, behavior: 'smooth' });
      
      // Release block after animation completes
      setTimeout(() => {
        isScrollingRef.current = false;
      }, 500);
    }
  };

  // Play Game simulator launcher
  const handleLaunchGame = (game: GameCard) => {
    if (wallet.gameBalance < game.minLimit) {
      alert(`⚠️ 副账户余额不足！\n\n进入【${game.name}】需要最低额度 ￥${game.minLimit}，您当前仅有 ￥${wallet.gameBalance.toFixed(2)}。请先充值或转换额度！`);
      onOpenTopup('transfer');
      return;
    }

    setActivePlayGame(game);
    setPlayStep('lobby');
    setPlayMessage('');
    setUserBet(game.minLimit);
  };

  const executePlaySim = () => {
    if (!activePlayGame) return;
    if (wallet.gameBalance < userBet) {
      alert('⚠️ 副账户余额不足，请减少投注金额或转换额度！');
      return;
    }

    setPlayStep('deal');
    // Deduct bet from game balance
    onUpdateWallet({ gameBalance: wallet.gameBalance - userBet });

    setTimeout(() => {
      const isWinner = Math.random() > 0.45; // 55% Win rate for fun
      const winMultiplier = isWinner ? (Math.random() > 0.8 ? 3 : 2) : 0;
      const wonAmt = userBet * winMultiplier;
      
      setPlayWin(isWinner);
      setPlayAmount(wonAmt);

      if (isWinner) {
        onUpdateWallet({ gameBalance: wallet.gameBalance - userBet + wonAmt });
        if (activePlayGame.id === 'g_hb') {
          setPlayMessage(`🧧 恭喜！您在【抢红包】中手速极快，抢到了超级大红包，翻倍赢得 ￥${wonAmt.toFixed(2)} 现金红利！`);
        } else {
          setPlayMessage(`🎉 恭喜老司机爆赢！\n\n您在【${activePlayGame.name}】中获得至尊牌型，狂揽 ￥${wonAmt.toFixed(2)} 游戏筹码！`);
        }
      } else {
        if (activePlayGame.id === 'g_hb') {
          setPlayMessage('😔 手慢了，红包已经被抢光啦，下局再接再厉！');
        } else {
          setPlayMessage(`⚔️ 遗憾，本局对方牌型略胜一筹。亏损 ￥${userBet.toFixed(2)} 筹码，老司机调整战术下局必赢！`);
        }
      }
      setPlayStep('result');
    }, 1500);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden text-black h-full bg-[#121212]">
      
      {/* 1. HEADER WITH GRADIENT (Matching Figure 1 exactly) */}
      <div className="p-4 pt-5 pb-3 bg-gradient-to-r from-[#9400d3] via-[#ff1493] to-[#1e90ff] text-white space-y-3.5 shrink-0 relative">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-1.5">
            <span className="text-3xl animate-bounce">🔥</span>
            <div>
              <h1 className="text-xl font-black text-yellow-300 tracking-tight flex items-center gap-1 font-sans">
                某某视频
              </h1>
              <p className="text-[9px] text-white/90 uppercase font-mono tracking-wider">Moumou Studio</p>
            </div>
          </div>

          {/* Customer Service capsule button */}
          <button 
            onClick={onOpenCustomerService}
            className="flex items-center gap-1.5 bg-white text-[#9400d3] font-bold text-xs px-3 py-1.5 rounded-full hover:bg-neutral-100 transition-all shadow-md active:scale-95"
          >
            <img 
              src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80" 
              alt="CS" 
              className="w-4 h-4 rounded-full object-cover"
              referrerPolicy="no-referrer"
            />
            <span>客服</span>
          </button>
        </div>

        {/* Announcement Banner row */}
        <div className="bg-purple-950/40 rounded-full px-3 py-1.5 flex items-center gap-2 overflow-hidden border border-white/10 text-white">
          <Volume2 className="w-3.5 h-3.5 text-yellow-300 shrink-0" />
          <div className="flex-1 overflow-hidden relative h-4">
            <div className="absolute whitespace-nowrap text-[10px] text-yellow-200 font-medium animate-[marquee_20s_linear_infinite] will-change-transform">
              🔥 捷报：用户 护19********98 在《斗地主》中狂揽 ￥8,589 筹码！ 用户 16********53 正在《龙虎斗》大杀四方！ 老司机 狼友*** 在《视讯百家乐》狂赚 ￥12,800！ 
            </div>
          </div>
        </div>

        {/* Balance row and Action button strip */}
        <div className="flex items-center justify-between gap-4 pt-1">
          {/* Left: Login Status / Balance */}
          <div className="flex items-center gap-2">
            <div className="p-2 bg-yellow-400 rounded-full text-black flex items-center justify-center shadow-lg">
              <Coins className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <p className="text-[9px] text-white/85">金币余额</p>
              {profile.isLoggedIn ? (
                <p className="text-sm font-black text-yellow-300">
                  ￥{wallet.gameBalance.toFixed(2)}
                </p>
              ) : (
                <p className="text-xs font-black text-yellow-300 animate-pulse">请登录</p>
              )}
            </div>
          </div>

          {/* Right: Action capsule round buttons */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => onOpenTopup('coin')}
              className="flex flex-col items-center justify-center bg-yellow-400 hover:brightness-110 text-black px-3.5 py-1 rounded-xl transition-all shadow-md active:scale-95"
            >
              <CreditCard className="w-3.5 h-3.5 text-yellow-950" />
              <span className="text-[9px] font-black mt-0.5">充值</span>
            </button>
            <button 
              onClick={() => onOpenTopup('redeem')}
              className="flex flex-col items-center justify-center bg-emerald-400 hover:brightness-110 text-black px-3.5 py-1 rounded-xl transition-all shadow-md active:scale-95"
            >
              <Coins className="w-3.5 h-3.5 text-emerald-950" />
              <span className="text-[9px] font-black mt-0.5">提现</span>
            </button>
            <button 
              onClick={handleQuickTransferAll}
              disabled={converting}
              className="flex flex-col items-center justify-center bg-blue-400 hover:brightness-110 text-black px-3.5 py-1 rounded-xl transition-all shadow-md disabled:opacity-50 active:scale-95"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-blue-950 ${converting ? 'animate-spin' : ''}`} />
              <span className="text-[9px] font-black mt-0.5">{converting ? '回收' : '转换'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. BODY CONTAINER (Light grey background, containing Left Sidebar and Right White Card Panel) */}
      <div className="flex-1 flex overflow-hidden bg-[#e9ebee]">
        
        {/* Left Column: Curved sidebar with tabs */}
        <div className="w-20 bg-neutral-100 flex flex-col pt-3 pb-24 overflow-y-auto no-scrollbar rounded-tr-3xl">
          {sidebarList.map((tab) => {
            const isActive = activeCategory === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleSidebarClick(tab.id)}
                className={`py-4 flex flex-col items-center justify-center transition-all relative ${
                  isActive 
                    ? 'bg-white text-blue-600 font-extrabold shadow-[2px_2px_10px_rgba(0,0,0,0.04)] rounded-l-2xl' 
                    : 'text-gray-500 hover:text-black hover:bg-white/40'
                }`}
              >
                {/* Visual line indicator */}
                {isActive && (
                  <span className="absolute left-1.5 top-1/4 bottom-1/4 w-1 bg-blue-600 rounded-full" />
                )}
                
                {/* Icon wrapper */}
                <span className={`text-xl mb-1 filter drop-shadow-sm transition-transform ${isActive ? 'scale-115' : ''}`}>
                  {tab.icon}
                </span>
                
                <span className={`text-[10px] tracking-wide ${isActive ? 'text-blue-600' : 'text-gray-600'}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Column: Dynamic Scrollable feed containing all categories inside a white panel */}
        <div 
          ref={rightContainerRef}
          onScroll={handleRightScroll}
          id="chess-right-pane"
          className="flex-1 bg-white p-4 overflow-y-auto no-scrollbar space-y-7 rounded-tl-3xl shadow-[inset_1px_4px_12px_rgba(0,0,0,0.06)] pb-28"
        >
          {/* SEC 1: 活动 (Promo) */}
          <div id="chess-sec-promo" className="space-y-3 pt-1 scroll-mt-2">
            <div className="flex items-center gap-1.5 text-xs text-gray-800 font-black">
              <span className="w-1.5 h-3.5 bg-blue-600 rounded-full"></span>
              <span className="text-xs uppercase tracking-wider">专享特惠活动</span>
            </div>
            
            <div className="space-y-3">
              {[
                { title: '🎁 绑定推广码 BANANA66 赠￥88', subtitle: '新老会员在充值界面输入专属推广码，立得88金币特权，赠送长视频无限看！', bg: 'from-pink-50 to-red-50 border-pink-100', text: 'text-red-700' },
                { title: '🛡️ 每日包赔特权：亏损返还 15%', subtitle: '凡在游戏电玩馆每日累计损耗达到 ￥100 即可自动返点，次日一键提款。', bg: 'from-amber-50 to-orange-50 border-amber-100', text: 'text-amber-800' },
              ].map((promo, idx) => (
                <div 
                  key={idx}
                  onClick={() => alert(`🎉 活动报名成功！【${promo.title.slice(2)}】已自动激活，奖励已发放。`)}
                  className={`p-3 bg-gradient-to-r ${promo.bg} border rounded-xl shadow-sm cursor-pointer hover:brightness-95 transition-all space-y-1`}
                >
                  <h4 className={`text-[11px] font-black ${promo.text}`}>{promo.title}</h4>
                  <p className="text-[9px] text-gray-500 leading-relaxed">{promo.subtitle}</p>
                </div>
              ))}
            </div>
          </div>

          {/* SEC 2: 热门 (Hot - Render exactly the 9 games from Image 1) */}
          <div id="chess-sec-hot" className="space-y-3 scroll-mt-2">
            <div className="flex items-center gap-1.5 text-xs text-gray-800 font-black">
              <span className="w-1.5 h-3.5 bg-blue-600 rounded-full"></span>
              <span>热门推荐</span>
            </div>

            {/* Grid of the 9 games */}
            <div className="grid grid-cols-2 gap-x-3.5 gap-y-4">
              {fig1Games.map((game) => (
                <div 
                  key={game.id}
                  onClick={() => handleLaunchGame(game)}
                  className="cursor-pointer group flex flex-col"
                >
                  {/* Aspect-ratio cover image with clean borders */}
                  <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden shadow-sm border border-neutral-200/80 group-hover:scale-[1.02] transition-transform">
                    <img 
                      src={game.coverUrl} 
                      alt={game.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />
                    
                    {/* Floating mini badge on top left */}
                    <div className="absolute top-1 left-1 bg-black/60 backdrop-blur-sm text-[8px] text-white px-1.5 py-0.5 rounded-md font-bold scale-90 origin-top-left flex items-center gap-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>{game.onlineCount}+ 玩</span>
                    </div>

                    {/* Left overlay tag for branding */}
                    <div className="absolute bottom-1 left-1 bg-blue-600/90 text-[7px] text-white px-1 py-0.2 rounded-sm scale-90 font-black tracking-wide">
                      WL
                    </div>
                  </div>

                  {/* Title underneath the card matching image style */}
                  <h4 className="text-[11px] text-gray-800 font-black text-center mt-1.5 group-hover:text-blue-600 transition-colors">
                    {game.name}
                  </h4>
                </div>
              ))}
            </div>
          </div>

          {/* SEC 3: 常玩 (Favorite) */}
          <div id="chess-sec-favorite" className="space-y-3 scroll-mt-2">
            <div className="flex items-center gap-1.5 text-xs text-gray-800 font-black">
              <span className="w-1.5 h-3.5 bg-blue-600 rounded-full"></span>
              <span>常玩游戏</span>
            </div>

            <div className="grid grid-cols-2 gap-x-3.5 gap-y-4">
              {fig1Games.slice(2, 4).map((game) => (
                <div 
                  key={`fav-${game.id}`}
                  onClick={() => handleLaunchGame(game)}
                  className="cursor-pointer group flex flex-col"
                >
                  <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden shadow-sm border border-neutral-200/80 group-hover:scale-[1.02] transition-transform">
                    <img 
                      src={game.coverUrl} 
                      alt={game.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />
                    <div className="absolute top-1 left-1 bg-blue-600 text-[8px] text-white px-1.5 py-0.5 rounded-md font-bold scale-95">
                      ⭐ 经常玩
                    </div>
                  </div>
                  <h4 className="text-[11px] text-gray-800 font-black text-center mt-1.5">
                    {game.name}
                  </h4>
                </div>
              ))}
            </div>
          </div>

          {/* SEC 4: 视讯 (Live) */}
          <div id="chess-sec-live" className="space-y-3 scroll-mt-2">
            <div className="flex items-center gap-1.5 text-xs text-gray-800 font-black">
              <span className="w-1.5 h-3.5 bg-blue-600 rounded-full"></span>
              <span>视讯直播</span>
            </div>

            <div className="grid grid-cols-2 gap-x-3.5 gap-y-4">
              {fig1Games.slice(6, 8).map((game) => (
                <div 
                  key={`live-${game.id}`}
                  onClick={() => handleLaunchGame(game)}
                  className="cursor-pointer group flex flex-col"
                >
                  <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden shadow-sm border border-neutral-200/80 group-hover:scale-[1.02] transition-transform">
                    <img 
                      src={game.coverUrl} 
                      alt={game.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />
                    <div className="absolute top-1 right-1 bg-rose-600 text-[8px] text-white px-1.5 py-0.5 rounded-md font-bold scale-90 animate-pulse">
                      🎥 LIVE
                    </div>
                  </div>
                  <h4 className="text-[11px] text-gray-800 font-black text-center mt-1.5">
                    {game.name}
                  </h4>
                </div>
              ))}
            </div>
          </div>

          {/* SEC 5: 体育 (Sports) */}
          <div id="chess-sec-sports" className="space-y-3 scroll-mt-2">
            <div className="flex items-center gap-1.5 text-xs text-gray-800 font-black">
              <span className="w-1.5 h-3.5 bg-blue-600 rounded-full"></span>
              <span>体育大厅</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { name: '皇冠体育', coverUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=400&q=80', badge: '五大联赛' },
                { name: '沙巴体育', coverUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=400&q=80', badge: 'NBA滚球' }
              ].map((sp, idx) => (
                <div 
                  key={idx}
                  onClick={() => alert(`⚽ 已为您开启【${sp.name}】专属高速专线，开始滚球竞猜！`)}
                  className="cursor-pointer group flex flex-col"
                >
                  <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden shadow-sm border border-neutral-200 group-hover:scale-[1.02] transition-transform">
                    <img 
                      src={sp.coverUrl} 
                      alt={sp.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />
                    <div className="absolute bottom-1 right-1 bg-black/60 text-[8px] text-white px-1.5 py-0.5 rounded font-black">
                      {sp.badge}
                    </div>
                  </div>
                  <h4 className="text-[11px] text-gray-800 font-black text-center mt-1.5">
                    {sp.name}
                  </h4>
                </div>
              ))}
            </div>
          </div>

          {/* SEC 6: 全部 (All) */}
          <div id="chess-sec-all" className="space-y-3 scroll-mt-2">
            <div className="flex items-center gap-1.5 text-xs text-gray-800 font-black">
              <span className="w-1.5 h-3.5 bg-blue-600 rounded-full"></span>
              <span>全部推荐</span>
            </div>

            <div className="space-y-2.5">
              {fig1Games.map((game) => (
                <div 
                  key={`all-row-${game.id}`}
                  onClick={() => handleLaunchGame(game)}
                  className="p-3 bg-neutral-50 hover:bg-neutral-100 rounded-xl border border-neutral-200/60 transition-all flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl p-1.5 bg-neutral-100 rounded-lg">{game.icon}</span>
                    <div>
                      <h4 className="text-[11px] font-black text-gray-800">{game.name}</h4>
                      <p className="text-[9px] text-gray-500 leading-tight mt-0.5">{game.description}</p>
                    </div>
                  </div>
                  <button className="px-2.5 py-1 rounded bg-blue-600 text-white font-black text-[9px] hover:bg-blue-700">
                    秒配上桌
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* 3. INTERACTIVE SIMULATOR DIALOG OVERLAY */}
      <AnimatePresence>
        {activePlayGame && (
          <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm text-white">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-sm rounded-2xl bg-[#151515] border border-neutral-800 p-5 space-y-4 shadow-2xl relative"
            >
              <button 
                onClick={() => setActivePlayGame(null)}
                className="absolute top-4 right-4 p-1.5 text-gray-500 hover:text-white rounded-full bg-neutral-900 border border-neutral-800"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="text-center space-y-1">
                <span className="text-4xl inline-block p-2 bg-neutral-900 border border-neutral-800 rounded-xl mb-1">{activePlayGame.icon}</span>
                <h3 className="text-base font-black text-yellow-300">{activePlayGame.name}</h3>
                <p className="text-[10px] text-gray-400">至尊云端真人桌台 · SSL安全隧道加密</p>
              </div>

              {playStep === 'lobby' && (
                <div className="space-y-4">
                  <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-400">最低准入：</span>
                      <span className="font-bold text-yellow-300">￥{activePlayGame.minLimit}.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">我的余额：</span>
                      <span className="font-bold text-emerald-400">￥{wallet.gameBalance.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-gray-400 font-bold block">投注选择 (RMB)</label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[10, 20, 50, 100].map((bet) => (
                        <button
                          key={bet}
                          disabled={bet < activePlayGame.minLimit}
                          onClick={() => setUserBet(bet)}
                          className={`py-1.5 rounded-lg font-black text-[10px] transition-all border ${
                            userBet === bet 
                              ? 'bg-yellow-400 border-yellow-300 text-black' 
                              : 'bg-neutral-900 border-neutral-800 text-gray-400 hover:text-white disabled:opacity-30'
                          }`}
                        >
                          ￥{bet}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={executePlaySim}
                    className="w-full py-3 rounded-xl font-black bg-yellow-400 hover:brightness-110 text-black text-xs transition-all shadow-md shadow-yellow-400/10 flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>立即配对并开局</span>
                  </button>
                </div>
              )}

              {playStep === 'deal' && (
                <div className="py-6 text-center space-y-4">
                  <div className="relative w-12 h-12 mx-auto">
                    <div className="absolute inset-0 rounded-full border-4 border-yellow-400/20 border-t-yellow-400 animate-spin" />
                    <Gamepad2 className="w-5 h-5 text-yellow-300 absolute inset-0 m-auto animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-white">正在配对玩家并进行荷官发牌...</p>
                    <p className="text-[9px] text-gray-500 font-mono">投注金额：￥{userBet.toFixed(2)} · 防作弊引擎监测中</p>
                  </div>
                </div>
              )}

              {playStep === 'result' && (
                <div className="space-y-4 text-center">
                  <div className={`p-4 rounded-xl border ${playWin ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-red-950/20 border-red-500/30'} space-y-2`}>
                    <span className="text-3xl block">{playWin ? '🎉' : '⚔️'}</span>
                    <h4 className={`text-sm font-black ${playWin ? 'text-emerald-400' : 'text-red-400'}`}>
                      {playWin ? `本局爆赢！+￥${playAmount.toFixed(2)}` : '本局抱憾！'}
                    </h4>
                    <p className="text-[10px] text-gray-300 leading-relaxed whitespace-pre-line">{playMessage}</p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setPlayStep('lobby')}
                      className="flex-1 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-800 text-[10px] font-black transition-all"
                    >
                      重新投注
                    </button>
                    <button
                      onClick={executePlaySim}
                      className="flex-1 py-2.5 rounded-xl bg-yellow-400 hover:brightness-110 text-black text-[10px] font-black transition-all"
                    >
                      再来一局
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
