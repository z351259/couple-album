import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface Petal {
  id: number
  x: number
  size: number
  delay: number
  duration: number
  rotation: number
}

export default function PetalFall() {
  const [petals, setPetals] = useState<Petal[]>([])

  useEffect(() => {
    const generatePetals = () => {
      const newPetals: Petal[] = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        size: Math.random() * 15 + 8,
        delay: Math.random() * 8,
        duration: Math.random() * 8 + 8,
        rotation: Math.random() * 360,
      }))
      setPetals(newPetals)
    }

    generatePetals()
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {petals.map((petal) => (
        <motion.div
          key={petal.id}
          initial={{
            x: `${petal.x}vw`,
            y: '-5vh',
            rotate: 0,
            opacity: 0,
          }}
          animate={{
            y: '105vh',
            rotate: petal.rotation,
            opacity: [0, 0.7, 0.7, 0],
            x: [`${petal.x}vw`, `${petal.x + 10}vw`, `${petal.x - 5}vw`],
          }}
          transition={{
            duration: petal.duration,
            delay: petal.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute"
        >
          <svg
            width={petal.size}
            height={petal.size}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"
              fill="rgba(251, 113, 133, 0.4)"
            />
          </svg>
        </motion.div>
      ))}
    </div>
  )
}
