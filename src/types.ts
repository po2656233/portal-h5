export interface UserWallet {
  mainBalance: number;    // 主账户余额 (RMB/USDT)
  gameBalance: number;    // 游戏钱包额度
  goldCoins: number;      // 金币
  goldBeans: number;      // 金豆
}

export interface UserProfile {
  isLoggedIn: boolean;
  username: string;
  avatar: string;
  vipExpiry: string;      // VIP到期时间 (e.g. '2026-08-16' or '已过期' or '未开通')
  vipDaysLeft: number;    // 剩余天数
  longVideoTickets: number; // 长视频剩余观影次数
  shortVideoTickets: number; // 短视频剩余观影次数
  inviteCode: string;
}

export interface VideoComment {
  id: string;
  username: string;
  avatar: string;
  content: string;
  time: string;
  likes: number;
  replies?: VideoComment[];
}

export interface VideoItem {
  id: string;
  title: string;
  category: string;
  coverUrl: string;
  gifUrl: string;          // GIF动态预览
  videoUrl: string;        // 模拟视频源
  views: number;
  favorites: number;
  duration: string;
  tags: string[];
  isVipOnly: boolean;
}

export interface ShortVideoItem extends VideoItem {
  likes: number;
  commentsCount: number;
  comments: VideoComment[];
  uploader: {
    name: string;
    avatar: string;
    isFollowed: boolean;
  };
}

export interface GameItem {
  id: string;
  name: string;
  category: 'activity' | 'hot' | 'recent' | 'video' | 'sports' | 'all' | 'slots' | 'fishing' | 'lottery';
  icon: string;
  playersCount: number;
  jackpot?: number;
  description: string;
  isHot: boolean;
}

export interface ChessGameItem {
  id: string;
  name: string;
  category: string;
  icon: string;
  onlineCount: number;
  minLimit: number;
  description: string;
}

export interface WinnerAnnouncement {
  id: string;
  username: string;
  gameName: string;
  prize: number;
  time: string;
}
