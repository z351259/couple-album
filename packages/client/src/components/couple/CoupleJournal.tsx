import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, Plus, X, Calendar, Heart, Save } from 'lucide-react'

interface JournalEntry {
  id: string
  title: string
  content: string
  mood: string
  createdAt: string
  author: string
}

interface CoupleJournalProps {
  isOpen: boolean
  onClose: () => void
}

const moods = ['😊', '🥰', '😍', '😌', '😢', '😡', '🤔', '😴']

export default function CoupleJournal({ isOpen, onClose }: CoupleJournalProps) {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [showEditor, setShowEditor] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [mood, setMood] = useState('😊')

  // 从 localStorage 加载日记
  useEffect(() => {
    const saved = localStorage.getItem('couple-journal')
    if (saved) {
      try {
        setEntries(JSON.parse(saved))
      } catch (e) {
        console.error('加载日记失败:', e)
      }
    }
  }, [])

  // 保存到 localStorage
  const saveEntries = (newEntries: JournalEntry[]) => {
    setEntries(newEntries)
    localStorage.setItem('couple-journal', JSON.stringify(newEntries))
  }

  // 创建新日记
  const handleSave = () => {
    if (!title.trim() || !content.trim()) return

    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      title,
      content,
      mood,
      createdAt: new Date().toISOString(),
      author: '我', // 可以后续扩展为用户选择
    }

    if (selectedEntry) {
      // 编辑现有日记
      saveEntries(entries.map(e => e.id === selectedEntry.id ? { ...newEntry, id: selectedEntry.id } : e))
    } else {
      // 添加新日记
      saveEntries([newEntry, ...entries])
    }

    setTitle('')
    setContent('')
    setMood('😊')
    setShowEditor(false)
    setSelectedEntry(null)
  }

  // 删除日记
  const handleDelete = (id: string) => {
    saveEntries(entries.filter(e => e.id !== id))
  }

  // 编辑日记
  const handleEdit = (entry: JournalEntry) => {
    setSelectedEntry(entry)
    setTitle(entry.title)
    setContent(entry.content)
    setMood(entry.mood)
    setShowEditor(true)
  }

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
            <div className="sticky top-0 z-10 bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-white">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 bg-white/20 rounded-full hover:bg-white/30"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <BookOpen className="w-8 h-8" />
                <div>
                  <h2 className="text-2xl font-bold">情侣日记</h2>
                  <p className="text-white/80">记录我们的故事</p>
                </div>
              </div>
            </div>

            {/* 内容区 */}
            <div className="overflow-y-auto max-h-[calc(80vh-200px)]">
              {showEditor ? (
                // 编辑器
                <div className="p-6">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">心情</label>
                    <div className="flex gap-2">
                      {moods.map(m => (
                        <button
                          key={m}
                          onClick={() => setMood(m)}
                          className={`text-3xl p-2 rounded-lg transition-all ${
                            mood === m ? 'bg-amber-100 scale-110' : 'hover:bg-gray-100'
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">标题</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="今天发生了什么..."
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-300 focus:border-transparent"
                    />
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">内容</label>
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="写下你想说的话..."
                      className="w-full h-48 px-4 py-2 border rounded-lg resize-none focus:ring-2 focus:ring-amber-300 focus:border-transparent"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setShowEditor(false)
                        setSelectedEntry(null)
                        setTitle('')
                        setContent('')
                      }}
                      className="flex-1 py-2 text-gray-500 hover:text-gray-700"
                    >
                      取消
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={!title.trim() || !content.trim()}
                      className="flex-1 flex items-center justify-center gap-2 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      保存
                    </button>
                  </div>
                </div>
              ) : (
                // 日记列表
                <div className="p-6">
                  <button
                    onClick={() => setShowEditor(true)}
                    className="w-full mb-6 flex items-center justify-center gap-2 py-3 border-2 border-dashed border-amber-300 rounded-xl text-amber-600 hover:bg-amber-50 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    写新日记
                  </button>

                  {entries.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                      <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p>还没有日记，开始记录你们的故事吧</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {entries.map((entry, index) => (
                        <motion.div
                          key={entry.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="p-4 bg-amber-50 rounded-xl cursor-pointer hover:bg-amber-100 transition-colors"
                          onClick={() => handleEdit(entry)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-3xl">{entry.mood}</span>
                              <div>
                                <h3 className="font-medium text-gray-800">{entry.title}</h3>
                                <p className="text-sm text-gray-500 flex items-center gap-2">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(entry.createdAt).toLocaleDateString('zh-CN')}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDelete(entry.id)
                              }}
                              className="p-1 text-gray-400 hover:text-red-500"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="mt-2 text-gray-600 text-sm line-clamp-2">{entry.content}</p>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 底部统计 */}
            <div className="sticky bottom-0 bg-white border-t p-4 text-center text-sm text-gray-500">
              共 {entries.length} 篇日记
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
