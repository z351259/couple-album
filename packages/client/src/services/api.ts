import axios from 'axios'
import type { ApiResponse, PaginatedResponse, Photo, Album, Comment, ShareLink, User } from '@/types'
import { toast } from '@/components/common/Toast'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api`
    : '/api',
  timeout: 30000,
})

// 请求拦截器 - 添加 token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 响应拦截器 - 处理错误
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const isOnLoginPage = window.location.pathname === '/login'

    if (error.response?.status === 401 && !isOnLoginPage) {
      localStorage.removeItem('token')
      toast.error('登录已过期，请重新登录')
      setTimeout(() => {
        window.location.href = '/login'
      }, 1000)
    } else if (error.response?.status >= 500) {
      toast.error('服务器错误，请稍后重试')
    }

    return Promise.reject(error.response?.data || error)
  }
)

// 认证 API
export const authApi = {
  login: (username: string, password: string): Promise<ApiResponse<{ token: string; user: User }>> =>
    api.post('/auth/login', { username, password }),

  register: (username: string, password: string, nickname: string): Promise<ApiResponse<{ token: string; user: User }>> =>
    api.post('/auth/register', { username, password, nickname }),

  getProfile: (): Promise<ApiResponse<User>> =>
    api.get('/auth/profile'),

  updateProfile: (data: { nickname?: string; avatar?: string; anniversaryDate?: string | null }): Promise<ApiResponse<User>> =>
    api.put('/auth/profile', data),
}

// 照片 API
export const photoApi = {
  getAll: (params?: { page?: number; limit?: number; albumId?: string }): Promise<ApiResponse<PaginatedResponse<Photo>>> =>
    api.get('/photos', { params }),

  getById: (id: string): Promise<ApiResponse<Photo>> =>
    api.get(`/photos/${id}`),

  upload: (formData: FormData, onProgress?: (progress: number) => void): Promise<ApiResponse<Photo>> =>
    api.post('/photos/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          onProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total))
        }
      },
    }),

  update: (id: string, data: Partial<Photo>): Promise<ApiResponse<Photo>> =>
    api.put(`/photos/${id}`, data),

  delete: (id: string): Promise<ApiResponse<void>> =>
    api.delete(`/photos/${id}`),

  updateSortOrder: (photos: { id: string; sortOrder: number }[]): Promise<ApiResponse<void>> =>
    api.put('/photos/sort', { photos }),

  recordVisit: (id: string): Promise<ApiResponse<any>> =>
    api.post(`/photos/${id}/visit`),

  getVisits: (id: string): Promise<ApiResponse<any[]>> =>
    api.get(`/photos/${id}/visits`),
}

// 相册 API
export const albumApi = {
  getAll: (): Promise<ApiResponse<Album[]>> =>
    api.get('/albums'),

  getById: (id: string): Promise<ApiResponse<Album>> =>
    api.get(`/albums/${id}`),

  create: (data: { name: string; description?: string }): Promise<ApiResponse<Album>> =>
    api.post('/albums', data),

  update: (id: string, data: Partial<Album>): Promise<ApiResponse<Album>> =>
    api.put(`/albums/${id}`, data),

  delete: (id: string): Promise<ApiResponse<void>> =>
    api.delete(`/albums/${id}`),
}

// 评论 API
export const commentApi = {
  getByPhoto: (photoId: string): Promise<ApiResponse<Comment[]>> =>
    api.get(`/comments/photo/${photoId}`),

  create: (data: { content: string; photoId: string }): Promise<ApiResponse<Comment>> =>
    api.post('/comments', data),

  delete: (id: string): Promise<ApiResponse<void>> =>
    api.delete(`/comments/${id}`),
}

// 分享 API
export const shareApi = {
  create: (data: { photoIds?: string[]; albumId?: string; pinCode?: string; expiresIn?: number; maxViews?: number }): Promise<ApiResponse<ShareLink>> =>
    api.post('/shares', data),

  getByToken: (token: string, pinCode?: string): Promise<ApiResponse<{ photos: Photo[]; album?: Album }>> =>
    api.get(`/shares/${token}`, { params: { pinCode } }),

  deactivate: (id: string): Promise<ApiResponse<void>> =>
    api.put(`/shares/${id}/deactivate`),
}

// 收藏 API
export const favoriteApi = {
  getAll: (): Promise<ApiResponse<Photo[]>> =>
    api.get('/favorites'),

  add: (photoId: string): Promise<ApiResponse<any>> =>
    api.post(`/favorites/${photoId}`),

  remove: (photoId: string): Promise<ApiResponse<void>> =>
    api.delete(`/favorites/${photoId}`),

  check: (photoId: string): Promise<ApiResponse<{ isFavorited: boolean }>> =>
    api.get(`/favorites/check/${photoId}`),
}

// 情侣配对 API
export const coupleApi = {
  createInvite: (): Promise<ApiResponse<{ code: string; expiresAt: string }>> =>
    api.post('/couple/invite'),

  getInvite: (): Promise<ApiResponse<{ code: string; expiresAt: string } | null>> =>
    api.get('/couple/invite'),

  cancelInvite: (): Promise<ApiResponse<void>> =>
    api.delete('/couple/invite'),

  acceptInvite: (code: string): Promise<ApiResponse<{ coupleId: string; partnerId: string }>> =>
    api.post('/couple/accept', { code }),

  getPartner: (): Promise<ApiResponse<{ id: string; username: string; nickname: string; avatar?: string } | null>> =>
    api.get('/couple/partner'),

  unlink: (): Promise<ApiResponse<void>> =>
    api.delete('/couple/unlink'),
}

// 管理后台 API
export const adminApi = {
  getStats: (): Promise<ApiResponse<{ users: number; photos: number; albums: number; comments: number; shareLinks: number; totalFileSize: number }>> =>
    api.get('/admin/stats'),

  getUsers: (): Promise<ApiResponse<any[]>> =>
    api.get('/admin/users'),

  updateUserRole: (id: string, role: string): Promise<ApiResponse<any>> =>
    api.put(`/admin/users/${id}/role`, { role }),

  resetPassword: (id: string, password: string): Promise<ApiResponse<void>> =>
    api.put(`/admin/users/${id}/password`, { password }),

  deleteUser: (id: string): Promise<ApiResponse<void>> =>
    api.delete(`/admin/users/${id}`),

  getPhotos: (params?: { page?: number; limit?: number }): Promise<ApiResponse<PaginatedResponse<Photo>>> =>
    api.get('/admin/photos', { params }),

  deletePhoto: (id: string): Promise<ApiResponse<void>> =>
    api.delete(`/admin/photos/${id}`),

  getAlbums: (): Promise<ApiResponse<any[]>> =>
    api.get('/admin/albums'),

  deleteAlbum: (id: string): Promise<ApiResponse<void>> =>
    api.delete(`/admin/albums/${id}`),

  getComments: (params?: { page?: number; limit?: number }): Promise<ApiResponse<PaginatedResponse<Comment>>> =>
    api.get('/admin/comments', { params }),

  deleteComment: (id: string): Promise<ApiResponse<void>> =>
    api.delete(`/admin/comments/${id}`),

  getShares: (): Promise<ApiResponse<any[]>> =>
    api.get('/admin/shares'),

  deactivateShare: (id: string): Promise<ApiResponse<void>> =>
    api.put(`/admin/shares/${id}/deactivate`),

  deleteShare: (id: string): Promise<ApiResponse<void>> =>
    api.delete(`/admin/shares/${id}`),
}

export default api
