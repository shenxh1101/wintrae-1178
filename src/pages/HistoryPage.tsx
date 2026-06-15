import { useState, useMemo, useEffect } from 'react';
import {
  CalendarDays, Trash2, Edit3, Clock, FileText, MessageSquareHeart, ChevronLeft, ChevronRight, BookOpen, BookMarked, Heart, Target, Lightbulb,
} from 'lucide-react';
import { useReadingStore } from '@/store/useReadingStore';
import type { ParentFeedback, FeedbackType } from '@/types';
import { formatDisplayDate, formatTime, getToday, formatDate, getWeekStart, getWeekRange } from '@/utils/date';
import Modal from '@/components/Modal';

type ViewMode = 'day' | 'week' | 'book';

const feedbackTypeConfig: Record<FeedbackType, { label: string; icon: any }> = {
  advice: { label: '建议', icon: Lightbulb },
  goal: { label: '目标', icon: Target },
  encouragement: { label: '鼓励', icon: Heart },
};

export default function HistoryPage() {
  const {
    books,
    checkins,
    excerpts,
    currentUserId,
    getUniqueDates,
    getCheckinsByDate,
    getExcerptsByDate,
    removeCheckin,
    updateCheckin,
    getCurrentUser,
    getFeedbacksByWeekForUser,
    getFeedbacksByBookForUser,
  } = useReadingStore();

  const currentUser = getCurrentUser();
  const uniqueDates = getUniqueDates();
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [selectedDate, setSelectedDate] = useState<string | null>(uniqueDates[0] || null);
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [selectedWeekStart, setSelectedWeekStart] = useState<string | null>(null);
  const [viewMonth, setViewMonth] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  const [editingCheckin, setEditingCheckin] = useState<any>(null);
  const [editPages, setEditPages] = useState('');
  const [editNote, setEditNote] = useState('');
  const [editComment, setEditComment] = useState('');
  const [editSeconds, setEditSeconds] = useState(0);

  const today = getToday();

  useEffect(() => {
    setSelectedDate(uniqueDates[0] || null);
    setSelectedBookId(null);
    setSelectedWeekStart(null);
    setEditingCheckin(null);
  }, [currentUserId]);

  const userBooks = useMemo(
    () => books.filter((b) => b.userId === currentUserId),
    [books, currentUserId]
  );

  const userCheckins = useMemo(
    () => checkins.filter((c) => c.userId === currentUserId).sort((a, b) => b.date.localeCompare(a.date)),
    [checkins, currentUserId]
  );

  const userExcerpts = useMemo(
    () => excerpts.filter((e) => e.userId === currentUserId),
    [excerpts, currentUserId]
  );

  const handlePrevMonth = () => {
    setViewMonth((v) => {
      if (v.month === 0) return { year: v.year - 1, month: 11 };
      return { ...v, month: v.month - 1 };
    });
  };

  const handleNextMonth = () => {
    setViewMonth((v) => {
      if (v.month === 11) return { year: v.year + 1, month: 0 };
      return { ...v, month: v.month + 1 };
    });
  };

  const calendarDays = useMemo(() => {
    const { year, month } = viewMonth;
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startWeekday = firstDay.getDay();
    const totalDays = lastDay.getDate();

    const days: Array<{ date: string; day: number; inMonth: boolean; hasCheckin: boolean }> = [];

    const prevLastDay = new Date(year, month, 0).getDate();
    for (let i = startWeekday - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevLastDay - i);
      const dateStr = formatDate(d);
      days.push({
        date: dateStr,
        day: d.getDate(),
        inMonth: false,
        hasCheckin: userCheckins.some((c) => c.date === dateStr),
      });
    }

    for (let i = 1; i <= totalDays; i++) {
      const d = new Date(year, month, i);
      const dateStr = formatDate(d);
      days.push({
        date: dateStr,
        day: i,
        inMonth: true,
        hasCheckin: userCheckins.some((c) => c.date === dateStr),
      });
    }

    while (days.length % 7 !== 0) {
      const lastDate = days[days.length - 1].date;
      const d = new Date(lastDate + 'T00:00:00');
      d.setDate(d.getDate() + 1);
      const dateStr = formatDate(d);
      days.push({
        date: dateStr,
        day: d.getDate(),
        inMonth: false,
        hasCheckin: userCheckins.some((c) => c.date === dateStr),
      });
    }

    return days;
  }, [viewMonth, userCheckins]);

  const weekGroups = useMemo(() => {
    const groups: { weekStart: string; weekLabel: string; checkins: typeof userCheckins }[] = [];
    const sorted = [...userCheckins];
    if (sorted.length === 0) return groups;

    const weekMap = new Map<string, typeof userCheckins>();
    sorted.forEach((c) => {
      const d = new Date(c.date + 'T00:00:00');
      const dayOfWeek = d.getDay();
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const monday = new Date(d);
      monday.setDate(d.getDate() + mondayOffset);
      const weekStart = formatDate(monday);
      if (!weekMap.has(weekStart)) {
        weekMap.set(weekStart, []);
      }
      weekMap.get(weekStart)!.push(c);
    });

    Array.from(weekMap.entries())
      .sort(([a], [b]) => b.localeCompare(a))
      .forEach(([weekStart, weekCheckins]) => {
        const ws = new Date(weekStart + 'T00:00:00');
        const we = new Date(ws);
        we.setDate(ws.getDate() + 6);
        groups.push({
          weekStart,
          weekLabel: `${ws.getMonth() + 1}月${ws.getDate()}日 - ${we.getMonth() + 1}月${we.getDate()}日`,
          checkins: weekCheckins,
        });
      });

    return groups;
  }, [userCheckins]);

  const bookGroups = useMemo(() => {
    return userBooks
      .map((book) => {
        const bookCheckins = userCheckins.filter((c) => c.bookId === book.id);
        const bookExcerpts = userExcerpts.filter((e) => e.bookId === book.id);
        const pagesRead = bookCheckins.reduce((s, c) => s + c.pagesRead, 0);
        return { book, checkins: bookCheckins, excerpts: bookExcerpts, pagesRead };
      })
      .filter((g) => g.checkins.length > 0)
      .sort((a, b) => b.pagesRead - a.pagesRead);
  }, [userBooks, userCheckins, userExcerpts]);

  const selectedDateCheckins = selectedDate ? getCheckinsByDate(selectedDate) : [];
  const selectedDateExcerpts = selectedDate ? getExcerptsByDate(selectedDate) : [];

  const dayStats = useMemo(() => {
    const pages = selectedDateCheckins.reduce((s, c) => s + c.pagesRead, 0);
    const seconds = selectedDateCheckins.reduce((s, c) => s + c.durationSeconds, 0);
    const booksCount = new Set(selectedDateCheckins.map((c) => c.bookId)).size;
    return { pages, seconds, books: booksCount };
  }, [selectedDateCheckins]);

  const selectedWeekCheckins = useMemo(() => {
    if (!selectedWeekStart) return [];
    const ws = new Date(selectedWeekStart + 'T00:00:00');
    const we = new Date(ws);
    we.setDate(ws.getDate() + 6);
    const endDate = formatDate(we);
    return userCheckins.filter((c) => c.date >= selectedWeekStart && c.date <= endDate);
  }, [selectedWeekStart, userCheckins]);

  const selectedWeekExcerpts = useMemo(() => {
    if (!selectedWeekStart) return [];
    const ws = new Date(selectedWeekStart + 'T00:00:00');
    const we = new Date(ws);
    we.setDate(ws.getDate() + 6);
    const endDate = formatDate(we);
    return userExcerpts.filter((e) => e.checkinDate >= selectedWeekStart && e.checkinDate <= endDate);
  }, [selectedWeekStart, userExcerpts]);

  const weekStats = useMemo(() => {
    const pages = selectedWeekCheckins.reduce((s, c) => s + c.pagesRead, 0);
    const minutes = Math.round(selectedWeekCheckins.reduce((s, c) => s + c.durationSeconds, 0) / 60);
    const days = new Set(selectedWeekCheckins.map((c) => c.date)).size;
    return { pages, minutes, days };
  }, [selectedWeekCheckins]);

  const openEdit = (c: any) => {
    setEditingCheckin(c);
    setEditPages(c.pagesRead.toString());
    setEditNote(c.note || '');
    setEditComment(c.parentComment || '');
    setEditSeconds(c.durationSeconds || 0);
  };

  const handleSaveEdit = () => {
    if (!editingCheckin) return;
    updateCheckin(editingCheckin.id, {
      pagesRead: parseInt(editPages) || 0,
      note: editNote.trim(),
      parentComment: editComment.trim(),
      durationSeconds: editSeconds,
    });
    setEditingCheckin(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('确定删除这条打卡记录吗？')) {
      removeCheckin(id);
    }
  };

  const monthName = `${viewMonth.year}年${viewMonth.month + 1}月`;
  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  const renderCheckinCard = (c: any, showDate = false) => {
    const book = userBooks.find((b) => b.id === c.bookId);
    return (
      <div key={c.id} className="p-3 bg-gray-50 rounded-xl relative group">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-orange-200 to-orange-300 flex items-center justify-center text-sm flex-shrink-0">
              📖
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm text-gray-800 truncate">
                {book?.title || '未知图书'}
              </p>
              <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500">
                {showDate && <span>{formatDisplayDate(c.date)}</span>}
                <span className="inline-flex items-center gap-0.5">
                  <BookOpen className="w-3 h-3" />
                  {c.pagesRead}页
                </span>
                {c.durationSeconds > 0 && (
                  <span className="inline-flex items-center gap-0.5">
                    <Clock className="w-3 h-3" />
                    {formatTime(c.durationSeconds)}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
            <button
              onClick={() => openEdit(c)}
              className="p-1.5 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
              title="编辑"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDelete(c.id)}
              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="删除"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        {c.note && (
          <div className="mt-2 pt-2 border-t border-gray-200/50">
            <p className="text-xs text-gray-600 flex gap-1">
              <FileText className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
              <span className="leading-relaxed">{c.note}</span>
            </p>
          </div>
        )}
        {c.parentComment && (
          <div className="mt-2 pt-2 border-t border-gray-200/50">
            <p className="text-xs text-pink-600 flex gap-1">
              <MessageSquareHeart className="w-3.5 h-3.5 text-pink-400 flex-shrink-0 mt-0.5" />
              <span className="leading-relaxed">{c.parentComment}</span>
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderExcerptCard = (e: any) => {
    const book = userBooks.find((b) => b.id === e.bookId);
    return (
      <div key={e.id} className="p-3 bg-emerald-50 rounded-xl">
        <div className="flex items-center gap-1.5 mb-1.5">
          <BookMarked className="w-3.5 h-3.5 text-emerald-500" />
          <span className="text-xs font-medium text-gray-600 truncate">{book?.title || '未知'}</span>
          {e.page && <span className="text-xs text-emerald-600">· P{e.page}</span>}
        </div>
        <p className="text-sm text-gray-700 leading-relaxed">{e.content}</p>
      </div>
    );
  };

  const renderFeedbackCard = (fb: ParentFeedback) => {
    const cfg = feedbackTypeConfig[fb.type];
    const Icon = cfg.icon;
    const scopeLabel = fb.bookId
      ? `《${books.find((x) => x.id === fb.bookId)?.title || '某本书'}》`
      : fb.weekStart
        ? `${fb.weekStart.slice(5)} 当周`
        : '通用';
    const colorMap: Record<FeedbackType, string> = {
      advice: 'bg-amber-50 border-amber-200 text-amber-700',
      goal: 'bg-emerald-50 border-emerald-200 text-emerald-700',
      encouragement: 'bg-pink-50 border-pink-200 text-pink-700',
    };
    const iconColorMap: Record<FeedbackType, string> = {
      advice: 'text-amber-500',
      goal: 'text-emerald-500',
      encouragement: 'text-pink-500',
    };
    return (
      <div key={fb.id} className={`p-3 rounded-xl border ${colorMap[fb.type]}`}>
        <div className="flex items-center gap-1.5 mb-1.5">
          <Icon className={`w-3.5 h-3.5 ${iconColorMap[fb.type]}`} />
          <span className="text-xs font-semibold">{cfg.label}</span>
          <span className="text-[11px] opacity-70">· {scopeLabel}</span>
          <span className="ml-auto text-[10px] opacity-60">{formatDisplayDate(fb.createdAt)}</span>
        </div>
        <p className="text-sm leading-relaxed opacity-90">{fb.content}</p>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">阅读历史</h2>
          <p className="text-gray-500 mt-1">
            {currentUser?.avatar && <span className="mr-1">{currentUser.avatar}</span>}
            {currentUser?.name || '我的'}阅读记录 · 查看和管理所有的阅读记录
          </p>
        </div>
        <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
          {[
            { mode: 'day' as ViewMode, label: '按天' },
            { mode: 'week' as ViewMode, label: '按周' },
            { mode: 'book' as ViewMode, label: '按书' },
          ].map(({ mode, label }) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                viewMode === mode
                  ? 'bg-white text-orange-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {userCheckins.length === 0 ? (
        <div className="space-y-6">
          {viewMode === 'day' && (
            <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <button onClick={handlePrevMonth} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h3 className="font-bold text-lg text-gray-800">{monthName}</h3>
                <button onClick={handleNextMonth} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              <div className="grid grid-cols-7 gap-1 mb-2">
                {weekDays.map((w) => (
                  <div key={w} className="text-center text-xs font-medium text-gray-400 py-2">{w}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((cell, idx) => (
                  <button key={`${cell.date}-${idx}`} className="aspect-square rounded-xl flex items-center justify-center text-sm font-medium text-gray-300">
                    {cell.day}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-24 h-24 rounded-full bg-orange-50 flex items-center justify-center mb-4">
              <CalendarDays className="w-12 h-12 text-orange-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">还没有阅读记录</h3>
            <p className="text-gray-500">快去打卡页记录第一次阅读吧</p>
          </div>
        </div>
      ) : viewMode === 'day' ? (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <button onClick={handlePrevMonth} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h3 className="font-bold text-lg text-gray-800">{monthName}</h3>
                <button onClick={handleNextMonth} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              <div className="grid grid-cols-7 gap-1 mb-2">
                {weekDays.map((w) => (
                  <div key={w} className="text-center text-xs font-medium text-gray-400 py-2">{w}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((cell, idx) => {
                  const isSelected = cell.date === selectedDate;
                  const isToday = cell.date === today;
                  return (
                    <button
                      key={`${cell.date}-${idx}`}
                      onClick={() => setSelectedDate(cell.date)}
                      className={`aspect-square rounded-xl flex items-center justify-center text-sm font-medium transition-all relative ${
                        !cell.inMonth
                          ? 'text-gray-300'
                          : isSelected
                          ? cell.hasCheckin
                            ? 'bg-gradient-to-br from-orange-400 to-orange-500 text-white shadow-md'
                            : 'bg-orange-100 text-orange-600 ring-2 ring-orange-300'
                          : cell.hasCheckin
                          ? 'bg-orange-50 text-orange-600 hover:bg-orange-100'
                          : isToday
                          ? 'text-orange-500 hover:bg-orange-50 font-bold'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {cell.day}
                      {cell.hasCheckin && !isSelected && (
                        <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-orange-400" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-800">
                  {selectedDate ? formatDisplayDate(selectedDate) : '选择日期'}
                </h3>
                {selectedDate && selectedDate === today && (
                  <span className="text-xs text-gray-400">今天</span>
                )}
              </div>

              {selectedDate ? (
                <>
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="text-center p-3 bg-orange-50 rounded-xl">
                      <p className="text-xs text-gray-500">总页数</p>
                      <p className="text-lg font-bold text-orange-600">{dayStats.pages}</p>
                    </div>
                    <div className="text-center p-3 bg-sky-50 rounded-xl">
                      <p className="text-xs text-gray-500">时长</p>
                      <p className="text-lg font-bold text-sky-600">{Math.round(dayStats.seconds / 60)}分</p>
                    </div>
                    <div className="text-center p-3 bg-emerald-50 rounded-xl">
                      <p className="text-xs text-gray-500">书目</p>
                      <p className="text-lg font-bold text-emerald-600">{dayStats.books}</p>
                    </div>
                  </div>

                  {selectedDateCheckins.length === 0 ? (
                    <p className="text-center text-gray-400 text-sm py-8">这一天没有打卡记录</p>
                  ) : (
                    <div className="space-y-3 max-h-[250px] overflow-y-auto">
                      {selectedDateCheckins.map((c) => renderCheckinCard(c))}
                    </div>
                  )}

                  {selectedDateExcerpts.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <h4 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-1.5">
                        <BookMarked className="w-4 h-4 text-emerald-500" />
                        这天的摘抄
                      </h4>
                      <div className="space-y-2 max-h-[200px] overflow-y-auto">
                        {selectedDateExcerpts.map((e) => renderExcerptCard(e))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-center text-gray-400 text-sm py-12">点击左侧日历选择日期</p>
              )}
            </div>
          </div>
        </div>
      ) : viewMode === 'week' ? (
        <div className="space-y-4">
          {weekGroups.length === 0 ? (
            <p className="text-center text-gray-400 py-12">没有阅读记录</p>
          ) : (
            weekGroups.map((week) => {
              const isExpanded = selectedWeekStart === week.weekStart;
              const weekExcerpts = isExpanded ? selectedWeekExcerpts : [];
              const weekCheckins = isExpanded ? selectedWeekCheckins : week.checkins;
              const pages = week.checkins.reduce((s, c) => s + c.pagesRead, 0);
              const minutes = Math.round(week.checkins.reduce((s, c) => s + c.durationSeconds, 0) / 60);
              const days = new Set(week.checkins.map((c) => c.date)).size;
              return (
                <div key={week.weekStart} className="bg-white rounded-2xl shadow-sm border border-orange-100 overflow-hidden">
                  <button
                    onClick={() => setSelectedWeekStart(isExpanded ? null : week.weekStart)}
                    className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                        <CalendarDays className="w-5 h-5 text-orange-500" />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-gray-800">{week.weekLabel}</p>
                        <p className="text-xs text-gray-400">{days}天阅读</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold text-orange-600">{pages}页</p>
                        <p className="text-xs text-gray-400">{minutes}分钟</p>
                      </div>
                      <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    </div>
                  </button>
                  {isExpanded && (
                    <div className="px-5 pb-5 border-t border-gray-100 pt-4">
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        <div className="text-center p-3 bg-orange-50 rounded-xl">
                          <p className="text-xs text-gray-500">总页数</p>
                          <p className="text-lg font-bold text-orange-600">{weekStats.pages}</p>
                        </div>
                        <div className="text-center p-3 bg-sky-50 rounded-xl">
                          <p className="text-xs text-gray-500">总时长</p>
                          <p className="text-lg font-bold text-sky-600">{weekStats.minutes}分</p>
                        </div>
                        <div className="text-center p-3 bg-emerald-50 rounded-xl">
                          <p className="text-xs text-gray-500">打卡天</p>
                          <p className="text-lg font-bold text-emerald-600">{weekStats.days}/7</p>
                        </div>
                      </div>
                      <div className="space-y-3 max-h-[400px] overflow-y-auto">
                        {weekCheckins.map((c) => renderCheckinCard(c, true))}
                      </div>
                      {weekExcerpts.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <h4 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-1.5">
                            <BookMarked className="w-4 h-4 text-emerald-500" />
                            这周的摘抄
                          </h4>
                          <div className="space-y-2 max-h-[200px] overflow-y-auto">
                            {weekExcerpts.map((e) => renderExcerptCard(e))}
                          </div>
                        </div>
                      )}

                      {isExpanded && (() => {
                        const weekFeedbacks = getFeedbacksByWeekForUser(week.weekStart, currentUserId || '');
                        if (weekFeedbacks.length === 0) return null;
                        return (
                          <div className="mt-4 pt-4 border-t border-gray-100">
                            <h4 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-1.5">
                              <Heart className="w-4 h-4 text-pink-500" />
                              家长反馈（{weekFeedbacks.length}条）
                            </h4>
                            <div className="space-y-2">
                              {weekFeedbacks.map((fb) => renderFeedbackCard(fb))}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {bookGroups.length === 0 ? (
            <p className="text-center text-gray-400 py-12">没有阅读记录</p>
          ) : (
            bookGroups.map(({ book, checkins: bookCheckins, excerpts: bookExcerpts, pagesRead }) => {
              const isExpanded = selectedBookId === book.id;
              const pct = book.totalPages > 0 ? Math.min(100, Math.round((pagesRead / book.totalPages) * 100)) : 0;
              const bookFeedbacks = isExpanded
                ? getFeedbacksByBookForUser(book.id, currentUserId || '')
                : [];
              return (
                <div key={book.id} className="bg-white rounded-2xl shadow-sm border border-orange-100 overflow-hidden">
                  <button
                    onClick={() => setSelectedBookId(isExpanded ? null : book.id)}
                    className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-200 to-orange-300 flex items-center justify-center text-sm flex-shrink-0">
                        📖
                      </div>
                      <div className="text-left min-w-0">
                        <p className="font-bold text-gray-800 truncate">{book.title}</p>
                        <p className="text-xs text-gray-400">{book.author} · {bookCheckins.length}次打卡</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <div className="text-right">
                        <p className="font-bold text-orange-600">{pagesRead}/{book.totalPages}页</p>
                        <p className="text-xs text-gray-400">{pct}%</p>
                      </div>
                      <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    </div>
                  </button>
                  {isExpanded && (
                    <div className="px-5 pb-5 border-t border-gray-100 pt-4">
                      <div className="mb-4">
                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-orange-300 to-orange-400 rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">阅读进度: {pagesRead}/{book.totalPages}页 ({pct}%)</p>
                      </div>
                      <div className="space-y-3 max-h-[400px] overflow-y-auto">
                        {bookCheckins.map((c) => renderCheckinCard(c, true))}
                      </div>
                      {bookExcerpts.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <h4 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-1.5">
                            <BookMarked className="w-4 h-4 text-emerald-500" />
                            这本书的摘抄（{bookExcerpts.length}条）
                          </h4>
                          <div className="space-y-2 max-h-[200px] overflow-y-auto">
                            {bookExcerpts.map((e) => renderExcerptCard(e))}
                          </div>
                        </div>
                      )}

                      {bookFeedbacks.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <h4 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-1.5">
                            <Heart className="w-4 h-4 text-pink-500" />
                            家长反馈（{bookFeedbacks.length}条）
                          </h4>
                          <div className="space-y-2">
                            {bookFeedbacks.map((fb) => renderFeedbackCard(fb))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      <Modal
        isOpen={!!editingCheckin}
        onClose={() => setEditingCheckin(null)}
        title="编辑打卡记录"
      >
        {editingCheckin && (
          <div className="space-y-4">
            <div className="p-3 bg-orange-50 rounded-xl">
              <p className="text-sm text-gray-700">
                📖 <span className="font-medium">{userBooks.find((b) => b.id === editingCheckin.bookId)?.title || '未知'}</span>
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{formatDisplayDate(editingCheckin.date)}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">阅读页数</label>
              <input
                type="number"
                min="0"
                value={editPages}
                onChange={(e) => setEditPages(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">阅读时长（分钟）</label>
              <input
                type="number"
                min="0"
                value={Math.round(editSeconds / 60)}
                onChange={(e) => setEditSeconds((parseInt(e.target.value) || 0) * 60)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">阅读笔记</label>
              <textarea
                value={editNote}
                onChange={(e) => setEditNote(e.target.value)}
                rows={2}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1">
                <MessageSquareHeart className="w-4 h-4 text-pink-500" />
                家长评语
              </label>
              <textarea
                value={editComment}
                onChange={(e) => setEditComment(e.target.value)}
                rows={2}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-300 resize-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setEditingCheckin(null)}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSaveEdit}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-xl font-bold hover:shadow-lg transition-all"
              >
                保存
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
