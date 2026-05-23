import { useRef } from 'react'
import useStore from '@/stores/useStore'
import type { Photo } from '@/types'
import PhotoViewer from '@/components/photo/PhotoViewer'
import DraggablePhoto from './DraggablePhoto'
import { toast } from '@/components/common/Toast'

interface FilmstripLayoutProps {
  photos: Photo[]
}

export default function FilmstripLayout({ photos }: FilmstripLayoutProps) {
  const { showPhotoViewer } = useStore()
  const scrollRef = useRef<HTMLDivElement>(null)

  return (
    <>
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
              <DraggablePhoto
                key={photo.id}
                photo={photo}
                index={index}
                className="flex-shrink-0 w-48 h-48 overflow-hidden rounded-lg shadow-lg"
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

        {/* 底部胶片孔 */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gray-900 flex items-center px-4 gap-4 z-10">
          {Array.from({ length: 50 }).map((_, i) => (
            <div key={i} className="w-4 h-4 rounded-sm bg-gray-700 flex-shrink-0" />
          ))}
        </div>
      </div>

      {showPhotoViewer && <PhotoViewer />}
    </>
  )
}
