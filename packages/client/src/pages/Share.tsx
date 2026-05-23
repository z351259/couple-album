import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lock, Heart } from 'lucide-react'
import { shareApi } from '@/services/api'
import type { Photo, Album } from '@/types'
import MasonryGrid from '@/components/gallery/MasonryGrid'

export default function Share() {
  const { token } = useParams<{ token: string }>()
  const [photos, setPhotos] = useState<Photo[]>([])
  const [album, setAlbum] = useState<Album | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [needPin, setNeedPin] = useState(false)
  const [pinCode, setPinCode] = useState('')

  const loadShare = async (pin?: string) => {
    if (!token) return
    setLoading(true)
    setError('')

    try {
      const res = await shareApi.getByToken(token, pin)
      if (res.success && res.data) {
        setPhotos(res.data.photos)
        setAlbum(res.data.album || null)
        setNeedPin(false)
      } else {
        if (res.error?.includes('PIN')) {
          setNeedPin(true)
        } else {
          setError(res.error || '链接无效或已过期')
        }
      }
    } catch (err: any) {
      if (err.message?.includes('PIN')) {
        setNeedPin(true)
      } else {
        setError(err.message || '加载失败')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadShare()
  }, [token])

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    loadShare(pinCode)
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

  if (needPin) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md text-center"
        >
          <Lock className="w-16 h-16 text-pink-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">需要访问密码</h1>
          <p className="text-gray-500 mb-6">请输入PIN码查看相册</p>

          <form onSubmit={handlePinSubmit} className="glass-effect rounded-2xl p-6">
            <input
              type="text"
              value={pinCode}
              onChange={(e) => setPinCode(e.target.value)}
              placeholder="请输入PIN码"
              className="w-full px-4 py-3 text-center text-2xl tracking-widest border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 mb-4"
              maxLength={6}
            />
            <button
              type="submit"
              className="w-full py-3 bg-pink-500 text-white rounded-xl hover:bg-pink-600 transition-colors"
            >
              查看相册
            </button>
          </form>
        </motion.div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <Heart className="w-16 h-16 text-pink-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">无法访问</h1>
          <p className="text-gray-500">{error}</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {album && (
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gradient">{album.name}</h1>
            {album.description && (
              <p className="text-gray-500 mt-2">{album.description}</p>
            )}
          </div>
        )}

        {photos.length > 0 ? (
          <MasonryGrid photos={photos} />
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">暂无照片</p>
          </div>
        )}
      </motion.div>
    </div>
  )
}
