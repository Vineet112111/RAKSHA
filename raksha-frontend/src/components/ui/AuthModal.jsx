import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

export default function AuthModal({ isOpen, onClose }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    city: 'Mumbai',
    defaultSOSMessage: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isLogin) {
        // Login Flow
        const identifier = formData.email || formData.phone;
        if (!identifier) {
          setError('Please provide Email or Phone');
          setLoading(false);
          return;
        }
        
        const result = await login(identifier, formData.password);
        if (result.success) {
          setSuccess('Access Granted. Session Initialized.');
          setTimeout(() => {
            onClose();
            setSuccess('');
            setFormData({ name: '', email: '', phone: '', password: '', city: 'Mumbai', defaultSOSMessage: '' });
          }, 1500);
        } else {
          setError(result.message || 'Login failed');
        }
      } else {
        // Registration Flow
        if (!formData.name || !formData.email || !formData.phone || !formData.password) {
          setError('Please fill in all required fields');
          setLoading(false);
          return;
        }

        const result = await register({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          city: formData.city,
          defaultSOSMessage: formData.defaultSOSMessage || undefined,
        });

        if (result.success) {
          setSuccess('Identity Verified. Profile Created.');
          setTimeout(() => {
            onClose();
            setSuccess('');
            setFormData({ name: '', email: '', phone: '', password: '', city: 'Mumbai', defaultSOSMessage: '' });
          }, 1500);
        } else {
          setError(result.message || 'Registration failed');
        }
      }
    } catch (err) {
      setError('System exception. Connection timed out.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 20, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 180 }}
          className="relative w-full max-w-md overflow-hidden glass border border-cyan/30 rounded-sm p-6 md:p-8 shadow-[0_0_50px_rgba(0,217,255,0.15)]"
        >
          {/* Header Cyber-Grid Line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan to-transparent animate-pulse-glow" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/50 hover:text-cyan font-hud text-xs tracking-wider transition-colors"
          >
            [CLOSE]
          </button>

          {/* Tabs */}
          <div className="flex gap-4 mb-6 border-b border-white/5 pb-2">
            <button
              onClick={() => { setIsLogin(true); setError(''); setSuccess(''); }}
              className={`font-hud text-xs tracking-[0.2em] pb-2 transition-all ${
                isLogin ? 'text-cyan border-b-2 border-cyan text-glow' : 'text-white/40 hover:text-white/70'
              }`}
            >
              IDENTITY SIGN-IN
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(''); setSuccess(''); }}
              className={`font-hud text-xs tracking-[0.2em] pb-2 transition-all ${
                !isLogin ? 'text-cyan border-b-2 border-cyan text-glow' : 'text-white/40 hover:text-white/70'
              }`}
            >
              SECURE SIGN-UP
            </button>
          </div>

          {/* Subtitle */}
          <p className="font-hud text-[9px] text-white/30 tracking-widest mb-6">
            ◆ SECURITY PORTAL PHASE 1 AUTHENTICATION
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 border border-emergency/30 bg-emergency/10 rounded-sm"
              >
                <p className="font-hud text-[9px] text-emergency tracking-wider text-glow-emergency">
                  [WARNING]: {error}
                </p>
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 border border-green-500/30 bg-green-500/10 rounded-sm"
              >
                <p className="font-hud text-[9px] text-green-400 tracking-wider text-glow">
                  [SUCCESS]: {success}
                </p>
              </motion.div>
            )}

            <AnimatePresence mode="wait">
              {isLogin ? (
                <motion.div
                  key="login-fields"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block font-hud text-[9px] text-white/50 tracking-wider mb-2">EMAIL OR PHONE</label>
                    <input
                      type="text"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="e.g. user@raksha.com or 9876543210"
                      className="w-full bg-black/50 border border-white/10 focus:border-cyan/50 text-white font-hud text-xs rounded-sm p-3 outline-none transition-all placeholder:text-white/20"
                    />
                  </div>
                  <div>
                    <label className="block font-hud text-[9px] text-white/50 tracking-wider mb-2">ACCESS PASSWORD</label>
                    <input
                      type="password"
                      name="password"
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="••••••••"
                      className="w-full bg-black/50 border border-white/10 focus:border-cyan/50 text-white font-hud text-xs rounded-sm p-3 outline-none transition-all placeholder:text-white/20"
                    />
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="register-fields"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar"
                >
                  <div>
                    <label className="block font-hud text-[9px] text-white/50 tracking-wider mb-2">FULL NAME</label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g. Priyanjali Sharma"
                      className="w-full bg-black/50 border border-white/10 focus:border-cyan/50 text-white font-hud text-xs rounded-sm p-3 outline-none transition-all placeholder:text-white/20"
                    />
                  </div>
                  <div>
                    <label className="block font-hud text-[9px] text-white/50 tracking-wider mb-2">SECURE EMAIL</label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="e.g. target@network.com"
                      className="w-full bg-black/50 border border-white/10 focus:border-cyan/50 text-white font-hud text-xs rounded-sm p-3 outline-none transition-all placeholder:text-white/20"
                    />
                  </div>
                  <div>
                    <label className="block font-hud text-[9px] text-white/50 tracking-wider mb-2">CONTACT PHONE NUMBER</label>
                    <input
                      type="text"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="e.g. 9876543210"
                      className="w-full bg-black/50 border border-white/10 focus:border-cyan/50 text-white font-hud text-xs rounded-sm p-3 outline-none transition-all placeholder:text-white/20"
                    />
                  </div>
                  <div>
                    <label className="block font-hud text-[9px] text-white/50 tracking-wider mb-2">CHOOSE PASSWORD (MIN 6 CHARS)</label>
                    <input
                      type="password"
                      name="password"
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="••••••••"
                      className="w-full bg-black/50 border border-white/10 focus:border-cyan/50 text-white font-hud text-xs rounded-sm p-3 outline-none transition-all placeholder:text-white/20"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-hud text-[9px] text-white/50 tracking-wider mb-2">CITY</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="Mumbai"
                        className="w-full bg-black/50 border border-white/10 focus:border-cyan/50 text-white font-hud text-xs rounded-sm p-3 outline-none transition-all placeholder:text-white/20"
                      />
                    </div>
                    <div>
                      <label className="block font-hud text-[9px] text-white/50 tracking-wider mb-2">LANGUAGE</label>
                      <select
                        name="language"
                        value={formData.language}
                        onChange={handleInputChange}
                        className="w-full bg-black border border-white/10 focus:border-cyan/50 text-white font-hud text-xs rounded-sm p-3 outline-none transition-all"
                      >
                        <option value="en">English (EN)</option>
                        <option value="hi">हिन्दी (HI)</option>
                        <option value="mr">मराठी (MR)</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block font-hud text-[9px] text-white/50 tracking-wider mb-2">DEFAULT SOS MESSAGE (OPTIONAL)</label>
                    <textarea
                      name="defaultSOSMessage"
                      value={formData.defaultSOSMessage}
                      onChange={handleInputChange}
                      placeholder="I am in an emergency! Please track me..."
                      className="w-full bg-black/50 border border-white/10 focus:border-cyan/50 text-white font-hud text-xs rounded-sm p-3 outline-none transition-all placeholder:text-white/20 h-20 resize-none"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-cyan/20 border border-cyan/40 hover:border-cyan hover:bg-cyan/35 text-cyan hover:text-white font-hud text-xs tracking-[0.2em] rounded-sm p-4 transition-all duration-300 disabled:opacity-50 cursor-pointer shadow-[0_0_15px_rgba(0,217,255,0.05)] hover:shadow-[0_0_20px_rgba(0,217,255,0.2)]"
            >
              {loading ? 'PROCESSING SECURE UPLINK...' : isLogin ? 'INITIATE ACCESS' : 'CREATE CRYPTO PROFILE'}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
