export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const parseDate = (dateStr: string): Date => {
  return new Date(dateStr + 'T00:00:00');
};

export const formatDisplayDate = (dateStr: string): string => {
  const date = parseDate(dateStr);
  return `${date.getMonth() + 1}月${date.getDate()}日`;
};

export const formatTime = (seconds: number): string => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${h}时${m}分${s}秒`;
  }
  return `${m}分${s}秒`;
};

export const formatTimerDisplay = (seconds: number): string => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
};

export const getToday = (): string => {
  return formatDate(new Date());
};

export const getDaysAgo = (days: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return formatDate(d);
};

export const getLast7Days = (): { date: string; weekday: string }[] => {
  const result = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    result.push({
      date: formatDate(d),
      weekday: weekdays[d.getDay()],
    });
  }
  return result;
};

export const getStreakDays = (checkinDates: string[]): number => {
  if (checkinDates.length === 0) return 0;
  
  const uniqueDates = [...new Set(checkinDates)].sort().reverse();
  let streak = 0;
  const today = getToday();
  const yesterday = getDaysAgo(1);

  let currentDate = uniqueDates[0];

  if (currentDate !== today && currentDate !== yesterday) {
    return 0;
  }

  for (let i = 0; i < uniqueDates.length; i++) {
    const expectedDate = currentDate === today ? getDaysAgo(i) : getDaysAgo(i + 1);
    if (uniqueDates[i] === expectedDate) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
};

export const isSameDay = (date1: string, date2: string): boolean => {
  return date1 === date2;
};
