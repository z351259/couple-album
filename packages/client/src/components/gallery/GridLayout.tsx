import { motion } from 'framer-motion'
import { Heart, MessageCircle, ZoomIn } from 'lucide-react'
import useStore from '@/stores/useStore'
import type { Photo } from '@/types'

interface GridLayoutProps {
  photos: Photo[]
}

export default function GridLayout({ photos }: GridLayoutProps) {
  const { setCurrentPhoto, setShowPhotoViewer } = useStore()

  const handleClick = (photo: Photo) => {
    setCurrentPhoto(photo)
    setShowPhotoViewer(true)
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {photos.map((photo, index) => (
        <motion.div
          key={photo.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.05 }}
          className="group relative aspect-square cursor-pointer overflow-hidden rounded-xl"
          onClick={() => handleClick(photo)}
        >
          <img
            src={photo.mediumUrl || photo.thumbnailUrl}
            alt={photo.filename}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            loading="lazy"
          />

          {/* 悬浮遮罩 */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute bottom-0 left-0 right-0 p-3">
              {photo.mood && (
                <span className="text-2xl">{photo.mood}</span>
              )}
              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    // 收藏功能
                  }}
                  className="p-1.5 bg-white/20 rounded-full hover:bg-white/40 transition-colors"
                >
                  <Heart className="w-4 h-4 text-white" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    // 评论功能
                  }}
                  className="p-1.5 bg-white/20 rounded-full hover:bg-white/40 transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-white" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleClick(photo)
                  }}
                  className="p-1.5 bg-white/20 rounded-full hover:bg-white/40 transition-colors ml-auto"
                >
                  <ZoomIn className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
