import { create } from 'zustand'
import type { User, Photo, Album, LayoutMode, AnimationEffect } from '@/types'

interface AppState {
  // 用户状态
  user: User | null
  token: string | null
  isAuthenticated: boolean

  // 照片状态
  photos: Photo[]
  currentPhoto: Photo | null
  selectedPhotos: string[]

  // 相册状态
  albums: Album[]
  currentAlbum: Album | null

  // UI 状态
  layoutMode: LayoutMode
  animationEffect: AnimationEffect
  isUploading: boolean
  uploadProgress: number
  showPhotoViewer: boolean
  showShareDialog: boolean
  sidebarOpen: boolean

  // 操作
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  logout: () => void
  setPhotos: (photos: Photo[]) => void
  addPhoto: (photo: Photo) => void
  removePhoto: (id: string) => void
  updatePhoto: (id: string, data: Partial<Photo>) => void
  setCurrentPhoto: (photo: Photo | null) => void
  toggleSelectPhoto: (id: string) => void
  clearSelectedPhotos: () => void
  setAlbums: (albums: Album[]) => void
  setCurrentAlbum: (album: Album | null) => void
  setLayoutMode: (mode: LayoutMode) => void
  setAnimationEffect: (effect: AnimationEffect) => void
  setIsUploading: (isUploading: boolean) => void
  setUploadProgress: (progress: number) => void
  setShowPhotoViewer: (show: boolean) => void
  setShowShareDialog: (show: boolean) => void
  setSidebarOpen: (open: boolean) => void
}

const useStore = create<AppState>((set) => ({
  // 初始状态
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),

  photos: [],
  currentPhoto: null,
  selectedPhotos: [],

  albums: [],
  currentAlbum: null,

  layoutMode: 'masonry',
  animationEffect: 'fluid-enter',
  isUploading: false,
  uploadProgress: 0,
  showPhotoViewer: false,
  showShareDialog: false,
  sidebarOpen: false,

  // 用户操作
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setToken: (token) => {
    if (token) {
      localStorage.setItem('token', token)
    } else {
      localStorage.removeItem('token')
    }
    set({ token, isAuthenticated: !!token })
  },
  logout: () => {
    localStorage.removeItem('token')
    set({ user: null, token: null, isAuthenticated: false })
  },

  // 照片操作
  setPhotos: (photos) => set({ photos }),
  addPhoto: (photo) => set((state) => ({ photos: [photo, ...state.photos] })),
  removePhoto: (id) => set((state) => ({
    photos: state.photos.filter((p) => p.id !== id),
    selectedPhotos: state.selectedPhotos.filter((pid) => pid !== id),
  })),
  updatePhoto: (id, data) => set((state) => ({
    photos: state.photos.map((p) => (p.id === id ? { ...p, ...data } : p)),
  })),
  setCurrentPhoto: (photo) => set({ currentPhoto: photo }),
  toggleSelectPhoto: (id) => set((state) => ({
    selectedPhotos: state.selectedPhotos.includes(id)
      ? state.selectedPhotos.filter((pid) => pid !== id)
      : [...state.selectedPhotos, id],
  })),
  clearSelectedPhotos: () => set({ selectedPhotos: [] }),

  // 相册操作
  setAlbums: (albums) => set({ albums }),
  setCurrentAlbum: (album) => set({ currentAlbum: album }),

  // UI 操作
  setLayoutMode: (mode) => set({ layoutMode: mode }),
  setAnimationEffect: (effect) => set({ animationEffect: effect }),
  setIsUploading: (isUploading) => set({ isUploading }),
  setUploadProgress: (progress) => set({ uploadProgress: progress }),
  setShowPhotoViewer: (show) => set({ showPhotoViewer: show }),
  setShowShareDialog: (show) => set({ showShareDialog: show }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}))

export default useStore
