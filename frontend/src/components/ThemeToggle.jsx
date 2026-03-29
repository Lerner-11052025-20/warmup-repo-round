import { useTheme } from '../contexts/ThemeContext'
import { Sun, Moon } from 'lucide-react'
import { motion } from 'framer-motion'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.05 }}
      onClick={toggleTheme}
      className="relative w-14 h-7 rounded-full bg-slate-200 dark:bg-slate-700 transition-colors duration-300 flex items-center p-0.5 cursor-pointer"
      aria-label="Toggle theme"
    >
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className={`w-6 h-6 rounded-full flex items-center justify-center shadow-md ${
          theme === 'dark'
            ? 'ml-auto bg-slate-900'
            : 'ml-0 bg-white'
        }`}
      >
        {theme === 'dark' ? (
          <Moon size={14} className="text-indigo-400" />
        ) : (
          <Sun size={14} className="text-amber-500" />
        )}
      </motion.div>
    </motion.button>
  )
}
