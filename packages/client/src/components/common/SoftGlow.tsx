import { motion } from 'framer-motion'

interface SoftGlowProps {
  children: React.ReactNode
  color?: string
  intensity?: number
}

export default function SoftGlow({ children, color = 'pink', intensity = 0.3 }: SoftGlowProps) {
  const glowColors: Record<string, string> = {
    pink: 'rgba(236, 72, 153, VAR)',
    rose: 'rgba(244, 63, 94, VAR)',
    red: 'rgba(239, 68, 68, VAR)',
    purple: 'rgba(168, 85, 247, VAR)',
    blue: 'rgba(59, 130, 246, VAR)',
  }

  const glowColor = glowColors[color] || glowColors.pink

  return (
    <motion.div
      whileHover={{
        boxShadow: `0 0 30px ${glowColor.replace('VAR', intensity.toString())}, 0 0 60px ${glowColor.replace('VAR', (intensity * 0.5).toString())}`,
      }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  )
}
