import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, Clock, Calendar } from 'lucide-react'

interface LoveCountdownProps {
  anniversaryDate: string
}

interface TimeTogether {
  days: number
  hours: number
  minutes: number
  seconds: number
}

export default function LoveCountdown({ anniversaryDate }: LoveCountdownProps) {
  const [time, setTime] = useState<TimeTogether>({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    const calculateTime = () => {
      const start = new Date(anniversaryDate)
      const now = new Date()
      const diff = now.getTime() - start.getTime()

      if (diff < 0) return

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      setTime({ days, hours, minutes, seconds })
    }

    calculateTime()
    const interval = setInterval(calculateTime, 1000)

    return () => clearInterval(interval)
  }, [anniversaryDate])

  // 计算下一个纪念日
  const getNextAnniversary = () => {
    const now = new Date()
    const thisYear = now.getFullYear()
    const anniversary = new Date(anniversaryDate)

    let next = new Date(thisYear, anniversary.getMonth(), anniversary.getDate())
    if (next <= now) {
      next = new Date(thisYear + 1, anniversary.getMonth(), anniversary.getDate())
    }

    const daysUntil = Math.ceil((next.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return daysUntil
  }

  const daysUntilNext = getNextAnniversary()

  return (
    <div className="text-center">
      <div className="grid grid-cols-4 gap-4 max-w-md mx-auto">
        {[
          { value: time.days, label: '天' },
          { value: time.hours, label: '时' },
          { value: time.minutes, label: '分' },
          { value: time.seconds, label: '秒' },
        ].map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.1, type: 'spring' }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg"
          >
            <motion.span
              key={item.value}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="block text-4xl font-bold text-pink-500"
            >
              {item.value}
            </motion.span>
            <span className="text-sm text-gray-500">{item.label}</span>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-center gap-6 text-gray-500">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span>还在继续...</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          <span>距离下一个纪念日还有 {daysUntilNext} 天</span>
        </div>
      </div>
    </div>
  )
}
