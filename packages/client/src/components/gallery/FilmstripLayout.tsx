import { useRef } from 'react'
import { motion } from 'framer-motion'
import useStore from '@/stores/useStore'
import type { Photo } from '@/types'

interface FilmstripLayoutProps {
  photos: Photo[]
}

export default function FilmstripLayout({ photos }: FilmstripLayoutProps) {
  const { setCurrentPhoto, setShowPhotoViewer } = useStore()
  const scrollRef = useRef<HTMLDivElement>(null)

  const handleClick = (photo: Photo) => {
    setCurrentPhoto(photo)
    setShowPhotoViewer(true)
  }

  return (
    <div className="relative">
      {/* 胶片孔装饰 */}
      <div className="absolute top-0 left-0 right-0 h-8 bg-gray-900 flex items-center px-4 gap-4 z-10">
        {Array.from({ length: 50 }).map((_, i) => (
          <div key={i} className="w-4 h-4 rounded-sm bg-gray-700 flex-shrink-0" />
        ))}
      </div>

      {/* 横向滚动区域 */}
      <div
        ref={scrollRef}
        className="overflow-x-auto pb-4 pt-10 scrollbar-hide"
        style={{ scrollbarWidth: 'none' }}
      >
        <div className="flex gap-4 px-4" style={{ width: 'max-content' }}>
          {photos.map((photo, index) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.05, y: -10 }}
              className="flex-shrink-0 cursor-pointer group"
              onClick={() => handleClick(photo)}
            >
              <div className="relative w-48 h-48 overflow-hidden rounded-lg shadow-lg">
                <img
                  src={photo.mediumUrl || photo.thumbnailUrl}
                  alt={photo.filename}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />

                {/* 悬浮信息 */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-2 left-2 right-2">
                    {photo.mood && <span className="text-xl">{photo.mood}</span>}
                    <p className="text-white text-xs mt-1 truncate">
                      {photo.takenAt
                        ? new Date(photo.takenAt).toLocaleDateString('zh-CN')
                        : ''}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 底部胶片孔 */}
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gray-900 flex items-center px-4 gap-4 z-10">
        {Array.from({ length: 50 }).map((_, i) => (
          <div key={i} className="w-4 h-4 rounded-sm bg-gray-700 flex-shrink-0" />
        ))}
      </div>
    </div>
  )
}
