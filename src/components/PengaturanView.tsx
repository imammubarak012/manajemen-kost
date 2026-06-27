import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Settings, User, Lock, Eye, EyeOff, Save, CheckCircle, AlertCircle } from 'lucide-react';

interface PengaturanViewProps {
  showToast: (message: string, type: 'success' | 'warning' | 'info') => void;
  onProfileUpdate: (newName: string) => void;
}

export default function PengaturanView({ showToast, onProfileUpdate }: PengaturanViewProps) {
  // Profil States
  const [adminName, setAdminName] = useState(() => {
    return localStorage.getItem('kost_admin_name') || 'Admin Pemilik Kost';
  });

  // Credential States
  const [username, setUsername] = useState(() => {
    return localStorage.getItem('kost_admin_username') || 'admin';
  });

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password Visibility States
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfPass, setShowConfPass] = useState(false);

  // Errors state
  const [profileErrors, setProfileErrors] = useState<{ [key: string]: string }>({});
  const [credentialErrors, setCredentialErrors] = useState<{ [key: string]: string }>({});

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileErrors({});

    if (!adminName.trim()) {
      setProfileErrors({ adminName: 'Nama Lengkap wajib diisi!' });
      return;
    }

    localStorage.setItem('kost_admin_name', adminName.trim());
    onProfileUpdate(adminName.trim());
    showToast('Profil Administrator berhasil diperbarui!', 'success');
  };

  const handleSaveCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    setCredentialErrors({});
    const errors: { [key: string]: string } = {};
    let isValid = true;

    if (!username.trim()) {
      errors.username = 'Username tidak boleh kosong!';
      isValid = false;
    }

    // Changing password or username
    if (oldPassword || newPassword || confirmPassword) {
      const storedPassword = localStorage.getItem('kost_admin_password') || 'admin123';

      if (!oldPassword) {
        errors.oldPassword = 'Password lama wajib diisi untuk mengubah password!';
        isValid = false;
      } else if (oldPassword !== storedPassword) {
        errors.oldPassword = 'Password lama yang Anda masukkan salah!';
        isValid = false;
      }

      if (!newPassword) {
        errors.newPassword = 'Password baru wajib diisi!';
        isValid = false;
      } else if (newPassword.length < 4) {
        errors.newPassword = 'Password baru minimal 4 karakter!';
        isValid = false;
      }

      if (newPassword !== confirmPassword) {
        errors.confirmPassword = 'Konfirmasi password baru tidak cocok!';
        isValid = false;
      }
    }

    if (!isValid) {
      setCredentialErrors(errors);
      return;
    }

    // Save changes
    localStorage.setItem('kost_admin_username', username.trim());
    if (newPassword) {
      localStorage.setItem('kost_admin_password', newPassword);
    }

    // Clear password inputs
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');

    showToast('Kredensial keamanan akun berhasil diperbarui!', 'success');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-emerald-400" />
          Pengaturan Akun KostHub
        </h1>
        <p className="text-slate-400 text-xs mt-1">
          Atur informasi profil admin pemilik kost dan perbarui kredensial keamanan akun secara real-time.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Form Profil */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-[-30%] right-[-20%] w-48 h-48 rounded-full bg-emerald-500/5 blur-[40px]" />
          
          <div className="flex items-center gap-2 mb-6 border-b border-slate-850 pb-4">
            <User className="w-5 h-5 text-emerald-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Profil Administrator</h2>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4 relative z-10">
            <div className="space-y-1.5">
              <label htmlFor="settings-admin-name" className="text-xs text-slate-300 font-medium">Nama Lengkap Pemilik Kost</label>
              <input
                id="settings-admin-name"
                type="text"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                placeholder="Masukkan nama lengkap Anda"
                className={`w-full px-4 py-2.5 bg-slate-950/40 border ${profileErrors.adminName ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-800 focus:border-emerald-500'} focus:ring-1 focus:ring-emerald-500 rounded-xl text-white text-xs outline-none transition-all`}
              />
              {profileErrors.adminName && (
                <span className="text-[10px] text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {profileErrors.adminName}
                </span>
              )}
            </div>

            <div className="pt-4 flex justify-end">
              <button
                id="save-profile-btn"
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-bold text-xs rounded-xl transition-all duration-150 cursor-pointer shadow-lg shadow-emerald-500/10"
              >
                <Save className="w-4 h-4" />
                Simpan Profil
              </button>
            </div>
          </form>
        </div>

        {/* 2. Form Kredensial */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-[-30%] right-[-20%] w-48 h-48 rounded-full bg-blue-500/5 blur-[40px]" />

          <div className="flex items-center gap-2 mb-6 border-b border-slate-850 pb-4">
            <Lock className="w-5 h-5 text-blue-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Kredensial Keamanan</h2>
          </div>

          <form onSubmit={handleSaveCredentials} className="space-y-4 relative z-10">
            {/* Username */}
            <div className="space-y-1.5">
              <label htmlFor="settings-username" className="text-xs text-slate-300 font-medium">Username Baru</label>
              <input
                id="settings-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username baru"
                className={`w-full px-4 py-2.5 bg-slate-950/40 border ${credentialErrors.username ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-800 focus:border-emerald-500'} focus:ring-1 focus:ring-emerald-500 rounded-xl text-white text-xs outline-none transition-all`}
              />
              {credentialErrors.username && (
                <span className="text-[10px] text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {credentialErrors.username}
                </span>
              )}
            </div>

            {/* Change Password Prompt */}
            <div className="p-3 bg-slate-950/40 border border-slate-850 rounded-xl space-y-3 mt-2">
              <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">Ubah Password Akun (Opsional)</span>

              {/* Password Lama */}
              <div className="space-y-1">
                <label htmlFor="settings-old-password" className="text-xs text-slate-300 font-medium">Password Lama</label>
                <div className="relative">
                  <input
                    id="settings-old-password"
                    type={showOldPass ? 'text' : 'password'}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="Masukkan password lama"
                    className={`w-full pl-4 pr-10 py-2 bg-slate-950/40 border ${credentialErrors.oldPassword ? 'border-rose-500' : 'border-slate-800'} focus:border-emerald-500 rounded-xl text-white text-xs outline-none transition-all`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPass(!showOldPass)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
                  >
                    {showOldPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {credentialErrors.oldPassword && (
                  <span className="text-[10px] text-rose-400 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {credentialErrors.oldPassword}
                  </span>
                )}
              </div>

              {/* Password Baru */}
              <div className="space-y-1">
                <label htmlFor="settings-new-password" className="text-xs text-slate-300 font-medium">Password Baru</label>
                <div className="relative">
                  <input
                    id="settings-new-password"
                    type={showNewPass ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Masukkan password baru"
                    className={`w-full pl-4 pr-10 py-2 bg-slate-950/40 border ${credentialErrors.newPassword ? 'border-rose-500' : 'border-slate-800'} focus:border-emerald-500 rounded-xl text-white text-xs outline-none transition-all`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
                  >
                    {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {credentialErrors.newPassword && (
                  <span className="text-[10px] text-rose-400 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {credentialErrors.newPassword}
                  </span>
                )}
              </div>

              {/* Konfirmasi Password Baru */}
              <div className="space-y-1">
                <label htmlFor="settings-confirm-password" className="text-xs text-slate-300 font-medium">Konfirmasi Password Baru</label>
                <div className="relative">
                  <input
                    id="settings-confirm-password"
                    type={showConfPass ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi password baru"
                    className={`w-full pl-4 pr-10 py-2 bg-slate-950/40 border ${credentialErrors.confirmPassword ? 'border-rose-500' : 'border-slate-800'} focus:border-emerald-500 rounded-xl text-white text-xs outline-none transition-all`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfPass(!showConfPass)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
                  >
                    {showConfPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {credentialErrors.confirmPassword && (
                  <span className="text-[10px] text-rose-400 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {credentialErrors.confirmPassword}
                  </span>
                )}
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                id="save-credentials-btn"
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-400 active:scale-95 text-slate-950 font-bold text-xs rounded-xl transition-all duration-150 cursor-pointer shadow-lg shadow-blue-500/10"
              >
                <Save className="w-4 h-4" />
                Simpan Keamanan
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
