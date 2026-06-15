import { useState, useMemo } from 'react';
import {
  CalendarDays, Trash2, Edit3, Clock, FileText, MessageSquareHeart, ChevronLeft, ChevronRight, BookOpen,
} from 'lucide-react';
import { useReadingStore } from '@/store/useReadingStore';
import { formatDisplayDate, formatTime, getToday, formatDate } from '@/utils/date';
import Modal from '@/components/Modal';

export default function HistoryPage() {
  const {
    books,
    checkins,
    getUniqueDates,
    getCheckinsByDate,
    removeCheckin,
    updateCheckin,
  } = useReadingStore();

  const uniqueDates = getUniqueDates();
  const [selectedDate, setSelectedDate] = useState<string | null>(uniqueDates[0] || null);
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
      days.push({
        date: formatDate(d),
        day: d.getDate(),
        inMonth: false,
        hasCheckin: checkins.some((c) => c.date === formatDate(d) && c.userId === useReadingStore.getState().currentUserId),
      });
    }

    for (let i = 1; i <= totalDays; i++) {
      const d = new Date(year, month, i);
      days.push({
        date: formatDate(d),
        day: i,
        inMonth: true,
        hasCheckin: checkins.some((c) => c.date === formatDate(d) && c.userId === useReadingStore.getState().currentUserId),
      });
    }

    while (days.length % 7 !== 0) {
      const lastDate = days[days.length - 1].date;
      const d = new Date(lastDate + 'T00:00:00');
      d.setDate(d.getDate() + 1);
      days.push({
        date: formatDate(d),
        day: d.getDate(),
        inMonth: false,
        hasCheckin: checkins.some((c) => c.date === formatDate(d) && c.userId === useReadingStore.getState().currentUserId),
      });
    }

    return days;
  }, [viewMonth, checkins]);

  const selectedDateCheckins = selectedDate ? getCheckinsByDate(selectedDate) : [];

  const dayStats = useMemo(() => {
    const pages = selectedDateCheckins.reduce((s, c) => s + c.pagesRead, 0);
    const seconds = selectedDateCheckins.reduce((s, c) => s + c.durationSeconds, 0);
    const books = new Set(selectedDateCheckins.map((c) => c.bookId)).size;
    return { pages, seconds, books };
  }, [selectedDateCheckins]);

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

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">阅读历史</h2>
        <p className="text-gray-500 mt-1">查看和管理所有的阅读记录</p>
      </div>

      {uniqueDates.length === 0 ? (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={handlePrevMonth}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h3 className="font-bold text-lg text-gray-800">{monthName}</h3>
              <button
                onClick={handleNextMonth}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map((w) => (
                <div key={w} className="text-center text-xs font-medium text-gray-400 py-2">
                  {w}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((cell) => {
                const isSelected = cell.date === selectedDate;
                const isTodayCell = cell.date === today;
                return (
                  <button
                    key={cell.date}
                    onClick={() => setSelectedDate(cell.date)}
                    className={`aspect-square rounded-xl flex items-center justify-center text-sm font-medium transition-all relative ${
                      !cell.inMonth
                        ? 'text-gray-300'
                        : isSelected
                        ? 'bg-orange-100 text-orange-600 ring-2 ring-orange-300'
                        : isTodayCell
                        ? 'text-orange-500 hover:bg-orange-50 font-bold'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {cell.day}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-24 h-24 rounded-full bg-orange-50 flex items-center justify-center mb-4">
              <CalendarDays className="w-12 h-12 text-orange-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">还没有阅读记录</h3>
            <p className="text-gray-500">快去打卡页记录第一次阅读吧</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={handlePrevMonth}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h3 className="font-bold text-lg text-gray-800">{monthName}</h3>
                <button
                  onClick={handleNextMonth}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-2">
                {weekDays.map((w) => (
                  <div key={w} className="text-center text-xs font-medium text-gray-400 py-2">
                    {w}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((cell) => {
                  const isSelected = cell.date === selectedDate;
                  const isToday = cell.date === today;
                  return (
                    <button
                      key={cell.date}
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
                {selectedDate && (
                  <span className="text-xs text-gray-400">
                    {selectedDate === today ? '今天' : ''}
                  </span>
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
                      <p className="text-lg font-bold text-sky-600">
                        {Math.round(dayStats.seconds / 60)}分
                      </p>
                    </div>
                    <div className="text-center p-3 bg-emerald-50 rounded-xl">
                      <p className="text-xs text-gray-500">书目</p>
                      <p className="text-lg font-bold text-emerald-600">{dayStats.books}</p>
                    </div>
                  </div>

                  {selectedDateCheckins.length === 0 ? (
                    <p className="text-center text-gray-400 text-sm py-8">这一天没有打卡记录</p>
                  ) : (
                    <div className="space-y-3 max-h-[400px] overflow-y-auto">
                      {selectedDateCheckins.map((c) => {
                        const book = books.find((b) => b.id === c.bookId);
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
                      })}
                    </div>
                  )}
                </>
              ) : (
                <p className="text-center text-gray-400 text-sm py-12">点击左侧日历选择日期</p>
              )}
            </div>
          </div>
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
                📖 <span className="font-medium">{books.find((b) => b.id === editingCheckin.bookId)?.title || '未知'}</span>
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
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                阅读时长（分钟）
              </label>
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
