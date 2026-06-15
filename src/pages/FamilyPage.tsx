import { useNavigate } from 'react-router-dom';
import {
  Users, BookOpen, Flame, Clock, Trophy, ChevronRight, Sparkles, ArrowRight, BarChart3,
} from 'lucide-react';
import { useReadingStore } from '@/store/useReadingStore';
import { formatDisplayDate } from '@/utils/date';

const colorClassMap: Record<string, string> = {
  orange: 'from-orange-400 to-orange-500',
  sky: 'from-sky-400 to-sky-500',
  emerald: 'from-emerald-400 to-emerald-500',
  pink: 'from-pink-400 to-pink-500',
  violet: 'from-violet-400 to-violet-500',
  rose: 'from-rose-400 to-rose-500',
};

const colorBorderMap: Record<string, string> = {
  orange: 'border-orange-200',
  sky: 'border-sky-200',
  emerald: 'border-emerald-200',
  pink: 'border-pink-200',
  violet: 'border-violet-200',
  rose: 'border-rose-200',
};

export default function FamilyPage() {
  const navigate = useNavigate();
  const { getChildSummaries, switchUser, getBookPagesReadForUser } = useReadingStore();
  const summaries = getChildSummaries();

  const familyTotalPages = summaries.reduce((s, c) => s + c.totalPages, 0);
  const familyTotalMinutes = summaries.reduce((s, c) => s + c.totalMinutes, 0);
  const familyWeeklyPages = summaries.reduce((s, c) => s + c.weeklyPages, 0);
  const familyWeeklyMinutes = summaries.reduce((s, c) => s + c.weeklyMinutes, 0);
  const familyTotalBadges = summaries.reduce((s, c) => s + c.unlockedCount, 0);

  const handleSwitchAndGo = (userId: string, path: string) => {
    switchUser(userId);
    navigate(path);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-400 to-violet-500 flex items-center justify-center shadow-lg">
            <Users className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">家庭总览</h2>
            <p className="text-gray-500 mt-0.5">一览每个孩子的阅读动态，随时切换管理</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-violet-100 p-4 text-center">
          <p className="text-xs text-gray-500 mb-1">家庭总页数</p>
          <p className="text-2xl font-bold text-violet-600">{familyTotalPages}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-sky-100 p-4 text-center">
          <p className="text-xs text-gray-500 mb-1">家庭总时长</p>
          <p className="text-2xl font-bold text-sky-600">{familyTotalMinutes}<span className="text-sm font-normal">分钟</span></p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-4 text-center">
          <p className="text-xs text-gray-500 mb-1">本周总页数</p>
          <p className="text-2xl font-bold text-orange-600">{familyWeeklyPages}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-amber-100 p-4 text-center">
          <p className="text-xs text-gray-500 mb-1">累计勋章</p>
          <p className="text-2xl font-bold text-amber-600">{familyTotalBadges}<span className="text-sm font-normal">枚</span></p>
        </div>
      </div>

      {summaries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-24 h-24 rounded-full bg-violet-50 flex items-center justify-center mb-4">
            <Users className="w-12 h-12 text-violet-300" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">还没有孩子账户</h3>
          <p className="text-gray-500">在右上角用户切换器中添加孩子账户</p>
        </div>
      ) : (
        <div className="space-y-6">
          {summaries.map((summary) => (
            <div
              key={summary.user.id}
              className={`bg-white rounded-2xl shadow-sm border ${colorBorderMap[summary.user.color]} overflow-hidden`}
            >
              <div className={`bg-gradient-to-r ${colorClassMap[summary.user.color]} px-6 py-4`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl shadow-inner">
                      {summary.user.avatar}
                    </div>
                    <div className="text-white">
                      <h3 className="text-xl font-bold">{summary.user.name}</h3>
                      <p className="text-white/80 text-sm">
                        {summary.bookCount}本书 · {summary.streakDays}天连续打卡
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {summary.recentBadges.length > 0 && (
                      <div className="hidden sm:flex items-center gap-1">
                        {summary.recentBadges.slice(0, 2).map((b) => (
                          <span key={b.id} className="text-xl" title={b.name}>{b.icon}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                  <div className="text-center p-3 bg-orange-50 rounded-xl">
                    <p className="text-xs text-gray-500">本周页数</p>
                    <p className="text-lg font-bold text-orange-600">{summary.weeklyPages}</p>
                  </div>
                  <div className="text-center p-3 bg-sky-50 rounded-xl">
                    <p className="text-xs text-gray-500">本周时长</p>
                    <p className="text-lg font-bold text-sky-600">{summary.weeklyMinutes}分</p>
                  </div>
                  <div className="text-center p-3 bg-emerald-50 rounded-xl">
                    <p className="text-xs text-gray-500">本周天数</p>
                    <p className="text-lg font-bold text-emerald-600">{summary.weeklyCompletedDays}/7</p>
                  </div>
                  <div className="text-center p-3 bg-amber-50 rounded-xl">
                    <p className="text-xs text-gray-500">勋章</p>
                    <p className="text-lg font-bold text-amber-600">{summary.unlockedCount}/{summary.totalBadgeCount}</p>
                  </div>
                </div>

                {summary.currentBooks.length > 0 && (
                  <div className="mb-5">
                    <h4 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-orange-500" />
                      正在阅读
                    </h4>
                    <div className="flex gap-3 overflow-x-auto pb-1">
                      {summary.currentBooks.map((book) => {
                        const pagesRead = getBookPagesReadForUser(book.id, summary.user.id);
                        const pct = book.totalPages > 0 ? Math.min(100, Math.round((pagesRead / book.totalPages) * 100)) : 0;
                        const showDate = book.lastReadDate
                          ? `${book.lastReadDate.slice(5)} 读过`
                          : '还没开读';
                        return (
                          <div key={book.id} className="flex-shrink-0 w-48 p-3 bg-gray-50 rounded-xl">
                            <p className="font-semibold text-sm text-gray-800 truncate">{book.title}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{book.author}</p>
                            <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full bg-gradient-to-r ${colorClassMap[summary.user.color]} rounded-full transition-all`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <div className="flex items-center justify-between mt-1">
                              <p className="text-xs text-gray-500">{pagesRead}/{book.totalPages}页 ({pct}%)</p>
                              <p className={`text-[10px] ${book.lastReadDate ? 'text-sky-500' : 'text-gray-400'}`}>{showDate}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {summary.recentBadges.length > 0 && (
                  <div className="mb-5">
                    <h4 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      最近勋章
                    </h4>
                    <div className="flex gap-2">
                      {summary.recentBadges.map((badge) => (
                        <div key={badge.id} className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 rounded-xl border border-amber-100">
                          <span className="text-lg">{badge.icon}</span>
                          <div>
                            <p className="text-xs font-semibold text-gray-700">{badge.name}</p>
                            {badge.unlockedAt && (
                              <p className="text-[10px] text-gray-400">
                                {formatDisplayDate(new Date(badge.unlockedAt).toISOString().split('T')[0])}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => handleSwitchAndGo(summary.user.id, '/checkin')}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium bg-orange-50 text-orange-600 rounded-xl hover:bg-orange-100 transition-colors"
                  >
                    去打卡 <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleSwitchAndGo(summary.user.id, '/books')}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium bg-sky-50 text-sky-600 rounded-xl hover:bg-sky-100 transition-colors"
                  >
                    书单 <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleSwitchAndGo(summary.user.id, '/stats')}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-colors"
                  >
                    统计 <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleSwitchAndGo(summary.user.id, '/rewards')}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-100 transition-colors"
                  >
                    勋章 <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
