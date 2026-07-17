import React, { useState } from 'react';
import { UserProfile, UserWallet } from '../types';
import { 
  User, Award, Ticket, Star, Coins, Gift, Compass, 
  MessageSquare, History, ShoppingBag, CheckSquare, 
  Settings, HelpCircle, LogOut, ChevronRight, Sparkles 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ProfileTabProps {
  profile: UserProfile;
  wallet: UserWallet;
  onUpdateWallet: (wallet: Partial<UserWallet>) => void;
  onUpdateProfile: (profile: Partial<UserProfile>) => void;
  onOpenTopup: (type: 'vip' | 'coin' | 'redeem') => void;
  onOpenAiScanner: () => void;
  onOpenCustomerService: () => void;
}

export default function ProfileTab({
  profile,
  wallet,
  onUpdateWallet,
  onUpdateProfile,
  onOpenTopup,
  onOpenAiScanner,
  onOpenCustomerService
}: ProfileTabProps) {
  const [usernameInput, setUsernameInput] = useState<string>('');
  const [showLoginPanel, setShowLoginPanel] = useState<boolean>(false);
  const [hasCheckedIn, setHasCheckedIn] = useState<boolean>(false);
  const [activeProfileModal, setActiveProfileModal] = useState<'history' | 'favorites' | 'purchases' | 'tasks' | 'settings' | 'recommendations' | 'rewards' | null>(null);
  const [showDatingMatches, setShowDatingMatches] = useState<boolean>(false);
  const [activeChattingGirl, setActiveChattingGirl] = useState<any | null>(null);
  const [chatMessages, setChatMessages] = useState<string[]>([]);
  const [userInputMessage, setUserInputMessage] = useState<string>('');

  // Authentication Flow
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = usernameInput.trim() || '香蕉老司机_888';
    onUpdateProfile({
      isLoggedIn: true,
      username: name,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      vipDaysLeft: 3,
      vipExpiry: '2026-07-19',
      longVideoTickets: 8,
      shortVideoTickets: 15
    });
    setShowLoginPanel(false);
  };

  const handleLogout = () => {
    if (confirm('🚪 确定要退出当前账号吗？')) {
      onUpdateProfile({
        isLoggedIn: false,
        username: '未登录',
        avatar: '',
        vipExpiry: '未开通',
        vipDaysLeft: 0,
        longVideoTickets: 0,
        shortVideoTickets: 0
      });
      onUpdateWallet({
        mainBalance: 0,
        gameBalance: 0,
        goldCoins: 0,
        goldBeans: 0
      });
      alert('已成功登出。资产及观影数已自动重置。');
    }
  };

  // Daily Checkin Interaction
  const handleDailyCheckIn = () => {
    if (hasCheckedIn) {
      alert('📆 您今天已经签到过了，明天再来哦！');
      return;
    }
    setHasCheckedIn(true);
    onUpdateProfile({
      longVideoTickets: profile.longVideoTickets + 5,
      shortVideoTickets: profile.shortVideoTickets + 15
    });
    onUpdateWallet({
      goldCoins: wallet.goldCoins + 10
    });
    alert('🎉 每日签到成功！已向您的钱包赠送：\n\n+5张 长视频电影券\n+15张 短视频观影券\n+10枚 游戏金币！');
  };

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar pb-28 text-white relative">
      
      {/* Dynamic Login Panel Overlay inside widget */}
      {showLoginPanel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-brand-bg border border-brand-purple/30 p-6 text-white space-y-4">
            <div className="text-center">
              <span className="text-3xl">🍌</span>
              <h3 className="text-base font-bold text-brand-gold mt-2">香蕉社区极速注册/登录</h3>
              <p className="text-[10px] text-gray-400 mt-0.5">免验证码，1秒完成创建，畅游成人 world</p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-3 pt-2">
              <div className="space-y-1">
                <label className="text-xs text-gray-400">自定个性昵称</label>
                <input 
                  type="text" 
                  placeholder="请输入昵称" 
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-brand-card border border-neutral-800 focus:border-brand-purple focus:outline-none text-sm text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-400">邀请码 (可选)</label>
                <input 
                  type="text" 
                  placeholder="填写INVITE666可领福利" 
                  className="w-full px-4 py-2.5 rounded-xl bg-brand-card border border-neutral-800 text-sm text-white focus:outline-none"
                />
              </div>

              <button 
                type="submit"
                className="w-full py-3 rounded-xl font-bold bg-brand-gradient text-white hover:opacity-90 transition-all text-xs"
              >
                立即注册并登录
              </button>
            </form>
            
            <button 
              onClick={() => setShowLoginPanel(false)}
              className="w-full text-center text-xs text-gray-400 hover:text-white underline mt-1"
            >
              取消
            </button>
          </div>
        </div>
      )}

      {/* USER DETAIL HEADER */}
      <div className="p-5 bg-brand-card border-b border-neutral-800 space-y-5">
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* User Avatar */}
            <div className="w-14 h-14 rounded-full border-2 border-brand-gold/50 p-0.5 overflow-hidden bg-black flex items-center justify-center shrink-0">
              {profile.isLoggedIn ? (
                <img src={profile.avatar} alt={profile.username} className="w-full h-full object-cover rounded-full" referrerPolicy="no-referrer" />
              ) : (
                <User className="w-8 h-8 text-gray-500" />
              )}
            </div>

            {/* Profile detail */}
            <div className="space-y-1">
              {profile.isLoggedIn ? (
                <>
                  <h3 className="font-bold text-sm text-gray-100 flex items-center gap-1.5">
                    {profile.username}
                    <span className="px-1.5 py-0.5 rounded text-[8px] font-black bg-brand-gold text-black shadow">
                      VIP.{profile.vipDaysLeft > 0 ? 'ACTIVE' : 'EXP'}
                    </span>
                  </h3>
                  <p className="text-[10px] text-gray-400">
                    邀请码：<span className="text-brand-purple font-bold">{profile.inviteCode}</span>
                  </p>
                </>
              ) : (
                <>
                  <h3 className="font-bold text-sm text-gray-400">未登录账号</h3>
                  <button 
                    onClick={() => setShowLoginPanel(true)}
                    className="text-xs text-brand-gold font-extrabold hover:underline"
                  >
                    点击 1秒注册/登录
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Settings / Logout action */}
          {profile.isLoggedIn && (
            <button 
              onClick={handleLogout}
              className="p-2 rounded-full bg-white/5 text-gray-400 hover:text-red-400 transition-colors"
              title="登出"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </div>

        {/*观影权益卡片 (VIP Progress Panel - 引导充值) */}
        <div className="p-4 rounded-2xl bg-brand-bg border border-brand-gold/20 space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-brand-gold" />
              <div>
                <h4 className="text-xs font-black text-brand-gold">香蕉观影尊享俱乐部</h4>
                <p className="text-[9px] text-gray-400">
                  会员到期：<span className="text-brand-gold font-bold">{profile.vipExpiry}</span>
                  {` (剩余 ${profile.isLoggedIn ? profile.vipDaysLeft : 0} 天)`}
                </p>
              </div>
            </div>
            
            {profile.vipDaysLeft <= 0 ? (
              <button 
                onClick={() => onOpenTopup('vip')}
                className="px-3 py-1.5 rounded-lg bg-brand-gold text-black text-[10px] font-black shadow-md shadow-brand-gold/20 hover:brightness-110 transition-all"
              >
                解锁无限特权
              </button>
            ) : (
              <span className="px-2.5 py-1 rounded text-[9px] bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                尊贵特权生效中
              </span>
            )}
          </div>

          {/* Ticket metrics details */}
          <div className="grid grid-cols-2 gap-3.5 border-t border-white/5 pt-3">
            <div className="space-y-1">
              <p className="text-[10px] text-gray-400 flex items-center gap-1">
                <Ticket className="w-3 h-3 text-brand-purple" /> 长视频剩余观影
              </p>
              <p className="text-sm font-black">
                {profile.vipDaysLeft > 0 ? '无限次' : `${profile.longVideoTickets} 次`}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] text-gray-400 flex items-center gap-1">
                <Ticket className="w-3 h-3 text-brand-purple" /> 短视频剩余观影
              </p>
              <p className="text-sm font-black">
                {profile.vipDaysLeft > 0 ? '无限次' : `${profile.shortVideoTickets} 次`}
              </p>
            </div>
          </div>
        </div>

        {/* ASSET WALLET METERS */}
        <div className="p-4 rounded-2xl bg-brand-bg border border-neutral-800 space-y-3.5">
          <div className="flex items-center justify-between text-[11px] text-gray-400">
            <span>👛 我的个人资产钱包</span>
            <span className="text-brand-purple">资金受金融密码保护</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="p-2 rounded-xl bg-white/5 text-center">
              <p className="text-[9px] text-gray-400">主钱包余额</p>
              <p className="text-xs font-black text-emerald-400 mt-1">￥{wallet.mainBalance.toFixed(1)}</p>
            </div>

            <div className="p-2 rounded-xl bg-white/5 text-center">
              <p className="text-[9px] text-gray-400">账户金币</p>
              <p className="text-xs font-black text-brand-gold mt-1">🪙 {wallet.goldCoins}</p>
            </div>

            <div className="p-2 rounded-xl bg-white/5 text-center">
              <p className="text-[9px] text-gray-400">账户金豆</p>
              <p className="text-xs font-black text-pink-400 mt-1">🍬 {wallet.goldBeans}</p>
            </div>
          </div>
        </div>

      </div>

      {/* CORE FINANCE BUTTONS */}
      <div className="grid grid-cols-3 gap-3 px-5 mt-4">
        <button 
          onClick={() => onOpenTopup('vip')}
          className="py-3 px-2 rounded-xl border border-brand-purple/40 bg-brand-purple/10 hover:bg-brand-purple/20 text-center transition-all cursor-pointer group"
        >
          <Award className="w-5 h-5 text-brand-purple mx-auto group-hover:scale-105 transition-transform" />
          <span className="block text-[11px] font-bold text-gray-200 mt-1">会员充值</span>
        </button>

        <button 
          onClick={() => onOpenTopup('coin')}
          className="py-3 px-2 rounded-xl border border-brand-gold/40 bg-brand-gold/10 hover:bg-brand-gold/20 text-center transition-all cursor-pointer group"
        >
          <Coins className="w-5 h-5 text-brand-gold mx-auto group-hover:scale-105 transition-transform" />
          <span className="block text-[11px] font-bold text-gray-200 mt-1">金币充值</span>
        </button>

        <button 
          onClick={() => onOpenTopup('redeem')}
          className="py-3 px-2 rounded-xl border border-brand-purple/40 bg-brand-purple/10 hover:bg-brand-purple/20 text-center transition-all cursor-pointer group"
        >
          <Gift className="w-5 h-5 text-brand-purple mx-auto group-hover:scale-105 transition-transform" />
          <span className="block text-[11px] font-bold text-gray-200 mt-1">兑换会员</span>
        </button>
      </div>

      {/* DATING AD PROMO BANNER */}
      <div 
        onClick={() => setShowDatingMatches(true)}
        className="mx-5 mt-4 p-3.5 rounded-xl bg-brand-card border border-brand-purple/30 flex items-center justify-between cursor-pointer hover:border-brand-purple/60 transition-all"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-2xl animate-bounce">💖</span>
          <div>
            <h4 className="text-xs font-black text-brand-purple">同城寻欢 · 附近交友</h4>
            <p className="text-[10px] text-gray-400 mt-1">
              真人空降直接约会，寂寞深夜不再一人
            </p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-400" />
      </div>

      {/* 4-COLUMN SERVICE MATRIX GRID */}
      <div className="px-5 mt-6 space-y-3">
        <h4 className="text-xs font-black text-gray-400 tracking-wider uppercase">服务工具</h4>
        
        <div className="grid grid-cols-4 gap-2 bg-brand-card p-3 rounded-2xl border border-neutral-800">
          {[
            { label: '联系客服', icon: <MessageSquare className="w-5 h-5 text-emerald-400" />, action: onOpenCustomerService },
            { label: '浏览足迹', icon: <History className="w-5 h-5 text-blue-400" />, action: () => setActiveProfileModal('history') },
            { label: '我的收藏', icon: <Star className="w-5 h-5 text-yellow-500" />, action: () => setActiveProfileModal('favorites') },
            { label: '我的购买', icon: <ShoppingBag className="w-5 h-5 text-pink-500" />, action: () => setActiveProfileModal('purchases') },
            { label: '任务中心', icon: <Compass className="w-5 h-5 text-teal-400" />, action: () => setActiveProfileModal('tasks') },
            { label: '精彩推荐', icon: <Sparkles className="w-5 h-5 text-purple-400" />, action: () => setActiveProfileModal('recommendations') },
            { label: '意见反馈', icon: <HelpCircle className="w-5 h-5 text-sky-400" />, action: () => {
              const q = prompt('✍️ 请写下您对香蕉社区的宝贵意见或遇到的Bug（我们会第一时间在后台收集并派送代金券）：');
              if (q) alert('🎉 感谢您的意见！客服团队正在核对，已自动向您账户派送5元体验金。');
            }},
            { label: '奖励记录', icon: <Gift className="w-5 h-5 text-amber-500" />, action: () => setActiveProfileModal('rewards') }
          ].map((srv, idx) => (
            <button
              key={idx}
              onClick={srv.action}
              className="py-2.5 flex flex-col items-center justify-center gap-1 rounded-lg hover:bg-white/5 transition-all cursor-pointer"
            >
              {srv.icon}
              <span className="text-[9px] text-gray-300 font-medium whitespace-nowrap">{srv.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* CORE INTERACTIVE SERVICE DETAIL MODALS */}
      <AnimatePresence>
        {activeProfileModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 p-4"
          >
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="w-full max-w-md bg-brand-card border-t border-neutral-800 rounded-t-3xl p-5 text-white flex flex-col max-h-[70vh] overflow-y-auto no-scrollbar space-y-4"
            >
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <h3 className="font-extrabold text-xs text-brand-gold">
                  {activeProfileModal === 'history' && '👣 我的浏览足迹'}
                  {activeProfileModal === 'favorites' && '⭐ 我的收藏夹'}
                  {activeProfileModal === 'purchases' && '🛍️ 我的购买记录'}
                  {activeProfileModal === 'tasks' && '🎯 任务中心'}
                  {activeProfileModal === 'settings' && '⚙️ 系统设置'}
                  {activeProfileModal === 'recommendations' && '✨ 精彩视频推荐'}
                  {activeProfileModal === 'rewards' && '🎁 我的奖励记录'}
                </h3>
                <button 
                  onClick={() => setActiveProfileModal(null)}
                  className="text-xs bg-white/5 hover:bg-white/10 px-3 py-1 rounded-full text-gray-400 hover:text-white"
                >
                  关闭
                </button>
              </div>

              {/* A. BROWSE HISTORY (足迹) */}
              {activeProfileModal === 'history' && (
                <div className="space-y-3.5">
                  {(() => {
                    try {
                      const hist = localStorage.getItem('banana_history');
                      const items = hist ? JSON.parse(hist) : [
                        { id: 'h1', title: '【香蕉头条】全网最新制服诱惑狂欢特辑', tag: '最新', type: '长视频' },
                        { id: 'h2', title: '清纯少女白领诱惑：丝袜高跟初体验', tag: '热门', type: '长视频' }
                      ];
                      return (
                        <div className="grid grid-cols-1 gap-2.5">
                          {items.map((item: any, idx: number) => (
                            <div 
                              key={idx} 
                              onClick={() => alert(`🍿 正在为您重播：《${item.title}》`)}
                              className="p-3 bg-brand-bg rounded-xl border border-neutral-800 hover:border-brand-purple/40 cursor-pointer flex items-center justify-between"
                            >
                              <div className="min-w-0 flex-1">
                                <span className="text-[8px] bg-brand-purple/20 text-brand-purple border border-brand-purple/30 px-1.5 py-0.2 rounded mr-1.5 font-bold">
                                  {item.type || '短视频'}
                                </span>
                                <h4 className="text-[10px] font-bold text-gray-200 truncate inline-block w-4/5 align-middle">{item.title}</h4>
                                <p className="text-[8px] text-gray-500 mt-1">观影足迹记录时间：刚刚</p>
                              </div>
                              <ChevronRight className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                            </div>
                          ))}
                        </div>
                      );
                    } catch(e) {
                      return <p className="text-xs text-gray-500 text-center py-6">暂无足迹</p>;
                    }
                  })()}
                </div>
              )}

              {/* B. MY FAVORITES (我的收藏) */}
              {activeProfileModal === 'favorites' && (
                <div className="space-y-3.5">
                  {(() => {
                    try {
                      const favLong = localStorage.getItem('banana_favorites_long');
                      const items = favLong ? JSON.parse(favLong) : [
                        { id: 'f1', title: '精品制服诱惑：黑丝美腿OL诱惑极品', type: '长视频' }
                      ];
                      return (
                        <div className="grid grid-cols-1 gap-2.5">
                          {items.map((item: any, idx: number) => (
                            <div 
                              key={idx} 
                              onClick={() => alert(`⭐ 正在加载收藏夹内容：《${item.title}》`)}
                              className="p-3 bg-brand-bg rounded-xl border border-neutral-800 hover:border-brand-purple/40 cursor-pointer flex items-center justify-between"
                            >
                              <div className="min-w-0 flex-1">
                                <span className="text-[8px] bg-brand-gold/10 text-brand-gold border border-brand-gold/20 px-1.5 py-0.2 rounded mr-1.5 font-bold">
                                  {item.type || '长视频'}
                                </span>
                                <h4 className="text-[10px] font-bold text-gray-200 truncate inline-block w-4/5 align-middle">{item.title}</h4>
                              </div>
                              <ChevronRight className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                            </div>
                          ))}
                        </div>
                      );
                    } catch(e) {
                      return <p className="text-xs text-gray-500 text-center py-6">收藏夹为空</p>;
                    }
                  })()}
                </div>
              )}

              {/* C. MY PURCHASES (我的购买) */}
              {activeProfileModal === 'purchases' && (
                <div className="space-y-3">
                  {[
                    { name: '至尊黑卡 VIP - 30天卡', cost: '￥58.00', date: '2026-07-16', status: '已生效' },
                    { name: '1000 游戏大金币充值包', cost: '￥100.00', date: '2026-07-16', status: '已到账' },
                    { name: '电影免广告永久特权', cost: '￥18.00', date: '2026-07-16', status: '永久激活' }
                  ].map((p, idx) => (
                    <div key={idx} className="p-3 bg-brand-bg rounded-xl border border-neutral-800 flex justify-between items-center text-xs">
                      <div>
                        <h4 className="font-bold text-[11px] text-gray-100">{p.name}</h4>
                        <p className="text-[8px] text-gray-500 mt-0.5">订单日期：{p.date}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-brand-gold block">{p.cost}</span>
                        <span className="text-[8px] bg-emerald-500/15 text-emerald-400 px-1 py-0.2 rounded font-bold border border-emerald-500/10">
                          {p.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* D. TASK CENTER (任务中心) */}
              {activeProfileModal === 'tasks' && (
                <div className="space-y-3">
                  {[
                    { desc: '📆 每日签到领金币及电影券', bonus: '+10金币 / +5电影券', status: hasCheckedIn ? '已领' : '去签到', action: handleDailyCheckIn },
                    { desc: '💳 首次主钱包额度转换任意金额', bonus: '+50金币', status: wallet.gameBalance > 0 ? '领奖励' : '去转换', action: () => {
                      if (wallet.gameBalance > 0) {
                        onUpdateWallet({ goldCoins: wallet.goldCoins + 50 });
                        alert('🎉 奖励领取成功！+50 游戏金币已送达您的资产钱包中。');
                      } else {
                        alert('⚠️ 尚未检测到您在棋牌馆完成额度转换，请先完成一次转换！');
                      }
                    }},
                    { desc: '✈️ 同城寻欢匹配分享', bonus: '+500 模拟金币', status: '去匹配', action: () => {
                      navigator.clipboard.writeText(`香蕉社区同城寻欢定位已开启！我的邀请码为：${profile.inviteCode}`);
                      onUpdateWallet({ gameBalance: wallet.gameBalance + 500 });
                      alert('🔗 分享文案已成功复制！额外赠送您 ￥500.00 棋牌模拟备用金！');
                    }}
                  ].map((t, idx) => (
                    <div key={idx} className="p-3 bg-brand-bg rounded-xl border border-neutral-800 flex justify-between items-center text-xs">
                      <div>
                        <h4 className="font-bold text-[10px] text-gray-100">{t.desc}</h4>
                        <p className="text-[9px] text-brand-purple mt-0.5">{t.bonus}</p>
                      </div>
                      <button 
                        onClick={t.action}
                        disabled={t.status === '已领'}
                        className={`px-3 py-1 rounded text-[10px] font-black shadow ${
                          t.status === '已领' 
                            ? 'bg-neutral-800 text-gray-500' 
                            : 'bg-brand-gold text-black hover:brightness-110'
                        }`}
                      >
                        {t.status}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* E. SYSTEM SETTINGS (系统设置) */}
              {activeProfileModal === 'settings' && (
                <div className="space-y-3 text-xs text-gray-300">
                  <div className="p-3 bg-brand-bg rounded-xl border border-neutral-800 space-y-3">
                    <div className="flex justify-between items-center">
                      <span>播放线路选择</span>
                      <select className="bg-brand-card border border-neutral-800 text-[10px] rounded p-1 text-brand-gold focus:outline-none">
                        <option>香蕉CDN专线 1 (极速)</option>
                        <option>香蕉CDN专线 2 (超清)</option>
                        <option>海外中转专线 3 (抗封锁)</option>
                      </select>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-neutral-900">
                      <span>夜间护眼模式</span>
                      <input type="checkbox" defaultChecked className="accent-brand-purple" />
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-neutral-900">
                      <span>安全隐身观影</span>
                      <input type="checkbox" defaultChecked className="accent-brand-purple" />
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      alert('🧹 缓存清理成功！已为您清除 142.8MB 冗余音视频片段。APP响应速度已提升 30%。');
                    }}
                    className="w-full py-2.5 rounded-xl border border-neutral-800 hover:border-pink-500/20 text-center text-[11px] text-pink-400 hover:text-white transition-colors"
                  >
                    一键清理缓存 (142.8MB)
                  </button>
                </div>
              )}

              {/* F. SPLENDID RECOMMENDATIONS (精彩推荐) */}
              {activeProfileModal === 'recommendations' && (
                <div className="space-y-3.5 text-xs">
                  {[
                    { title: '🔥 国产精品：网红女神制服私密定制版', desc: '老司机强推，全网独家超清1080P，极致声画享受！' },
                    { title: '🌸 日韩特区：无码流出·清纯校花初入社会', desc: '日本顶级女优倾情出演，满分好评，限时体验！' },
                    { title: '🌟 原创大片：制服诱惑·深夜女警狂欢特辑', desc: '独家签约模特，超大尺度互动，精彩不容错过！' }
                  ].map((rec, idx) => (
                    <div 
                      key={idx}
                      onClick={() => alert(`🍿 正在为您跳转播放：《${rec.title}》`)}
                      className="p-3 bg-brand-bg rounded-xl border border-neutral-800 hover:border-brand-purple/40 cursor-pointer flex flex-col justify-between transition-colors"
                    >
                      <h4 className="text-[10px] font-bold text-brand-gold">{rec.title}</h4>
                      <p className="text-[9px] text-gray-400 mt-1 leading-relaxed">{rec.desc}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* G. REWARD RECORDS (奖励记录) */}
              {activeProfileModal === 'rewards' && (
                <div className="space-y-3 text-xs">
                  {[
                    { name: '🎁 新人注册迎新好礼', value: '+5长视频券 / +10短视频券', date: '2026-07-16', note: '已自动发放到账' },
                    { name: '📆 每日签到成就奖励', value: '+10金币 / +5电影券', date: '2026-07-16', note: '日常签到奖励' },
                    { name: '🔗 邀请好友返利佣金记录', value: '￥50.00 备用金已到账', date: '2026-07-16', note: '成功绑定邀请人：BANANA66' }
                  ].map((r, idx) => (
                    <div key={idx} className="p-3 bg-brand-bg rounded-xl border border-neutral-800 flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-[10px] text-gray-100">{r.name}</h4>
                        <p className="text-[8px] text-gray-500 mt-0.5">记录时间：{r.date} · {r.note}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-brand-purple text-[10px] block">{r.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DATING COMPANIONS FULL-SCREEN OVERLAY (covers app exactly) */}
      <AnimatePresence>
        {showDatingMatches && (
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className="absolute inset-0 z-[50] bg-neutral-950 flex flex-col text-white h-full w-full overflow-hidden"
          >
            <div className="w-full h-full bg-neutral-900 p-4 flex flex-col overflow-hidden">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3 shrink-0">
                <div>
                  <h3 className="font-extrabold text-sm text-pink-500">📍 附近 1.5km 寂寞小姐姐</h3>
                  <p className="text-[9px] text-gray-500 mt-0.5">已为您智能定位，可直接发起视频或加微信约会</p>
                </div>
                <button 
                  onClick={() => setShowDatingMatches(false)}
                  className="px-3 py-1 rounded-full bg-neutral-800 border border-neutral-700 text-gray-400 hover:text-white text-[10px] font-bold"
                >
                  关闭
                </button>
              </div>

              {!activeChattingGirl ? (
                <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 pt-3.5 pb-24">
                  {[
                    { 
                      name: '王梓萱 (Tina)', 
                      age: 22, 
                      dist: '0.5km', 
                      title: '精修空姐 / 兼职女模特', 
                      greeting: '今晚航班调休，一个人在酒店好无聊，想找个贴心的小哥哥一起喝杯红酒、看场私密电影... 🥂',
                      avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=300&q=80',
                      wechat: 'tina_flight_sky'
                    },
                    { 
                      name: '陈雨婷 (Rain)', 
                      age: 19, 
                      dist: '1.2km', 
                      title: '艺术系大二校花', 
                      greeting: '平时喜欢画画跟瑜伽。希望能遇到一个温柔多金、会疼人的成熟哥哥带我出去玩 🍒',
                      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
                      wechat: 'rain_99_campus'
                    },
                    { 
                      name: '苏美美 (May)', 
                      age: 25, 
                      dist: '1.8km', 
                      title: '律所金领 / 极品黑丝白领', 
                      greeting: '白天高冷，晚上也想有个宽阔的肩膀靠一靠。哥哥，要不要一起来聊聊天？🧸',
                      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
                      wechat: 'may_finance_office'
                    }
                  ].map((girl, idx) => (
                    <div 
                      key={idx}
                      className="p-3 bg-neutral-950 border border-neutral-800 rounded-2xl flex gap-3 items-start hover:border-pink-500/40 transition-all"
                    >
                      <img 
                        src={girl.avatar} 
                        alt={girl.name} 
                        className="w-16 h-20 rounded-xl object-cover shrink-0 border border-white/5"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <h4 className="font-black text-xs text-pink-400">{girl.name}</h4>
                          <span className="text-[8px] bg-pink-500/10 text-pink-300 px-1.5 py-0.2 rounded border border-pink-500/20 font-bold">{girl.dist}</span>
                        </div>
                        <p className="text-[9px] text-gray-400 font-bold">{girl.title} · {girl.age}岁</p>
                        <p className="text-[10px] text-gray-300 leading-relaxed italic truncate">“ {girl.greeting} ”</p>
                        
                        <div className="flex gap-2 pt-1">
                          <button 
                            onClick={() => {
                              setActiveChattingGirl(girl);
                              setChatMessages([
                                `👋 嗨！哥哥，我是${girl.name}。终于等到你点击我了。`,
                                `💖 你当前距离我只有${girl.dist}，真的超级近。今晚有空一起出来吃个宵夜或者在房间里聊天吗？`
                              ]);
                            }}
                            className="flex-1 py-1 px-2.5 rounded bg-pink-600 hover:bg-pink-700 text-white font-black text-[9px] text-center"
                          >
                            💬 发起私聊
                          </button>
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(girl.wechat);
                              alert(`💚 已成功复制【${girl.name}】的微信号/QQ号：${girl.wechat}！\n\n快去添加好友约见吧，验证请写“香蕉老司机”。`);
                            }}
                            className="py-1 px-2.5 rounded bg-neutral-800 hover:bg-neutral-700 text-gray-300 font-bold text-[9px]"
                          >
                            复制微信
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* CHAT INTERACTIVE PANEL */
                <div className="flex-1 flex flex-col overflow-hidden h-full min-h-0 pb-16">
                  {/* Chat Girl Info bar */}
                  <div className="p-2.5 bg-neutral-950/40 border-b border-neutral-800 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2">
                      <img src={activeChattingGirl.avatar} alt="G" className="w-6 h-6 rounded-full object-cover" referrerPolicy="no-referrer" />
                      <div>
                        <p className="text-[10px] font-black text-pink-400">{activeChattingGirl.name}</p>
                        <p className="text-[8px] text-emerald-400">● 正在输入中...</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setActiveChattingGirl(null)}
                      className="text-[9px] text-gray-400 hover:text-white"
                    >
                      返回列表
                    </button>
                  </div>

                  {/* Chat messages stream */}
                  <div className="flex-1 overflow-y-auto p-3 space-y-2.5 no-scrollbar bg-black/20">
                    {chatMessages.map((msg, i) => {
                      const isMe = i % 2 !== 0 && i !== 0; // Simulated alternation
                      return (
                        <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <div className={`p-2.5 rounded-2xl max-w-[80%] text-[10px] leading-relaxed ${
                            isMe ? 'bg-pink-600 text-white rounded-tr-none' : 'bg-neutral-800 text-gray-200 rounded-tl-none'
                          }`}>
                            {msg}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Chat Input form */}
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!userInputMessage.trim()) return;
                      const userMsg = userInputMessage;
                      setChatMessages(prev => [...prev, userMsg]);
                      setUserInputMessage('');
                      
                      setTimeout(() => {
                        const answers = [
                          "🍒 哇，哥哥说话真幽默！我今天刚好穿了你喜欢的短裙，要不咱们加个微信，你把地址发我好吗？",
                          "🧸 嗯嗯，我平时也超喜欢看电影的！特别是香蕉视频上的原创大片。今晚我去找你，咱们一块看好不好？",
                          "🥂 哥哥，我已经洗好澡在酒店等你了哦。加微信聊好吗，我的微信号是：" + activeChattingGirl.wechat,
                        ];
                        const randomAns = answers[Math.floor(Math.random() * answers.length)];
                        setChatMessages(prev => [...prev, randomAns]);
                      }, 1200);
                    }}
                    className="p-2 border-t border-neutral-800 flex gap-2 bg-neutral-950 shrink-0"
                  >
                    <input 
                      type="text"
                      value={userInputMessage}
                      onChange={(e) => setUserInputMessage(e.target.value)}
                      placeholder="发送调情消息/加好友约会吧..."
                      className="flex-1 bg-neutral-900 border border-neutral-800 rounded-full px-3.5 py-1.5 text-[10px] text-white focus:outline-none"
                    />
                    <button 
                      type="submit"
                      className="px-4 py-1.5 rounded-full bg-pink-600 hover:bg-pink-700 text-white font-black text-[9px]"
                    >
                      发送
                    </button>
                  </form>
                </div>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
