import { NavLink } from 'react-router-dom';
import {
  BookOpen, CheckSquare, Trophy, BarChart3, Flame, CalendarDays, BookMarked, Users, Heart, LineChart,
} from 'lucide-react';
import { useReadingStore } from '@/store/useReadingStore';
import UserSwitcher from './UserSwitcher';

export default function Navbar() {
  const streakDays = useReadingStore((s) => s.getStreakDays());

  const navItems = [
    { path: '/family', label: '家庭', icon: Users },
    { path: '/parent', label: '陪读', icon: Heart },
    { path: '/monthly', label: '月报', icon: LineChart },
    { path: '/books', label: '书单', icon: BookOpen },
    { path: '/checkin', label: '打卡', icon: CheckSquare },
    { path: '/history', label: '历史', icon: CalendarDays },
    { path: '/excerpts', label: '摘抄', icon: BookMarked },
    { path: '/rewards', label: '奖励', icon: Trophy },
    { path: '/stats', label: '统计', icon: BarChart3 },
  ];

  return (
    <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-sm border-b border-orange-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16 gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center shadow-md flex-shrink-0">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div className="hidden sm:block min-w-0">
              <h1 className="text-lg font-bold text-gray-800 truncate">家庭阅读打卡</h1>
              <p className="text-xs text-gray-500 truncate">和孩子一起爱上阅读</p>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-1 flex-1 justify-center">
            {navItems.map(({ path, label, icon: Icon }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-orange-100 text-orange-600 shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                {label}
              </NavLink>
            ))}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {streakDays > 0 && (
              <div className="hidden sm:flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-amber-50 to-orange-50 rounded-full border border-orange-200">
                <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
                <span className="text-sm font-bold text-orange-600">{streakDays}天</span>
              </div>
            )}
            <UserSwitcher />
          </div>
        </div>

        <div className="lg:hidden flex items-center justify-between pb-3 gap-1 overflow-x-auto scrollbar-hide">
          {navItems.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex-shrink-0 ${
                  isActive
                    ? 'bg-orange-100 text-orange-600'
                    : 'text-gray-500'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              {label}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}
