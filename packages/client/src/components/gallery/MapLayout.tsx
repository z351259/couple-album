import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Heart, MessageCircle, X } from 'lucide-react'
import type { Photo } from '@/types'
import useStore from '@/stores/useStore'
import { favoriteApi } from '@/services/api'
import { toast } from '@/components/common/Toast'

interface MapLayoutProps {
  photos: Photo[]
}

// 简单的坐标转像素位置（用于演示，实际项目可用 Leaflet/Mapbox）
function coordsToPosition(lat: number, lng: number, width: number, height: number) {
  // 简化的墨卡托投影
  const x = ((lng + 180) / 360) * width
  const latRad = (lat * Math.PI) / 180
  const mercN = Math.log(Math.tan(Math.PI / 4 + latRad / 2))
  const y = height / 2 - (mercN * height) / (2 * Math.PI)
  return { x: Math.max(20, Math.min(width - 20, x)), y: Math.max(20, Math.min(height - 20, y)) }
}

export default function MapLayout({ photos }: MapLayoutProps) {
  const { setCurrentPhoto, setShowPhotoViewer } = useStore()
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [favoritedIds, setFavoritedIds] = useState<Set<string>>(new Set())
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  // 有 GPS 数据的照片
  const photosWithLocation = useMemo(
    () => photos.filter((p) => p.latitude != null && p.longitude != null),
    [photos]
  )

  // 没有 GPS 数据的照片
  const photosWithoutLocation = useMemo(
    () => photos.filter((p) => p.latitude == null || p.longitude == null),
    [photos]
  )

  // 按位置分组照片
  const locationGroups = useMemo(() => {
    const groups: Record<string, Photo[]> = {}
    photosWithLocation.forEach((photo) => {
      // 将坐标四舍五入到小数点后1位，相近的照片归为一组
      const key = `${(photo.latitude!).toFixed(1)},${(photo.longitude!).toFixed(1)}`
      if (!groups[key]) groups[key] = []
      groups[key].push(photo)
    })
    return groups
  }, [photosWithLocation])

  // 加载收藏状态
  useState(() => {
    const loadFavorites = async () => {
      try {
        const res = await favoriteApi.getAll()
        if (res.success && res.data) {
          setFavoritedIds(new Set(res.data.map((p) => p.id)))
        }
      } catch (error) {
        console.error('加载收藏状态失败:', error)
      }
    }
    loadFavorites()
  })

  const handleToggleFavorite = async (e: React.MouseEvent, photoId: string) => {
    e.stopPropagation()
    try {
      if (favoritedIds.has(photoId)) {
        await favoriteApi.remove(photoId)
        setFavoritedIds((prev) => {
          const next = new Set(prev)
          next.delete(photoId)
          return next
        })
        toast.success('已取消收藏')
      } else {
        await favoriteApi.add(photoId)
        setFavoritedIds((prev) => new Set(prev).add(photoId))
        toast.success('已收藏')
      }
    } catch (error) {
      toast.error('操作失败')
    }
  }

  const mapWidth = 1200
  const mapHeight = 600

  return (
    <div className="space-y-6">
      {/* 地图区域 */}
      <div className="relative w-full h-[500px] bg-gradient-to-br from-blue-50 to-green-50 rounded-xl overflow-hidden shadow-lg">
        {/* 世界地图背景（简化版） */}
        <svg
          viewBox={`0 0 ${mapWidth} ${mapHeight}`}
          className="absolute inset-0 w-full h-full opacity-20"
        >
          <rect fill="#e5e7eb" width={mapWidth} height={mapHeight} />
          {/* 简化的大陆轮廓 */}
          <path
            d="M200,150 Q300,100 400,150 T600,200 T800,150 T1000,200"
            fill="none"
            stroke="#9ca3af"
            strokeWidth="2"
          />
          <path
            d="M150,300 Q250,250 350,300 T550,350 T750,300 T950,350"
            fill="none"
            stroke="#9ca3af"
            strokeWidth="2"
          />
        </svg>

        {/* 照片标记点 */}
        {Object.entries(locationGroups).map(([key, groupPhotos]) => {
          const [lat, lng] = key.split(',').map(Number)
          const pos = coordsToPosition(lat, lng, mapWidth, mapHeight)
          const firstPhoto = groupPhotos[0]
          const isHovered = groupPhotos.some((p) => hoveredId === p.id)

          return (
            <motion.div
              key={key}
              className="absolute cursor-pointer"
              style={{
                left: `${(pos.x / mapWidth) * 100}%`,
                top: `${(pos.y / mapHeight) * 100}%`,
                transform: 'translate(-50%, -50%)',
              }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              whileHover={{ scale: 1.2 }}
              onClick={() => setSelectedPhoto(firstPhoto)}
              onMouseEnter={() => setHoveredId(firstPhoto.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* 标记点 */}
              <div className="relative">
                <div
                  className={`w-10 h-10 rounded-full border-3 border-white shadow-lg overflow-hidden transition-all duration-300 ${
                    isHovered ? 'ring-4 ring-pink-400' : ''
                  }`}
                >
                  <img
                    src={firstPhoto.thumbnailUrl}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* 数量标记 */}
                {groupPhotos.length > 1 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-pink-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {groupPhotos.length}
                    </span>
                  </div>
                )}

                {/* 悬停提示 */}
                <AnimatePresence>
                  {isHovered && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-white rounded-lg shadow-xl whitespace-nowrap"
                    >
                      <p className="text-sm font-medium text-gray-800">
                        {firstPhoto.location || '未知地点'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {groupPhotos.length} 张照片
                      </p>
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-white rotate-45" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )
        })}

        {/* 空状态 */}
        {photosWithLocation.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <MapPin className="w-12 h-12 mx-auto mb-3" />
              <p className="text-lg font-medium">暂无位置信息</p>
              <p className="text-sm">上传带有 GPS 数据的照片后，它们会显示在地图上</p>
            </div>
          </div>
        )}
      </div>

      {/* 照片详情弹窗 */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setSelectedPhoto(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-lg w-full mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-4 right-4 z-10 p-2 bg-black/30 rounded-full text-white hover:bg-black/50 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="relative aspect-[4/3]">
                <img
                  src={selectedPhoto.largeUrl || selectedPhoto.originalUrl}
                  alt={selectedPhoto.filename}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">
                      {selectedPhoto.location || '未知地点'}
                    </h3>
                    {selectedPhoto.takenAt && (
                      <p className="text-gray-500 mt-1">
                        {new Date(selectedPhoto.takenAt).toLocaleDateString('zh-CN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    )}
                  </div>
                  {selectedPhoto.mood && (
                    <span className="text-3xl">{selectedPhoto.mood}</span>
                  )}
                </div>

                {selectedPhoto.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {selectedPhoto.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-pink-50 text-pink-600 rounded-full text-sm"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={(e) => handleToggleFavorite(e, selectedPhoto.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
                      favoritedIds.has(selectedPhoto.id)
                        ? 'bg-pink-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        favoritedIds.has(selectedPhoto.id) ? 'fill-white' : ''
                      }`}
                    />
                    {favoritedIds.has(selectedPhoto.id) ? '已收藏' : '收藏'}
                  </button>
                  <button
                    onClick={() => {
                      setCurrentPhoto(selectedPhoto)
                      setShowPhotoViewer(true)
                      setSelectedPhoto(null)
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-gray-700 hover:bg-gray-200 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    查看详情
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 无位置信息的照片列表 */}
      {photosWithoutLocation.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            无位置信息的照片 ({photosWithoutLocation.length})
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {photosWithoutLocation.map((photo) => (
              <motion.div
                key={photo.id}
                className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group"
                whileHover={{ scale: 1.05 }}
                onClick={() => {
                  setCurrentPhoto(photo)
                  setShowPhotoViewer(true)
                }}
              >
                <img
                  src={photo.thumbnailUrl}
                  alt={photo.filename}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors">
                  <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-1 text-white text-xs">
                      <MapPin className="w-3 h-3" />
                      <span>无位置</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
