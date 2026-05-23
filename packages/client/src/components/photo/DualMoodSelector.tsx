import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

interface DualMoodSelectorProps {
  isOpen: boolean
  onClose: () => void
  currentMood?: string
  currentMood2?: string
  onSave: (mood: string, mood2: string) => void
}

const moods = [
  { emoji: '😍', label: '心动' },
  { emoji: '🥰', label: '甜蜜' },
  { emoji: '😊', label: '开心' },
  { emoji: '😌', label: '平静' },
  { emoji: '🤗', label: '温暖' },
  { emoji: '😘', label: '亲亲' },
  { emoji: '💕', label: '爱你' },
  { emoji: '✨', label: '美好' },
  { emoji: '🌟', label: '闪耀' },
  { emoji: '🎉', label: '庆祝' },
  { emoji: '🏖️', label: '度假' },
  { emoji: '🍽️', label: '美食' },
  { emoji: '📸', label: '拍照' },
  { emoji: '🎬', label: '电影' },
  { emoji: '🎵', label: '音乐' },
  { emoji: '💤', label: '困了' },
]

export default function DualMoodSelector({
  isOpen,
  onClose,
  currentMood,
  currentMood2,
  onSave,
}: DualMoodSelectorProps) {
  const [selectedMood, setSelectedMood] = useState(currentMood || '')
  const [selectedMood2, setSelectedMood2] = useState(currentMood2 || '')
  const [activeTab, setActiveTab] = useState<1 | 2>(1)

  const handleSave = () => {
    onSave(selectedMood, selectedMood2)
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
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 头部 */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-bold text-gray-800">选择心情</h3>
              <button
                onClick={onClose}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 标签切换 */}
            <div className="flex border-b">
              <button
                onClick={() => setActiveTab(1)}
                className={`flex-1 py-3 text-center font-medium transition-colors ${
                  activeTab === 1
                    ? 'text-pink-500 border-b-2 border-pink-500'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="mr-2">👤</span>
                我的心情
                {selectedMood && (
                  <span className="ml-2 text-2xl">{selectedMood}</span>
                )}
              </button>
              <button
                onClick={() => setActiveTab(2)}
                className={`flex-1 py-3 text-center font-medium transition-colors ${
                  activeTab === 2
                    ? 'text-pink-500 border-b-2 border-pink-500'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="mr-2">💑</span>
                TA的心情
                {selectedMood2 && (
                  <span className="ml-2 text-2xl">{selectedMood2}</span>
                )}
              </button>
            </div>

            {/* 心情选择网格 */}
            <div className="p-4">
              <p className="text-sm text-gray-500 mb-3">
                {activeTab === 1 ? '选择你此刻的心情' : '为TA选择一个心情'}
              </p>
              <div className="grid grid-cols-4 gap-3">
                {moods.map(({ emoji, label }) => (
                  <motion.button
                    key={emoji}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      if (activeTab === 1) {
                        setSelectedMood(selectedMood === emoji ? '' : emoji)
                      } else {
                        setSelectedMood2(selectedMood2 === emoji ? '' : emoji)
                      }
                    }}
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${
                      (activeTab === 1 ? selectedMood : selectedMood2) === emoji
                        ? 'bg-pink-100 ring-2 ring-pink-500'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-3xl">{emoji}</span>
                    <span className="text-xs text-gray-600">{label}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* 预览 */}
            <div className="px-4 py-3 bg-gray-50">
              <div className="flex items-center justify-center gap-4">
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-1">我</p>
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm">
                    {selectedMood ? (
                      <span className="text-4xl">{selectedMood}</span>
                    ) : (
                      <span className="text-gray-300 text-2xl">?</span>
                    )}
                  </div>
                </div>
                <div className="text-2xl text-pink-300">+</div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-1">TA</p>
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm">
                    {selectedMood2 ? (
                      <span className="text-4xl">{selectedMood2}</span>
                    ) : (
                      <span className="text-gray-300 text-2xl">?</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 底部按钮 */}
            <div className="flex gap-3 p-4 border-t">
              <button
                onClick={() => {
                  setSelectedMood('')
                  setSelectedMood2('')
                }}
                className="flex-1 py-2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                清除
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
              >
                保存
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
