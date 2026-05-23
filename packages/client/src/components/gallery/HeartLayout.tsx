import { useMemo } from 'react'
import { motion } from 'framer-motion'
import useStore from '@/stores/useStore'
import type { Photo } from '@/types'

interface HeartLayoutProps {
  photos: Photo[]
}

export default function HeartLayout({ photos }: HeartLayoutProps) {
  const { setCurrentPhoto, setShowPhotoViewer } = useStore()

  // 生成爱心形状的位置
  const heartPositions = useMemo(() => {
    const positions: { x: number; y: number }[] = []
    const centerX = 50
    const centerY = 50
    const scale = 35

    // 爱心参数方程
    for (let i = 0; i < photos.length; i++) {
      const t = (i / photos.length) * 2 * Math.PI
      const x = centerX + scale * 16 * Math.sin(t) ** 3 / 16
      const y = centerY - scale * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) / 16
      positions.push({ x, y })
    }

    return positions
  }, [photos.length])

  const handleClick = (photo: Photo) => {
    setCurrentPhoto(photo)
    setShowPhotoViewer(true)
  }

  return (
    <div className="relative w-full" style={{ height: '80vh', minHeight: '600px' }}>
      {photos.map((photo, index) => {
        const pos = heartPositions[index]
        if (!pos) return null

        return (
          <motion.div
            key={photo.id}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05, type: 'spring' }}
            whileHover={{ scale: 1.2, zIndex: 50 }}
            className="absolute cursor-pointer"
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
            onClick={() => handleClick(photo)}
          >
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-4 border-pink-300 shadow-lg hover:border-pink-500 transition-colors">
              <img
                src={photo.thumbnailUrl || photo.mediumUrl}
                alt={photo.filename}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          </motion.div>
        )
      })}

      {/* 中间文字 */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="text-6xl">💕</span>
        </motion.div>
      </div>
    </div>
  )
}
