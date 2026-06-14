import { useState } from 'react';
import { Flame, MessageSquareHeart, BookMarked, Send, Trash2, Calendar, Sparkles } from 'lucide-react';
import { useReadingStore } from '@/store/useReadingStore';
import BookCard from '@/components/BookCard';
import Timer from '@/components/Timer';
import { getToday, getLast7Days, formatDisplayDate, formatTime } from '@/utils/date';

export default function CheckinPage() {
  const {
    books,
    checkins,
    excerpts,
    addCheckin,
    addExcerpt,
    removeExcerpt,
    getStreakDays,
    getBookPagesRead,
  } = useReadingStore();

  const [selectedBookId, setSelectedBookId] = useState<string | null>(books[0]?.id || null);
  const [pagesRead, setPagesRead] = useState('');
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [note, setNote] = useState('');
  const [parentComment, setParentComment] = useState('');
  const [excerptContent, setExcerptContent] = useState('');
  const [excerptPage, setExcerptPage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const streakDays = getStreakDays();
  const last7Days = getLast7Days();
  const today = getToday();

  const todayCheckins = checkins.filter((c) => c.date === today);
  const todayExcerpts = excerpts.filter((e) => {
    const excerptDate = new Date(e.createdAt).toISOString().split('T')[0];
    return excerptDate === today;
  });

  const handleSubmitCheckin = () => {
    if (!selectedBookId) {
      alert('请先选择一本书');
      return;
    }
    const pages = parseInt(pagesRead);
    if (!pages || pages <= 0) {
      alert('请输入有效的阅读页数');
      return;
    }

    addCheckin({
      bookId: selectedBookId,
      date: today,
      pagesRead: pages,
      durationSeconds: durationSeconds,
      note: note.trim(),
      parentComment: parentComment.trim(),
    });

    setPagesRead('');
    setDurationSeconds(0);
    setNote('');
    setParentComment('');
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const handleAddExcerpt = () => {
    if (!selectedBookId) {
      alert('请先选择一本书');
      return;
    }
    if (!excerptContent.trim()) {
      alert('请输入摘抄内容');
      return;
    }

    addExcerpt({
      bookId: selectedBookId,
      content: excerptContent.trim(),
      page: excerptPage.trim(),
    });

    setExcerptContent('');
    setExcerptPage('');
  };

  const hasCheckinOnDate = (date: string) => {
    return checkins.some((c) => c.date === date);
  };

  const selectedBook = books.find((b) => b.id === selectedBookId);
  const selectedBookPagesRead = selectedBook ? getBookPagesRead(selectedBook.id) : 0;

  if (books.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-24 h-24 rounded-full bg-orange-50 flex items-center justify-center mb-4">
            <BookMarked className="w-12 h-12 text-orange-300" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">请先添加图书</h3>
          <p className="text-gray-500">前往书单页添加你想阅读的图书吧</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">今日打卡</h2>
          <p className="text-gray-500 mt-1">{formatDisplayDate(today)} · 坚持每一天</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-orange-200">
          <Flame className="w-5 h-5 text-orange-500" />
          <div>
            <p className="text-xs text-orange-600">连续打卡</p>
            <p className="text-xl font-bold text-orange-600 leading-none">{streakDays} 天</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-5">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-orange-500" />
              最近7天
            </h3>
            <div className="flex justify-between gap-2">
              {last7Days.map(({ date, weekday }) => {
                const hasCheckin = hasCheckinOnDate(date);
                const isToday = date === today;
                return (
                  <div key={date} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs text-gray-500">{weekday}</span>
                    <div
                      className={`w-full aspect-square rounded-xl flex items-center justify-center text-sm font-bold transition-all ${
                        hasCheckin
                          ? 'bg-gradient-to-br from-orange-400 to-orange-500 text-white shadow-md'
                          : isToday
                          ? 'bg-orange-50 text-orange-400 border-2 border-dashed border-orange-300'
                          : 'bg-gray-50 text-gray-300'
                      }`}
                    >
                      {hasCheckin ? '✓' : new Date(date).getDate()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-5">
            <h3 className="font-bold text-gray-800 mb-3">选择阅读的书</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-1">
              {books.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  compact
                  selected={selectedBookId === book.id}
                  onClick={() => setSelectedBookId(book.id)}
                />
              ))}
            </div>
          </div>

          {selectedBook && (
            <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-5">
              <h3 className="font-bold text-gray-800 mb-4">阅读计时</h3>
              <Timer onTimeUpdate={setDurationSeconds} />
              {durationSeconds > 0 && (
                <p className="text-center text-sm text-gray-500 mt-2">
                  已阅读 {formatTime(durationSeconds)}
                </p>
              )}
            </div>
          )}

          {selectedBook && (
            <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-5">
              <h3 className="font-bold text-gray-800 mb-4">记录打卡</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    今日阅读页数 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={pagesRead}
                    onChange={(e) => setPagesRead(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300 transition-all"
                    placeholder="请输入页数"
                  />
                  {selectedBook.totalPages > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      当前进度: {selectedBookPagesRead} / {selectedBook.totalPages} 页
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    阅读笔记
                  </label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={2}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300 transition-all resize-none"
                    placeholder="今天读了什么内容？有什么感想？"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1">
                    <MessageSquareHeart className="w-4 h-4 text-pink-500" />
                    家长评语
                  </label>
                  <textarea
                    value={parentComment}
                    onChange={(e) => setParentComment(e.target.value)}
                    rows={2}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-300 transition-all resize-none"
                    placeholder="给孩子一些鼓励和建议吧..."
                  />
                </div>

                <button
                  onClick={handleSubmitCheckin}
                  className="w-full py-3 bg-gradient-to-r from-orange-400 to-orange-500 text-white font-bold rounded-xl shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-5 h-5" />
                  完成打卡
                </button>

                {showSuccess && (
                  <div className="text-center text-emerald-600 font-medium py-2 animate-[fadeIn_0.3s_ease-out]">
                    🎉 打卡成功！继续加油！
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-5">
            <h3 className="font-bold text-gray-800 mb-3">今日打卡记录</h3>
            {todayCheckins.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-6">今天还没有打卡记录</p>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {todayCheckins.map((checkin) => {
                  const book = books.find((b) => b.id === checkin.bookId);
                  return (
                    <div key={checkin.id} className="p-3 bg-orange-50 rounded-xl">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold text-gray-800 text-sm">{book?.title || '未知图书'}</p>
                        <span className="text-xs bg-orange-200 text-orange-700 px-2 py-0.5 rounded-full font-medium">
                          {checkin.pagesRead}页
                        </span>
                      </div>
                      {checkin.durationSeconds > 0 && (
                        <p className="text-xs text-gray-500">阅读时长: {formatTime(checkin.durationSeconds)}</p>
                      )}
                      {checkin.note && (
                        <p className="text-xs text-gray-600 mt-1.5 pt-1.5 border-t border-orange-200/50">
                          📝 {checkin.note}
                        </p>
                      )}
                      {checkin.parentComment && (
                        <p className="text-xs text-pink-600 mt-1.5 pt-1.5 border-t border-orange-200/50">
                          💝 家长: {checkin.parentComment}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-5">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <BookMarked className="w-5 h-5 text-emerald-500" />
              摘抄收藏
            </h3>
            <div className="space-y-3 mb-4">
              <div>
                <textarea
                  value={excerptContent}
                  onChange={(e) => setExcerptContent(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300 transition-all text-sm resize-none"
                  placeholder="记录精彩的句子..."
                />
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={excerptPage}
                  onChange={(e) => setExcerptPage(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300 transition-all text-sm"
                  placeholder="页码（选填）"
                />
                <button
                  onClick={handleAddExcerpt}
                  className="px-4 py-2 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 transition-colors flex items-center gap-1"
                >
                  <Send className="w-4 h-4" />
                  收藏
                </button>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-3 max-h-60 overflow-y-auto space-y-2">
              {todayExcerpts.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">今天还没有摘抄</p>
              ) : (
                todayExcerpts.map((excerpt) => {
                  const book = books.find((b) => b.id === excerpt.bookId);
                  return (
                    <div key={excerpt.id} className="p-3 bg-emerald-50 rounded-lg relative group">
                      <button
                        onClick={() => removeExcerpt(excerpt.id)}
                        className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <p className="text-xs text-gray-500 mb-1">
                        {book?.title} {excerpt.page && `· P${excerpt.page}`}
                      </p>
                      <p className="text-sm text-gray-700 leading-relaxed">{excerpt.content}</p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
