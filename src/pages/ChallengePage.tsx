import { useState, useMemo } from 'react';
import {
  ChevronLeft, ChevronRight, Plus, Target, BookOpen, CalendarDays, TrendingUp, Trash2, Check,
} from 'lucide-react';
import { useReadingStore } from '@/store/useReadingStore';
import { BOOK_CATEGORIES, type Challenge } from '@/types';

const colorClassMap: Record<string, string> = {
  orange: 'from-orange-500 to-orange-400',
  sky: 'from-sky-500 to-sky-400',
  emerald: 'from-emerald-500 to-emerald-400',
  pink: 'from-pink-500 to-pink-400',
  violet: 'from-violet-500 to-violet-400',
  rose: 'from-rose-500 to-rose-400',
};

const challengeTypeConfig = {
  books_count: {
    label: '读完书数',
    icon: BookOpen,
    description: '设定本月要读完几本书',
    unit: '本',
    defaultTarget: 2,
    defaultTitle: '本月读完2本书',
    defaultDescription: '挑战本月读完指定数量的书',
  },
  streak_weeks: {
    label: '连续打卡',
    icon: CalendarDays,
    description: '设定本月有几周要连续打卡',
    unit: '周',
    defaultTarget: 3,
    defaultTitle: '本月3周不中断',
    defaultDescription: '挑战本月内有指定周数每周都打卡',
  },
  category_pages: {
    label: '类型阅读',
    icon: TrendingUp,
    description: '设定某个类型要读多少页',
    unit: '页',
    defaultTarget: 100,
    defaultTitle: '本月读100页科普书',
    defaultDescription: '挑战本月读完指定类型的指定页数',
  },
};

function formatMonthYear(year: number, month: number) {
  return `${year}年${month + 1}月`;
}

function renderProgressBar(current: number, gradient: string) {
  const pct = Math.min(100, current);
  return (
    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
      <div
        className={`h-full bg-gradient-to-r ${gradient} rounded-full transition-all flex items-center justify-end`}
        style={{ width: `${pct}%` }}
      >
        {pct >= 100 && <Check className="w-3 h-3 text-white mr-0.5" />}
      </div>
    </div>
  );
}

