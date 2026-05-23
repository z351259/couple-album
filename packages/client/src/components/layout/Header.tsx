import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heart, Upload, LogOut, Menu, X, Settings } from 'lucide-react'
import useStore from '@/stores/useStore'
import MobileMenu from './MobileMenu'

export default function Header() {
  const { isAuthenticated, user, logout, sidebarOpen, setSidebarOpen } = useStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="sticky top-0 z-50 glass-effect border-b border-pink-100"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Heart className="w-8 h-8 text-pink-500 fill-pink-500" />
              </motion.div>
              <span className="text-xl font-bold text-gradient hidden sm:block">
                我们的相册
              </span>
            </Link>

            {/* 导航按钮 */}
            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/upload"
                    className="flex items-center gap-2 px-4 py-2 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    <span className="hidden sm:block">上传照片</span>
                  </Link>

                  <div className="flex items-center gap-2">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.nickname}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-pink-200 flex items-center justify-center">
                        <span className="text-sm text-pink-600">
                          {user?.nickname?.[0] || '?'}
                        </span>
                      </div>
                    )}
                    <span className="text-sm text-gray-600 hidden sm:block">
                      {user?.nickname}
                    </span>
                  </div>

                  {user?.role === 'admin' && (
                    <Link
                      to="/admin"
                      className="p-2 text-gray-500 hover:text-pink-500 transition-colors"
                      title="管理后台"
                    >
                      <Settings className="w-5 h-5" />
                    </Link>
                  )}

                  <button
                    onClick={handleLogout}
                    className="p-2 text-gray-500 hover:text-pink-500 transition-colors"
                    title="退出登录"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="px-4 py-2 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition-colors"
                >
                  登录
                </Link>
              )}

              {/* 移动端菜单按钮 */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 text-gray-500 hover:text-pink-500"
              >
                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      <MobileMenu isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </>
  )
}
