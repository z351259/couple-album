import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Heart, MessageCircle } from 'lucide-react'
import type { Photo } from '@/types'
import useStore from '@/stores/useStore'
import { favoriteApi } from '@/services/api'
import { toast } from '@/components/common/Toast'

interface Carousel3DProps {
  photos: Photo[]
}

export default function Carousel3D({ photos }: Carousel3DProps) {
  const { setCurrentPhoto, setShowPhotoViewer } = useStore()
  const [activeIndex, setActiveIndex] = useState(0)
  const [favoritedIds, setFavoritedIds] = useState<Set<string>>(new Set())
  const [isAutoPlaying, setIsAutoPlaying] = useState(false)

  const totalPhotos = photos.length
  const angleStep = 360 / Math.max(totalPhotos, 1)
  const radius = Math.max(300, totalPhotos * 40)

  // 加载收藏状态
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const res = await favoriteApi.getAll()
        if (res.success && res.data) {
          setFavoritedIds(new Set(res.data.map((p) => p.id)))
        }
      } catch (error) {
        console.error('加载收藏状态失败:', error)
      }
    }
    loadFavorites()
  }, [])

  // 自动播放
  useEffect(() => {
    if (!isAutoPlaying) return
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % totalPhotos)
    }, 3000)
    return () => clearInterval(timer)
  }, [isAutoPlaying, totalPhotos])

  const handleToggleFavorite = async (e: React.MouseEvent, photoId: string) => {
    e.stopPropagation()
    try {
      if (favoritedIds.has(photoId)) {
        await favoriteApi.remove(photoId)
        setFavoritedIds((prev) => {
          const next = new Set(prev)
          next.delete(photoId)
          return next
        })
        toast.success('已取消收藏')
      } else {
        await favoriteApi.add(photoId)
        setFavoritedIds((prev) => new Set(prev).add(photoId))
        toast.success('已收藏')
      }
    } catch (error) {
      toast.error('操作失败')
    }
  }

  const goTo = useCallback((index: number) => {
    setActiveIndex((index + totalPhotos) % totalPhotos)
  }, [totalPhotos])

  const goNext = useCallback(() => {
    goTo(activeIndex + 1)
  }, [activeIndex, goTo])

  const goPrev = useCallback(() => {
    goTo(activeIndex - 1)
  }, [activeIndex, goTo])

  // 键盘控制
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === 'ArrowRight') goNext()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [goNext, goPrev])

  return (
    <div className="relative w-full h-[calc(100vh-200px)] overflow-hidden bg-gradient-to-b from-gray-900 to-gray-800 rounded-xl">
      {/* 3D 场景 */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ perspective: '1200px' }}
      >
        <div
          className="relative w-[300px] h-[400px]"
          style={{
            transformStyle: 'preserve-3d',
            transform: `rotateY(${-activeIndex * angleStep}deg)`,
            transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {photos.map((photo, index) => {
            const angle = index * angleStep
            const isActive = index === activeIndex

            return (
              <motion.div
                key={photo.id}
                className="absolute inset-0 cursor-pointer"
                style={{
                  transform: `rotateY(${angle}deg) translateZ(${radius}px)`,
                  transformStyle: 'preserve-3d',
                }}
                onClick={() => {
                  if (isActive) {
                    setCurrentPhoto(photo)
                    setShowPhotoViewer(true)
                  } else {
                    goTo(index)
                  }
                }}
              >
                <div
                  className={`relative w-full h-full rounded-xl overflow-hidden shadow-2xl transition-all duration-500 ${
                    isActive
                      ? 'scale-110 ring-4 ring-pink-500/50'
                      : 'scale-90 opacity-60 brightness-75'
                  }`}
                >
                  <img
                    src={photo.mediumUrl || photo.thumbnailUrl}
                    alt={photo.filename}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />

                  {/* 活跃状态的遮罩 */}
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent">
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        {/* 心情 */}
                        {photo.mood && (
                          <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm mb-3">
                            {photo.mood}
                          </span>
                        )}

                        {/* 信息 */}
                        <div className="text-white">
                          <h3 className="font-medium text-lg mb-1">
                            {photo.takenAt
                              ? new Date(photo.takenAt).toLocaleDateString('zh-CN', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                })
                              : photo.filename}
                          </h3>
                          {photo.location && (
                            <p className="text-white/70 text-sm">{photo.location}</p>
                          )}
                        </div>

                        {/* 标签 */}
                        {photo.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {photo.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* 操作按钮 */}
                        <div className="flex gap-2 mt-4">
                          <button
                            onClick={(e) => handleToggleFavorite(e, photo.id)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-colors ${
                              favoritedIds.has(photo.id)
                                ? 'bg-pink-500 text-white'
                                : 'bg-white/20 text-white hover:bg-white/30'
                            }`}
                          >
                            <Heart
                              className={`w-4 h-4 ${
                                favoritedIds.has(photo.id) ? 'fill-white' : ''
                              }`}
                            />
                            {favoritedIds.has(photo.id) ? '已收藏' : '收藏'}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setCurrentPhoto(photo)
                              setShowPhotoViewer(true)
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 rounded-full text-white text-sm hover:bg-white/30 transition-colors"
                          >
                            <MessageCircle className="w-4 h-4" />
                            评论
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* 导航按钮 */}
      <button
        onClick={goPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors z-10"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={goNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors z-10"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* 底部控制 */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4">
        <button
          onClick={() => setIsAutoPlaying(!isAutoPlaying)}
          className={`px-4 py-2 rounded-full text-sm transition-colors ${
            isAutoPlaying
              ? 'bg-pink-500 text-white'
              : 'bg-white/20 text-white hover:bg-white/30'
          }`}
        >
          {isAutoPlaying ? '暂停' : '自动播放'}
        </button>

        {/* 指示器 */}
        <div className="flex gap-2">
          {photos.map((_, index) => (
            <button
              key={index}
              onClick={() => goTo(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                index === activeIndex
                  ? 'bg-pink-500 w-6'
                  : 'bg-white/50 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      </div>

      {/* 照片计数 */}
      <div className="absolute top-4 left-4 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm">
        {activeIndex + 1} / {totalPhotos}
      </div>
    </div>
  )
}
