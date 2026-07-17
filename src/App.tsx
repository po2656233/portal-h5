import React, { useState } from 'react';
import { UserProfile, UserWallet } from './types';
import LongVideoTab from './components/LongVideoTab';
import ShortVideoTab from './components/ShortVideoTab';
import GamesTab from './components/GamesTab';
import ChessTab from './components/ChessTab';
import ProfileTab from './components/ProfileTab';
import TopUpModal from './components/TopUpModal';
import AiUnclotheModal from './components/AiUnclotheModal';
import CustomerServiceModal from './components/CustomerServiceModal';
import { Film, PlayCircle, Gamepad2, Layers, User } from 'lucide-react';

export default function App() {
  // Global State for the Demo User Profile & Wallet
  const [profile, setProfile] = useState<UserProfile>({
    isLoggedIn: true,
    username: '香蕉老司机_666',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    vipExpiry: '2026-08-20',
    vipDaysLeft: 35,
    longVideoTickets: 12,
    shortVideoTickets: 28,
    inviteCode: 'BANANA66'
  });

  const [wallet, setWallet] = useState<UserWallet>({
    mainBalance: 128.50,
    gameBalance: 50.00,
    goldCoins: 80,
    goldBeans: 1500
  });

  const [activeTab, setActiveTab] = useState<'long' | 'short' | 'games' | 'chess' | 'profile'>('long');

  // Modal Control States
  const [isTopUpOpen, setIsTopUpOpen] = useState<boolean>(false);
  const [topUpTabType, setTopUpTabType] = useState<'vip' | 'coin' | 'redeem' | 'transfer'>('vip');
  const [isAiScannerOpen, setIsAiScannerOpen] = useState<boolean>(false);
  const [isCustomerServiceOpen, setIsCustomerServiceOpen] = useState<boolean>(false);

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
    <div className="min-h-screen bg-[#121212] flex items-center justify-center font-sans antialiased text-white selection:bg-brand-purple selection:text-white">
      
      {/* Mobile-first simulated center frame wrapper with Geometric Balance solid borders */}
      <div className="w-full max-w-md min-h-screen md:min-h-[850px] md:h-[850px] bg-brand-bg shadow-2xl relative flex flex-col justify-between overflow-hidden border-x border-neutral-800 md:border-4 md:border-neutral-800 md:rounded-[32px]">
        
        {/* Dynamic Main App Tab Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {activeTab === 'long' && (
            <LongVideoTab 
              profile={profile} 
              wallet={wallet} 
              onUpdateWallet={handleUpdateWallet} 
              onUpdateProfile={handleUpdateProfile} 
              onOpenTopup={handleOpenTopup}
              onOpenAiScanner={() => setIsAiScannerOpen(true)}
            />
          )}

          {activeTab === 'short' && (
            <ShortVideoTab 
              profile={profile} 
              wallet={wallet} 
              onUpdateWallet={handleUpdateWallet} 
              onUpdateProfile={handleUpdateProfile} 
              onOpenTopup={handleOpenTopup}
            />
          )}

          {activeTab === 'games' && (
            <GamesTab 
              wallet={wallet} 
              profile={profile} 
              onUpdateWallet={handleUpdateWallet} 
              onUpdateProfile={handleUpdateProfile} 
              onOpenTopup={handleOpenTopup}
            />
          )}

          {activeTab === 'chess' && (
            <ChessTab 
              wallet={wallet} 
              profile={profile} 
              onUpdateWallet={handleUpdateWallet} 
              onUpdateProfile={handleUpdateProfile} 
              onOpenTopup={handleOpenTopup}
              onOpenCustomerService={() => setIsCustomerServiceOpen(true)}
            />
          )}

          {activeTab === 'profile' && (
            <ProfileTab 
              profile={profile} 
              wallet={wallet} 
              onUpdateWallet={handleUpdateWallet} 
              onUpdateProfile={handleUpdateProfile} 
              onOpenTopup={handleOpenTopup}
              onOpenAiScanner={() => setIsAiScannerOpen(true)}
              onOpenCustomerService={() => setIsCustomerServiceOpen(true)}
            />
          )}
        </div>

        {/* FIXED BOTTOM NAVIGATION BAR */}
        <nav className="absolute bottom-0 inset-x-0 bg-[#161616]/95 backdrop-blur-md border-t border-neutral-800 py-2.5 px-3 flex items-center justify-around z-40 text-brand-gray">
          
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
            <Gamepad2 className={`w-5 h-5 ${activeTab === 'games' ? 'text-brand-purple scale-110' : ''} transition-transform`} />
            <span className="text-[10px]">游戏</span>
            {activeTab === 'games' && (
              <span className="absolute bottom-0 w-4 h-0.5 bg-brand-purple rounded-full"></span>
            )}
          </button>

          <button
            id="nav-chess"
            onClick={() => setActiveTab('chess')}
            className={`flex flex-col items-center gap-1 py-1 px-3 transition-all relative ${activeTab === 'chess' ? 'text-white font-bold' : 'hover:text-gray-200'}`}
          >
            <Layers className={`w-5 h-5 ${activeTab === 'chess' ? 'text-brand-purple scale-110' : ''} transition-transform`} />
            <span className="text-[10px]">棋牌</span>
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

        {/* COMBINED MODAL TRANSACTION SYSTEM */}
        <TopUpModal 
          isOpen={isTopUpOpen} 
          onClose={() => setIsTopUpOpen(false)}
          tabType={topUpTabType}
          profile={profile}
          wallet={wallet}
          onUpdateWallet={handleUpdateWallet}
          onUpdateProfile={handleUpdateProfile}
        />

        {/* AI SMART CLOTHES SCANNER MODAL */}
        <AiUnclotheModal 
          isOpen={isAiScannerOpen}
          onClose={() => setIsAiScannerOpen(false)}
          profile={profile}
          wallet={wallet}
          onUpdateWallet={handleUpdateWallet}
          onUpdateProfile={handleUpdateProfile}
          onOpenTopup={handleOpenTopup}
        />

        <CustomerServiceModal 
          isOpen={isCustomerServiceOpen}
          onClose={() => setIsCustomerServiceOpen(false)}
          username={profile.username}
        />

      </div>

    </div>
  );
}
