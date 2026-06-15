import { useMemo } from 'react';
import { Trophy, Lock, Sparkles } from 'lucide-react';
import { useReadingStore } from '@/store/useReadingStore';

export default function RewardsPage() {
  const { badges, currentUserId, getCurrentUser } = useReadingStore();
  const currentUser = getCurrentUser();

  const userBadges = useMemo(
    () => badges.filter((b) => b.userId === currentUserId),
    [badges, currentUserId]
  );

  const unlockedBadges = userBadges.filter((b) => b.unlocked);
  const progress = userBadges.length > 0
    ? Math.round((unlockedBadges.length / userBadges.length) * 100)
    : 0;

  const recentBadges = [...unlockedBadges]
    .sort((a, b) => new Date(b.unlockedAt!).getTime() - new Date(a.unlockedAt!).getTime())
    .slice(0, 3);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">我的勋章</h2>
        <p className="text-gray-500">
          {currentUser?.avatar && <span className="mr-1">{currentUser.avatar}</span>}
          {currentUser?.name || '我'}的勋章墙 · 收集勋章，见证阅读成长
        </p>
      </div>

      <div className="bg-gradient-to-br from-amber-400 via-orange-400 to-orange-500 rounded-3xl p-6 mb-8 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Trophy className="w-10 h-10 text-yellow-200" />
            </div>
            <div>
              <p className="text-white/80 text-sm">已解锁</p>
              <p className="text-4xl font-bold">
                {unlockedBadges.length}
                <span className="text-xl text-white/70"> / {userBadges.length}</span>
              </p>
              <p className="text-white/80 text-sm mt-1">枚勋章</p>
            </div>
          </div>

          <div className="w-full sm:w-64">
            <div className="flex items-center justify-between mb-2 text-sm">
              <span className="text-white/80">收集进度</span>
              <span className="font-bold">{progress}%</span>
            </div>
            <div className="w-full h-4 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-yellow-200 to-yellow-100 rounded-full transition-all duration-1000"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {recentBadges.length > 0 && (
        <div className="mb-8">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            最近获得
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {recentBadges.map((badge) => (
              <div
                key={badge.id}
                className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-4 border border-amber-200 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center text-3xl shadow-inner animate-[wiggle_2s_ease-in-out_infinite]">
                    {badge.icon}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">{badge.name}</p>
                    <p className="text-xs text-gray-500">
                      {badge.unlockedAt
                        ? new Date(badge.unlockedAt).toLocaleDateString('zh-CN') + ' 获得'
                        : ''}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="font-bold text-gray-800 mb-4">勋章墙</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {userBadges.map((badge) => (
            <div
              key={badge.id}
              className={`group relative rounded-2xl p-5 text-center transition-all duration-300 ${
                badge.unlocked
                  ? 'bg-white border border-orange-100 shadow-sm hover:shadow-md hover:-translate-y-1'
                  : 'bg-gray-50 border border-gray-100'
              }`}
            >
              <div
                className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-3 transition-all duration-300 ${
                  badge.unlocked
                    ? 'bg-gradient-to-br from-amber-100 to-orange-100 shadow-inner group-hover:scale-110'
                    : 'bg-gray-100'
                }`}
              >
                {badge.unlocked ? (
                  <span className="text-4xl">{badge.icon}</span>
                ) : (
                  <Lock className="w-8 h-8 text-gray-300" />
                )}
              </div>

              <p
                className={`font-semibold text-sm mb-1 ${
                  badge.unlocked ? 'text-gray-800' : 'text-gray-400'
                }`}
              >
                {badge.name}
              </p>
              <p className={`text-xs ${badge.unlocked ? 'text-gray-500' : 'text-gray-400'}`}>
                {badge.condition}
              </p>

              {badge.unlocked && (
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-400/5 to-orange-400/5 rounded-2xl" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
