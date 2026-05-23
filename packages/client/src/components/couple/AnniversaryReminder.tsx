import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Heart, Calendar, X, Gift } from 'lucide-react'

interface Anniversary {
  id: string
  name: string
  date: string
  emoji: string
  daysUntil: number
  isToday: boolean
}

interface AnniversaryReminderProps {
  anniversaryDate?: string
}

export default function AnniversaryReminder({ anniversaryDate }: AnniversaryReminderProps) {
  const [anniversaries, setAnniversaries] = useState<Anniversary[]>([])
  const [showReminder, setShowReminder] = useState(false)
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!anniversaryDate) return

    const calculateAnniversaries = () => {
      const start = new Date(anniversaryDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const results: Anniversary[] = []

      // 计算在一起的天数
      const daysTogether = Math.floor(
        (today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
      )

      // 添加在一起的纪念日
      const milestones = [
        { days: 100, name: '百天纪念', emoji: '💯' },
        { days: 365, name: '一周年', emoji: '🎉' },
        { days: 520, name: '520天', emoji: '💕' },
        { days: 730, name: '两周年', emoji: '🎊' },
        { days: 1000, name: '千日纪念', emoji: '🏆' },
        { days: 1314, name: '一生一世', emoji: '💍' },
      ]

      for (const milestone of milestones) {
        if (daysTogether < milestone.days) {
          const targetDate = new Date(start)
          targetDate.setDate(targetDate.getDate() + milestone.days)
          const daysUntil = Math.floor(
            (targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
          )

          results.push({
            id: `milestone-${milestone.days}`,
            name: milestone.name,
            date: targetDate.toISOString().split('T')[0],
            emoji: milestone.emoji,
            daysUntil,
            isToday: daysUntil === 0,
          })
        }
      }

      // 添加每年的纪念日
      const anniversaryMonth = start.getMonth()
      const anniversaryDay = start.getDate()

      for (let year = today.getFullYear(); year <= today.getFullYear() + 1; year++) {
        const anniversary = new Date(year, anniversaryMonth, anniversaryDay)
        const daysUntil = Math.floor(
          (anniversary.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        )

        if (daysUntil >= 0 && daysUntil <= 30) {
          const years = year - start.getFullYear()
          results.push({
            id: `annual-${year}`,
            name: `${years}周年纪念`,
            date: anniversary.toISOString().split('T')[0],
            emoji: '💝',
            daysUntil,
            isToday: daysUntil === 0,
          })
        }
      }

      // 添加每月的纪念日（每月的这一天）
      if (today.getDate() <= anniversaryDay) {
        const thisMonth = new Date(today.getFullYear(), today.getMonth(), anniversaryDay)
        const daysUntil = Math.floor(
          (thisMonth.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        )

        if (daysUntil > 0 && daysUntil <= 7) {
          results.push({
            id: `monthly-${today.getMonth()}`,
            name: '月纪念日',
            date: thisMonth.toISOString().split('T')[0],
            emoji: '📅',
            daysUntil,
            isToday: daysUntil === 0,
          })
        }
      }

      // 按天数排序
      results.sort((a, b) => a.daysUntil - b.daysUntil)

      setAnniversaries(results)

      // 检查是否有即将到来的纪念日（3天内）
      const upcoming = results.filter((a) => a.daysUntil <= 3 && !dismissed.has(a.id))
      if (upcoming.length > 0) {
        setShowReminder(true)
      }
    }

    calculateAnniversaries()
    const interval = setInterval(calculateAnniversaries, 60 * 60 * 1000) // 每小时检查

    return () => clearInterval(interval)
  }, [anniversaryDate, dismissed])

  const dismiss = (id: string) => {
    setDismissed((prev) => new Set(prev).add(id))
  }

  if (!anniversaryDate || anniversaries.length === 0) return null

  const upcoming = anniversaries.filter((a) => a.daysUntil <= 7 && !dismissed.has(a.id))

  return (
    <>
      {/* 浮动提醒按钮 */}
      {upcoming.length > 0 && !showReminder && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="fixed bottom-24 right-6 z-40 p-3 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full shadow-lg text-white"
          onClick={() => setShowReminder(true)}
        >
          <Bell className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center">
            {upcoming.length}
          </span>
        </motion.button>
      )}

      {/* 提醒弹窗 */}
      <AnimatePresence>
        {showReminder && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="fixed bottom-24 right-6 z-50 w-80 bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* 头部 */}
            <div className="bg-gradient-to-r from-pink-500 to-rose-500 p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Gift className="w-5 h-5" />
                  <h3 className="font-bold">纪念日提醒</h3>
                </div>
                <button
                  onClick={() => setShowReminder(false)}
                  className="p-1 hover:bg-white/20 rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 纪念日列表 */}
            <div className="max-h-64 overflow-y-auto">
              {upcoming.map((anniversary) => (
                <motion.div
                  key={anniversary.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 p-4 border-b hover:bg-pink-50 transition-colors"
                >
                  <div className="text-3xl">{anniversary.emoji}</div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800">{anniversary.name}</h4>
                    <p className="text-sm text-gray-500">
                      {new Date(anniversary.date).toLocaleDateString('zh-CN')}
                    </p>
                  </div>
                  <div className="text-right">
                    {anniversary.isToday ? (
                      <span className="px-3 py-1 bg-pink-500 text-white rounded-full text-sm font-medium">
                        今天!
                      </span>
                    ) : (
                      <span className="text-pink-500 font-bold">
                        {anniversary.daysUntil}天后
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => dismiss(anniversary.id)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </div>

            {/* 底部 */}
            <div className="p-3 bg-gray-50 text-center">
              <p className="text-xs text-gray-500">
                在一起 {Math.floor(
                  (new Date().getTime() - new Date(anniversaryDate).getTime()) /
                  (1000 * 60 * 60 * 24)
                )} 天
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
