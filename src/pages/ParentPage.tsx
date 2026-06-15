import { useState, useMemo, useEffect } from 'react';
import { Heart, Target, Lightbulb, Trash2, BookOpen, CalendarDays, ChevronLeft, ChevronRight, Plus, MessageCircle } from 'lucide-react';
import { useReadingStore, type ChildSummary } from '@/store/useReadingStore';
import type { FeedbackType, ParentFeedback } from '@/types';
import { formatDisplayDate, getWeekStart, getWeekRange, getLast7Days } from '@/utils/date';

const feedbackTypeConfig: Record<FeedbackType, { label: string; icon: any; color: string; bgClass: string; borderClass: string }> = {
  advice: { label: '阅读建议', icon: Lightbulb, color: '琥珀色', bgClass: 'bg-amber-50', borderClass: 'border-amber-200' },
  goal: { label: '阶段目标', icon: Target, color: '翠绿色', bgClass: 'bg-emerald-50', borderClass: 'border-emerald-200' },
  encouragement: { label: '鼓励语', icon: Heart, color: '粉红色', bgClass: 'bg-pink-50', borderClass: 'border-pink-200' },
};

const filterScopeOptions = [
  { key: 'all', label: '全部反馈', icon: MessageCircle },
  { key: 'book', label: '按书查看', icon: BookOpen },
  { key: 'week', label: '按周查看', icon: CalendarDays },
] as const;

type FilterScope = typeof filterScopeOptions[number]['key'];

