import type { Photo } from '@/types'
import useStore from '@/stores/useStore'
import PhotoViewer from '@/components/photo/PhotoViewer'
import DraggablePhoto from './DraggablePhoto'
import { toast } from '@/components/common/Toast'

interface GridLayoutProps {
  photos: Photo[]
}

export default function GridLayout({ photos }: GridLayoutProps) {
  const { showPhotoViewer } = useStore()

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {photos.map((photo, index) => (
          <DraggablePhoto
            key={photo.id}
            photo={photo}
            index={index}
            className="aspect-square overflow-hidden rounded-xl shadow-lg"
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

      {showPhotoViewer && <PhotoViewer />}
    </>
  )
}
