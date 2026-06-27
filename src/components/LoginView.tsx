import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, User, Eye, EyeOff, Building2, ShieldAlert } from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: () => void;
}

export default function LoginView({ onLoginSuccess }: LoginViewProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!username || !password) {
      setError('Username dan Password wajib diisi!');
      return;
    }

    setIsLoading(true);

    const storedUsername = localStorage.getItem('kost_admin_username') || 'admin';
    const storedPassword = localStorage.getItem('kost_admin_password') || 'admin123';

    // Simulate network latency for a high-end feel
    setTimeout(() => {
      if (username === storedUsername && password === storedPassword) {
        onLoginSuccess();
      } else {
        setError('Username atau Password salah! Hubungi pemilik.');
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <div id="login-container" className="min-h-screen flex items-center justify-center bg-radial from-slate-900 via-slate-950 to-black p-4 relative overflow-hidden">
      {/* Dynamic Background Accents */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-emerald-500/10 blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-blue-500/10 blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        {/* Logo and Brand */}
        <div className="text-center mb-8">
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="inline-flex items-center justify-center p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl mb-4 backdrop-blur-md"
          >
            <Building2 className="w-10 h-10 text-emerald-400" />
          </motion.div>
          <h1 className="text-3xl font-bold tracking-tight text-white font-sans">
            Kost<span className="text-emerald-400">Hub</span>
          </h1>
          <p className="text-slate-400 text-sm mt-2">Sistem Manajemen Kamar Kost Modern & Terintegrasi</p>
        </div>

        {/* Glassmorphic Login Card */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          {/* Neon line decoration */}
          <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500" />
          
          <h2 className="text-xl font-semibold text-white mb-6">Login Admin</h2>

          {error && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-3 text-rose-200 text-sm"
            >
              <ShieldAlert className="w-5 h-5 shrink-0 text-rose-400" />
              <span>{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username Input */}
            <div className="space-y-1.5">
              <label htmlFor="username-input" className="text-xs font-medium text-slate-300">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="username-input"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username"
                  className="w-full pl-10 pr-4 py-3 bg-slate-950/40 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-white placeholder-slate-500 text-sm outline-none transition-all duration-200"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password-input" className="text-xs font-medium text-slate-300">Password</label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  className="w-full pl-10 pr-10 py-3 bg-slate-950/40 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-white placeholder-slate-500 text-sm outline-none transition-all duration-200"
                  disabled={isLoading}
                />
                <button
                  id="toggle-password-btn"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              id="login-submit-btn"
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 mt-8 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 active:scale-[0.98] text-slate-950 text-sm font-semibold rounded-xl shadow-lg shadow-emerald-500/20 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-55 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                'Masuk ke Dashboard'
              )}
            </button>
          </form>
        </div>

        {/* Footer info */}
        <div className="text-center mt-6 text-xs text-slate-600">
          KostHub Admin Panel v1.0.0 • Secured Offline Mode
        </div>
      </motion.div>
    </div>
  );
}
