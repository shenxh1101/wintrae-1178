import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Book, Checkin, Excerpt, Badge, WeeklyStats } from '@/types';
import { BADGE_DEFINITIONS } from '@/types';
import { getStreakDays, getToday, getLast7Days, getDaysAgo } from '@/utils/date';

const generateId = (): string => Math.random().toString(36).substring(2, 11);

const initializeBadges = (): Badge[] => {
  return BADGE_DEFINITIONS.map((def) => ({
    ...def,
    unlocked: false,
    unlockedAt: null,
  }));
};

interface ReadingStore {
  books: Book[];
  checkins: Checkin[];
  excerpts: Excerpt[];
  badges: Badge[];
  newlyUnlockedBadge: Badge | null;

  addBook: (book: Omit<Book, 'id' | 'createdAt'>) => void;
  removeBook: (id: string) => void;
  updateBook: (id: string, data: Partial<Book>) => void;
  getBookPagesRead: (bookId: string) => number;

  addCheckin: (checkin: Omit<Checkin, 'id' | 'createdAt'>) => void;
  getTodayCheckins: () => Checkin[];

  addExcerpt: (excerpt: Omit<Excerpt, 'id' | 'createdAt'>) => void;
  removeExcerpt: (id: string) => void;

  unlockBadge: (badgeId: string) => void;
  checkAndUnlockBadges: () => void;
  clearNewlyUnlockedBadge: () => void;

  getStreakDays: () => number;
  getWeeklyStats: () => WeeklyStats;
  getMostReadBooks: () => { book: Book; totalPages: number }[];
  getCompletedBooksCount: () => number;
  getTotalPages: () => number;
  getTotalMinutes: () => number;
  getParentCommentCount: () => number;
}

