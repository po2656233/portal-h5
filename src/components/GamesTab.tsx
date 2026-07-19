import React, { useState } from 'react';
import { UserWallet, UserProfile } from '../types';
import { BookOpen, Search, Coins, Ticket, Sparkles, Star, Eye, ThumbsUp, Compass, ArrowLeft, ArrowRight, Settings, Lock, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface GamesTabProps {
  wallet: UserWallet;
  profile: UserProfile;
  onUpdateWallet: (wallet: Partial<UserWallet>) => void;
  onUpdateProfile: (profile: Partial<UserProfile>) => void;
  onOpenTopup: (type: 'vip' | 'coin' | 'transfer') => void;
}

// Complete Mock Books Database
interface BookItem {
  id: string;
  title: string;
  author: string;
  type: 'manga' | 'novel';
  cover: string;
  category: string;
  tags: string[];
  rating: number;
  views: string;
  likes: number;
  description: string;
  isHot: boolean;
  chapters: {
    id: string;
    title: string;
    isLocked: boolean;
    coinCost: number;
    // For manga pages, or novel text
    pagesOrText: string[]; 
  }[];
}

const MOCK_BOOKS: BookItem[] = [
  {
    id: 'm-1',
    title: '都市丽人的极致私密诱惑',
    author: '秋原爱漫画社',
    type: 'manga',
    cover: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=400&q=80',
    category: '成人漫画',
    tags: ['御姐', '黑丝', '办公室', '刺激', '极度诱惑'],
    rating: 9.9,
    views: '158w',
    likes: 88421,
    description: '刚入职的年轻小职员张伟，竟然意外撞见冰山美女总裁的私人秘密，从那一天开始，他荒诞而香艳的办公室生活拉开了序幕...',
    isHot: true,
    chapters: [
      {
        id: 'ch-1',
        title: '第01话 撞见女总裁的秘密',
        isLocked: false,
        coinCost: 0,
        pagesOrText: [
          'https://images.unsplash.com/photo-1560169897-fc0cdbdfa4d5?auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=600&q=80'
        ]
      },
      {
        id: 'ch-2',
        title: '第02话 办公室夜色幽会 (解锁需2金币)',
        isLocked: true,
        coinCost: 2,
        pagesOrText: [
          'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=600&q=80'
        ]
      },
      {
        id: 'ch-3',
        title: '第03话 酒店狂欢大冒险 (解锁需5金币)',
        isLocked: true,
        coinCost: 5,
        pagesOrText: [
          'https://images.unsplash.com/photo-1531058020387-3be344559be6?auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=600&q=80'
        ]
      }
    ]
  },
  {
    id: 'm-2',
    title: '我的同居房东是性感空姐',
    author: '漫漫社漫画',
    type: 'manga',
    cover: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    category: '成人漫画',
    tags: ['丝袜', '制服', '爆乳', '纯爱', '同居'],
    rating: 9.8,
    views: '124w',
    likes: 62410,
    description: '合租房里的超级奇遇！美丽性感、性格温婉的高空乘务员莉莉竟然是张磊的房东。洗浴室里的尴尬相遇，醉酒后的贴身热舞...',
    isHot: true,
    chapters: [
      {
        id: 'ch-1',
        title: '第01话 浴室里的尴尬香艳',
        isLocked: false,
        coinCost: 0,
        pagesOrText: [
          'https://images.unsplash.com/photo-1520607162513-8722a3a110a4?auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=600&q=80'
        ]
      },
      {
        id: 'ch-2',
        title: '第02话 莉莉宿醉归来 (解锁需2金币)',
        isLocked: true,
        coinCost: 2,
        pagesOrText: [
          'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80'
        ]
      }
    ]
  },
  {
    id: 'm-3',
    title: '异世界后宫魅魔风俗指南',
    author: 'J_Studio漫画组',
    type: 'manga',
    cover: 'https://images.unsplash.com/photo-1534224039826-c7a0dea0e66a?auto=format&fit=crop&w=400&q=80',
    category: '同人本子',
    tags: ['二次元', '后宫', '魔物娘', '本子', '极致快感'],
    rating: 9.6,
    views: '98w',
    likes: 47820,
    description: '意外转生至异世界魔法大陆，男主竟然继承了一家即将倒闭的「魅魔女仆会馆」？！看他如何用现代商业点子征服异种族尤物！',
    isHot: false,
    chapters: [
      {
        id: 'ch-1',
        title: '第01话 成为魅魔之主！',
        isLocked: false,
        coinCost: 0,
        pagesOrText: [
          'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80'
        ]
      },
      {
        id: 'ch-2',
        title: '第02话 双子猫娘的贴身服务 (解锁需3金币)',
        isLocked: true,
        coinCost: 3,
        pagesOrText: [
          'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=600&q=80'
        ]
      }
    ]
  },
  {
    id: 'n-1',
    title: '成熟少妇白洁的秘密私生活',
    author: '桃色笔尖',
    type: 'novel',
    cover: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=400&q=80',
    category: '精品小说',
    tags: ['经典', '少妇', '都市情仇', '深夜必看', '刺激'],
    rating: 9.9,
    views: '240w',
    likes: 128450,
    description: '经典的都市情感纪实之作。讲述温婉优雅的中学女教师白洁，在纷繁复杂的职场与生活中，所经历的心灵挣扎与极致狂野的情爱深渊...',
    isHot: true,
    chapters: [
      {
        id: 'ch-1',
        title: '第一章：雨夜里的温柔交汇',
        isLocked: false,
        coinCost: 0,
        pagesOrText: [
          '那是一个异常闷热的初夏夜晚。天空淅淅沥沥地下着连绵的细雨，将南方的这座小城笼罩在一层迷离的水汽之中。\n\n白洁独自站在办公楼一楼的大厅，手里抱着一叠刚刚改完的期末模拟试卷。她身上穿着一件米黄色的修身真丝连衣裙，精致的剪裁将她原本就丰腴曼妙的身姿勾勒得淋漓尽致。领口微开，露出了她白皙修长的颈项和精致锁骨。\n\n“白老师，还没走呢？”保安小高从巡逻中走来，眼光忍不住在白洁那若隐若现的裙摆曲线和白皙的小腿上流连，喉结不自觉地上下滑动了一下。',
          '白洁微微抬头，有些疲惫地笑了笑：“是啊，试卷改得有些晚。这雨又突然下大了，没带伞。”\n\n雨水敲击在大理石地面上，发出清脆的响声。两人站在昏暗的雨幕中，不知不觉产生了一种奇特的暧昧张力。白洁轻轻捏了捏手中的试卷，心里泛起一股说不出来的滋味。这几个月和丈夫长期两地分居，深夜里的寂寞与失落，像蚂蚁一般常常蚕食着她的身心。\n\n小高红着脸，颤巍巍地从保卫室拿出一把黑色长柄伞：“我这刚好有把多余的伞。白老师...如果不嫌弃，我撑你到公交车站吧？”\n\n白洁美眸流转，轻咬了一下嘴唇。在这个寂寞湿漉漉的雨夜，有人如此热诚，她竟不忍心拒绝。“那就...太谢谢你啦，小高。”'
        ]
      },
      {
        id: 'ch-2',
        title: '第二章：浴室内的温馨悸动 (解锁需2金币)',
        isLocked: true,
        coinCost: 2,
        pagesOrText: [
          '小高撑起的黑伞很宽大，但他总是故意将伞面往白洁那边倾斜。细密的雨丝虽然没有打湿白洁的真丝长裙，却有些微凉的空气让两人不得不贴得极近。\n\n白洁鼻尖闻到小高身上散发出的有些粗犷的年轻小伙汗味，面庞微微一红。下意识间，小高强健的肩膀蹭到了白洁柔软的胳膊。那一瞬间，像是一股微弱的电流在两人肌肤间穿过。\n\n“白老师，您皮肤真白。”小高有些醉意地脱口而出。说出口后他立刻后悔了，脸色瞬间涨得通红。\n\n白洁心里咯噔了一下，心跳不自觉地漏了一拍。要是平常，她肯定会沉下脸批评两句。但今晚，在这无边雨夜，这句话却像一块小石头扔进了平静许久的春水里，激起了阵阵微澜。她没有出声，只是微微低了低头，脚步似乎也慢了下来。',
          '到了白洁位于二楼的教师单身公寓，雨势已经变得如同瓢泼大雨一般。小高的衣服和头发有一大半都被淋透了，白色的制服衬衫紧紧贴在身上，暴露出结实的胸膛。\n\n白洁心中不忍，轻声说道：“小高，瞧你这一身湿透的。赶紧进来擦擦，喝杯姜糖水，要不然明天准得感冒。”\n\n“这...不方便吧，白老师。”小高两眼发直，望着公寓门内亮起的暖色灯光和充满女性芬芳的闺房。\n\n“没事，家里就我一个人。”白洁温婉的一笑，这一笑宛如盛开的百合花，彻底融化了年轻保安最后的理智。他顺从地跟进了门，呼吸骤然变得有些粗重。'
        ]
      }
    ]
  },
  {
    id: 'n-2',
    title: '桃运神医：绝美总裁的贴身神医',
    author: '天外仙人',
    type: 'novel',
    cover: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80',
    category: '精品小说',
    tags: ['逆袭', '神医', '爽文', '暧昧', '总裁'],
    rating: 9.7,
    views: '210w',
    likes: 95412,
    description: '乡村神医林枫，怀揣绝世针法「九九太乙针」进入繁华大都市。本想安稳给未婚妻治病，却意外卷入千亿总裁集团争夺战中。香车美女，暗潮汹涌，且看他如何用银针闯出一片桃运天下！',
    isHot: false,
    chapters: [
      {
        id: 'ch-1',
        title: '第一章：美女总裁的心胸绞痛',
        isLocked: false,
        coinCost: 0,
        pagesOrText: [
          '林枫身上斜挎着一个洗得发白的破帆布包，脚踩一双黄胶鞋，站在了中海市最豪华的写字楼——天美集团大厦前。\n\n“啧啧，真大真高。”林枫咂了咂嘴。还没等他迈步走进去，大厅门口突然传来一阵嘈杂与尖叫声！\n\n“快来人啊！总裁昏倒了！”\n\n只见几名神色焦急的秘书和保镖围在旋转门前。地毯上躺着一位穿着香奈儿高定制服的倾城女子。她大约二十五六岁，黛眉紧蹙，呼吸微弱，一只纤纤玉手捂在傲人的胸前，脸色苍白得毫无血色，却美得让人感到窒息。\n\n林枫定睛一看，眉头微皱：这是极度危险的“太阴寒凝之症”！如果三分钟内不疏通胸前的任脉大穴，必死无疑！',
          '“让开！我能救她！”林枫大喝一声，拨开两名虎背熊腰的黑衣保镖，迅速蹲在倾城女子的身侧。\n\n“你这乡巴佬哪来的？别碰我们总裁！快滚开！”秘书尖声叫道，抬手就要去推林枫。\n\n“不想让你们总裁死就闭嘴！”林枫冷眸一扫，那一瞬间散发出的帝王般威压，震慑得所有人动弹不得。\n\n说时迟那时快，林枫迅速从包里摸出三根明晃晃的银针，没有丝毫犹豫，隔着薄薄的高档制服，闪电般朝她胸口附近的几个大穴刺了下去！\n\n“啊...”一声若有若无的娇吟突兀地响起。天美集团的女总裁——沈倾城，竟然徐徐睁开了如秋水般的美眸。'
        ]
      }
    ]
  }
];

export default function GamesTab({
  wallet,
  profile,
  onUpdateWallet,
  onUpdateProfile,
  onOpenTopup
}: GamesTabProps) {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('全部');
  const [selectedBook, setSelectedBook] = useState<BookItem | null>(null);
  const [readBookTarget, setReadBookTarget] = useState<BookItem | null>(null);
  
  // Reading state variables
  const [activeChapterIndex, setActiveChapterIndex] = useState<number>(0);
  const [activePageIndex, setActivePageIndex] = useState<number>(0);
  
  // Custom font size for novels
  const [fontSize, setFontSize] = useState<number>(14);
  // Color palette: 'eye' (greenish), 'sepia' (warm beige), 'dark' (charcoal)
  const [themeMode, setThemeMode] = useState<'eye' | 'sepia' | 'dark'>('eye');

  // Tracking unlocked chapters globally within localStorage to avoid duplicate purchase
  const getUnlockedStateKey = (bookId: string, chapterId: string) => `unlocked_${bookId}_${chapterId}`;
  const isChapterUnlocked = (book: BookItem, chapterIdx: number) => {
    const chapter = book.chapters[chapterIdx];
    if (!chapter.isLocked) return true;
    const isSaved = localStorage.getItem(getUnlockedStateKey(book.id, chapter.id)) === 'true';
    return isSaved;
  };

  const handleUnlockChapter = (book: BookItem, chapterIdx: number) => {
    const chapter = book.chapters[chapterIdx];
    if (wallet.goldCoins < chapter.coinCost) {
      alert(`❌ 账户金币余额不足！本章需要 ${chapter.coinCost} 金币，您当前仅有 ${wallet.goldCoins} 金币。\n请立刻前往充值。`);
      onOpenTopup('coin');
      return;
    }

    // Deduct coins
    onUpdateWallet({ goldCoins: wallet.goldCoins - chapter.coinCost });
    localStorage.setItem(getUnlockedStateKey(book.id, chapter.id), 'true');
    alert(`🎉 成功支付 ${chapter.coinCost} 金币！\n已成功为您解锁：${chapter.title}。尽情享受吧！`);
    
    // Refresh state
    setActiveChapterIndex(chapterIdx);
    setActivePageIndex(0);
  };

  // Filter books matching search or selected category
  const filteredBooks = MOCK_BOOKS.filter((b) => {
    const matchesSearch = b.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          b.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          b.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (activeCategory === '全部') return matchesSearch;
    return b.category === activeCategory && matchesSearch;
  });

  const handleOpenBookDetails = (book: BookItem) => {
    setSelectedBook(book);
  };

  const handleStartReading = (book: BookItem) => {
    setReadBookTarget(book);
    setActiveChapterIndex(0);
    setActivePageIndex(0);
    setSelectedBook(null); // Close detail overlay
  };

  return (
    <div className="flex-1 flex flex-col bg-brand-bg text-white overflow-hidden pb-16">
      
      {/* 1. TOP HEADER & WALLET */}
      <div className="p-4 bg-brand-card border-b border-neutral-800 shrink-0 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-brand-purple animate-pulse" />
          <div>
            <h1 className="text-sm font-black text-white tracking-wide">某某漫画/小说</h1>
            <p className="text-[8px] text-brand-purple font-mono uppercase tracking-wider">Manga & Novels Portal</p>
          </div>
        </div>

        {/* Dynamic coins indicator */}
        <div 
          onClick={() => onOpenTopup('coin')}
          className="bg-neutral-900 border border-neutral-800 rounded-2xl py-1 px-3 flex items-center gap-1.5 cursor-pointer hover:border-pink-500/20 transition-all"
        >
          <Coins className="w-3.5 h-3.5 text-brand-gold animate-spin" style={{ animationDuration: '6s' }} />
          <span className="text-[10px] font-extrabold text-brand-gold">{wallet.goldCoins} 书币</span>
          <span className="text-[8px] text-pink-400 bg-pink-500/15 px-1.5 py-0.2 rounded font-black scale-90">充值</span>
        </div>
      </div>

      {/* 2. SEARCH & QUICK FILTER BAR */}
      <div className="px-4 py-3 bg-brand-bg shrink-0 space-y-3">
        {/* Search bar input */}
        <div className="relative">
          <input 
            type="text" 
            placeholder="输入作品名、作者、黑丝、丝袜、极度诱惑..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-brand-card border border-neutral-800 rounded-xl py-2 pl-9 pr-4 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-purple/50 transition-colors"
          />
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-[10px] text-gray-400 hover:text-white"
            >
              清除
            </button>
          )}
        </div>

        {/* Horizontal Category Switcher */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {['全部', '成人漫画', '精品小说', '同人本子'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`py-1 px-3.5 text-[10px] font-black rounded-full whitespace-nowrap transition-all border ${
                activeCategory === cat
                  ? 'bg-brand-purple border-brand-purple text-white shadow-md'
                  : 'bg-brand-card border-neutral-800 text-gray-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 3. MAIN BOOKS FEED LIST */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 space-y-4">
        
        {/* Special Banner Alert info */}
        <div className="p-3 rounded-xl bg-gradient-to-r from-brand-purple/20 via-pink-950/20 to-transparent border border-pink-500/10 flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-brand-gold shrink-0 mt-0.5 animate-pulse" />
          <div>
            <h4 className="text-[10px] font-black text-brand-gold flex items-center gap-1.5">
              <span>本周热更榜单 · 独家精品全网首发</span>
              <span className="bg-red-500 text-white text-[7px] px-1 rounded-sm">HOT</span>
            </h4>
            <p className="text-[8px] text-gray-400 mt-0.5 leading-relaxed">首章完全免费体验！后续章节尊享极低书币，开通 VIP 会员部分本子无门槛尽情畅享！</p>
          </div>
        </div>

        {filteredBooks.length === 0 ? (
          <div className="py-16 text-center text-xs text-gray-500 space-y-2">
            <span>🏜️ 没有找到相关作品，换个词试试吧</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 pb-6">
            {filteredBooks.map((book) => (
              <div 
                key={book.id}
                onClick={() => handleOpenBookDetails(book)}
                className="bg-brand-card rounded-2xl border border-neutral-800/80 p-2.5 cursor-pointer hover:border-brand-purple/30 transition-all flex flex-col group relative"
              >
                {/* Book cover visual block */}
                <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-black shrink-0">
                  <img 
                    src={book.cover} 
                    alt={book.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Rating / Hot status flags */}
                  <span className="absolute top-1.5 left-1.5 bg-black/70 backdrop-blur-sm px-1.5 py-0.5 rounded text-[7px] font-mono font-black text-brand-gold flex items-center gap-0.5 shadow">
                    ⭐ {book.rating}
                  </span>

                  <span className={`absolute top-1.5 right-1.5 text-[7px] font-black px-1.5 py-0.5 rounded shadow ${
                    book.type === 'manga' ? 'bg-pink-500 text-white' : 'bg-brand-purple text-white'
                  }`}>
                    {book.type === 'manga' ? '漫画' : '小说'}
                  </span>

                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-1.5 flex justify-between text-[7px] text-gray-300 font-bold">
                    <span>▷ {book.views}人读</span>
                    <span>❤️ {book.likes}</span>
                  </div>
                </div>

                {/* Book info labels */}
                <div className="mt-2 flex-1 flex flex-col justify-between space-y-1">
                  <div>
                    <h3 className="text-[10px] font-black text-gray-200 line-clamp-1 group-hover:text-pink-400 transition-colors">
                      {book.title}
                    </h3>
                    <p className="text-[8px] text-gray-500 font-bold mt-0.5">{book.author}</p>
                  </div>

                  {/* Top tags */}
                  <div className="flex flex-wrap gap-1 pt-0.5">
                    {book.tags.slice(0, 2).map(tag => (
                      <span key={tag} className="text-[7px] bg-[#1d1d1d] border border-neutral-800 text-gray-400 px-1 py-0.2 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. DETAIL OVERLAY PANEL */}
      <AnimatePresence>
        {selectedBook && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/85 backdrop-blur-sm animate-fade-in">
            <motion.div 
              initial={{ y: 200, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 200, opacity: 0 }}
              className="bg-brand-card w-full max-w-md rounded-t-[28px] border-t border-neutral-800 p-5 space-y-5 relative pb-8 max-h-[85%] overflow-y-auto"
            >
              {/* Close drag bar */}
              <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-12 h-1 bg-neutral-800 rounded-full" />
              
              {/* Main row detail */}
              <div className="flex gap-4 pt-2">
                <img 
                  src={selectedBook.cover} 
                  alt={selectedBook.title}
                  className="w-24 aspect-[3/4] object-cover rounded-xl border border-neutral-800"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                  <div className="space-y-1.5">
                    <span className="text-[8px] bg-brand-purple/15 text-brand-purple px-2 py-0.5 rounded font-black uppercase">
                      {selectedBook.category}
                    </span>
                    <h2 className="text-xs font-black text-white leading-snug">{selectedBook.title}</h2>
                    <p className="text-[9px] text-gray-400">作者：<span className="text-gray-200 font-bold">{selectedBook.author}</span></p>
                  </div>

                  <div className="flex items-center gap-3.5 text-[10px] text-gray-400">
                    <span className="text-brand-gold font-extrabold">⭐ {selectedBook.rating}分</span>
                    <span>人气：{selectedBook.views}</span>
                    <span>推荐：{selectedBook.likes}</span>
                  </div>
                </div>
              </div>

              {/* Tag pills */}
              <div className="flex flex-wrap gap-1.5">
                {selectedBook.tags.map(t => (
                  <span key={t} className="px-2 py-0.5 rounded-full border border-neutral-800 bg-[#161616] text-[8px] text-gray-400 font-medium">
                    #{t}
                  </span>
                ))}
              </div>

              {/* Book description */}
              <div className="space-y-1">
                <h4 className="text-[10px] text-gray-400 font-black flex items-center gap-1">
                  <span>📖</span>
                  <span>内容简介</span>
                </h4>
                <p className="text-[10px] text-gray-300 leading-relaxed bg-[#141414] p-3 rounded-xl border border-neutral-900 text-justify">
                  {selectedBook.description}
                </p>
              </div>

              {/* Chapter Feed Indexes preview */}
              <div className="space-y-2">
                <h4 className="text-[10px] text-gray-400 font-black">章节目录 ({selectedBook.chapters.length} 话)</h4>
                <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto no-scrollbar">
                  {selectedBook.chapters.map((ch, idx) => (
                    <div 
                      key={ch.id}
                      onClick={() => {
                        if (isChapterUnlocked(selectedBook, idx)) {
                          handleStartReading(selectedBook);
                          setActiveChapterIndex(idx);
                        } else {
                          handleUnlockChapter(selectedBook, idx);
                        }
                      }}
                      className="p-2.5 rounded-xl bg-[#141414] border border-neutral-800 hover:border-brand-purple/30 cursor-pointer flex justify-between items-center transition-all"
                    >
                      <div className="flex items-center gap-2">
                        {ch.coinCost > 0 && !isChapterUnlocked(selectedBook, idx) ? (
                          <Lock className="w-3.5 h-3.5 text-brand-gold" />
                        ) : (
                          <span className="text-[10px] text-emerald-500 font-bold">✓</span>
                        )}
                        <span className="text-[10px] font-bold text-gray-200">{ch.title}</span>
                      </div>
                      
                      <div className="flex items-center gap-1.5 text-[9px]">
                        {ch.coinCost > 0 && !isChapterUnlocked(selectedBook, idx) ? (
                          <span className="text-brand-gold font-bold">{ch.coinCost} 书币</span>
                        ) : (
                          <span className="text-gray-500">免费看</span>
                        )}
                        <span className="text-gray-500 text-xs">➔</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer action buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setSelectedBook(null)}
                  className="flex-1 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-xs font-black text-gray-400 hover:text-white transition-colors"
                >
                  关闭
                </button>
                <button
                  onClick={() => handleStartReading(selectedBook)}
                  className="flex-1 py-3 bg-brand-gradient rounded-xl text-xs font-black text-white hover:brightness-105 shadow transition-all flex items-center justify-center gap-1.5"
                >
                  <span>立即阅读</span>
                  <span>🚀</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. INTERACTIVE READING MODE OVERLAY */}
      <AnimatePresence>
        {readBookTarget && (
          <div className="fixed inset-0 z-[100] bg-black flex flex-col justify-between overflow-hidden">
            
            {/* Top Toolbar */}
            <div className="p-4 bg-neutral-900/95 backdrop-blur-sm border-b border-neutral-800 flex items-center justify-between z-10">
              <button 
                onClick={() => setReadBookTarget(null)}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>返回大厅</span>
              </button>
              <div className="text-center">
                <h3 className="text-[10px] font-black text-white truncate max-w-[180px]">{readBookTarget.title}</h3>
                <p className="text-[8px] text-gray-500">{readBookTarget.chapters[activeChapterIndex]?.title}</p>
              </div>
              <div className="flex items-center gap-2">
                <Settings 
                  onClick={() => {
                    if (readBookTarget.type === 'novel') {
                      alert('⚙️ 书籍设置面板\n\n您可以自由在正文调整字体大小或切换底色模式！');
                    } else {
                      alert('⚙️ 漫画高清线路流畅\n已为您自动匹配最佳服务器专线！');
                    }
                  }}
                  className="w-4 h-4 text-gray-400 hover:text-white cursor-pointer" 
                />
              </div>
            </div>

            {/* Reading Content Area */}
            <div className="flex-1 overflow-y-auto no-scrollbar relative bg-neutral-950">
              
              {/* Manga Interactive Viewport */}
              {readBookTarget.type === 'manga' ? (
                <div className="w-full flex flex-col items-center py-2 space-y-3">
                  
                  {/* Lock Screen if chapter locked */}
                  {!isChapterUnlocked(readBookTarget, activeChapterIndex) ? (
                    <div className="h-[450px] flex flex-col items-center justify-center text-center p-6 space-y-4">
                      <div className="w-16 h-16 rounded-full bg-brand-gold/15 flex items-center justify-center text-3xl animate-bounce">
                        🔒
                      </div>
                      <div className="space-y-1.5">
                        <h4 className="text-xs font-black text-brand-gold">该章节为老司机精品专栏</h4>
                        <p className="text-[9px] text-gray-400">需要支付 {readBookTarget.chapters[activeChapterIndex].coinCost} 金币开启极致体验</p>
                      </div>

                      <button 
                        onClick={() => handleUnlockChapter(readBookTarget, activeChapterIndex)}
                        className="px-6 py-2.5 rounded-full bg-brand-gold text-black font-black text-xs shadow-lg hover:brightness-105 transition-all"
                      >
                        ⚡ 立即解锁章节 ({readBookTarget.chapters[activeChapterIndex].coinCost}金币)
                      </button>
                    </div>
                  ) : (
                    <div className="w-full max-w-sm space-y-4 px-2">
                      <div className="relative aspect-[3/4] bg-neutral-900 rounded-xl overflow-hidden shadow-2xl border border-neutral-800">
                        <img 
                          src={readBookTarget.chapters[activeChapterIndex].pagesOrText[activePageIndex]} 
                          alt="manga-page"
                          className="w-full h-full object-cover select-none"
                          referrerPolicy="no-referrer"
                        />
                        
                        {/* Page counter overlay */}
                        <span className="absolute bottom-3 right-3 bg-black/75 px-2.5 py-0.5 rounded-full text-[8px] font-mono tracking-widest">
                          PAG {activePageIndex + 1} / {readBookTarget.chapters[activeChapterIndex].pagesOrText.length}
                        </span>
                      </div>

                      {/* Micro Navigation Arrows */}
                      <div className="flex items-center justify-between gap-4 pt-1.5">
                        <button
                          disabled={activePageIndex === 0}
                          onClick={() => setActivePageIndex(prev => prev - 1)}
                          className="flex-1 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 disabled:opacity-30 text-[10px] font-black flex items-center justify-center gap-1"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                          <span>上一页</span>
                        </button>
                        <button
                          disabled={activePageIndex >= readBookTarget.chapters[activeChapterIndex].pagesOrText.length - 1}
                          onClick={() => setActivePageIndex(prev => prev + 1)}
                          className="flex-1 py-2.5 rounded-xl bg-brand-purple disabled:opacity-30 text-[10px] font-black flex items-center justify-center gap-1"
                        >
                          <span>下一页</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              ) : (
                /* Novel Text Interactive Reader Viewport */
                <div className={`min-h-full px-5 py-6 space-y-4 transition-colors ${
                  themeMode === 'eye' 
                    ? 'bg-[#1a2e26] text-emerald-100' 
                    : themeMode === 'sepia' 
                    ? 'bg-[#2b241e] text-orange-100' 
                    : 'bg-neutral-900 text-gray-200'
                }`}>
                  {/* Theme Adjuster Row */}
                  <div className="flex justify-between items-center bg-black/30 p-2.5 rounded-xl border border-white/5 text-[9px]">
                    <div className="flex items-center gap-1 font-bold">
                      <span>🎨 阅读背景：</span>
                      <div className="flex gap-1.5">
                        <button 
                          onClick={() => setThemeMode('eye')}
                          className={`w-4 h-4 rounded-full bg-[#1a2e26] border ${themeMode === 'eye' ? 'border-brand-gold' : 'border-neutral-500'}`}
                          title="护眼"
                        />
                        <button 
                          onClick={() => setThemeMode('sepia')}
                          className={`w-4 h-4 rounded-full bg-[#2b241e] border ${themeMode === 'sepia' ? 'border-brand-gold' : 'border-neutral-500'}`}
                          title="羊皮纸"
                        />
                        <button 
                          onClick={() => setThemeMode('dark')}
                          className={`w-4 h-4 rounded-full bg-neutral-800 border ${themeMode === 'dark' ? 'border-brand-gold' : 'border-neutral-500'}`}
                          title="深夜"
                        />
                      </div>
                    </div>

                    {/* Font adjust */}
                    <div className="flex items-center gap-1">
                      <span>字号：</span>
                      <button 
                        onClick={() => setFontSize(prev => Math.max(12, prev - 1))}
                        className="w-5 h-5 rounded bg-black/40 flex items-center justify-center hover:bg-black/60 font-black text-xs"
                      >
                        A-
                      </button>
                      <span className="font-mono font-bold mx-1">{fontSize}px</span>
                      <button 
                        onClick={() => setFontSize(prev => Math.min(22, prev + 1))}
                        className="w-5 h-5 rounded bg-black/40 flex items-center justify-center hover:bg-black/60 font-black text-xs"
                      >
                        A+
                      </button>
                    </div>
                  </div>

                  {/* Novel text body */}
                  {!isChapterUnlocked(readBookTarget, activeChapterIndex) ? (
                    <div className="h-[400px] flex flex-col items-center justify-center text-center space-y-4">
                      <div className="w-16 h-16 rounded-full bg-brand-gold/15 flex items-center justify-center text-3xl animate-bounce">
                        🔒
                      </div>
                      <div className="space-y-1.5">
                        <h4 className="text-xs font-black text-brand-gold">该章节为老司机精品专栏</h4>
                        <p className="text-[9px] text-gray-400">需要支付 {readBookTarget.chapters[activeChapterIndex].coinCost} 金币开启极致体验</p>
                      </div>

                      <button 
                        onClick={() => handleUnlockChapter(readBookTarget, activeChapterIndex)}
                        className="px-6 py-2.5 rounded-full bg-brand-gold text-black font-black text-xs shadow-lg hover:brightness-105 transition-all"
                      >
                        ⚡ 立即解锁章节 ({readBookTarget.chapters[activeChapterIndex].coinCost}金币)
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4 select-none text-justify" style={{ fontSize: `${fontSize}px` }}>
                      {readBookTarget.chapters[activeChapterIndex].pagesOrText.map((p, idx) => (
                        <p key={idx} className="leading-relaxed indent-8 whitespace-pre-line tracking-wide">
                          {p}
                        </p>
                      ))}
                    </div>
                  )}

                </div>
              )}

            </div>

            {/* Bottom Chapter Switcher Navigation */}
            <div className="p-4 bg-neutral-900 border-t border-neutral-800 flex items-center justify-between shrink-0">
              <button
                disabled={activeChapterIndex === 0}
                onClick={() => {
                  setActiveChapterIndex(prev => prev - 1);
                  setActivePageIndex(0);
                }}
                className="py-2 px-4 rounded-lg bg-neutral-950 border border-neutral-800 disabled:opacity-25 text-[10px] font-black"
              >
                上一章
              </button>
              
              <div className="text-[10px] text-gray-400 font-bold">
                章 {activeChapterIndex + 1} / {readBookTarget.chapters.length}
              </div>

              <button
                disabled={activeChapterIndex >= readBookTarget.chapters.length - 1}
                onClick={() => {
                  const nextIdx = activeChapterIndex + 1;
                  if (isChapterUnlocked(readBookTarget, nextIdx)) {
                    setActiveChapterIndex(nextIdx);
                    setActivePageIndex(0);
                  } else {
                    handleUnlockChapter(readBookTarget, nextIdx);
                  }
                }}
                className="py-2 px-4 rounded-lg bg-[#222] border border-neutral-800 disabled:opacity-25 text-[10px] font-black text-brand-gold"
              >
                下一章
              </button>
            </div>

          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
