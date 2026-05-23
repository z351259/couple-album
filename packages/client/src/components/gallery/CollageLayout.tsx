import { useMemo } from 'react'
import { motion } from 'framer-motion'
import useStore from '@/stores/useStore'
import type { Photo } from '@/types'

interface CollageLayoutProps {
  photos: Photo[]
}

export default function CollageLayout({ photos }: CollageLayoutProps) {
  const { setCurrentPhoto, setShowPhotoViewer } = useStore()

  // 生成随机位置和大小
  const collageItems = useMemo(() => {
    return photos.map((photo, index) => {
      const size = 150 + Math.random() * 150
      const x = Math.random() * 80
      const y = Math.random() * 80
      const rotation = Math.random() * 20 - 10
      const zIndex = Math.floor(Math.random() * photos.length)

      return { photo, size, x, y, rotation, zIndex, index }
    })
  }, [photos])

  const handleClick = (photo: Photo) => {
    setCurrentPhoto(photo)
    setShowPhotoViewer(true)
  }

  return (
    <div className="relative w-full" style={{ height: '80vh', minHeight: '600px' }}>
      {collageItems.map(({ photo, size, x, y, rotation, zIndex, index }) => (
        <motion.div
          key={photo.id}
          initial={{ opacity: 0, scale: 0, rotate: rotation }}
          animate={{ opacity: 1, scale: 1, rotate: rotation }}
          transition={{ delay: index * 0.05, type: 'spring' }}
          whileHover={{ scale: 1.1, rotate: 0, zIndex: 100 }}
          className="absolute cursor-pointer shadow-xl"
          style={{
            left: `${x}%`,
            top: `${y}%`,
            width: `${size}px`,
            height: `${size}px`,
            zIndex,
          }}
          onClick={() => handleClick(photo)}
        >
          {/* 照片 */}
          <div className="w-full h-full overflow-hidden rounded-lg border-4 border-white shadow-lg">
            <img
              src={photo.mediumUrl || photo.thumbnailUrl}
              alt={photo.filename}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>

          {/* 图钉效果 */}
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
            <div className="w-4 h-4 bg-red-500 rounded-full shadow-md" />
          </div>
        </motion.div>
      ))}
    </div>
  )
}
