import { useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, MessageCircle, MapPin, Calendar } from 'lucide-react'
import useStore from '@/stores/useStore'
import type { Photo } from '@/types'

interface PhotoCard3DProps {
  photo: Photo
}

export default function PhotoCard3D({ photo }: PhotoCard3DProps) {
  const [isFlipped, setIsFlipped] = useState(false)
  const { setCurrentPhoto, setShowPhotoViewer } = useStore()

  const handleClick = () => {
    if (!isFlipped) {
      setCurrentPhoto(photo)
      setShowPhotoViewer(true)
    }
  }

  return (
    <div
      className="perspective-1000 cursor-pointer"
      style={{ perspective: '1000px' }}
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
    >
      <motion.div
        className="relative w-full aspect-square"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: 'spring' }}
      >
        {/* 正面 - 照片 */}
        <div
          className="absolute inset-0 rounded-xl overflow-hidden shadow-lg"
          style={{ backfaceVisibility: 'hidden' }}
          onClick={handleClick}
        >
          <img
            src={photo.mediumUrl || photo.thumbnailUrl}
            alt={photo.filename}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          {photo.mood && (
            <span className="absolute top-2 right-2 text-2xl">{photo.mood}</span>
          )}
        </div>

        {/* 背面 - 信息 */}
        <div
          className="absolute inset-0 rounded-xl overflow-hidden bg-gradient-to-br from-pink-100 to-rose-100 p-4 flex flex-col"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <div className="flex-1">
            <h4 className="font-semibold text-gray-800 mb-2">照片信息</h4>

            {photo.takenAt && (
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <Calendar className="w-4 h-4" />
                <span>{new Date(photo.takenAt).toLocaleDateString('zh-CN')}</span>
              </div>
            )}

            {photo.location && (
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <MapPin className="w-4 h-4" />
                <span>{photo.location}</span>
              </div>
            )}

            {photo.mood && (
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <Heart className="w-4 h-4" />
                <span>{photo.mood}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-500">
            <MessageCircle className="w-3 h-3" />
            <span>悬停查看详情</span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
