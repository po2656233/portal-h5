import React, { useState } from 'react';
import { UserProfile, UserWallet } from '../types';
import { X, ShieldCheck, DollarSign, CreditCard, Award } from 'lucide-react';

interface TopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  tabType: 'vip' | 'coin' | 'redeem' | 'transfer';
  profile: UserProfile;
  wallet: UserWallet;
  onUpdateWallet: (wallet: Partial<UserWallet>) => void;
  onUpdateProfile: (profile: Partial<UserProfile>) => void;
}

export default function TopUpModal({
  isOpen,
  onClose,
  tabType,
  profile,
  wallet,
  onUpdateWallet,
  onUpdateProfile
}: TopUpModalProps) {
  const [activeSubTab, setActiveSubTab] = useState<'usdt' | 'bank' | 'alipay'>('usdt');
  const [chargeAmount, setChargeAmount] = useState<number>(100);
  const [transferAmount, setTransferAmount] = useState<string>('');
  const [redeemCode, setRedeemCode] = useState<string>('');
  const [notification, setNotification] = useState<string | null>(null);

  if (!isOpen) return null;

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleVIPPurchase = (plan: { name: string; cost: number; days: number; desc: string }) => {
    if (wallet.mainBalance < plan.cost) {
      showNotification('❌ 主钱包余额不足，请先充值余额！');
      return;
    }
    onUpdateWallet({ mainBalance: wallet.mainBalance - plan.cost });
    const currentDays = profile.vipDaysLeft;
    const newDays = currentDays + plan.days;
    const today = new Date();
    today.setDate(today.getDate() + newDays);
    const dateStr = today.toISOString().split('T')[0];

    onUpdateProfile({
      vipDaysLeft: newDays,
      vipExpiry: dateStr,
      longVideoTickets: profile.longVideoTickets + (plan.days * 2), // VIP bonus tickets
      shortVideoTickets: profile.shortVideoTickets + (plan.days * 5)
    });
    showNotification(`🎉 成功购买 ${plan.name}！观影权益已立即生效！`);
  };

  const handleChargeBalance = () => {
    if (chargeAmount <= 0) {
      showNotification('❌ 请输入有效的充值金额！');
      return;
    }
    // Simulation
    onUpdateWallet({ mainBalance: wallet.mainBalance + chargeAmount });
    showNotification(`💰 模拟充值成功！已向主账户注入 ￥${chargeAmount}`);
  };

  const handleBuyCoins = (pkg: { name: string; cost: number; coins: number }) => {
    if (wallet.mainBalance < pkg.cost) {
      showNotification('❌ 余额不足，请先充值主账户！');
      return;
    }
    onUpdateWallet({
      mainBalance: wallet.mainBalance - pkg.cost,
      goldCoins: wallet.goldCoins + pkg.coins
    });
    showNotification(`🪙 成功购买 ${pkg.name}，获得 ${pkg.coins} 金币！`);
  };

  const handleTransfer = (direction: 'toGame' | 'toMain') => {
    const amount = parseFloat(transferAmount);
    if (isNaN(amount) || amount <= 0) {
      showNotification('❌ 请输入有效的转换额度！');
      return;
    }

    if (direction === 'toGame') {
      if (wallet.mainBalance < amount) {
        showNotification('❌ 主钱包余额不足，无法转入游戏！');
        return;
      }
      onUpdateWallet({
        mainBalance: wallet.mainBalance - amount,
        gameBalance: wallet.gameBalance + amount
      });
      showNotification(`🔄 转换成功：￥${amount} 已转入游戏钱包`);
    } else {
      if (wallet.gameBalance < amount) {
        showNotification('❌ 游戏钱包余额不足，无法转出！');
        return;
      }
      onUpdateWallet({
        mainBalance: wallet.mainBalance + amount,
        gameBalance: wallet.gameBalance - amount
      });
      showNotification(`🔄 转换成功：￥${amount} 已转回主账户`);
    }
    setTransferAmount('');
  };

  const handleRedeem = () => {
    const trimmed = redeemCode.trim().toUpperCase();
    if (!trimmed) {
      showNotification('❌ 请输入充值码/邀请码！');
      return;
    }

    if (trimmed.startsWith('VIP') || trimmed === 'INVITE666') {
      onUpdateProfile({
        vipDaysLeft: profile.vipDaysLeft + 7,
        vipExpiry: '2026-07-23', // Demo hardcode or progressive
        longVideoTickets: profile.longVideoTickets + 10,
        shortVideoTickets: profile.shortVideoTickets + 25
      });
      onUpdateWallet({ mainBalance: wallet.mainBalance + 50 });
      showNotification('🎁 兑换成功！赠送7天尊贵VIP体验 + 50元现金 + 观影次数！');
    } else {
      showNotification('❌ 无效的兑换码或邀请码，请核对后再试！');
    }
    setRedeemCode('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-brand-bg border border-brand-purple/30 text-white shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-brand-purple/20 bg-brand-gradient">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-brand-gold" />
            <h3 className="font-bold text-lg text-brand-gold">
              {tabType === 'vip' && '尊贵会员中心'}
              {tabType === 'coin' && '资产充值中心'}
              {tabType === 'redeem' && '兑换会员 / 激活码'}
              {tabType === 'transfer' && '主副钱包额度转换'}
            </h3>
          </div>
          <button 
            id="close-topup-modal"
            onClick={onClose} 
            className="p-1 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Status Ticker (Inside Modal) */}
        {notification && (
          <div className="absolute top-14 left-4 right-4 z-50 p-3 rounded-lg text-center font-medium text-sm animate-bounce shadow-lg bg-brand-purple text-white border border-brand-purple/30">
            {notification}
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          
          {/* Quick Balance Preview */}
          <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-brand-card border border-neutral-800 text-xs">
            <div>
              <p className="text-gray-400">主钱包余额</p>
              <p className="text-lg font-bold text-emerald-400">￥{wallet.mainBalance.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-gray-400">游戏副钱包</p>
              <p className="text-lg font-bold text-blue-400">￥{wallet.gameBalance.toFixed(2)}</p>
            </div>
            <div className="col-span-2 border-t border-neutral-800 pt-2 mt-1 flex justify-between">
              <span className="text-gray-400">金币: <span className="text-brand-gold font-bold">{wallet.goldCoins}</span></span>
              <span className="text-gray-400">金豆: <span className="text-pink-400 font-bold">{wallet.goldBeans}</span></span>
            </div>
          </div>

          {/* TAB 1: VIP PURCHASE */}
          {tabType === 'vip' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-300">购买VIP尊享全站长短视频无限次观看、专属超清线路</p>
              
              <div className="space-y-3">
                {[
                  { name: '体验周卡 (7天)', cost: 58, days: 7, desc: '加送20次电影券，畅享超清' },
                  { name: '黄金月卡 (30天)', cost: 168, days: 30, desc: '无限观影，加送60次短视频券' },
                  { name: '尊奢年卡 (365天)', cost: 588, days: 365, desc: '永久全站畅享，赠送100金币' }
                ].map((plan, i) => (
                  <div 
                    key={i}
                    className="flex items-center justify-between p-4 rounded-xl border border-brand-purple/20 bg-brand-card hover:border-brand-purple/50 transition-all cursor-pointer group"
                    onClick={() => handleVIPPurchase(plan)}
                  >
                    <div>
                      <h4 className="font-bold text-brand-gold group-hover:text-amber-200">{plan.name}</h4>
                      <p className="text-xs text-gray-400 mt-1">{plan.desc}</p>
                    </div>
                    <div className="text-right">
                      <span className="block text-lg font-black text-brand-gold">￥{plan.cost}</span>
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] bg-brand-purple/20 text-brand-gold mt-1">立即解锁</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: COINS & CHARGES */}
          {tabType === 'coin' && (
            <div className="space-y-5">
              {/* Payment Methods */}
              <div className="flex bg-brand-bg p-1 rounded-lg gap-1 text-xs border border-neutral-800">
                <button 
                  onClick={() => setActiveSubTab('usdt')}
                  className={`flex-1 py-2 rounded-md font-medium flex items-center justify-center gap-1 transition-all ${activeSubTab === 'usdt' ? 'bg-brand-gradient text-white shadow' : 'text-gray-400 hover:text-white'}`}
                >
                  <DollarSign className="w-3.5 h-3.5" /> USDT (推荐)
                </button>
                <button 
                  onClick={() => setActiveSubTab('bank')}
                  className={`flex-1 py-2 rounded-md font-medium flex items-center justify-center gap-1 transition-all ${activeSubTab === 'bank' ? 'bg-brand-gradient text-white shadow' : 'text-gray-400 hover:text-white'}`}
                >
                  <CreditCard className="w-3.5 h-3.5" /> 银联卡
                </button>
              </div>

              {/* USDT Payment Interface */}
              {activeSubTab === 'usdt' && (
                <div className="p-4 rounded-xl bg-brand-card border border-brand-purple/20 space-y-3">
                  <div className="text-xs space-y-1">
                    <p className="text-brand-purple">⚡ 当前汇率: 1 USDT = 7.2 RMB</p>
                    <p className="text-gray-400">支付完成后约5秒自动到账。USDT充值加赠3%余额！</p>
                  </div>
                  <div className="space-y-2 pt-1">
                    <label className="text-xs text-gray-300 font-medium">快捷充值金额</label>
                    <div className="grid grid-cols-4 gap-2">
                      {[50, 100, 300, 500].map((amt) => (
                        <button 
                          key={amt}
                          onClick={() => setChargeAmount(amt)}
                          className={`py-2 text-sm font-bold rounded-lg border transition-all ${chargeAmount === amt ? 'bg-brand-gold text-black border-brand-gold' : 'bg-brand-bg border-neutral-800 hover:bg-white/10'}`}
                        >
                          ￥{amt}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button 
                    onClick={handleChargeBalance}
                    className="w-full py-3 rounded-xl font-bold bg-brand-gold text-black shadow-lg shadow-brand-gold/20 transition-all flex items-center justify-center gap-2 mt-4"
                  >
                    <ShieldCheck className="w-5 h-5" /> 立即模拟充值余额
                  </button>
                </div>
              )}

              {/* Bank Card Payment Interface */}
              {activeSubTab === 'bank' && (
                <div className="p-4 rounded-xl bg-brand-card border border-neutral-800 space-y-3">
                  <p className="text-xs text-gray-400">安全银联通道：无需开通网银，支持大额交易。</p>
                  <div className="space-y-2">
                    <label className="text-xs text-gray-300">手动输入任意充值额度(RMB)</label>
                    <input 
                      type="number" 
                      placeholder="最少10元起充" 
                      value={chargeAmount}
                      onChange={(e) => setChargeAmount(Math.max(10, parseInt(e.target.value) || 0))}
                      className="w-full px-4 py-3 rounded-xl bg-brand-bg border border-neutral-800 focus:border-brand-purple focus:outline-none text-white font-bold"
                    />
                  </div>
                  <button 
                    onClick={handleChargeBalance}
                    className="w-full py-3 rounded-xl font-bold bg-brand-gradient text-white shadow-lg shadow-brand-purple/20 transition-all mt-4 animate-pulse"
                  >
                    银联安全通道模拟支付
                  </button>
                </div>
              )}

              {/* Buy Coins Matrix (using main Balance) */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-brand-gold tracking-wider uppercase">🪙 使用主余额兑换游戏金币</h4>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { name: '100金币', cost: 10, coins: 100 },
                    { name: '550金币 (赠)', cost: 50, coins: 550 },
                    { name: '1200金币 (特)', cost: 100, coins: 1200 },
                    { name: '6500金币 (大额)', cost: 500, coins: 6500 }
                  ].map((pkg, i) => (
                    <button 
                      key={i}
                      onClick={() => handleBuyCoins(pkg)}
                      className="p-3 text-left rounded-xl border border-neutral-800 bg-brand-card hover:border-brand-gold/40 transition-all"
                    >
                      <span className="block font-bold text-brand-gold text-sm">{pkg.name}</span>
                      <span className="text-[11px] text-gray-400">消耗余额：￥{pkg.cost}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: REDEEM CODE */}
          {tabType === 'redeem' && (
            <div className="space-y-4">
              <p className="text-xs text-gray-400">
                输入您的邀请优惠码或充值激活码，即可直接解锁对应尊贵会员套餐或现金奖励！
              </p>
              <div className="p-4 rounded-xl bg-brand-card border border-neutral-800 space-y-3">
                <input 
                  type="text" 
                  placeholder="请输入激活码 (例: VIP666 或 INVITE666)"
                  value={redeemCode}
                  onChange={(e) => setRedeemCode(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-brand-bg border border-neutral-800 focus:border-brand-gold focus:outline-none text-white font-mono uppercase tracking-wider text-center"
                />
                <button 
                  onClick={handleRedeem}
                  className="w-full py-3 rounded-xl font-bold bg-brand-gradient text-white hover:opacity-90 shadow-md shadow-brand-purple/20 transition-all"
                >
                  立即校验并激活
                </button>
              </div>
              <div className="text-[11px] text-gray-500 text-center">
                温馨提示：邀请好友注册，获取专属邀请码，双方均可获赠7天黄金VIP！
              </div>
            </div>
          )}

          {/* TAB 4: WALLET TRANSFER */}
          {tabType === 'transfer' && (
            <div className="space-y-5">
              <p className="text-xs text-gray-300 leading-relaxed">
                部分游戏场馆与棋牌对决采用独立的<strong>“游戏钱包”</strong>计费，您需要将主钱包余额一键转换至游戏钱包方可参玩。
              </p>

              <div className="p-4 rounded-xl bg-brand-card border border-neutral-800 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs text-gray-400">转换金额 (￥)</label>
                  <input 
                    type="number" 
                    placeholder="最低转换￥10" 
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-brand-bg border border-neutral-800 focus:border-brand-purple focus:outline-none text-white font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button 
                    onClick={() => handleTransfer('toGame')}
                    className="py-3 rounded-xl font-bold bg-brand-gradient text-white text-xs hover:opacity-95 shadow transition-all"
                  >
                    💸 主账户 ➔ 游戏钱包
                  </button>
                  <button 
                    onClick={() => handleTransfer('toMain')}
                    className="py-3 rounded-xl font-bold bg-brand-gradient text-white text-xs hover:opacity-95 shadow transition-all"
                  >
                    💰 游戏钱包 ➔ 主账户
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-[11px] text-amber-300">
                <span>⚡</span>
                <span>棋牌离开房间后，副钱包金额会自动保存，支持随时一键回转至主钱包！</span>
              </div>
            </div>
          )}

        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-white/5 bg-black/20 text-center text-[10px] text-gray-500 flex items-center justify-center gap-1">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          256位端到端金融通道加密 · 安全交易护航
        </div>
      </div>
    </div>
  );
}
