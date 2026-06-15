import { useState, useMemo } from 'react';
import {
  ChevronLeft, ChevronRight, Printer, BookCheck, Flame, AlertCircle, BarChart3, Clock, FileText, Award, TrendingUp, Target, Check,
} from 'lucide-react';
import { useReadingStore, type BookProgressInfo, type ChildMonthlyReview } from '@/store/useReadingStore';
import { formatDisplayDate, getWeekRange } from '@/utils/date';

const challengeTypeLabel: Record<string, string> = {
  books_count: '读完书数',
  streak_weeks: '连续打卡',
  category_pages: '类型阅读',
};

const colorClassMap: Record<string, string> = {
  orange: 'from-orange-500 to-orange-400',
  sky: 'from-sky-500 to-sky-400',
  emerald: 'from-emerald-500 to-emerald-400',
  pink: 'from-pink-500 to-pink-400',
  violet: 'from-violet-500 to-violet-400',
  rose: 'from-rose-500 to-rose-400',
};

const colorBgMap: Record<string, string> = {
  orange: 'bg-orange-50',
  sky: 'bg-sky-50',
  emerald: 'bg-emerald-50',
  pink: 'bg-pink-50',
  violet: 'bg-violet-50',
  rose: 'bg-rose-50',
};

const colorTextMap: Record<string, string> = {
  orange: 'text-orange-600',
  sky: 'text-sky-600',
  emerald: 'text-emerald-600',
  pink: 'text-pink-600',
  violet: 'text-violet-600',
  rose: 'text-rose-600',
};

function formatMonthYear(year: number, month: number) {
  return `${year}年${month + 1}月`;
}

