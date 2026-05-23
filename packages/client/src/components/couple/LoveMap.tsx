import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, MapPin, Heart, Calendar } from 'lucide-react'
import type { Photo } from '@/types'

interface LoveMapProps {
  isOpen: boolean
  onClose: () => void
  photos: Photo[]
}

export default function LoveMap({ isOpen, onClose, photos }: LoveMapProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)

  // 获取有位置信息的照片
  const photosWithLocation = useMemo(() => {
    return photos.filter((p) => p.latitude && p.longitude)
  }, [photos])

  // 按位置分组
  const locationGroups = useMemo(() => {
    const groups: Record<string, Photo[]> = {}
    photosWithLocation.forEach((photo) => {
      const key = photo.location || `${photo.latitude?.toFixed(2)}, ${photo.longitude?.toFixed(2)}`
      if (!groups[key]) groups[key] = []
      groups[key].push(photo)
    })
    return Object.entries(groups)
  }, [photosWithLocation])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-pink-500" />
                爱情地图
              </h3>
              <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {photosWithLocation.length === 0 ? (
              <div className="text-center py-12">
                <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">还没有带位置信息的照片</p>
                <p className="text-sm text-gray-400 mt-2">
                  上传照片时添加位置信息，就能在地图上看到你们一起去过的地方
                </p>
              </div>
            ) : (
              <>
                {/* 地图占位 - 可以集成真正的地图库 */}
                <div className="relative w-full h-96 bg-gradient-to-br from-green-100 to-blue-100 rounded-xl mb-6 overflow-hidden">
                  {/* 简单的点位展示 */}
                  {locationGroups.map(([location, locPhotos], index) => {
                    // 简单的位置计算（实际应该用地图库）
                    const x = 10 + (index % 5) * 18
                    const y = 15 + Math.floor(index / 5) * 25

                    return (
                      <motion.div
                        key={location}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="absolute cursor-pointer"
                        style={{ left: `${x}%`, top: `${y}%` }}
                        onClick={() => setSelectedPhoto(locPhotos[0])}
                      >
                        <div className="relative">
                          <MapPin className="w-8 h-8 text-pink-500 fill-pink-500" />
                          <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                            {locPhotos.length}
                          </span>
                        </div>
                      </motion.div>
                    )
                  })}

                  {/* 装饰 */}
                  <div className="absolute bottom-4 right-4 text-4xl">💕</div>
                </div>

                {/* 位置列表 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {locationGroups.map(([location, locPhotos]) => (
                    <motion.div
                      key={location}
                      whileHover={{ scale: 1.02 }}
                      className="p-4 bg-gray-50 rounded-xl cursor-pointer"
                      onClick={() => setSelectedPhoto(locPhotos[0])}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-4 h-4 text-pink-500" />
                        <span className="font-medium text-gray-800 truncate">{location}</span>
                      </div>
                      <div className="flex gap-1">
                        {locPhotos.slice(0, 4).map((photo) => (
                          <div key={photo.id} className="w-12 h-12 rounded-lg overflow-hidden">
                            <img
                              src={photo.thumbnailUrl}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                        {locPhotos.length > 4 && (
                          <div className="w-12 h-12 rounded-lg bg-pink-100 flex items-center justify-center text-pink-500 text-sm">
                            +{locPhotos.length - 4}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </>
            )}

            {/* 选中照片详情 */}
            <AnimatePresence>
              {selectedPhoto && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="mt-4 p-4 bg-pink-50 rounded-xl"
                >
                  <div className="flex gap-4">
                    <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={selectedPhoto.mediumUrl || selectedPhoto.thumbnailUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{selectedPhoto.location}</p>
                      {selectedPhoto.takenAt && (
                        <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(selectedPhoto.takenAt).toLocaleDateString('zh-CN')}</span>
                        </div>
                      )}
                      {selectedPhoto.mood && (
                        <span className="text-2xl mt-2 inline-block">{selectedPhoto.mood}</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
