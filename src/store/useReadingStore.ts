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

interface ReadingStore {
  users: UserProfile[];
  currentUserId: string | null;
  addUser: (data: Omit<UserProfile, 'id' | 'createdAt'>) => void;
  removeUser: (id: string) => void;
  updateUser: (id: string, data: Partial<UserProfile>) => void;
  switchUser: (id: string) => void;
  getCurrentUser: () => UserProfile | undefined;
  ensureUser: () => void;

  books: Book[];
  addBook: (book: Omit<Book, 'id' | 'userId' | 'createdAt'>) => void;
  removeBook: (id: string) => void;
  updateBook: (id: string, data: Partial<Book>) => void;
  getBookPagesRead: (bookId: string) => number;

  checkins: Checkin[];
  addCheckin: (checkin: Omit<Checkin, 'id' | 'userId' | 'createdAt'>) => void;
  removeCheckin: (id: string) => void;
  updateCheckin: (id: string, data: Partial<Checkin>) => void;
  getCheckinsByDate: (date: string) => Checkin[];
  getCheckinsByDateRange: (startDate: string, endDate: string) => Checkin[];
  getTodayCheckins: () => Checkin[];

  excerpts: Excerpt[];
  addExcerpt: (excerpt: Omit<Excerpt, 'id' | 'userId' | 'createdAt'>) => void;
  removeExcerpt: (id: string) => void;
  getExcerptsFiltered: (filters?: { bookId?: string; startDate?: string; endDate?: string }) => Excerpt[];

  badges: Badge[];
  newlyUnlockedBadge: Badge | null;
  unlockBadge: (badgeKey: string) => void;
  checkAndUnlockBadges: () => void;
  clearNewlyUnlockedBadge: () => void;

  getStreakDays: () => number;
  getWeeklyStats: () => WeeklyStats;
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
      },

      getExcerptsFiltered: (filters = {}) => {
        const { excerpts, currentUserId } = get();
        let result = excerpts.filter((e) => e.userId === currentUserId);
        if (filters.bookId) {
          result = result.filter((e) => e.bookId === filters.bookId);
        }
        if (filters.startDate) {
          result = result.filter((e) => {
            const d = new Date(e.createdAt).toISOString().split('T')[0];
            return d >= filters.startDate!;
          });
        }
        if (filters.endDate) {
          result = result.filter((e) => {
            const d = new Date(e.createdAt).toISOString().split('T')[0];
            return d <= filters.endDate!;
          });
        }
        return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
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
        const badges = state.badges.filter((b) => b.userId === uid);

        const streak = state.getStreakDays();
        const totalPages = state.getTotalPages();
        const completedBooks = state.getCompletedBooksCount();
        const excerptCount = state.excerpts.filter((e) => e.userId === uid).length;
        const parentCommentCount = state.getParentCommentCount();
        const hasBooks = state.books.filter((b) => b.userId === uid).length > 0;
        const hasCheckins = state.checkins.filter((c) => c.userId === uid).length > 0;

        const isLocked = (id: string) => !badges.find((b) => b.id === id)?.unlocked;

        if (hasBooks && isLocked('first-book')) state.unlockBadge('first-book');
        if (hasCheckins && isLocked('first-checkin')) state.unlockBadge('first-checkin');
        if (streak >= 7 && isLocked('streak-7')) state.unlockBadge('streak-7');
        if (streak >= 30 && isLocked('streak-30')) state.unlockBadge('streak-30');
        if (totalPages >= 100 && isLocked('pages-100')) state.unlockBadge('pages-100');
        if (totalPages >= 500 && isLocked('pages-500')) state.unlockBadge('pages-500');
        if (totalPages >= 1000 && isLocked('pages-1000')) state.unlockBadge('pages-1000');
        if (completedBooks >= 3 && isLocked('books-3')) state.unlockBadge('books-3');
        if (excerptCount >= 5 && isLocked('excerpt-5')) state.unlockBadge('excerpt-5');
        if (parentCommentCount >= 10 && isLocked('parent-10')) state.unlockBadge('parent-10');
      },

      getStreakDays: () => {
        const { checkins, currentUserId } = get();
        const dates = checkins.filter((c) => c.userId === currentUserId).map((c) => c.date);
        return getStreakDays(dates);
      },

      getWeeklyStats: () => {
        const uid = get().currentUserId;
        if (!uid)
          return { totalPages: 0, totalMinutes: 0, completedDays: 0, completionRate: 0, dailyData: [] };
        const { checkins, books } = get();
        const last7Days = getLast7Days();
        const dailyData = last7Days.map(({ date }) => {
          const dayCheckins = checkins.filter((c) => c.date === date && c.userId === uid);
          const pages = dayCheckins.reduce((sum, c) => sum + c.pagesRead, 0);
          const minutes = Math.round(dayCheckins.reduce((sum, c) => sum + c.durationSeconds, 0) / 60);
          return { date, pages, minutes };
        });
        const totalPages = dailyData.reduce((sum, d) => sum + d.pages, 0);
        const totalMinutes = dailyData.reduce((sum, d) => sum + d.minutes, 0);
        const completedDays = dailyData.filter((d) => d.pages > 0).length;
        const userBooks = books.filter((b) => b.userId === uid);
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
      onRehydrateStorage: () => (state) => {
        state?.ensureUser();
      },
      migrate: (persistedState: any) => {
        const state = persistedState as any;
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
        return state;
      },
    }
  )
);
