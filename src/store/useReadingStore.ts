import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Book, Checkin, Excerpt, Badge, WeeklyStats, UserProfile, ParentFeedback, FeedbackType, Challenge, ChallengeType, QuarterlyReview } from '@/types';
import { BADGE_DEFINITIONS, BADGE_IDS, BOOK_CATEGORIES } from '@/types';
import { getStreakDays, getToday, getLast7Days, getWeekStart } from '@/utils/date';

const generateId = (): string => Math.random().toString(36).substring(2, 11);

const initializeBadgesForUser = (userId: string): Badge[] => {
  return BADGE_DEFINITIONS.map((def, idx) => ({
    ...def,
    id: BADGE_IDS[idx],
    userId,
    unlocked: false,
    unlockedAt: null,
  }));
};

const createDefaultUser = (): UserProfile => {
  const uid = generateId();
  return {
    id: uid,
    name: '宝贝',
    avatar: '🦊',
    color: 'orange',
    role: 'child',
    createdAt: new Date().toISOString(),
  };
};

export interface ChildSummary {
  user: UserProfile;
  bookCount: number;
  totalPages: number;
  totalMinutes: number;
  streakDays: number;
  weeklyPages: number;
  weeklyMinutes: number;
  weeklyCompletedDays: number;
  currentBooks: Book[];
  recentBadges: Badge[];
  unlockedCount: number;
  totalBadgeCount: number;
}

interface ReadingStore {
  users: UserProfile[];
  currentUserId: string | null;
  addUser: (data: Omit<UserProfile, 'id' | 'createdAt'>) => void;
  removeUser: (id: string) => void;
  updateUser: (id: string, data: Partial<UserProfile>) => void;
  switchUser: (id: string) => void;
  getCurrentUser: () => UserProfile | undefined;
  ensureUser: () => void;
  getChildSummaries: () => ChildSummary[];

  books: Book[];
  addBook: (book: Omit<Book, 'id' | 'userId' | 'createdAt' | 'lastReadDate'>) => void;
  removeBook: (id: string) => void;
  updateBook: (id: string, data: Partial<Book>) => void;
  getBookPagesRead: (bookId: string) => number;
  getBookPagesReadForUser: (bookId: string, userId: string) => number;
  getBookLastReadDate: (bookId: string, userId: string) => string | null;

  checkins: Checkin[];
  addCheckin: (checkin: Omit<Checkin, 'id' | 'userId' | 'createdAt'>) => void;
  removeCheckin: (id: string) => void;
  updateCheckin: (id: string, data: Partial<Checkin>) => void;
  getCheckinsByDate: (date: string) => Checkin[];
  getCheckinsByDateRange: (startDate: string, endDate: string) => Checkin[];
  getCheckinsByDateForUser: (date: string, userId: string) => Checkin[];
  getCheckinsByDateRangeForUser: (startDate: string, endDate: string, userId: string) => Checkin[];
  getTodayCheckins: () => Checkin[];

  excerpts: Excerpt[];
  addExcerpt: (excerpt: Omit<Excerpt, 'id' | 'userId' | 'createdAt'>) => void;
  removeExcerpt: (id: string) => void;
  getExcerptsFiltered: (filters?: { bookId?: string; startDate?: string; endDate?: string }) => Excerpt[];
  getExcerptsByDate: (date: string) => Excerpt[];
  getExcerptsByBookForUser: (bookId: string, userId: string) => Excerpt[];

  badges: Badge[];
  newlyUnlockedBadge: Badge | null;
  unlockBadge: (badgeKey: string) => void;
  checkAndUnlockBadges: () => void;
  checkAndUnlockBadgesForUser: (userId: string) => void;
  clearNewlyUnlockedBadge: () => void;

  parentFeedbacks: ParentFeedback[];
  addParentFeedback: (fb: Omit<ParentFeedback, 'id' | 'createdAt'>) => void;
  removeParentFeedback: (id: string) => void;
  getFeedbacksForUser: (userId: string, filters?: { type?: FeedbackType; bookId?: string; weekStart?: string }) => ParentFeedback[];
  getFeedbacksByWeekForUser: (weekStart: string, userId: string) => ParentFeedback[];
  getFeedbacksByBookForUser: (bookId: string, userId: string) => ParentFeedback[];

  getStreakDays: () => number;
  getStreakDaysForUser: (userId: string) => number;
  getWeeklyStats: () => WeeklyStats;
  getWeeklyStatsForUser: (userId: string) => WeeklyStats;
  getMostReadBooks: () => { book: Book; totalPages: number }[];
  getCompletedBooksCount: () => number;
  getTotalPages: () => number;
  getTotalMinutes: () => number;
  getParentCommentCount: () => number;
  getUniqueDates: () => string[];
  getMonthlyReview: (year: number, month: number) => MonthlyReview;
  getQuarterlyReview: (startYear: number, startMonth: number) => QuarterlyReview;

