import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, MessageCircle, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react'
import type { Photo } from '@/types'
import useStore from '@/stores/useStore'
import { favoriteApi } from '@/services/api'
import { toast } from '@/components/common/Toast'

interface FreeCanvasProps {
  photos: Photo[]
}

interface PhotoPosition {
  x: number
  y: number
  scale: number
  rotation: number
  zIndex: number
}

export default function FreeCanvas({ photos }: FreeCanvasProps) {
  const { setCurrentPhoto, setShowPhotoViewer } = useStore()
  const containerRef = useRef<HTMLDivElement>(null)
  const [positions, setPositions] = useState<Record<string, PhotoPosition>>({})
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [favoritedIds, setFavoritedIds] = useState<Set<string>>(new Set())
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [isPanning, setIsPanning] = useState(false)
  const panStart = useRef({ x: 0, y: 0 })
  const maxZIndex = useRef(1)

  // 初始化照片位置
  useEffect(() => {
    const newPositions: Record<string, PhotoPosition> = {}
    photos.forEach((photo, index) => {
      const col = index % 4
      const row = Math.floor(index / 4)
      newPositions[photo.id] = {
        x: col * 280 + (Math.random() * 40 - 20),
        y: row * 280 + (Math.random() * 40 - 20),
        scale: 1,
        rotation: Math.random() * 10 - 5,
        zIndex: index,
      }
    })
    setPositions(newPositions)
  }, [photos])

  // 加载收藏状态
  useEffect(() => {
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
  }, [])

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

  const bringToFront = useCallback((photoId: string) => {
    maxZIndex.current += 1
    setPositions((prev) => ({
      ...prev,
      [photoId]: { ...prev[photoId], zIndex: maxZIndex.current },
    }))
  }, [])

  const handleDragEnd = useCallback((photoId: string, info: { point: { x: number; y: number } }) => {
    setDraggingId(null)
    bringToFront(photoId)
  }, [bringToFront])

  const handleCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === containerRef.current || (e.target as HTMLElement).classList.contains('canvas-bg')) {
      setIsPanning(true)
      panStart.current = {
        x: e.clientX - canvasOffset.x,
        y: e.clientY - canvasOffset.y,
      }
    }
  }, [canvasOffset])

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning) {
      setCanvasOffset({
        x: e.clientX - panStart.current.x,
        y: e.clientY - panStart.current.y,
      })
    }
  }, [isPanning])

  const handleCanvasMouseUp = useCallback(() => {
    setIsPanning(false)
  }, [])

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.1 : 0.1
    setZoom((prev) => Math.max(0.3, Math.min(3, prev + delta)))
  }, [])

  const resetView = useCallback(() => {
    setZoom(1)
    setCanvasOffset({ x: 0, y: 0 })
  }, [])

  return (
    <div className="relative w-full h-[calc(100vh-200px)] overflow-hidden bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl">
      {/* 控制栏 */}
      <div className="absolute top-4 right-4 z-50 flex gap-2">
        <button
          onClick={() => setZoom((z) => Math.min(3, z + 0.2))}
          className="p-2 bg-white/80 backdrop-blur-sm rounded-lg shadow hover:bg-white transition-colors"
        >
          <ZoomIn className="w-5 h-5" />
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(0.3, z - 0.2))}
          className="p-2 bg-white/80 backdrop-blur-sm rounded-lg shadow hover:bg-white transition-colors"
        >
          <ZoomOut className="w-5 h-5" />
        </button>
        <button
          onClick={resetView}
          className="p-2 bg-white/80 backdrop-blur-sm rounded-lg shadow hover:bg-white transition-colors"
        >
          <Maximize2 className="w-5 h-5" />
        </button>
        <span className="px-3 py-2 bg-white/80 backdrop-blur-sm rounded-lg text-sm font-medium">
          {Math.round(zoom * 100)}%
        </span>
      </div>

      {/* 画布 */}
      <div
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onMouseLeave={handleCanvasMouseUp}
        onWheel={handleWheel}
      >
        <div
          className="canvas-bg relative w-full h-full"
          style={{
            transform: `translate(${canvasOffset.x}px, ${canvasOffset.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
          }}
        >
          {photos.map((photo) => {
            const pos = positions[photo.id]
            if (!pos) return null

            return (
              <motion.div
                key={photo.id}
                className="absolute cursor-pointer group"
                style={{
                  left: pos.x,
                  top: pos.y,
                  zIndex: pos.zIndex,
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: 1,
                  scale: pos.scale,
                  rotate: draggingId === photo.id ? 0 : pos.rotation,
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                drag
                dragMomentum={false}
                onDragStart={() => setDraggingId(photo.id)}
                onDragEnd={(_, info) => handleDragEnd(photo.id, info)}
                onMouseEnter={() => setHoveredId(photo.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => {
                  setCurrentPhoto(photo)
                  setShowPhotoViewer(true)
                }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="relative w-[220px] bg-white rounded-lg shadow-xl overflow-hidden transform transition-shadow duration-300 group-hover:shadow-2xl">
                  {/* 照片 */}
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={photo.mediumUrl || photo.thumbnailUrl}
                      alt={photo.filename}
                      className="w-full h-full object-cover"
                      draggable={false}
                    />
                    {/* 悬停遮罩 */}
                    <AnimatePresence>
                      {hoveredId === photo.id && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"
                        >
                          <div className="absolute bottom-2 left-2 right-2 flex justify-between items-end">
                            <div className="flex gap-1">
                              {photo.mood && (
                                <span className="text-lg">{photo.mood}</span>
                              )}
                            </div>
                            <div className="flex gap-1">
                              <button
                                onClick={(e) => handleToggleFavorite(e, photo.id)}
                                className={`p-1.5 rounded-full transition-colors ${
                                  favoritedIds.has(photo.id)
                                    ? 'bg-pink-500 text-white'
                                    : 'bg-white/30 text-white hover:bg-white/50'
                                }`}
                              >
                                <Heart
                                  className={`w-3.5 h-3.5 ${
                                    favoritedIds.has(photo.id) ? 'fill-white' : ''
                                  }`}
                                />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setCurrentPhoto(photo)
                                  setShowPhotoViewer(true)
                                }}
                                className="p-1.5 bg-white/30 rounded-full text-white hover:bg-white/50 transition-colors"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* 照片信息 */}
                  <div className="p-2">
                    <p className="text-xs text-gray-500 truncate">
                      {photo.takenAt
                        ? new Date(photo.takenAt).toLocaleDateString('zh-CN')
                        : photo.filename}
                    </p>
                    {photo.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {photo.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="px-1.5 py-0.5 bg-pink-50 text-pink-600 rounded text-[10px]"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* 提示 */}
      <div className="absolute bottom-4 left-4 text-sm text-gray-400">
        拖拽照片可移动 | 滚轮缩放 | 拖拽空白处平移画布
      </div>
    </div>
  )
}
