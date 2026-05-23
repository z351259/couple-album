import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Copy, Check, Link, Clock, Eye, Lock } from 'lucide-react'
import { shareApi } from '@/services/api'
import { toast } from '@/components/common/Toast'

interface ShareDialogProps {
  isOpen: boolean
  onClose: () => void
  albumId?: string
  photoIds?: string[]
}

export default function ShareDialog({ isOpen, onClose, albumId, photoIds }: ShareDialogProps) {
  const [pinCode, setPinCode] = useState('')
  const [expiresIn, setExpiresIn] = useState<number>(24)
  const [maxViews, setMaxViews] = useState<number>(0)
  const [shareLink, setShareLink] = useState<string>('')
  const [creating, setCreating] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCreate = async () => {
    setCreating(true)
    try {
      const res = await shareApi.create({
        albumId,
        photoIds,
        pinCode: pinCode || undefined,
        expiresIn,
        maxViews: maxViews || undefined,
      })

      if (res.success && res.data) {
        const link = `${window.location.origin}/share/${res.data.token}`
        setShareLink(link)
        toast.success('分享链接已创建')
      }
    } catch (error) {
      console.error('创建分享链接失败:', error)
      toast.error('创建分享链接失败')
    } finally {
      setCreating(false)
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareLink)
      setCopied(true)
      toast.success('链接已复制')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('复制失败:', error)
    }
  }

  const handleClose = () => {
    setShareLink('')
    setPinCode('')
    setExpiresIn(24)
    setMaxViews(0)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Link className="w-5 h-5 text-pink-500" />
                创建分享链接
              </h3>
              <button
                onClick={handleClose}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!shareLink ? (
              <>
                {/* PIN 码 */}
                <div className="mb-4">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Lock className="w-4 h-4" />
                    PIN 码（可选）
                  </label>
                  <input
                    type="text"
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value)}
                    placeholder="设置4-6位数字PIN码"
                    maxLength={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>

                {/* 有效期 */}
                <div className="mb-4">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Clock className="w-4 h-4" />
                    有效期
                  </label>
                  <select
                    value={expiresIn}
                    onChange={(e) => setExpiresIn(Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  >
                    <option value={1}>1 小时</option>
                    <option value={6}>6 小时</option>
                    <option value={24}>1 天</option>
                    <option value={72}>3 天</option>
                    <option value={168}>7 天</option>
                    <option value={0}>永不过期</option>
                  </select>
                </div>

                {/* 最大访问次数 */}
                <div className="mb-6">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Eye className="w-4 h-4" />
                    最大访问次数（0表示不限制）
                  </label>
                  <input
                    type="number"
                    value={maxViews}
                    onChange={(e) => setMaxViews(Number(e.target.value))}
                    min={0}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>

                {/* 创建按钮 */}
                <button
                  onClick={handleCreate}
                  disabled={creating}
                  className="w-full py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg hover:from-pink-600 hover:to-rose-600 transition-all disabled:opacity-50"
                >
                  {creating ? '创建中...' : '创建分享链接'}
                </button>
              </>
            ) : (
              <>
                {/* 分享链接 */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    分享链接
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={shareLink}
                      readOnly
                      className="flex-1 px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg"
                    />
                    <button
                      onClick={handleCopy}
                      className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
                    >
                      {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* 提示信息 */}
                <div className="p-4 bg-pink-50 rounded-lg mb-4">
                  <p className="text-sm text-pink-700">
                    {pinCode
                      ? `已设置PIN码：${pinCode}，分享时需要告知对方`
                      : '未设置PIN码，任何人可通过链接查看'}
                  </p>
                  <p className="text-sm text-pink-600 mt-1">
                    有效期：{expiresIn === 0 ? '永不过期' : `${expiresIn} 小时`}
                  </p>
                </div>

                {/* 关闭按钮 */}
                <button
                  onClick={handleClose}
                  className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  完成
                </button>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