export default function ChallengePage() {
  const {
    users,
    currentUserId,
    addChallenge,
    updateChallenge,
    removeChallenge,
    getChallengesForMonth,
    getChallengeProgress,
    switchUser,
  } = useReadingStore();
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());

  const [showAddForm, setShowAddForm] = useState(false);
  const [newUserId, setNewUserId] = useState(currentUserId || '');
  const [newType, setNewType] = useState<'books_count' | 'streak_weeks' | 'category_pages'>('books_count');
  const [newTarget, setNewTarget] = useState('2');
  const [newCategory, setNewCategory] = useState(BOOK_CATEGORIES[0]);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');

  const children = users.filter((u) => u.role === 'child');
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

  const handleAddChallenge = () => {
    const typeCfg = challengeTypeConfig[newType];
    const target = parseInt(newTarget) || typeCfg.defaultTarget;
    const title = newTitle.trim() || typeCfg.defaultTitle.replace('2', String(target)).replace('3', String(target)).replace('100', String(target));
    const desc = newDescription.trim() || typeCfg.defaultDescription;
    addChallenge({
      userId: newUserId,
      year: viewYear,
      month: viewMonth,
      type: newType,
      target,
      category: newType === 'category_pages' ? newCategory : undefined,
      title,
      description: desc,
    });
    setShowAddForm(false);
    setNewTitle('');
    setNewDescription('');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">阅读挑战</h2>
          <p className="text-gray-500 mt-1">给每个孩子设定月度阅读挑战，完成后解锁荣誉</p>
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
            onClick={() => setShowAddForm(true)}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold flex items-center gap-2 hover:shadow-lg transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            新建挑战
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-amber-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-amber-500" />
            新建挑战 · {formatMonthYear(viewYear, viewMonth)}
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">给哪个孩子</label>
              <select
                value={newUserId}
                onChange={(e) => setNewUserId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-amber-400 focus:outline-none bg-white"
              >
                {children.map((c) => (
                  <option key={c.id} value={c.id}>{c.avatar} {c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">挑战类型</label>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(challengeTypeConfig) as Array<keyof typeof challengeTypeConfig>).map((type) => {
                  const cfg = challengeTypeConfig[type];
                  const Icon = cfg.icon;
                  const selected = newType === type;
                  return (
                    <button
                      key={type}
                      onClick={() => setNewType(type)}
                      className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border-2 text-xs font-medium transition ${
                        selected
                          ? 'border-amber-300 bg-amber-50 text-amber-700'
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
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                目标{challengeTypeConfig[newType].unit}数
              </label>
              <input
                type="number"
                min="1"
                value={newTarget}
                onChange={(e) => setNewTarget(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-amber-400 focus:outline-none"
              />
            </div>
            {newType === 'category_pages' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">选择类型</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-amber-400 focus:outline-none bg-white"
                >
                  {BOOK_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            )}
            <div className={newType === 'category_pages' ? 'md:col-span-2' : ''}>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">挑战名称（选填）</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder={challengeTypeConfig[newType].defaultTitle}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-amber-400 focus:outline-none"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">描述（选填）</label>
              <textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                rows={2}
                placeholder={challengeTypeConfig[newType].defaultDescription}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-amber-400 focus:outline-none resize-none"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100 font-medium"
            >
              取消
            </button>
            <button
              onClick={handleAddChallenge}
              disabled={!newUserId || parseInt(newTarget) <= 0}
              className={`px-5 py-2 rounded-xl font-bold text-white transition ${
                newUserId && parseInt(newTarget) > 0
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:shadow-lg'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              创建挑战
            </button>
          </div>
        </div>
      )}

      {children.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-gray-100 text-center">
          <Target className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-500">还没有孩子账户，先去添加吧</p>
        </div>
      ) : (
        <div className="space-y-6">
          {children.map((child) => {
            const color = child.color || 'orange';
            const childChallenges = monthChallenges.filter((c) => c.userId === child.id);
            return (
              <div key={child.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className={`p-6 bg-gradient-to-r ${colorClassMap[color]} text-white`}>
                  <div className="flex items-center gap-2">
                    <span className="text-3xl">{child.avatar}</span>
                    <div>
                      <h3 className="text-xl font-bold">{child.name}</h3>
                      <div className="text-white/70 text-sm">
                        {formatMonthYear(viewYear, viewMonth)}挑战 · {childChallenges.length}项
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  {childChallenges.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <Target className="w-10 h-10 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">这个月还没有设定挑战</p>
                      <button
                        onClick={() => { setNewUserId(child.id); setShowAddForm(true); }}
                        className="mt-2 text-sm text-amber-500 font-medium hover:text-amber-600"
                      >
                        点击添加
                      </button>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-4">
                      {childChallenges.map((challenge) => (
                        <ChallengeCard
                          key={challenge.id}
                          challenge={challenge}
                          color={color}
                          progress={getChallengeProgress(challenge)}
                          onRemove={() => removeChallenge(challenge.id)}
                          onToggleComplete={() => updateChallenge(challenge.id, { completed: !challenge.completed })}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ChallengeCard({
  challenge,
  color,
  progress,
  onRemove,
  onToggleComplete,
}: {
  challenge: Challenge;
  color: string;
  progress: number;
  onRemove: () => void;
  onToggleComplete: () => void;
}) {
  const cfg = challengeTypeConfig[challenge.type];
  const Icon = cfg.icon;
  const gradient = colorClassMap[color];
  const textColor = colorTextMap[color];
  const isComplete = progress >= 100 || challenge.completed;
  return (
    <div className={`rounded-2xl border-2 p-4 transition ${
      isComplete ? 'border-emerald-200 bg-emerald-50' : 'border-gray-100 bg-white'
    }`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${gradient} flex items-center justify-center`}>
            <Icon className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="font-bold text-gray-800 text-sm">{challenge.title}</div>
            <div className="text-xs text-gray-500">{cfg.label} · 目标{challenge.target}{cfg.unit}</div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onToggleComplete}
            className={`p-1.5 rounded-lg transition ${
              isComplete
                ? 'text-emerald-500 bg-emerald-100 hover:bg-emerald-200'
                : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
            }`}
            title={isComplete ? '取消完成' : '标记完成'}
          >
            <Check className="w-4 h-4" />
          </button>
          <button
            onClick={onRemove}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-rose-50 hover:text-rose-500 transition"
            title="删除"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      <p className="text-xs text-gray-600 mb-3 leading-relaxed">{challenge.description}</p>
      <div className="flex items-center gap-3">
        <div className="flex-1">
          {renderProgressBar(progress, gradient)}
        </div>
        <div className={`text-sm font-bold ${isComplete ? 'text-emerald-600' : textColor}`}>
          {progress}%
        </div>
      </div>
      {challenge.completed && progress < 100 && (
        <div className="mt-2 text-xs text-emerald-600 flex items-center gap-1">
          <Check className="w-3 h-3" /> 已手动标记完成
        </div>
      )}
    </div>
  );
}

const colorTextMap: Record<string, string> = {
  orange: 'text-orange-600',
  sky: 'text-sky-600',
  emerald: 'text-emerald-600',
  pink: 'text-pink-600',
  violet: 'text-violet-600',
  rose: 'text-rose-600',
};
