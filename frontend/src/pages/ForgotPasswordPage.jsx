import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, ArrowLeft, Send, CheckCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import AuthLayout from '../layouts/AuthLayout'

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await forgotPassword(email)
      setSent(true)
    } catch {
      // handled by context
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title={sent ? '' : 'Forgot password?'}
      subtitle={sent ? '' : "No worries, we'll send you a temporary password"}
    >
      {sent ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Check your email</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-2">
            We sent a temporary password to
          </p>
          <p className="text-slate-700 dark:text-slate-200 font-semibold text-sm mb-6">{email}</p>
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6">
            <p className="text-amber-700 dark:text-amber-300 text-sm">
              ⏱️ The temporary password expires in <strong>15 minutes</strong>.
              Login with it and update your password.
            </p>
          </div>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold text-sm btn-glow shadow-lg shadow-primary-500/25"
          >
            <ArrowLeft size={16} /> Back to Login
          </Link>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                placeholder="you@company.com"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none input-glow focus:border-primary-500 dark:focus:border-primary-400 transition-all duration-200 text-sm"
              />
            </div>
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.01 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white font-semibold text-sm btn-glow disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all duration-200 shadow-lg shadow-primary-500/25"
          >
            {loading ? (
              <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Sending...</>
            ) : (
              <><Send size={18} /> Send Temporary Password</>
            )}
          </motion.button>

          <Link
            to="/login"
            className="w-full py-3 px-6 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-600 text-slate-700 dark:text-slate-300 font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to Login
          </Link>
        </form>
      )}
    </AuthLayout>
  )
}
