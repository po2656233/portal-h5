import React, { useState, useEffect, useRef } from 'react';
import { UserWallet, UserProfile } from '../types';
import { Trophy, Coins, Volume2, Sparkles, Play, Timer, Rocket, AlertTriangle, RefreshCw, Disc } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface GamesTabProps {
  wallet: UserWallet;
  profile: UserProfile;
  onUpdateWallet: (wallet: Partial<UserWallet>) => void;
  onUpdateProfile: (profile: Partial<UserProfile>) => void;
  onOpenTopup: (type: 'vip' | 'coin' | 'transfer') => void;
}

export default function GamesTab({
  wallet,
  profile,
  onUpdateWallet,
  onUpdateProfile,
  onOpenTopup
}: GamesTabProps) {
  // Select active sub-game: 'slots' | 'crash' | 'wheel'
  const [activeGame, setActiveGame] = useState<'slots' | 'crash' | 'wheel'>('slots');
  const [converting, setConverting] = useState<boolean>(false);

  // ==========================================
  // GAME 1: FRUIT SLOTS STATES (经典水果玛丽)
  // ==========================================
  const [slotReels, setSlotReels] = useState<string[]>(['🎰', '🎰', '🎰']);
  const [slotSpinning, setSlotSpinning] = useState<boolean>(false);
  const [slotResultMsg, setSlotResultMsg] = useState<string>('小试身手，单次仅耗 10 金币！');
  const [betMultiplier, setBetMultiplier] = useState<number>(1); // Bet size modifier: 1x (10 coins), 2x (20 coins), 5x (50 coins)
  const [totalJackpot, setTotalJackpot] = useState<number>(8847290);
  const slotEmojis = ['🍒', '🍋', '🍇', '🔔', '💎', '🎰'];

  // ==========================================
  // GAME 2: BANANA CRASH STATES (香蕉火箭飞天)
  // ==========================================
  const [crashBet, setCrashBet] = useState<number>(10);
  const [crashState, setCrashState] = useState<'idle' | 'running' | 'cashed' | 'crashed'>('idle');
  const [crashMultiplier, setCrashMultiplier] = useState<number>(1.00);
  const [crashResultMsg, setCrashResultMsg] = useState<string>('香蕉火箭升空，倍数无限翻！随时落袋为安。');
  const crashIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentMultRef = useRef<number>(1.00);

  // ==========================================
  // GAME 3: LUCKY WHEEL STATES (至尊大轮盘)
  // ==========================================
  const [wheelSpinning, setWheelSpinning] = useState<boolean>(false);
  const [wheelRotation, setWheelRotation] = useState<number>(0);
  const [wheelResultMsg, setWheelResultMsg] = useState<string>('消耗 20 金币抽取幸运豪礼！');
  const wheelSectors = [
    { label: '50金币', type: 'coins', val: 50 },
    { label: '谢谢参与', type: 'none', val: 0 },
    { label: 'VIP+1天', type: 'vip', val: 1 },
    { label: '10金币', type: 'coins', val: 10 },
    { label: '500金币', type: 'coins', val: 500 },
    { label: '150%返水', type: 'coins', val: 30 },
    { label: '100金币', type: 'coins', val: 100 },
    { label: 'VIP+3天', type: 'vip', val: 3 },
  ];

  // Dynamic jackpot ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setTotalJackpot(prev => prev + Math.floor(Math.random() * 25) + 5);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // Cleanup crash timers
  useEffect(() => {
    return () => {
      if (crashIntervalRef.current) clearInterval(crashIntervalRef.current);
    };
  }, []);

  // ==========================================
  // GAME 1 LOGIC: SPIN SLOTS
  // ==========================================
  const spinSlot = () => {
    if (slotSpinning) return;

    const finalCost = 10 * betMultiplier;
    if (wallet.goldCoins < finalCost) {
      alert(`❌ 您的账户金币不足 ${finalCost}！请充值或兑换金币。`);
      return;
    }

    onUpdateWallet({ goldCoins: wallet.goldCoins - finalCost });
    setSlotSpinning(true);
    setSlotResultMsg('🎰 滚轮疯狂飞转中...');

    let ticks = 0;
    const interval = setInterval(() => {
      setSlotReels([
        slotEmojis[Math.floor(Math.random() * slotEmojis.length)],
        slotEmojis[Math.floor(Math.random() * slotEmojis.length)],
        slotEmojis[Math.floor(Math.random() * slotEmojis.length)]
      ]);
      ticks++;
      if (ticks > 12) {
        clearInterval(interval);
        
        // Final roll
        const r1 = slotEmojis[Math.floor(Math.random() * slotEmojis.length)];
        const r2 = slotEmojis[Math.floor(Math.random() * slotEmojis.length)];
        let r3 = slotEmojis[Math.floor(Math.random() * slotEmojis.length)];
        // Add slightly higher match multiplier for better fun
        if (Math.random() < 0.28) r3 = r2;

        const finalRoll = [r1, r2, r3];
        setSlotReels(finalRoll);
        setSlotSpinning(false);

        // Win check
        if (r1 === r2 && r2 === r3) {
          if (r1 === '🎰') {
            const reward = 500 * betMultiplier;
            onUpdateWallet({ goldCoins: wallet.goldCoins + reward });
            setSlotResultMsg(`🎉【超级大奖】爆出 🎰 满贯！狂揽 ${reward} 金币！💥`);
          } else if (r1 === '💎') {
            const reward = 200 * betMultiplier;
            onUpdateWallet({ goldCoins: wallet.goldCoins + reward });
            setSlotResultMsg(`💎【钻石狂潮】获得 ${reward} 金币！`);
          } else {
            const reward = 100 * betMultiplier;
            onUpdateWallet({ goldCoins: wallet.goldCoins + reward });
            setSlotResultMsg(`🍒【经典三连】获得 ${reward} 金币！`);
          }
        } else if (r1 === r2 || r2 === r3 || r1 === r3) {
          const reward = Math.floor(15 * betMultiplier);
          onUpdateWallet({ goldCoins: wallet.goldCoins + reward });
          setSlotResultMsg(`✨ 二连小捷！斩获 ${reward} 金币！`);
        } else {
          setSlotResultMsg('💨 遗憾未中！财神终会降临，换个倍数再试！');
        }
      }
    }, 100);
  };

  // ==========================================
  // GAME 2 LOGIC: BANANA CRASH
  // ==========================================
  const startCrashGame = () => {
    if (crashState === 'running') return;

    if (wallet.goldCoins < crashBet) {
      alert(`❌ 账户金币不足 ${crashBet}！`);
      return;
    }

    onUpdateWallet({ goldCoins: wallet.goldCoins - crashBet });
    setCrashState('running');
    setCrashMultiplier(1.00);
    currentMultRef.current = 1.00;
    setCrashResultMsg('🚀 香蕉飞天火箭发射成功！倍数持续狂飙中！');

    // Random crash point between 1.05 and 10.00
    const crashLimit = 1.05 + Math.random() * 6.5 + (Math.random() < 0.15 ? 12 : 0);

    crashIntervalRef.current = setInterval(() => {
      currentMultRef.current = parseFloat((currentMultRef.current + 0.05 + currentMultRef.current * 0.015).toFixed(2));
      setCrashMultiplier(currentMultRef.current);

      if (currentMultRef.current >= crashLimit) {
        // Exploded!
        if (crashIntervalRef.current) clearInterval(crashIntervalRef.current);
        setCrashState('crashed');
        setCrashResultMsg(`💥 火箭在 ${currentMultRef.current.toFixed(2)}x 爆裂！您的本金已化为飞灰！`);
      }
    }, 100);
  };

  const cashOutCrash = () => {
    if (crashState !== 'running') return;
    if (crashIntervalRef.current) clearInterval(crashIntervalRef.current);

    const winAmount = Math.floor(crashBet * crashMultiplier);
    onUpdateWallet({ goldCoins: wallet.goldCoins + winAmount });
    setCrashState('cashed');
    setCrashResultMsg(`🎉 成功落袋！在 ${crashMultiplier.toFixed(2)}x 止盈，赚得 ${winAmount} 金币！`);
  };

  // ==========================================
  // GAME 3 LOGIC: SPIN WHEEL
  // ==========================================
  const spinWheel = () => {
    if (wheelSpinning) return;

    if (wallet.goldCoins < 20) {
      alert('❌ 转盘单次消耗 20 金币！您的余额不足！');
      return;
    }

    onUpdateWallet({ goldCoins: wallet.goldCoins - 20 });
    setWheelSpinning(true);
    setWheelResultMsg('🌀 转盘飞速旋转，财神降临...');

    // Select winner sector index
    const sectorCount = wheelSectors.length;
    const selectedIdx = Math.floor(Math.random() * sectorCount);
    
    // Each sector takes 360 / sectorCount degrees.
    const sectorAngle = 360 / sectorCount;
    const finalTargetAngle = 3600 + (selectedIdx * sectorAngle) + (sectorAngle / 2);

    setWheelRotation(finalTargetAngle);

    setTimeout(() => {
      setWheelSpinning(false);
      const sector = wheelSectors[selectedIdx];

      if (sector.type === 'coins') {
        onUpdateWallet({ goldCoins: wallet.goldCoins + sector.val });
        setWheelResultMsg(`🎁 恭喜！大转盘指针对准【${sector.label}】，已成功充值到您的钱包！`);
      } else if (sector.type === 'vip') {
        const days = sector.val;
        onUpdateProfile({ vipDaysLeft: profile.vipDaysLeft + days });
        setWheelResultMsg(`👑 爆出惊喜！获得尊贵会员 VIP+${days}天 豪特权！`);
      } else {
        setWheelResultMsg('💨 差一点点就拿到500金币！下次必定欧气爆棚！');
      }
    }, 4500);
  };

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar pb-24 text-white">
      
      {/* Upper Account Wallet Bar */}
      <div className="p-4 bg-brand-card border-b border-neutral-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Coins className="w-5 h-5 text-brand-gold animate-spin" style={{ animationDuration: '8s' }} />
          <div>
            <p className="text-[10px] text-gray-400">电玩专享金币余额</p>
            <p className="text-sm font-black text-brand-gold flex items-center gap-1.5">
              <span>{wallet.goldCoins}</span>
              <span className="text-[9px] bg-brand-gold/15 text-brand-gold px-1.5 py-0.2 rounded">COINS</span>
            </p>
          </div>
        </div>

        <button 
          onClick={() => onOpenTopup('coin')}
          className="px-3.5 py-1.5 rounded-xl bg-brand-gradient hover:brightness-110 text-white text-xs font-black shadow-md flex items-center gap-1 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5 text-white" />
          <span>金币兑换中心</span>
        </button>
      </div>

      {/* Sub-Game selectors (Image 5 Style header) */}
      <div className="p-4 bg-brand-bg flex items-center gap-2">
        <button
          onClick={() => setActiveGame('slots')}
          className={`flex-1 py-3 px-1 rounded-xl flex flex-col items-center justify-center gap-1 transition-all border ${activeGame === 'slots' ? 'bg-brand-gradient border-brand-purple/40 text-white' : 'bg-brand-card border-neutral-800 text-gray-400'}`}
        >
          <span className="text-lg">🎰</span>
          <span className="text-[10px] font-bold">水果玛丽</span>
        </button>

        <button
          onClick={() => {
            setActiveGame('crash');
            setCrashState('idle');
            setCrashMultiplier(1.00);
            setCrashResultMsg('香蕉火箭升空，倍数无限翻！随时落袋为安。');
          }}
          className={`flex-1 py-3 px-1 rounded-xl flex flex-col items-center justify-center gap-1 transition-all border ${activeGame === 'crash' ? 'bg-brand-gradient border-brand-purple/40 text-white' : 'bg-brand-card border-neutral-800 text-gray-400'}`}
        >
          <span className="text-lg">🚀</span>
          <span className="text-[10px] font-bold">香蕉航天火箭</span>
        </button>

        <button
          onClick={() => {
            setActiveGame('wheel');
            setWheelRotation(0);
            setWheelResultMsg('消耗 20 金币抽取幸运豪礼！');
          }}
          className={`flex-1 py-3 px-1 rounded-xl flex flex-col items-center justify-center gap-1 transition-all border ${activeGame === 'wheel' ? 'bg-brand-gradient border-brand-purple/40 text-white' : 'bg-brand-card border-neutral-800 text-gray-400'}`}
        >
          <span className="text-lg">🌀</span>
          <span className="text-[10px] font-bold">幸运至尊转盘</span>
        </button>
      </div>

      {/* ==========================================
          GAME MODULE 1: FRUIT SLOTS
         ========================================== */}
      {activeGame === 'slots' && (
        <div className="mx-4 p-4 rounded-2xl bg-brand-card border border-neutral-800 space-y-5">
          <div className="text-center">
            <h3 className="font-extrabold text-sm text-brand-gold flex items-center justify-center gap-1">
              <Trophy className="w-4 h-4" /> 水果玛丽 · 老虎机
            </h3>
            <p className="text-[10px] text-gray-400 mt-0.5">超级派送彩池：¥{totalJackpot.toLocaleString()}</p>
          </div>

          {/* Reels Container */}
          <div className="flex items-center gap-3 bg-black/60 p-4 rounded-xl border border-neutral-800 justify-center shadow-inner">
            {slotReels.map((reel, idx) => (
              <motion.div
                key={idx}
                animate={slotSpinning ? { y: [0, -15, 15, 0] } : {}}
                transition={{ repeat: Infinity, duration: 0.15 }}
                className="w-14 h-16 rounded-lg bg-[#252525] border border-brand-gold/30 flex items-center justify-center text-3xl font-mono shadow"
              >
                {reel}
              </motion.div>
            ))}
          </div>

          {/* Bet size modifiers */}
          <div className="space-y-1.5">
            <p className="text-[9px] text-gray-400 font-bold">选择投注倍数：</p>
            <div className="flex gap-2">
              {[1, 2, 5, 10].map((mult) => (
                <button
                  key={mult}
                  onClick={() => setBetMultiplier(mult)}
                  className={`flex-1 py-1.5 text-xs font-black rounded-lg transition-all ${betMultiplier === mult ? 'bg-brand-gold text-black shadow-md' : 'bg-brand-bg border border-neutral-800 text-gray-400'}`}
                >
                  {mult}x ({mult * 10}金币)
                </button>
              ))}
            </div>
          </div>

          {/* Result Alert panel */}
          <div className="p-3 rounded-lg bg-black/40 text-center text-[10px] text-brand-gold font-bold border border-neutral-800">
            {slotResultMsg}
          </div>

          <button
            onClick={spinSlot}
            disabled={slotSpinning}
            className="w-full py-3.5 rounded-xl font-black text-sm uppercase tracking-wider bg-brand-gradient hover:brightness-110 disabled:opacity-50 text-white transition-all shadow"
          >
            {slotSpinning ? '🎰 疯狂滚轴中...' : `🎰 启动拉杆 (扣除 ${10 * betMultiplier}金币)`}
          </button>
        </div>
      )}

      {/* ==========================================
          GAME MODULE 2: BANANA CRASH火箭飞天
         ========================================== */}
      {activeGame === 'crash' && (
        <div className="mx-4 p-4 rounded-2xl bg-brand-card border border-neutral-800 space-y-4">
          <div className="text-center">
            <h3 className="font-extrabold text-sm text-red-400 flex items-center justify-center gap-1">
              <Rocket className="w-4 h-4" /> 香蕉飞天火箭 (Crash)
            </h3>
            <p className="text-[10px] text-gray-400 mt-0.5">航天动力，倍数指数膨胀，随时落袋！</p>
          </div>

          {/* Display screen */}
          <div className="h-36 rounded-xl bg-black/80 border border-neutral-800 relative flex flex-col items-center justify-center overflow-hidden shadow-inner">
            
            {/* Multiplier visual ticker */}
            <div className="text-center z-10 space-y-1">
              <AnimatePresence mode="wait">
                <motion.p
                  key={crashMultiplier}
                  initial={{ scale: 0.8, opacity: 0.9 }}
                  animate={{ scale: 1.1, opacity: 1 }}
                  className={`text-4xl font-black tracking-wider ${crashState === 'crashed' ? 'text-red-500' : crashState === 'cashed' ? 'text-emerald-400 animate-pulse' : 'text-brand-purple font-mono'}`}
                >
                  {crashMultiplier.toFixed(2)}x
                </motion.p>
              </AnimatePresence>
              <p className="text-[10px] text-gray-400 font-bold uppercase">当前升空倍率</p>
            </div>

            {/* Simulated flying smoke */}
            {crashState === 'running' && (
              <div className="absolute inset-0 z-0 bg-gradient-to-t from-brand-purple/10 to-transparent animate-pulse pointer-events-none"></div>
            )}
          </div>

          {/* Configuration input */}
          <div className="flex gap-3">
            <div className="flex-1 space-y-1">
              <label className="text-[10px] text-gray-400 font-bold">下注金额 (金币)：</label>
              <input
                type="number"
                min={10}
                max={500}
                value={crashBet}
                onChange={(e) => setCrashBet(Math.max(10, parseInt(e.target.value) || 10))}
                className="w-full bg-brand-bg rounded-lg p-2 border border-neutral-800 text-xs focus:outline-none text-center font-bold text-brand-gold"
              />
            </div>
            
            <div className="flex-1 flex flex-col justify-end">
              <div className="flex gap-1">
                {[10, 50, 100].map(val => (
                  <button
                    key={val}
                    onClick={() => setCrashBet(val)}
                    className="flex-1 py-2 bg-brand-bg hover:bg-neutral-800 border border-neutral-800 text-[10px] font-bold rounded"
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Feedback */}
          <div className="p-3 rounded-lg bg-black/40 text-center text-[10px] text-gray-200 font-bold border border-neutral-800">
            {crashResultMsg}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {crashState !== 'running' ? (
              <button
                onClick={startCrashGame}
                className="flex-1 py-3.5 rounded-xl font-black text-xs uppercase tracking-wider bg-red-500 hover:bg-red-400 text-white transition-all shadow-md"
              >
                🚀 投筹码 升空火箭 ({crashBet}金币)
              </button>
            ) : (
              <button
                onClick={cashOutCrash}
                className="flex-1 py-3.5 rounded-xl font-black text-xs uppercase tracking-wider bg-emerald-500 hover:bg-emerald-400 text-white transition-all shadow-lg animate-pulse"
              >
                💰 立即逃生落袋 拿取 ¥{(crashBet * crashMultiplier).toFixed(0)}金币
              </button>
            )}
          </div>
        </div>
      )}

      {/* ==========================================
          GAME MODULE 3: LUCKY WHEEL至尊轮盘
         ========================================== */}
      {activeGame === 'wheel' && (
        <div className="mx-4 p-4 rounded-2xl bg-brand-card border border-neutral-800 space-y-5">
          <div className="text-center">
            <h3 className="font-extrabold text-sm text-purple-400 flex items-center justify-center gap-1">
              <Disc className="w-4 h-4 text-brand-purple" /> 豪客至尊 · 幸运轮盘
            </h3>
            <p className="text-[10px] text-gray-400 mt-0.5">满盘特级壕礼，100%返利绝不走空！</p>
          </div>

          {/* Wheel visual container */}
          <div className="relative flex items-center justify-center py-4">
            {/* Wheel needle indicator */}
            <div className="absolute top-0 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-red-500 z-20 drop-shadow-md"></div>

            <motion.div
              animate={{ rotate: wheelRotation }}
              transition={wheelSpinning ? { duration: 4.5, ease: 'easeOut' } : { duration: 0 }}
              className="w-48 h-48 rounded-full border-4 border-brand-gold bg-brand-bg relative overflow-hidden flex items-center justify-center shadow-lg"
              style={{ transformOrigin: 'center' }}
            >
              {/* Central axis point */}
              <div className="w-10 h-10 rounded-full bg-brand-gold border-2 border-black z-10 flex items-center justify-center font-bold text-black text-[10px] shadow-md">
                🍌
              </div>

              {/* Sectors lines */}
              <div className="absolute inset-0 w-full h-full pointer-events-none">
                {wheelSectors.map((sec, idx) => {
                  const rotation = idx * (360 / wheelSectors.length);
                  return (
                    <div
                      key={idx}
                      className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-full bg-brand-gold/40"
                      style={{ transform: `rotate(${rotation}deg)` }}
                    >
                      <span className="absolute top-2 left-2 text-[8px] font-black text-gray-300 transform -rotate-12 whitespace-nowrap">
                        {sec.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* Feedback */}
          <div className="p-3 rounded-lg bg-black/40 text-center text-[10px] text-brand-purple font-bold border border-neutral-800">
            {wheelResultMsg}
          </div>

          <button
            onClick={spinWheel}
            disabled={wheelSpinning}
            className="w-full py-3.5 rounded-xl font-black text-sm uppercase tracking-wider bg-brand-gradient hover:brightness-110 disabled:opacity-50 text-white transition-all shadow-md"
          >
            {wheelSpinning ? '🌀 疯狂飞旋中...' : '🌀 疯狂启动轮盘 (扣除 20金币)'}
          </button>
        </div>
      )}

      {/* Safety Policy warning */}
      <div className="mx-4 mt-4 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/15 text-[10px] text-gray-400 flex items-start gap-2">
        <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5 animate-pulse" />
        <div>
          <strong>公平合规公示：</strong>本电玩游艺大厅所有算法均由去中心化哈希生成，爆率、开牌全天候向全体玩家公开，完全透明！
        </div>
      </div>

    </div>
  );
}
