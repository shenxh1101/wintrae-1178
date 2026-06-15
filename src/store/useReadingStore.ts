import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Book, Checkin, Excerpt, Badge, WeeklyStats, UserProfile } from '@/types';
import { BADGE_DEFINITIONS, BADGE_IDS } from '@/types';
import { getStreakDays, getToday, getLast7Days } from '@/utils/date';

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
  addBook: (book: Omit<Book, 'id' | 'userId' | 'createdAt'>) => void;
  removeBook: (id: string) => void;
  updateBook: (id: string, data: Partial<Book>) => void;
  getBookPagesRead: (bookId: string) => number;
  getBookPagesReadForUser: (bookId: string, userId: string) => number;

  checkins: Checkin[];
  addCheckin: (checkin: Omit<Checkin, 'id' | 'userId' | 'createdAt'>) => void;
  removeCheckin: (id: string) => void;
  updateCheckin: (id: string, data: Partial<Checkin>) => void;
  getCheckinsByDate: (date: string) => Checkin[];
  getCheckinsByDateRange: (startDate: string, endDate: string) => Checkin[];
  getCheckinsByDateForUser: (date: string, userId: string) => Checkin[];
  getTodayCheckins: () => Checkin[];

  excerpts: Excerpt[];
  addExcerpt: (excerpt: Omit<Excerpt, 'id' | 'userId' | 'createdAt'>) => void;
  removeExcerpt: (id: string) => void;
  getExcerptsFiltered: (filters?: { bookId?: string; startDate?: string; endDate?: string }) => Excerpt[];
  getExcerptsByDate: (date: string) => Excerpt[];

  badges: Badge[];
  newlyUnlockedBadge: Badge | null;
  unlockBadge: (badgeKey: string) => void;
  checkAndUnlockBadges: () => void;
  checkAndUnlockBadgesForUser: (userId: string) => void;
  clearNewlyUnlockedBadge: () => void;

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

          const currentBooks = userBooks.filter((b) => {
            const pagesRead = get().getBookPagesReadForUser(b.id, child.id);
            return pagesRead < b.totalPages;
          }).slice(0, 3);

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

      addCheckin: (checkin) => {
        const uid = get().currentUserId;
        if (!uid) return;
        const newCheckin: Checkin = {
          ...checkin,
          id: generateId(),
          userId: uid,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ checkins: [...state.checkins, newCheckin] }));
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
    };
    },
    {
      name: 'family-reading-storage-v2',
      version: 3,
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
        return state;
      },
    }
  )
);
