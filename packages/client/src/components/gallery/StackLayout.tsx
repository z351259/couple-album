import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import useStore from '@/stores/useStore'
import type { Photo } from '@/types'
import PhotoViewer from '@/components/photo/PhotoViewer'
import DraggablePhoto from './DraggablePhoto'
import { toast } from '@/components/common/Toast'

interface StackLayoutProps {
  photos: Photo[]
}

export default function StackLayout({ photos }: StackLayoutProps) {
  const { setCurrentPhoto, setShowPhotoViewer } = useStore()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isExpanded, setIsExpanded] = useState(false)

  const visiblePhotos = useMemo(() => {
    return photos.slice(currentIndex, currentIndex + 5)
  }, [photos, currentIndex])

  const handleClick = (photo: Photo) => {
    setCurrentPhoto(photo)
    setShowPhotoViewer(true)
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % photos.length)
  }

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length)
  }

  return (
    <div className="relative">
      {/* 堆叠视图 */}
      {!isExpanded ? (
        <div className="flex justify-center">
          <div className="relative w-72 h-72 md:w-96 md:h-96">
            <AnimatePresence>
              {visiblePhotos.map((photo, index) => (
                <motion.div
                  key={photo.id}
                  initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
                  animate={{
                    scale: 1 - index * 0.05,
                    opacity: 1 - index * 0.15,
                    rotate: index * 3,
                    y: index * 10,
                    zIndex: visiblePhotos.length - index,
                  }}
                  exit={{ scale: 0.8, opacity: 0, rotate: 10 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  className="absolute inset-0 cursor-pointer"
                  onClick={() => index === 0 ? handleClick(photo) : setCurrentIndex(currentIndex + index)}
                  style={{ zIndex: visiblePhotos.length - index }}
                >
                  <div className="w-full h-full rounded-2xl overflow-hidden shadow-xl border-4 border-white">
                    <img
                      src={photo.mediumUrl || photo.thumbnailUrl}
                      alt={photo.filename}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* 控制按钮 */}
            <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 flex gap-4">
              <button
                onClick={goToPrev}
                className="p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow"
              >
                <ChevronLeft className="w-6 h-6 text-gray-600" />
              </button>
              <button
                onClick={() => setIsExpanded(true)}
                className="px-4 py-3 bg-pink-500 text-white rounded-full shadow-lg hover:bg-pink-600 transition-colors"
              >
                展开查看
              </button>
              <button
                onClick={goToNext}
                className="p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow"
              >
                <ChevronRight className="w-6 h-6 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* 展开视图 */
        <div>
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setIsExpanded(false)}
              className="p-2 text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {photos.map((photo, index) => (
              <DraggablePhoto
                key={photo.id}
                photo={photo}
                index={index}
                className="aspect-square rounded-xl overflow-hidden shadow-lg"
                onDragEnd={() => toast.success('照片已移动')}
              >
                <img
                  src={photo.mediumUrl || photo.thumbnailUrl}
                  alt={photo.filename}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  draggable={false}
                />
              </DraggablePhoto>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
