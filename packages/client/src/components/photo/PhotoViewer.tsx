import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Heart, MessageCircle, Share2, Download, MapPin, Calendar, Tag } from 'lucide-react'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'
import useStore from '@/stores/useStore'
import { commentApi } from '@/services/api'
import { useState } from 'react'
import type { Comment } from '@/types'

export default function PhotoViewer() {
  const { currentPhoto, showPhotoViewer, setShowPhotoViewer, setCurrentPhoto } = useStore()
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [loadingComments, setLoadingComments] = useState(false)

  useEffect(() => {
    if (currentPhoto) {
      loadComments()
    }
  }, [currentPhoto])

  const loadComments = async () => {
    if (!currentPhoto) return
    setLoadingComments(true)
    try {
      const res = await commentApi.getByPhoto(currentPhoto.id)
      if (res.success && res.data) {
        setComments(res.data)
      }
    } catch (error) {
      console.error('加载评论失败:', error)
    } finally {
      setLoadingComments(false)
    }
  }

  const handleSubmitComment = async () => {
    if (!currentPhoto || !newComment.trim()) return
    try {
      const res = await commentApi.create({
        content: newComment,
        photoId: currentPhoto.id,
      })
      if (res.success && res.data) {
        setComments([...comments, res.data])
        setNewComment('')
      }
    } catch (error) {
      console.error('发送评论失败:', error)
    }
  }

  const handleClose = () => {
    setShowPhotoViewer(false)
    setCurrentPhoto(null)
  }

  if (!currentPhoto) return null

  return (
    <AnimatePresence>
      {showPhotoViewer && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={handleClose}
        >
          {/* 关闭按钮 */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white z-50"
          >
            <X className="w-8 h-8" />
          </button>

          <div
            className="flex flex-col lg:flex-row w-full h-full max-w-7xl mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 图片区域 */}
            <div className="flex-1 flex items-center justify-center p-4">
              <TransformWrapper
                initialScale={1}
                minScale={0.5}
                maxScale={5}
                wheel={{ step: 0.1 }}
                pinch={{ step: 5 }}
                doubleClick={{ mode: 'reset' }}
              >
                <TransformComponent>
                  <motion.img
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    src={currentPhoto.largeUrl || currentPhoto.originalUrl}
                    alt={currentPhoto.filename}
                    className="max-h-[80vh] max-w-full object-contain"
                    draggable={false}
                  />
                </TransformComponent>
              </TransformWrapper>
            </div>

            {/* 信息面板 */}
            <motion.div
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="w-full lg:w-96 bg-white/10 backdrop-blur-md p-6 overflow-y-auto"
            >
              {/* 照片信息 */}
              <div className="mb-6">
                <h3 className="text-white text-lg font-semibold mb-4">照片信息</h3>

                <div className="space-y-3 text-white/80 text-sm">
                  {currentPhoto.takenAt && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-pink-400" />
                      <span>{new Date(currentPhoto.takenAt).toLocaleString('zh-CN')}</span>
                    </div>
                  )}

                  {currentPhoto.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-pink-400" />
                      <span>{currentPhoto.location}</span>
                    </div>
                  )}

                  {currentPhoto.mood && (
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{currentPhoto.mood}</span>
                      <span>心情</span>
                    </div>
                  )}

                  {currentPhoto.tags.length > 0 && (
                    <div className="flex items-start gap-2">
                      <Tag className="w-4 h-4 text-pink-400 mt-0.5" />
                      <div className="flex flex-wrap gap-1">
                        {currentPhoto.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 bg-white/10 rounded-full text-xs"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="text-white/50 text-xs">
                    {currentPhoto.width} x {currentPhoto.height} •{' '}
                    {(currentPhoto.fileSize / 1024 / 1024).toFixed(2)} MB
                  </div>
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex gap-2 mb-6">
                <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors text-white">
                  <Heart className="w-4 h-4" />
                  <span>收藏</span>
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors text-white">
                  <Share2 className="w-4 h-4" />
                  <span>分享</span>
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors text-white">
                  <Download className="w-4 h-4" />
                  <span>下载</span>
                </button>
              </div>

              {/* 评论区 */}
              <div>
                <h3 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  留言
                </h3>

                <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                  {loadingComments ? (
                    <p className="text-white/50 text-sm">加载中...</p>
                  ) : comments.length > 0 ? (
                    comments.map((comment) => (
                      <div
                        key={comment.id}
                        className="bg-white/10 rounded-lg p-3"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white font-medium text-sm">
                            {comment.user?.nickname || '匿名'}
                          </span>
                          <span className="text-white/50 text-xs">
                            {new Date(comment.createdAt).toLocaleString('zh-CN')}
                          </span>
                        </div>
                        <p className="text-white/80 text-sm">{comment.content}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-white/50 text-sm">暂无留言，来说点什么吧~</p>
                  )}
                </div>

                {/* 发送评论 */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="写下你的留言..."
                    className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-pink-400"
                    onKeyPress={(e) => e.key === 'Enter' && handleSubmitComment()}
                  />
                  <button
                    onClick={handleSubmitComment}
                    className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
                  >
                    发送
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
