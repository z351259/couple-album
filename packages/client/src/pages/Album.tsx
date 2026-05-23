import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Edit, Trash2, Share2, Plus } from 'lucide-react'
import useStore from '@/stores/useStore'
import { albumApi, photoApi } from '@/services/api'
import { toast } from '@/components/common/Toast'
import MasonryGrid from '@/components/gallery/MasonryGrid'

export default function Album() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isAuthenticated, currentAlbum, setCurrentAlbum, photos, setPhotos } = useStore()
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    const loadAlbum = async () => {
      if (!id) return
      try {
        const [albumRes, photosRes] = await Promise.all([
          albumApi.getById(id),
          photoApi.getAll({ albumId: id, limit: 100 }),
        ])

        if (albumRes.success && albumRes.data) {
          setCurrentAlbum(albumRes.data)
          setName(albumRes.data.name)
          setDescription(albumRes.data.description || '')
        }
        if (photosRes.success && photosRes.data) {
          setPhotos(photosRes.data.items)
        }
      } catch (error) {
        console.error('加载相册失败:', error)
        toast.error('加载相册失败')
      } finally {
        setLoading(false)
      }
    }

    if (isAuthenticated) {
      loadAlbum()
    }
  }, [id, isAuthenticated, setCurrentAlbum, setPhotos])

  const handleSave = async () => {
    if (!id || !name.trim()) return
    try {
      const res = await albumApi.update(id, { name, description })
      if (res.success && res.data) {
        setCurrentAlbum(res.data)
        setEditing(false)
        toast.success('相册更新成功')
      }
    } catch (error) {
      console.error('更新相册失败:', error)
      toast.error('更新相册失败')
    }
  }

  const handleDelete = async () => {
    if (!id || !confirm('确定要删除这个相册吗？')) return
    try {
      await albumApi.delete(id)
      toast.success('相册已删除')
      navigate('/')
    } catch (error) {
      console.error('删除相册失败:', error)
      toast.error('删除相册失败')
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <p className="text-gray-500">请先登录</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-pink-200 border-t-pink-500 rounded-full"
        />
      </div>
    )
  }

  if (!currentAlbum) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <p className="text-gray-500">相册不存在</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* 返回按钮 */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-pink-500 transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          返回首页
        </Link>

        {/* 相册信息 */}
        <div className="glass-effect rounded-2xl p-6 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {editing ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="text-2xl font-bold w-full px-3 py-2 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="相册名称"
                  />
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="相册描述（可选）"
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
                    >
                      保存
                    </button>
                    <button
                      onClick={() => setEditing(false)}
                      className="px-4 py-2 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      取消
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="text-3xl font-bold text-gray-800">{currentAlbum.name}</h1>
                  {currentAlbum.description && (
                    <p className="text-gray-500 mt-2">{currentAlbum.description}</p>
                  )}
                  <p className="text-sm text-gray-400 mt-2">
                    {photos.length} 张照片
                  </p>
                </>
              )}
            </div>

            {!editing && (
              <div className="flex gap-2">
                <button
                  onClick={() => setEditing(true)}
                  className="p-2 text-gray-400 hover:text-pink-500 transition-colors"
                  title="编辑"
                >
                  <Edit className="w-5 h-5" />
                </button>
                <button
                  onClick={handleDelete}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  title="删除"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                <button
                  className="p-2 text-gray-400 hover:text-pink-500 transition-colors"
                  title="分享"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 上传按钮 */}
        <div className="mb-6">
          <Link
            to="/upload"
            className="inline-flex items-center gap-2 px-6 py-3 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
            添加照片
          </Link>
        </div>

        {/* 照片网格 */}
        {photos.length > 0 ? (
          <MasonryGrid photos={photos} />
        ) : (
          <div className="text-center py-12 glass-effect rounded-2xl">
            <p className="text-gray-500">相册里还没有照片</p>
            <Link
              to="/upload"
              className="inline-block mt-4 px-6 py-2 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition-colors"
            >
              上传照片
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  )
}
