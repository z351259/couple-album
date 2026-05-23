import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Heart, MessageCircle, MapPin, Calendar, Eye, Edit3, BookOpen
} from 'lucide-react'
import type { Photo } from '@/types'
import useStore from '@/stores/useStore'
import { photoApi, favoriteApi, commentApi } from '@/services/api'
import { toast } from '@/components/common/Toast'
import DualMoodSelector from './DualMoodSelector'
import SecretMessage from './SecretMessage'

interface PhotoDetailProps {
  photo: Photo
  isOpen: boolean
  onClose: () => void
}

interface Visit {
  id: string
  userId: string
  viewedAt: string
  user: {
    id: string
    nickname: string
    avatar?: string
  }
}

interface Comment {
  id: string
  content: string
  userId: string
  user?: {
    id: string
    nickname: string
    avatar?: string
  }
  createdAt: string
}

export default function PhotoDetail({ photo, isOpen, onClose }: PhotoDetailProps) {
  const { user } = useStore()
  const [isFavorited, setIsFavorited] = useState(false)
  const [visits, setVisits] = useState<Visit[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [showMoodSelector, setShowMoodSelector] = useState(false)
  const [showSecretMessage, setShowSecretMessage] = useState(false)
  const [isFlipped, setIsFlipped] = useState(false)
  const [loading, setLoading] = useState(false)

  // 加载数据
  useEffect(() => {
    if (!isOpen) return

    const loadData = async () => {
      try {
        // 记录访问
        await photoApi.recordVisit(photo.id)

        // 并行加载数据
        const [favRes, visitsRes, commentsRes] = await Promise.all([
          favoriteApi.check(photo.id),
          photoApi.getVisits(photo.id),
          commentApi.getByPhoto(photo.id),
        ])

        if (favRes.success && favRes.data) {
          setIsFavorited(favRes.data.isFavorited)
        }
        if (visitsRes.success && visitsRes.data) {
          setVisits(visitsRes.data)
        }
        if (commentsRes.success && commentsRes.data) {
          setComments(commentsRes.data)
        }
      } catch (error) {
        console.error('加载数据失败:', error)
      }
    }

    loadData()
  }, [isOpen, photo.id])

  // 切换收藏
  const toggleFavorite = async () => {
    try {
      if (isFavorited) {
        await favoriteApi.remove(photo.id)
        setIsFavorited(false)
        toast.success('已取消收藏')
      } else {
        await favoriteApi.add(photo.id)
        setIsFavorited(true)
        toast.success('已收藏')
      }
    } catch (error) {
      toast.error('操作失败')
    }
  }

  // 保存心情
  const handleSaveMood = async (mood: string, mood2: string) => {
    try {
      await photoApi.update(photo.id, { mood, mood2 })
      toast.success('心情已更新')
    } catch (error) {
      toast.error('更新失败')
    }
  }

  // 保存悄悄话
  const handleSaveSecretMessage = async (message: string) => {
    try {
      await photoApi.update(photo.id, { secretMessage: message })
      toast.success('悄悄话已保存')
    } catch (error) {
      toast.error('保存失败')
    }
  }

  // 发送评论
  const handleSendComment = async () => {
    if (!newComment.trim()) return

    setLoading(true)
    try {
      const res = await commentApi.create({
        content: newComment,
        photoId: photo.id,
      })

      if (res.success && res.data) {
        setComments((prev) => [...prev, { ...res.data!, user }])
        setNewComment('')
        toast.success('评论成功')
      }
    } catch (error) {
      toast.error('评论失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-5xl max-h-[90vh] mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden flex"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 左侧 - 照片 */}
            <div className="relative flex-1 bg-black">
              {/* 3D翻转容器 */}
              <div className="relative w-full h-full" style={{ perspective: '1000px' }}>
                <motion.div
                  className="w-full h-full relative"
                  style={{ transformStyle: 'preserve-3d' }}
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                  transition={{ duration: 0.6, type: 'spring', stiffness: 300, damping: 30 }}
                >
                  {/* 正面 - 照片 */}
                  <div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ backfaceVisibility: 'hidden' }}
                  >
                    <img
                      src={photo.largeUrl || photo.originalUrl}
                      alt={photo.filename}
                      className="max-w-full max-h-full object-contain"
                    />

                    {/* 双人心情显示 */}
                    {(photo.mood || photo.mood2) && (
                      <div className="absolute bottom-4 left-4 flex items-center gap-2">
                        {photo.mood && (
                          <div className="flex items-center gap-1 px-3 py-1.5 bg-black/50 backdrop-blur-sm rounded-full">
                            <span className="text-xs text-white/70">我</span>
                            <span className="text-2xl">{photo.mood}</span>
                          </div>
                        )}
                        {photo.mood2 && (
                          <div className="flex items-center gap-1 px-3 py-1.5 bg-black/50 backdrop-blur-sm rounded-full">
                            <span className="text-xs text-white/70">TA</span>
                            <span className="text-2xl">{photo.mood2}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* 悄悄话入口 */}
                    {photo.secretMessage && (
                      <button
                        onClick={() => setIsFlipped(true)}
                        className="absolute top-4 right-4 p-2 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-black/70 transition-colors"
                        title="查看悄悄话"
                      >
                        <BookOpen className="w-5 h-5" />
                      </button>
                    )}
                  </div>

                  {/* 背面 - 悄悄话 */}
                  <div
                    className="absolute inset-0 bg-gradient-to-br from-pink-100 to-rose-100 flex flex-col items-center justify-center p-8"
                    style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                  >
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="mb-6"
                    >
                      <Heart className="w-20 h-20 text-red-400 fill-red-400" />
                    </motion.div>

                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 max-w-md">
                      <p className="text-gray-700 text-center text-xl leading-relaxed">
                        {photo.secretMessage}
                      </p>
                    </div>

                    <button
                      onClick={() => setIsFlipped(false)}
                      className="mt-8 px-6 py-2 bg-white rounded-full text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      返回照片
                    </button>
                  </div>
                </motion.div>
              </div>

              {/* 关闭按钮 */}
              <button
                onClick={onClose}
                className="absolute top-4 left-4 p-2 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-black/70 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* 操作按钮 */}
              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  onClick={toggleFavorite}
                  className={`p-2 backdrop-blur-sm rounded-full transition-colors ${
                    isFavorited
                      ? 'bg-pink-500 text-white'
                      : 'bg-black/50 text-white hover:bg-black/70'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isFavorited ? 'fill-white' : ''}`} />
                </button>
                <button
                  onClick={() => setShowMoodSelector(true)}
                  className="p-2 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-black/70 transition-colors"
                  title="设置心情"
                >
                  <span className="text-lg">{photo.mood || '😊'}</span>
                </button>
                <button
                  onClick={() => setShowSecretMessage(true)}
                  className="p-2 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-black/70 transition-colors"
                  title="写悄悄话"
                >
                  <BookOpen className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* 右侧 - 信息面板 */}
            <div className="w-96 flex flex-col bg-gray-50">
              {/* 照片信息 */}
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold text-gray-800 mb-2">
                  {photo.takenAt
                    ? new Date(photo.takenAt).toLocaleDateString('zh-CN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : photo.filename}
                </h2>

                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                  {photo.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {photo.location}
                    </span>
                  )}
                  {photo.takenAt && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(photo.takenAt).toLocaleTimeString('zh-CN')}
                    </span>
                  )}
                </div>

                {/* 标签 */}
                {photo.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {photo.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-pink-100 text-pink-600 rounded-full text-sm"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* 访问记录 */}
              <div className="px-6 py-3 border-b">
                <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  谁看过这张照片
                </h3>
                <div className="flex flex-wrap gap-2">
                  {visits.length > 0 ? (
                    visits.map((visit) => (
                      <div
                        key={visit.id}
                        className="flex items-center gap-1 px-2 py-1 bg-white rounded-full text-xs"
                      >
                        <div className="w-5 h-5 bg-pink-200 rounded-full flex items-center justify-center">
                          {visit.user.avatar ? (
                            <img
                              src={visit.user.avatar}
                              alt=""
                              className="w-full h-full rounded-full"
                            />
                          ) : (
                            <span className="text-pink-600 text-xs">
                              {visit.user.nickname[0]}
                            </span>
                          )}
                        </div>
                        <span className="text-gray-600">{visit.user.nickname}</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-gray-400 text-xs">暂无访问记录</span>
                  )}
                </div>
              </div>

              {/* 评论区 */}
              <div className="flex-1 overflow-y-auto p-6">
                <h3 className="text-sm font-medium text-gray-500 mb-4 flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  留言 ({comments.length})
                </h3>

                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <div className="w-8 h-8 bg-pink-200 rounded-full flex items-center justify-center flex-shrink-0">
                        {comment.user?.avatar ? (
                          <img
                            src={comment.user.avatar}
                            alt=""
                            className="w-full h-full rounded-full"
                          />
                        ) : (
                          <span className="text-pink-600 text-sm">
                            {comment.user?.nickname?.[0] || '?'}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-800 text-sm">
                            {comment.user?.nickname || '匿名'}
                          </span>
                          <span className="text-gray-400 text-xs">
                            {new Date(comment.createdAt).toLocaleDateString('zh-CN')}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm">{comment.content}</p>
                      </div>
                    </div>
                  ))}

                  {comments.length === 0 && (
                    <p className="text-gray-400 text-center text-sm">
                      还没有留言，来说点什么吧~
                    </p>
                  )}
                </div>
              </div>

              {/* 评论输入 */}
              <div className="p-4 border-t bg-white">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="写下你的留言..."
                    className="flex-1 px-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-300"
                    onKeyDown={(e) => e.key === 'Enter' && handleSendComment()}
                  />
                  <button
                    onClick={handleSendComment}
                    disabled={!newComment.trim() || loading}
                    className="px-4 py-2 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition-colors disabled:opacity-50"
                  >
                    发送
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* 心情选择器 */}
          <DualMoodSelector
            isOpen={showMoodSelector}
            onClose={() => setShowMoodSelector(false)}
            currentMood={photo.mood}
            currentMood2={photo.mood2}
            onSave={handleSaveMood}
          />

          {/* 悄悄话编辑器 */}
          <SecretMessage
            isOpen={showSecretMessage}
            onClose={() => setShowSecretMessage(false)}
            currentMessage={photo.secretMessage}
            onSave={handleSaveSecretMessage}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
