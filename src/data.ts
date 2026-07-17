import { VideoItem, ShortVideoItem, GameItem, ChessGameItem, WinnerAnnouncement } from './types';

export const LONG_VIDEO_CATEGORIES = [
  '香蕉头条',
  '自拍交流',
  '制服诱惑',
  '清纯校花',
  '网红主播',
  '御姐熟女',
  '唯美写真',
  '海外精品'
];

export const MOCK_LONG_VIDEOS: VideoItem[] = [
  {
    id: 'l1',
    title: '【最新首发】国产网红主播深夜空降，私密泳池大尺湿身大秀',
    category: '最新视频',
    coverUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=500&q=80',
    gifUrl: 'https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3ZpcjJzdGptZnJpdXB0ZTN3ZWZmaThpdXZzNTY5dm5mOWt0NzA5MyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l0ExdFnI6g8A6SclO/giphy.gif',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-beautiful-woman-posing-with-colorful-light-40191-large.mp4',
    views: 148200,
    favorites: 6520,
    duration: '21:14',
    tags: ['最新', '湿身', '网红', '极品'],
    isVipOnly: false
  },
  {
    id: 'l2',
    title: '【今日推荐】日韩名器女神超清私房，极品蕾丝睡衣极限挑逗',
    category: '最新视频',
    coverUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80',
    gifUrl: 'https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3ZpcjJzdGptZnJpdXB0ZTN3ZWZmaThpdXZzNTY5dm5mOWt0NzA5MyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l0ExdFnI6g8A6SclO/giphy.gif',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-posing-in-neon-light-40192-large.mp4',
    views: 98400,
    favorites: 3120,
    duration: '18:45',
    tags: ['私房', '蕾丝', '诱惑', '最新'],
    isVipOnly: true
  },
  {
    id: 'l3',
    title: '【热门爆款】白衣天使制服诱惑，贴身细致护理极爽体验',
    category: '热门视频',
    coverUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=500&q=80',
    gifUrl: 'https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3ZpcjJzdGptZnJpdXB0ZTN3ZWZmaThpdXZzNTY5dm5mOWt0NzA5MyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l0ExdFnI6g8A6SclO/giphy.gif',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-fashion-girl-posing-under-neon-sign-40193-large.mp4',
    views: 312500,
    favorites: 14500,
    duration: '24:12',
    tags: ['热门', '护士', '制服', '制服诱惑'],
    isVipOnly: true
  },
  {
    id: 'l4',
    title: '【全网狂热】高冷霸道女总裁午夜推倒，OL制服撕裂黑丝魅惑',
    category: '热门视频',
    coverUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=500&q=80',
    gifUrl: 'https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3ZpcjJzdGptZnJpdXB0ZTN3ZWZmaThpdXZzNTY5dm5mOWt0NzA5MyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l0ExdFnI6g8A6SclO/giphy.gif',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-girl-smiling-with-led-light-40195-large.mp4',
    views: 452000,
    favorites: 21800,
    duration: '31:10',
    tags: ['OL', '黑丝', '御姐', '霸道女总裁'],
    isVipOnly: true
  },
  {
    id: 'l5',
    title: '【猜你喜欢】清纯学妹水手服，jk双马尾极限粉嫩暴击',
    category: '猜你喜欢',
    coverUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=500&q=80',
    gifUrl: 'https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3ZpcjJzdGptZnJpdXB0ZTN3ZWZmaThpdXZzNTY5dm5mOWt0NzA5MyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l0ExdFnI6g8A6SclO/giphy.gif',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-sign-light-posing-40194-large.mp4',
    views: 184000,
    favorites: 9400,
    duration: '15:20',
    tags: ['学妹', 'JK', '双马尾', '粉嫩'],
    isVipOnly: false
  },
  {
    id: 'l6',
    title: '【猜你喜欢】夜店极品DJ制服，疯狂电音午夜大秀',
    category: '猜你喜欢',
    coverUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=500&q=80',
    gifUrl: 'https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3ZpcjJzdGptZnJpdXB0ZTN3ZWZmaThpdXZzNTY5dm5mOWt0NzA5MyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l0ExdFnI6g8A6SclO/giphy.gif',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-beautiful-woman-posing-with-colorful-light-40191-large.mp4',
    views: 221000,
    favorites: 11200,
    duration: '16:45',
    tags: ['DJ', '夜店', '极品', '热舞'],
    isVipOnly: false
  },
  {
    id: 'l7',
    title: '【猜你喜欢】性感车模黑丝长腿，后座极致空间缠绕',
    category: '猜你喜欢',
    coverUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80',
    gifUrl: 'https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3ZpcjJzdGptZnJpdXB0ZTN3ZWZmaThpdXZzNTY5dm5mOWt0NzA5MyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l0ExdFnI6g8A6SclO/giphy.gif',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-posing-in-neon-light-40192-large.mp4',
    views: 198000,
    favorites: 8500,
    duration: '22:18',
    tags: ['车模', '长腿', '黑丝', '极限空间'],
    isVipOnly: true
  },
  {
    id: 'l8',
    title: '【猜你喜欢】知名主播直播间私下放纵，大尺度高潮表演',
    category: '猜你喜欢',
    coverUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=500&q=80',
    gifUrl: 'https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3ZpcjJzdGptZnJpdXB0ZTN3ZWZmaThpdXZzNTY5dm5mOWt0NzA5MyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l0ExdFnI6g8A6SclO/giphy.gif',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-dancing-slowly-under-blue-light-42289-large.mp4',
    views: 245000,
    favorites: 13200,
    duration: '14:50',
    tags: ['主播', '福利', '极致', '高潮'],
    isVipOnly: true
  },
  {
    id: 'l9',
    title: '【自拍偷拍】酒店情侣野外露出，高清无修偷拍第一视角',
    category: '自拍偷拍',
    coverUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=500&q=80',
    gifUrl: 'https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3ZpcjJzdGptZnJpdXB0ZTN3ZWZmaThpdXZzNTY5dm5mOWt0NzA5MyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l0ExdFnI6g8A6SclO/giphy.gif',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-sign-light-posing-40194-large.mp4',
    views: 178000,
    favorites: 7120,
    duration: '28:15',
    tags: ['偷拍', '真实', '露出', '情侣'],
    isVipOnly: true
  },
  {
    id: 'l10',
    title: '【真实自拍】清纯校花私密闺房，湿身换衣极品身材毕露',
    category: '自拍偷拍',
    coverUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=500&q=80',
    gifUrl: 'https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3ZpcjJzdGptZnJpdXB0ZTN3ZWZmaThpdXZzNTY5dm5mOWt0NzA5MyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l0ExdFnI6g8A6SclO/giphy.gif',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-beautiful-woman-posing-with-colorful-light-40191-large.mp4',
    views: 312000,
    favorites: 15400,
    duration: '12:08',
    tags: ['自拍', '校花', '换衣', '湿身'],
    isVipOnly: false
  },
  {
    id: 'l11',
    title: '【成人动漫】绝美3D催眠异世界，妖精女魔王沦为欲望奴隶',
    category: '成人动漫',
    coverUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=500&q=80',
    gifUrl: 'https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3ZpcjJzdGptZnJpdXB0ZTN3ZWZmaThpdXZzNTY5dm5mOWt0NzA5MyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l0ExdFnI6g8A6SclO/giphy.gif',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-girl-smiling-with-led-light-40195-large.mp4',
    views: 154200,
    favorites: 6510,
    duration: '22:40',
    tags: ['动漫', '3D', '催眠', '异世界'],
    isVipOnly: false
  },
  {
    id: 'l12',
    title: '【精品里番】经典学园默示录，黑丝美少女午后密室调教',
    category: '成人动漫',
    coverUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80',
    gifUrl: 'https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3ZpcjJzdGptZnJpdXB0ZTN3ZWZmaThpdXZzNTY5dm5mOWt0NzA5MyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l0ExdFnI6g8A6SclO/giphy.gif',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-posing-in-neon-light-40192-large.mp4',
    views: 187000,
    favorites: 8900,
    duration: '18:55',
    tags: ['动漫', '学园', '黑丝', '密室'],
    isVipOnly: true
  },
  {
    id: 'l13',
    title: '【经典伦理】午夜欲望沙龙，贵妇人私密会所的香艳派对',
    category: '经典伦理',
    coverUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=500&q=80',
    gifUrl: 'https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3ZpcjJzdGptZnJpdXB0ZTN3ZWZmaThpdXZzNTY5dm5mOWt0NzA5MyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l0ExdFnI6g8A6SclO/giphy.gif',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-fashion-girl-posing-under-neon-sign-40193-large.mp4',
    views: 142000,
    favorites: 5120,
    duration: '45:30',
    tags: ['伦理', '贵妇', '午夜', '会所'],
    isVipOnly: true
  },
  {
    id: 'l14',
    title: '【经典伦理】失落的温存，少妇与年轻帅气租客的秘密交易',
    category: '经典伦理',
    coverUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=500&q=80',
    gifUrl: 'https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3ZpcjJzdGptZnJpdXB0ZTN3ZWZmaThpdXZzNTY5dm5mOWt0NzA5MyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l0ExdFnI6g8A6SclO/giphy.gif',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-dancing-slowly-under-blue-light-42289-large.mp4',
    views: 164000,
    favorites: 7320,
    duration: '52:10',
    tags: ['伦理', '少妇', '租客', '秘密交易'],
    isVipOnly: false
  },
  {
    id: 'l15',
    title: '【中文字幕】黑丝人妻与新居男邻居约会，无码超清1080P',
    category: '中文字幕',
    coverUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=500&q=80',
    gifUrl: 'https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3ZpcjJzdGptZnJpdXB0ZTN3ZWZmaThpdXZzNTY5dm5mOWt0NzA5MyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l0ExdFnI6g8A6SclO/giphy.gif',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-girl-smiling-with-led-light-40195-large.mp4',
    views: 298000,
    favorites: 12100,
    duration: '34:25',
    tags: ['中文', '字幕', '人妻', '邻居'],
    isVipOnly: true
  },
  {
    id: 'l16',
    title: '【中文字幕】极品空姐丝袜制服诱惑，机舱密闭空间极爽交缠',
    category: '中文字幕',
    coverUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80',
    gifUrl: 'https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3ZpcjJzdGptZnJpdXB0ZTN3ZWZmaThpdXZzNTY5dm5mOWt0NzA5MyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l0ExdFnI6g8A6SclO/giphy.gif',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-posing-in-neon-light-40192-large.mp4',
    views: 342000,
    favorites: 18900,
    duration: '29:40',
    tags: ['中文', '空姐', '制服', '丝袜'],
    isVipOnly: true
  },
  {
    id: 'l17',
    title: '【不雅视频】全网疯传知名网红清纯人妻流出，私密超大尺度不雅行为',
    category: '不雅视频',
    coverUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=500&q=80',
    gifUrl: 'https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3ZpcjJzdGptZnJpdXB0ZTN3ZWZmaThpdXZzNTY5dm5mOWt0NzA5MyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l0ExdFnI6g8A6SclO/giphy.gif',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-sign-light-posing-40194-large.mp4',
    views: 521000,
    favorites: 28400,
    duration: '18:15',
    tags: ['不雅', '网红', '自拍', '流出'],
    isVipOnly: true
  },
  {
    id: 'l18',
    title: '【不雅流出】知名女主播连线榜一土豪，大尺度露骨视频全网首播',
    category: '不雅视频',
    coverUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=500&q=80',
    gifUrl: 'https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3ZpcjJzdGptZnJpdXB0ZTN3ZWZmaThpdXZzNTY5dm5mOWt0NzA5MyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l0ExdFnI6g8A6SclO/giphy.gif',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-beautiful-woman-posing-with-colorful-light-40191-large.mp4',
    views: 614000,
    favorites: 31200,
    duration: '22:10',
    tags: ['不雅', '流出', '主播', '土豪'],
    isVipOnly: true
  }
];

