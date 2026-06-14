export interface Book {
  id: string;
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
  bookId: string;
  content: string;
  page: string;
  createdAt: string;
}

export interface Badge {
  id: string;
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

export const BADGE_DEFINITIONS: Omit<Badge, 'unlocked' | 'unlockedAt'>[] = [
  { id: 'first-book', name: '书虫启程', icon: '📚', description: '添加第一本图书，开启阅读之旅', condition: '添加第1本图书' },
  { id: 'first-checkin', name: '初次打卡', icon: '✨', description: '完成第一次阅读打卡', condition: '完成第1次打卡' },
  { id: 'streak-7', name: '七天坚持', icon: '🔥', description: '连续打卡7天，养成好习惯', condition: '连续打卡7天' },
  { id: 'streak-30', name: '月度达人', icon: '🏆', description: '连续打卡30天，了不起的坚持', condition: '连续打卡30天' },
  { id: 'pages-100', name: '百页读者', icon: '📖', description: '累计阅读100页', condition: '累计阅读100页' },
  { id: 'pages-500', name: '半千之旅', icon: '🎯', description: '累计阅读500页，继续加油', condition: '累计阅读500页' },
  { id: 'pages-1000', name: '千页大师', icon: '👑', description: '累计阅读1000页，阅读小达人', condition: '累计阅读1000页' },
  { id: 'books-3', name: '博览群书', icon: '🎓', description: '读完3本书，知识面越来越广', condition: '读完3本书' },
  { id: 'excerpt-5', name: '摘抄达人', icon: '✍️', description: '收藏5条精彩摘抄', condition: '收藏5条摘抄' },
  { id: 'parent-10', name: '家长鼓励', icon: '💝', description: '获得10条家长评语', condition: '获得10条家长评语' },
];
