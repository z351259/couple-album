import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Gift, Plus, X, Star, Check, Sparkles } from 'lucide-react'

interface Wish {
  id: string
  title: string
  description: string
  category: 'travel' | 'food' | 'activity' | 'gift' | 'dream'
  completed: boolean
  completedAt?: string
  createdAt: string
}

interface WishListProps {
  isOpen: boolean
  onClose: () => void
}

const categories = [
  { id: 'travel', emoji: '✈️', label: '旅行' },
  { id: 'food', emoji: '🍽️', label: '美食' },
  { id: 'activity', emoji: '🎯', label: '活动' },
  { id: 'gift', emoji: '🎁', label: '礼物' },
  { id: 'dream', emoji: '💭', label: '梦想' },
]

export default function WishList({ isOpen, onClose }: WishListProps) {
  const [wishes, setWishes] = useState<Wish[]>([])
  const [showEditor, setShowEditor] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<Wish['category']>('activity')
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all')

  // 从 localStorage 加载
  useEffect(() => {
    const saved = localStorage.getItem('couple-wishes')
    if (saved) {
      try {
        setWishes(JSON.parse(saved))
      } catch (e) {
        console.error('加载愿望清单失败:', e)
      }
    }
  }, [])

  // 保存
  const saveWishes = (newWishes: Wish[]) => {
    setWishes(newWishes)
    localStorage.setItem('couple-wishes', JSON.stringify(newWishes))
  }

  // 添加愿望
  const handleAdd = () => {
    if (!title.trim()) return

    const newWish: Wish = {
      id: Date.now().toString(),
      title,
      description,
      category,
      completed: false,
      createdAt: new Date().toISOString(),
    }

    saveWishes([newWish, ...wishes])
    setTitle('')
    setDescription('')
    setShowEditor(false)
  }

  // 切换完成状态
  const toggleComplete = (id: string) => {
    saveWishes(wishes.map(w =>
      w.id === id
        ? { ...w, completed: !w.completed, completedAt: !w.completed ? new Date().toISOString() : undefined }
        : w
    ))
  }

  // 删除
  const handleDelete = (id: string) => {
    saveWishes(wishes.filter(w => w.id !== id))
  }

  // 过滤
  const filteredWishes = wishes.filter(w => {
    if (filter === 'pending') return !w.completed
    if (filter === 'completed') return w.completed
    return true
  })

  // 统计
  const completedCount = wishes.filter(w => w.completed).length
  const completionRate = wishes.length > 0 ? Math.round((completedCount / wishes.length) * 100) : 0

  const getCategoryEmoji = (cat: string) => categories.find(c => c.id === cat)?.emoji || '⭐'

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-2xl max-h-[80vh] bg-white rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 头部 */}
            <div className="sticky top-0 z-10 bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 bg-white/20 rounded-full hover:bg-white/30"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3 mb-3">
                <Gift className="w-8 h-8" />
                <div>
                  <h2 className="text-2xl font-bold">愿望清单</h2>
                  <p className="text-white/80">一起实现我们的愿望</p>
                </div>
              </div>

              {/* 进度条 */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-3 bg-white/30 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${completionRate}%` }}
                    className="h-full bg-white rounded-full"
                  />
                </div>
                <span className="text-sm font-medium">{completionRate}%</span>
              </div>
              <p className="text-sm text-white/70 mt-1">
                已完成 {completedCount}/{wishes.length} 个愿望
              </p>
            </div>

            {/* 筛选 */}
            <div className="sticky top-[168px] z-10 bg-white border-b px-6 py-3">
              <div className="flex gap-2">
                {(['all', 'pending', 'completed'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      filter === f
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {f === 'all' ? '全部' : f === 'pending' ? '未完成' : '已完成'}
                  </button>
                ))}
              </div>
            </div>

            {/* 内容 */}
            <div className="overflow-y-auto max-h-[calc(80vh-280px)]">
              {showEditor ? (
                <div className="p-6">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">分类</label>
                    <div className="flex gap-2">
                      {categories.map(cat => (
                        <button
                          key={cat.id}
                          onClick={() => setCategory(cat.id as Wish['category'])}
                          className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-all ${
                            category === cat.id
                              ? 'bg-purple-100 ring-2 ring-purple-500'
                              : 'bg-gray-50 hover:bg-gray-100'
                          }`}
                        >
                          <span>{cat.emoji}</span>
                          <span className="text-sm">{cat.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">愿望</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="我们想要..."
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-300"
                    />
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">描述（可选）</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="更多细节..."
                      className="w-full h-24 px-4 py-2 border rounded-lg resize-none focus:ring-2 focus:ring-purple-300"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowEditor(false)}
                      className="flex-1 py-2 text-gray-500"
                    >
                      取消
                    </button>
                    <button
                      onClick={handleAdd}
                      disabled={!title.trim()}
                      className="flex-1 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50"
                    >
                      添加愿望
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-6">
                  <button
                    onClick={() => setShowEditor(true)}
                    className="w-full mb-6 flex items-center justify-center gap-2 py-3 border-2 border-dashed border-purple-300 rounded-xl text-purple-600 hover:bg-purple-50 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    许个愿望
                  </button>

                  {filteredWishes.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                      <Sparkles className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p>{filter === 'all' ? '还没有愿望，一起许个愿吧' : '没有匹配的愿望'}</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredWishes.map((wish, index) => (
                        <motion.div
                          key={wish.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                            wish.completed ? 'bg-green-50' : 'bg-gray-50 hover:bg-gray-100'
                          }`}
                        >
                          <button
                            onClick={() => toggleComplete(wish.id)}
                            className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                              wish.completed
                                ? 'bg-green-500 border-green-500'
                                : 'border-gray-300 hover:border-purple-500'
                            }`}
                          >
                            {wish.completed && <Check className="w-5 h-5 text-white" />}
                          </button>

                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{getCategoryEmoji(wish.category)}</span>
                              <h3 className={`font-medium ${wish.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                                {wish.title}
                              </h3>
                            </div>
                            {wish.description && (
                              <p className="text-sm text-gray-500 mt-1">{wish.description}</p>
                            )}
                            {wish.completed && wish.completedAt && (
                              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                                <Star className="w-3 h-3" />
                                {new Date(wish.completedAt).toLocaleDateString('zh-CN')} 实现
                              </p>
                            )}
                          </div>

                          <button
                            onClick={() => handleDelete(wish.id)}
                            className="p-1 text-gray-400 hover:text-red-500"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
