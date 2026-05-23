import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Calendar } from 'lucide-react'
import useStore from '@/stores/useStore'
import type { Photo } from '@/types'
import PhotoViewer from '@/components/photo/PhotoViewer'
import DraggablePhoto from './DraggablePhoto'
import { toast } from '@/components/common/Toast'

interface TimelineLayoutProps {
  photos: Photo[]
}

export default function TimelineLayout({ photos }: TimelineLayoutProps) {
  const { showPhotoViewer } = useStore()

  const groupedPhotos = useMemo(() => {
    const groups: Record<string, Photo[]> = {}
    photos.forEach((photo) => {
      const date = photo.takenAt || photo.createdAt
      const dateKey = new Date(date).toLocaleDateString('zh-CN', {
        year: 'numeric', month: 'long', day: 'numeric',
      })
      if (!groups[dateKey]) groups[dateKey] = []
      groups[dateKey].push(photo)
    })
    return Object.entries(groups).sort((a, b) => {
      const dateA = new Date(a[1][0].takenAt || a[1][0].createdAt)
      const dateB = new Date(b[1][0].takenAt || b[1][0].createdAt)
      return dateB.getTime() - dateA.getTime()
    })
  }, [photos])

  return (
    <>
      <div className="relative">
        <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-pink-200 transform -translate-x-1/2" />

        {groupedPhotos.map(([dateKey, datePhotos], groupIndex) => (
          <div key={dateKey} className="relative mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: groupIndex * 0.1 }}
              className="flex items-center gap-2 mb-6"
            >
              <div className="relative z-10 flex items-center gap-2 px-4 py-2 bg-pink-500 text-white rounded-full">
                <Calendar className="w-4 h-4" />
                <span className="font-medium">{dateKey}</span>
              </div>
              <span className="text-sm text-gray-500">{datePhotos.length} 张照片</span>
            </motion.div>

            <div className="ml-12 md:ml-0 grid grid-cols-2 sm:grid-cols-3 gap-4">
              {datePhotos.map((photo, index) => (
                <DraggablePhoto
                  key={photo.id}
                  photo={photo}
                  index={index}
                  className="aspect-square overflow-hidden rounded-xl shadow-md"
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
        ))}
      </div>

      {showPhotoViewer && <PhotoViewer />}
    </>
  )
}
