import { useMemo } from 'react'
import useStore from '@/stores/useStore'
import type { Photo } from '@/types'
import PhotoViewer from '@/components/photo/PhotoViewer'
import DraggablePhoto from './DraggablePhoto'
import { toast } from '@/components/common/Toast'

interface CollageLayoutProps {
  photos: Photo[]
}

export default function CollageLayout({ photos }: CollageLayoutProps) {
  const { showPhotoViewer } = useStore()

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

  return (
    <>
      <div className="relative w-full" style={{ height: '80vh', minHeight: '600px' }}>
        {collageItems.map(({ photo, size, x, y, rotation, zIndex, index }) => (
          <DraggablePhoto
            key={photo.id}
            photo={photo}
            index={index}
            className="absolute shadow-xl"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              width: `${size}px`,
              height: `${size}px`,
              zIndex,
              transform: `rotate(${rotation}deg)`,
            }}
            onDragEnd={() => toast.success('照片已移动')}
          >
            <div className="w-full h-full overflow-hidden rounded-lg border-4 border-white shadow-lg">
              <img
                src={photo.mediumUrl || photo.thumbnailUrl}
                alt={photo.filename}
                className="w-full h-full object-cover"
                loading="lazy"
                draggable={false}
              />
            </div>
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
              <div className="w-4 h-4 bg-red-500 rounded-full shadow-md" />
            </div>
          </DraggablePhoto>
        ))}
      </div>

      {showPhotoViewer && <PhotoViewer />}
    </>
  )
}
