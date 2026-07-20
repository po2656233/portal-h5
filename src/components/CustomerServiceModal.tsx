import React, { useState, useRef, useEffect } from 'react';
import { Send, User, ShieldCheck, Smile, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Message {
  id: string;
  sender: 'user' | 'support';
  text: string;
  time: string;
}

interface CustomerServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
}

export default function CustomerServiceModal({
  isOpen,
  onClose,
  username
}: CustomerServiceModalProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      sender: 'support',
      text: `欢迎来到某某视频 24小时金牌专属客服中心！我是您的老司机秘书【小美】。👩‍💼\n\n请问今天有什么可以帮您的呢？您可以咨询：\n1️⃣ 充值后未到账怎么办？\n2️⃣ 如何升级永久无限看VIP？\n3️⃣ 游戏钱包额度如何转换？\n4️⃣ 推广好友如何抽取高达1.2%无上限佣金？`,
      time: '刚刚'
    }
  ]);
  const [inputText, setInputText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: inputText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    const question = inputText.trim();
    setInputText('');
    setIsTyping(true);

    // Simulate smart support replies
    setTimeout(() => {
      setIsTyping(false);
      let replyText = '';

      if (question.includes('充值') || question.includes('到账') || question.includes('钱')) {
        replyText = `💰 **【充值未到账处理指南】**\n\n请您放心，某某视频采用云端数字加密双通道入账。由于网络延迟或区块链拥堵，部分订单可能需要 1-3 分钟确认。\n\n请提供您的**充值单号** or **支付凭证截图**发给小美，小美会立刻为您申请极速双倍补单！`;
      } else if (question.includes('VIP') || question.includes('会员') || question.includes('看')) {
        replyText = `👑 **【如何升级至尊无限看 VIP】**\n\n目前某某视频正举行「老司机盛夏狂欢特惠」！\n\n点击【我的】-【观影权益卡片】或首页的【充值】按钮：\n- 💎 **30天 VIP** 限时 ￥58 (原价 ￥118)\n- 🏆 **终身至尊 VIP** 限时 ￥198 (永久无限次数，送200金币)\n\n购买后全站视频即刻解锁，更有同城约玩等隐秘通道限时免费开启！`;
      } else if (question.includes('转换') || question.includes('余额') || question.includes('游戏')) {
        replyText = `🔄 **【游戏额度转换指引】**\n\n在【游戏】版块：\n1. 点击头部的 **[一键钱包转换]** / **[转换]** 按钮。\n2. 系统会将您的主钱包余额与游戏副钱包进行 1:1 双向极速转换。\n3. 注意：入场最低游戏钱包额度一般为 ￥5/￥10 起。余额不足时请在充值中心选择「金币充值」哦！`;
      } else if (question.includes('推广') || question.includes('邀请') || question.includes('佣金')) {
        replyText = `🎁 **【推广躺赚百万计划】**\n\n在【我的】页面中分享您的专属邀请码 **BANANA66** 给身边的老司机或狼友：\n- 1️⃣ 绑定后，好友充值您将获得 **40% 现金高额返佣**！\n- 2️⃣ 好友下注玩益智娱乐游戏，您将躺赚 **1.2% 流水无上限抽水**！\n\n佣金每日 00:00 自动发放至主钱包，支持 1 元下分提现，真实靠谱！`;
      } else {
        replyText = `👉 收到您的消息啦！小美已经将您的问题反馈给后台专员：\n\n“*${question}*”\n\n专员正在调取您的账号数据，通常会在 1 分钟内直接在本窗口为您解答。您可以先尝试在充值提款界面进行相应操作，或签到免费领取金币福利！`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `s-${Date.now()}`,
          sender: 'support',
          text: replyText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 1200);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 30 }}
            className="w-full max-w-md h-[580px] bg-neutral-950 rounded-3xl border border-neutral-800 flex flex-col overflow-hidden text-white shadow-2xl"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-brand-purple to-purple-800 p-4 flex items-center justify-between border-b border-neutral-800">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80" 
                      alt="客服小美" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-neutral-950"></span>
                </div>
                <div>
                  <h3 className="font-extrabold text-sm flex items-center gap-1">
                    金牌客服 · 小美
                    <span className="text-[8px] bg-brand-gold text-black px-1.5 py-0.2 rounded-sm font-black">24H</span>
                  </h3>
                  <p className="text-[10px] text-purple-200">正在为您提供一对一尊享服务</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="text-white/60 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full text-xs transition-colors"
              >
                关闭
              </button>
            </div>

            {/* Info Tip */}
            <div className="bg-neutral-900/60 px-4 py-2 border-b border-neutral-800/60 flex items-center gap-1.5 text-[9px] text-gray-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>智能云盾多端加密技术，保障老司机隐私与账户交易绝对安全</span>
            </div>

            {/* Messages body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs ${msg.sender === 'user' ? 'bg-brand-purple text-white' : 'bg-neutral-800 text-brand-gold'}`}>
                    {msg.sender === 'user' ? (
                      <User className="w-4 h-4" />
                    ) : (
                      <img 
                        src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80" 
                        alt="小美" 
                        className="w-full h-full object-cover rounded-full"
                        referrerPolicy="no-referrer"
                      />
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-500 font-bold">
                        {msg.sender === 'user' ? username : '客服小美'}
                      </span>
                      <span className="text-[8px] text-gray-600 font-normal">{msg.time}</span>
                    </div>
                    <div className={`p-3 rounded-2xl text-xs leading-relaxed whitespace-pre-line ${msg.sender === 'user' ? 'bg-brand-purple text-white rounded-tr-none' : 'bg-neutral-900 text-gray-100 rounded-tl-none border border-neutral-800/60'}`}>
                      {msg.text}
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-3 max-w-[85%]">
                  <div className="w-8 h-8 rounded-full bg-neutral-800 shrink-0 flex items-center justify-center text-xs">
                    <img 
                      src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80" 
                      alt="小美" 
                      className="w-full h-full object-cover rounded-full"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-gray-500 font-bold">客服小美</span>
                    <div className="px-4 py-2.5 rounded-2xl bg-neutral-900 border border-neutral-800/60 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-brand-gold rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-brand-gold rounded-full animate-bounce delay-100"></span>
                      <span className="w-1.5 h-1.5 bg-brand-gold rounded-full animate-bounce delay-200"></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick action chips */}
            <div className="px-4 py-2 bg-neutral-900/40 border-t border-neutral-900 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
              {[
                '充值没到账',
                '如何无限看VIP',
                '怎么额度转换',
                '推广合伙人赚钱'
              ].map((chip) => (
                <button
                  key={chip}
                  onClick={() => {
                    setInputText(chip);
                  }}
                  className="text-[9px] bg-neutral-900 border border-neutral-800 hover:border-brand-purple hover:text-brand-purple text-gray-300 px-2.5 py-1 rounded-full whitespace-nowrap transition-colors duration-200"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Input form */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-neutral-900 bg-neutral-950 flex items-center gap-2 shrink-0">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="老司机，有什么烦恼？随时问小美..."
                className="flex-1 bg-neutral-900 border border-neutral-800 rounded-full px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-brand-purple focus:border-brand-purple transition-all"
              />
              <button 
                type="submit"
                className="p-2.5 rounded-full bg-brand-purple hover:scale-105 active:scale-95 text-white transition-all shadow-md"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
