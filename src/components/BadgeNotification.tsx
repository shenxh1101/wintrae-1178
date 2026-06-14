import { useEffect } from 'react';
import { Sparkles, X } from 'lucide-react';
import type { Badge } from '@/types';
import { useReadingStore } from '@/store/useReadingStore';

export default function BadgeNotification() {
  const newlyUnlockedBadge = useReadingStore((s) => s.newlyUnlockedBadge);
  const clearNewlyUnlockedBadge = useReadingStore((s) => s.clearNewlyUnlockedBadge);

  useEffect(() => {
    if (newlyUnlockedBadge) {
      const timer = setTimeout(() => {
        clearNewlyUnlockedBadge();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [newlyUnlockedBadge, clearNewlyUnlockedBadge]);

  if (!newlyUnlockedBadge) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-[bounceIn_0.5s_ease-out]">
      <div className="relative bg-gradient-to-br from-amber-400 via-orange-400 to-orange-500 rounded-3xl shadow-2xl p-6 max-w-sm mx-4">
        <button
          onClick={clearNewlyUnlockedBadge}
          className="absolute top-3 right-3 p-1 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
        
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center gap-1 mb-2">
            <Sparkles className="w-4 h-4 text-yellow-200 animate-pulse" />
            <span className="text-white/90 text-sm font-medium">恭喜解锁新勋章！</span>
            <Sparkles className="w-4 h-4 text-yellow-200 animate-pulse" />
          </div>
          
          <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center my-3 animate-[wiggle_1s_ease-in-out]">
            <span className="text-6xl">{newlyUnlockedBadge.icon}</span>
          </div>
          
          <h3 className="text-xl font-bold text-white">{newlyUnlockedBadge.name}</h3>
          <p className="text-white/80 text-sm mt-1">{newlyUnlockedBadge.description}</p>
        </div>
      </div>
    </div>
  );
}
