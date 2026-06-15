import { useState, useMemo } from 'react';
import {
  ChevronLeft, ChevronRight, BookCheck, AlertTriangle, TrendingUp, Clock, Calendar, BarChart3, Flame, Target,
} from 'lucide-react';
import { useReadingStore } from '@/store/useReadingStore';
import { formatDisplayDate } from '@/utils/date';
import { BOOK_CATEGORIES, type ChildQuarterlyReview } from '@/types';

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

const categoryColorMap: Record<string, string> = {
  '文学小说': 'bg-orange-400',
  '科普百科': 'bg-sky-400',
  '历史传记': 'bg-amber-500',
  '童话故事': 'bg-pink-400',
  '诗词国学': 'bg-emerald-400',
  '漫画绘本': 'bg-violet-400',
  '其他': 'bg-gray-400',
};

function formatQuarter(year: number, month: number): string {
  const quarterNum = Math.floor(month / 3) + 1;
  return `${year}年Q${quarterNum}`;
}

function MonthBars({ childRev }: { childRev: ChildQuarterlyReview }) {
  const maxPages = Math.max(...childRev.months.map((m) => m.totalPages), 1);
  const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
  return (
    <div className="flex items-end justify-around h-32 gap-4">
      {childRev.months.map((m, idx) => {
        const h = m.totalPages > 0 ? Math.max(20, (m.totalPages / maxPages) * 100) : 0;
        return (
          <div key={idx} className="flex flex-col items-center gap-2 flex-1">
            <div className="text-xs font-bold text-gray-700">{m.totalPages}页</div>
            <div
              className={`w-full rounded-t-lg bg-gradient-to-t ${colorClassMap[childRev.user.color]} transition-all`}
              style={{ height: `${h}%` }}
            />
            <div className="text-[11px] text-gray-500">{monthNames[m.month]}</div>
            <div className="text-[10px] text-gray-400">{m.completedDays}天</div>
          </div>
        );
      })}
    </div>
  );
}

