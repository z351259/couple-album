import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Calendar, Map, Clock, Settings, X, Share2, Trophy, BookOpen, Gift, Brain, Check } from 'lucide-react'
import useStore from '@/stores/useStore'
import { photoApi, albumApi, authApi } from '@/services/api'
import { toast } from '@/components/common/Toast'
import MasonryGrid from '@/components/gallery/MasonryGrid'
import GridLayout from '@/components/gallery/GridLayout'
import TimelineLayout from '@/components/gallery/TimelineLayout'
import PolaroidLayout from '@/components/gallery/PolaroidLayout'
import FilmstripLayout from '@/components/gallery/FilmstripLayout'
import CollageLayout from '@/components/gallery/CollageLayout'
import HeartLayout from '@/components/gallery/HeartLayout'
import StoryLayout from '@/components/gallery/StoryLayout'
import StackLayout from '@/components/gallery/StackLayout'
import FreeCanvas from '@/components/gallery/FreeCanvas'
import Carousel3D from '@/components/gallery/Carousel3D'
import MapLayout from '@/components/gallery/MapLayout'
import LayoutSwitcher from '@/components/gallery/LayoutSwitcher'
import LoveCountdown from '@/components/couple/LoveCountdown'
import CoupleCalendar from '@/components/couple/CoupleCalendar'
import CoupleChallenges from '@/components/couple/CoupleChallenges'
import CoupleJournal from '@/components/couple/CoupleJournal'
import WishList from '@/components/couple/WishList'
import CoupleQuiz from '@/components/couple/CoupleQuiz'
import AnniversaryReminder from '@/components/couple/AnniversaryReminder'
import MemoryPopup from '@/components/couple/MemoryPopup'
import ShareDialog from '@/components/share/ShareDialog'
import PhotoSearch, { SearchFilters } from '@/components/photo/PhotoSearch'
import BatchOperations from '@/components/photo/BatchOperations'
import FloatingHearts from '@/components/common/FloatingHearts'

