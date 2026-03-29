import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, X, Sparkles, User, LayoutDashboard, 
  History, Settings, LogOut, ChevronDown, Moon, Sun, 
  Zap, PieChart
} from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
  }, [location]);

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
      scrolled 
        ? 'py-3 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 shadow-md' 
        : 'py-5 bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-primary-500/20 group-hover:scale-110 transition-transform">
            <PieChart size={18} className="text-white" />
          </div>
          <div>
            <span className="text-lg font-bold text-slate-900 dark:text-white transition-colors group-hover:text-primary-600">SmartFlow</span>
            <p className="text-[10px] text-slate-400 font-bold leading-none">Reimburse AI</p>
          </div>
        </Link>

        {/* DESKTOP NAV */}
        <div className="hidden md:flex items-center gap-8">
           <div className="flex items-center gap-6">
             {['Home', 'Features', 'Contact'].map(item => (
               <Link 
                 key={item}
                 to={item === 'Home' ? '/' : `/#${item.toLowerCase()}`} 
                 className={`text-sm font-semibold ${location.pathname === '/' && item === 'Home' ? 'text-primary-600' : 'text-slate-500 dark:text-slate-400'} hover:text-primary-600 transition-colors`}
               >
                 {item}
               </Link>
             ))}
           </div>
           
           <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 mx-1" />
           
           <ThemeToggle />

           {user ? (
             <div className="relative">
                <button 
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 pr-3 rounded-xl group transition-all hover:border-primary-500/30 shadow-sm"
                >
                   <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-xs font-bold text-white overflow-hidden shadow-lg shadow-primary-500/20">
                      {user.profileImage ? (
                        <img src={user.profileImage} alt="User" className="w-full h-full object-cover" />
                      ) : (
                        user.name?.charAt(0)
                      )}
                   </div>
                   <div className="text-left hidden lg:block">
                      <p className="text-xs font-bold text-slate-800 dark:text-white leading-tight truncate max-w-[80px]">{user.name}</p>
                   </div>
                   <ChevronDown className={`text-slate-400 group-hover:text-primary-500 transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`} size={14} />
                </button>

                <AnimatePresence>
                   {profileDropdownOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-3 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-2.5 overflow-hidden z-20"
                      >
                         <div className="flex flex-col gap-0.5">
                            <Link to="/dashboard" className="flex items-center gap-2.5 p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-primary-600 transition-all group">
                               <LayoutDashboard size={18} className="group-hover:scale-110 transition-transform" />
                               <span className="text-sm font-semibold">Dashboard</span>
                            </Link>
                            <Link to="/profile" className="flex items-center gap-2.5 p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-primary-600 transition-all group">
                               <Settings size={18} className="group-hover:scale-110 transition-transform" />
                               <span className="text-sm font-semibold">Settings</span>
                            </Link>
                            <div className="h-px bg-slate-100 dark:bg-slate-800 my-1.5 mx-2" />
                            <button 
                              onClick={logout}
                              className="flex items-center gap-2.5 p-2.5 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all group w-full"
                            >
                               <LogOut size={18} className="group-hover:translate-x-1 transition-transform" />
                               <span className="text-sm font-bold text-left">Disconnect</span>
                            </button>
                         </div>
                      </motion.div>
                   )}
                </AnimatePresence>
             </div>
           ) : (
             <div className="flex items-center gap-5">
                <Link to="/login" className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-primary-600 transition-all">Sign In</Link>
                <Link to="/signup" className="px-6 py-2.5 bg-primary-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-primary-500/20 hover:scale-105 active:scale-95 transition-all">Get Started</Link>
             </div>
           )}
        </div>

        {/* MOBILE MENU TOGGLE */}
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-slate-600 dark:text-slate-300">
           {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* MOBILE MENU */}
      <AnimatePresence>
         {mobileMenuOpen && (
           <motion.div 
             initial={{ opacity: 0, height: 0 }}
             animate={{ opacity: 1, height: 'auto' }}
             exit={{ opacity: 0, height: 0 }}
             className="md:hidden bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-900 px-6 py-6 space-y-4"
           >
              {['Home', 'Features', 'Contact'].map(link => (
                <Link 
                  key={link} 
                  to={link === 'Home' ? '/' : `/#${link.toLowerCase()}`} 
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-md font-semibold text-slate-600 dark:text-slate-400"
                >
                  {link}
                </Link>
              ))}
              <div className="pt-4 flex flex-col gap-4 border-t border-slate-50 dark:border-slate-900">
                 <div className="flex items-center justify-between">
                   <span className="text-sm font-semibold text-slate-400">Appearance</span>
                   <ThemeToggle />
                 </div>
                 {!user ? (
                   <div className="flex flex-col gap-3">
                     <Link to="/login" className="block w-full py-3.5 text-center text-sm font-bold text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-800 rounded-xl">Login</Link>
                     <Link to="/signup" className="block w-full py-3.5 bg-primary-600 text-white rounded-xl text-center text-sm font-bold">Sign Up</Link>
                   </div>
                 ) : (
                    <button onClick={logout} className="block w-full py-3.5 bg-red-500 text-white rounded-xl text-center text-sm font-bold">Disconnect Account</button>
                 )}
              </div>
           </motion.div>
         )}
      </AnimatePresence>
    </nav>
  );
}