  challenges: Challenge[];
  addChallenge: (challenge: Omit<Challenge, 'id' | 'createdAt' | 'completed'>) => void;
  updateChallenge: (id: string, data: Partial<Challenge>) => void;
  removeChallenge: (id: string) => void;
  getChallengesForUser: (userId: string) => Challenge[];
  getChallengesForMonth: (year: number, month: number) => Challenge[];
  getChallengeProgress: (challenge: Challenge) => number;
}

export interface BookProgressInfo {
  book: Book;
  pagesRead: number;
  lastReadDate: string | null;
  completed: boolean;
  completedAt: string | null;
  stuckDays: number;
}

export interface ChildMonthlyReview {
  user: UserProfile;
  totalPages: number;
  totalMinutes: number;
  completedDays: number;
  totalCheckins: number;
  completedBooks: BookProgressInfo[];
  inProgressBooks: BookProgressInfo[];
  stuckBooks: BookProgressInfo[];
  weeklyStats: { weekStart: string; pages: number; completedDays: number }[];
  mostStableWeek: { weekStart: string; completedDays: number } | null;
}

export interface MonthlyReview {
  year: number;
  month: number;
  familyTotalPages: number;
  familyTotalMinutes: number;
  familyTotalCheckins: number;
  children: ChildMonthlyReview[];
}

const today = () => getToday();

