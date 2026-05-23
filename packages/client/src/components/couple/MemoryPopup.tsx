import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Heart, Clock } from 'lucide-react'
import type { Photo } from '@/types'

interface MemoryPopupProps {
  photos: Photo[]
  anniversaryDate?: string
}

export default function MemoryPopup({ photos, anniversaryDate }: MemoryPopupProps) {
  const [show, setShow] = useState(false)
  const [memory, setMemory] = useState<Photo | null>(null)
  const [daysAgo, setDaysAgo] = useState(0)

  // 随机选择一个回忆
  const selectRandomMemory = useCallback(() => {
    if (photos.length === 0) return

    // 优先选择有拍摄日期的照片
    const photosWithDate = photos.filter((p) => p.takenAt || p.createdAt)
    if (photosWithDate.length === 0) return

    const randomIndex = Math.floor(Math.random() * photosWithDate.length)
    const selected = photosWithDate[randomIndex]
    const photoDate = new Date(selected.takenAt || selected.createdAt)
    const today = new Date()
    const diffDays = Math.floor((today.getTime() - photoDate.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays > 0) {
      setMemory(selected)
      setDaysAgo(diffDays)
      setShow(true)
    }
  }, [photos])

  // 定时弹出回忆
  useEffect(() => {
    // 30秒后首次弹出
    const initialTimer = setTimeout(() => {
      selectRandomMemory()
    }, 30000)

    // 之后每5分钟弹出一次
    const interval = setInterval(() => {
      selectRandomMemory()
    }, 5 * 60 * 1000)

    return () => {
      clearTimeout(initialTimer)
      clearInterval(interval)
    }
  }, [selectRandomMemory])

  if (!memory) return null

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          className="fixed bottom-4 right-4 z-50 max-w-sm"
        >
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-pink-100">
            {/* 照片 */}
            <div className="relative h-48">
              <img
                src={memory.mediumUrl || memory.originalUrl}
                alt=""
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

              {/* 关闭按钮 */}
              <button
                onClick={() => setShow(false)}
                className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/70"
              >
                <X className="w-4 h-4" />
              </button>

              {/* 标题 */}
              <div className="absolute bottom-3 left-3 right-3">
                <div className="flex items-center gap-2 text-white">
                  <Heart className="w-4 h-4 fill-pink-400 text-pink-400" />
                  <span className="text-sm font-medium">回忆弹窗</span>
                </div>
              </div>
            </div>

            {/* 信息 */}
            <div className="p-4">
              <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
                <Clock className="w-4 h-4" />
                <span>{daysAgo} 天前的今天</span>
              </div>

              {memory.mood && (
                <p className="text-2xl mb-2">{memory.mood}</span>
              )}

              {memory.location && (
                <p className="text-gray-600 text-sm">📍 {memory.location}</p>
              )}

              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => setShow(false)}
                  className="flex-1 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                >
                  关闭
                </button>
                <button
                  onClick={() => {
                    setShow(false)
                    // 可以添加查看大图的功能
                  }}
                  className="flex-1 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors text-sm"
                >
                  查看详情
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
