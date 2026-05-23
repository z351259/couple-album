import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, X, Send } from 'lucide-react'

interface SecretMessageProps {
  isOpen: boolean
  onClose: () => void
  currentMessage?: string
  onSave: (message: string) => void
}

export default function SecretMessage({
  isOpen,
  onClose,
  currentMessage,
  onSave,
}: SecretMessageProps) {
  const [message, setMessage] = useState(currentMessage || '')
  const [isFlipped, setIsFlipped] = useState(false)

  const handleSave = () => {
    onSave(message)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 3D翻转卡片 */}
            <div
              className="relative w-full aspect-[3/4]"
              style={{ perspective: '1000px' }}
            >
              <motion.div
                className="w-full h-full relative"
                style={{ transformStyle: 'preserve-3d' }}
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6, type: 'spring', stiffness: 300, damping: 30 }}
              >
                {/* 正面 - 输入 */}
                <div
                  className="absolute inset-0 bg-gradient-to-br from-pink-100 to-rose-100 rounded-2xl shadow-2xl p-6 flex flex-col"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-800">写悄悄话</h3>
                    <button
                      onClick={onClose}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex-1">
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="写下你想对TA说的话..."
                      className="w-full h-full resize-none bg-white/50 rounded-xl p-4 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-300"
                      maxLength={200}
                    />
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <span className="text-sm text-gray-500">
                      {message.length}/200
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setIsFlipped(true)}
                        disabled={!message}
                        className="px-4 py-2 bg-white rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                      >
                        预览
                      </button>
                      <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors flex items-center gap-2"
                      >
                        <Send className="w-4 h-4" />
                        保存
                      </button>
                    </div>
                  </div>
                </div>

                {/* 背面 - 预览 */}
                <div
                  className="absolute inset-0 bg-gradient-to-br from-rose-200 to-pink-200 rounded-2xl shadow-2xl p-6 flex flex-col items-center justify-center"
                  style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                >
                  <button
                    onClick={() => setIsFlipped(false)}
                    className="absolute top-4 right-4 p-1 text-gray-600 hover:text-gray-800"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="mb-6"
                  >
                    <Heart className="w-16 h-16 text-red-400 fill-red-400" />
                  </motion.div>

                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 max-w-full">
                    <p className="text-gray-700 text-center text-lg leading-relaxed">
                      {message || '还没有写悄悄话...'}
                    </p>
                  </div>

                  <p className="text-sm text-gray-600 mt-4">点击空白处返回编辑</p>

                  <button
                    onClick={() => setIsFlipped(false)}
                    className="mt-4 px-6 py-2 bg-white rounded-full text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    返回编辑
                  </button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
