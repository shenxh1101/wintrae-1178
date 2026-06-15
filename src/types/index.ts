export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  color: string;
  role: 'child' | 'parent';
  createdAt: string;
}

export interface Book {
  id: string;
  userId: string;
  title: string;
  author: string;
  category: string;
  totalPages: number;
  dailyGoal: number;
  coverUrl: string;
  createdAt: string;
}

export interface Checkin {
  id: string;
  userId: string;
  bookId: string;
  date: string;
  pagesRead: number;
  durationSeconds: number;
  note: string;
  parentComment: string;
  createdAt: string;
}

export interface Excerpt {
  id: string;
  userId: string;
  bookId: string;
  checkinDate: string;
  content: string;
  page: string;
  createdAt: string;
}

export interface Badge {
  id: string;
  userId: string;
  name: string;
  icon: string;
  description: string;
  condition: string;
  unlocked: boolean;
  unlockedAt: string | null;
}

export interface WeeklyStats {
  totalPages: number;
  totalMinutes: number;
  completedDays: number;
  completionRate: number;
  dailyData: { date: string; pages: number; minutes: number }[];
}

export const BOOK_CATEGORIES = [
  '文学小说',
  '科普百科',
  '历史传记',
  '童话故事',
  '诗词国学',
  '漫画绘本',
  '其他'
];

export const AVATAR_OPTIONS = [
  '🐶', '🐱', '🐰', '🦊', '🐻', '🐼', '🐨', '🦁', '🐯', '🦄', '🐸', '🐵', '👧', '👦', '🧒', '👶', '⭐', '🌟', '🌈', '🎈'
];

export const COLOR_OPTIONS = [
  { name: '橙子橙', value: 'orange' },
  { name: '天空蓝', value: 'sky' },
  { name: '森林绿', value: 'emerald' },
  { name: '樱花粉', value: 'pink' },
  { name: '梦幻紫', value: 'violet' },
  { name: '玫瑰红', value: 'rose' },
];

export const BADGE_DEFINITIONS: Omit<Badge, 'id' | 'userId' | 'unlocked' | 'unlockedAt'>[] = [
  { name: '书虫启程', icon: '📚', description: '添加第一本图书，开启阅读之旅', condition: '添加第1本图书' },
  { name: '初次打卡', icon: '✨', description: '完成第一次阅读打卡', condition: '完成第1次打卡' },
  { name: '七天坚持', icon: '🔥', description: '连续打卡7天，养成好习惯', condition: '连续打卡7天' },
  { name: '月度达人', icon: '🏆', description: '连续打卡30天，了不起的坚持', condition: '连续打卡30天' },
  { name: '百页读者', icon: '📖', description: '累计阅读100页', condition: '累计阅读100页' },
  { name: '半千之旅', icon: '🎯', description: '累计阅读500页，继续加油', condition: '累计阅读500页' },
  { name: '千页大师', icon: '👑', description: '累计阅读1000页，阅读小达人', condition: '累计阅读1000页' },
  { name: '博览群书', icon: '🎓', description: '读完3本书，知识面越来越广', condition: '读完3本书' },
  { name: '摘抄达人', icon: '✍️', description: '收藏5条精彩摘抄', condition: '收藏5条摘抄' },
  { name: '家长鼓励', icon: '💝', description: '获得10条家长评语', condition: '获得10条家长评语' },
];

export const BADGE_IDS = [
  'first-book', 'first-checkin', 'streak-7', 'streak-30',
  'pages-100', 'pages-500', 'pages-1000', 'books-3', 'excerpt-5', 'parent-10'
];
