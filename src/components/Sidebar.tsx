import { LayoutDashboard, BedDouble, Users, Wallet, LogOut, Menu, X, Building2, Settings } from 'lucide-react';
import { ActiveTab } from '../types';
import { motion } from 'motion/react';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onLogout: () => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  adminName?: string;
}

export default function Sidebar({ activeTab, setActiveTab, onLogout, isOpen, setIsOpen, adminName }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard' as ActiveTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'kelola-kamar' as ActiveTab, label: 'Kelola Kamar', icon: BedDouble },
    { id: 'data-penghuni' as ActiveTab, label: 'Data Penghuni', icon: Users },
    { id: 'laporan-keuangan' as ActiveTab, label: 'Laporan Keuangan', icon: Wallet },
    { id: 'pengaturan' as ActiveTab, label: 'Pengaturan', icon: Settings },
  ];

  const displayName = adminName || localStorage.getItem('kost_admin_name') || 'Admin Pemilik Kost';
  
  // Calculate initials
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'AD';

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-slate-900 border-b border-slate-850 text-white fixed top-0 left-0 right-0 z-40">
        <div className="flex items-center gap-2">
          <Building2 className="w-6 h-6 text-emerald-400" />
          <span className="font-bold tracking-tight text-lg">Kost<span className="text-emerald-400">Hub</span></span>
        </div>
        <button
          id="toggle-sidebar-btn"
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 hover:bg-slate-800 rounded-xl transition-colors text-slate-300 focus:outline-none"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Wrapper */}
      <aside
        id="app-sidebar"
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-850 text-white flex flex-col justify-between transform transition-transform duration-300 ease-in-out lg:translate-x-0 pt-16 lg:pt-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Logo / Desktop Header */}
          <div className="hidden lg:flex items-center gap-3 px-6 py-8 border-b border-slate-850/60">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <Building2 className="w-6 h-6 text-emerald-400" />
            </div>
            <span className="font-bold text-xl tracking-tight">Kost<span className="text-emerald-400">Hub</span></span>
          </div>

          {/* User Profile Info */}
          <div className="px-6 py-6 border-b border-slate-850/40 bg-slate-950/20">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center font-bold text-slate-950 text-xs">
                  {initials}
                </div>
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-900 rounded-full animate-pulse" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-medium text-sm text-slate-100 truncate" title={displayName}>{displayName}</h3>
                <p className="text-xs text-slate-400">Utama • Online</p>
              </div>
            </div>
          </div>

          {/* Menu Navigation Items */}
          <nav className="px-4 py-6 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  id={`nav-item-${item.id}`}
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsOpen(false); // Close sidebar on mobile select
                  }}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 relative group cursor-pointer ${
                    isActive
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'text-slate-400 hover:text-slate-150 hover:bg-slate-850/50'
                  }`}
                >
                  {/* Active background bar */}
                  {isActive && (
                    <motion.div
                      layoutId="active-indicator"
                      className="absolute left-0 w-1 h-6 bg-emerald-400 rounded-r-full"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                  <Icon className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-300'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Logout Button Footer */}
        <div className="p-4 border-t border-slate-850/40 bg-slate-950/10">
          <button
            id="sidebar-logout-btn"
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all duration-200 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Keluar Sistem
          </button>
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          id="sidebar-backdrop"
          onClick={() => setIsOpen(false)}
          className="lg:hidden fixed inset-0 z-30 bg-black/60 backdrop-blur-sm"
        />
      )}
    </>
  );
}
