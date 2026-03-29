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
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
  }, [location]);

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
      scrolled 
        ? 'py-4 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 shadow-lg' 
        : 'py-6 bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-primary-500/20 group-hover:scale-110 group-hover:rotate-6 transition-transform">
            <PieChart size={22} className="text-white" />
          </div>
          <div>
            <span className="text-xl font-black text-slate-900 dark:text-white tracking-tighter uppercase transition-colors group-hover:text-primary-600">SmartFlow</span>
            <p className="text-[8px] text-slate-400 font-bold tracking-[0.2em] leading-none uppercase">Reimburse AI</p>
          </div>
        </Link>

        {/* DESKTOP NAV */}
        <div className="hidden md:flex items-center gap-8">
           <Link to="/" className={`text-xs font-black uppercase tracking-widest ${location.pathname === '/' ? 'text-primary-600' : 'text-slate-500 dark:text-slate-400'} hover:text-primary-500 transition-colors`}>Home</Link>
           <a href="#features" className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-primary-500 transition-colors">Features</a>
           <a href="#contact" className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-primary-500 transition-colors">Contact</a>
           
           <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-2" />
           
           <ThemeToggle />

           {user ? (
             <div className="relative">
                <button 
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-3 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1.5 pr-4 rounded-2xl group transition-all hover:border-primary-500/30"
                >
                   <div className="w-8 h-8 rounded-xl bg-primary-600 flex items-center justify-center text-xs font-black text-white overflow-hidden shadow-lg shadow-primary-500/20">
                      {user.profileImage ? (
                        <img src={user.profileImage} alt="User" className="w-full h-full object-cover" />
                      ) : (
                        user.name?.charAt(0)
                      )}
                   </div>
                   <div className="text-left hidden lg:block">
                      <p className="text-[10px] font-black text-slate-800 dark:text-white uppercase leading-tight truncate max-w-[80px]">{user.name}</p>
                      <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">{user.role}</p>
                   </div>
                   <ChevronDown className={`text-slate-400 group-hover:text-primary-500 transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`} size={14} />
                </button>

                <AnimatePresence>
                   {profileDropdownOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-4 w-60 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] shadow-2xl p-4 overflow-hidden"
                      >
                         <div className="flex flex-col gap-1">
                            <Link to="/dashboard" className="flex items-center gap-3 p-3 rounded-2xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-primary-600 transition-all group">
                               <LayoutDashboard size={18} className="group-hover:scale-110 transition-transform" />
                               <span className="text-xs font-black uppercase tracking-widest">Dashboard</span>
                            </Link>
                            <Link to="/profile" className="flex items-center gap-3 p-3 rounded-2xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-primary-600 transition-all group">
                               <Settings size={18} className="group-hover:scale-110 transition-transform" />
                               <span className="text-xs font-black uppercase tracking-widest">Profile Systems</span>
                            </Link>
                            <div className="h-px bg-slate-100 dark:bg-slate-800 my-2" />
                            <button 
                              onClick={logout}
                              className="flex items-center gap-3 p-3 rounded-2xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all group w-full"
                            >
                               <LogOut size={18} className="group-hover:translate-x-1 transition-transform" />
                               <span className="text-xs font-black uppercase tracking-widest text-left">Terminate Session</span>
                            </button>
                         </div>
                      </motion.div>
                   )}
                </AnimatePresence>
             </div>
           ) : (
             <div className="flex items-center gap-4">
                <Link to="/login" className="text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:text-primary-500 transition-all">Sign In</Link>
                <Link to="/signup" className="px-6 py-3 bg-primary-600 text-white text-[10px] font-black uppercase tracking-[2px] rounded-xl shadow-xl shadow-primary-500/20 hover:scale-105 active:scale-95 transition-all">Enroll Now</Link>
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
             className="md:hidden bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-900 p-6 space-y-4"
           >
              {['Home', 'Features', 'Pricing', 'Contact'].map(link => (
                <a key={link} href="#" className="block text-sm font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 p-2">{link}</a>
              ))}
              <div className="pt-4 flex flex-col gap-4">
                 <ThemeToggle />
                 {!user ? (
                   <>
                     <Link to="/login" className="block w-full py-4 text-center text-xs font-black uppercase text-slate-600 dark:text-slate-300">Login</Link>
                     <Link to="/signup" className="block w-full py-4 bg-primary-600 text-white rounded-xl text-center text-xs font-black uppercase">Sign Up</Link>
                   </>
                 ) : (
                    <button onClick={logout} className="block w-full py-4 bg-red-500 text-white rounded-xl text-center text-xs font-black uppercase">Logout</button>
                 )}
              </div>
           </motion.div>
         )}
      </AnimatePresence>
    </nav>
  );
}
