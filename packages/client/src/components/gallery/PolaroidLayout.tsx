import { useMemo } from 'react'
import useStore from '@/stores/useStore'
import type { Photo } from '@/types'
import PhotoViewer from '@/components/photo/PhotoViewer'
import DraggablePhoto from './DraggablePhoto'
import { toast } from '@/components/common/Toast'

interface PolaroidLayoutProps {
  photos: Photo[]
}

export default function PolaroidLayout({ photos }: PolaroidLayoutProps) {
  const { showPhotoViewer } = useStore()

  const photosWithRotation = useMemo(() => {
    return photos.map((photo) => ({
      ...photo,
      rotation: Math.random() * 12 - 6,
    }))
  }, [photos])

  return (
    <>
      <div className="flex flex-wrap justify-center gap-8 p-8">
        {photosWithRotation.map((photo, index) => (
          <DraggablePhoto
            key={photo.id}
            photo={photo}
            index={index}
            className="relative"
            style={{ transform: `rotate(${photo.rotation}deg)` }}
            onDragEnd={() => toast.success('照片已移动')}
          >
            <div className="bg-white p-3 pb-12 shadow-lg rounded-sm">
              <div className="relative w-48 h-48 overflow-hidden">
                <img
                  src={photo.mediumUrl || photo.thumbnailUrl}
                  alt={photo.filename}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  draggable={false}
                />
              </div>
              <div className="absolute bottom-2 left-3 right-3">
                {photo.mood && <span className="text-2xl">{photo.mood}</span>}
                <p className="text-xs text-gray-500 mt-1 truncate">
                  {photo.takenAt ? new Date(photo.takenAt).toLocaleDateString('zh-CN') : ''}
                </p>
              </div>
            </div>
            <div className="absolute inset-0 bg-black/5 rounded-sm -z-10 translate-x-1 translate-y-1" />
          </DraggablePhoto>
        ))}
      </div>

      {showPhotoViewer && <PhotoViewer />}
    </>
  )
}
