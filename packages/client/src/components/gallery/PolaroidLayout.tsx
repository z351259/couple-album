import { useMemo } from 'react'
import { motion } from 'framer-motion'
import useStore from '@/stores/useStore'
import type { Photo } from '@/types'

interface PolaroidLayoutProps {
  photos: Photo[]
}

export default function PolaroidLayout({ photos }: PolaroidLayoutProps) {
  const { setCurrentPhoto, setShowPhotoViewer } = useStore()

  // 生成随机旋转角度
  const photosWithRotation = useMemo(() => {
    return photos.map((photo) => ({
      ...photo,
      rotation: Math.random() * 12 - 6, // -6 到 6 度
    }))
  }, [photos])

  const handleClick = (photo: Photo) => {
    setCurrentPhoto(photo)
    setShowPhotoViewer(true)
  }

  return (
    <div className="flex flex-wrap justify-center gap-8 p-8">
      {photosWithRotation.map((photo, index) => (
        <motion.div
          key={photo.id}
          initial={{ opacity: 0, y: 50, rotate: photo.rotation }}
          animate={{ opacity: 1, y: 0, rotate: photo.rotation }}
          transition={{
            delay: index * 0.1,
            type: 'spring',
            stiffness: 100,
          }}
          whileHover={{
            scale: 1.1,
            rotate: 0,
            zIndex: 10,
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
          }}
          className="relative cursor-pointer"
          style={{ transform: `rotate(${photo.rotation}deg)` }}
          onClick={() => handleClick(photo)}
        >
          {/* 宝丽来边框 */}
          <div className="bg-white p-3 pb-12 shadow-lg rounded-sm">
            <div className="relative w-48 h-48 overflow-hidden">
              <img
                src={photo.mediumUrl || photo.thumbnailUrl}
                alt={photo.filename}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>

            {/* 底部文字区域 */}
            <div className="absolute bottom-2 left-3 right-3">
              {photo.mood && (
                <span className="text-2xl">{photo.mood}</span>
              )}
              <p className="text-xs text-gray-500 mt-1 truncate">
                {photo.takenAt
                  ? new Date(photo.takenAt).toLocaleDateString('zh-CN')
                  : ''}
              </p>
            </div>
          </div>

          {/* 阴影效果 */}
          <div className="absolute inset-0 bg-black/5 rounded-sm -z-10 translate-x-1 translate-y-1" />
        </motion.div>
      ))}
    </div>
  )
}
