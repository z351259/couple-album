import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Heart, X } from 'lucide-react'
import type { Photo } from '@/types'

interface CoupleCalendarProps {
  isOpen: boolean
  onClose: () => void
  photos: Photo[]
  anniversaryDate?: string
}

export default function CoupleCalendar({ isOpen, onClose, photos, anniversaryDate }: CoupleCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  // 获取当前月份的天数
  const daysInMonth = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    return new Date(year, month + 1, 0).getDate()
  }, [currentDate])

  // 获取月份第一天是星期几
  const firstDayOfMonth = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    return new Date(year, month, 1).getDay()
  }, [currentDate])

  // 按日期分组照片
  const photosByDate = useMemo(() => {
    const map: Record<string, Photo[]> = {}
    photos.forEach((photo) => {
      const date = photo.takenAt || photo.createdAt
      const dateKey = new Date(date).toISOString().split('T')[0]
      if (!map[dateKey]) map[dateKey] = []
      map[dateKey].push(photo)
    })
    return map
  }, [photos])

  // 检查是否是纪念日
  const isAnniversary = (day: number) => {
    if (!anniversaryDate) return false
    const ann = new Date(anniversaryDate)
    return ann.getDate() === day && ann.getMonth() === currentDate.getMonth()
  }

  // 检查是否是今天
  const isToday = (day: number) => {
    const today = new Date()
    return (
      today.getDate() === day &&
      today.getMonth() === currentDate.getMonth() &&
      today.getFullYear() === currentDate.getFullYear()
    )
  }

  // 获取某天的照片
  const getPhotosForDay = (day: number) => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return photosByDate[dateKey] || []
  }

  const goToPrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']
  const weekDays = ['日', '一', '二', '三', '四', '五', '六']

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
            className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">情侣日历</h3>
              <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 月份导航 */}
            <div className="flex items-center justify-between mb-4">
              <button onClick={goToPrevMonth} className="p-2 hover:bg-gray-100 rounded-lg">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h4 className="text-lg font-semibold">
                {currentDate.getFullYear()}年 {monthNames[currentDate.getMonth()]}
              </h4>
              <button onClick={goToNextMonth} className="p-2 hover:bg-gray-100 rounded-lg">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* 星期标题 */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map((day) => (
                <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* 日期网格 */}
            <div className="grid grid-cols-7 gap-1">
              {/* 空白占位 */}
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}

              {/* 日期 */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1
                const dayPhotos = getPhotosForDay(day)
                const hasPhotos = dayPhotos.length > 0
                const anniversary = isAnniversary(day)
                const today = isToday(day)

                return (
                  <motion.button
                    key={day}
                    whileHover={{ scale: 1.1 }}
                    onClick={() => setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
                    className={`aspect-square rounded-lg flex flex-col items-center justify-center relative ${
                      today
                        ? 'bg-pink-500 text-white'
                        : anniversary
                        ? 'bg-pink-100 text-pink-700'
                        : hasPhotos
                        ? 'bg-pink-50 text-pink-600'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-sm font-medium">{day}</span>
                    {hasPhotos && (
                      <div className="flex gap-0.5 mt-0.5">
                        {dayPhotos.slice(0, 3).map((_, idx) => (
                          <div key={idx} className="w-1 h-1 rounded-full bg-pink-400" />
                        ))}
                      </div>
                    )}
                    {anniversary && (
                      <Heart className="w-3 h-3 text-pink-500 fill-pink-500 absolute top-0.5 right-0.5" />
                    )}
                  </motion.button>
                )
              })}
            </div>

            {/* 选中日期的照片 */}
            {selectedDate && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h5 className="font-medium text-gray-700 mb-2">
                  {selectedDate.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })}
                </h5>
                {getPhotosForDay(selectedDate.getDate()).length > 0 ? (
                  <div className="grid grid-cols-4 gap-2">
                    {getPhotosForDay(selectedDate.getDate()).map((photo) => (
                      <div key={photo.id} className="aspect-square rounded-lg overflow-hidden">
                        <img
                          src={photo.thumbnailUrl}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">这一天没有照片</p>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
