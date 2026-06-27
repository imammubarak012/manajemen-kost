import { motion } from 'motion/react';
import { Home, DoorOpen, Users, Clock, AlertTriangle, ChevronRight, Calendar, ArrowRight, TrendingUp, Sparkles, Wallet, BedDouble } from 'lucide-react';
import { Room, Transaction } from '../types';
import { formatRupiah, getTenantDueStatus } from '../utils';

interface DashboardViewProps {
  rooms: Room[];
  transactions: Transaction[];
  currentDate: string;
  setCurrentDate: (date: string) => void;
  onNavigate: (tab: 'kelola-kamar' | 'data-penghuni' | 'laporan-keuangan') => void;
}

export default function DashboardView({ rooms, transactions, currentDate, setCurrentDate, onNavigate }: DashboardViewProps) {
  // Metric Calculations
  const totalRooms = rooms.length;
  const occupiedRooms = rooms.filter(r => r.status === 'Terisi').length;
  const emptyRooms = rooms.filter(r => r.status === 'Tersedia').length;

  const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

  // List of rooms due soon or overdue with their details for rapid dashboard actions
  const dueSoonDetails = rooms
    .filter(r => r.status === 'Terisi' && r.tenant)
    .map(r => {
      const status = getTenantDueStatus(r.tenant!.checkInDate, currentDate, transactions, r.tenant!.nextDueDate);
      return {
        ...r,
        daysRemaining: status.daysRemaining,
        nextDue: status.nextDueStr,
        isOverdue: status.isOverdue,
        statusText: status.statusText,
        dueMonthName: status.dueMonthName
      };
    })
    // Filter to only include Overdue or Due Soon (H-5)
    .filter(item => item.statusText === 'Overdue' || item.statusText === 'Due Soon')
    // Sort: Overdue first (most urgent, negative days remaining), then by days remaining ascending
    .sort((a, b) => {
      if (a.isOverdue && !b.isOverdue) return -1;
      if (!a.isOverdue && b.isOverdue) return 1;
      return a.daysRemaining - b.daysRemaining;
    });

  const dueSoonRoomsCount = dueSoonDetails.filter(item => item.statusText === 'Due Soon').length;
  const overdueRoomsCount = dueSoonDetails.filter(item => item.statusText === 'Overdue').length;

  // Quick stats calculations
  const totalPotentialIncome = rooms.reduce((acc, r) => acc + r.price, 0);
  const currentIncome = rooms.filter(r => r.status === 'Terisi').reduce((acc, r) => acc + r.price, 0);

  // Container variants for staggered entrance
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 15 } }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Upper Welcome Banner with Date Config */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-800 rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-xl">
        {/* Subtle glow decorative circles */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-emerald-500/5 blur-[80px]" />
        
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-full">
            <Sparkles className="w-3 h-3" />
            Sistem Aktif & Terpantau
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">Selamat Datang, Admin!</h1>
          <p className="text-slate-400 text-sm max-w-lg">
            Pantau dan kelola sewa kamar kost Anda secara real-time. Semua perhitungan tanggal jatuh tempo dihitung otomatis oleh sistem.
          </p>
        </div>

        {/* Date Context Changer (Aesthetic and Functional validation playground) */}
        <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-4 shrink-0 relative z-10 space-y-2 max-w-xs">
          <div className="flex items-center gap-2 text-slate-300 text-xs font-medium">
            <Calendar className="w-4 h-4 text-emerald-400" />
            Simulasi Tanggal Sistem:
          </div>
          <input
            id="system-date-input"
            type="date"
            value={currentDate}
            onChange={(e) => {
              if (e.target.value) {
                setCurrentDate(e.target.value);
              }
            }}
            className="w-full bg-slate-900 border border-slate-750 focus:border-emerald-500 rounded-xl px-3 py-2 text-white text-xs font-mono outline-none transition-all cursor-pointer"
          />
          <p className="text-[10px] text-slate-500">
            *Mengubah tanggal ini akan mengubah perhitungan jatuh tempo (H-5) secara dinamis.
          </p>
        </div>
      </div>

      {/* Metric Cards - 5 Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5"
      >
        {/* 1. Total Kamar */}
        <motion.div
          variants={itemVariants}
          className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 shadow-lg flex items-center justify-between group hover:border-slate-700 transition-all duration-200"
        >
          <div className="space-y-1.5">
            <span className="text-slate-400 text-xs font-medium">Total Kamar</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white font-mono">{totalRooms}</span>
              <span className="text-xs text-slate-500">Unit</span>
            </div>
          </div>
          <div className="p-3 bg-slate-850 rounded-xl group-hover:bg-slate-800 group-hover:text-white transition-colors text-slate-400">
            <Home className="w-5 h-5 text-slate-300" />
          </div>
        </motion.div>

        {/* 2. Kamar Kosong */}
        <motion.div
          variants={itemVariants}
          className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 shadow-lg flex items-center justify-between group hover:border-slate-700 transition-all duration-200"
        >
          <div className="space-y-1.5">
            <span className="text-slate-400 text-xs font-medium">Kamar Kosong</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-emerald-400 font-mono">{emptyRooms}</span>
              <span className="text-xs text-slate-500">Tersedia</span>
            </div>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-xl group-hover:bg-emerald-500/15 text-emerald-400 transition-colors">
            <DoorOpen className="w-5 h-5" />
          </div>
        </motion.div>

        {/* 3. Kamar Terisi */}
        <motion.div
          variants={itemVariants}
          className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 shadow-lg flex items-center justify-between group hover:border-slate-700 transition-all duration-200"
        >
          <div className="space-y-1.5">
            <span className="text-slate-400 text-xs font-medium">Kamar Terisi</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-blue-400 font-mono">{occupiedRooms}</span>
              <span className="text-xs text-slate-500">Terisi</span>
            </div>
          </div>
          <div className="p-3 bg-blue-500/10 rounded-xl group-hover:bg-blue-500/15 text-blue-400 transition-colors">
            <Users className="w-5 h-5" />
          </div>
        </motion.div>

        {/* 4. H-5 Jatuh Tempo */}
        <motion.div
          variants={itemVariants}
          className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 shadow-lg flex items-center justify-between group hover:border-slate-700 transition-all duration-200"
        >
          <div className="space-y-1.5">
            <span className="text-slate-400 text-xs font-medium">H-5 Jatuh Tempo</span>
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-bold font-mono ${dueSoonRoomsCount > 0 ? 'text-amber-400 animate-pulse' : 'text-slate-300'}`}>{dueSoonRoomsCount}</span>
              <span className="text-xs text-slate-500">Kamar</span>
            </div>
          </div>
          <div className="p-3 bg-amber-500/10 rounded-xl group-hover:bg-amber-500/15 text-amber-400 transition-colors">
            <Clock className="w-5 h-5" />
          </div>
        </motion.div>

        {/* 5. Sudah Lewat Tempo */}
        <motion.div
          variants={itemVariants}
          className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 shadow-lg flex items-center justify-between group hover:border-slate-700 transition-all duration-200"
        >
          <div className="space-y-1.5">
            <span className="text-slate-400 text-xs font-medium">Sudah Lewat Tempo</span>
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-bold font-mono ${overdueRoomsCount > 0 ? 'text-red-500 animate-pulse' : 'text-slate-300'}`}>{overdueRoomsCount}</span>
              <span className="text-xs text-slate-500">Wajib Bayar</span>
            </div>
          </div>
          <div className="p-3 bg-red-500/10 rounded-xl group-hover:bg-red-500/15 text-red-450 text-red-400 transition-colors">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </motion.div>
      </motion.div>

      {/* Main Grid: Statistics & Action Reminders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Span 2: Occupancy Rate and Financial Summary Chart Cards */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Metrics Graph Dashboard */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h2 className="text-lg font-bold text-white tracking-tight">Status Okupansi Kost</h2>
                <p className="text-xs text-slate-500">Persentase kamar terisi dari total kapasitas kamar kost.</p>
              </div>
              <div className="px-3 py-1 bg-slate-850 rounded-lg text-xs font-semibold text-slate-300">
                {occupancyRate}% Terisi
              </div>
            </div>

            {/* Progress Bar Okupansi */}
            <div className="space-y-2">
              <div className="w-full bg-slate-800 rounded-full h-4 overflow-hidden p-0.5 border border-slate-700">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${occupancyRate}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 h-full rounded-full"
                />
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500 px-1 font-mono">
                <span>0% (Kosong)</span>
                <span>50% (Setengah)</span>
                <span>100% (Penuh)</span>
              </div>
            </div>

            {/* Quick stats grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-850">
              <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-xl space-y-1">
                <div className="text-xs text-slate-400 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  Estimasi Pemasukan Aktif
                </div>
                <div className="text-xl font-bold text-white font-mono">{formatRupiah(currentIncome)}</div>
                <p className="text-[10px] text-slate-500">Dari total {occupiedRooms} kamar terisi aktif bulan ini.</p>
              </div>

              <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-xl space-y-1">
                <div className="text-xs text-slate-400">Total Potensi Finansial (100% Okupansi)</div>
                <div className="text-xl font-bold text-slate-300 font-mono">{formatRupiah(totalPotentialIncome)}</div>
                <p className="text-[10px] text-slate-500">Jika semua kamar terisi penuh pada kapasitas maksimal.</p>
              </div>
            </div>
          </div>

          {/* Quick Navigator Board */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 shadow-xl">
            <h2 className="text-lg font-bold text-white tracking-tight mb-4">Akses Cepat Pengelolaan</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                id="quick-nav-manage-rooms-btn"
                onClick={() => onNavigate('kelola-kamar')}
                className="p-4 bg-slate-950/30 border border-slate-800 hover:border-slate-750 hover:bg-slate-850/30 rounded-xl text-left space-y-2 group transition-all duration-200 cursor-pointer"
              >
                <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg w-max">
                  <BedDouble className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-sm text-slate-200">Kelola Kamar</h3>
                <p className="text-xs text-slate-500 leading-snug">Tambah, edit, hapus kamar, & ubah status huni.</p>
                <div className="text-xs text-emerald-400 flex items-center gap-1 pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  Kelola Kamar <ArrowRight className="w-3 h-3" />
                </div>
              </button>

              <button
                id="quick-nav-tenants-btn"
                onClick={() => onNavigate('data-penghuni')}
                className="p-4 bg-slate-950/30 border border-slate-800 hover:border-slate-750 hover:bg-slate-850/30 rounded-xl text-left space-y-2 group transition-all duration-200 cursor-pointer"
              >
                <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg w-max">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-sm text-slate-200">Data Penghuni</h3>
                <p className="text-xs text-slate-500 leading-snug">Lihat daftar penghuni aktif & cari data instan.</p>
                <div className="text-xs text-blue-400 flex items-center gap-1 pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  Lihat Penghuni <ArrowRight className="w-3 h-3" />
                </div>
              </button>

              <button
                id="quick-nav-finance-btn"
                onClick={() => onNavigate('laporan-keuangan')}
                className="p-4 bg-slate-950/30 border border-slate-800 hover:border-slate-750 hover:bg-slate-850/30 rounded-xl text-left space-y-2 group transition-all duration-200 cursor-pointer"
              >
                <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg w-max">
                  <Wallet className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-sm text-slate-200">Laporan Keuangan</h3>
                <p className="text-xs text-slate-500 leading-snug">Pemasukan sewa real-time & riwayat transaksi.</p>
                <div className="text-xs text-amber-400 flex items-center gap-1 pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  Keuangan <ArrowRight className="w-3 h-3" />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Right Span 1: Dynamic Due-Date Monitor */}
        <div className="space-y-6">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 shadow-xl flex flex-col h-full min-h-[400px]">
            <div className="flex items-center justify-between pb-4 border-b border-slate-850 mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <h2 className="text-md font-bold text-white tracking-tight">Peringatan Jatuh Tempo</h2>
              </div>
              <span className="px-2.5 py-0.5 bg-amber-500/10 text-amber-400 text-xs font-mono font-bold rounded-full">
                H-5
              </span>
            </div>

             {dueSoonDetails.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="p-4 bg-emerald-500/15 text-emerald-400 rounded-full">
                  <DoorOpen className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-white">Tidak Ada Jatuh Tempo Terdekat</h3>
                  <p className="text-xs text-slate-400 max-w-[200px] mx-auto">
                    Semua penghuni memiliki tenggang waktu pembayaran lebih dari 5 hari.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex-1 space-y-4 overflow-y-auto pr-1 max-h-[380px]">
                {dueSoonDetails.map((room) => {
                  return (
                    <div 
                      key={room.id}
                      className={`p-3 bg-slate-950/40 border rounded-xl space-y-2 group transition-all duration-150 ${
                        room.isOverdue 
                          ? 'border-red-900/30 hover:border-red-500/30 bg-gradient-to-r from-red-500/5 to-transparent' 
                          : 'border-slate-850 hover:border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white px-2 py-0.5 bg-slate-850 rounded">
                            No. {room.roomNumber}
                          </span>
                          <span className="text-[10px] text-slate-500">{room.type}</span>
                        </div>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          room.isOverdue 
                            ? 'bg-red-500/10 text-red-400 border border-red-500/25' 
                            : room.daysRemaining === 0 
                            ? 'bg-amber-500/20 text-amber-300 animate-pulse border border-amber-500/30'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {room.isOverdue 
                            ? 'Sudah Lewat Tempo (Wajib Bayar)' 
                            : room.daysRemaining === 0 
                            ? 'Jatuh Tempo Hari Ini' 
                            : `Hampir Jatuh Tempo (${room.daysRemaining} Hari)`}
                        </span>
                      </div>
 
                      <div className="space-y-0.5">
                        <h4 className="font-semibold text-xs text-slate-200">{room.tenant?.name}</h4>
                        <p className="text-[10px] text-slate-500 flex items-center gap-1">
                          Masuk: {room.tenant ? room.tenant.checkInDate : '-'}
                        </p>
                        <p className={`text-[10px] flex items-center gap-1 font-medium ${room.isOverdue ? 'text-red-400' : 'text-amber-400/90'}`}>
                          Batas Bayar: {room.nextDue}
                        </p>
                      </div>
 
                      <div className="flex items-center justify-between pt-1 border-t border-slate-850/60 text-[10px]">
                        <span className="text-slate-400 font-mono font-medium">{formatRupiah(room.price)}</span>
                        <button 
                          id={`go-to-room-action-${room.roomNumber}`}
                          onClick={() => onNavigate('kelola-kamar')}
                          className="text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform"
                        >
                          Kelola <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
