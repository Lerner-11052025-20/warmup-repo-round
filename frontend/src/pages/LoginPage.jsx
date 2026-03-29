import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, ArrowRight, LogIn } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import AuthLayout from '../layouts/AuthLayout'

export default function LoginPage() {
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(form)
    } catch {
      // error handled by context
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your account to continue">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              autoFocus
              placeholder="you@company.com"
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none input-glow focus:border-primary-500 dark:focus:border-primary-400 transition-all duration-200 text-sm"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type={showPass ? 'text' : 'password'}
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              placeholder="••••••••"
              className="w-full pl-11 pr-12 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none input-glow focus:border-primary-500 dark:focus:border-primary-400 transition-all duration-200 text-sm"
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Remember me + Forgot password */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-primary-500 focus:ring-primary-500 focus:ring-offset-0 cursor-pointer"
            />
            <span className="text-sm text-slate-600 dark:text-slate-400">Remember me</span>
          </label>
          <Link
            to="/forgot-password"
            className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={loading}
          whileHover={{ scale: loading ? 1 : 1.01 }}
          whileTap={{ scale: loading ? 1 : 0.98 }}
          className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white font-semibold text-sm btn-glow disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all duration-200 shadow-lg shadow-primary-500/25"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Signing in...
            </>
          ) : (
            <>
              <LogIn size={18} />
              Sign In
            </>
          )}
        </motion.button>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-700" />
          </div>
          <div className="relative flex justify-center">
            <span className="px-4 text-xs text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-950">
              New to SmartFlow?
            </span>
          </div>
        </div>

        {/* Signup Link */}
        <Link
          to="/signup"
          className="w-full py-3 px-6 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-600 text-slate-700 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 group"
        >
          Create your account
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </form>
    </AuthLayout>
  )
}
