import { useState } from 'react';
import { Plus, Filter, BookOpen } from 'lucide-react';
import { useReadingStore } from '@/store/useReadingStore';
import BookCard from '@/components/BookCard';
import Modal from '@/components/Modal';
import type { Book } from '@/types';
import { BOOK_CATEGORIES } from '@/types';

export default function BooksPage() {
  const { books, addBook, updateBook, removeBook } = useReadingStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    category: BOOK_CATEGORIES[0],
    totalPages: '',
    dailyGoal: '',
    coverUrl: '',
  });

  const openAddModal = () => {
    setEditingBook(null);
    setFormData({
      title: '',
      author: '',
      category: BOOK_CATEGORIES[0],
      totalPages: '',
      dailyGoal: '',
      coverUrl: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (book: Book) => {
    setEditingBook(book);
    setFormData({
      title: book.title,
      author: book.author,
      category: book.category,
      totalPages: book.totalPages.toString(),
      dailyGoal: book.dailyGoal.toString(),
      coverUrl: book.coverUrl,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.title.trim() || !formData.author.trim()) {
      return;
    }

    const bookData = {
      title: formData.title.trim(),
      author: formData.author.trim(),
      category: formData.category,
      totalPages: parseInt(formData.totalPages) || 0,
      dailyGoal: parseInt(formData.dailyGoal) || 10,
      coverUrl: formData.coverUrl.trim(),
    };

    if (editingBook) {
      updateBook(editingBook.id, bookData);
    } else {
      addBook(bookData);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('确定要删除这本书吗？相关的打卡记录也会被删除。')) {
      removeBook(id);
    }
  };

  const filteredBooks = selectedCategory
    ? books.filter((b) => b.category === selectedCategory)
    : books;

  const categories = ['全部', ...BOOK_CATEGORIES];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">我的书单</h2>
          <p className="text-gray-500 mt-1">
            共 {books.length} 本书
            {selectedCategory && ` · ${selectedCategory}`}
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-400 to-orange-500 text-white font-bold rounded-full shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200"
        >
          <Plus className="w-5 h-5" />
          添加图书
        </button>
      </div>

      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <Filter className="w-4 h-4 text-gray-400" />
        {categories.map((cat) => {
          const isActive = cat === '全部' ? !selectedCategory : selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat === '全部' ? null : cat)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-orange-100 text-orange-600 shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {filteredBooks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-24 h-24 rounded-full bg-orange-50 flex items-center justify-center mb-4">
            <BookOpen className="w-12 h-12 text-orange-300" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            {books.length === 0 ? '还没有添加图书' : '该分类暂无图书'}
          </h3>
          <p className="text-gray-500 mb-6">
            {books.length === 0 ? '点击右上角"添加图书"开始你的阅读之旅吧！' : '试试选择其他分类或添加新图书'}
          </p>
          {books.length === 0 && (
            <button
              onClick={openAddModal}
              className="px-6 py-2.5 bg-orange-500 text-white font-bold rounded-full hover:bg-orange-600 transition-colors"
            >
              添加第一本书
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredBooks.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              onEdit={openEditModal}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBook ? '编辑图书' : '添加图书'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              书名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300 transition-all"
              placeholder="请输入书名"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              作者 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300 transition-all"
              placeholder="请输入作者"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              分类
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300 transition-all bg-white"
            >
              {BOOK_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                总页数
              </label>
              <input
                type="number"
                min="1"
                value={formData.totalPages}
                onChange={(e) => setFormData({ ...formData, totalPages: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300 transition-all"
                placeholder="例如: 200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                每天目标页数
              </label>
              <input
                type="number"
                min="1"
                value={formData.dailyGoal}
                onChange={(e) => setFormData({ ...formData, dailyGoal: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300 transition-all"
                placeholder="例如: 20"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setIsModalOpen(false)}
              className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-xl font-bold hover:shadow-lg transition-all"
            >
              {editingBook ? '保存' : '添加'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
