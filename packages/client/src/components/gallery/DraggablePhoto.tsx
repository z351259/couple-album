import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, MessageCircle, MapPin, Calendar, Check, Move } from 'lucide-react'
import type { Photo } from '@/types'
import useStore from '@/stores/useStore'
import { favoriteApi } from '@/services/api'
import { toast } from '@/components/common/Toast'

interface DraggablePhotoProps {
  photo: Photo
  index: number
  children?: React.ReactNode
  onDragEnd?: (photoId: string, newIndex: number) => void
  dragEnabled?: boolean
  className?: string
  style?: React.CSSProperties
  showOverlay?: boolean
  selectionMode?: boolean
  selected?: boolean
  onToggleSelection?: (photoId: string) => void
}

export default function DraggablePhoto({
  photo,
  index,
  children,
  onDragEnd,
  dragEnabled = true,
  className = '',
  style,
  showOverlay = true,
  selectionMode = false,
  selected = false,
  onToggleSelection,
}: DraggablePhotoProps) {
  const { setCurrentPhoto, setShowPhotoViewer } = useStore()
  const [hovered, setHovered] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [favorited, setFavorited] = useState(false)
  const dragRef = useRef<HTMLDivElement>(null)

  const handleClick = () => {
    if (selectionMode && onToggleSelection) {
      onToggleSelection(photo.id)
    } else if (!isDragging) {
      setCurrentPhoto(photo)
      setShowPhotoViewer(true)
    }
  }

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      if (favorited) {
        await favoriteApi.remove(photo.id)
        setFavorited(false)
        toast.success('已取消收藏')
      } else {
        await favoriteApi.add(photo.id)
        setFavorited(true)
        toast.success('已收藏')
      }
    } catch {
      toast.error('操作失败')
    }
  }

  return (
    <motion.div
      ref={dragRef}
      className={`relative cursor-pointer group ${className}`}
      style={style}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.5) }}
      drag={dragEnabled}
      dragMomentum={false}
      dragElastic={0.1}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={(_, info) => {
        setIsDragging(false)
        onDragEnd?.(photo.id, index)
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handleClick}
      whileHover={!isDragging ? { scale: 1.02 } : undefined}
      whileDrag={{ scale: 1.05, zIndex: 100, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}
    >
      {/* 拖拽指示器 */}
      {dragEnabled && hovered && !isDragging && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute top-2 left-2 z-20 p-1.5 bg-white/80 backdrop-blur-sm rounded-full shadow"
        >
          <Move className="w-3.5 h-3.5 text-gray-500" />
        </motion.div>
      )}

      {/* 选择复选框 */}
      {selectionMode && (
        <div className="absolute top-3 left-3 z-20">
          <div
            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
              selected
                ? 'bg-pink-500 border-pink-500'
                : 'bg-white/80 border-white/80 backdrop-blur-sm'
            }`}
          >
            {selected && <Check className="w-4 h-4 text-white" />}
          </div>
        </div>
      )}

      {/* 照片内容 */}
      {children}

      {/* 悬停遮罩 */}
      {showOverlay && (
        <AnimatePresence>
          {hovered && !isDragging && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent rounded-xl pointer-events-none"
            >
              <div className="absolute bottom-0 left-0 right-0 p-3">
                {/* 心情 */}
                {photo.mood && (
                  <span className="inline-block px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs mb-1">
                    {photo.mood}
                  </span>
                )}

                {/* 信息 */}
                <div className="flex items-center gap-2 text-white/80 text-xs">
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
                {photo.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {photo.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-1.5 py-0.5 bg-white/20 backdrop-blur-sm rounded-full text-white text-[10px]"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* 操作按钮 */}
              <div className="absolute top-3 right-3 flex gap-1.5 pointer-events-auto">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className={`p-1.5 backdrop-blur-sm rounded-full text-white ${
                    favorited ? 'bg-pink-500/80' : 'bg-white/20 hover:bg-white/30'
                  }`}
                  onClick={handleToggleFavorite}
                >
                  <Heart className={`w-3.5 h-3.5 ${favorited ? 'fill-white' : ''}`} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-1.5 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30"
                  onClick={(e) => {
                    e.stopPropagation()
                    setCurrentPhoto(photo)
                    setShowPhotoViewer(true)
                  }}
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* 拖拽中效果 */}
      {isDragging && (
        <div className="absolute inset-0 bg-pink-500/10 border-2 border-pink-400 rounded-xl pointer-events-none" />
      )}
    </motion.div>
  )
}
