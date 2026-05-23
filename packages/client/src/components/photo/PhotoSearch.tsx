import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Calendar, Tag, MapPin, Heart } from 'lucide-react'

interface PhotoSearchProps {
  onSearch: (filters: SearchFilters) => void
}

export interface SearchFilters {
  keyword?: string
  dateFrom?: string
  dateTo?: string
  mood?: string
  location?: string
  tags?: string[]
}

const moods = [
  { value: 'happy', emoji: '😊', label: '开心' },
  { value: 'love', emoji: '❤️', label: '爱你' },
  { value: 'excited', emoji: '🎉', label: '兴奋' },
  { value: 'peaceful', emoji: '☮️', label: '平静' },
  { value: 'grateful', emoji: '🙏', label: '感恩' },
  { value: 'nostalgic', emoji: '🌅', label: '怀旧' },
  { value: 'adventurous', emoji: '🌍', label: '冒险' },
  { value: 'cozy', emoji: '☕', label: '温馨' },
  { value: 'playful', emoji: '😜', label: '调皮' },
  { value: 'romantic', emoji: '💕', label: '浪漫' },
]

export default function PhotoSearch({ onSearch }: PhotoSearchProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState<SearchFilters>({})
  const [selectedMood, setSelectedMood] = useState<string>('')

  const handleSearch = () => {
    onSearch({ ...filters, mood: selectedMood || undefined })
    setIsOpen(false)
  }

  const handleReset = () => {
    setFilters({})
    setSelectedMood('')
    onSearch({})
  }

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-md transition-shadow text-gray-700"
      >
        <Search className="w-5 h-5 text-pink-500" />
        搜索照片
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">搜索照片</h3>
                <button onClick={() => setIsOpen(false)} className="p-1 text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 关键词 */}
              <div className="mb-4">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Search className="w-4 h-4" />
                  关键词
                </label>
                <input
                  type="text"
                  value={filters.keyword || ''}
                  onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
                  placeholder="搜索照片名称、标签..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>

              {/* 日期范围 */}
              <div className="mb-4">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4" />
                  日期范围
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={filters.dateFrom || ''}
                    onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                  <input
                    type="date"
                    value={filters.dateTo || ''}
                    onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* 心情标签 */}
              <div className="mb-4">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Heart className="w-4 h-4" />
                  心情
                </label>
                <div className="flex flex-wrap gap-2">
                  {moods.map((mood) => (
                    <button
                      key={mood.value}
                      onClick={() => setSelectedMood(selectedMood === mood.value ? '' : mood.value)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition-colors ${
                        selectedMood === mood.value
                          ? 'bg-pink-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <span>{mood.emoji}</span>
                      <span>{mood.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 地点 */}
              <div className="mb-6">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4" />
                  地点
                </label>
                <input
                  type="text"
                  value={filters.location || ''}
                  onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                  placeholder="搜索拍摄地点..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>

              {/* 按钮 */}
              <div className="flex gap-3">
                <button
                  onClick={handleReset}
                  className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  重置
                </button>
                <button
                  onClick={handleSearch}
                  className="flex-1 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
                >
                  搜索
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
