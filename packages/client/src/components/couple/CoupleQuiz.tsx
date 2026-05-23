import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, X, ChevronRight, Trophy, Heart, RotateCcw } from 'lucide-react'

interface CoupleQuizProps {
  isOpen: boolean
  onClose: () => void
}

interface Question {
  id: number
  question: string
  options: string[]
  category: string
}

const questions: Question[] = [
  { id: 1, question: '第一次见面是在哪里？', options: ['学校', '公司', '朋友聚会', '网上'], category: '回忆' },
  { id: 2, question: 'TA最喜欢的食物是？', options: ['火锅', '烧烤', '西餐', '日料'], category: '喜好' },
  { id: 3, question: 'TA的生日是几月？', options: ['1-3月', '4-6月', '7-9月', '10-12月'], category: '基本信息' },
  { id: 4, question: 'TA最想去的地方是？', options: ['日本', '欧洲', '马尔代夫', '国内游'], category: '梦想' },
  { id: 5, question: 'TA最喜欢的电影类型是？', options: ['爱情', '动作', '喜剧', '科幻'], category: '喜好' },
  { id: 6, question: '你们的纪念日是几号？', options: ['1-10号', '11-20号', '21-31号', '记不清了'], category: '回忆' },
  { id: 7, question: 'TA最害怕什么？', options: ['虫子', '打雷', '独处', '社交'], category: '了解' },
  { id: 8, question: 'TA的爱好是？', options: ['运动', '看书', '游戏', '追剧'], category: '喜好' },
  { id: 9, question: 'TA最喜欢的颜色是？', options: ['粉色', '蓝色', '白色', '黑色'], category: '喜好' },
  { id: 10, question: '你们吵架后谁先道歉？', options: ['我', 'TA', '看情况', '不吵架'], category: '相处' },
]

export default function CoupleQuiz({ isOpen, onClose }: CoupleQuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [myAnswers, setMyAnswers] = useState<number[]>([])
  const [taAnswers, setTaAnswers] = useState<number[]>([])
  const [phase, setPhase] = useState<'my' | 'ta' | 'result'>('my')
  const [score, setScore] = useState<number | null>(null)

  const handleAnswer = (optionIndex: number) => {
    if (phase === 'my') {
      const newAnswers = [...myAnswers, optionIndex]
      setMyAnswers(newAnswers)

      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1)
      } else {
        // 切换到 TA 的回合
        setCurrentQuestion(0)
        setPhase('ta')
      }
    } else if (phase === 'ta') {
      const newAnswers = [...taAnswers, optionIndex]
      setTaAnswers(newAnswers)

      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1)
      } else {
        // 计算结果
        calculateScore(myAnswers, newAnswers)
        setPhase('result')
      }
    }
  }

  const calculateScore = (my: number[], ta: number[]) => {
    let matches = 0
    for (let i = 0; i < questions.length; i++) {
      if (my[i] === ta[i]) matches++
    }
    setScore(Math.round((matches / questions.length) * 100))
  }

  const reset = () => {
    setCurrentQuestion(0)
    setMyAnswers([])
    setTaAnswers([])
    setPhase('my')
    setScore(null)
  }

  const getScoreMessage = (score: number) => {
    if (score >= 90) return { text: '心有灵犀！', emoji: '💕', color: 'text-red-500' }
    if (score >= 70) return { text: '非常默契！', emoji: '🥰', color: 'text-pink-500' }
    if (score >= 50) return { text: '还需要磨合', emoji: '😊', color: 'text-orange-500' }
    return { text: '多了解对方吧', emoji: '💪', color: 'text-blue-500' }
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
            className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 头部 */}
            <div className="bg-gradient-to-r from-cyan-500 to-blue-500 p-6 text-white">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 bg-white/20 rounded-full hover:bg-white/30"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <Brain className="w-8 h-8" />
                <div>
                  <h2 className="text-2xl font-bold">默契测试</h2>
                  <p className="text-white/80">
                    {phase === 'my' ? '轮到你回答' : phase === 'ta' ? '轮到 TA 回答' : '测试结果'}
                  </p>
                </div>
              </div>

              {phase !== 'result' && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>第 {currentQuestion + 1}/{questions.length} 题</span>
                    <span>{phase === 'my' ? '我' : 'TA'} 的回合</span>
                  </div>
                  <div className="h-2 bg-white/30 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                      className="h-full bg-white rounded-full"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 内容 */}
            <div className="p-6">
              {phase === 'result' && score !== null ? (
                // 结果
                <div className="text-center py-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                    className="text-8xl mb-6"
                  >
                    {getScoreMessage(score).emoji}
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <h3 className={`text-3xl font-bold mb-2 ${getScoreMessage(score).color}`}>
                      {getScoreMessage(score).text}
                    </h3>
                    <p className="text-6xl font-bold text-gray-800 my-4">{score}%</p>
                    <p className="text-gray-500">默契指数</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mt-8 flex gap-3"
                  >
                    <button
                      onClick={reset}
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-100 rounded-xl text-gray-700 hover:bg-gray-200"
                    >
                      <RotateCcw className="w-4 h-4" />
                      再测一次
                    </button>
                    <button
                      onClick={onClose}
                      className="flex-1 py-3 bg-cyan-500 text-white rounded-xl hover:bg-cyan-600"
                    >
                      完成
                    </button>
                  </motion.div>
                </div>
              ) : (
                // 问题
                <div>
                  <div className="mb-2">
                    <span className="px-3 py-1 bg-cyan-100 text-cyan-700 rounded-full text-sm">
                      {questions[currentQuestion].category}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-gray-800 mb-6">
                    {questions[currentQuestion].question}
                  </h3>

                  <div className="space-y-3">
                    {questions[currentQuestion].options.map((option, index) => (
                      <motion.button
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => handleAnswer(index)}
                        className="w-full flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-cyan-50 hover:ring-2 hover:ring-cyan-300 transition-all text-left"
                      >
                        <span className="w-8 h-8 bg-white rounded-full flex items-center justify-center font-bold text-gray-600 shadow-sm">
                          {String.fromCharCode(65 + index)}
                        </span>
                        <span className="flex-1 text-gray-700">{option}</span>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
