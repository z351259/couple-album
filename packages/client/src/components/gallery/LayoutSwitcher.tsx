import { motion } from 'framer-motion'
import { Grid3X3, Columns, Calendar, Image, Layers, Film, Heart, Play, Map, Box, Globe, Layers3 } from 'lucide-react'
import useStore from '@/stores/useStore'
import type { LayoutMode } from '@/types'

const layouts: { mode: LayoutMode; icon: React.ReactNode; label: string }[] = [
  { mode: 'masonry', icon: <Columns className="w-5 h-5" />, label: '瀑布流' },
  { mode: 'grid', icon: <Grid3X3 className="w-5 h-5" />, label: '网格' },
  { mode: 'timeline', icon: <Calendar className="w-5 h-5" />, label: '时间线' },
  { mode: 'polaroid', icon: <Image className="w-5 h-5" />, label: '宝丽来' },
  { mode: 'filmstrip', icon: <Film className="w-5 h-5" />, label: '胶片' },
  { mode: 'collage', icon: <Layers className="w-5 h-5" />, label: '拼贴' },
  { mode: 'heart', icon: <Heart className="w-5 h-5" />, label: '爱心' },
  { mode: 'story', icon: <Play className="w-5 h-5" />, label: '故事' },
  { mode: 'stack', icon: <Layers3 className="w-5 h-5" />, label: '堆叠' },
  { mode: 'free-canvas', icon: <Box className="w-5 h-5" />, label: '画布' },
  { mode: 'carousel-3d', icon: <Globe className="w-5 h-5" />, label: '3D轮播' },
  { mode: 'map', icon: <Map className="w-5 h-5" />, label: '地图' },
]

export default function LayoutSwitcher() {
  const { layoutMode, setLayoutMode } = useStore()

  return (
    <div className="flex items-center gap-2 p-1 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm">
      {layouts.map(({ mode, icon, label }) => (
        <motion.button
          key={mode}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setLayoutMode(mode)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
            layoutMode === mode
              ? 'bg-pink-500 text-white'
              : 'text-gray-500 hover:text-pink-500 hover:bg-pink-50'
          }`}
          title={label}
        >
          {icon}
          <span className="text-sm font-medium hidden sm:inline">{label}</span>
        </motion.button>
      ))}
    </div>
  )
}