export default function ParentPage() {
  const {
    users,
    getChildSummaries,
    books,
    currentUserId,
    switchUser,
    getFeedbacksForUser,
    addParentFeedback,
    removeParentFeedback,
    getBookPagesReadForUser,
    getBookLastReadDate,
    getWeeklyStatsForUser,
  } = useReadingStore();

  const summaries = useMemo(() => getChildSummaries(), [users, books, currentUserId, getChildSummaries]);
  const children = summaries;

  const [activeChildId, setActiveChildId] = useState<string>(currentUserId || (children[0]?.user.id ?? ''));
  const [filterType, setFilterType] = useState<FeedbackType | 'all'>('all');
  const [filterScope, setFilterScope] = useState<FilterScope>('all');
  const [filterBookId, setFilterBookId] = useState<string>('');
  const [filterWeekStart, setFilterWeekStart] = useState<string>(getWeekStart(new Date()));

  const [newType, setNewType] = useState<FeedbackType>('advice');
  const [newScope, setNewScope] = useState<'general' | 'book' | 'week'>('general');
  const [newBookId, setNewBookId] = useState<string>('');
  const [newWeekStart, setNewWeekStart] = useState<string>(getWeekStart(new Date()));
  const [newContent, setNewContent] = useState('');
  const [weekNavCursor, setWeekNavCursor] = useState<Date>(() => new Date());

  useEffect(() => {
    if (!activeChildId && children.length > 0) {
      setActiveChildId(children[0].user.id);
    }
  }, [activeChildId, children]);

  const activeChild = useMemo(
    () => children.find((c) => c.user.id === activeChildId),
    [children, activeChildId]
  );

  const userBooks = useMemo(
    () => books.filter((b) => b.userId === activeChildId),
    [books, activeChildId]
  );

  const sortedUserBooks = useMemo(() => {
    return [...userBooks].sort((a, b) => {
      const aLast = getBookLastReadDate(a.id, activeChildId) || '';
      const bLast = getBookLastReadDate(b.id, activeChildId) || '';
      if (bLast !== aLast) return bLast.localeCompare(aLast);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [userBooks, activeChildId, getBookLastReadDate]);

  const weekOptions = useMemo(() => {
    const weeks: { start: string; label: string }[] = [];
    const cursor = new Date(weekNavCursor.getFullYear(), weekNavCursor.getMonth(), 1);
    const endOfMonth = new Date(weekNavCursor.getFullYear(), weekNavCursor.getMonth() + 1, 0);
    while (cursor <= endOfMonth) {
      const ws = getWeekStart(new Date(cursor));
      if (!weeks.find((w) => w.start === ws)) {
        const { end } = getWeekRange(new Date(cursor));
        weeks.push({
          start: ws,
          label: `${ws.slice(5)} ~ ${end.slice(5)}`,
        });
      }
      cursor.setDate(cursor.getDate() + 7);
    }
    return weeks;
  }, [weekNavCursor]);

  const currentWeekLabel = useMemo(() => {
    const ws = getWeekStart(new Date());
    const { end } = getWeekRange(new Date());
    return `本周 ${ws.slice(5)} ~ ${end.slice(5)}`;
  }, []);

  const filteredFeedbacks = useMemo(() => {
    if (!activeChildId) return [];
    const filters: { type?: FeedbackType; bookId?: string; weekStart?: string } = {};
    if (filterType !== 'all') filters.type = filterType;
    if (filterScope === 'book' && filterBookId) filters.bookId = filterBookId;
    if (filterScope === 'week' && filterWeekStart) filters.weekStart = filterWeekStart;
    return getFeedbacksForUser(activeChildId, filters);
  }, [activeChildId, filterType, filterScope, filterBookId, filterWeekStart, getFeedbacksForUser]);

  const handleAddFeedback = () => {
    if (!activeChildId || !newContent.trim()) return;
    const fb: Omit<ParentFeedback, 'id' | 'createdAt'> = {
      userId: activeChildId,
      type: newType,
      bookId: newScope === 'book' && newBookId ? newBookId : null,
      weekStart: newScope === 'week' && newWeekStart ? newWeekStart : null,
      content: newContent.trim(),
    };
    addParentFeedback(fb);
    setNewContent('');
    setNewBookId('');
    setNewWeekStart(getWeekStart(new Date()));
  };

  const renderFeedbackScopeLabel = (fb: ParentFeedback) => {
    if (fb.bookId) {
      const b = books.find((x) => x.id === fb.bookId);
      return b ? `《${b.title}》` : '某本书';
    }
    if (fb.weekStart) {
      const { end } = getWeekRange(new Date(fb.weekStart));
      return `${fb.weekStart.slice(5)} ~ ${end.slice(5)}`;
    }
    return '通用';
  };

  const getChildColorClass = (summary?: ChildSummary) => {
    const c = summary?.user.color || 'orange';
    const map: Record<string, string> = {
      orange: 'from-orange-500 to-orange-400',
      sky: 'from-sky-500 to-sky-400',
      emerald: 'from-emerald-500 to-emerald-400',
      pink: 'from-pink-500 to-pink-400',
      violet: 'from-violet-500 to-violet-400',
      rose: 'from-rose-500 to-rose-400',
    };
    return map[c] || map.orange;
  };

  const getChildTextClass = (summary?: ChildSummary) => {
    const c = summary?.user.color || 'orange';
    const map: Record<string, string> = {
      orange: 'text-orange-600',
      sky: 'text-sky-600',
      emerald: 'text-emerald-600',
      pink: 'text-pink-600',
      violet: 'text-violet-600',
      rose: 'text-rose-600',
    };
    return map[c] || map.orange;
  };

  const handleSwitchUser = (userId: string) => {
    switchUser(userId);
    setActiveChildId(userId);
    setFilterBookId('');
    setNewBookId('');
  };

  const weekStats = activeChild ? getWeeklyStatsForUser(activeChild.user.id) : null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">家长陪读台</h2>
          <p className="text-gray-500 mt-1">为每个孩子留下长期阅读建议、阶段目标和鼓励语</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {children.map((summary) => {
          const Icon = feedbackTypeConfig.advice.icon;
          const active = summary.user.id === activeChildId;
          return (
            <button
              key={summary.user.id}
              onClick={() => handleSwitchUser(summary.user.id)}
              className={`text-left rounded-2xl p-4 border-2 transition-all ${
                active
                  ? 'border-transparent shadow-lg scale-[1.02]'
                  : 'border-gray-100 bg-white hover:shadow-md'
              } ${active ? `bg-gradient-to-br ${getChildColorClass(summary)} text-white` : ''}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`text-2xl ${active ? '' : ''}`}>{summary.user.avatar}</div>
                <div className="font-bold">{summary.user.name}</div>
              </div>
              <div className={`text-xs ${active ? 'text-white/80' : 'text-gray-500'}`}>
                {summary.streakDays > 0 ? `🔥 连续${summary.streakDays}天` : '开始阅读吧'}
              </div>
              <div className={`text-xs mt-1 ${active ? 'text-white/80' : 'text-gray-400'}`}>
                本周 {summary.weeklyPages}页 / {summary.weeklyCompletedDays}天
              </div>
              <div className="mt-2 flex items-center gap-1">
                <Icon className={`w-3 h-3 ${active ? 'text-white/70' : getChildTextClass(summary)}`} />
                <span className={`text-xs ${active ? 'text-white/70' : 'text-gray-500'}`}>
                  {getFeedbacksForUser(summary.user.id).length}条反馈
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {activeChild && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-500" />
              写新的反馈给{activeChild.user.avatar}{activeChild.user.name}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">类型</label>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(feedbackTypeConfig) as FeedbackType[]).map((type) => {
                    const cfg = feedbackTypeConfig[type];
                    const Icon = cfg.icon;
                    const selected = newType === type;
                    return (
                      <button
                        key={type}
                        onClick={() => setNewType(type)}
                        className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl border-2 text-sm font-medium transition ${
                          selected
                            ? `${cfg.borderClass} ${cfg.bgClass}`
                            : 'border-gray-100 text-gray-500 hover:border-gray-200'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {cfg.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">关联范围</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setNewScope('general')}
                    className={`py-2.5 rounded-xl border-2 text-sm font-medium transition ${
                      newScope === 'general'
                        ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                        : 'border-gray-100 text-gray-500 hover:border-gray-200'
                    }`}
                  >
                    通用
                  </button>
                  <button
                    onClick={() => setNewScope('book')}
                    className={`py-2.5 rounded-xl border-2 text-sm font-medium transition ${
                      newScope === 'book'
                        ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                        : 'border-gray-100 text-gray-500 hover:border-gray-200'
                    }`}
                  >
                    某本书
                  </button>
                  <button
                    onClick={() => setNewScope('week')}
                    className={`py-2.5 rounded-xl border-2 text-sm font-medium transition ${
                      newScope === 'week'
                        ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                        : 'border-gray-100 text-gray-500 hover:border-gray-200'
                    }`}
                  >
                    某一周
                  </button>
                </div>
              </div>

              {newScope === 'book' && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">选择图书</label>
                  <select
                    value={newBookId}
                    onChange={(e) => setNewBookId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-400 focus:outline-none bg-white"
                  >
                    <option value="">-- 请选择图书 --</option>
                    {sortedUserBooks.map((b) => {
                      const pages = getBookPagesReadForUser(b.id, activeChild.user.id);
                      const last = getBookLastReadDate(b.id, activeChild.user.id);
                      return (
                        <option key={b.id} value={b.id}>
                          《{b.title}》{pages > 0 ? ` (${pages}/${b.totalPages}页${last ? ` · 最近${last.slice(5)}` : ''})` : ''}
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}

              {newScope === 'week' && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-600">选择周</label>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setWeekNavCursor(new Date(weekNavCursor.getFullYear(), weekNavCursor.getMonth() - 1, 1))}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="text-sm font-medium text-gray-700 w-20 text-center">
                        {weekNavCursor.getFullYear()}年{weekNavCursor.getMonth() + 1}月
                      </span>
                      <button
                        onClick={() => setWeekNavCursor(new Date(weekNavCursor.getFullYear(), weekNavCursor.getMonth() + 1, 1))}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {weekOptions.map((w) => {
                      const isCurrent = newWeekStart === w.start;
                      const isThisWeek = w.start === getWeekStart(new Date());
                      return (
                        <button
                          key={w.start}
                          onClick={() => setNewWeekStart(w.start)}
                          className={`py-2 px-3 rounded-lg border-2 text-sm text-left transition ${
                            isCurrent
                              ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                              : 'border-gray-100 hover:border-gray-200 text-gray-600'
                          }`}
                        >
                          <span className="font-medium">{w.label}</span>
                          {isThisWeek && (
                            <span className="ml-1 text-xs text-indigo-500">(本周)</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">内容</label>
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  rows={4}
                  placeholder="写下你的建议/目标/鼓励，后面回看时能一起串起来看到..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-400 focus:outline-none resize-none bg-white"
                />
              </div>

              <button
                onClick={handleAddFeedback}
                disabled={!newContent.trim()}
                className={`w-full py-3 rounded-xl font-bold text-white transition ${
                  newContent.trim()
                    ? `bg-gradient-to-r ${getChildColorClass(activeChild)} hover:shadow-lg`
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                保存给{activeChild.user.name}的反馈
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-indigo-500" />
                已留下的反馈
              </h3>
              <span className="text-xs text-gray-400">共 {filteredFeedbacks.length} 条</span>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                    filterType === 'all'
                      ? 'bg-gray-800 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  全部类型
                </button>
                {(Object.keys(feedbackTypeConfig) as FeedbackType[]).map((type) => {
                  const cfg = feedbackTypeConfig[type];
                  return (
                    <button
                      key={type}
                      onClick={() => setFilterType(type)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                        filterType === type
                          ? `${cfg.bgClass} ${cfg.borderClass} border text-gray-700`
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {cfg.label}
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-wrap gap-2">
                {filterScopeOptions.map((opt) => {
                  const Icon = opt.icon;
                  const selected = filterScope === opt.key;
                  return (
                    <button
                      key={opt.key}
                      onClick={() => setFilterScope(opt.key)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition ${
                        selected
                          ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-transparent'
                      }`}
                    >
                      <Icon className="w-3 h-3" />
                      {opt.label}
                    </button>
                  );
                })}
              </div>

              {filterScope === 'book' && (
                <select
                  value={filterBookId}
                  onChange={(e) => setFilterBookId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white"
                >
                  <option value="">全部图书</option>
                  {sortedUserBooks.map((b) => (
                    <option key={b.id} value={b.id}>{b.title}</option>
                  ))}
                </select>
              )}

              {filterScope === 'week' && (
                <select
                  value={filterWeekStart}
                  onChange={(e) => setFilterWeekStart(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white"
                >
                  {weekOptions.map((w) => (
                    <option key={w.start} value={w.start}>第{w.start.slice(5)}周</option>
                  ))}
                </select>
              )}
            </div>

            <div className="space-y-3 max-h-[480px] overflow-y-auto pr-2">
              {filteredFeedbacks.length === 0 ? (
                <div className="py-12 text-center text-gray-400">
                  <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">还没有符合条件的反馈</p>
                </div>
              ) : (
                filteredFeedbacks.map((fb) => {
                  const cfg = feedbackTypeConfig[fb.type];
                  const Icon = cfg.icon;
                  return (
                    <div
                      key={fb.id}
                      className={`rounded-xl p-4 border-2 ${cfg.borderClass} ${cfg.bgClass}`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-1.5">
                          <Icon className={`w-4 h-4 ${getChildTextClass(activeChild)}`} />
                          <span className={`text-xs font-semibold ${getChildTextClass(activeChild)}`}>
                            {cfg.label}
                          </span>
                          <span className="text-xs text-gray-500">· {renderFeedbackScopeLabel(fb)}</span>
                        </div>
                        <button
                          onClick={() => removeParentFeedback(fb.id)}
                          className="text-gray-400 hover:text-rose-500 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{fb.content}</p>
                      <div className="mt-2 text-[11px] text-gray-400">
                        {formatDisplayDate(fb.createdAt)}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {activeChild && weekStats && (
        <div className="bg-gradient-to-r from-indigo-50 to-sky-50 rounded-2xl p-6 border border-indigo-100">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-indigo-500" />
            <h3 className="font-bold text-gray-800">
              {activeChild.user.avatar}{activeChild.user.name}的本周概况（{currentWeekLabel}）
            </h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-xs text-gray-500 mb-1">本周页数</div>
              <div className="text-2xl font-bold text-indigo-600">{weekStats.totalPages}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">本周时长</div>
              <div className="text-2xl font-bold text-sky-600">{weekStats.totalMinutes}<span className="text-sm text-gray-400 ml-1">分</span></div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">打卡天数</div>
              <div className="text-2xl font-bold text-emerald-600">{weekStats.completedDays}<span className="text-sm text-gray-400 ml-1">/7天</span></div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">目标完成率</div>
              <div className="text-2xl font-bold text-amber-600">{weekStats.completionRate}<span className="text-sm text-gray-400 ml-1">%</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
