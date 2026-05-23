import { Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Header from './components/layout/Header'
import ToastContainer from './components/common/Toast'
import ErrorBoundary from './components/common/ErrorBoundary'
import Home from './pages/Home'
import Album from './pages/Album'
import Upload from './pages/Upload'
import Share from './pages/Share'
import Login from './pages/Login'
import Admin from './pages/Admin'

function App() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50">
        <Header />
        <ToastContainer />
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/album/:id" element={<Album />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/share/:token" element={<Share />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </AnimatePresence>
      </div>
    </ErrorBoundary>
  )
}

export default App
