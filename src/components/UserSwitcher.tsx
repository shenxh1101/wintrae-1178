import { useState } from 'react';
import { ChevronDown, Plus, UserPlus, Settings, Trash2, Check } from 'lucide-react';
import { useReadingStore } from '@/store/useReadingStore';
import { AVATAR_OPTIONS, COLOR_OPTIONS } from '@/types';
import type { UserProfile } from '@/types';
import Modal from './Modal';

const colorClassMap: Record<string, string> = {
  orange: 'from-orange-400 to-orange-500',
  sky: 'from-sky-400 to-sky-500',
  emerald: 'from-emerald-400 to-emerald-500',
  pink: 'from-pink-400 to-pink-500',
  violet: 'from-violet-400 to-violet-500',
  rose: 'from-rose-400 to-rose-500',
};

export default function UserSwitcher() {
  const {
    users,
    currentUserId,
    switchUser,
    addUser,
    removeUser,
    updateUser,
    getCurrentUser,
  } = useReadingStore();

  const [isOpen, setIsOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

  const [formName, setFormName] = useState('');
  const [formAvatar, setFormAvatar] = useState(AVATAR_OPTIONS[0]);
  const [formColor, setFormColor] = useState('orange');
  const [formRole, setFormRole] = useState<'child' | 'parent'>('child');

  const currentUser = getCurrentUser();

  const openAddModal = () => {
    setEditingUser(null);
    setFormName('');
    setFormAvatar(AVATAR_OPTIONS[0]);
    setFormColor('orange');
    setFormRole('child');
    setShowAddModal(true);
  };

  const openEditModal = (user: UserProfile) => {
    setEditingUser(user);
    setFormName(user.name);
    setFormAvatar(user.avatar);
    setFormColor(user.color);
    setFormRole(user.role);
    setShowAddModal(true);
  };

  const handleSubmit = () => {
    if (!formName.trim()) return;
    const data = {
      name: formName.trim(),
      avatar: formAvatar,
      color: formColor,
      role: formRole,
    };
    if (editingUser) {
      updateUser(editingUser.id, data);
    } else {
      addUser(data);
    }
    setShowAddModal(false);
  };

  const handleRemove = (id: string) => {
    if (users.length <= 1) {
      alert('至少需要保留一个用户');
      return;
    }
    if (window.confirm('确定删除该用户吗？所有相关数据都会被删除。')) {
      removeUser(id);
    }
  };

  const handleSwitch = (id: string) => {
    switchUser(id);
    setIsOpen(false);
  };

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white hover:bg-gray-50 border border-gray-200 transition-colors shadow-sm"
        >
          <div
            className={`w-7 h-7 rounded-full bg-gradient-to-br ${
              colorClassMap[currentUser?.color || 'orange']
            } flex items-center justify-center text-sm`}
          >
            {currentUser?.avatar || '👤'}
          </div>
          <span className="font-medium text-gray-700 text-sm max-w-[80px] truncate">
            {currentUser?.name || '用户'}
          </span>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </button>

        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-[fadeIn_0.15s_ease-out]">
              <div className="p-2 border-b border-gray-100 bg-gray-50">
                <p className="text-xs text-gray-500 px-2 py-1">切换孩子账户</p>
              </div>
              <div className="p-1.5 max-h-64 overflow-y-auto">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className={`group flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-colors ${
                      user.id === currentUserId
                        ? 'bg-orange-50 border border-orange-200'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div
                      onClick={() => handleSwitch(user.id)}
                      className="flex-1 flex items-center gap-3 min-w-0"
                    >
                      <div
                        className={`w-10 h-10 rounded-xl bg-gradient-to-br ${
                          colorClassMap[user.color]
                        } flex items-center justify-center text-lg flex-shrink-0 shadow-sm`}
                      >
                        {user.avatar}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-800 text-sm truncate">
                            {user.name}
                          </p>
                          {user.role === 'parent' && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-sky-100 text-sky-600 rounded-full">
                              家长
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400">
                          {user.role === 'child' ? '孩子账户' : '家长账户'}
                        </p>
                      </div>
                      {user.id === currentUserId && (
                        <Check className="w-4 h-4 text-orange-500" />
                      )}
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditModal(user);
                          setIsOpen(false);
                        }}
                        className="p-1.5 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
                        title="编辑"
                      >
                        <Settings className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemove(user.id);
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="删除"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-2 border-t border-gray-100">
                <button
                  onClick={() => {
                    openAddModal();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-orange-600 hover:bg-orange-50 rounded-xl transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  添加新账户
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={editingUser ? '编辑账户' : '添加新账户'}
      >
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              名字/昵称 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300 transition-all"
              placeholder="请输入名字"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              角色
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'child', label: '孩子', icon: '🧒' },
                { value: 'parent', label: '家长', icon: '👨‍👩‍👧' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setFormRole(opt.value as any)}
                  className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${
                    formRole === opt.value
                      ? 'bg-orange-100 text-orange-700 border-2 border-orange-300'
                      : 'bg-gray-50 text-gray-600 border-2 border-transparent hover:bg-gray-100'
                  }`}
                >
                  <span>{opt.icon}</span>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              头像
            </label>
            <div className="grid grid-cols-10 gap-2 p-3 bg-gray-50 rounded-xl">
              {AVATAR_OPTIONS.map((avatar) => (
                <button
                  key={avatar}
                  onClick={() => setFormAvatar(avatar)}
                  className={`aspect-square flex items-center justify-center rounded-lg text-xl transition-all ${
                    formAvatar === avatar
                      ? 'bg-white shadow-md scale-110 ring-2 ring-orange-400'
                      : 'hover:bg-white/60'
                  }`}
                >
                  {avatar}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              主题颜色
            </label>
            <div className="flex gap-3">
              {COLOR_OPTIONS.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setFormColor(color.value)}
                  className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-xl transition-all ${
                    formColor === color.value
                      ? 'bg-gray-100 ring-2 ring-gray-300'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full bg-gradient-to-br ${colorClassMap[color.value]} shadow-sm`}
                  />
                  <span className="text-[10px] text-gray-500">{color.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setShowAddModal(false)}
              className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              {editingUser ? (
                <>
                  <UserPlus className="w-4 h-4" />
                  保存
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  添加
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
