import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Send, X } from 'lucide-react'

interface LoveLetterProps {
  photoId: string
  onSubmit: (message: string) => Promise<void>
}

export default function LoveLetter({ photoId, onSubmit }: LoveLetterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)

  const handleSubmit = async () => {
    if (!message.trim()) return
    setSending(true)
    try {
      await onSubmit(message)
      setMessage('')
      setIsOpen(false)
    } catch (error) {
      console.error('发送悄悄话失败:', error)
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="p-2 bg-pink-100 text-pink-500 rounded-full hover:bg-pink-200 transition-colors"
        title="写悄悄话"
      >
        <Heart className="w-5 h-5" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, rotateY: 90 }}
              animate={{ scale: 1, rotateY: 0 }}
              exit={{ scale: 0.9, rotateY: -90 }}
              transition={{ type: 'spring', damping: 20 }}
              className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-6 max-w-md w-full shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-pink-500 fill-pink-500" />
                  悄悄话
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-gray-500 text-sm mb-4">
                写下你想对 TA 说的话，只有你们能看到
              </p>

              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="亲爱的..."
                className="w-full h-32 px-4 py-3 border border-pink-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white"
                maxLength={500}
              />

              <div className="flex items-center justify-between mt-4">
                <span className="text-sm text-gray-400">
                  {message.length}/500
                </span>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSubmit}
                  disabled={!message.trim() || sending}
                  className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full hover:from-pink-600 hover:to-rose-600 transition-all disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  {sending ? '发送中...' : '发送'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
