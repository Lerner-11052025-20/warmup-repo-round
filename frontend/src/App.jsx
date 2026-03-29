import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from './contexts/ThemeContext'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import DashboardPage from './pages/DashboardPage'

import LandingPage from './pages/LandingPage'
import ProfilePage from './pages/ProfilePage'
import ChatAssistant from './components/ChatAssistant'

// Protected Route wrapper
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950"><div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>
  if (!user) return <Navigate to="/login" replace />
  return children
}

// Guest Route wrapper (redirect to dashboard if logged in)
function GuestRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950"><div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>
  if (user) return <Navigate to="/dashboard" replace />
  return children
}

// Protected Wrapper for Chat 
function ChatWrapper() {
  const { user } = useAuth()
  if (!user) return null
  return <ChatAssistant />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
      <Route path="/signup" element={<GuestRoute><SignupPage /></GuestRoute>} />
      <Route path="/forgot-password" element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: { borderRadius: '12px', padding: '14px 20px', fontSize: '14px', fontWeight: '500' },
              success: { style: { background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0' } },
              error: { style: { background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' } }
            }}
          />
          <AppRoutes />
          <ChatWrapper />
        </AuthProvider>
      </Router>
    </ThemeProvider>
  )
}
