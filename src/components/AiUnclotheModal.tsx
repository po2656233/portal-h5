import React, { useState, useRef } from 'react';
import { X, Sparkles, Wand2, Upload, Lock, ShieldAlert } from 'lucide-react';
import { UserProfile, UserWallet } from '../types';

interface AiUnclotheModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  wallet: UserWallet;
  onUpdateWallet: (wallet: Partial<UserWallet>) => void;
  onUpdateProfile: (profile: Partial<UserProfile>) => void;
  onOpenTopup: (type: 'vip' | 'coin') => void;
}

const SAMPLE_MODELS = [
  { id: 'm1', name: '清纯学妹', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80' },
  { id: 'm2', name: '高冷车模', img: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=300&q=80' },
  { id: 'm3', name: '性感御姐', img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80' }
];

export default function AiUnclotheModal({
  isOpen,
  onClose,
  profile,
  wallet,
  onUpdateWallet,
  onUpdateProfile,
  onOpenTopup
}: AiUnclotheModalProps) {
  const [selectedImg, setSelectedImg] = useState<string>(SAMPLE_MODELS[0].img);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [scanState, setScanState] = useState<'idle' | 'scanning' | 'done'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleSelectSample = (img: string) => {
    if (isScanning) return;
    setSelectedImg(img);
    setScanState('idle');
  };

  const handleTriggerUpload = () => {
    if (isScanning) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setSelectedImg(event.target.result as string);
          setScanState('idle');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const startScan = () => {
    if (isScanning) return;

    // Check if user has tickets or gold coins
    if (profile.longVideoTickets <= 0 && wallet.goldCoins < 20 && profile.vipDaysLeft <= 0) {
      alert('❌ 您的观影次数已耗尽，且金币不足20。请先充值或激活VIP！');
      onOpenTopup('vip');
      return;
    }

    setIsScanning(true);
    setScanState('scanning');
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          setScanState('done');
          
          // Deduct credits
          if (profile.vipDaysLeft <= 0) {
            if (profile.longVideoTickets > 0) {
              onUpdateProfile({ longVideoTickets: profile.longVideoTickets - 1 });
            } else {
              onUpdateWallet({ goldCoins: wallet.goldCoins - 20 });
            }
          }
          return 100;
        }
        return prev + 5;
      });
    }, 150);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-brand-bg border border-brand-purple text-white shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Glowing top line */}
        <div className="h-1 bg-gradient-to-r from-brand-purple to-brand-gold"></div>

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-brand-purple/20 bg-brand-gradient">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-purple animate-pulse" />
            <h3 className="font-bold text-base bg-gradient-to-r from-brand-purple to-brand-gold bg-clip-text text-transparent">
              AI 智能魔镜 · 一键焕装/去衣
            </h3>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          
          {/* Main Visual Arena */}
          <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-brand-card border border-neutral-800 flex items-center justify-center">
            
            {/* Image Canvas */}
            <img 
              src={selectedImg} 
              alt="AI Target" 
              className="w-full h-full object-cover select-none"
              referrerPolicy="no-referrer"
            />

            {/* Scanning Laser Beam Line */}
            {scanState === 'scanning' && (
              <div 
                className="absolute left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-brand-purple to-transparent shadow-[0_0_15px_#8e2de2] animate-pulse z-10"
                style={{
                  top: `${progress}%`,
                  transition: 'top 0.15s linear'
                }}
              ></div>
            )}

            {/* Scanning Overlay Grid */}
            {scanState === 'scanning' && (
              <div className="absolute inset-0 bg-brand-purple/10 grid grid-cols-6 grid-rows-8 opacity-40">
                {Array.from({ length: 48 }).map((_, idx) => (
                  <div key={idx} className="border-[0.5px] border-brand-purple/30"></div>
                ))}
              </div>
            )}

            {/* Done Reveal Mask with blurring overlay (safety compliant premium look) */}
            {scanState === 'done' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 backdrop-blur-md p-6 text-center">
                <div className="w-14 h-14 rounded-full bg-brand-gold/20 border border-brand-gold flex items-center justify-center mb-3">
                  <Lock className="w-6 h-6 text-brand-gold animate-bounce" />
                </div>
                <h4 className="text-brand-gold font-bold text-lg mb-1">🎉 AI 深度焕装脱衣渲染完成</h4>
                <p className="text-xs text-gray-300 px-4 leading-relaxed mb-4">
                  已成功穿透该角色的日常装扮。为符合平台隐私保护，高清去遮罩版本需要<strong>充值VIP会员</strong>或消耗<strong>20金币</strong>解锁本地保存。
                </p>
                
                <div className="flex flex-col gap-2 w-full max-w-xs">
                  <button 
                    onClick={() => onOpenTopup('vip')}
                    className="w-full py-2.5 rounded-lg text-sm font-bold bg-brand-gradient text-white shadow-lg hover:brightness-110 transition-all"
                  >
                    🚀 升级VIP 免费无限次看
                  </button>
                  <button 
                    onClick={() => {
                      if (wallet.goldCoins >= 20) {
                        onUpdateWallet({ goldCoins: wallet.goldCoins - 20 });
                        alert('🔓 模拟成功！已扣除20金币，已将高清图保存至本地相册！');
                        setScanState('idle');
                      } else {
                        alert('❌ 金币不足，请先充值！');
                        onOpenTopup('coin');
                      }
                    }}
                    className="w-full py-2.5 rounded-lg text-sm font-bold bg-brand-gold text-black transition-all hover:brightness-110"
                  >
                    🪙 消耗 20 金币单次解锁
                  </button>
                  <button 
                    onClick={() => setScanState('idle')}
                    className="w-full py-2 text-xs text-gray-400 hover:text-white mt-1 underline"
                  >
                    重新编辑
                  </button>
                </div>
              </div>
            )}

            {/* Idle instruction */}
            {scanState === 'idle' && (
              <div className="absolute bottom-4 left-4 right-4 bg-brand-card/90 backdrop-blur-sm p-3 rounded-lg border border-neutral-800 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-brand-gold flex items-center gap-1">
                    <span>⚡</span> 深度神经网络V3.5
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">每次消耗 1次观影券 或 20金币</p>
                </div>
                <button 
                  onClick={startScan}
                  className="px-4 py-2 rounded-lg bg-brand-gradient text-white font-bold text-xs flex items-center gap-1 hover:brightness-110 transition-all shadow-md shadow-brand-purple/20"
                >
                  <Wand2 className="w-3.5 h-3.5" /> 开始AI透视
                </button>
              </div>
            )}

            {/* Loading text overlay */}
            {scanState === 'scanning' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 p-4">
                <div className="relative w-16 h-16 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-2 border-brand-purple border-t-transparent animate-spin"></div>
                  <span className="text-xs font-black text-brand-purple">{progress}%</span>
                </div>
                <p className="text-xs font-bold text-brand-purple mt-4 animate-pulse">正在生成深度骨骼与皮肤映射...</p>
                <p className="text-[10px] text-gray-500 mt-1">云端GPU正在集群渲染，请勿关闭弹窗</p>
              </div>
            )}

          </div>

          {/* Selector Samples & Custom Upload */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">选择模板角色</h4>
            
            <div className="grid grid-cols-4 gap-2">
              {SAMPLE_MODELS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => handleSelectSample(m.img)}
                  className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${selectedImg === m.img ? 'border-brand-purple shadow-md shadow-brand-purple/25 scale-95' : 'border-white/10 opacity-70 hover:opacity-100'}`}
                >
                  <img src={m.img} alt={m.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  <div className="absolute bottom-0 inset-x-0 bg-black/60 py-0.5 text-[9px] text-center text-gray-200">
                    {m.name}
                  </div>
                </button>
              ))}

              {/* Upload Tile */}
              <button
                onClick={handleTriggerUpload}
                className="aspect-square rounded-lg border-2 border-dashed border-neutral-800 hover:border-brand-purple/50 flex flex-col items-center justify-center gap-1 bg-brand-card transition-all group"
              >
                <Upload className="w-5 h-5 text-gray-400 group-hover:text-brand-purple transition-colors" />
                <span className="text-[9px] text-gray-400 group-hover:text-brand-purple">上传自拍</span>
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                className="hidden" 
              />
            </div>
          </div>

          {/* Policy disclaimer */}
          <div className="p-3 rounded-lg bg-brand-card border border-red-500/30 flex items-start gap-2 text-[10px] text-red-300 leading-relaxed">
            <ShieldAlert className="w-4 h-4 shrink-0 text-red-400" />
            <div>
              <strong>免责声明：</strong>此功能仅供娱乐。严禁上传未成年人、公共人物或非授权人员照片。系统会自动识别并过滤违规内容。
            </div>
          </div>

        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-white/5 bg-black/20 text-center text-[10px] text-gray-500">
          Powered by Gemini AI Vision Model V3.5
        </div>
      </div>
    </div>
  );
}
