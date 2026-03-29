import { motion } from 'framer-motion'
import ThemeToggle from '../components/ThemeToggle'
import { Sparkles } from 'lucide-react'

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white dark:bg-slate-950 transition-colors duration-300">
      {/* ─── Left Panel: Branding ─── */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden bg-animated-gradient">
        {/* Floating shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="floating-shape absolute top-[15%] left-[10%] w-24 h-24 rounded-2xl bg-white/10 rotate-12" />
          <div className="floating-shape delay-1 absolute top-[45%] right-[15%] w-32 h-32 rounded-full bg-white/10" />
          <div className="floating-shape delay-2 absolute bottom-[20%] left-[20%] w-20 h-20 rounded-xl bg-white/10 -rotate-6" />
          <div className="floating-shape delay-3 absolute top-[70%] right-[30%] w-16 h-16 rounded-full bg-white/5" />
          <div className="floating-shape absolute bottom-[10%] right-[10%] w-28 h-28 rounded-2xl bg-white/5 rotate-45" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Logo */}
            <div className="flex items-center gap-3 mb-10">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-white text-xl font-bold tracking-tight">SmartFlow</h2>
                <p className="text-white/60 text-xs font-medium tracking-wider">REIMBURSE AI</p>
              </div>
            </div>

            {/* Tagline */}
            <h1 className="text-4xl xl:text-5xl font-extrabold text-white leading-tight mb-6">
              Intelligent Expense
              <br />
              <span className="text-white/80">Management</span>
            </h1>
            <p className="text-white/70 text-lg leading-relaxed max-w-md mb-10">
              Automate reimbursements with AI-powered OCR, multi-level approvals, and real-time currency conversion.
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-3">
              {['OCR Scanning', 'Multi-Level Approval', 'Real-Time Currency', 'Role-Based Access'].map((feature, i) => (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.15, duration: 0.5 }}
                  className="px-4 py-2 rounded-full glass text-white/90 text-sm font-medium"
                >
                  {feature}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ─── Right Panel: Form ─── */}
      <div className="flex-1 flex flex-col">
        {/* Top bar with theme toggle */}
        <div className="flex justify-between items-center px-6 py-4 lg:px-10">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-slate-900 dark:text-white">SmartFlow</span>
          </div>
          <div className="hidden lg:block" />
          <ThemeToggle />
        </div>

        {/* Form content */}
        <div className="flex-1 flex items-center justify-center px-6 py-8 lg:px-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="w-full max-w-md"
          >
            {/* Title */}
            {title && (
              <div className="mb-8">
                <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mb-2">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-slate-500 dark:text-slate-400 text-sm lg:text-base">
                    {subtitle}
                  </p>
                )}
              </div>
            )}

            {children}
          </motion.div>
        </div>

        {/* Footer */}
        <div className="text-center py-4 px-6">
          <p className="text-xs text-slate-400 dark:text-slate-600">
            © 2026 SmartFlow Reimburse AI. Built for ODOO Hackathon × VIT Pune.
          </p>
        </div>
      </div>
    </div>
  )
}
