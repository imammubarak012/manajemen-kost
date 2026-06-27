import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wallet, Landmark, TrendingUp, History, Plus, 
  CircleCheck, Info, Sparkles, Receipt, Trash2, 
  X, AlertCircle, BedDouble, Users 
} from 'lucide-react';
import { Room, Transaction } from '../types';
import { formatRupiah, formatDateIndo } from '../utils';

interface LaporanKeuanganViewProps {
  rooms: Room[];
  transactions: Transaction[];
  onAddTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (txId: string) => void;
  currentDate: string;
}

export default function LaporanKeuanganView({ 
  rooms, 
  transactions, 
  onAddTransaction, 
  onDeleteTransaction, 
  currentDate 
}: LaporanKeuanganViewProps) {
  
  const [filterMonth, setFilterMonth] = useState<string>('Semua');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Modal Form States
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [transactionDate, setTransactionDate] = useState(currentDate);
  const [transactionType, setTransactionType] = useState<'Sewa' | 'Lainnya'>('Sewa');
  const [transactionMonth, setTransactionMonth] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // 1. Current Active Income
  const activeRooms = rooms.filter(r => r.status === 'Terisi');
  const activeMonthlyRent = activeRooms.reduce((acc, r) => acc + r.price, 0);

  // 2. Accumulated Historical Revenue
  const totalReceivedRevenue = transactions.reduce((acc, tx) => acc + tx.amount, 0);

  // 3. Occupancy Metrics
  const totalRooms = rooms.length;
  const occupiedCount = activeRooms.length;
  const vacantCount = totalRooms - occupiedCount;
  const occupancyRate = totalRooms > 0 ? Math.round((occupiedCount / totalRooms) * 100) : 0;

  // Distinct months for filters
  const months = ['Semua', ...Array.from(new Set(transactions.map(tx => tx.month)))];

  // Filtered transactions
  const filteredTransactions = transactions
    .filter(tx => filterMonth === 'Semua' || tx.month === filterMonth)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Auto-calculate billing month when transactionDate changes
  useEffect(() => {
    if (transactionDate) {
      const d = new Date(transactionDate);
      if (!isNaN(d.getTime())) {
        const calculatedMonth = d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
        setTransactionMonth(calculatedMonth);
      }
    }
  }, [transactionDate]);

  // Handle room selection in form
  const handleRoomSelect = (roomId: string) => {
    setSelectedRoomId(roomId);
    const room = rooms.find(r => r.id === roomId);
    if (room) {
      setAmount(room.price);
    } else {
      setAmount(0);
    }
  };

  const handleOpenModal = () => {
    setSelectedRoomId('');
    setAmount(0);
    setTransactionDate(currentDate);
    setTransactionType('Sewa');
    setErrors({});
    setIsModalOpen(true);
  };

  const handleSaveTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const tempErrors: { [key: string]: string } = {};
    let isValid = true;

    if (!selectedRoomId) {
      tempErrors.selectedRoomId = 'Pilih kamar terlebih dahulu!';
      isValid = false;
    }

    if (!amount || amount <= 0) {
      tempErrors.amount = 'Jumlah bayar sewa wajib diisi dan lebih dari 0!';
      isValid = false;
    }

    if (!transactionDate) {
      tempErrors.transactionDate = 'Tanggal transaksi wajib diisi!';
      isValid = false;
    }

    if (!transactionMonth.trim()) {
      tempErrors.transactionMonth = 'Siklus bulan wajib diisi!';
      isValid = false;
    }

    if (!isValid) {
      setErrors(tempErrors);
      return;
    }

    const room = rooms.find(r => r.id === selectedRoomId);
    if (!room || !room.tenant) return;

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      roomNumber: room.roomNumber,
      tenantName: room.tenant.name,
      amount: Number(amount),
      date: transactionDate,
      month: transactionMonth,
      type: transactionType
    };

    onAddTransaction(newTx);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Laporan Keuangan Kost</h1>
          <p className="text-slate-400 text-xs">Pencatatan real-time pendapatan sewa masuk dan otomasi penyesuaian jatuh tempo kamar.</p>
        </div>
        <button
          id="add-transaction-btn"
          onClick={handleOpenModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-semibold text-xs rounded-xl transition-all duration-150 cursor-pointer shadow-lg shadow-emerald-500/10"
        >
          <Plus className="w-4 h-4" />
          Tambah Transaksi Pembayaran
        </button>
      </div>

      {/* Financial Bento Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Metric 1: Pemasukan Sewa Aktif */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between h-[180px]">
          <div className="absolute top-[-40%] right-[-20%] w-48 h-48 rounded-full bg-emerald-500/5 blur-[40px]" />
          
          <div className="space-y-1.5 relative z-10">
            <span className="text-slate-400 text-xs font-medium flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Potensi Pemasukan Aktif (Bulanan)
            </span>
            <div className="text-3xl font-extrabold text-white tracking-tight font-mono pt-1">
              {formatRupiah(activeMonthlyRent)}
            </div>
          </div>

          <div className="text-[10px] text-slate-500 border-t border-slate-850/60 pt-3 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Akumulasi sewa berjalan dari {occupiedCount} kamar terisi saat ini.</span>
          </div>
        </div>

        {/* Metric 2: Total Dana Terkumpul */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between h-[180px]">
          <div className="absolute top-[-40%] right-[-20%] w-48 h-48 rounded-full bg-teal-500/5 blur-[40px]" />

          <div className="space-y-1.5 relative z-10">
            <span className="text-slate-400 text-xs font-medium flex items-center gap-1.5">
              <Landmark className="w-4 h-4 text-teal-400" />
              Total Dana Kas Terkumpul
            </span>
            <div className="text-3xl font-extrabold text-emerald-400 tracking-tight font-mono pt-1">
              {formatRupiah(totalReceivedRevenue)}
            </div>
          </div>

          <div className="text-[10px] text-slate-500 border-t border-slate-850/60 pt-3 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-teal-400 shrink-0" />
            <span>Akumulasi total dari {transactions.length} transaksi pembayaran sewa.</span>
          </div>
        </div>

        {/* Metric 3: Tingkat Hunian Kost */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between h-[180px]">
          <div className="absolute top-[-40%] right-[-20%] w-48 h-48 rounded-full bg-blue-500/5 blur-[40px]" />

          <div className="space-y-2 relative z-10">
            <div className="flex justify-between items-center text-slate-400 text-xs font-medium">
              <span className="flex items-center gap-1.5">
                <BedDouble className="w-4 h-4 text-blue-400" />
                Tingkat Okupansi Kost
              </span>
              <span className="font-bold text-blue-400">{occupancyRate}%</span>
            </div>
            
            {/* Visual Bar Indicator */}
            <div className="w-full bg-slate-950/60 h-2.5 rounded-full overflow-hidden border border-slate-850">
              <div 
                className="bg-gradient-to-r from-blue-500 to-teal-400 h-full rounded-full transition-all duration-300"
                style={{ width: `${occupancyRate}%` }}
              />
            </div>
          </div>

          <div className="text-[10px] text-slate-500 border-t border-slate-850/60 pt-3 flex justify-between items-center">
            <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> Terisi: <strong>{occupiedCount} Kamar</strong></span>
            <span className="text-emerald-400">Tersedia: <strong>{vacantCount} Kamar</strong></span>
          </div>
        </div>

      </div>

      {/* Transactions History Header & Filters */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-slate-400" />
            <h2 className="text-md font-bold text-white">Riwayat Transaksi Pembayaran</h2>
          </div>

          {/* Month Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Filter Bulan:</span>
            <select
              id="month-transaction-filter"
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="bg-slate-950/40 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-1.5 text-xs text-white outline-none cursor-pointer"
            >
              {months.map(m => (
                <option key={m} value={m} className="bg-slate-900 text-white">{m}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Monthly Filter Summary */}
        {filterMonth !== 'Semua' && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-slate-300">Ringkasan Filter Keuangan ({filterMonth})</span>
            </div>
            <div className="text-emerald-400 font-bold text-sm bg-slate-950/50 px-3 py-1.5 rounded-lg border border-slate-800">
              Total Pemasukan Bulan Ini: <span className="text-white font-mono">{formatRupiah(filteredTransactions.reduce((acc, tx) => acc + tx.amount, 0))}</span>
            </div>
          </div>
        )}

        {/* Transactions Table */}
        <div className="border border-slate-850 rounded-xl overflow-hidden">
          {filteredTransactions.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              Tidak ada catatan transaksi untuk filter bulan ini.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-850 bg-slate-950/20 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="px-5 py-3">ID Transaksi</th>
                    <th className="px-5 py-3">Kamar</th>
                    <th className="px-5 py-3">Nama Penyewa</th>
                    <th className="px-5 py-3">Siklus Bulan</th>
                    <th className="px-5 py-3">Tanggal Pembayaran</th>
                    <th className="px-5 py-3 text-right">Jumlah Terbayar</th>
                    <th className="px-5 py-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850/40 text-xs text-slate-300">
                  {filteredTransactions.map((tx) => (
                    <tr 
                      id={`transaction-row-${tx.id}`}
                      key={tx.id} 
                      className="hover:bg-slate-850/20 transition-colors"
                    >
                      <td className="px-5 py-3.5 font-mono text-[10px] text-slate-500">{tx.id}</td>
                      <td className="px-5 py-3.5">
                        <span className="bg-slate-800 text-slate-350 font-bold px-2 py-0.5 rounded border border-slate-750 font-mono text-[10px]">
                          No. {tx.roomNumber}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-medium text-white">{tx.tenantName}</td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs text-teal-400 font-medium">{tx.month}</span>
                      </td>
                      <td className="px-5 py-3.5 font-mono text-[10px] text-slate-400">{formatDateIndo(tx.date)}</td>
                      <td className="px-5 py-3.5 text-right font-mono font-bold text-emerald-400">+{formatRupiah(tx.amount)}</td>
                      <td className="px-5 py-3.5 text-center">
                        <button
                          onClick={() => {
                            if (confirm('Apakah Anda yakin ingin menghapus catatan transaksi ini?')) {
                              onDeleteTransaction(tx.id);
                            }
                          }}
                          className="p-1.5 hover:bg-red-500/15 hover:text-red-400 text-slate-400 rounded-lg transition-all active:scale-[0.9] cursor-pointer"
                          title="Hapus Transaksi"
                        >
                          <Trash2 className="w-4.5 h-4.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* "Tambah Transaksi Pembayaran" Modal Form Dialog */}
      <AnimatePresence>
        {isModalOpen && (
          <div id="payment-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden relative"
            >
              {/* Top accent line */}
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500" />
              
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-850">
                <div className="flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-emerald-400" />
                  <h2 className="text-lg font-bold text-white tracking-tight">Catat Transaksi Sewa</h2>
                </div>
                <button
                  id="close-payment-modal-btn"
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form content */}
              <form onSubmit={handleSaveTransaction} className="p-6 space-y-4">
                
                {/* Room Select Dropdown */}
                <div className="space-y-1">
                  <label htmlFor="modal-payment-room" className="text-xs text-slate-300">Pilih Kamar Terisi</label>
                  <select
                    id="modal-payment-room"
                    value={selectedRoomId}
                    onChange={(e) => handleRoomSelect(e.target.value)}
                    className={`w-full px-3 py-2 bg-slate-950/40 border ${errors.selectedRoomId ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-800 focus:border-emerald-500'} focus:ring-1 focus:ring-emerald-500 rounded-xl text-white text-xs outline-none transition-all cursor-pointer`}
                  >
                    <option value="" className="bg-slate-900 text-slate-500">-- Pilih Kamar --</option>
                    {activeRooms.map(r => (
                      <option key={r.id} value={r.id} className="bg-slate-900 text-white">
                        Kamar {r.roomNumber} - {r.tenant?.name} ({formatRupiah(r.price)}/bln)
                      </option>
                    ))}
                  </select>
                  {errors.selectedRoomId && (
                    <span className="text-[10px] text-rose-400 flex items-center gap-1"><AlertCircle className="w-3 h-3 shrink-0" /> {errors.selectedRoomId}</span>
                  )}
                </div>

                {/* Amount to pay */}
                <div className="space-y-1">
                  <label htmlFor="modal-payment-amount" className="text-xs text-slate-300">Jumlah Pembayaran (Rp)</label>
                  <input
                    id="modal-payment-amount"
                    type="number"
                    value={amount || ''}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    placeholder="Contoh: 1500000"
                    className={`w-full px-3 py-2 bg-slate-950/40 border ${errors.amount ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-800 focus:border-emerald-500'} focus:ring-1 focus:ring-emerald-500 rounded-xl text-white font-mono text-xs outline-none transition-all`}
                  />
                  {errors.amount && (
                    <span className="text-[10px] text-rose-400 flex items-center gap-1"><AlertCircle className="w-3 h-3 shrink-0" /> {errors.amount}</span>
                  )}
                </div>

                {/* Payment Date */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label htmlFor="modal-payment-date" className="text-xs text-slate-300">Tanggal Transaksi</label>
                    <input
                      id="modal-payment-date"
                      type="date"
                      value={transactionDate}
                      onChange={(e) => setTransactionDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950/40 border border-slate-800 focus:border-emerald-500 rounded-xl text-white font-mono text-xs outline-none transition-all cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="modal-payment-month" className="text-xs text-slate-300">Siklus Periode</label>
                    <input
                      id="modal-payment-month"
                      type="text"
                      value={transactionMonth}
                      onChange={(e) => setTransactionMonth(e.target.value)}
                      placeholder="e.g. Juni 2026"
                      className="w-full px-3 py-2 bg-slate-950/40 border border-slate-800 focus:border-emerald-500 rounded-xl text-white text-xs outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Type Transaksi */}
                <div className="space-y-1">
                  <label htmlFor="modal-payment-type" className="text-xs text-slate-300">Kategori Pemasukan</label>
                  <select
                    id="modal-payment-type"
                    value={transactionType}
                    onChange={(e) => setTransactionType(e.target.value as 'Sewa' | 'Lainnya')}
                    className="w-full px-3 py-2 bg-slate-950/40 border border-slate-800 focus:border-emerald-500 rounded-xl text-white text-xs outline-none transition-all cursor-pointer"
                  >
                    <option value="Sewa" className="bg-slate-900 text-white">Sewa Kamar (Otomatis Sync Jatuh Tempo +1 Bulan)</option>
                    <option value="Lainnya" className="bg-slate-900 text-white">Pemasukan Lain-lain</option>
                  </select>
                </div>

                {/* Dynamic alert informing automatic sync */}
                {transactionType === 'Sewa' && selectedRoomId && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] rounded-xl flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      Sistem akan secara otomatis memperpanjang tanggal jatuh tempo berikutnya dari kamar yang dipilih sebanyak <strong>+1 Bulan ke depan</strong> dari tanggal jatuh tempo saat ini.
                    </span>
                  </div>
                )}

                {/* Submit buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-850 mt-6">
                  <button
                    id="cancel-payment-btn"
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 hover:bg-slate-800 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer border border-transparent"
                  >
                    Batal
                  </button>
                  <button
                    id="submit-payment-btn"
                    type="submit"
                    className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-bold text-xs rounded-xl transition-all duration-150 cursor-pointer flex items-center gap-1.5"
                  >
                    <CircleCheck className="w-4 h-4" />
                    Catat & Perbarui Kamar
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
