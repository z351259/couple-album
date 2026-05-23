import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Copy, Check, Loader2, Link2, X } from 'lucide-react'
import { coupleApi } from '@/services/api'
import useStore from '@/stores/useStore'

interface CoupleSetupProps {
  onPaired: () => void
}

export default function CoupleSetup({ onPaired }: CoupleSetupProps) {
  const { user } = useStore()
  const [mode, setMode] = useState<'idle' | 'invite' | 'accept'>('idle')
  const [inviteCode, setInviteCode] = useState('')
  const [inputCode, setInputCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [expiresAt, setExpiresAt] = useState('')
  const [error, setError] = useState('')

  // 检查是否已有未过期的邀请
  useEffect(() => {
    const checkExisting = async () => {
      try {
        const res = await coupleApi.getInvite()
        if (res.success && res.data) {
          setInviteCode(res.data.code)
          setExpiresAt(res.data.expiresAt)
          setMode('invite')
        }
      } catch {}
    }
    checkExisting()
  }, [])

  const handleCreateInvite = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await coupleApi.createInvite()
      if (res.success && res.data) {
        setInviteCode(res.data.code)
        setExpiresAt(res.data.expiresAt)
        setMode('invite')
      } else {
        setError(res.error || '生成邀请码失败')
      }
    } catch (e: any) {
      setError(e.error || '生成邀请码失败')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleAccept = async () => {
    if (!inputCode || inputCode.length !== 6) {
      setError('请输入6位邀请码')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await coupleApi.acceptInvite(inputCode)
      if (res.success) {
        onPaired()
      } else {
        setError(res.error || '邀请码无效')
      }
    } catch (e: any) {
      setError(e.error || '邀请码无效')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelInvite = async () => {
    try {
      await coupleApi.cancelInvite()
      setMode('idle')
      setInviteCode('')
    } catch {}
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="inline-block mb-4"
        >
          <Heart className="w-20 h-20 text-pink-400 fill-pink-400" />
        </motion.div>
        <h1 className="text-3xl font-bold text-gradient mb-2">
          {user?.nickname}，欢迎！
        </h1>
        <p className="text-gray-500">
          邀请你的另一半，一起记录美好时光
        </p>
      </motion.div>

      <AnimatePresence mode="wait">
        {mode === 'idle' && (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <button
              onClick={handleCreateInvite}
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-2xl font-medium text-lg hover:from-pink-600 hover:to-rose-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Link2 className="w-5 h-5" />}
              生成邀请码
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-pink-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-gradient-to-br from-pink-50 via-white to-rose-50 text-gray-400">或</span>
              </div>
            </div>

            <button
              onClick={() => setMode('accept')}
              className="w-full py-4 bg-white border-2 border-pink-300 text-pink-600 rounded-2xl font-medium text-lg hover:bg-pink-50 transition-all"
            >
              输入邀请码
            </button>
          </motion.div>
        )}

        {mode === 'invite' && (
          <motion.div
            key="invite"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="glass-effect rounded-2xl p-8 text-center"
          >
            <p className="text-gray-500 mb-6">把邀请码发给你的另一半</p>

            <div className="relative mb-6">
              <div className="text-5xl font-mono font-bold tracking-[0.3em] text-pink-600 py-6">
                {inviteCode}
              </div>
              <button
                onClick={handleCopy}
                className="absolute top-1/2 right-4 -translate-y-1/2 p-2 text-gray-400 hover:text-pink-500 transition-colors"
              >
                {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>

            {expiresAt && (
              <p className="text-xs text-gray-400 mb-6">
                有效期至 {new Date(expiresAt).toLocaleString('zh-CN')}
              </p>
            )}

            <button
              onClick={handleCancelInvite}
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              取消邀请
            </button>
          </motion.div>
        )}

        {mode === 'accept' && (
          <motion.div
            key="accept"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="glass-effect rounded-2xl p-8"
          >
            <p className="text-gray-500 mb-6 text-center">输入对方发给你的6位邀请码</p>

            <input
              type="text"
              value={inputCode}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, '').slice(0, 6)
                setInputCode(v)
                setError('')
              }}
              placeholder="输入6位数字"
              maxLength={6}
              className="w-full text-center text-3xl font-mono font-bold tracking-[0.3em] py-4 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 mb-4"
              autoFocus
            />

            <button
              onClick={handleAccept}
              disabled={loading || inputCode.length !== 6}
              className="w-full py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-medium hover:from-pink-600 hover:to-rose-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Heart className="w-5 h-5" />}
              配对
            </button>

            <button
              onClick={() => { setMode('idle'); setError(''); setInputCode('') }}
              className="w-full mt-3 py-2 text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              返回
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 text-sm text-red-500 text-center"
        >
          {error}
        </motion.p>
      )}
    </div>
  )
}
