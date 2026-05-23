// 用户类型
export interface User {
  id: string
  username: string
  nickname: string
  avatar?: string
  anniversaryDate?: string
  createdAt: string
  updatedAt: string
}

// 照片类型
export interface Photo {
  id: string
  filename: string
  originalUrl: string
  largeUrl: string
  mediumUrl: string
  thumbnailUrl: string
  fileSize: number
  width: number
  height: number
  takenAt?: string
  location?: string
  latitude?: number
  longitude?: number
  mood?: string
  mood2?: string
  secretMessage?: string
  tags: string[]
  blurhash?: string
  sortOrder: number
  albumId?: string
  uploadedBy: string
  createdAt: string
  updatedAt: string
}

// 相册类型
export interface Album {
  id: string
  name: string
  description?: string
  coverUrl?: string
  sortOrder: number
  createdBy: string
  createdAt: string
  updatedAt: string
  photos?: Photo[]
}

// 评论类型
export interface Comment {
  id: string
  content: string
  photoId: string
  userId: string
  user?: User
  createdAt: string
  updatedAt: string
}

// 分享链接类型
export interface ShareLink {
  id: string
  token: string
  pinCode?: string
  expiresAt?: string
  maxViews?: number
  viewCount: number
  isActive: boolean
  createdBy: string
  createdAt: string
}

// 布局模式
export type LayoutMode =
  | 'masonry'
  | 'grid'
  | 'timeline'
  | 'free-canvas'
  | 'stack'
  | 'polaroid'
  | 'filmstrip'
  | 'collage'
  | 'heart'
  | 'carousel-3d'
  | 'map'
  | 'story'

// 动画效果
export type AnimationEffect =
  | 'fluid-enter'
  | 'flip-3d'
  | 'parallax'
  | 'magnetic-drag'
  | 'stack-expand'
  | 'elastic-zoom'
  | 'inertia-slide'
  | 'ripple'
  | 'ken-burns'
  | 'polaroid-scatter'
  | 'film-scroll'
  | 'heartbeat'
  | 'love-letter'
  | 'memory-corridor'
  | 'photo-booth'
  | 'petal-fall'
  | 'starry-night'
  | 'polaroid-flip'
  | 'cinematic-wipe'
  | 'dissolve'
  | 'floating-hearts'
  | 'soft-glow'
  | 'touch-ripple'
  | 'drag-trail'
  | 'zoom-shake'

// 心情标签
export type Mood =
  | 'happy'
  | 'love'
  | 'excited'
  | 'peaceful'
  | 'grateful'
  | 'nostalgic'
  | 'adventurous'
  | 'cozy'
  | 'playful'
  | 'romantic'

// API 响应类型
export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

// 分页参数
export interface PaginationParams {
  page: number
  limit: number
}

// 分页响应
export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}
