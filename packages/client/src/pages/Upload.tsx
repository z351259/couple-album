import { useState, useCallback, useEffect } from 'react'
import { useNavigate, Navigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload as UploadIcon, X, Image, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react'
import useStore from '@/stores/useStore'
import { photoApi } from '@/services/api'

interface UploadFile {
  file: File
  preview: string
  progress: number
  status: 'pending' | 'uploading' | 'success' | 'error'
  error?: string
}

export default function Upload() {
  const [files, setFiles] = useState<UploadFile[]>([])
  const [dragActive, setDragActive] = useState(false)
  const { isAuthenticated, addPhoto } = useStore()
  const navigate = useNavigate()

  // 处理拖拽
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  // 处理文件选择
  const handleFiles = useCallback((selectedFiles: FileList | null) => {
    if (!selectedFiles) return

    const newFiles: UploadFile[] = Array.from(selectedFiles)
      .filter((file) => file.type.startsWith('image/'))
      .map((file) => ({
        file,
        preview: URL.createObjectURL(file),
        progress: 0,
        status: 'pending' as const,
      }))

    setFiles((prev) => [...prev, ...newFiles])
  }, [])

  // 处理拖放
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    handleFiles(e.dataTransfer.files)
  }, [handleFiles])

  // 移除文件
  const removeFile = (index: number) => {
    setFiles((prev) => {
      const newFiles = [...prev]
      URL.revokeObjectURL(newFiles[index].preview)
      newFiles.splice(index, 1)
      return newFiles
    })
  }

  // 上传单个文件
  const uploadFile = async (index: number) => {
    const file = files[index]
    if (!file) return

    const formData = new FormData()
    formData.append('photo', file.file)

    setFiles((prev) => {
      const newFiles = [...prev]
      newFiles[index] = { ...newFiles[index], status: 'uploading' }
      return newFiles
    })

    try {
      const res = await photoApi.upload(formData, (progress) => {
        setFiles((prev) => {
          const newFiles = [...prev]
          newFiles[index] = { ...newFiles[index], progress }
          return newFiles
        })
      })

      if (res.success && res.data) {
        setFiles((prev) => {
          const newFiles = [...prev]
          newFiles[index] = { ...newFiles[index], status: 'success', progress: 100 }
          return newFiles
        })
        addPhoto(res.data)
      } else {
        throw new Error(res.error || '上传失败')
      }
    } catch (error: any) {
      setFiles((prev) => {
        const newFiles = [...prev]
        newFiles[index] = {
          ...newFiles[index],
          status: 'error',
          error: error.message || '上传失败',
        }
        return newFiles
      })
    }
  }

  // 上传所有文件
  const uploadAll = async () => {
    const pendingIndices = files
      .map((f, i) => (f.status === 'pending' ? i : -1))
      .filter((i) => i !== -1)

    // 并发上传，最多3个
    const concurrency = 3
    for (let i = 0; i < pendingIndices.length; i += concurrency) {
      const batch = pendingIndices.slice(i, i + concurrency)
      await Promise.all(batch.map((idx) => uploadFile(idx)))
    }
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-4 mb-8">
          <Link
            to="/"
            className="p-2 text-gray-500 hover:text-pink-500 hover:bg-pink-50 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-3xl font-bold text-gradient">上传照片</h1>
        </div>

        {/* 拖拽区域 */}
        <div
          className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-colors ${
            dragActive
              ? 'border-pink-500 bg-pink-50'
              : 'border-pink-200 hover:border-pink-300'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => handleFiles(e.target.files)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />

          <motion.div
            animate={dragActive ? { scale: 1.1 } : { scale: 1 }}
            className="flex flex-col items-center"
          >
            <UploadIcon className="w-16 h-16 text-pink-400 mb-4" />
            <p className="text-lg text-gray-600 mb-2">
              拖拽照片到这里，或点击选择文件
            </p>
            <p className="text-sm text-gray-400">
              支持 JPG、PNG、WebP 等格式，单张照片最大 50MB
            </p>
          </motion.div>
        </div>

        {/* 上传成功后查看相册 */}
        {files.some((f) => f.status === 'success') && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 text-center"
          >
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-pink-500 text-white rounded-xl hover:bg-pink-600 transition-colors"
            >
              查看相册
            </Link>
          </motion.div>
        )}

        {/* 文件列表 */}
        {files.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                已选择 {files.length} 张照片
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setFiles([])}
                  className="px-4 py-2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  清空
                </button>
                <button
                  onClick={uploadAll}
                  disabled={files.every((f) => f.status !== 'pending')}
                  className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  全部上传
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <AnimatePresence>
                {files.map((file, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex items-center gap-4 p-4 glass-effect rounded-xl"
                  >
                    {/* 预览图 */}
                    <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={file.preview}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* 文件信息 */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {file.file.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {(file.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>

                      {/* 进度条 */}
                      {file.status === 'uploading' && (
                        <div className="mt-2 h-2 bg-pink-100 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${file.progress}%` }}
                            className="h-full bg-gradient-to-r from-pink-500 to-rose-500"
                          />
                        </div>
                      )}

                      {/* 状态 */}
                      {file.status === 'success' && (
                        <p className="mt-1 text-xs text-green-500 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          上传成功
                        </p>
                      )}
                      {file.status === 'error' && (
                        <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {file.error}
                        </p>
                      )}
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex items-center gap-2">
                      {file.status === 'pending' && (
                        <button
                          onClick={() => uploadFile(index)}
                          className="px-3 py-1 text-sm bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
                        >
                          上传
                        </button>
                      )}
                      {file.status === 'error' && (
                        <button
                          onClick={() => uploadFile(index)}
                          className="px-3 py-1 text-sm bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
                        >
                          重试
                        </button>
                      )}
                      <button
                        onClick={() => removeFile(index)}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
