import Masonry from 'react-masonry-css'
import type { Photo } from '@/types'
import useStore from '@/stores/useStore'
import { toast } from '@/components/common/Toast'
import PhotoViewer from '@/components/photo/PhotoViewer'
import DraggablePhoto from './DraggablePhoto'

interface MasonryGridProps {
  photos: Photo[]
  selectionMode?: boolean
  selectedPhotos?: Set<string>
  onToggleSelection?: (photoId: string) => void
}

const breakpointColumns = {
  default: 4,
  1100: 3,
  700: 2,
  500: 1,
}

export default function MasonryGrid({
  photos,
  selectionMode = false,
  selectedPhotos = new Set(),
  onToggleSelection,
}: MasonryGridProps) {
  const { showPhotoViewer } = useStore()

  return (
    <>
      <Masonry
        breakpointCols={breakpointColumns}
        className="flex -ml-4 w-auto"
        columnClassName="pl-4 bg-clip-padding"
      >
        {photos.map((photo, index) => (
          <DraggablePhoto
            key={photo.id}
            photo={photo}
            index={index}
            className="mb-4"
            selectionMode={selectionMode}
            selected={selectedPhotos.has(photo.id)}
            onToggleSelection={onToggleSelection}
            onDragEnd={() => toast.success('照片已移动')}
          >
            <div className="relative overflow-hidden rounded-xl shadow-lg">
              <img
                src={photo.mediumUrl || photo.thumbnailUrl}
                alt={photo.filename}
                loading="lazy"
                className="w-full h-auto object-cover"
                style={{ backgroundColor: photo.blurhash ? `#${photo.blurhash}` : '#fdf2f8' }}
                draggable={false}
              />
            </div>
          </DraggablePhoto>
        ))}
      </Masonry>

      {showPhotoViewer && <PhotoViewer />}
    </>
  )
}