export const useReadingStore = create<ReadingStore>()(
  persist(
    (set, get) => {
      const defaultUser = createDefaultUser();
      return {
      users: [defaultUser],
      currentUserId: defaultUser.id,
      books: [],
      checkins: [],
      excerpts: [],
      badges: initializeBadgesForUser(defaultUser.id),
      newlyUnlockedBadge: null,
      parentFeedbacks: [],
      challenges: [],

      addUser: (data) => {
        const uid = generateId();
        const newUser: UserProfile = {
          ...data,
          id: uid,
          createdAt: new Date().toISOString(),
        };
        const newBadges = initializeBadgesForUser(uid);
        set((state) => ({
          users: [...state.users, newUser],
          badges: [...state.badges, ...newBadges],
        }));
      },

      removeUser: (id) => {
        set((state) => {
          const remainingUsers = state.users.filter((u) => u.id !== id);
          const willDeleteCurrent = state.currentUserId === id;
          const newCurrentId = willDeleteCurrent
            ? remainingUsers[0]?.id || null
            : state.currentUserId;
          return {
            users: remainingUsers,
            currentUserId: newCurrentId,
            books: state.books.filter((b) => b.userId !== id),
            checkins: state.checkins.filter((c) => c.userId !== id),
            excerpts: state.excerpts.filter((e) => e.userId !== id),
            badges: state.badges.filter((b) => b.userId !== id),
            parentFeedbacks: state.parentFeedbacks.filter((f) => f.userId !== id),
            challenges: state.challenges.filter((c) => c.userId !== id),
          };
        });
      },

      updateUser: (id, data) => {
        set((state) => ({
          users: state.users.map((u) => (u.id === id ? { ...u, ...data } : u)),
        }));
      },

      switchUser: (id) => set({ currentUserId: id }),

      getCurrentUser: () => {
        const { users, currentUserId } = get();
        return users.find((u) => u.id === currentUserId);
      },

      ensureUser: () => {
        const state = get();
        if (!state.currentUserId || state.users.length === 0) {
          const user = state.users.length > 0 ? state.users[0] : createDefaultUser();
          if (state.users.length === 0) {
            const newBadges = initializeBadgesForUser(user.id);
            set({
              users: [user],
              currentUserId: user.id,
              badges: newBadges,
            });
          } else {
            set({ currentUserId: user.id });
          }
        }
      },

      getChildSummaries: () => {
        const state = get();
        const children = state.users.filter((u) => u.role === 'child');
        return children.map((child) => {
          const userBooks = state.books.filter((b) => b.userId === child.id);
          const userCheckins = state.checkins.filter((c) => c.userId === child.id);
          const userBadges = state.badges.filter((b) => b.userId === child.id);
          const userExcerpts = state.excerpts.filter((e) => e.userId === child.id);

          const totalPages = userCheckins.reduce((s, c) => s + c.pagesRead, 0);
          const totalMinutes = Math.round(userCheckins.reduce((s, c) => s + c.durationSeconds, 0) / 60);
          const streakDays = get().getStreakDaysForUser(child.id);

          const last7Days = getLast7Days();
          const weekCheckins = userCheckins.filter((c) =>
            last7Days.some((d) => d.date === c.date)
          );
          const weeklyPages = weekCheckins.reduce((s, c) => s + c.pagesRead, 0);
          const weeklyMinutes = Math.round(weekCheckins.reduce((s, c) => s + c.durationSeconds, 0) / 60);
          const weeklyCompletedDays = new Set(weekCheckins.map((c) => c.date)).size;

          const booksWithMeta = userBooks
            .map((b) => {
              const pagesRead = get().getBookPagesReadForUser(b.id, child.id);
              const lastRead = get().getBookLastReadDate(b.id, child.id);
              return {
                ...b,
                lastReadDate: lastRead,
                _pagesRead: pagesRead,
                _inProgress: pagesRead < b.totalPages,
              };
            })
            .sort((a, b) => {
              const aDate = a.lastReadDate || '0000-00-00';
              const bDate = b.lastReadDate || '0000-00-00';
              if (bDate !== aDate) return bDate.localeCompare(aDate);
              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            });

          const inProgressBooks = booksWithMeta.filter((b) => b._inProgress);
          const currentBooks = (inProgressBooks.length > 0 ? inProgressBooks : booksWithMeta)
            .slice(0, 3)
            .map(({ _pagesRead, _inProgress, ...rest }) => rest);

          const unlockedBadges = userBadges.filter((b) => b.unlocked);
          const recentBadges = [...unlockedBadges]
            .sort((a, b) => new Date(b.unlockedAt!).getTime() - new Date(a.unlockedAt!).getTime())
            .slice(0, 3);

          return {
            user: child,
            bookCount: userBooks.length,
            totalPages,
            totalMinutes,
            streakDays,
            weeklyPages,
            weeklyMinutes,
            weeklyCompletedDays,
            currentBooks,
            recentBadges,
            unlockedCount: unlockedBadges.length,
            totalBadgeCount: userBadges.length,
          };
        });
      },

      addBook: (book) => {
        let uid = get().currentUserId;
        if (!uid) {
          get().ensureUser();
          uid = get().currentUserId;
        }
        if (!uid) return;
        const newBook: Book = {
          ...book,
          id: generateId(),
          userId: uid,
          lastReadDate: null,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ books: [...state.books, newBook] }));
        setTimeout(() => get().checkAndUnlockBadges(), 10);
      },

      removeBook: (id) => {
        set((state) => ({
          books: state.books.filter((b) => b.id !== id),
          checkins: state.checkins.filter((c) => c.bookId !== id),
          excerpts: state.excerpts.filter((e) => e.bookId !== id),
        }));
      },

      updateBook: (id, data) => {
        set((state) => ({
          books: state.books.map((b) => (b.id === id ? { ...b, ...data } : b)),
        }));
      },

      getBookPagesRead: (bookId) => {
        const { checkins, currentUserId } = get();
        return checkins
          .filter((c) => c.bookId === bookId && c.userId === currentUserId)
          .reduce((sum, c) => sum + c.pagesRead, 0);
      },

      getBookPagesReadForUser: (bookId, userId) => {
        const { checkins } = get();
        return checkins
          .filter((c) => c.bookId === bookId && c.userId === userId)
          .reduce((sum, c) => sum + c.pagesRead, 0);
      },

      getBookLastReadDate: (bookId, userId) => {
        const { checkins } = get();
        const bookCheckins = checkins.filter((c) => c.bookId === bookId && c.userId === userId);
        if (bookCheckins.length === 0) return null;
        return bookCheckins.reduce((latest, c) => (c.date > latest ? c.date : latest), '0000-00-00');
      },

      addCheckin: (checkin) => {
        const uid = get().currentUserId;
        if (!uid) return;
        const newCheckin: Checkin = {
          ...checkin,
          id: generateId(),
          userId: uid,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          checkins: [...state.checkins, newCheckin],
          books: state.books.map((b) => {
            if (b.id === checkin.bookId && b.userId === uid) {
              const newDate = checkin.date;
              const oldDate = b.lastReadDate || '';
              return newDate > oldDate ? { ...b, lastReadDate: newDate } : b;
            }
            return b;
          }),
        }));
        setTimeout(() => get().checkAndUnlockBadges(), 10);
      },

      removeCheckin: (id) => {
        set((state) => ({
          checkins: state.checkins.filter((c) => c.id !== id),
        }));
        setTimeout(() => get().checkAndUnlockBadges(), 10);
      },

      updateCheckin: (id, data) => {
        set((state) => ({
          checkins: state.checkins.map((c) => (c.id === id ? { ...c, ...data } : c)),
        }));
        setTimeout(() => get().checkAndUnlockBadges(), 10);
      },

      getCheckinsByDate: (date) => {
        const { checkins, currentUserId } = get();
        return checkins.filter((c) => c.date === date && c.userId === currentUserId);
      },

      getCheckinsByDateRange: (startDate, endDate) => {
        const { checkins, currentUserId } = get();
        return checkins.filter(
          (c) => c.userId === currentUserId && c.date >= startDate && c.date <= endDate
        );
      },

      getCheckinsByDateForUser: (date, userId) => {
        const { checkins } = get();
        return checkins.filter((c) => c.date === date && c.userId === userId);
      },

      getCheckinsByDateRangeForUser: (startDate, endDate, userId) => {
        const { checkins } = get();
        return checkins.filter(
          (c) => c.userId === userId && c.date >= startDate && c.date <= endDate
        );
      },

      getTodayCheckins: () => get().getCheckinsByDate(today()),

      addExcerpt: (excerpt) => {
        const uid = get().currentUserId;
        if (!uid) return;
        const newExcerpt: Excerpt = {
          ...excerpt,
          id: generateId(),
          userId: uid,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ excerpts: [...state.excerpts, newExcerpt] }));
        setTimeout(() => get().checkAndUnlockBadges(), 10);
      },

      removeExcerpt: (id) => {
        set((state) => ({
          excerpts: state.excerpts.filter((e) => e.id !== id),
        }));
        setTimeout(() => get().checkAndUnlockBadges(), 10);
      },

      getExcerptsFiltered: (filters = {}) => {
        const { excerpts, currentUserId } = get();
        let result = excerpts.filter((e) => e.userId === currentUserId);
        if (filters.bookId) {
          result = result.filter((e) => e.bookId === filters.bookId);
        }
        if (filters.startDate) {
          result = result.filter((e) => e.checkinDate >= filters.startDate!);
        }
        if (filters.endDate) {
          result = result.filter((e) => e.checkinDate <= filters.endDate!);
        }
        return result.sort((a, b) => {
          const dateCompare = b.checkinDate.localeCompare(a.checkinDate);
          if (dateCompare !== 0) return dateCompare;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
      },

      getExcerptsByDate: (date) => {
        const { excerpts, currentUserId } = get();
        return excerpts
          .filter((e) => e.userId === currentUserId && e.checkinDate === date)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      },

      getExcerptsByBookForUser: (bookId, userId) => {
        const { excerpts } = get();
        return excerpts
          .filter((e) => e.userId === userId && e.bookId === bookId)
          .sort((a, b) => b.checkinDate.localeCompare(a.checkinDate));
      },

      addParentFeedback: (fb) => {
        if (!fb.userId || !fb.content.trim()) return;
        const newFb: ParentFeedback = {
          ...fb,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ parentFeedbacks: [...state.parentFeedbacks, newFb] }));
      },

      removeParentFeedback: (id) => {
        set((state) => ({
          parentFeedbacks: state.parentFeedbacks.filter((f) => f.id !== id),
        }));
      },

      getFeedbacksForUser: (userId, filters = {}) => {
        const { parentFeedbacks } = get();
        let result = parentFeedbacks.filter((f) => f.userId === userId);
        if (filters.type) result = result.filter((f) => f.type === filters.type);
        if (filters.bookId) result = result.filter((f) => f.bookId === filters.bookId);
        if (filters.weekStart) result = result.filter((f) => f.weekStart === filters.weekStart);
        return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      },

      getFeedbacksByWeekForUser: (weekStart, userId) => {
        return get().getFeedbacksForUser(userId, { weekStart });
      },

      getFeedbacksByBookForUser: (bookId, userId) => {
        return get().getFeedbacksForUser(userId, { bookId });
      },

      unlockBadge: (badgeKey) => {
        const uid = get().currentUserId;
        if (!uid) return;
        set((state) => {
          const badge = state.badges.find((b) => b.id === badgeKey && b.userId === uid);
          if (!badge || badge.unlocked) return {};
          const updatedBadge: Badge = {
            ...badge,
            unlocked: true,
            unlockedAt: new Date().toISOString(),
          };
          return {
            badges: state.badges.map((b) =>
              b.id === badgeKey && b.userId === uid ? updatedBadge : b
            ),
            newlyUnlockedBadge: updatedBadge,
          };
        });
      },

      clearNewlyUnlockedBadge: () => set({ newlyUnlockedBadge: null }),

      checkAndUnlockBadges: () => {
        const state = get();
        const uid = state.currentUserId;
        if (!uid) return;
        get().checkAndUnlockBadgesForUser(uid);
      },

      checkAndUnlockBadgesForUser: (userId) => {
        const state = get();
        const badges = state.badges.filter((b) => b.userId === userId);

        const streak = get().getStreakDaysForUser(userId);
        const userCheckins = state.checkins.filter((c) => c.userId === userId);
        const userBooks = state.books.filter((b) => b.userId === userId);
        const userExcerpts = state.excerpts.filter((e) => e.userId === userId);
        const totalPages = userCheckins.reduce((s, c) => s + c.pagesRead, 0);
        const parentCommentCount = userCheckins.filter(
          (c) => c.parentComment && c.parentComment.trim().length > 0
        ).length;

        let completedBooks = 0;
        userBooks.forEach((book) => {
          const pagesRead = get().getBookPagesReadForUser(book.id, userId);
          if (pagesRead >= book.totalPages) completedBooks++;
        });

        const hasBooks = userBooks.length > 0;
        const hasCheckins = userCheckins.length > 0;
        const excerptCount = userExcerpts.length;

        const isLocked = (id: string) => !badges.find((b) => b.id === id)?.unlocked;

        const prevUserId = state.currentUserId;
        set({ currentUserId: userId });

        if (hasBooks && isLocked('first-book')) get().unlockBadge('first-book');
        if (hasCheckins && isLocked('first-checkin')) get().unlockBadge('first-checkin');
        if (streak >= 7 && isLocked('streak-7')) get().unlockBadge('streak-7');
        if (streak >= 30 && isLocked('streak-30')) get().unlockBadge('streak-30');
        if (totalPages >= 100 && isLocked('pages-100')) get().unlockBadge('pages-100');
        if (totalPages >= 500 && isLocked('pages-500')) get().unlockBadge('pages-500');
        if (totalPages >= 1000 && isLocked('pages-1000')) get().unlockBadge('pages-1000');
        if (completedBooks >= 3 && isLocked('books-3')) get().unlockBadge('books-3');
        if (excerptCount >= 5 && isLocked('excerpt-5')) get().unlockBadge('excerpt-5');
        if (parentCommentCount >= 10 && isLocked('parent-10')) get().unlockBadge('parent-10');

        set({ currentUserId: prevUserId });
      },

      getStreakDays: () => {
        const { checkins, currentUserId } = get();
        const dates = checkins.filter((c) => c.userId === currentUserId).map((c) => c.date);
        return getStreakDays(dates);
      },

      getStreakDaysForUser: (userId) => {
        const { checkins } = get();
        const dates = checkins.filter((c) => c.userId === userId).map((c) => c.date);
        return getStreakDays(dates);
      },

      getWeeklyStats: () => {
        const uid = get().currentUserId;
        if (!uid) return { totalPages: 0, totalMinutes: 0, completedDays: 0, completionRate: 0, dailyData: [] };
        return get().getWeeklyStatsForUser(uid);
      },

      getWeeklyStatsForUser: (userId) => {
        const { checkins, books } = get();
        const last7Days = getLast7Days();
        const dailyData = last7Days.map(({ date }) => {
          const dayCheckins = checkins.filter((c) => c.date === date && c.userId === userId);
          const pages = dayCheckins.reduce((sum, c) => sum + c.pagesRead, 0);
          const minutes = Math.round(dayCheckins.reduce((sum, c) => sum + c.durationSeconds, 0) / 60);
          return { date, pages, minutes };
        });
        const totalPages = dailyData.reduce((sum, d) => sum + d.pages, 0);
        const totalMinutes = dailyData.reduce((sum, d) => sum + d.minutes, 0);
        const completedDays = dailyData.filter((d) => d.pages > 0).length;
        const userBooks = books.filter((b) => b.userId === userId);
        const dailyGoalTotal = userBooks.reduce((sum, b) => sum + b.dailyGoal, 0);
        const weeklyGoal = dailyGoalTotal * 7;
        const completionRate = weeklyGoal > 0 ? Math.min(100, Math.round((totalPages / weeklyGoal) * 100)) : 0;
        return {
          totalPages, totalMinutes, completedDays, completionRate,
          dailyData: dailyData.map(({ date, pages, minutes }) => ({ date, pages, minutes })),
        };
      },

      getMostReadBooks: () => {
        const uid = get().currentUserId;
        if (!uid) return [];
        const { books, checkins } = get();
        const userBooks = books.filter((b) => b.userId === uid);
        const userCheckins = checkins.filter((c) => c.userId === uid);
        const bookPageMap = new Map<string, number>();
        userCheckins.forEach((c) => {
          const current = bookPageMap.get(c.bookId) || 0;
          bookPageMap.set(c.bookId, current + c.pagesRead);
        });
        return userBooks
          .map((book) => ({ book, totalPages: bookPageMap.get(book.id) || 0 }))
          .filter((item) => item.totalPages > 0)
          .sort((a, b) => b.totalPages - a.totalPages)
          .slice(0, 5);
      },

      getCompletedBooksCount: () => {
        const uid = get().currentUserId;
        if (!uid) return 0;
        const { books } = get();
        return books.filter((book) => {
          if (book.userId !== uid) return false;
          const pagesRead = get().getBookPagesRead(book.id);
          return pagesRead >= book.totalPages;
        }).length;
      },

      getTotalPages: () => {
        const { checkins, currentUserId } = get();
        return checkins
          .filter((c) => c.userId === currentUserId)
          .reduce((sum, c) => sum + c.pagesRead, 0);
      },

      getTotalMinutes: () => {
        const { checkins, currentUserId } = get();
        return Math.round(
          checkins.filter((c) => c.userId === currentUserId).reduce((sum, c) => sum + c.durationSeconds, 0) / 60
        );
      },

      getParentCommentCount: () => {
        const { checkins, currentUserId } = get();
        return checkins.filter(
          (c) => c.userId === currentUserId && c.parentComment && c.parentComment.trim().length > 0
        ).length;
      },

      getUniqueDates: () => {
        const { checkins, currentUserId } = get();
        const dates = new Set<string>();
        checkins.forEach((c) => {
          if (c.userId === currentUserId) dates.add(c.date);
        });
        return Array.from(dates).sort().reverse();
      },

      getMonthlyReview: (year, month) => {
        const state = get();
        const children = state.users.filter((u) => u.role === 'child');
        const firstDay = `${year}-${String(month + 1).padStart(2, '0')}-01`;
        const lastDate = new Date(year, month + 1, 0);
        const lastDay = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDate.getDate()).padStart(2, '0')}`;
        const todayStr = today();

        const getWeekStart = (dateStr: string): string => {
          const d = new Date(dateStr);
          const day = d.getDay();
          const diff = day === 0 ? 6 : day - 1;
          d.setDate(d.getDate() - diff);
          return d.toISOString().split('T')[0];
        };

        const daysDiff = (a: string, b: string): number => {
          const da = new Date(a).getTime();
          const db = new Date(b).getTime();
          return Math.round(Math.abs(db - da) / (1000 * 60 * 60 * 24));
        };

        const childrenReviews = children.map((child) => {
          const userBooks = state.books.filter((b) => b.userId === child.id);
          const monthCheckins = get().getCheckinsByDateRangeForUser(firstDay, lastDay, child.id);
          const totalPages = monthCheckins.reduce((s, c) => s + c.pagesRead, 0);
          const totalMinutes = Math.round(monthCheckins.reduce((s, c) => s + c.durationSeconds, 0) / 60);
          const completedDays = new Set(monthCheckins.map((c) => c.date)).size;

          const weekMap = new Map<string, { pages: number; completedDays: number; days: Set<string> }>();
          monthCheckins.forEach((c) => {
            const ws = getWeekStart(c.date);
            const entry = weekMap.get(ws) || { pages: 0, completedDays: 0, days: new Set<string>() };
            entry.pages += c.pagesRead;
            if (!entry.days.has(c.date)) {
              entry.completedDays += 1;
              entry.days.add(c.date);
            }
            weekMap.set(ws, entry);
          });
          const weeklyStats = Array.from(weekMap.entries())
            .map(([weekStart, data]) => ({ weekStart, pages: data.pages, completedDays: data.completedDays }))
            .sort((a, b) => a.weekStart.localeCompare(b.weekStart));
          const mostStableWeek = weeklyStats.length > 0
            ? weeklyStats.reduce((best, w) => (w.completedDays > best.completedDays ? w : best), weeklyStats[0])
            : null;

          const booksProgress: BookProgressInfo[] = userBooks.map((book) => {
            const pagesRead = get().getBookPagesReadForUser(book.id, child.id);
            const lastRead = get().getBookLastReadDate(book.id, child.id);
            const completed = pagesRead >= book.totalPages;
            let completedAt: string | null = null;
            if (completed) {
              let runningTotal = 0;
              const sortedCheckins = [...monthCheckins.filter((c) => c.bookId === book.id),
                ...state.checkins.filter((c) => c.userId === child.id && c.bookId === book.id && c.date < firstDay)
              ].sort((a, b) => a.date.localeCompare(b.date));
              for (const c of sortedCheckins) {
                runningTotal += c.pagesRead;
                if (runningTotal >= book.totalPages) {
                  completedAt = c.date;
                  break;
                }
              }
            }
            let stuckDays = 0;
            if (!completed && pagesRead > 0 && lastRead) {
              stuckDays = daysDiff(lastRead, todayStr);
            }
            return { book, pagesRead, lastReadDate: lastRead, completed, completedAt, stuckDays };
          });

          const completedBooks = booksProgress
            .filter((b) => b.completed && b.completedAt && b.completedAt >= firstDay && b.completedAt <= lastDay)
            .sort((a, b) => (a.completedAt || '').localeCompare(b.completedAt || ''));

          const inProgressBooks = booksProgress
            .filter((b) => !b.completed && b.pagesRead > 0)
            .sort((a, b) => b.pagesRead - a.pagesRead);

          const stuckBooks = booksProgress
            .filter((b) => !b.completed && b.pagesRead > 0 && b.stuckDays >= 7)
            .sort((a, b) => b.stuckDays - a.stuckDays);

          return {
            user: child,
            totalPages,
            totalMinutes,
            completedDays,
            totalCheckins: monthCheckins.length,
            completedBooks,
            inProgressBooks,
            stuckBooks,
            weeklyStats,
            mostStableWeek: mostStableWeek
              ? { weekStart: mostStableWeek.weekStart, completedDays: mostStableWeek.completedDays }
              : null,
          };
        });

        let familyTotalPages = 0;
        let familyTotalMinutes = 0;
        let familyTotalCheckins = 0;
        childrenReviews.forEach((c) => {
          familyTotalPages += c.totalPages;
          familyTotalMinutes += c.totalMinutes;
          familyTotalCheckins += c.totalCheckins;
        });

        return {
          year,
          month,
          familyTotalPages,
          familyTotalMinutes,
          familyTotalCheckins,
          children: childrenReviews,
        };
      },

      getQuarterlyReview: (startYear, startMonth) => {
        const state = get();
        const children = state.users.filter((u) => u.role === 'child');
        const months = [];
        for (let i = 0; i < 3; i++) {
          const d = new Date(startYear, startMonth + i, 1);
          months.push({ year: d.getFullYear(), month: d.getMonth() });
        }

        const daysDiff = (a: string, b: string): number => {
          const da = new Date(a).getTime();
          const db = new Date(b).getTime();
          return Math.round(Math.abs(db - da) / (1000 * 60 * 60 * 24));
        };

        const childrenReviews = children.map((child) => {
          const monthReviews = months.map((m) => {
            const rev = get().getMonthlyReview(m.year, m.month);
            const childRev = rev.children.find((c) => c.user.id === child.id);
            return {
              year: m.year,
              month: m.month,
              totalPages: childRev?.totalPages || 0,
              completedDays: childRev?.completedDays || 0,
              completedBooks: childRev?.completedBooks.length || 0,
            };
          });

          const firstMonth = months[0];
          const lastMonth = months[2];
          const firstDay = `${firstMonth.year}-${String(firstMonth.month + 1).padStart(2, '0')}-01`;
          const lastDate = new Date(lastMonth.year, lastMonth.month + 1, 0);
          const lastDay = `${lastMonth.year}-${String(lastMonth.month + 1).padStart(2, '0')}-${String(lastDate.getDate()).padStart(2, '0')}`;

          const quarterCheckins = get().getCheckinsByDateRangeForUser(firstDay, lastDay, child.id);
          const totalPages = quarterCheckins.reduce((s, c) => s + c.pagesRead, 0);
          const totalMinutes = Math.round(quarterCheckins.reduce((s, c) => s + c.durationSeconds, 0) / 60);
          const completedDays = new Set(quarterCheckins.map((c) => c.date)).size;

          const userBooks = state.books.filter((b) => b.userId === child.id);
          const completedBooks: { book: Book; completedAt: string }[] = [];
          userBooks.forEach((book) => {
            const pagesRead = get().getBookPagesReadForUser(book.id, child.id);
            if (pagesRead >= book.totalPages) {
              const allCheckins = state.checkins
                .filter((c) => c.userId === child.id && c.bookId === book.id)
                .sort((a, b) => a.date.localeCompare(b.date));
              let running = 0;
              for (const c of allCheckins) {
                running += c.pagesRead;
                if (running >= book.totalPages) {
                  if (c.date >= firstDay && c.date <= lastDay) {
                    completedBooks.push({ book, completedAt: c.date });
                  }
                  break;
                }
              }
            }
          });

          const categoryMap = new Map<string, { pages: number; books: Set<string> }>();
          BOOK_CATEGORIES.forEach((cat) => categoryMap.set(cat, { pages: 0, books: new Set() }));
          quarterCheckins.forEach((c) => {
            const book = userBooks.find((b) => b.id === c.bookId);
            if (book) {
              const entry = categoryMap.get(book.category) || categoryMap.get('其他')!;
              entry.pages += c.pagesRead;
              entry.books.add(book.id);
            }
          });
          const categoryBreakdown = Array.from(categoryMap.entries())
            .map(([category, data]) => ({ category, pages: data.pages, books: data.books.size }))
            .sort((a, b) => b.pages - a.pages)
            .filter((c) => c.pages > 0);

          const categoryTrend = BOOK_CATEGORIES.map((cat) => {
            const month1 = monthReviews[0].totalPages > 0 ? getCategoryPagesForMonth(child.id, firstMonth.year, firstMonth.month, cat) : 0;
            const month2 = monthReviews[1].totalPages > 0 ? getCategoryPagesForMonth(child.id, months[1].year, months[1].month, cat) : 0;
            const month3 = monthReviews[2].totalPages > 0 ? getCategoryPagesForMonth(child.id, lastMonth.year, lastMonth.month, cat) : 0;
            return { category: cat, month1, month2, month3 };
          }).filter((c) => c.month1 + c.month2 + c.month3 > 0);

          const sortedDates = Array.from(new Set(quarterCheckins.map((c) => c.date))).sort();
          let longestGap: { days: number; startDate: string; endDate: string } | null = null;
          const gapPeriods = new Map<string, number>();
          for (let i = 1; i < sortedDates.length; i++) {
            const gap = daysDiff(sortedDates[i - 1], sortedDates[i]);
            if (gap > 1) {
              const startD = new Date(sortedDates[i - 1]);
              startD.setDate(startD.getDate() + 1);
              const endD = new Date(sortedDates[i]);
              endD.setDate(endD.getDate() - 1);
              const currentGap = {
                days: gap - 1,
                startDate: startD.toISOString().split('T')[0],
                endDate: endD.toISOString().split('T')[0],
              };
              if (!longestGap || currentGap.days > longestGap.days) {
                longestGap = currentGap;
              }
              for (let d = new Date(startD); d <= endD; d.setDate(d.getDate() + 1)) {
                const weekday = ['日', '一', '二', '三', '四', '五', '六'][d.getDay()];
                const period = d.getDay() === 0 || d.getDay() === 6 ? '周末' : '周' + weekday;
                gapPeriods.set(period, (gapPeriods.get(period) || 0) + 1);
              }
            }
          }
          const commonGapPeriods = Array.from(gapPeriods.entries())
            .map(([period, count]) => ({ period, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 3);

          const totalDays = daysDiff(firstDay, lastDay) + 1;
          const stabilityScore = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;

          return {
            user: child,
            months: monthReviews,
            totalPages,
            totalMinutes,
            completedDays,
            completedBooks,
            categoryBreakdown,
            categoryTrend,
            longestGap,
            commonGapPeriods,
            stabilityScore,
          };
        });

        function getCategoryPagesForMonth(userId: string, year: number, month: number, category: string): number {
          const firstD = `${year}-${String(month + 1).padStart(2, '0')}-01`;
          const lastDate = new Date(year, month + 1, 0);
          const lastD = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDate.getDate()).padStart(2, '0')}`;
          const checkins = get().getCheckinsByDateRangeForUser(firstD, lastD, userId);
          const userBks = state.books.filter((b) => b.userId === userId);
          return checkins
            .filter((c) => userBks.find((b) => b.id === c.bookId)?.category === category)
            .reduce((s, c) => s + c.pagesRead, 0);
        }

        return {
          startYear,
          startMonth,
          children: childrenReviews,
        };
      },

      addChallenge: (challenge) => {
        const newChallenge: Challenge = {
          ...challenge,
          id: generateId(),
          completed: false,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ challenges: [...state.challenges, newChallenge] }));
      },

      updateChallenge: (id, data) => {
        set((state) => ({
          challenges: state.challenges.map((c) => (c.id === id ? { ...c, ...data } : c)),
        }));
      },

      removeChallenge: (id) => {
        set((state) => ({
          challenges: state.challenges.filter((c) => c.id !== id),
        }));
      },

      getChallengesForUser: (userId) => {
        return get().challenges
          .filter((c) => c.userId === userId)
          .sort((a, b) => b.year - a.year || b.month - a.month);
      },

      getChallengesForMonth: (year, month) => {
        return get().challenges.filter((c) => c.year === year && c.month === month);
      },

      getChallengeProgress: (challenge) => {
        const { type, target, category, userId, year, month } = challenge;
        const rev = get().getMonthlyReview(year, month);
        const childRev = rev.children.find((c) => c.user.id === userId);
        if (!childRev) return 0;

        if (type === 'books_count') {
          return Math.min(100, Math.round((childRev.completedBooks.length / target) * 100));
        }
        if (type === 'streak_weeks') {
          const weekCheckins = childRev.weeklyStats.filter((w) => w.completedDays >= 1).length;
          return Math.min(100, Math.round((weekCheckins / target) * 100));
        }
        if (type === 'category_pages') {
          const userBooks = get().books.filter((b) => b.userId === userId);
          const categoryPages = childRev.totalPages > 0
            ? getCategoryPagesForMonthStore(userId, year, month, category || '文学小说')
            : 0;
          return Math.min(100, Math.round((categoryPages / target) * 100));
        }
        return 0;

        function getCategoryPagesForMonthStore(uid: string, y: number, m: number, cat: string): number {
          const s = get();
          const firstD = `${y}-${String(m + 1).padStart(2, '0')}-01`;
          const lastDate = new Date(y, m + 1, 0);
          const lastD = `${y}-${String(m + 1).padStart(2, '0')}-${String(lastDate.getDate()).padStart(2, '0')}`;
          const monthCheckins = s.getCheckinsByDateRangeForUser(firstD, lastD, uid);
          const userBks = s.books.filter((b) => b.userId === uid);
          return monthCheckins
            .filter((c) => userBks.find((b) => b.id === c.bookId)?.category === cat)
            .reduce((sum, c) => sum + c.pagesRead, 0);
        }
      },
    };
    },
    {
      name: 'family-reading-storage-v2',
      version: 5,
      onRehydrateStorage: () => (state) => {
        state?.ensureUser();
      },
      migrate: (persistedState: any, version: number) => {
        const state = persistedState as any;
        if (!version || version < 2) {
          if (!state.users || state.users.length === 0) {
            const defaultUser = createDefaultUser();
            const newBadges = initializeBadgesForUser(defaultUser.id);
            state.users = [defaultUser];
            state.currentUserId = defaultUser.id;
            state.books = (state.books || []).map((b: any) => ({ ...b, userId: defaultUser.id }));
            state.checkins = (state.checkins || []).map((c: any) => ({ ...c, userId: defaultUser.id }));
            state.excerpts = (state.excerpts || []).map((e: any) => ({ ...e, userId: defaultUser.id }));
            state.badges = newBadges;
          }
        }
        if (!version || version < 3) {
          if (state.excerpts) {
            state.excerpts = state.excerpts.map((e: any) => {
              if (!e.checkinDate) {
                const d = new Date(e.createdAt).toISOString().split('T')[0];
                return { ...e, checkinDate: d };
              }
              return e;
            });
          }
        }
        if (!version || version < 4) {
          if (state.books) {
            state.books = state.books.map((b: any) => {
              if (b.lastReadDate === undefined) {
                return { ...b, lastReadDate: null };
              }
              return b;
            });
          }
          if (!state.parentFeedbacks) {
            state.parentFeedbacks = [];
          }
        }
        if (!version || version < 5) {
          if (!state.challenges) {
            state.challenges = [];
          }
        }
        return state;
      },
    }
  )
);