function CategoryTrend({ childRev }: { childRev: ChildQuarterlyReview }) {
  const maxVal = Math.max(
    ...childRev.categoryTrend.flatMap((c) => [c.month1, c.month2, c.month3]),
    1
  );
  return (
    <div className="space-y-3">
      {childRev.categoryTrend.slice(0, 4).map((ct) => (
        <div key={ct.category} className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-gray-700">{ct.category}</span>
            <span className="text-gray-400">{ct.month1}→{ct.month2}→{ct.month3}</span>
          </div>
          <div className="flex gap-1 h-6">
            {[ct.month1, ct.month2, ct.month3].map((val, idx) => (
              <div
                key={idx}
                className={`${categoryColorMap[ct.category] || 'bg-gray-400'} rounded-md`}
                style={{ width: `${Math.max(4, (val / maxVal) * 100)}%` }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function QuarterlyPage() {
  const { getQuarterlyReview } = useReadingStore();
  const now = new Date();
  const currentQuarterStartMonth = Math.floor(now.getMonth() / 3) * 3;
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewQuarterStartMonth, setViewQuarterStartMonth] = useState(currentQuarterStartMonth);

  const review = useMemo(
    () => getQuarterlyReview(viewYear, viewQuarterStartMonth),
    [viewYear, viewQuarterStartMonth, getQuarterlyReview]
  );

  const handlePrevQuarter = () => {
    if (viewQuarterStartMonth === 0) {
      setViewYear((y) => y - 1);
      setViewQuarterStartMonth(9);
    } else {
      setViewQuarterStartMonth((m) => m - 3);
    }
  };

  const handleNextQuarter = () => {
    if (viewQuarterStartMonth === 9) {
      setViewYear((y) => y + 1);
      setViewQuarterStartMonth(0);
    } else {
      setViewQuarterStartMonth((m) => m + 3);
    }
  };

  const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
  const quarterRange = `${monthNames[viewQuarterStartMonth]} - ${monthNames[viewQuarterStartMonth + 2]}`;

  const familyTotalPages = review.children.reduce((s, c) => s + c.totalPages, 0);
  const familyTotalMinutes = review.children.reduce((s, c) => s + c.totalMinutes, 0);
  const familyTotalDays = review.children.reduce((s, c) => s + c.completedDays, 0);
  const familyCompletedBooks = review.children.reduce((s, c) => s + c.completedBooks.length, 0);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">季度阅读档案</h2>
          <p className="text-gray-500 mt-1">最近三个月阅读轨迹沉淀，做阶段性回顾和对比</p>
        </div>
        <div className="flex items-center gap-1 bg-white rounded-xl border border-gray-200 p-1 shadow-sm">
          <button
            onClick={handlePrevQuarter}
            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-600"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="px-4 text-center min-w-[180px]">
            <div className="font-bold text-gray-800 text-lg">{formatQuarter(viewYear, viewQuarterStartMonth)}</div>
            <div className="text-xs text-gray-400">{quarterRange}</div>
          </div>
          <button
            onClick={handleNextQuarter}
            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-600"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="bg-gradient-to-r from-teal-500 via-cyan-500 to-sky-500 rounded-3xl p-8 text-white shadow-xl">
        <div className="flex items-center gap-2 mb-6 opacity-90">
          <BarChart3 className="w-6 h-6" />
          <h3 className="text-xl font-bold">季度阅读档案 · {formatQuarter(viewYear, viewQuarterStartMonth)}</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <div className="text-white/70 text-sm mb-1 flex items-center gap-1"><BookCheck className="w-4 h-4" />累计页数</div>
            <div className="text-4xl font-bold">{familyTotalPages}</div>
          </div>
          <div>
            <div className="text-white/70 text-sm mb-1 flex items-center gap-1"><Clock className="w-4 h-4" />累计时长</div>
            <div className="text-4xl font-bold">{familyTotalMinutes}<span className="text-xl ml-1 opacity-70">分钟</span></div>
          </div>
          <div>
            <div className="text-white/70 text-sm mb-1 flex items-center gap-1"><Calendar className="w-4 h-4" />打卡天数</div>
            <div className="text-4xl font-bold">{familyTotalDays}<span className="text-xl ml-1 opacity-70">天</span></div>
          </div>
          <div>
            <div className="text-white/70 text-sm mb-1 flex items-center gap-1"><Target className="w-4 h-4" />读完书籍</div>
            <div className="text-4xl font-bold">{familyCompletedBooks}<span className="text-xl ml-1 opacity-70">本</span></div>
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
            const sortedByStability = [...review.children].sort((a, b) => b.stabilityScore - a.stabilityScore);
            const rank = sortedByStability.findIndex((c) => c.user.id === childRev.user.id) + 1;
            return (
              <div key={childRev.user.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className={`p-6 bg-gradient-to-r ${colorClassMap[color]} text-white`}>
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-3xl">{childRev.user.avatar}</span>
                        <h3 className="text-xl font-bold">{childRev.user.name}</h3>
                        {rank === 1 && childRev.stabilityScore > 0 && (
                          <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs font-bold">
                            🏆 最稳
                          </span>
                        )}
                      </div>
                      <div className="text-white/70 text-sm mt-1">
                        季度阅读档案
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
                        <div className="text-xs text-white/70">打卡</div>
                        <div className="text-2xl font-bold">{childRev.completedDays}<span className="text-sm ml-0.5 opacity-70">天</span></div>
                      </div>
                      <div>
                        <div className="text-xs text-white/70">稳定性</div>
                        <div className="text-2xl font-bold">{childRev.stabilityScore}<span className="text-sm ml-0.5 opacity-70">%</span></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className={`rounded-2xl p-5 ${colorBgMap[color]}`}>
                      <h4 className={`text-sm font-bold mb-4 flex items-center gap-1.5 ${colorTextMap[color]}`}>
                        <TrendingUp className="w-4 h-4" />
                        三个月阅读走势
                      </h4>
                      <MonthBars childRev={childRev} />
                    </div>

                    <div className="rounded-2xl p-5 bg-gray-50">
                      <h4 className="text-sm font-bold mb-4 flex items-center gap-1.5 text-gray-700">
                        <BookCheck className="w-4 h-4 text-emerald-500" />
                        本季度读完 ({childRev.completedBooks.length}本)
                      </h4>
                      {childRev.completedBooks.length === 0 ? (
                        <p className="text-sm text-gray-400 py-4 text-center">这季度还没读完书</p>
                      ) : (
                        <div className="space-y-2 max-h-36 overflow-y-auto">
                          {childRev.completedBooks.map(({ book, completedAt }) => (
                            <div key={book.id} className="flex items-center justify-between bg-white rounded-lg px-3 py-2">
                              <div>
                                <div className="text-sm font-medium text-gray-800">{book.title}</div>
                                <div className="text-xs text-gray-400">{book.author}</div>
                              </div>
                              <span className="text-xs text-emerald-600 font-medium">{formatDisplayDate(completedAt)}读完</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="rounded-2xl p-5 bg-indigo-50">
                      <h4 className="text-sm font-bold mb-3 flex items-center gap-1.5 text-indigo-700">
                        <BarChart3 className="w-4 h-4" />
                        阅读类型分布
                      </h4>
                      <div className="space-y-2">
                        {childRev.categoryBreakdown.slice(0, 4).map((cb) => (
                          <div key={cb.category} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${categoryColorMap[cb.category] || 'bg-gray-400'}`} />
                              <span className="text-gray-700">{cb.category}</span>
                            </div>
                            <span className="font-semibold text-gray-800">{cb.pages}页</span>
                          </div>
                        ))}
                        {childRev.categoryBreakdown.length === 0 && (
                          <p className="text-sm text-gray-400 text-center py-2">暂无数据</p>
                        )}
                      </div>
                    </div>

                    <div className="rounded-2xl p-5 bg-violet-50">
                      <h4 className="text-sm font-bold mb-3 flex items-center gap-1.5 text-violet-700">
                        <TrendingUp className="w-4 h-4" />
                        类型变化趋势
                      </h4>
                      {childRev.categoryTrend.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-4">暂无数据</p>
                      ) : (
                        <CategoryTrend childRev={childRev} />
                      )}
                    </div>

                    <div className="rounded-2xl p-5 bg-amber-50">
                      <h4 className="text-sm font-bold mb-3 flex items-center gap-1.5 text-amber-700">
                        <AlertTriangle className="w-4 h-4" />
                        断档分析
                      </h4>
                      {childRev.longestGap ? (
                        <div className="space-y-3">
                          <div className="bg-white rounded-lg p-3">
                            <div className="text-xs text-amber-600 font-medium mb-1">最长断档</div>
                            <div className="text-lg font-bold text-gray-800">{childRev.longestGap.days}天</div>
                            <div className="text-xs text-gray-500">
                              {formatDisplayDate(childRev.longestGap.startDate)} ~ {formatDisplayDate(childRev.longestGap.endDate)}
                            </div>
                          </div>
                          {childRev.commonGapPeriods.length > 0 && (
                            <div>
                              <div className="text-xs text-amber-600 font-medium mb-1">常断档时段</div>
                              <div className="flex flex-wrap gap-1">
                                {childRev.commonGapPeriods.map((p) => (
                                  <span key={p.period} className="bg-white px-2 py-1 rounded-md text-xs text-gray-600">
                                    {p.period} ({p.count}次)
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <Flame className="w-8 h-8 text-emerald-500 mx-auto mb-1" />
                          <p className="text-sm text-emerald-600 font-medium">太棒了！没有断档</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
