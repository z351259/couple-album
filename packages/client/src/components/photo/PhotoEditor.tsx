import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Save, MapPin, Heart, Tag, Calendar } from 'lucide-react'
import { photoApi } from '@/services/api'
import { toast } from '@/components/common/Toast'
import type { Photo } from '@/types'

interface PhotoEditorProps {
  isOpen: boolean
  onClose: () => void
  photo: Photo
  onSave: (updatedPhoto: Photo) => void
}

const moods = [
  { value: 'happy', emoji: '😊', label: '开心' },
  { value: 'love', emoji: '❤️', label: '爱你' },
  { value: 'excited', emoji: '🎉', label: '兴奋' },
  { value: 'peaceful', emoji: '☮️', label: '平静' },
  { value: 'grateful', emoji: '🙏', label: '感恩' },
  { value: 'nostalgic', emoji: '🌅', label: '怀旧' },
  { value: 'adventurous', emoji: '🌍', label: '冒险' },
  { value: 'cozy', emoji: '☕', label: '温馨' },
  { value: 'playful', emoji: '😜', label: '调皮' },
  { value: 'romantic', emoji: '💕', label: '浪漫' },
]

export default function PhotoEditor({ isOpen, onClose, photo, onSave }: PhotoEditorProps) {
  const [mood, setMood] = useState(photo.mood || '')
  const [location, setLocation] = useState(photo.location || '')
  const [tags, setTags] = useState<string[]>(photo.tags || [])
  const [newTag, setNewTag] = useState('')
  const [saving, setSaving] = useState(false)

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag('')
    }
  }

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await photoApi.update(photo.id, {
        mood,
        location,
        tags,
      })

      if (res.success && res.data) {
        onSave(res.data)
        toast.success('照片信息已更新')
        onClose()
      }
    } catch (error) {
      console.error('保存失败:', error)
      toast.error('保存失败')
    } finally {
      setSaving(false)
    }
  }

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
            className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">编辑照片信息</h3>
              <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 照片预览 */}
            <div className="w-full h-48 rounded-xl overflow-hidden mb-4">
              <img
                src={photo.mediumUrl || photo.thumbnailUrl}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>

            {/* 心情选择 */}
            <div className="mb-4">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Heart className="w-4 h-4" />
                心情
              </label>
              <div className="flex flex-wrap gap-2">
                {moods.map((m) => (
                  <button
                    key={m.value}
                    onClick={() => setMood(mood === m.value ? '' : m.value)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition-colors ${
                      mood === m.value
                        ? 'bg-pink-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span>{m.emoji}</span>
                    <span>{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 位置 */}
            <div className="mb-4">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4" />
                拍摄地点
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="输入拍摄地点..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>

            {/* 标签 */}
            <div className="mb-6">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Tag className="w-4 h-4" />
                标签
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm"
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="text-pink-500 hover:text-pink-700"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                  placeholder="添加标签..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
                <button
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  添加
                </button>
              </div>
            </div>

            {/* 保存按钮 */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg hover:from-pink-600 hover:to-rose-600 transition-all disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {saving ? '保存中...' : '保存'}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
