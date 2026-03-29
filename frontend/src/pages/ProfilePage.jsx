import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Mail, Phone, MapPin, Camera, Save, 
  Trash2, FileText, Shield, Building, Award, 
  ChevronRight, BadgeInfo, CheckCircle2, Loader2,
  X, Image as ImageIcon, Briefcase, Zap
} from 'lucide-react';
import { userAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';

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
      toast.error('Failed to load profile');
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
      toast.success('System parameters updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center p-20">
       <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className={`min-h-screen ${hideNavbar ? 'bg-transparent' : 'bg-slate-50 dark:bg-slate-950'} pb-20 transition-colors duration-500`}>
      {!hideNavbar && <Navbar />}

      <main className={`max-w-7xl mx-auto px-0 lg:px-6 ${hideNavbar ? 'pt-0' : 'pt-32'}`}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* ─── LEFT SIDEBAR (IDENTITY) ─── */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 p-10 text-center shadow-2xl relative overflow-hidden"
          >
             <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-primary-600 to-indigo-700 opacity-90" />
             
             <div className="relative mt-12 mb-8 inline-block">
                <div className="w-40 h-40 rounded-[2.5rem] bg-slate-100 dark:bg-slate-800 border-8 border-white dark:border-slate-900 shadow-3xl overflow-hidden group">
                   {preview ? (
                     <img src={preview} alt="Profile" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                   ) : (
                     <div className="w-full h-full flex items-center justify-center text-4xl font-black text-primary-500">
                        {profile?.name?.charAt(0)}
                     </div>
                   )}
                   <button 
                     onClick={() => fileInputRef.current.click()}
                     className="absolute inset-x-8 bottom-4 py-2 bg-primary-600/90 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-[2px] rounded-xl opacity-0 group-hover:opacity-100 transition-all shadow-xl flex items-center justify-center gap-2"
                   >
                     <Camera size={14}/> Adjust
                   </button>
                   <input type="file" ref={fileInputRef} hidden onChange={handleImageChange} accept="image/*" />
                </div>
                {imageFile && (
                   <motion.div 
                     initial={{ scale: 0 }} animate={{ scale: 1 }}
                     className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white dark:border-slate-900"
                   >
                      <CheckCircle2 size={16}/>
                   </motion.div>
                )}
             </div>

             <div className="space-y-2 relative z-10">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{profile?.name}</h2>
                <div className="flex items-center justify-center gap-2">
                   <div className="px-3 py-1 bg-primary-500/10 rounded-lg text-primary-600 text-[10px] font-black uppercase tracking-widest border border-primary-500/20">{profile?.role}</div>
                   <div className="px-3 py-1 bg-emerald-500/10 rounded-lg text-emerald-600 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">Verified</div>
                </div>
             </div>

             <div className="mt-10 space-y-4 pt-10 border-t border-slate-50 dark:border-slate-800 relative z-10">
                <div className="flex items-center gap-3 text-left p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 group transition-all hover:border-primary-500/30">
                   <Mail className="text-slate-400 group-hover:text-primary-500" size={18} />
                   <div><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Email Address</p><p className="font-bold text-slate-800 dark:text-white text-xs">{profile?.email}</p></div>
                </div>
                <div className="flex items-center gap-3 text-left p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 group transition-all hover:border-primary-500/30">
                   <Building className="text-slate-400 group-hover:text-primary-500" size={18} />
                   <div><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Company Domain</p><p className="font-bold text-slate-800 dark:text-white text-xs">{profile?.companyId?.name}</p></div>
                </div>
             </div>
          </motion.div>

          {/* ─── RIGHT CONTENT (FIELDS) ─── */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-8 space-y-8"
          >
             <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 p-10 shadow-2xl">
                <div className="flex items-center justify-between mb-12">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
                         <BadgeInfo size={24} />
                      </div>
                      <div>
                         <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">System Parameters</h3>
                         <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Modify your individual profile entity</p>
                      </div>
                   </div>
                   <div className="hidden sm:flex items-center gap-2">
                      <Zap size={14} className="text-primary-500 animate-pulse" />
                      <span className="text-[10px] font-black text-slate-400">HIGH-PERFORMANCE SYNC</span>
                   </div>
                </div>

                <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Legal Identifier (Name)</label>
                      <div className="relative group">
                         <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-hover:text-primary-500 transition-colors" size={18} />
                         <input 
                           type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                           className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 p-4 pl-14 rounded-2xl focus:ring-4 focus:ring-primary-500/10 outline-none font-bold text-sm tracking-tight transition-all"
                         />
                      </div>
                   </div>

                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Communication Line (Phone)</label>
                      <div className="relative group">
                         <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-hover:text-primary-500 transition-colors" size={18} />
                         <input 
                           type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+1 000 000 0000"
                           className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 p-4 pl-14 rounded-2xl focus:ring-4 focus:ring-primary-500/10 outline-none font-bold text-sm tracking-tight transition-all"
                         />
                      </div>
                   </div>

                   <div className="md:col-span-2 space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Executive Narrative (Bio)</label>
                      <div className="relative group">
                         <FileText className="absolute left-5 top-6 text-slate-300 group-hover:text-primary-500 transition-colors" size={18} />
                         <textarea 
                           value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} placeholder="Professional background and objectives..."
                           className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 p-5 pl-14 h-32 rounded-[2rem] focus:ring-4 focus:ring-primary-500/10 outline-none font-bold text-sm tracking-tight resize-none transition-all placeholder:text-slate-300"
                         />
                      </div>
                      <p className="text-[9px] text-slate-400 font-bold ml-4 uppercase tracking-widest">{formData.bio.length} / 200 Characters Limited</p>
                   </div>

                   <div className="md:col-span-2 pt-6 flex justify-end gap-6 items-center">
                      <AnimatePresence>
                         {saving && (
                            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} className="flex items-center gap-2 text-primary-500">
                               <Loader2 size={16} className="animate-spin" />
                               <span className="text-[10px] font-black uppercase tracking-widest">Synchronizing...</span>
                            </motion.div>
                         )}
                      </AnimatePresence>
                      <button 
                        type="submit" disabled={saving}
                        className="px-10 py-5 bg-primary-600 text-white font-black uppercase tracking-widest text-sm rounded-2xl shadow-2xl shadow-primary-500/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
                      >
                         <Save size={18}/> Deploy Changes
                      </button>
                   </div>
                </form>
             </div>

             <div className="bg-slate-900 dark:bg-primary-600 p-10 rounded-[3rem] text-white flex flex-col md:flex-row items-center justify-between gap-8 group overflow-hidden relative">
                <div className="relative z-10 flex items-center gap-4">
                   <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20"><Briefcase size={24}/></div>
                   <div>
                      <h4 className="text-xl font-black uppercase tracking-[2px]">Organizational Tier</h4>
                      <p className="font-bold opacity-60">Your designated workflow role: <span className="uppercase text-white opacity-100 bg-white/20 px-2 py-0.5 rounded">{profile?.role}</span></p>
                   </div>
                </div>
                <button className="relative z-10 px-8 py-3 bg-white text-slate-900 font-black uppercase tracking-widest text-xs rounded-xl shadow-xl hover:bg-slate-100 transition-colors">Request Role Change</button>
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[80px] -mr-32 -mt-32 group-hover:scale-150 transition-transform duration-[2s]" />
             </div>
          </motion.div>

        </div>
      </main>
    </div>
  );
}
