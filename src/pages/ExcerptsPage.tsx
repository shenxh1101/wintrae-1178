import { useState, useMemo } from 'react';
import { BookMarked, Trash2, Filter, BookOpen, Calendar } from 'lucide-react';
import { useReadingStore } from '@/store/useReadingStore';
import { formatDisplayDate } from '@/utils/date';
import { BOOK_CATEGORIES } from '@/types';

export default function ExcerptsPage() {
  const { books, excerpts, getExcerptsFiltered, removeExcerpt } = useReadingStore();

  const [filterBookId, setFilterBookId] = useState<string>('');
  const [filterStartDate, setFilterStartDate] = useState<string>('');
  const [filterEndDate, setFilterEndDate] = useState<string>('');

  const filteredExcerpts = useMemo(() => {
    const filters: { bookId?: string; startDate?: string; endDate?: string } = {};
    if (filterBookId) filters.bookId = filterBookId;
    if (filterStartDate) filters.startDate = filterStartDate;
    if (filterEndDate) filters.endDate = filterEndDate;
    return getExcerptsFiltered(filters);
  }, [filterBookId, filterStartDate, filterEndDate, getExcerptsFiltered]);

  const allExcerptsCount = getExcerptsFiltered().length;

  const handleRemove = (id: string) => {
    if (window.confirm('确定删除这条摘抄吗？')) {
      removeExcerpt(id);
    }
  };

  const clearFilters = () => {
    setFilterBookId('');
    setFilterStartDate('');
    setFilterEndDate('');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">摘抄收藏夹</h2>
          <p className="text-gray-500 mt-1">收藏书中的精彩句子，随时回顾</p>
        </div>
        <div className="px-4 py-2 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-200">
          <p className="text-xs text-emerald-600">已收藏</p>
          <p className="text-xl font-bold text-emerald-600 leading-none">{allExcerptsCount} 条</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-400" />
          <h3 className="font-bold text-gray-800">筛选条件</h3>
          {(filterBookId || filterStartDate || filterEndDate) && (
            <button
              onClick={clearFilters}
              className="ml-auto text-xs text-orange-600 hover:text-orange-700 font-medium"
            >
              清除筛选
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">按书名筛选</label>
            <select
              value={filterBookId}
              onChange={(e) => setFilterBookId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300 bg-white"
            >
              <option value="">全部图书</option>
              {books.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">开始日期</label>
            <input
              type="date"
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">结束日期</label>
            <input
              type="date"
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300"
            />
          </div>
        </div>

        {BOOK_CATEGORIES.length > 0 && (
          <div className="mt-4 flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-400">快速:</span>
            <button
              onClick={() => {
                const d = new Date();
                setFilterEndDate(d.toISOString().split('T')[0]);
                d.setDate(d.getDate() - 7);
                setFilterStartDate(d.toISOString().split('T')[0]);
              }}
              className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
            >
              最近7天
            </button>
            <button
              onClick={() => {
                const d = new Date();
                setFilterEndDate(d.toISOString().split('T')[0]);
                d.setDate(d.getDate() - 30);
                setFilterStartDate(d.toISOString().split('T')[0]);
              }}
              className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
            >
              最近30天
            </button>
            <button
              onClick={() => {
                const d = new Date();
                setFilterEndDate(d.toISOString().split('T')[0]);
                d.setDate(d.getDate() - 90);
                setFilterStartDate(d.toISOString().split('T')[0]);
              }}
              className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
            >
              最近90天
            </button>
          </div>
        )}
      </div>

      {filteredExcerpts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-24 h-24 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
            <BookMarked className="w-12 h-12 text-emerald-300" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            {allExcerptsCount === 0 ? '还没有摘抄收藏' : '没有符合条件的摘抄'}
          </h3>
          <p className="text-gray-500">
            {allExcerptsCount === 0
              ? '在打卡页可以收藏阅读时的精彩句子'
              : '尝试调整筛选条件'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredExcerpts.map((excerpt) => {
            const book = books.find((b) => b.id === excerpt.bookId);
            const excerptDate = new Date(excerpt.createdAt).toISOString().split('T')[0];
            return (
              <div
                key={excerpt.id}
                className="group relative bg-gradient-to-br from-emerald-50/80 to-teal-50/60 rounded-2xl border border-emerald-100 p-5 hover:shadow-md transition-shadow"
              >
                <button
                  onClick={() => handleRemove(excerpt.id)}
                  className="absolute top-3 right-3 p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                  title="删除"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="mb-3">
                  <div className="text-4xl opacity-30 leading-none mb-2">❝</div>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm">
                    {excerpt.content}
                  </p>
                  <div className="text-4xl opacity-30 leading-none mt-2 text-right">❞</div>
                </div>

                <div className="pt-3 border-t border-emerald-100/80">
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                    <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="font-medium text-gray-700 truncate">{book?.title || '未知图书'}</span>
                    {excerpt.page && <span className="text-emerald-600">· P{excerpt.page}</span>}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDisplayDate(excerptDate)}</span>
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
