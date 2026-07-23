/**
 * Banana Studio / 香蕉视频 API Service Definition (上线级别接口适配器)
 * 
 * 本文件定义了前端与后端服务器交互的所有内容数据接口。
 * 服务器开发人员只需在此处实现真实的 axios/fetch 请求，即可将本应用完全接入后端生产数据库。
 */

import { VideoItem, ShortVideoItem, GameItem, ChessGameItem, WinnerAnnouncement, UserWallet, UserProfile } from './types';
import { MOCK_LONG_VIDEOS, MOCK_SHORT_VIDEOS, MOCK_GAME_ITEMS, MOCK_CHESS_GAMES, MOCK_WINNERS } from './data';

// 接口响应统一包装格式
export interface ApiResponse<T> {
  code: number; // 200: 成功, 401: 未登录, 403: 余额不足/权限限制, 500: 服务器错误
  message: string;
  data: T;
}

// Helper to perform HTTP request if a custom domain is configured, otherwise fallback to local mocks
async function makeRequest<T>(path: string, options: RequestInit = {}): Promise<T | null> {
  const domain = localStorage.getItem('banana_api_domain') || '';
  const referer = localStorage.getItem('banana_api_referer') || '';
  
  if (!domain) {
    return null; // Return null so the caller knows to use local mock data
  }
  
  try {
    const cleanDomain = domain.endsWith('/') ? domain.slice(0, -1) : domain;
    const url = `${cleanDomain}${path.startsWith('/') ? path : '/' + path}`;
    
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    } as Record<string, string>;
    
    if (referer) {
      headers['Referer'] = referer;
      headers['X-Referer'] = referer;
      headers['X-Target-Referer'] = referer;
    }
    
    const response = await fetch(url, {
      ...options,
      headers,
    });
    
    if (!response.ok) {
      console.warn(`API returned status ${response.status} for ${path}. Falling back to mock data.`);
      return null;
    }
    
    const json = await response.json();
    return json as T;
  } catch (error) {
    console.error(`Error requesting ${path} from ${domain}:`, error);
    return null; // Fallback to local mock data
  }
}

