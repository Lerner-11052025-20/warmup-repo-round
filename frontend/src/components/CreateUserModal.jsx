import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, User, Mail, Lock, Eye, EyeOff, Shield, Users, UserPlus } from 'lucide-react'
import { userAPI } from '../services/api'
import toast from 'react-hot-toast'

export default function CreateUserModal({ isOpen, onClose, onUserCreated }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'employee', managerId: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [managers, setManagers] = useState([])
  const [loadingManagers, setLoadingManagers] = useState(false)
  const [errors, setErrors] = useState({})

  // Fetch managers when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchManagers()
      setForm({ name: '', email: '', password: '', role: 'employee', managerId: '' })
      setErrors({})
    }
  }, [isOpen])

  const fetchManagers = async () => {
    setLoadingManagers(true)
    try {
      const { data } = await userAPI.getManagers()
      setManagers(data.managers)
    } catch {
      setManagers([])
    } finally {
      setLoadingManagers(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))

    // Clear managerId when switching to manager role
    if (name === 'role' && value === 'manager') {
      setForm(prev => ({ ...prev, managerId: '' }))
    }
  }

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Name is required'
    if (!form.email.trim()) errs.email = 'Email is required'
    if (form.password.length < 6) errs.password = 'Min 6 characters'
    if (form.role === 'employee' && !form.managerId) errs.managerId = 'Select a manager'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        ...(form.role === 'employee' && { managerId: form.managerId })
      }

      const { data } = await userAPI.createUser(payload)
      toast.success(data.message || 'User created successfully! 🎉')
      onUserCreated?.()
      onClose()
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create user'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder-slate-400 outline-none input-glow focus:border-primary-500 dark:focus:border-primary-400 transition-all duration-200 text-sm"

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950/40 flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Create New User</h2>
                  <p className="text-xs text-slate-400">Add employee or manager to your company</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="John Doe" className={inputClass} />
                </div>
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="user@company.com" className={inputClass} />
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Min. 6 characters"
                    className={`${inputClass} pr-12`}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>

              {/* Role Selector */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Role</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'employee', label: 'Employee', icon: User, desc: 'Submit expenses' },
                    { value: 'manager', label: 'Manager', icon: Shield, desc: 'Approve expenses' }
                  ].map((roleOpt) => (
                    <button
                      key={roleOpt.value}
                      type="button"
                      onClick={() => handleChange({ target: { name: 'role', value: roleOpt.value } })}
                      className={`p-3.5 rounded-xl border-2 text-left transition-all duration-200 ${
                        form.role === roleOpt.value
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/30 ring-1 ring-primary-500/20'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <roleOpt.icon size={16} className={form.role === roleOpt.value ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400'} />
                        <span className={`text-sm font-semibold ${form.role === roleOpt.value ? 'text-primary-700 dark:text-primary-300' : 'text-slate-700 dark:text-slate-300'}`}>
                          {roleOpt.label}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">{roleOpt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Manager Dropdown — only visible for Employee role */}
              <AnimatePresence>
                {form.role === 'employee' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Assign Manager</label>
                    <div className="relative">
                      <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none z-10" />
                      <select
                        name="managerId"
                        value={form.managerId}
                        onChange={handleChange}
                        className={`${inputClass} cursor-pointer custom-select`}
                      >
                        <option value="">Select a manager...</option>
                        {loadingManagers ? (
                          <option disabled>Loading managers...</option>
                        ) : managers.length === 0 ? (
                          <option disabled>No managers found — create a manager first</option>
                        ) : (
                          managers.map((m) => (
                            <option key={m._id} value={m._id}>{m.name} ({m.email})</option>
                          ))
                        )}
                      </select>
                    </div>
                    {errors.managerId && <p className="text-red-500 text-xs mt-1">{errors.managerId}</p>}
                    {managers.length === 0 && !loadingManagers && (
                      <p className="text-amber-600 dark:text-amber-400 text-xs mt-1.5 font-medium">⚠️ Create a Manager first before adding Employees</p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold text-sm transition-all"
                >
                  Cancel
                </button>
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: loading ? 1 : 1.01 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white font-semibold text-sm btn-glow disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-primary-500/25 transition-all"
                >
                  {loading ? (
                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Creating...</>
                  ) : (
                    <><UserPlus size={16} /> Create User</>
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
