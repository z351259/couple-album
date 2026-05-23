import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, X, Heart, MessageCircle } from 'lucide-react'
import useStore from '@/stores/useStore'
import type { Photo } from '@/types'

interface StoryLayoutProps {
  photos: Photo[]
}

export default function StoryLayout({ photos }: StoryLayoutProps) {
  const { setCurrentPhoto, setShowPhotoViewer } = useStore()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [showInfo, setShowInfo] = useState(false)

  const currentPhoto = photos[currentIndex]

  // 自动播放
  useEffect(() => {
    if (!isPlaying) return

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % photos.length)
    }, 5000)

    return () => clearInterval(timer)
  }, [isPlaying, photos.length])

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % photos.length)
  }, [photos.length])

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length)
  }, [photos.length])

  // 键盘控制
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goToNext()
      if (e.key === 'ArrowLeft') goToPrev()
      if (e.key === ' ') {
        e.preventDefault()
        setIsPlaying((prev) => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [goToNext, goToPrev])

  if (!currentPhoto) return null

  return (
    <div className="relative w-full h-[80vh] bg-black rounded-2xl overflow-hidden">
      {/* 照片 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPhoto.id}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          <img
            src={currentPhoto.largeUrl || currentPhoto.originalUrl}
            alt={currentPhoto.filename}
            className="w-full h-full object-contain"
          />

          {/* Ken Burns 效果 */}
          <motion.div
            className="absolute inset-0"
            animate={{
              scale: [1, 1.05],
            }}
            transition={{ duration: 5, ease: 'linear' }}
          >
            <img
              src={currentPhoto.largeUrl || currentPhoto.originalUrl}
              alt=""
              className="w-full h-full object-contain opacity-0"
            />
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* 进度条 */}
      <div className="absolute top-4 left-4 right-4 flex gap-1 z-20">
        {photos.map((_, index) => (
          <div key={index} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-white"
              initial={{ width: 0 }}
              animate={{
                width: index < currentIndex ? '100%' : index === currentIndex ? '100%' : '0%',
              }}
              transition={{ duration: index === currentIndex ? 5 : 0 }}
            />
          </div>
        ))}
      </div>

      {/* 控制按钮 */}
      <div className="absolute top-4 right-4 flex gap-2 z-20">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70"
        >
          {isPlaying ? '⏸' : '▶'}
        </button>
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70"
        >
          ℹ
        </button>
      </div>

      {/* 左右切换按钮 */}
      <button
        onClick={goToPrev}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 z-20"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 z-20"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* 照片信息 */}
      <AnimatePresence>
        {showInfo && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 z-20"
          >
            <div className="flex items-center gap-4">
              {currentPhoto.mood && (
                <span className="text-3xl">{currentPhoto.mood}</span>
              )}
              <div>
                <p className="text-white font-medium">
                  {currentPhoto.takenAt
                    ? new Date(currentPhoto.takenAt).toLocaleDateString('zh-CN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : '未知日期'}
                </p>
                {currentPhoto.location && (
                  <p className="text-white/70 text-sm">{currentPhoto.location}</p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 点击区域 */}
      <div className="absolute inset-0 flex z-10">
        <div className="w-1/3 h-full" onClick={goToPrev} />
        <div className="w-1/3 h-full" onClick={() => setShowInfo(!showInfo)} />
        <div className="w-1/3 h-full" onClick={goToNext} />
      </div>
    </div>
  )
}
