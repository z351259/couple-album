import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Camera, Star, ChevronRight, X, Sparkles } from 'lucide-react'

interface Challenge {
  id: string
  title: string
  description: string
  emoji: string
  category: 'weekly' | 'monthly' | 'special'
  difficulty: 'easy' | 'medium' | 'hard'
  completed?: boolean
}

const challenges: Challenge[] = [
  {
    id: '1',
    title: '自拍挑战',
    description: '一起拍一张创意自拍，越搞怪越好！',
    emoji: '🤳',
    category: 'weekly',
    difficulty: 'easy',
  },
  {
    id: '2',
    title: '美食记录',
    description: '记录你们一起做的或吃的一顿美食',
    emoji: '🍕',
    category: 'weekly',
    difficulty: 'easy',
  },
  {
    id: '3',
    title: '日落时刻',
    description: '一起去看日落，拍下这浪漫的瞬间',
    emoji: '🌅',
    category: 'weekly',
    difficulty: 'medium',
  },
  {
    id: '4',
    title: '童年重现',
    description: '重现你们小时候的照片姿势',
    emoji: '👶',
    category: 'monthly',
    difficulty: 'medium',
  },
  {
    id: '5',
    title: '城市探险',
    description: '去一个从没去过的地方，拍下你们的发现',
    emoji: '🏙️',
    category: 'monthly',
    difficulty: 'medium',
  },
  {
    id: '6',
    title: '情侣穿搭',
    description: '穿情侣装出街，拍下你们的搭配',
    emoji: '👫',
    category: 'weekly',
    difficulty: 'easy',
  },
  {
    id: '7',
    title: '星空之夜',
    description: '一起去看星星，拍下星空下的你们',
    emoji: '✨',
    category: 'special',
    difficulty: 'hard',
  },
  {
    id: '8',
    title: '手写情书',
    description: '给对方写一封手写情书，拍照记录',
    emoji: '💌',
    category: 'monthly',
    difficulty: 'easy',
  },
  {
    id: '9',
    title: '舞蹈挑战',
    description: '一起学一段舞蹈，录制视频或拍照',
    emoji: '💃',
    category: 'special',
    difficulty: 'hard',
  },
  {
    id: '10',
    title: '回忆重游',
    description: '回到你们第一次约会的地方，拍一张对比照',
    emoji: '💕',
    category: 'special',
    difficulty: 'medium',
  },
]

interface CoupleChallengesProps {
  isOpen: boolean
  onClose: () => void
  onUpload?: (challengeId: string) => void
}

export default function CoupleChallenges({ isOpen, onClose, onUpload }: CoupleChallengesProps) {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'weekly' | 'monthly' | 'special'>('all')
  const [completedChallenges, setCompletedChallenges] = useState<Set<string>>(new Set())

  const filteredChallenges = selectedCategory === 'all'
    ? challenges
    : challenges.filter((c) => c.category === selectedCategory)

  const toggleComplete = (id: string) => {
    setCompletedChallenges((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-700'
      case 'medium':
        return 'bg-yellow-100 text-yellow-700'
      case 'hard':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'weekly':
        return '每周挑战'
      case 'monthly':
        return '每月挑战'
      case 'special':
        return '特别挑战'
      default:
        return category
    }
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
            <div className="sticky top-0 z-10 bg-gradient-to-r from-pink-500 to-rose-500 p-6 text-white">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-2">
                <Trophy className="w-8 h-8" />
                <h2 className="text-2xl font-bold">情侣挑战</h2>
              </div>
              <p className="text-white/80">完成挑战，创造更多美好回忆！</p>

              {/* 进度 */}
              <div className="mt-4 flex items-center gap-2">
                <div className="flex-1 h-2 bg-white/30 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(completedChallenges.size / challenges.length) * 100}%` }}
                    className="h-full bg-white rounded-full"
                  />
                </div>
                <span className="text-sm font-medium">
                  {completedChallenges.size}/{challenges.length}
                </span>
              </div>
            </div>

            {/* 分类筛选 */}
            <div className="sticky top-[152px] z-10 bg-white border-b px-6 py-3">
              <div className="flex gap-2">
                {['all', 'weekly', 'monthly', 'special'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat as typeof selectedCategory)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      selectedCategory === cat
                        ? 'bg-pink-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {cat === 'all' ? '全部' : getCategoryLabel(cat)}
                  </button>
                ))}
              </div>
            </div>

            {/* 挑战列表 */}
            <div className="overflow-y-auto max-h-[calc(80vh-250px)] p-6">
              <div className="space-y-4">
                {filteredChallenges.map((challenge, index) => (
                  <motion.div
                    key={challenge.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`relative p-4 rounded-xl border-2 transition-all ${
                      completedChallenges.has(challenge.id)
                        ? 'border-green-400 bg-green-50'
                        : 'border-gray-200 hover:border-pink-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Emoji */}
                      <div className="text-4xl">{challenge.emoji}</div>

                      {/* 内容 */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-gray-800">{challenge.title}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(challenge.difficulty)}`}>
                            {challenge.difficulty === 'easy' ? '简单' : challenge.difficulty === 'medium' ? '中等' : '困难'}
                          </span>
                          <span className="px-2 py-0.5 bg-pink-100 text-pink-700 rounded-full text-xs font-medium">
                            {getCategoryLabel(challenge.category)}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm">{challenge.description}</p>
                      </div>

                      {/* 操作 */}
                      <div className="flex items-center gap-2">
                        {completedChallenges.has(challenge.id) ? (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="flex items-center gap-1 text-green-600"
                          >
                            <Sparkles className="w-5 h-5" />
                            <span className="text-sm font-medium">已完成</span>
                          </motion.div>
                        ) : (
                          <button
                            onClick={() => toggleComplete(challenge.id)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors text-sm"
                          >
                            <Camera className="w-4 h-4" />
                            接受挑战
                          </button>
                        )}
                      </div>
                    </div>

                    {/* 已完成标记 */}
                    {completedChallenges.has(challenge.id) && (
                      <button
                        onClick={() => toggleComplete(challenge.id)}
                        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* 底部统计 */}
            <div className="sticky bottom-0 bg-white border-t p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    {completedChallenges.size} 个已完成
                  </span>
                  <span>{challenges.length - completedChallenges.size} 个待挑战</span>
                </div>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-100 rounded-lg text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  关闭
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
