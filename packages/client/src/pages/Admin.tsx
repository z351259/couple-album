import { useState, useEffect } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Users, Image, FolderOpen, MessageCircle, Share2,
  Trash2, Shield, Key, ArrowLeft, RefreshCw, Eye, ChevronDown, ChevronUp,
  HardDrive, UserX, Link2
} from 'lucide-react'
import useStore from '@/stores/useStore'
import { adminApi } from '@/services/api'

type Tab = 'dashboard' | 'users' | 'photos' | 'albums' | 'comments' | 'shares'

const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: 'dashboard', label: '仪表盘', icon: <LayoutDashboard className="w-4 h-4" /> },
  { key: 'users', label: '用户', icon: <Users className="w-4 h-4" /> },
  { key: 'photos', label: '照片', icon: <Image className="w-4 h-4" /> },
  { key: 'albums', label: '相册', icon: <FolderOpen className="w-4 h-4" /> },
  { key: 'comments', label: '评论', icon: <MessageCircle className="w-4 h-4" /> },
  { key: 'shares', label: '分享', icon: <Share2 className="w-4 h-4" /> },
]

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
}

export default function Admin() {
  const { user, isAuthenticated } = useStore()
  const [activeTab, setActiveTab] = useState<Tab>('dashboard')
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState<any>(null)
  const [users, setUsers] = useState<any[]>([])
  const [photos, setPhotos] = useState<any>({ items: [], total: 0 })
  const [albums, setAlbums] = useState<any[]>([])
  const [comments, setComments] = useState<any>({ items: [], total: 0 })
  const [shares, setShares] = useState<any[]>([])

  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (user?.role !== 'admin') {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-600 mb-2">需要管理员权限</h1>
        <p className="text-gray-400 mb-6">你的账号没有管理后台访问权限</p>
        <Link to="/" className="text-pink-500 hover:text-pink-600">返回首页</Link>
      </div>
    )
  }

  const loadData = async (tab: Tab) => {
    setLoading(true)
    try {
      switch (tab) {
        case 'dashboard':
          const s = await adminApi.getStats()
          if (s.success) setStats(s.data)
          break
        case 'users':
          const u = await adminApi.getUsers()
          if (u.success) setUsers(u.data || [])
          break
        case 'photos':
          const p = await adminApi.getPhotos({ page: 1, limit: 50 })
          if (p.success) setPhotos(p.data)
          break
        case 'albums':
          const a = await adminApi.getAlbums()
          if (a.success) setAlbums(a.data || [])
          break
        case 'comments':
          const c = await adminApi.getComments({ page: 1, limit: 50 })
          if (c.success) setComments(c.data)
          break
        case 'shares':
          const sh = await adminApi.getShares()
          if (sh.success) setShares(sh.data || [])
          break
      }
    } catch (e) {
      console.error('加载数据失败:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData(activeTab)
  }, [activeTab])

  const handleDelete = async (type: string, id: string) => {
    if (!confirm('确定要删除吗？此操作不可撤销。')) return
    try {
      switch (type) {
        case 'user': await adminApi.deleteUser(id); break
        case 'photo': await adminApi.deletePhoto(id); break
        case 'album': await adminApi.deleteAlbum(id); break
        case 'comment': await adminApi.deleteComment(id); break
        case 'share': await adminApi.deleteShare(id); break
      }
      loadData(activeTab)
    } catch (e) {
      console.error('删除失败:', e)
    }
  }

  const handleRoleToggle = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin'
    if (!confirm(`确定要将此用户角色更改为 ${newRole} 吗？`)) return
    try {
      await adminApi.updateUserRole(userId, newRole)
      loadData('users')
    } catch (e) {
      console.error('更新角色失败:', e)
    }
  }

  const handleResetPassword = async (userId: string) => {
    const password = prompt('请输入新密码（至少4位）:')
    if (!password || password.length < 4) return
    try {
      await adminApi.resetPassword(userId, password)
      alert('密码已重置')
    } catch (e) {
      console.error('重置密码失败:', e)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/" className="p-2 text-gray-500 hover:text-pink-500 hover:bg-pink-50 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gradient">管理后台</h1>
      </div>

      {/* Tab 栏 */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.key
                ? 'bg-pink-500 text-white'
                : 'text-gray-500 hover:text-pink-500 hover:bg-pink-50'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
        <button
          onClick={() => loadData(activeTab)}
          className="ml-auto p-2 text-gray-400 hover:text-pink-500 transition-colors"
          title="刷新"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* 内容区域 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          {activeTab === 'dashboard' && <DashboardTab stats={stats} />}
          {activeTab === 'users' && (
            <UsersTab
              users={users}
              currentUserId={user?.id}
              onDelete={(id) => handleDelete('user', id)}
              onRoleToggle={handleRoleToggle}
              onResetPassword={handleResetPassword}
            />
          )}
          {activeTab === 'photos' && (
            <PhotosTab photos={photos} onDelete={(id) => handleDelete('photo', id)} />
          )}
          {activeTab === 'albums' && (
            <AlbumsTab albums={albums} onDelete={(id) => handleDelete('album', id)} />
          )}
          {activeTab === 'comments' && (
            <CommentsTab comments={comments} onDelete={(id) => handleDelete('comment', id)} />
          )}
          {activeTab === 'shares' && (
            <SharesTab shares={shares} onDelete={(id) => handleDelete('share', id)} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// ============ 仪表盘 ============
function DashboardTab({ stats }: { stats: any }) {
  if (!stats) return <div className="text-center py-12 text-gray-400">加载中...</div>

  const cards = [
    { label: '用户数', value: stats.users, icon: <Users className="w-6 h-6" />, color: 'bg-blue-50 text-blue-600' },
    { label: '照片数', value: stats.photos, icon: <Image className="w-6 h-6" />, color: 'bg-pink-50 text-pink-600' },
    { label: '相册数', value: stats.albums, icon: <FolderOpen className="w-6 h-6" />, color: 'bg-purple-50 text-purple-600' },
    { label: '评论数', value: stats.comments, icon: <MessageCircle className="w-6 h-6" />, color: 'bg-green-50 text-green-600' },
    { label: '分享链接', value: stats.shareLinks, icon: <Share2 className="w-6 h-6" />, color: 'bg-orange-50 text-orange-600' },
    { label: '存储用量', value: formatSize(stats.totalFileSize), icon: <HardDrive className="w-6 h-6" />, color: 'bg-gray-50 text-gray-600' },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {cards.map((card) => (
        <div key={card.label} className="glass-effect rounded-xl p-5">
          <div className={`inline-flex p-2 rounded-lg ${card.color} mb-3`}>{card.icon}</div>
          <div className="text-2xl font-bold text-gray-800">{card.value}</div>
          <div className="text-sm text-gray-400">{card.label}</div>
        </div>
      ))}
    </div>
  )
}

// ============ 用户管理 ============
function UsersTab({ users, currentUserId, onDelete, onRoleToggle, onResetPassword }: {
  users: any[]; currentUserId?: string;
  onDelete: (id: string) => void; onRoleToggle: (id: string, role: string) => void; onResetPassword: (id: string) => void
}) {
  return (
    <div className="space-y-3">
      {users.map((u) => (
        <div key={u.id} className="glass-effect rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-pink-200 flex items-center justify-center flex-shrink-0">
            <span className="text-sm text-pink-600">{u.nickname?.[0] || '?'}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-800">{u.nickname}</span>
              <span className="text-xs text-gray-400">@{u.username}</span>
              {u.role === 'admin' && (
                <span className="px-2 py-0.5 bg-pink-100 text-pink-600 text-xs rounded-full">管理员</span>
              )}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {u._count?.photos || 0} 张照片 · {u._count?.albums || 0} 个相册 · {u._count?.comments || 0} 条评论
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onRoleToggle(u.id, u.role)}
              className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
              title={u.role === 'admin' ? '取消管理员' : '设为管理员'}
            >
              <Shield className="w-4 h-4" />
            </button>
            <button
              onClick={() => onResetPassword(u.id)}
              className="p-2 text-gray-400 hover:text-orange-500 transition-colors"
              title="重置密码"
            >
              <Key className="w-4 h-4" />
            </button>
            {u.id !== currentUserId && (
              <button
                onClick={() => onDelete(u.id)}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                title="删除用户"
              >
                <UserX className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ))}
      {users.length === 0 && <div className="text-center py-12 text-gray-400">暂无用户</div>}
    </div>
  )
}

// ============ 照片管理 ============
function PhotosTab({ photos, onDelete }: { photos: any; onDelete: (id: string) => void }) {
  return (
    <div>
      <div className="text-sm text-gray-400 mb-3">共 {photos.total || 0} 张照片</div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {(photos.items || []).map((p: any) => (
          <div key={p.id} className="group relative glass-effect rounded-xl overflow-hidden">
            <img
              src={p.thumbnailUrl ? `http://localhost:3001${p.thumbnailUrl}` : ''}
              alt=""
              className="w-full aspect-square object-cover"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
              <button
                onClick={() => onDelete(p.id)}
                className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
              <div className="text-xs text-white truncate">{p.filename}</div>
              <div className="text-xs text-white/60">{p.user?.nickname}</div>
            </div>
          </div>
        ))}
      </div>
      {(photos.items || []).length === 0 && <div className="text-center py-12 text-gray-400">暂无照片</div>}
    </div>
  )
}

// ============ 相册管理 ============
function AlbumsTab({ albums, onDelete }: { albums: any[]; onDelete: (id: string) => void }) {
  return (
    <div className="space-y-3">
      {albums.map((a) => (
        <div key={a.id} className="glass-effect rounded-xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
            <FolderOpen className="w-6 h-6 text-purple-500" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-gray-800">{a.name}</div>
            <div className="text-xs text-gray-400">
              {a.description || '无描述'} · {a._count?.photos || 0} 张照片 · 创建者: {a.user?.nickname}
            </div>
          </div>
          <button
            onClick={() => onDelete(a.id)}
            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
            title="删除相册"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
      {albums.length === 0 && <div className="text-center py-12 text-gray-400">暂无相册</div>}
    </div>
  )
}

// ============ 评论管理 ============
function CommentsTab({ comments, onDelete }: { comments: any; onDelete: (id: string) => void }) {
  return (
    <div>
      <div className="text-sm text-gray-400 mb-3">共 {comments.total || 0} 条评论</div>
      <div className="space-y-3">
        {(comments.items || []).map((c: any) => (
          <div key={c.id} className="glass-effect rounded-xl p-4 flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <span className="text-xs text-green-600">{c.user?.nickname?.[0] || '?'}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-gray-700">{c.user?.nickname}</span>
                <span className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleString('zh-CN')}</span>
              </div>
              <p className="text-sm text-gray-600">{c.content}</p>
              {c.photo && (
                <div className="text-xs text-gray-400 mt-1">照片: {c.photo.filename}</div>
              )}
            </div>
            <button
              onClick={() => onDelete(c.id)}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
      {(comments.items || []).length === 0 && <div className="text-center py-12 text-gray-400">暂无评论</div>}
    </div>
  )
}

// ============ 分享管理 ============
function SharesTab({ shares, onDelete }: { shares: any[]; onDelete: (id: string) => void }) {
  return (
    <div className="space-y-3">
      {shares.map((s) => (
        <div key={s.id} className="glass-effect rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
            <Link2 className="w-5 h-5 text-orange-500" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm text-gray-600">{s.token.substring(0, 8)}...</span>
              {!s.isActive && <span className="px-2 py-0.5 bg-red-100 text-red-500 text-xs rounded-full">已停用</span>}
              {s.isActive && <span className="px-2 py-0.5 bg-green-100 text-green-500 text-xs rounded-full">有效</span>}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              访问 {s.viewCount} 次{s.maxViews ? ` / 上限 ${s.maxViews}` : ''}
              {s.expiresAt ? ` · 过期: ${new Date(s.expiresAt).toLocaleDateString('zh-CN')}` : ' · 永不过期'}
              {s.pinCode ? ' · 有PIN码' : ''}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {s.isActive && (
              <button
                onClick={async () => { await adminApi.deactivateShare(s.id); }}
                className="p-2 text-gray-400 hover:text-orange-500 transition-colors"
                title="停用"
              >
                <Eye className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => onDelete(s.id)}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
              title="删除"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
      {shares.length === 0 && <div className="text-center py-12 text-gray-400">暂无分享链接</div>}
    </div>
  )
}
