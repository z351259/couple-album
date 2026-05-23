import { useState, useEffect } from 'react'
import Masonry from 'react-masonry-css'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, MessageCircle, MapPin, Calendar, Check } from 'lucide-react'
import type { Photo } from '@/types'
import useStore from '@/stores/useStore'
import { favoriteApi } from '@/services/api'
import { toast } from '@/components/common/Toast'
import PhotoViewer from '@/components/photo/PhotoViewer'

interface MasonryGridProps {
  photos: Photo[]
  selectionMode?: boolean
  selectedPhotos?: Set<string>
  onToggleSelection?: (photoId: string) => void
}

const breakpointColumns = {
  default: 4,
  1100: 3,
  700: 2,
  500: 1,
}

export default function MasonryGrid({
  photos,
  selectionMode = false,
  selectedPhotos = new Set(),
  onToggleSelection,
}: MasonryGridProps) {
  const { setCurrentPhoto, showPhotoViewer, setShowPhotoViewer } = useStore()
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [favoritedIds, setFavoritedIds] = useState<Set<string>>(new Set())

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

  const handleClick = (photo: Photo) => {
    if (selectionMode && onToggleSelection) {
      onToggleSelection(photo.id)
    } else {
      setCurrentPhoto(photo)
      setShowPhotoViewer(true)
    }
  }

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
      console.error('收藏操作失败:', error)
      toast.error('操作失败')
    }
  }

  return (
    <>
      <Masonry
        breakpointCols={breakpointColumns}
        className="flex -ml-4 w-auto"
        columnClassName="pl-4 bg-clip-padding"
      >
        {photos.map((photo, index) => (
          <motion.div
            key={photo.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="mb-4 cursor-pointer group"
            onMouseEnter={() => setHoveredId(photo.id)}
            onMouseLeave={() => setHoveredId(null)}
            onClick={() => handleClick(photo)}
          >
            <div className={`relative overflow-hidden rounded-xl shadow-lg transition-all duration-300 group-hover:shadow-xl group-hover:scale-[1.02] ${
              selectionMode && selectedPhotos.has(photo.id) ? 'ring-4 ring-pink-500' : ''
            }`}>
              {/* 选择复选框 */}
              {selectionMode && (
                <div className="absolute top-3 left-3 z-10">
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      selectedPhotos.has(photo.id)
                        ? 'bg-pink-500 border-pink-500'
                        : 'bg-white/80 border-white/80 backdrop-blur-sm'
                    }`}
                  >
                    {selectedPhotos.has(photo.id) && (
                      <Check className="w-4 h-4 text-white" />
                    )}
                  </div>
                </div>
              )}

              {/* 图片 */}
              <img
                src={photo.mediumUrl || photo.thumbnailUrl}
                alt={photo.filename}
                loading="lazy"
                className="w-full h-auto object-cover"
                style={{
                  backgroundColor: photo.blurhash ? `#${photo.blurhash}` : '#fdf2f8',
                }}
              />

              {/* 悬停遮罩 */}
              <AnimatePresence>
                {hoveredId === photo.id && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"
                  >
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      {/* 心情标签 */}
                      {photo.mood && (
                        <span className="inline-block px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm mb-2">
                          {photo.mood}
                        </span>
                      )}

                      {/* 信息 */}
                      <div className="flex items-center gap-3 text-white/80 text-sm">
                        {photo.takenAt && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(photo.takenAt).toLocaleDateString('zh-CN')}
                          </span>
                        )}
                        {photo.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {photo.location}
                          </span>
                        )}
                      </div>

                      {/* 标签 */}
                      {photo.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {photo.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* 操作按钮 */}
                    <div className="absolute top-3 right-3 flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className={`p-2 backdrop-blur-sm rounded-full text-white ${
                          favoritedIds.has(photo.id)
                            ? 'bg-pink-500/80 hover:bg-pink-500'
                            : 'bg-white/20 hover:bg-white/30'
                        }`}
                        onClick={(e) => handleToggleFavorite(e, photo.id)}
                      >
                        <Heart
                          className={`w-4 h-4 ${
                            favoritedIds.has(photo.id) ? 'fill-white' : ''
                          }`}
                        />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30"
                        onClick={(e) => {
                          e.stopPropagation()
                          setCurrentPhoto(photo)
                          setShowPhotoViewer(true)
                        }}
                      >
                        <MessageCircle className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ))}
      </Masonry>

      {/* 照片查看器 */}
      {showPhotoViewer && <PhotoViewer />}
    </>
  )
}