export const BananaApiService = {
  // ==========================================
  // 1. 用户与钱包相关接口 (User & Wallet APIs)
  // ==========================================

  /**
   * 获取用户个人资料
   * API: GET /api/user/profile
   */
  async getUserProfile(): Promise<ApiResponse<UserProfile>> {
    const res = await makeRequest<ApiResponse<UserProfile>>('/api/user/profile');
    if (res) return res;
    // 模拟服务端延时
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      code: 200,
      message: '获取资料成功',
      data: {
        isLoggedIn: true,
        username: '水晶晶老司机_666',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        vipExpiry: '2026-08-20',
        vipDaysLeft: 35,
        longVideoTickets: 12,
        shortVideoTickets: 28,
        inviteCode: 'BANANA66'
      }
    };
  },

  /**
   * 更新用户资料 (如修改头像、昵称等)
   * API: POST /api/user/profile/update
   */
  async updateUserProfile(fields: Partial<UserProfile>): Promise<ApiResponse<UserProfile>> {
    const res = await makeRequest<ApiResponse<UserProfile>>('/api/user/profile/update', {
      method: 'POST',
      body: JSON.stringify(fields)
    });
    if (res) return res;
    return {
      code: 200,
      message: '资料更新成功',
      data: fields as UserProfile
    };
  },

  /**
   * 获取用户钱包余额
   * API: GET /api/user/wallet
   */
  async getUserWallet(): Promise<ApiResponse<UserWallet>> {
    const res = await makeRequest<ApiResponse<UserWallet>>('/api/user/wallet');
    if (res) return res;
    return {
      code: 200,
      message: '获取余额成功',
      data: {
        mainBalance: 128.50,
        gameBalance: 50.00,
        goldCoins: 80,
        goldBeans: 1500
      }
    };
  },

  /**
   * 模拟资金充值 (支持USDT & 银行卡)
   * API: POST /api/wallet/deposit
   */
  async depositFunds(amount: number, method: 'usdt' | 'bank'): Promise<ApiResponse<{ newBalance: number; bonus: number }>> {
    const res = await makeRequest<ApiResponse<{ newBalance: number; bonus: number }>>('/api/wallet/deposit', {
      method: 'POST',
      body: JSON.stringify({ amount, method })
    });
    if (res) return res;
    await new Promise(resolve => setTimeout(resolve, 800));
    const bonus = method === 'usdt' ? amount * 0.03 : 0; // USDT加赠3%
    return {
      code: 200,
      message: `模拟充值成功！已入账 ¥${amount.toFixed(2)}` + (bonus > 0 ? `，USDT特惠加赠 ¥${bonus.toFixed(2)}` : ''),
      data: {
        newBalance: amount + bonus,
        bonus: bonus
      }
    };
  },

  /**
   * 一键额度转换 (主钱包 <-> 游戏副钱包)
   * API: POST /api/wallet/transfer
   */
  async transferFunds(amount: number, direction: 'toGame' | 'toMain'): Promise<ApiResponse<{ mainBalance: number; gameBalance: number }>> {
    const res = await makeRequest<ApiResponse<{ mainBalance: number; gameBalance: number }>>('/api/wallet/transfer', {
      method: 'POST',
      body: JSON.stringify({ amount, direction })
    });
    if (res) return res;
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      code: 200,
      message: '额度转换成功',
      data: {
        mainBalance: direction === 'toGame' ? -amount : amount,
        gameBalance: direction === 'toGame' ? amount : -amount
      }
    };
  },

  /**
   * 充值卡密/邀请码激活兑换
   * API: POST /api/wallet/redeem
   */
  async redeemCode(code: string): Promise<ApiResponse<{ rewardType: 'vip' | 'coin'; rewardValue: number; message: string }>> {
    const res = await makeRequest<ApiResponse<{ rewardType: 'vip' | 'coin'; rewardValue: number; message: string }>>('/api/wallet/redeem', {
      method: 'POST',
      body: JSON.stringify({ code })
    });
    if (res) return res;
    await new Promise(resolve => setTimeout(resolve, 600));
    const normalized = code.trim().toUpperCase();
    if (normalized === 'VIP666') {
      return {
        code: 200,
        message: '恭喜！成功激活 30天尊贵超级黄金VIP会员 特权！',
        data: { rewardType: 'vip', rewardValue: 30, message: '30天黄金VIP' }
      };
    } else if (normalized === 'INVITE666') {
      return {
        code: 200,
        message: '恭喜！成功激活 邀请特惠包：赠送 100 游戏金币！',
        data: { rewardType: 'coin', rewardValue: 100, message: '100游戏金币' }
      };
    } else {
      return {
        code: 400,
        message: '卡密激活码不存在或已被使用，请检查拼写或联系在线客服。',
        data: { rewardType: 'coin', rewardValue: 0, message: '' }
      };
    }
  },


  // ==========================================
  // 2. 长视频接口 (Long Video APIs)
  // ==========================================

  /**
   * 获取所有长视频分类
   * API: GET /api/video/long/categories
   */
  async getLongVideoCategories(): Promise<ApiResponse<string[]>> {
    const res = await makeRequest<ApiResponse<string[]>>('/api/video/long/categories');
    if (res) return res;
    return {
      code: 200,
      message: '成功',
      data: ['水晶晶头条', '水晶晶短剧', '制服诱惑', '清纯少女', '无码视频', '自拍偷拍', '网红主播', '海外精品']
    };
  },

  /**
   * 分页获取长视频列表 (带过滤和多维度排序)
   * API: GET /api/video/long/list
   */
  async getLongVideos(params: {
    category?: string;
    region?: string;
    year?: string;
    resolution?: string;
    length?: string;
    censored?: string;
    subtitle?: string;
    sort?: string;
    search?: string;
  }): Promise<ApiResponse<VideoItem[]>> {
    // Convert params to query string
    const queryParts = [];
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        queryParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
      }
    }
    const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
    const res = await makeRequest<ApiResponse<VideoItem[]>>(`/api/video/long/list${queryString}`);
    if (res) return res;

    // 模拟复杂的后台多条件数据库查询
    let list = [...MOCK_LONG_VIDEOS];

    // 针对用户对分类的定制，扩展一些视频丰富度
    if (params.search) {
      const q = params.search.toLowerCase();
      list = list.filter(v => v.title.toLowerCase().includes(q) || v.tags.some(t => t.includes(q)));
    }

    if (params.category && params.category !== '全部类型') {
      list = list.filter(v => v.category === params.category);
    }

    // 模拟服务端的多维参数筛选
    if (params.censored && params.censored !== '全部类型') {
      // 模拟有码无码数据过滤
      if (params.censored === '无码') {
        list = list.filter(v => v.title.includes('无码') || v.tags.includes('无码') || v.id === 'l5' || v.id === 'l1');
      } else {
        list = list.filter(v => !v.title.includes('无码'));
      }
    }

    // 排序逻辑
    if (params.sort) {
      if (params.sort === '最多播放') {
        list.sort((a, b) => b.views - a.views);
      } else if (params.sort === '最高评分' || params.sort === '最多好评') {
        list.sort((a, b) => b.favorites - a.favorites);
      }
    }

    return {
      code: 200,
      message: '成功',
      data: list
    };
  },


  // ==========================================
  // 3. 短视频接口 (Short Video APIs)
  // ==========================================

  /**
   * 获取推荐短视频流 (全屏播放页)
   * API: GET /api/video/short/recommend
   */
  async getRecommendShortVideos(): Promise<ApiResponse<ShortVideoItem[]>> {
    const res = await makeRequest<ApiResponse<ShortVideoItem[]>>('/api/video/short/recommend');
    if (res) return res;
    return {
      code: 200,
      message: '成功',
      data: MOCK_SHORT_VIDEOS
    };
  },

  /**
   * 获取精选短视频数据 (精选板块 - Image 5 对应)
   * API: GET /api/video/short/curated
   */
  async getCuratedShortVideos(): Promise<ApiResponse<{
    hotVideos: ShortVideoItem[];       // 热门视频 (NO.1-NO.4)
    latestVideos: ShortVideoItem[];    // 最新视频
    amazingDiscoveries: ShortVideoItem[]; // 精彩发现
  }>> {
    const res = await makeRequest<ApiResponse<{
      hotVideos: ShortVideoItem[];
      latestVideos: ShortVideoItem[];
      amazingDiscoveries: ShortVideoItem[];
    }>>('/api/video/short/curated');
    if (res) return res;
    // 制造足够多的高画质短视频数据填充精选
    const all = [...MOCK_SHORT_VIDEOS];
    
    // 衍生数据满足数量
    const hotVideos: ShortVideoItem[] = [
      {
        ...all[0],
        id: 'curated_hot_1',
        title: '高颜值萝莉美少女 贴身互动诱惑 #清纯校花 #黑丝',
        coverUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=500&q=80',
        likes: 189000,
      },
      {
        ...all[1],
        id: 'curated_hot_2',
        title: '36D乖巧小女友，一对豪乳大又软，温柔蜜桃极致娇嗔',
        coverUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=500&q=80',
        likes: 154000,
      },
      {
        ...all[2],
        id: 'curated_hot_3',
        title: '极品福利姬 奇丽自慰 极致黑丝美腿高跟大尺度',
        coverUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=500&q=80',
        likes: 112000,
      },
      {
        ...all[0],
        id: 'curated_hot_4',
        title: '美丽学生妹 想揉，诱惑制服裙底穿透视角',
        coverUrl: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=500&q=80',
        likes: 95000,
      }
    ];

    const latestVideos: ShortVideoItem[] = [
      {
        ...all[1],
        id: 'curated_late_1',
        title: '为了成为模特，可爱的Alice接受潜规则大尺度调教',
        coverUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=500&q=80',
      },
      {
        ...all[2],
        id: 'curated_late_2',
        title: '国漫AI玄衣 火车摇 极致骨骼抖动性感穿透',
        coverUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=500&q=80',
      },
      {
        ...all[0],
        id: 'curated_late_3',
        title: '在家裸体拍视频勾引黄毛 隔壁王哥疯狂冲入',
        coverUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80',
      },
      {
        ...all[1],
        id: 'curated_late_4',
        title: '在KTV大战性感尤物，两闺蜜热情加入双重极乐',
        coverUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=500&q=80',
      }
    ];

    const amazingDiscoveries: ShortVideoItem[] = [
      {
        ...all[2],
        id: 'curated_disc_1',
        title: '【高保真VR】极品小护士更衣室春光外泄 极致沉浸体验',
        coverUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=500&q=80',
      },
      {
        ...all[0],
        id: 'curated_disc_2',
        title: '【水晶晶独家】3D双人同床：制服诱惑与性感兔女郎',
        coverUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80',
      }
    ];

    return {
      code: 200,
      message: '成功',
      data: {
        hotVideos,
        latestVideos,
        amazingDiscoveries
      }
    };
  },


  // ==========================================
  // 4. 棋牌娱乐大厅与游戏大厅接口 (Games & Chess APIs)
  // ==========================================

  /**
   * 获取棋牌游戏分类及列表
   * API: GET /api/chess/list
   */
  async getChessGames(category: string): Promise<ApiResponse<ChessGameItem[]>> {
    const res = await makeRequest<ApiResponse<ChessGameItem[]>>(`/api/chess/list?category=${encodeURIComponent(category)}`);
    if (res) return res;
    let list = [...MOCK_CHESS_GAMES];
    if (category !== 'all') {
      list = list.filter(c => c.category === category);
    }
    return {
      code: 200,
      message: '成功',
      data: list
    };
  },

  /**
   * 游戏/棋牌中奖实时播报轮播
   * API: GET /api/games/winners
   */
  async getWinnerAnnouncements(): Promise<ApiResponse<WinnerAnnouncement[]>> {
    const res = await makeRequest<ApiResponse<WinnerAnnouncement[]>>('/api/games/winners');
    if (res) return res;
    return {
      code: 200,
      message: '成功',
      data: MOCK_WINNERS
    };
  }
};