export const useReadingStore = create<ReadingStore>()(
  persist(
    (set, get) => ({
      books: [],
      checkins: [],
      excerpts: [],
      badges: initializeBadges(),
      newlyUnlockedBadge: null,

      addBook: (book) => {
        const newBook: Book = {
          ...book,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ books: [...state.books, newBook] }));
        get().checkAndUnlockBadges();
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
        const { checkins } = get();
        return checkins
          .filter((c) => c.bookId === bookId)
          .reduce((sum, c) => sum + c.pagesRead, 0);
      },

      addCheckin: (checkin) => {
        const newCheckin: Checkin = {
          ...checkin,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ checkins: [...state.checkins, newCheckin] }));
        get().checkAndUnlockBadges();
      },

      getTodayCheckins: () => {
        const today = getToday();
        return get().checkins.filter((c) => c.date === today);
      },

      addExcerpt: (excerpt) => {
        const newExcerpt: Excerpt = {
          ...excerpt,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ excerpts: [...state.excerpts, newExcerpt] }));
        get().checkAndUnlockBadges();
      },

      removeExcerpt: (id) => {
        set((state) => ({
          excerpts: state.excerpts.filter((e) => e.id !== id),
        }));
      },

      unlockBadge: (badgeId) => {
        set((state) => {
          const badge = state.badges.find((b) => b.id === badgeId);
          if (!badge || badge.unlocked) return state;
          return {
            badges: state.badges.map((b) =>
              b.id === badgeId
                ? { ...b, unlocked: true, unlockedAt: new Date().toISOString() }
                : b
            ),
            newlyUnlockedBadge: {
              ...badge,
              unlocked: true,
              unlockedAt: new Date().toISOString(),
            },
          };
        });
      },

      clearNewlyUnlockedBadge: () => {
        set({ newlyUnlockedBadge: null });
      },

      checkAndUnlockBadges: () => {
        const state = get();
        const badges = state.badges;
        const streak = state.getStreakDays();
        const totalPages = state.getTotalPages();
        const completedBooks = state.getCompletedBooksCount();
        const excerptCount = state.excerpts.length;
        const parentCommentCount = state.getParentCommentCount();
        const hasBooks = state.books.length > 0;
        const hasCheckins = state.checkins.length > 0;

        if (hasBooks && !badges.find((b) => b.id === 'first-book')?.unlocked) {
          state.unlockBadge('first-book');
        }
        if (hasCheckins && !badges.find((b) => b.id === 'first-checkin')?.unlocked) {
          state.unlockBadge('first-checkin');
        }
        if (streak >= 7 && !badges.find((b) => b.id === 'streak-7')?.unlocked) {
          state.unlockBadge('streak-7');
        }
        if (streak >= 30 && !badges.find((b) => b.id === 'streak-30')?.unlocked) {
          state.unlockBadge('streak-30');
        }
        if (totalPages >= 100 && !badges.find((b) => b.id === 'pages-100')?.unlocked) {
          state.unlockBadge('pages-100');
        }
        if (totalPages >= 500 && !badges.find((b) => b.id === 'pages-500')?.unlocked) {
          state.unlockBadge('pages-500');
        }
        if (totalPages >= 1000 && !badges.find((b) => b.id === 'pages-1000')?.unlocked) {
          state.unlockBadge('pages-1000');
        }
        if (completedBooks >= 3 && !badges.find((b) => b.id === 'books-3')?.unlocked) {
          state.unlockBadge('books-3');
        }
        if (excerptCount >= 5 && !badges.find((b) => b.id === 'excerpt-5')?.unlocked) {
          state.unlockBadge('excerpt-5');
        }
        if (parentCommentCount >= 10 && !badges.find((b) => b.id === 'parent-10')?.unlocked) {
          state.unlockBadge('parent-10');
        }
      },

      getStreakDays: () => {
        const dates = get().checkins.map((c) => c.date);
        return getStreakDays(dates);
      },

      getWeeklyStats: () => {
        const { checkins, books } = get();
        const last7Days = getLast7Days();
        const dailyData = last7Days.map(({ date, weekday }) => {
          const dayCheckins = checkins.filter((c) => c.date === date);
          const pages = dayCheckins.reduce((sum, c) => sum + c.pagesRead, 0);
          const minutes = Math.round(
            dayCheckins.reduce((sum, c) => sum + c.durationSeconds, 0) / 60
          );
          return { date, weekday, pages, minutes };
        });

        const totalPages = dailyData.reduce((sum, d) => sum + d.pages, 0);
        const totalMinutes = dailyData.reduce((sum, d) => sum + d.minutes, 0);
        const completedDays = dailyData.filter((d) => d.pages > 0).length;

        const dailyGoalTotal = books.reduce((sum, b) => sum + b.dailyGoal, 0);
        const weeklyGoal = dailyGoalTotal * 7;
        const completionRate = weeklyGoal > 0 ? Math.min(100, Math.round((totalPages / weeklyGoal) * 100)) : 0;

        return {
          totalPages,
          totalMinutes,
          completedDays,
          completionRate,
          dailyData: dailyData.map(({ date, pages, minutes }) => ({ date, pages, minutes })),
        };
      },

      getMostReadBooks: () => {
        const { books, checkins } = get();
        const bookPageMap = new Map<string, number>();

        checkins.forEach((c) => {
          const current = bookPageMap.get(c.bookId) || 0;
          bookPageMap.set(c.bookId, current + c.pagesRead);
        });

        return books
          .map((book) => ({
            book,
            totalPages: bookPageMap.get(book.id) || 0,
          }))
          .filter((item) => item.totalPages > 0)
          .sort((a, b) => b.totalPages - a.totalPages)
          .slice(0, 5);
      },

      getCompletedBooksCount: () => {
        const { books } = get();
        return books.filter((book) => {
          const pagesRead = get().getBookPagesRead(book.id);
          return pagesRead >= book.totalPages;
        }).length;
      },

      getTotalPages: () => {
        return get().checkins.reduce((sum, c) => sum + c.pagesRead, 0);
      },

      getTotalMinutes: () => {
        return Math.round(
          get().checkins.reduce((sum, c) => sum + c.durationSeconds, 0) / 60
        );
      },

      getParentCommentCount: () => {
        return get().checkins.filter((c) => c.parentComment && c.parentComment.trim().length > 0).length;
      },
    }),
    {
      name: 'family-reading-storage',
    }
  )
);
