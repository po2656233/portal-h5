import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { UserProfile, UserWallet } from './types';
import { Film, PlayCircle, BookOpen, Gamepad2, User, Gift, Coins, Ticket, Sparkles, AlertCircle, HelpCircle, Info, Star, Venus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Lazy load heavy page tabs and modals for peak initial bundle load efficiency
const LongVideoTab = React.lazy(() => import('./components/LongVideoTab'));
const ShortVideoTab = React.lazy(() => import('./components/ShortVideoTab'));
const LoufengTab = React.lazy(() => import('./components/LoufengTab'));
const ChessTab = React.lazy(() => import('./components/ChessTab'));
const ProfileTab = React.lazy(() => import('./components/ProfileTab'));
const TopUpModal = React.lazy(() => import('./components/TopUpModal'));
const AiUnclotheModal = React.lazy(() => import('./components/AiUnclotheModal'));
const CustomerServiceModal = React.lazy(() => import('./components/CustomerServiceModal'));

export default function App() {
  // Global State for the Demo User Profile & Wallet
  const [profile, setProfile] = useState<UserProfile>({
    id: 'user_9527',
    isLoggedIn: true,
    username: '某某老司机_666',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    vipExpiry: '2026-08-20',
    vipDaysLeft: 35,
    longVideoTickets: 12,
    shortVideoTickets: 28,
    inviteCode: 'BANANA66',
    movieTickets: 3
  });

  const [wallet, setWallet] = useState<UserWallet>({
    mainBalance: 128.50,
    gameBalance: 50.00,
    goldCoins: 80,
    goldBeans: 1500
  });

  const [activeTab, setActiveTab] = useState<'long' | 'short' | 'games' | 'chess' | 'profile'>('long');

  // Track which tabs have been visited to enable lazy-mounting (code only downloads when tab is clicked)
  const [visitedTabs, setVisitedTabs] = useState<Record<string, boolean>>({ long: true });

  useEffect(() => {
    setVisitedTabs((prev) => {
      if (prev[activeTab]) return prev;
      return { ...prev, [activeTab]: true };
    });
  }, [activeTab]);

  // Fullscreen tracking states for tabs
  const [fullscreenStates, setFullscreenStates] = useState<{ [key: string]: boolean }>({
    long: false,
    short: false
  });

  const isAnyFullscreen = Object.values(fullscreenStates).some(v => v);

  const handleLongFullscreenChange = useCallback((isFs: boolean) => {
    setFullscreenStates(prev => {
      if (prev.long === isFs) return prev;
      return { ...prev, long: isFs };
    });
  }, []);

  const handleShortFullscreenChange = useCallback((isFs: boolean) => {
    setFullscreenStates(prev => {
      if (prev.short === isFs) return prev;
      return { ...prev, short: isFs };
    });
  }, []);

  // Modal Control States
  const [isTopUpOpen, setIsTopUpOpen] = useState<boolean>(false);
  const [topUpTabType, setTopUpTabType] = useState<'vip' | 'coin' | 'redeem' | 'transfer'>('vip');
  const [isAiScannerOpen, setIsAiScannerOpen] = useState<boolean>(false);
  const [isCustomerServiceOpen, setIsCustomerServiceOpen] = useState<boolean>(false);

  // Custom visual internal dialog state
  const [dialog, setDialog] = useState<{
    isOpen: boolean;
    type: 'alert' | 'confirm' | 'prompt' | 'reward';
    title: string;
    message: string;
    placeholder?: string;
    promptValue?: string;
    onConfirm?: (val?: string) => void;
    onCancel?: () => void;
    rewards?: { coins?: number; vipDays?: number; tickets?: number; movieTickets?: number };
  } | null>(null);

  // Bind custom dialog helpers to window
  useEffect(() => {
    window.customAlert = (title, message) => {
      setDialog({
        isOpen: true,
        type: 'alert',
        title,
        message
      });
    };

    window.customConfirm = (title, message, onConfirm) => {
      setDialog({
        isOpen: true,
        type: 'confirm',
        title,
        message,
        onConfirm
      });
    };

    window.customPrompt = (title, message, onConfirm, placeholder) => {
      setDialog({
        isOpen: true,
        type: 'prompt',
        title,
        message,
        placeholder: placeholder || '请输入内容...',
        promptValue: '',
        onConfirm
      });
    };

    window.customRewardAlert = (title, message, rewards) => {
      setDialog({
        isOpen: true,
        type: 'reward',
        title,
        message,
        rewards
      });
    };

    // Global override of standard window.alert!
    window.alert = (message) => {
      // Attempt to extract title/rewards indicators
      let title = '🎬 某某社区通知';
      if (message.includes('🎉') || message.includes('💰') || message.includes('🔥') || message.includes('🎰') || message.includes('👑')) {
        title = '🎉 恭喜获得福利';
      } else if (message.includes('⚠️') || message.includes('❌') || message.includes('🔒')) {
        title = '⚠️ 系统提示';
      } else if (message.includes('🧹') || message.includes('⚙️')) {
        title = '⚙️ 系统设置';
      }
      
      // Check if it's a rewards alert (e.g.签到成功)
      if (message.includes('每日签到成功') || message.includes('签到领金币')) {
        window.customRewardAlert(title, message, { coins: 10, tickets: 15, movieTickets: 5 });
        return;
      }
      if (message.includes('奖励领取成功')) {
        window.customRewardAlert(title, message, { coins: 50 });
        return;
      }
      if (message.includes('分享文案已成功复制')) {
        window.customRewardAlert(title, message, { coins: 500 }); // simulated currency
        return;
      }

      window.customAlert(title, message);
    };
  }, []);

  // Common State Updaters
  const handleUpdateProfile = (newFields: Partial<UserProfile>) => {
    setProfile((prev) => ({ ...prev, ...newFields }));
  };

  const handleUpdateWallet = (newFields: Partial<UserWallet>) => {
    setWallet((prev) => ({ ...prev, ...newFields }));
  };

  const handleOpenTopup = (type: 'vip' | 'coin' | 'redeem' | 'transfer') => {
    setTopUpTabType(type);
    setIsTopUpOpen(true);
  };

  return (
    <div className="h-screen h-[100dvh] md:min-h-screen bg-[#121212] flex items-center justify-center font-sans antialiased text-white selection:bg-brand-purple selection:text-white overflow-hidden">
      
      {/* Mobile-first simulated center frame wrapper with Geometric Balance solid borders */}
      <div className="w-full max-w-md h-screen h-[100dvh] max-h-screen max-h-[100dvh] md:h-[850px] md:max-h-[94vh] bg-brand-bg shadow-2xl relative flex flex-col justify-between overflow-hidden border-x border-neutral-800 md:border-4 md:border-neutral-800 md:rounded-[32px]">
        
        {/* Dynamic Main App Tab Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          <Suspense fallback={
            <div className="flex-1 flex flex-col items-center justify-center bg-[#121212] text-gray-400">
              <div className="flex flex-col items-center gap-3">
                <div className="relative w-12 h-12">
                  <div className="absolute inset-0 bg-gradient-to-tr from-pink-500 via-purple-600 to-amber-400 rounded-2xl blur-md opacity-75 animate-pulse"></div>
                  <div className="absolute inset-0.5 bg-[#16161a] rounded-2xl border border-white/10 flex items-center justify-center">
                    <span className="text-xl animate-bounce">🔥</span>
                  </div>
                </div>
                <div className="text-[10px] tracking-widest text-brand-gold font-bold uppercase animate-pulse">
                  加载中 / Loading...
                </div>
              </div>
            </div>
          }>
            {visitedTabs.long && (
              <div className={activeTab === 'long' ? 'flex-1 flex flex-col overflow-hidden relative' : 'hidden'}>
                <LongVideoTab 
                  profile={profile} 
                  wallet={wallet} 
                  onUpdateWallet={handleUpdateWallet} 
                  onUpdateProfile={handleUpdateProfile} 
                  onOpenTopup={handleOpenTopup}
                  onOpenAiScanner={() => setIsAiScannerOpen(true)}
                  onFullscreenChange={handleLongFullscreenChange}
                />
              </div>
            )}

            {visitedTabs.short && (
              <div className={activeTab === 'short' ? 'flex-1 flex flex-col overflow-hidden relative' : 'hidden'}>
                <ShortVideoTab 
                  profile={profile} 
                  wallet={wallet} 
                  onUpdateWallet={handleUpdateWallet} 
                  onUpdateProfile={handleUpdateProfile} 
                  onOpenTopup={handleOpenTopup}
                  onFullscreenChange={handleShortFullscreenChange}
                />
              </div>
            )}

            {visitedTabs.games && (
              <div className={activeTab === 'games' ? 'flex-1 flex flex-col overflow-hidden relative' : 'hidden'}>
                <LoufengTab 
                  wallet={wallet} 
                  profile={profile} 
                  onUpdateWallet={handleUpdateWallet} 
                  onUpdateProfile={handleUpdateProfile} 
                  onOpenTopup={handleOpenTopup}
                />
              </div>
            )}

            {visitedTabs.chess && (
              <div className={activeTab === 'chess' ? 'flex-1 flex flex-col overflow-hidden relative pb-[60px] bg-[#121212]' : 'hidden'}>
                <ChessTab 
                  wallet={wallet} 
                  profile={profile} 
                  onUpdateWallet={handleUpdateWallet} 
                  onUpdateProfile={handleUpdateProfile} 
                  onOpenTopup={handleOpenTopup}
                  onOpenCustomerService={() => setIsCustomerServiceOpen(true)}
                />
              </div>
            )}

            {visitedTabs.profile && (
              <div className={activeTab === 'profile' ? 'flex-1 flex flex-col overflow-hidden relative' : 'hidden'}>
                <ProfileTab 
                  profile={profile} 
                  wallet={wallet} 
                  onUpdateWallet={handleUpdateWallet} 
                  onUpdateProfile={handleUpdateProfile} 
                  onOpenTopup={handleOpenTopup}
                  onOpenAiScanner={() => setIsAiScannerOpen(true)}
                  onOpenCustomerService={() => setIsCustomerServiceOpen(true)}
                />
              </div>
            )}
          </Suspense>
        </div>

        {/* FIXED BOTTOM NAVIGATION BAR */}
        {!isAnyFullscreen && (
          <nav className="absolute bottom-0 inset-x-0 bg-[#161616]/95 backdrop-blur-md border-t border-neutral-800 py-2.5 px-3 flex items-center justify-around z-50 text-brand-gray">
            
            <button
              id="nav-long-video"
              onClick={() => setActiveTab('long')}
              className={`flex flex-col items-center gap-1 py-1 px-3 transition-all relative ${activeTab === 'long' ? 'text-white font-bold' : 'hover:text-gray-200'}`}
            >
              <Film className={`w-5 h-5 ${activeTab === 'long' ? 'text-brand-purple scale-110' : ''} transition-transform`} />
              <span className="text-[10px]">长视频</span>
              {activeTab === 'long' && (
                <span className="absolute bottom-0 w-4 h-0.5 bg-brand-purple rounded-full"></span>
              )}
            </button>

            <button
              id="nav-short-video"
              onClick={() => setActiveTab('short')}
              className={`flex flex-col items-center gap-1 py-1 px-3 transition-all relative ${activeTab === 'short' ? 'text-white font-bold' : 'hover:text-gray-200'}`}
            >
              <PlayCircle className={`w-5 h-5 ${activeTab === 'short' ? 'text-brand-purple scale-110' : ''} transition-transform`} />
              <span className="text-[10px]">短视频</span>
              {activeTab === 'short' && (
                <span className="absolute bottom-0 w-4 h-0.5 bg-brand-purple rounded-full"></span>
              )}
            </button>

            <button
              id="nav-games"
              onClick={() => setActiveTab('games')}
              className={`flex flex-col items-center gap-1 py-1 px-3 transition-all relative ${activeTab === 'games' ? 'text-white font-bold' : 'hover:text-gray-200'}`}
            >
              <Venus className={`w-5 h-5 ${activeTab === 'games' ? 'text-brand-purple scale-110' : ''} transition-transform`} />
              <span className="text-[10px]">楼凤</span>
              {activeTab === 'games' && (
                <span className="absolute bottom-0 w-4 h-0.5 bg-brand-purple rounded-full"></span>
              )}
            </button>

            <button
              id="nav-chess"
              onClick={() => setActiveTab('chess')}
              className={`flex flex-col items-center gap-1 py-1 px-3 transition-all relative ${activeTab === 'chess' ? 'text-white font-bold' : 'hover:text-gray-200'}`}
            >
              <Gamepad2 className={`w-5 h-5 ${activeTab === 'chess' ? 'text-brand-purple scale-110' : ''} transition-transform`} />
              <span className="text-[10px]">引流页</span>
              {activeTab === 'chess' && (
                <span className="absolute bottom-0 w-4 h-0.5 bg-brand-purple rounded-full"></span>
              )}
            </button>

            <button
              id="nav-profile"
              onClick={() => setActiveTab('profile')}
              className={`flex flex-col items-center gap-1 py-1 px-3 transition-all relative ${activeTab === 'profile' ? 'text-white font-bold' : 'hover:text-gray-200'}`}
            >
              <User className={`w-5 h-5 ${activeTab === 'profile' ? 'text-brand-purple scale-110' : ''} transition-transform`} />
              <span className="text-[10px]">我的</span>
              {activeTab === 'profile' && (
                <span className="absolute bottom-0 w-4 h-0.5 bg-brand-purple rounded-full"></span>
              )}
            </button>

          </nav>
        )}

        {/* COMBINED MODAL TRANSACTION SYSTEM */}
        <Suspense fallback={null}>
          {isTopUpOpen && (
            <TopUpModal 
              isOpen={isTopUpOpen} 
              onClose={() => setIsTopUpOpen(false)}
              tabType={topUpTabType}
              profile={profile}
              wallet={wallet}
              onUpdateWallet={handleUpdateWallet}
              onUpdateProfile={handleUpdateProfile}
            />
          )}

          {/* AI SMART CLOTHES SCANNER MODAL */}
          {isAiScannerOpen && (
            <AiUnclotheModal 
              isOpen={isAiScannerOpen}
              onClose={() => setIsAiScannerOpen(false)}
              profile={profile}
              wallet={wallet}
              onUpdateWallet={handleUpdateWallet}
              onUpdateProfile={handleUpdateProfile}
              onOpenTopup={handleOpenTopup}
            />
          )}

          {isCustomerServiceOpen && (
            <CustomerServiceModal 
              isOpen={isCustomerServiceOpen}
              onClose={() => setIsCustomerServiceOpen(false)}
              username={profile.username}
            />
          )}
        </Suspense>

        {/* CUSTOM GLOBAL POPUP DIALOGS (INTERNAL & BEAUTIFIED) */}
        <AnimatePresence>
          {dialog && dialog.isOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            >
              <motion.div 
                initial={{ scale: 0.95, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 15 }}
                className="w-full max-w-xs rounded-2xl bg-[#161616] border border-neutral-800 p-5 text-white space-y-4 shadow-2xl relative overflow-hidden"
              >
                {/* Visual Highlights based on dialog type */}
                {dialog.type === 'reward' && (
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-400 animate-pulse" />
                )}
                {dialog.type === 'alert' && (
                  <div className="absolute top-0 inset-x-0 h-1 bg-brand-purple" />
                )}
                {dialog.type === 'confirm' && (
                  <div className="absolute top-0 inset-x-0 h-1 bg-brand-gold" />
                )}

                {/* Title */}
                <div className="flex items-center gap-2 border-b border-neutral-800 pb-2">
                  {dialog.type === 'reward' ? (
                    <Gift className="w-4 h-4 text-yellow-500 animate-bounce" />
                  ) : dialog.type === 'confirm' ? (
                    <HelpCircle className="w-4 h-4 text-brand-gold" />
                  ) : dialog.type === 'prompt' ? (
                    <Sparkles className="w-4 h-4 text-brand-purple" />
                  ) : (
                    <Info className="w-4 h-4 text-brand-purple" />
                  )}
                  <h3 className="font-extrabold text-[10px] uppercase tracking-wider text-gray-200">
                    {dialog.title}
                  </h3>
                </div>

                {/* Message / Description */}
                <div className="text-xs text-gray-300 leading-relaxed whitespace-pre-line py-1">
                  {dialog.message}
                </div>

                {/* Optional Custom Reward Badges inside dialog */}
                {dialog.type === 'reward' && dialog.rewards && (
                  <div className="p-2.5 bg-neutral-900 rounded-xl border border-neutral-800 grid grid-cols-2 gap-2 text-center">
                    {dialog.rewards.coins && (
                      <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-2 flex flex-col items-center">
                        <Coins className="w-4 h-4 text-amber-400 mb-1" />
                        <span className="text-[9px] text-amber-400 font-bold">+{dialog.rewards.coins} 金币</span>
                      </div>
                    )}
                    {dialog.rewards.tickets && (
                      <div className="bg-brand-purple/10 border border-brand-purple/20 rounded-lg p-2 flex flex-col items-center">
                        <Ticket className="w-4 h-4 text-brand-purple mb-1" />
                        <span className="text-[9px] text-brand-purple font-bold">+{dialog.rewards.tickets} 短剧券</span>
                      </div>
                    )}
                    {dialog.rewards.movieTickets && (
                      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-2 flex flex-col items-center col-span-2">
                        <Film className="w-4 h-4 text-emerald-400 mb-1" />
                        <span className="text-[9px] text-emerald-400 font-bold">+{dialog.rewards.movieTickets} 长视频券</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Optional Input for Prompt Type */}
                {dialog.type === 'prompt' && (
                  <div className="space-y-2">
                    <textarea
                      placeholder={dialog.placeholder}
                      value={dialog.promptValue}
                      onChange={(e) => setDialog(prev => prev ? { ...prev, promptValue: e.target.value } : null)}
                      className="w-full h-16 bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-brand-purple resize-none placeholder:text-gray-600"
                    />
                  </div>
                )}

                {/* Button actions */}
                <div className="flex items-center gap-2 pt-1">
                  {(dialog.type === 'confirm' || dialog.type === 'prompt') && (
                    <button
                      onClick={() => {
                        setDialog(prev => prev ? { ...prev, isOpen: false } : null);
                        if (dialog.onCancel) dialog.onCancel();
                      }}
                      className="flex-1 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-xs font-medium text-gray-400 border border-neutral-800 transition-all"
                    >
                      取消
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setDialog(prev => prev ? { ...prev, isOpen: false } : null);
                      if (dialog.onConfirm) {
                        dialog.onConfirm(dialog.promptValue || '');
                      }
                    }}
                    className={`flex-1 py-1.5 rounded-lg font-bold text-xs text-white transition-all shadow-md ${
                      dialog.type === 'reward' 
                        ? 'bg-amber-500 hover:bg-amber-400 text-black' 
                        : 'bg-brand-purple hover:bg-brand-purple/95'
                    }`}
                  >
                    {dialog.type === 'reward' ? '金币收入囊中' : '确认'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

    </div>
  );
}
