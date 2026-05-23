import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, FolderInput, Tag, Heart, X, Check, Loader2 } from 'lucide-react'
import type { Photo, Album } from '@/types'
import { photoApi, albumApi, favoriteApi } from '@/services/api'
import { toast } from '@/components/common/Toast'

interface BatchOperationsProps {
  selectedPhotos: Photo[]
  albums: Album[]
  onClearSelection: () => void
  onComplete: () => void
}

type Operation = 'delete' | 'move' | 'tag' | 'favorite'

export default function BatchOperations({
  selectedPhotos,
  albums,
  onClearSelection,
  onComplete,
}: BatchOperationsProps) {
  const [operation, setOperation] = useState<Operation | null>(null)
  const [targetAlbum, setTargetAlbum] = useState<string>('')
  const [newTag, setNewTag] = useState('')
  const [loading, setLoading] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    try {
      const results = await Promise.allSettled(
        selectedPhotos.map((photo) => photoApi.delete(photo.id))
      )

      const succeeded = results.filter((r) => r.status === 'fulfilled').length
      const failed = results.filter((r) => r.status === 'rejected').length

      if (succeeded > 0) {
        toast.success(`成功删除 ${succeeded} 张照片`)
      }
      if (failed > 0) {
        toast.error(`${failed} 张照片删除失败`)
      }

      onComplete()
    } catch (error) {
      toast.error('删除失败')
    } finally {
      setLoading(false)
      setConfirmDelete(false)
    }
  }

  const handleMove = async () => {
    if (!targetAlbum) {
      toast.error('请选择目标相册')
      return
    }

    setLoading(true)
    try {
      const results = await Promise.allSettled(
        selectedPhotos.map((photo) =>
          photoApi.update(photo.id, { albumId: targetAlbum || null })
        )
      )

      const succeeded = results.filter((r) => r.status === 'fulfilled').length
      const failed = results.filter((r) => r.status === 'rejected').length

      if (succeeded > 0) {
        toast.success(`成功移动 ${succeeded} 张照片`)
      }
      if (failed > 0) {
        toast.error(`${failed} 张照片移动失败`)
      }

      onComplete()
    } catch (error) {
      toast.error('移动失败')
    } finally {
      setLoading(false)
    }
  }

  const handleAddTag = async () => {
    if (!newTag.trim()) {
      toast.error('请输入标签')
      return
    }

    setLoading(true)
    try {
      const results = await Promise.allSettled(
        selectedPhotos.map((photo) => {
          const existingTags = photo.tags || []
          const updatedTags = [...new Set([...existingTags, newTag.trim()])]
          return photoApi.update(photo.id, { tags: updatedTags })
        })
      )

      const succeeded = results.filter((r) => r.status === 'fulfilled').length
      const failed = results.filter((r) => r.status === 'rejected').length

      if (succeeded > 0) {
        toast.success(`成功为 ${succeeded} 张照片添加标签`)
      }
      if (failed > 0) {
        toast.error(`${failed} 张照片添加标签失败`)
      }

      onComplete()
    } catch (error) {
      toast.error('添加标签失败')
    } finally {
      setLoading(false)
    }
  }

  const handleFavorite = async () => {
    setLoading(true)
    try {
      const results = await Promise.allSettled(
        selectedPhotos.map((photo) => favoriteApi.add(photo.id))
      )

      const succeeded = results.filter((r) => r.status === 'fulfilled').length
      const failed = results.filter((r) => r.status === 'rejected').length

      if (succeeded > 0) {
        toast.success(`成功收藏 ${succeeded} 张照片`)
      }
      if (failed > 0) {
        toast.error(`${failed} 张照片收藏失败`)
      }

      onComplete()
    } catch (error) {
      toast.error('收藏失败')
    } finally {
      setLoading(false)
    }
  }

  const operations = [
    { id: 'delete' as Operation, icon: Trash2, label: '删除', color: 'text-red-500 hover:bg-red-50' },
    { id: 'move' as Operation, icon: FolderInput, label: '移动到相册', color: 'text-blue-500 hover:bg-blue-50' },
    { id: 'tag' as Operation, icon: Tag, label: '添加标签', color: 'text-green-500 hover:bg-green-50' },
    { id: 'favorite' as Operation, icon: Heart, label: '批量收藏', color: 'text-pink-500 hover:bg-pink-50' },
  ]

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t shadow-2xl"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* 已选择数量 */}
          <div className="flex items-center gap-4">
            <button
              onClick={onClearSelection}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <span className="font-medium text-gray-800">
              已选择 {selectedPhotos.length} 张照片
            </span>
          </div>

          {/* 操作按钮 */}
          <div className="flex items-center gap-2">
            {operations.map((op) => (
              <button
                key={op.id}
                onClick={() => {
                  if (op.id === 'favorite') {
                    handleFavorite()
                  } else {
                    setOperation(operation === op.id ? null : op.id)
                  }
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${op.color} ${
                  operation === op.id ? 'bg-opacity-20' : ''
                }`}
              >
                <op.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{op.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 操作面板 */}
        <AnimatePresence>
          {operation && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-4 mt-4 border-t">
                {/* 删除确认 */}
                {operation === 'delete' && (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-red-600">确认删除</p>
                      <p className="text-sm text-gray-500">
                        此操作不可撤销，将永久删除选中的 {selectedPhotos.length} 张照片
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setOperation(null)}
                        className="px-4 py-2 text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        取消
                      </button>
                      <button
                        onClick={handleDelete}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                      >
                        {loading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                        确认删除
                      </button>
                    </div>
                  </div>
                )}

                {/* 移动到相册 */}
                {operation === 'move' && (
                  <div className="flex items-center gap-4">
                    <select
                      value={targetAlbum}
                      onChange={(e) => setTargetAlbum(e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">选择相册</option>
                      <option value="">无相册（取消分配）</option>
                      {albums.map((album) => (
                        <option key={album.id} value={album.id}>
                          {album.name}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={handleMove}
                      disabled={loading}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <FolderInput className="w-4 h-4" />
                      )}
                      移动
                    </button>
                  </div>
                )}

                {/* 添加标签 */}
                {operation === 'tag' && (
                  <div className="flex items-center gap-4">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="输入标签名称"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                    />
                    <button
                      onClick={handleAddTag}
                      disabled={loading || !newTag.trim()}
                      className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Tag className="w-4 h-4" />
                      )}
                      添加
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