export default function Home() {
  const { isAuthenticated, user, setUser, photos, albums, setPhotos, setAlbums, layoutMode } = useStore()
  const [loading, setLoading] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)
  const [showChallenges, setShowChallenges] = useState(false)
  const [showJournal, setShowJournal] = useState(false)
  const [showWishList, setShowWishList] = useState(false)
  const [showQuiz, setShowQuiz] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [anniversaryDate, setAnniversaryDate] = useState('')
  const [saving, setSaving] = useState(false)
  const [filteredPhotos, setFilteredPhotos] = useState(photos)
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set())

  useEffect(() => {
    const loadData = async () => {
      try {
        const [photosRes, albumsRes, profileRes] = await Promise.all([
          photoApi.getAll({ limit: 50 }),
          albumApi.getAll(),
          authApi.getProfile(),
        ])

        if (photosRes.success && photosRes.data) {
          setPhotos(photosRes.data.items)
        }
        if (albumsRes.success && albumsRes.data) {
          setAlbums(albumsRes.data)
        }
        if (profileRes.success && profileRes.data) {
          setUser(profileRes.data)
          if (profileRes.data.anniversaryDate) {
            setAnniversaryDate(profileRes.data.anniversaryDate.split('T')[0])
          }
        }
      } catch (error) {
        console.error('加载数据失败:', error)
        toast.error('加载数据失败，请刷新页面重试')
      } finally {
        setLoading(false)
      }
    }

    if (isAuthenticated) {
      loadData()
    } else {
      setLoading(false)
    }
  }, [isAuthenticated, setPhotos, setAlbums, setUser])

  // 更新过滤后的照片
  useEffect(() => {
    setFilteredPhotos(photos)
  }, [photos])

  // 切换选择模式
  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode)
    if (selectionMode) {
      setSelectedPhotos(new Set())
    }
  }

  // 切换照片选择
  const togglePhotoSelection = (photoId: string) => {
    setSelectedPhotos((prev) => {
      const next = new Set(prev)
      if (next.has(photoId)) {
        next.delete(photoId)
      } else {
        next.add(photoId)
      }
      return next
    })
  }

  // 搜索过滤
  const handleSearch = (filters: SearchFilters) => {
    let result = [...photos]

    if (filters.keyword) {
      const keyword = filters.keyword.toLowerCase()
      result = result.filter(
        (p) =>
          p.filename.toLowerCase().includes(keyword) ||
          p.tags?.some((t) => t.toLowerCase().includes(keyword))
      )
    }

    if (filters.dateFrom) {
      const from = new Date(filters.dateFrom)
      result = result.filter((p) => {
        const date = new Date(p.takenAt || p.createdAt)
        return date >= from
      })
    }

    if (filters.dateTo) {
      const to = new Date(filters.dateTo)
      result = result.filter((p) => {
        const date = new Date(p.takenAt || p.createdAt)
        return date <= to
      })
    }

    if (filters.mood) {
      result = result.filter((p) => p.mood === filters.mood)
    }

    if (filters.location) {
      const location = filters.location.toLowerCase()
      result = result.filter((p) => p.location?.toLowerCase().includes(location))
    }

    setFilteredPhotos(result)
    if (Object.keys(filters).length > 0) {
      toast.info(`找到 ${result.length} 张照片`)
    }
  }

  // 保存纪念日设置
  const handleSaveAnniversary = async () => {
    if (!anniversaryDate) return
    setSaving(true)
    try {
      const res = await authApi.updateProfile({ anniversaryDate })
      if (res.success && res.data) {
        setUser(res.data)
        setShowSettings(false)
        toast.success('纪念日设置成功')
      }
    } catch (error) {
      console.error('保存失败:', error)
      toast.error('保存失败，请重试')
    } finally {
      setSaving(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-2xl"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="inline-block mb-8"
          >
            <Heart className="w-24 h-24 text-pink-500 fill-pink-500" />
          </motion.div>

          <h1 className="text-5xl font-bold text-gradient mb-4">
            我们的爱情相册
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            记录每一个美好瞬间，珍藏每一份甜蜜回忆
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/login"
              className="px-8 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full font-medium hover:from-pink-600 hover:to-rose-600 transition-all shadow-lg hover:shadow-xl"
            >
              开始使用
            </Link>
          </div>

          {/* 特性展示 */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              whileHover={{ y: -5 }}
              className="glass-effect p-6 rounded-2xl"
            >
              <Calendar className="w-12 h-12 text-pink-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800">时间线</h3>
              <p className="text-gray-500 mt-2">按时间记录你们的故事</p>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="glass-effect p-6 rounded-2xl"
            >
              <Map className="w-12 h-12 text-pink-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800">爱情地图</h3>
              <p className="text-gray-500 mt-2">标记一起去过的地方</p>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="glass-effect p-6 rounded-2xl"
            >
              <Heart className="w-12 h-12 text-pink-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800">悄悄话</h3>
              <p className="text-gray-500 mt-2">在照片背面写下心意</p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      <FloatingHearts />

      {/* 爱情倒计时 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-effect rounded-2xl p-6 mb-8 text-center relative"
      >
        <button
          onClick={() => setShowSettings(true)}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-pink-500 transition-colors"
          title="设置纪念日"
        >
          <Settings className="w-5 h-5" />
        </button>

        <div className="flex items-center justify-center gap-2 mb-4">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Heart className="w-8 h-8 text-pink-500 fill-pink-500" />
          </motion.div>
          <h2 className="text-3xl font-bold text-gradient">我们在一起</h2>
        </div>

        {user?.anniversaryDate ? (
          <LoveCountdown anniversaryDate={user.anniversaryDate} />
        ) : (
          <div className="mt-4">
            <p className="text-gray-500 mb-3">点击右上角设置你们的纪念日</p>
            <button
              onClick={() => setShowSettings(true)}
              className="px-6 py-2 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition-colors"
            >
              设置纪念日
            </button>
          </div>
        )}
      </motion.div>

      {/* 设置弹窗 */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">设置纪念日</h3>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-gray-500 mb-4">
                选择你们在一起的那一天，开始记录你们的爱情故事
              </p>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  纪念日日期
                </label>
                <input
                  type="date"
                  value={anniversaryDate}
                  onChange={(e) => setAnniversaryDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowSettings(false)}
                  className="px-4 py-2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleSaveAnniversary}
                  disabled={!anniversaryDate || saving}
                  className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors disabled:opacity-50"
                >
                  {saving ? '保存中...' : '保存'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 相册列表 */}
      {albums.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">相册</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {albums.map((album) => (
              <Link
                key={album.id}
                to={`/album/${album.id}`}
                className="group"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="aspect-square rounded-xl overflow-hidden shadow-lg"
                >
                  {album.coverUrl ? (
                    <img
                      src={album.coverUrl}
                      alt={album.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-pink-200 to-rose-200 flex items-center justify-center">
                      <Heart className="w-12 h-12 text-pink-400" />
                    </div>
                  )}
                </motion.div>
                <p className="mt-2 text-center text-gray-700 font-medium">
                  {album.name}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 功能按钮 */}
      <div className="flex flex-wrap gap-3 mb-6">
        <PhotoSearch onSearch={handleSearch} />
        <button
          onClick={() => setShowCalendar(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-md transition-shadow text-gray-700"
        >
          <Calendar className="w-5 h-5 text-pink-500" />
          情侣日历
        </button>
        <button
          onClick={() => setShowChallenges(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-md transition-shadow text-gray-700"
        >
          <Trophy className="w-5 h-5 text-pink-500" />
          情侣挑战
        </button>
        <button
          onClick={() => setShowJournal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-md transition-shadow text-gray-700"
        >
          <BookOpen className="w-5 h-5 text-amber-500" />
          情侣日记
        </button>
        <button
          onClick={() => setShowWishList(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-md transition-shadow text-gray-700"
        >
          <Gift className="w-5 h-5 text-purple-500" />
          愿望清单
        </button>
        <button
          onClick={() => setShowQuiz(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-md transition-shadow text-gray-700"
        >
          <Brain className="w-5 h-5 text-cyan-500" />
          默契测试
        </button>
        <button
          onClick={() => setShowShare(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-md transition-shadow text-gray-700"
        >
          <Share2 className="w-5 h-5 text-pink-500" />
          分享相册
        </button>
        <button
          onClick={toggleSelectionMode}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl shadow-sm hover:shadow-md transition-all ${
            selectionMode
              ? 'bg-pink-500 text-white'
              : 'bg-white/80 backdrop-blur-sm text-gray-700'
          }`}
        >
          <Check className="w-5 h-5" />
          {selectionMode ? '取消选择' : '批量操作'}
        </button>
      </div>

      {/* 照片展示 */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800">
            最近照片
            {filteredPhotos.length !== photos.length && (
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({filteredPhotos.length}/{photos.length})
              </span>
            )}
          </h2>
          {photos.length > 0 && <LayoutSwitcher />}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-12 h-12 border-4 border-pink-200 border-t-pink-500 rounded-full mx-auto"
            />
            <p className="mt-4 text-gray-500">加载中...</p>
          </div>
        ) : filteredPhotos.length > 0 ? (
          <>
            {layoutMode === 'masonry' && (
              <MasonryGrid
                photos={filteredPhotos}
                selectionMode={selectionMode}
                selectedPhotos={selectedPhotos}
                onToggleSelection={togglePhotoSelection}
              />
            )}
            {layoutMode === 'grid' && <GridLayout photos={filteredPhotos} />}
            {layoutMode === 'timeline' && <TimelineLayout photos={filteredPhotos} />}
            {layoutMode === 'polaroid' && <PolaroidLayout photos={filteredPhotos} />}
            {layoutMode === 'filmstrip' && <FilmstripLayout photos={filteredPhotos} />}
            {layoutMode === 'collage' && <CollageLayout photos={filteredPhotos} />}
            {layoutMode === 'heart' && <HeartLayout photos={filteredPhotos} />}
            {layoutMode === 'story' && <StoryLayout photos={filteredPhotos} />}
            {layoutMode === 'stack' && <StackLayout photos={filteredPhotos} />}
            {layoutMode === 'free-canvas' && <FreeCanvas photos={filteredPhotos} />}
            {layoutMode === 'carousel-3d' && <Carousel3D photos={filteredPhotos} />}
            {layoutMode === 'map' && <MapLayout photos={filteredPhotos} />}
          </>
        ) : (
          <div className="text-center py-12 glass-effect rounded-2xl">
            <Heart className="w-16 h-16 text-pink-300 mx-auto mb-4" />
            <p className="text-gray-500">
              {photos.length > 0 ? '没有匹配的照片，请尝试其他搜索条件' : '还没有照片，快去上传吧！'}
            </p>
            {photos.length === 0 && (
              <Link
                to="/upload"
                className="inline-block mt-4 px-6 py-2 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition-colors"
              >
                上传照片
              </Link>
            )}
          </div>
        )}
      </div>

      {/* 情侣日历 */}
      <CoupleCalendar
        isOpen={showCalendar}
        onClose={() => setShowCalendar(false)}
        photos={photos}
        anniversaryDate={user?.anniversaryDate}
      />

      {/* 情侣挑战 */}
      <CoupleChallenges
        isOpen={showChallenges}
        onClose={() => setShowChallenges(false)}
      />

      {/* 情侣日记 */}
      <CoupleJournal
        isOpen={showJournal}
        onClose={() => setShowJournal(false)}
      />

      {/* 愿望清单 */}
      <WishList
        isOpen={showWishList}
        onClose={() => setShowWishList(false)}
      />

      {/* 默契测试 */}
      <CoupleQuiz
        isOpen={showQuiz}
        onClose={() => setShowQuiz(false)}
      />

      {/* 分享对话框 */}
      <ShareDialog
        isOpen={showShare}
        onClose={() => setShowShare(false)}
      />

      {/* 回忆弹窗 */}
      <MemoryPopup photos={photos} anniversaryDate={user?.anniversaryDate} />

      {/* 纪念日提醒 */}
      <AnniversaryReminder anniversaryDate={user?.anniversaryDate} />

      {/* 批量操作 */}
      <AnimatePresence>
        {selectionMode && selectedPhotos.size > 0 && (
          <BatchOperations
            selectedPhotos={photos.filter((p) => selectedPhotos.has(p.id))}
            albums={albums}
            onClearSelection={() => setSelectedPhotos(new Set())}
            onComplete={() => {
              setSelectedPhotos(new Set())
              setSelectionMode(false)
              // 重新加载照片
              photoApi.getAll({ limit: 50 }).then((res) => {
                if (res.success && res.data) {
                  setPhotos(res.data.items)
                }
              })
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