function renderProgressBar(current: number, total: number, gradient: string) {
  const pct = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;
  return (
    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
      <div
        className={`h-full bg-gradient-to-r ${gradient} rounded-full transition-all`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function WeekHeatmap({ review }: { review: ChildMonthlyReview }) {
  const color = review.user.color || 'orange';
  const weeks = review.weeklyStats;
  if (weeks.length === 0) {
    return <div className="text-sm text-gray-400 py-4 text-center">本月还没有打卡记录</div>;
  }
  const maxDays = Math.max(...weeks.map((w) => w.completedDays), 1);
  const maxPages = Math.max(...weeks.map((w) => w.pages), 1);
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
      {weeks.map((w) => {
        const { end } = getWeekRange(new Date(w.weekStart));
        const dayPct = Math.round((w.completedDays / 7) * 100);
        const isStable = review.mostStableWeek && review.mostStableWeek.weekStart === w.weekStart;
        return (
          <div
            key={w.weekStart}
            className={`rounded-xl p-3 border ${colorBgMap[color] || 'bg-gray-50'} ${isStable ? 'ring-2 ring-offset-1 ring-yellow-400' : 'border-gray-100'}`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500">
                {w.weekStart.slice(5)} ~ {end.slice(5)}
              </span>
              {isStable && (
                <span className="text-[10px] bg-yellow-400 text-white px-1.5 py-0.5 rounded-full font-bold flex items-center gap-0.5">
                  <Flame className="w-2.5 h-2.5" />最稳
                </span>
              )}
            </div>
            <div className="flex items-end gap-2 mb-1">
              <span className="text-lg font-bold text-gray-800">{w.completedDays}</span>
              <span className="text-[10px] text-gray-500 mb-1">/7天</span>
              <span className="ml-auto text-sm font-bold text-gray-700">{w.pages}<span className="text-[10px] text-gray-400 ml-0.5">页</span></span>
            </div>
            <div className="w-full bg-white/50 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${colorClassMap[color] || 'from-gray-400 to-gray-500'} rounded-full`}
                style={{ width: `${dayPct}%` }}
              />
            </div>
            <div className="mt-1.5 flex justify-between text-[10px] text-gray-500">
              <span>日均 {w.completedDays ? Math.round(w.pages / w.completedDays) : 0}页</span>
              <span>强度 {Math.round((w.completedDays / maxDays) * 50 + (w.pages / maxPages) * 50)}%</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function BookCard({ info, color }: { info: BookProgressInfo; color: string }) {
  const gradient = colorClassMap[color] || 'from-gray-400 to-gray-500';
  const pct = info.book.totalPages > 0 ? Math.min(100, Math.round((info.pagesRead / info.book.totalPages) * 100)) : 0;
  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <div className="font-bold text-gray-800 truncate">《{info.book.title}》</div>
          <div className="text-xs text-gray-500">{info.book.author}</div>
        </div>
        {info.completed ? (
          <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold flex items-center gap-1 whitespace-nowrap">
            <BookCheck className="w-3 h-3" />已读完
          </span>
        ) : info.stuckDays >= 7 ? (
          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold flex items-center gap-1 whitespace-nowrap">
            <AlertCircle className="w-3 h-3" />停{info.stuckDays}天
          </span>
        ) : (
          <span className="text-xs bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full font-bold whitespace-nowrap">阅读中</span>
        )}
      </div>
      {renderProgressBar(info.pagesRead, info.book.totalPages, gradient)}
      <div className="flex items-center justify-between mt-2 text-xs">
        <span className="text-gray-600">{info.pagesRead} / {info.book.totalPages} 页 ({pct}%)</span>
        <span className="text-gray-400">
          {info.completed && info.completedAt ? `读完 ${info.completedAt.slice(5)}` : info.lastReadDate ? `最近 ${info.lastReadDate.slice(5)}` : '尚未开读'}
        </span>
      </div>
    </div>
  );
}

export default function MonthlyReviewPage() {
  const { getMonthlyReview, getChallengesForMonth, getChallengeProgress } = useReadingStore();
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());

  const review = useMemo(
    () => getMonthlyReview(viewYear, viewMonth),
    [viewYear, viewMonth, getMonthlyReview]
  );

  const monthChallenges = useMemo(
    () => getChallengesForMonth(viewYear, viewMonth),
    [viewYear, viewMonth, getChallengesForMonth]
  );

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handlePrint = () => window.print();

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6 print:block print:max-w-none print:mx-0 print:px-0">
      <div className="flex items-end justify-between flex-wrap gap-4 print:hidden">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">月度复盘</h2>
          <p className="text-gray-500 mt-1">对比每个孩子的月度阅读轨迹，一键打印家庭月报</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-white rounded-xl border border-gray-200 p-1 shadow-sm">
            <button
              onClick={handlePrevMonth}
              className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-600"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="font-bold text-gray-800 px-4 text-lg min-w-[120px] text-center">
              {formatMonthYear(viewYear, viewMonth)}
            </span>
            <button
              onClick={handleNextMonth}
              className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-600"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <button
            onClick={handlePrint}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-bold flex items-center gap-2 hover:shadow-lg transition shadow-sm"
          >
            <Printer className="w-4 h-4" />
            打印月报
          </button>
        </div>
      </div>

      <div className="bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 rounded-3xl p-8 text-white shadow-xl">
        <div className="flex items-center gap-2 mb-6 opacity-90">
          <BarChart3 className="w-6 h-6" />
          <h3 className="text-xl font-bold">家庭阅读月报 · {formatMonthYear(viewYear, viewMonth)}</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <div className="text-white/70 text-sm mb-1 flex items-center gap-1"><FileText className="w-4 h-4" />家庭总页数</div>
            <div className="text-4xl font-bold">{review.familyTotalPages}</div>
          </div>
          <div>
            <div className="text-white/70 text-sm mb-1 flex items-center gap-1"><Clock className="w-4 h-4" />家庭总时长</div>
            <div className="text-4xl font-bold">{review.familyTotalMinutes}<span className="text-xl ml-1 opacity-70">分钟</span></div>
          </div>
          <div>
            <div className="text-white/70 text-sm mb-1 flex items-center gap-1"><Award className="w-4 h-4" />打卡总次数</div>
            <div className="text-4xl font-bold">{review.familyTotalCheckins}</div>
          </div>
          <div>
            <div className="text-white/70 text-sm mb-1 flex items-center gap-1"><TrendingUp className="w-4 h-4" />本月读完</div>
            <div className="text-4xl font-bold">
              {review.children.reduce((s, c) => s + c.completedBooks.length, 0)}
              <span className="text-xl ml-1 opacity-70">本</span>
            </div>
          </div>
        </div>
      </div>

      {review.children.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-gray-100 text-center">
          <BookCheck className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-500">还没有孩子账户，先去添加吧</p>
        </div>
      ) : (
        <div className="space-y-6">
          {review.children.map((childRev) => {
            const color = childRev.user.color || 'orange';
            return (
              <div key={childRev.user.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className={`p-6 bg-gradient-to-r ${colorClassMap[color]} text-white`}>
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-3xl">{childRev.user.avatar}</span>
                        <h3 className="text-xl font-bold">{childRev.user.name}</h3>
                      </div>
                      <div className="text-white/70 text-sm mt-1">
                        本月阅读报告
                        {childRev.mostStableWeek && (
                          <span className="ml-2 bg-white/20 px-2 py-0.5 rounded-full text-xs text-white">
                            🔥 最稳周: {childRev.mostStableWeek.weekStart.slice(5)} ({childRev.mostStableWeek.completedDays}/7天)
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-right">
                      <div>
                        <div className="text-xs text-white/70">页数</div>
                        <div className="text-2xl font-bold">{childRev.totalPages}</div>
                      </div>
                      <div>
                        <div className="text-xs text-white/70">时长</div>
                        <div className="text-2xl font-bold">{childRev.totalMinutes}<span className="text-sm ml-0.5 opacity-70">分</span></div>
                      </div>
                      <div>
                        <div className="text-xs text-white/70">打卡天</div>
                        <div className="text-2xl font-bold">{childRev.completedDays}</div>
                      </div>
                      <div>
                        <div className="text-xs text-white/70">读完</div>
                        <div className="text-2xl font-bold">{childRev.completedBooks.length}<span className="text-sm ml-0.5 opacity-70">本</span></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  <div>
                    <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-1.5">
                      <Flame className={`w-4 h-4 ${colorTextMap[color]}`} />
                      周阅读轨迹
                    </h4>
                    <WeekHeatmap review={childRev} />
                  </div>

                  {childRev.completedBooks.length > 0 && (
                    <div>
                      <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-1.5">
                        <BookCheck className="w-4 h-4 text-emerald-500" />
                        本月读完 ({childRev.completedBooks.length}本)
                      </h4>
                      <div className="grid md:grid-cols-2 gap-3">
                        {childRev.completedBooks.map((b) => (
                          <BookCard key={b.book.id} info={b} color={color} />
                        ))}
                      </div>
                    </div>
                  )}

                  {childRev.stuckBooks.length > 0 && (
                    <div>
                      <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                        进度停住需要关注 ({childRev.stuckBooks.length}本)
                      </h4>
                      <div className="grid md:grid-cols-2 gap-3">
                        {childRev.stuckBooks.map((b) => (
                          <BookCard key={b.book.id} info={b} color={color} />
                        ))}
                      </div>
                    </div>
                  )}

                  {childRev.inProgressBooks.filter((b) => b.stuckDays < 7).length > 0 && (
                    <div>
                      <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-1.5">
                        <TrendingUp className="w-4 h-4 text-sky-500" />
                        正在阅读中
                      </h4>
                      <div className="grid md:grid-cols-2 gap-3">
                        {childRev.inProgressBooks.filter((b) => b.stuckDays < 7).map((b) => (
                          <BookCard key={b.book.id} info={b} color={color} />
                        ))}
                      </div>
                    </div>
                  )}

                  {(() => {
                    const childChallenges = monthChallenges.filter((c) => c.userId === childRev.user.id);
                    if (childChallenges.length === 0) return null;
                    return (
                      <div className="mt-2">
                        <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-1.5">
                          <Target className="w-4 h-4 text-rose-500" />
                          本月挑战 ({childChallenges.length}项)
                        </h4>
                        <div className="grid md:grid-cols-2 gap-3">
                          {childChallenges.map((c) => {
                            const progress = getChallengeProgress(c);
                            const isComplete = progress >= 100 || c.completed;
                            return (
                              <div key={c.id} className={`rounded-xl p-4 border-2 ${
                                isComplete
                                  ? 'border-emerald-200 bg-emerald-50'
                                  : 'border-gray-100 bg-white'
                              }`}>
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <div className="flex items-center gap-2">
                                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${
                                      isComplete ? 'from-emerald-500 to-emerald-400' : colorClassMap[color]
                                    } flex items-center justify-center`}>
                                      {isComplete ? <Check className="w-4 h-4 text-white" /> : <Target className="w-4 h-4 text-white" />}
                                    </div>
                                    <div>
                                      <div className="text-sm font-semibold text-gray-800">{c.title}</div>
                                      <div className="text-xs text-gray-500">
                                        {challengeTypeLabel[c.type] || '挑战'}
                                        {c.category && ` · ${c.category}`}
                                      </div>
                                    </div>
                                  </div>
                                  <span className={`text-sm font-bold ${
                                    isComplete ? 'text-emerald-600' : colorTextMap[color]
                                  }`}>
                                    {progress}%
                                  </span>
                                </div>
                                <p className="text-xs text-gray-600 mb-2">{c.description}</p>
                                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                  <div
                                    className={`h-full bg-gradient-to-r ${
                                      isComplete ? 'from-emerald-500 to-emerald-400' : colorClassMap[color]
                                    } rounded-full transition-all`}
                                    style={{ width: `${Math.min(100, progress)}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}

                  {childRev.completedBooks.length === 0 && childRev.inProgressBooks.length === 0 && childRev.stuckBooks.length === 0 && (
                    <div className="text-center py-8 text-gray-400 text-sm">
                      本月还没有阅读记录，开始第一本吧！
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        @media print {
          @page { size: A4; margin: 12mm; }
          body { background: #fff !important; }
          .print\\:hidden { display: none !important; }
          .print\\:block { display: block !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}</style>
    </div>
  );
}
