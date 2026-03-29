import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Mail, Lock, Eye, EyeOff, Globe, ArrowRight, UserPlus, Coins, Search, X } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import AuthLayout from '../layouts/AuthLayout'
import PasswordStrength from '../components/PasswordStrength'

export default function SignupPage() {
  const { signup } = useAuth()
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    country: '', baseCurrency: '', currencySymbol: '', companyName: ''
  })
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [countries, setCountries] = useState([])
  const [loadingCountries, setLoadingCountries] = useState(true)
  const [showDropdown, setShowDropdown] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [errors, setErrors] = useState({})

  // Fetch countries
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await fetch('https://restcountries.com/v3.1/all?fields=name,currencies')
        const data = await res.json()
        const parsed = data
          .map((c) => {
            const currencyKeys = c.currencies ? Object.keys(c.currencies) : []
            const currCode = currencyKeys[0] || ''
            const currSymbol = currCode && c.currencies[currCode]?.symbol ? c.currencies[currCode].symbol : ''
            const currName = currCode && c.currencies[currCode]?.name ? c.currencies[currCode].name : ''
            return {
              name: c.name?.common || '',
              currencyCode: currCode,
              currencySymbol: currSymbol,
              currencyName: currName
            }
          })
          .filter(c => c.name && c.currencyCode)
          .sort((a, b) => a.name.localeCompare(b.name))
        setCountries(parsed)
      } catch {
        setCountries([])
      } finally {
        setLoadingCountries(false)
      }
    }
    fetchCountries()
  }, [])

  const filteredCountries = useMemo(() => {
    if (!searchQuery) return countries
    const q = searchQuery.toLowerCase()
    return countries.filter(c =>
      c.name.toLowerCase().includes(q) || c.currencyCode.toLowerCase().includes(q)
    )
  }, [countries, searchQuery])

  const selectCountry = (country) => {
    setForm(prev => ({
      ...prev,
      country: country.name,
      baseCurrency: country.currencyCode,
      currencySymbol: country.currencySymbol
    }))
    setShowDropdown(false)
    setSearchQuery('')
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Name is required'
    if (!form.email.trim()) errs.email = 'Email is required'
    if (form.password.length < 6) errs.password = 'Min 6 characters'
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match'
    if (!form.country) errs.country = 'Select a country'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await signup(form)
    } catch {
      // handled by context
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none input-glow focus:border-primary-500 dark:focus:border-primary-400 transition-all duration-200 text-sm"

  return (
    <AuthLayout title="Create your account" subtitle="Start managing expenses smarter today">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Full Name</label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input type="text" name="name" value={form.name} onChange={handleChange} required autoFocus placeholder="John Doe" className={inputClass} />
          </div>
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input type="email" name="email" value={form.email} onChange={handleChange} required placeholder="you@company.com" className={inputClass} />
          </div>
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
        </div>

        {/* Company Name (optional) */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Company Name <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <div className="relative">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" /></svg>
            <input type="text" name="companyName" value={form.companyName} onChange={handleChange} placeholder="Acme Inc." className={inputClass} />
          </div>
        </div>

        {/* Country Selector */}
        <div className="relative">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Country</label>
          <button
            type="button"
            onClick={() => setShowDropdown(!showDropdown)}
            className={`w-full pl-11 pr-4 py-3 rounded-xl border text-left text-sm transition-all duration-200 ${
              form.country
                ? 'border-primary-300 dark:border-primary-700 bg-primary-50/50 dark:bg-primary-950/30 text-slate-900 dark:text-white'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 text-slate-400 dark:text-slate-500'
            } input-glow focus:border-primary-500`}
          >
            <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            {form.country || 'Select your country'}
          </button>
          {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country}</p>}

          {/* Currency Preview */}
          <AnimatePresence>
            {form.baseCurrency && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 px-4 py-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2"
              >
                <Coins className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                  Base Currency: {form.baseCurrency} {form.currencySymbol}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Dropdown */}
          <AnimatePresence>
            {showDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="absolute z-50 mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xl max-h-64 overflow-hidden"
              >
                <div className="sticky top-0 p-2.5 border-b border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search country..."
                      autoFocus
                      className="w-full pl-9 pr-8 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-primary-500"
                    />
                    {searchQuery && (
                      <button type="button" onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>
                <div className="overflow-y-auto max-h-48">
                  {loadingCountries ? (
                    <div className="p-4 space-y-2">
                      {[1,2,3].map(i => <div key={i} className="h-8 skeleton rounded-lg" />)}
                    </div>
                  ) : filteredCountries.length === 0 ? (
                    <p className="p-4 text-center text-sm text-slate-400">No countries found</p>
                  ) : (
                    filteredCountries.map((c) => (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => selectCountry(c)}
                        className={`w-full px-4 py-2.5 text-left text-sm flex items-center justify-between hover:bg-primary-50 dark:hover:bg-primary-950/30 transition-colors ${
                          form.country === c.name ? 'bg-primary-50 dark:bg-primary-950/30 text-primary-600 dark:text-primary-400' : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <span>{c.name}</span>
                        <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">{c.currencyCode} {c.currencySymbol}</span>
                      </button>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input type={showPass ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange} required placeholder="Min. 6 characters" className={`${inputClass} pr-12`} />
            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
              {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <PasswordStrength password={form.password} />
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Confirm Password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input type={showConfirm ? 'text' : 'password'} name="confirmPassword" value={form.confirmPassword} onChange={handleChange} required placeholder="Re-enter password" className={`${inputClass} pr-12`} />
            <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
          {form.confirmPassword && form.password === form.confirmPassword && (
            <p className="text-emerald-600 dark:text-emerald-400 text-xs mt-1 font-medium">✓ Passwords match</p>
          )}
        </div>

        {/* Submit */}
        <motion.button
          type="submit"
          disabled={loading}
          whileHover={{ scale: loading ? 1 : 1.01 }}
          whileTap={{ scale: loading ? 1 : 0.98 }}
          className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white font-semibold text-sm btn-glow disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all duration-200 shadow-lg shadow-primary-500/25 mt-6"
        >
          {loading ? (
            <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Creating account...</>
          ) : (
            <><UserPlus size={18} /> Create Account</>
          )}
        </motion.button>

        {/* Login Link */}
        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-4">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors">
            Sign in <ArrowRight size={14} className="inline" />
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}
