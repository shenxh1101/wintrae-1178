import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { formatTimerDisplay } from '@/utils/date';

interface TimerProps {
  onTimeUpdate?: (seconds: number) => void;
  initialSeconds?: number;
}

export default function Timer({ onTimeUpdate, initialSeconds = 0 }: TimerProps) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = window.setInterval(() => {
        setSeconds((prev) => {
          const next = prev + 1;
          onTimeUpdate?.(next);
          return next;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, onTimeUpdate]);

  const handleReset = () => {
    setIsRunning(false);
    setSeconds(0);
    onTimeUpdate?.(0);
  };

  const timeDisplay = formatTimerDisplay(seconds);
  const [h, m, s] = timeDisplay.split(':');

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      <div className="flex items-center justify-center gap-2">
        {[h, m, s].map((val, idx) => (
          <div key={idx} className="flex items-center">
            <div className="w-20 h-24 sm:w-24 sm:h-28 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-500 shadow-lg flex items-center justify-center">
              <span className="text-4xl sm:text-5xl font-bold text-white font-mono tabular-nums">
                {val}
              </span>
            </div>
            {idx < 2 && (
              <span className="text-4xl sm:text-5xl font-bold text-orange-400 mx-1 animate-pulse">:</span>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsRunning(!isRunning)}
          className={`px-8 py-3 rounded-full font-bold text-white shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 flex items-center gap-2 ${
            isRunning
              ? 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600'
              : 'bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600'
          }`}
        >
          {isRunning ? (
            <>
              <Pause className="w-5 h-5" />
              暂停
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              {seconds > 0 ? '继续' : '开始'}
            </>
          )}
        </button>
        <button
          onClick={handleReset}
          className="p-3 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all duration-200 hover:scale-105 active:scale-95"
          title="重置"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      <p className="text-sm text-gray-500">
        {isRunning ? '正在计时中... 专注阅读吧！' : seconds > 0 ? '已暂停，点击继续' : '准备好就开始吧'}
      </p>
    </div>
  );
}
