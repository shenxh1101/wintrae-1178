import { Trash2, Edit3, User, Tag } from 'lucide-react';
import type { Book } from '@/types';
import ProgressBar from './ProgressBar';
import { useReadingStore } from '@/store/useReadingStore';

interface BookCardProps {
  book: Book;
  onEdit?: (book: Book) => void;
  onDelete?: (id: string) => void;
  compact?: boolean;
  selected?: boolean;
  onClick?: () => void;
}

export default function BookCard({
  book,
  onEdit,
  onDelete,
  compact = false,
  selected = false,
  onClick,
}: BookCardProps) {
  const pagesRead = useReadingStore((s) => s.getBookPagesRead(book.id));

  const categoryColorMap: Record<string, string> = {
    '文学小说': 'bg-rose-50 text-rose-600 border-rose-200',
    '科普百科': 'bg-sky-50 text-sky-600 border-sky-200',
    '历史传记': 'bg-amber-50 text-amber-600 border-amber-200',
    '童话故事': 'bg-pink-50 text-pink-600 border-pink-200',
    '诗词国学': 'bg-emerald-50 text-emerald-600 border-emerald-200',
    '漫画绘本': 'bg-violet-50 text-violet-600 border-violet-200',
    '其他': 'bg-gray-50 text-gray-600 border-gray-200',
  };

  const isCompleted = pagesRead >= book.totalPages;

  if (compact) {
    return (
      <div
        onClick={onClick}
        className={`p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
          selected
            ? 'border-orange-400 bg-orange-50 shadow-md scale-[1.02]'
            : 'border-gray-200 bg-white hover:border-orange-200 hover:shadow-sm'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-14 rounded-lg bg-gradient-to-br from-orange-200 to-orange-300 flex items-center justify-center shadow-sm text-xl flex-shrink-0">
            📖
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-gray-800 truncate">{book.title}</p>
            <p className="text-xs text-gray-500 truncate">{book.author}</p>
            <div className="mt-1">
              <ProgressBar current={pagesRead} total={book.totalPages} showLabel={false} height="sm" color="orange" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-orange-100 overflow-hidden hover:shadow-md transition-shadow duration-300">
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className={`w-20 h-28 rounded-xl flex items-center justify-center shadow-md flex-shrink-0 ${
            isCompleted
              ? 'bg-gradient-to-br from-emerald-300 to-emerald-400'
              : 'bg-gradient-to-br from-orange-200 to-orange-300'
          }`}>
            <span className="text-4xl">{isCompleted ? '🎉' : '📖'}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="text-lg font-bold text-gray-800 truncate flex items-center gap-2">
                  {book.title}
                  {isCompleted && (
                    <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-600 rounded-full">
                      已读完
                    </span>
                  )}
                </h3>
                <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
                  <User className="w-3.5 h-3.5" />
                  <span>{book.author}</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {onEdit && (
                  <button
                    onClick={() => onEdit(book)}
                    className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => onDelete(book.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${categoryColorMap[book.category] || categoryColorMap['其他']}`}>
                <Tag className="w-3 h-3" />
                {book.category}
              </span>
              <span className="text-xs text-gray-500">
                每天目标 {book.dailyGoal} 页
              </span>
            </div>
            <div className="mt-4">
              <ProgressBar current={pagesRead} total={book.totalPages} color="orange" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
