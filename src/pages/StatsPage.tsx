import { useMemo, useRef } from 'react';
import {
  BarChart3, BookOpen, Clock, Flame, Printer, Trophy, FileText, BookMarked,
} from 'lucide-react';
import { useReadingStore } from '@/store/useReadingStore';
import StatsCard from '@/components/StatsCard';
import ProgressBar from '@/components/ProgressBar';
import { getLast7Days, formatDisplayDate, formatTime } from '@/utils/date';

export default function StatsPage() {
  const {
    books,
    checkins,
    currentUserId,
    getWeeklyStats,
    getMostReadBooks,
    getStreakDays,
    getTotalPages,
    getTotalMinutes,
    getCompletedBooksCount,
    getBookPagesRead,
    getCurrentUser,
    getExcerptsFiltered,
  } = useReadingStore();

  const printRef = useRef<HTMLDivElement>(null);
  const weeklyStats = getWeeklyStats();
  const mostReadBooks = getMostReadBooks();
  const last7Days = getLast7Days();
  const streakDays = getStreakDays();
  const totalPages = getTotalPages();
  const totalMinutes = getTotalMinutes();
  const completedBooks = getCompletedBooksCount();
  const currentUser = getCurrentUser();

  const userBooks = useMemo(
    () => books.filter((b) => b.userId === currentUserId),
    [books, currentUserId]
  );
  const userCheckins = useMemo(
    () => checkins.filter((c) => c.userId === currentUserId),
    [checkins, currentUserId]
  );
  const allExcerpts = getExcerptsFiltered();

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>家庭阅读打卡记录 - ${currentUser?.name || ''}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif; padding: 40px; color: #333; line-height: 1.6; }
          h1 { color: #f97316; margin-bottom: 8px; }
          h2 { color: #374151; margin-top: 28px; margin-bottom: 12px; border-bottom: 2px solid #fed7aa; padding-bottom: 8px; }
          .header-meta { color: #6b7280; font-size: 14px; margin-bottom: 24px; }
          .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 28px; }
          .stat-card { background: #fff7ed; padding: 16px; border-radius: 8px; }
          .stat-value { font-size: 26px; font-weight: bold; color: #ea580c; }
          .stat-label { font-size: 12px; color: #78716c; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 14px; }
          th, td { padding: 10px; text-align: left; border-bottom: 1px solid #e5e7eb; }
          th { background: #fff7ed; color: #9a3412; font-weight: 600; }
          .book-row { display: flex; align-items: center; gap: 12px; padding: 12px; border-bottom: 1px solid #e5e7eb; }
          .book-icon { font-size: 32px; }
          .excerpt-item { padding: 14px; background: #ecfdf5; border-radius: 8px; margin-bottom: 10px; border-left: 4px solid #10b981; }
          .excerpt-content { font-size: 14px; color: #1f2937; white-space: pre-wrap; margin-bottom: 6px; }
          .excerpt-meta { font-size: 12px; color: #6b7280; }
          .quote-mark { font-size: 28px; color: #a7f3d0; line-height: 1; }
        </style>
      </head>
      <body>
        <div>
          ${printContent.innerHTML}
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 250);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">阅读统计</h2>
          <p className="text-gray-500 mt-1">
            {currentUser?.avatar && <span className="mr-1">{currentUser.avatar}</span>}
            {currentUser?.name || '我'}的阅读成长记录
          </p>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors text-gray-700 bg-white"
        >
          <Printer className="w-4 h-4" />
          打印清单
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatsCard
          icon={<Flame className="w-6 h-6" />}
          label="连续打卡"
          value={`${streakDays}天`}
          color="orange"
        />
        <StatsCard
          icon={<BookOpen className="w-6 h-6" />}
          label="累计页数"
          value={totalPages}
          subtitle="页"
          color="green"
        />
        <StatsCard
          icon={<Clock className="w-6 h-6" />}
          label="累计时长"
          value={totalMinutes}
          subtitle="分钟"
          color="blue"
        />
        <StatsCard
          icon={<Trophy className="w-6 h-6" />}
          label="已读完"
          value={completedBooks}
          subtitle={`共 ${userBooks.length} 本`}
          color="pink"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-5">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-orange-500" />
            本周阅读周报
          </h3>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">本周目标完成率</span>
              <span className="text-lg font-bold text-orange-600">{weeklyStats.completionRate}%</span>
            </div>
            <ProgressBar
              current={weeklyStats.completionRate}
              total={100}
              showLabel={false}
              height="lg"
              color="orange"
            />
          </div>

          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="text-center p-3 bg-orange-50 rounded-xl">
              <p className="text-2xl font-bold text-orange-600">{weeklyStats.totalPages}</p>
              <p className="text-xs text-gray-500">本周页数</p>
            </div>
            <div className="text-center p-3 bg-sky-50 rounded-xl">
              <p className="text-2xl font-bold text-sky-600">{weeklyStats.totalMinutes}</p>
              <p className="text-xs text-gray-500">本周分钟</p>
            </div>
            <div className="text-center p-3 bg-emerald-50 rounded-xl">
              <p className="text-2xl font-bold text-emerald-600">{weeklyStats.completedDays}/7</p>
              <p className="text-xs text-gray-500">打卡天数</p>
            </div>
          </div>

          <div className="space-y-2">
            {last7Days.map(({ date, weekday }, idx) => {
              const dayData = weeklyStats.dailyData[idx];
              const pages = dayData?.pages || 0;
              const maxPages = Math.max(...weeklyStats.dailyData.map((d) => d.pages), 1);
              const barWidth = maxPages > 0 ? (pages / maxPages) * 100 : 0;
              return (
                <div key={date} className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-10 flex-shrink-0">周{weekday}</span>
                  <div className="flex-1 h-6 bg-gray-50 rounded-lg overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-orange-300 to-orange-400 rounded-lg transition-all duration-500"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-gray-700 w-12 text-right">
                    {pages}页
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-5">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-orange-500" />
            最常读书目
          </h3>

          {mostReadBooks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <BookOpen className="w-12 h-12 text-gray-200 mb-3" />
              <p className="text-gray-400 text-sm">还没有阅读记录</p>
              <p className="text-gray-400 text-xs mt-1">快去打卡吧！</p>
            </div>
          ) : (
            <div className="space-y-3">
              {mostReadBooks.map((item, idx) => {
                const rankColors = [
                  'from-amber-400 to-orange-400',
                  'from-gray-300 to-gray-400',
                  'from-amber-600 to-amber-700',
                  'from-orange-200 to-orange-300',
                  'from-orange-200 to-orange-300',
                ];
                const percentage =
                  Math.min(
                    100,
                    Math.round((item.totalPages / item.book.totalPages) * 100)
                  ) || 0;
                return (
                  <div key={item.book.id} className="p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className={`w-8 h-8 rounded-lg bg-gradient-to-br ${
                          rankColors[idx] || rankColors[3]
                        } flex items-center justify-center text-white font-bold text-sm shadow-md`}
                      >
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 text-sm truncate">
                          {item.book.title}
                        </p>
                        <p className="text-xs text-gray-500">{item.book.author}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-orange-600 text-sm">
                          {item.totalPages}页
                        </p>
                        <p className="text-xs text-gray-400">{percentage}%</p>
                      </div>
                    </div>
                    <ProgressBar
                      current={item.totalPages}
                      total={item.book.totalPages}
                      showLabel={false}
                      height="sm"
                      color="orange"
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {allExcerpts.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-5 mb-8">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <BookMarked className="w-5 h-5 text-emerald-500" />
            最近摘抄
            <span className="text-xs font-normal text-gray-400 ml-1">
              （共 {allExcerpts.length} 条，完整列表请前往「摘抄」页）
            </span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-72 overflow-y-auto">
            {allExcerpts.slice(0, 6).map((excerpt) => {
              const book = userBooks.find((b) => b.id === excerpt.bookId);
              const excerptDate = excerpt.checkinDate;
              return (
                <div
                  key={excerpt.id}
                  className="p-3 bg-gradient-to-br from-emerald-50 to-teal-50/50 rounded-xl border border-emerald-100"
                >
                  <p className="text-xs text-gray-500 mb-1.5 flex items-center gap-1.5">
                    <BookOpen className="w-3 h-3 text-emerald-500" />
                    <span className="font-medium text-gray-600 truncate">
                      {book?.title || '未知'}
                    </span>
                    {excerpt.page && <span className="text-emerald-600">· P{excerpt.page}</span>}
                    <span className="ml-auto text-gray-400">{formatDisplayDate(excerptDate)}</span>
                  </p>
                  <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">
                    {excerpt.content}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 打印内容 - 隐藏容器 */}
      <div ref={printRef} className="hidden">
        <h1>📚 家庭阅读打卡记录</h1>
        <div className="header-meta">
          孩子姓名：<strong>{currentUser?.name || '未设置'}</strong> &nbsp;|&nbsp;
          生成时间：{new Date().toLocaleString('zh-CN')}
        </div>

        <h2>📊 总体统计</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{streakDays}</div>
            <div className="stat-label">连续打卡天数</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{totalPages}</div>
            <div className="stat-label">累计阅读页数</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{totalMinutes}</div>
            <div className="stat-label">累计阅读分钟</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              {completedBooks}/{userBooks.length}
            </div>
            <div className="stat-label">已读完 / 总数</div>
          </div>
        </div>

        <h2>📚 我的书单</h2>
        {userBooks.map((book) => {
          const pagesRead = getBookPagesRead(book.id);
          return (
            <div key={book.id} className="book-row">
              <span className="book-icon">📖</span>
              <div>
                <strong>{book.title}</strong> - {book.author}
                <div>
                  分类: {book.category} &nbsp;|&nbsp; 进度: {pagesRead}/{book.totalPages} 页
                  &nbsp;({book.totalPages > 0 ? Math.min(100, Math.round((pagesRead / book.totalPages) * 100)) : 0}%)
                </div>
              </div>
            </div>
          );
        })}

        <h2>📝 打卡记录</h2>
        <table>
          <thead>
            <tr>
              <th>日期</th>
              <th>书名</th>
              <th>页数</th>
              <th>时长</th>
              <th>阅读笔记</th>
              <th>家长评语</th>
            </tr>
          </thead>
          <tbody>
            {[...userCheckins]
              .sort((a, b) => b.date.localeCompare(a.date))
              .slice(0, 100)
              .map((checkin) => {
                const book = userBooks.find((b) => b.id === checkin.bookId);
                return (
                  <tr key={checkin.id}>
                    <td>{formatDisplayDate(checkin.date)}</td>
                    <td>{book?.title || '未知'}</td>
                    <td>{checkin.pagesRead}页</td>
                    <td>
                      {checkin.durationSeconds > 0
                        ? formatTime(checkin.durationSeconds)
                        : '-'}
                    </td>
                    <td>{checkin.note || '-'}</td>
                    <td>{checkin.parentComment || '-'}</td>
                  </tr>
                );
              })}
          </tbody>
        </table>

        {allExcerpts.length > 0 && (
          <>
            <h2>✍️ 摘抄收藏（共 {allExcerpts.length} 条）</h2>
            {allExcerpts.map((excerpt) => {
              const book = userBooks.find((b) => b.id === excerpt.bookId);
              const excerptDate = excerpt.checkinDate;
              return (
                <div key={excerpt.id} className="excerpt-item">
                  <div className="excerpt-meta" style={{ marginBottom: '8px' }}>
                    <strong>{book?.title || '未知图书'}</strong>
                    {excerpt.page && ` · 第${excerpt.page}页`}
                    &nbsp;&nbsp; 📅 {formatDisplayDate(excerptDate)}
                  </div>
                  <div className="excerpt-content">
                    <span className="quote-mark">❝ </span>
                    {excerpt.content}
                    <span className="quote-mark"> ❞</span>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
