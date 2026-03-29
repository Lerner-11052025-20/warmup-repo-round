import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Mail, Phone, Camera, Save, 
  FileText, Shield, Building, BadgeInfo, 
  CheckCircle2, Loader2, Briefcase, Zap
} from 'lucide-react';
import { userAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';

const StatItem = ({ label, value, icon: Icon, color }) => (
  <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 group transition-all hover:border-primary-500/30 shadow-sm">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color} bg-opacity-10 shadow-sm transition-all group-hover:scale-110`}>
      <Icon size={18} />
    </div>
    <div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
      <p className="text-sm font-bold text-slate-800 dark:text-white">{value || 'N/A'}</p>
    </div>
  </div>
);

export default function ProfilePage({ hideNavbar = false }) {
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', bio: '' });
  const [preview, setPreview] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const fileInputRef = useRef(null);

  const fetchProfile = async () => {
    try {
      const { data } = await userAPI.getProfile();
      setProfile(data.user);
      setFormData({
        name: data.user.name,
        phone: data.user.phone || '',
        bio: data.user.bio || ''
      });
      setPreview(data.user.profileImage || '');
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load profile data');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...formData };
      if (imageFile) payload.profileImage = imageFile;
      
      const { data } = await userAPI.updateProfile(payload);
      setProfile(data.user);
      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
      setPreview(data.user.profileImage);
      setImageFile(null);
      toast.success('Profile parameters updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
       {!hideNavbar && <Navbar />}
       <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin shadow-lg" />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Hydrating Profile Data...</p>
       </div>
    </div>
  );

  return (
    <div className={`min-h-screen font-sans ${hideNavbar ? 'bg-transparent' : 'bg-slate-50 dark:bg-slate-950'} pb-24 transition-colors duration-500`}>
      {!hideNavbar && <Navbar />}

      <main className={`max-w-7xl mx-auto px-6 ${hideNavbar ? 'pt-0' : 'pt-32'}`}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Identity Sidebar */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-8 shadow-xl relative overflow-hidden text-center"
          >
             <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-primary-600 to-indigo-700 opacity-90" />
             
             <div className="relative mt-8 mb-6 inline-block">
                <div className="w-32 h-32 rounded-3xl bg-slate-100 dark:bg-slate-800 border-4 border-white dark:border-slate-900 shadow-xl overflow-hidden group">
                   {preview ? (
                     <img src={preview} alt="Profile" className="w-full h-full object-cover" />
                   ) : (
                     <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-primary-500">
                        {profile?.name?.charAt(0)}
                     </div>
                   )}
                   <button 
                     onClick={() => fileInputRef.current.click()}
                     className="absolute inset-x-4 bottom-4 py-1.5 bg-primary-600/90 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest rounded-xl opacity-0 group-hover:opacity-100 transition-all shadow-lg flex items-center justify-center gap-2"
                   >
                     <Camera size={12}/> Update
                   </button>
                   <input type="file" ref={fileInputRef} hidden onChange={handleImageChange} accept="image/*" />
                </div>
                {imageFile && (
                   <div className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white dark:border-slate-900">
                      <CheckCircle2 size={12}/>
                   </div>
                )}
             </div>

             <div className="space-y-1">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight">{profile?.name}</h2>
                <div className="flex items-center justify-center gap-2 pt-1">
                   <span className="px-2.5 py-0.5 bg-primary-50 dark:bg-primary-900/30 text-primary-600 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-primary-100 dark:border-primary-800/50">
                     {profile?.role}
                   </span>
                   <span className="px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-emerald-100 dark:border-emerald-800/50">
                     Verified
                   </span>
                </div>
             </div>

             <div className="mt-8 space-y-3 pt-8 border-t border-slate-50 dark:border-slate-800 text-left">
                <StatItem label="Email" value={profile?.email} icon={Mail} color="text-slate-400" />
                <StatItem label="Company" value={profile?.companyId?.name} icon={Building} color="text-slate-400" />
                <StatItem label="Department" value={profile?.role === 'admin' ? 'Administration' : 'Operations'} icon={Briefcase} color="text-slate-400" />
             </div>
          </motion.div>

          {/* Configuration Form */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="lg:col-span-8 space-y-6"
          >
             <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-8 md:p-10 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600">
                         <BadgeInfo size={24} />
                      </div>
                      <div>
                         <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">System Identity</h3>
                         <p className="text-sm font-medium text-slate-400">Modify your individual profile parameters</p>
                      </div>
                   </div>
                </div>

                <form onSubmit={handleUpdate} className="space-y-8">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                         <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest ml-4">Full Legal Name</label>
                         <div className="relative group">
                            <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-hover:text-primary-500 transition-colors" size={18} />
                            <input 
                              type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 p-4 pl-14 rounded-2xl focus:ring-4 focus:ring-primary-500/10 outline-none font-semibold text-sm transition-all shadow-sm"
                            />
                         </div>
                      </div>

                      <div className="space-y-2">
                         <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest ml-4">Phone Protocol</label>
                         <div className="relative group">
                            <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-hover:text-primary-500 transition-colors" size={18} />
                            <input 
                              type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+1 (000) 000-0000"
                              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 p-4 pl-14 rounded-2xl focus:ring-4 focus:ring-primary-500/10 outline-none font-semibold text-sm transition-all shadow-sm"
                            />
                         </div>
                      </div>
                   </div>

                   <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest ml-4">Personal Narrative (Bio)</label>
                      <div className="relative group">
                         <FileText className="absolute left-5 top-6 text-slate-300 group-hover:text-primary-500 transition-colors" size={18} />
                         <textarea 
                           value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} placeholder="Professional summary and objectives..."
                           className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 p-5 pl-14 h-32 rounded-[2rem] focus:ring-4 focus:ring-primary-500/10 outline-none font-semibold text-sm transition-all shadow-sm resize-none placeholder:text-slate-300"
                         />
                      </div>
                      <div className="flex justify-between px-4">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{formData.bio.length} / 200 characters</p>
                        <div className="flex items-center gap-1.5 grayscale opacity-50">
                          <Zap size={10} className="text-primary-500" />
                          <span className="text-[8px] font-bold uppercase">Real-time Sync</span>
                        </div>
                      </div>
                   </div>

                   <div className="flex justify-end gap-6 items-center pt-4">
                      <AnimatePresence>
                         {saving && (
                            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} className="flex items-center gap-2 text-primary-500">
                               <Loader2 size={16} className="animate-spin" />
                               <span className="text-[10px] font-bold uppercase tracking-widest">Synchronizing...</span>
                            </motion.div>
                         )}
                      </AnimatePresence>
                      <button 
                        type="submit" disabled={saving}
                        className="px-10 py-4 bg-primary-600 text-white font-bold text-sm rounded-2xl shadow-xl shadow-primary-500/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
                      >
                         <Save size={18}/> Deploy Changes
                      </button>
                   </div>
                </form>
             </div>

             <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 text-slate-900 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group shadow-xl">
                <div className="relative z-10 flex items-center gap-5">
                   <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center border border-indigo-100 dark:border-indigo-800/50 shadow-sm"><Shield size={24} className="text-primary-600"/></div>
                   <div>
                      <h4 className="text-xl font-bold tracking-tight dark:text-white">Access Authority</h4>
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">System Role: <span className="text-primary-600 font-bold bg-primary-50 dark:bg-primary-900/30 px-2 py-0.5 rounded ml-1 uppercase">{profile?.role}</span></p>
                   </div>
                </div>
                <button className="relative z-10 px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs rounded-xl shadow-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors">Request Elevation</button>
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full blur-[80px] -mr-32 -mt-32 group-hover:scale-150 transition-transform duration-[3s]" />
             </div>
          </motion.div>

        </div>
      </main>
    </div>
  );
}