export const MOCK_SHORT_VIDEOS: ShortVideoItem[] = [
  {
    id: 's1',
    title: '深夜福利，今天刚买的蕾丝睡衣好看吗？#巨乳 #美女 #性感蕾丝',
    category: '网红主播',
    coverUrl: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=500&q=80',
    gifUrl: '',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-dancing-woman-in-underwater-shoot-42866-large.mp4',
    views: 452000,
    favorites: 32000,
    duration: '0:35',
    tags: ['巨乳', '美女', '性感蕾丝'],
    isVipOnly: false,
    likes: 85400,
    commentsCount: 1540,
    uploader: {
      name: '小妖精呀~',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      isFollowed: false
    },
    comments: [
      { id: 'c1', username: '老司机带带我', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80', content: '这也太顶了吧！营养快线不够喝了！', time: '2小时前', likes: 120 },
      { id: 'c2', username: '黑丝控', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=100&q=80', content: '求同款睡衣，给老婆安排上。', time: '4小时前', likes: 45 },
      { id: 'c3', username: '贤者时间', avatar: 'https://images.unsplash.com/photo-1527983359383-4758693f760c?auto=format&fit=crop&w=100&q=80', content: '已点赞收藏，每天晚上必刷一遍！', time: '1天前', likes: 88 }
    ]
  },
  {
    id: 's2',
    title: '健身房偶遇极品蜜桃臀小姐姐，这身材比例我打100分！#健身美女 #蜜桃臀 #翘臀',
    category: '唯美写真',
    coverUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=500&q=80',
    gifUrl: '',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-doing-squats-in-gym-slow-motion-41865-large.mp4',
    views: 612000,
    favorites: 54000,
    duration: '0:42',
    tags: ['健身美女', '蜜桃臀', '翘臀'],
    isVipOnly: false,
    likes: 124000,
    commentsCount: 2310,
    uploader: {
      name: '健身辣妹Elina',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
      isFollowed: true
    },
    comments: [
      { id: 'c4', username: '肌肉硬汉', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80', content: '这硬拉姿势非常标准，臀腿力量很强。', time: '1小时前', likes: 210 },
      { id: 'c5', username: '天天想妹子', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80', content: '这是哪家健身房？我现在就去办卡！', time: '3小时前', likes: 130 }
    ]
  },
  {
    id: 's3',
    title: '制服丝袜，刚下班的前台小姐姐，你喜欢这样的小秘书吗？#制服诱惑 #OL丝袜',
    category: '制服诱惑',
    coverUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=500&q=80',
    gifUrl: '',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-posing-with-a-red-light-under-neon-sign-40196-large.mp4',
    views: 890000,
    favorites: 92000,
    duration: '0:28',
    tags: ['制服诱惑', 'OL丝袜', '高跟鞋'],
    isVipOnly: true,
    likes: 215000,
    commentsCount: 4500,
    uploader: {
      name: '前台小张',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
      isFollowed: false
    },
    comments: [
      { id: 'c6', username: '风一样的男子', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=100&q=80', content: '这腿我能玩一年，真是极品！', time: '30分钟前', likes: 310 },
      { id: 'c7', username: '董事长本人', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80', content: '明天来我办公室一趟，商量一下升职加薪的事。', time: '1小时前', likes: 580 }
    ]
  }
];

export const MOCK_GAME_ITEMS: GameItem[] = [
  {
    id: 'g1',
    name: '经典水果玛丽老虎机',
    category: 'slots',
    icon: '🎰',
    playersCount: 23140,
    jackpot: 8847290,
    description: '重温经典，爆分不断，小博大必玩场馆！',
    isHot: true
  },
  {
    id: 'g2',
    name: '欢乐大富豪捕鱼',
    category: 'fishing',
    icon: '🐠',
    playersCount: 15420,
    description: '万倍炮台，一炮暴富，捕获金龙赢取终极大奖。',
    isHot: true
  },
  {
    id: 'g3',
    name: '极速赛车1分彩',
    category: 'lottery',
    icon: '🏎️',
    playersCount: 31050,
    jackpot: 1250000,
    description: '一分钟一开，极速心跳，精准计划稳赚不赔。',
    isHot: false
  },
  {
    id: 'g4',
    name: '超级百家乐',
    category: 'hot',
    icon: '🃏',
    playersCount: 42100,
    description: '真人视讯，荷官互动，享受尊贵赌神待遇。',
    isHot: true
  },
  {
    id: 'g5',
    name: '沙巴体育大厅',
    category: 'sports',
    icon: '⚽',
    playersCount: 52140,
    description: '全球体育赛事全覆盖，高水位返水高。',
    isHot: false
  },
  {
    id: 'g6',
    name: '森林舞会轮盘',
    category: 'slots',
    icon: '🦁',
    playersCount: 18450,
    jackpot: 5621400,
    description: '经典森林动物大汇聚，闪电送分大奖领不停。',
    isHot: true
  }
];

export const MOCK_CHESS_GAMES: ChessGameItem[] = [
  {
    id: 'c_g1',
    name: '百人炸金花',
    category: 'chess',
    icon: '⚔️',
    onlineCount: 8430,
    minLimit: 10,
    description: '拼胆略，比智慧，闷牌狂翻倍，单局赢百万！'
  },
  {
    id: 'c_g2',
    name: '抢红包',
    category: 'chess',
    icon: '🧧',
    onlineCount: 15400,
    minLimit: 5,
    description: '秒速开抢，手速拼运气，爆率超高！'
  },
  {
    id: 'c_g3',
    name: '街机跑马',
    category: 'slots',
    icon: '🏇',
    onlineCount: 6240,
    minLimit: 10,
    description: '经典马场复刻，独赢、连赢超刺激，暴赚翻倍！'
  },
  {
    id: 'c_g4',
    name: '斗地主',
    category: 'chess',
    icon: '👑',
    onlineCount: 12500,
    minLimit: 5,
    description: '极速匹配，牌局顺畅，农民超级加倍挑落地主。'
  },
  {
    id: 'c_g5',
    name: '抢庄牛牛',
    category: 'chess',
    icon: '🐂',
    onlineCount: 9340,
    minLimit: 10,
    description: '抢庄狂欢，五花牛、炸弹牛翻倍爽到爆！'
  },
  {
    id: 'c_g6',
    name: '红黑大战',
    category: 'chess',
    icon: '🔴',
    onlineCount: 6240,
    minLimit: 20,
    description: '红黑两方终极对决，幸运奖池额外派送。'
  },
  {
    id: 'c_g7',
    name: '龙虎大战',
    category: 'chess',
    icon: '🐯',
    onlineCount: 11020,
    minLimit: 20,
    description: '两雄争霸，一决雌雄，赔率高，极速开奖！'
  },
  {
    id: 'c_g8',
    name: '森林舞会',
    category: 'slots',
    icon: '🦁',
    onlineCount: 18450,
    minLimit: 10,
    description: '经典森林动物大汇聚，闪电送分大奖领不停。'
  }
];

export const MOCK_WINNERS: WinnerAnnouncement[] = [
  { id: 'w1', username: '用户18***', gameName: '森林舞会', prize: 8739, time: '刚刚' },
  { id: 'w2', username: '玩家da***', gameName: '经典水果老虎机', prize: 15400, time: '1分钟前' },
  { id: 'w3', username: '老***k', gameName: '真人炸金花', prize: 52100, time: '2分钟前' },
  { id: 'w4', username: '性感***姐', gameName: '极速赛车1分彩', prize: 3600, time: '3分钟前' },
  { id: 'w5', username: '暴***富', gameName: '欢乐大富豪捕鱼', prize: 27800, time: '5分钟前' }
];
