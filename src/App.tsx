/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Room, Transaction, ActiveTab } from './types';
import { DEFAULT_ROOMS, DEFAULT_TRANSACTIONS } from './data';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, HelpCircle, X, CheckCircle, AlertTriangle } from 'lucide-react';

// Subcomponents
import LoginView from './components/LoginView';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import KelolaKamarView from './components/KelolaKamarView';
import DataPenghuniView from './components/DataPenghuniView';
import LaporanKeuanganView from './components/LaporanKeuanganView';
import PengaturanView from './components/PengaturanView';
import { addOneMonth, formatDateIndo } from './utils';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'warning' | 'info';
}

export default function App() {
  // 1. Core States with LocalStorage Hydration
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    const stored = localStorage.getItem('kost_is_logged_in');
    return stored === 'true';
  });

  const [adminName, setAdminName] = useState<string>(() => {
    return localStorage.getItem('kost_admin_name') || 'Admin Pemilik Kost';
  });

  const [rooms, setRooms] = useState<Room[]>(() => {
    const stored = localStorage.getItem('kost_rooms_data');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length === 100) {
          return parsed;
        }
      } catch (e) {
        // Fallback to default
      }
    }
    return DEFAULT_ROOMS;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const stored = localStorage.getItem('kost_transactions_data');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // If rooms were reset, we reset transactions to align
        const storedRooms = localStorage.getItem('kost_rooms_data');
        if (storedRooms) {
          const parsedRooms = JSON.parse(storedRooms);
          if (Array.isArray(parsedRooms) && parsedRooms.length === 100) {
            return parsed;
          }
        }
      } catch (e) {
        // Fallback to default
      }
    }
    return DEFAULT_TRANSACTIONS;
  });

  const [currentDate, setCurrentDate] = useState<string>(() => {
    const stored = localStorage.getItem('kost_current_date');
    return stored || '2026-06-26'; // Default reference date aligned with current session
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // 2. Synchronize States with LocalStorage
  useEffect(() => {
    localStorage.setItem('kost_is_logged_in', String(isLoggedIn));
  }, [isLoggedIn]);

  useEffect(() => {
    localStorage.setItem('kost_rooms_data', JSON.stringify(rooms));
  }, [rooms]);

  useEffect(() => {
    localStorage.setItem('kost_transactions_data', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('kost_current_date', currentDate);
  }, [currentDate]);

  // 3. Toast Helper Function
  const showToast = (message: string, type: 'success' | 'warning' | 'info' = 'success') => {
    const newToast: Toast = {
      id: `toast-${Date.now()}`,
      message,
      type
    };
    setToasts(prev => [...prev, newToast]);
    setTimeout(() => {
      removeToast(newToast.id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // 4. State Modification Actions
  const handleLogin = () => {
    setIsLoggedIn(true);
    showToast('Selamat Datang! Login Berhasil sebagai Administrator.', 'success');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setActiveTab('dashboard');
    showToast('Anda telah keluar dari sistem KostHub.', 'info');
  };

  const handleAddRoom = (newRoom: Room) => {
    setRooms(prev => [...prev, newRoom]);
    showToast(`Kamar ${newRoom.roomNumber} berhasil ditambahkan!`, 'success');
  };

  const handleUpdateRoom = (updatedRoom: Room) => {
    setRooms(prev => prev.map(r => r.id === updatedRoom.id ? updatedRoom : r));
    showToast(`Data Kamar ${updatedRoom.roomNumber} berhasil diperbarui!`, 'success');
  };

  const handleDeleteRoom = (roomId: string) => {
    const roomToDelete = rooms.find(r => r.id === roomId);
    if (roomToDelete) {
      setRooms(prev => prev.filter(r => r.id !== roomId));
      showToast(`Kamar ${roomToDelete.roomNumber} berhasil dihapus dari sistem.`, 'warning');
    }
  };

  const handleAddTransaction = (newTx: Transaction) => {
    setTransactions(prev => [newTx, ...prev]);

    let calculatedNextDueDate = '';
    if (newTx.type === 'Sewa') {
      setRooms(prevRooms => prevRooms.map(r => {
        if (r.roomNumber === newTx.roomNumber && r.status === 'Terisi' && r.tenant) {
          const currentDueDate = r.tenant.nextDueDate || r.tenant.checkInDate;
          calculatedNextDueDate = addOneMonth(currentDueDate);
          return {
            ...r,
            tenant: {
              ...r.tenant,
              nextDueDate: calculatedNextDueDate
            }
          };
        }
        return r;
      }));
    }

    if (calculatedNextDueDate) {
      showToast(`Pembayaran sewa Kamar ${newTx.roomNumber} (${newTx.tenantName}) berhasil dicatat! Tanggal jatuh tempo diperbarui otomatis ke ${formatDateIndo(calculatedNextDueDate)}.`, 'success');
    } else {
      showToast(`Transaksi Kamar ${newTx.roomNumber} (${newTx.tenantName}) berhasil dicatat!`, 'success');
    }
  };

  const handleDeleteTransaction = (txId: string) => {
    const txToDelete = transactions.find(t => t.id === txId);
    if (txToDelete) {
      setTransactions(prev => prev.filter(t => t.id !== txId));
      showToast(`Transaksi Kamar ${txToDelete.roomNumber} (${txToDelete.tenantName}) sebesar Rp ${txToDelete.amount.toLocaleString('id-ID')} telah dihapus.`, 'warning');
    }
  };

  // Switch tabs programmatically
  const handleNavigate = (tab: 'kelola-kamar' | 'data-penghuni' | 'laporan-keuangan') => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Render Login view if user is unauthenticated
  if (!isLoggedIn) {
    return (
      <>
        <LoginView onLoginSuccess={handleLogin} />
        {/* Toast Overlay */}
        <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
          {toasts.map(toast => (
            <div key={toast.id} className="pointer-events-auto">
              <ToastItem toast={toast} onClose={removeToast} />
            </div>
          ))}
        </div>
      </>
    );
  }

  // Active view router mapping
  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardView
            rooms={rooms}
            transactions={transactions}
            currentDate={currentDate}
            setCurrentDate={(date) => {
              setCurrentDate(date);
              showToast(`Tanggal simulasi sistem diubah ke ${date}`, 'info');
            }}
            onNavigate={handleNavigate}
          />
        );
      case 'kelola-kamar':
        return (
          <KelolaKamarView
            rooms={rooms}
            currentDate={currentDate}
            onAddRoom={handleAddRoom}
            onUpdateRoom={handleUpdateRoom}
            onDeleteRoom={handleDeleteRoom}
          />
        );
      case 'data-penghuni':
        return (
          <DataPenghuniView
            rooms={rooms}
            onNavigateToManage={() => handleNavigate('kelola-kamar')}
          />
        );
      case 'laporan-keuangan':
        return (
          <LaporanKeuanganView
            rooms={rooms}
            transactions={transactions}
            onAddTransaction={handleAddTransaction}
            onDeleteTransaction={handleDeleteTransaction}
            currentDate={currentDate}
          />
        );
      case 'pengaturan':
        return (
          <PengaturanView
            showToast={showToast}
            onProfileUpdate={setAdminName}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans selection:bg-emerald-500/30 selection:text-emerald-300">
      
      {/* 1. Sidebar Panel */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        adminName={adminName}
      />

      {/* 2. Main Content Container */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0 min-h-screen">
        
        {/* Top Navbar */}
        <header className="h-16 border-b border-slate-900 bg-slate-950/80 backdrop-blur-md px-6 md:px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="hidden lg:flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
              Sistem Manajemen Kost Aktif
            </span>
          </div>
          <div className="lg:hidden" /> {/* Spacer for mobile hamburger menu alignment */}

          {/* Top Panel Actions */}
          <div className="flex items-center gap-4">
            {/* Simulation date context reminder */}
            <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 bg-slate-900/50 px-3 py-1.5 rounded-xl border border-slate-850">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Simulasi Hari: <strong className="text-emerald-400 font-mono">{currentDate}</strong></span>
            </div>

            {/* Quick stats indicator - Removed Notification Bell */}
          </div>
        </header>

        {/* Dynamic Route View Page */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full pt-20 lg:pt-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderActiveView()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* 3. Toast Pop-up Stack */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
              className="pointer-events-auto"
            >
              <ToastItem toast={toast} onClose={removeToast} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

    </div>
  );
}

// Separate Mini Toast Component for cleaner code
function ToastItem({ toast, onClose }: { toast: Toast; onClose: (id: string) => void }) {
  const getStyle = () => {
    switch (toast.type) {
      case 'success':
        return {
          bg: 'bg-slate-900/95 border-emerald-500/30 text-emerald-100 shadow-emerald-950/20',
          icon: <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
        };
      case 'warning':
        return {
          bg: 'bg-slate-900/95 border-rose-500/30 text-rose-100 shadow-rose-950/20',
          icon: <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
        };
      case 'info':
      default:
        return {
          bg: 'bg-slate-900/95 border-blue-500/30 text-blue-100 shadow-blue-950/20',
          icon: <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0" />
        };
    }
  };

  const style = getStyle();

  return (
    <div className={`flex items-start gap-3.5 p-4 rounded-2xl border backdrop-blur-md shadow-xl ${style.bg} pointer-events-auto relative overflow-hidden group`}>
      {/* Soft indicator bar on left side */}
      <div className={`absolute top-0 bottom-0 left-0 w-1 ${
        toast.type === 'success' ? 'bg-emerald-500' : toast.type === 'warning' ? 'bg-rose-500' : 'bg-blue-500'
      }`} />

      {style.icon}
      
      <div className="flex-1 text-xs font-medium leading-relaxed">
        {toast.message}
      </div>

      <button
        onClick={() => onClose(toast.id)}
        className="p-1 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-white transition-colors cursor-pointer shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
