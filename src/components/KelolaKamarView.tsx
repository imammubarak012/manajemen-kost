import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BedDouble, Plus, Trash2, Edit, Search, Check, AlertCircle, X, CheckCircle, ShieldAlert, ChevronLeft, ChevronRight } from 'lucide-react';
import { Room, Tenant } from '../types';
import { formatRupiah, formatDateIndo, addOneMonth } from '../utils';

interface KelolaKamarViewProps {
  rooms: Room[];
  currentDate: string;
  onAddRoom: (room: Room) => void;
  onUpdateRoom: (room: Room) => void;
  onDeleteRoom: (roomId: string) => void;
}

export default function KelolaKamarView({ rooms, currentDate, onAddRoom, onUpdateRoom, onDeleteRoom }: KelolaKamarViewProps) {
  // Filters & State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Semua' | 'Tersedia' | 'Terisi'>('Semua');
  const [typeFilter, setTypeFilter] = useState<'Semua' | 'AC' | 'Non-AC'>('Semua');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, typeFilter]);
  
  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  // Form Fields State
  const [roomNumber, setRoomNumber] = useState('');
  const [roomType, setRoomType] = useState<'AC' | 'Non-AC'>('AC');
  const [price, setPrice] = useState<number>(1000000);
  const [status, setStatus] = useState<'Tersedia' | 'Terisi'>('Tersedia');
  
  // Tenant Form Fields State (Triggered dynamically)
  const [tenantName, setTenantName] = useState('');
  const [tenantPhone, setTenantPhone] = useState('');
  const [tenantOrigin, setTenantOrigin] = useState('');
  const [tenantOccupation, setTenantOccupation] = useState('');
  const [checkInDate, setCheckInDate] = useState('');
  const [tenantNextDueDate, setTenantNextDueDate] = useState('');

  // Individual field validation error states
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Reset Form fields
  const resetForm = () => {
    setRoomNumber('');
    setRoomType('AC');
    setPrice(1000000);
    setStatus('Tersedia');
    setTenantName('');
    setTenantPhone('');
    setTenantOrigin('');
    setTenantOccupation('');
    setCheckInDate(currentDate); // Default to simulation system date
    setTenantNextDueDate(addOneMonth(currentDate)); // Default next due date to 1 month later
    setErrors({});
    setEditingRoom(null);
  };

  const handleOpenAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (room: Room) => {
    setEditingRoom(room);
    setRoomNumber(room.roomNumber);
    setRoomType(room.type);
    setPrice(room.price);
    setStatus(room.status);
    
    if (room.status === 'Terisi' && room.tenant) {
      setTenantName(room.tenant.name);
      setTenantPhone(room.tenant.phone);
      setTenantOrigin(room.tenant.origin);
      setTenantOccupation(room.tenant.occupation);
      setCheckInDate(room.tenant.checkInDate);
      setTenantNextDueDate(room.tenant.nextDueDate || addOneMonth(room.tenant.checkInDate));
    } else {
      setTenantName('');
      setTenantPhone('');
      setTenantOrigin('');
      setTenantOccupation('');
      setCheckInDate(currentDate);
      setTenantNextDueDate(addOneMonth(currentDate));
    }
    setErrors({});
    setIsModalOpen(true);
  };

  // Perform Validations
  const validateForm = (): boolean => {
    const tempErrors: { [key: string]: string } = {};
    let isValid = true;

    // VALIDATION 1: Unique Room Number
    const existingRoom = rooms.find(
      r => r.roomNumber.trim().toLowerCase() === roomNumber.trim().toLowerCase() && 
      (!editingRoom || r.id !== editingRoom.id)
    );
    if (!roomNumber.trim()) {
      tempErrors.roomNumber = 'Nomor kamar wajib diisi!';
      isValid = false;
    } else if (existingRoom) {
      tempErrors.roomNumber = `Nomor Kamar ${roomNumber} sudah digunakan oleh kamar lain!`;
      isValid = false;
    }

    // VALIDATION 3 (part 1): Price Validation
    if (price === undefined || price === null || isNaN(price)) {
      tempErrors.price = 'Harga sewa wajib diisi!';
      isValid = false;
    } else if (price < 0) {
      tempErrors.price = 'Harga sewa tidak boleh bernilai minus!';
      isValid = false;
    }

    // Dynamic Tenant Fields Validation if status === 'Terisi'
    if (status === 'Terisi') {
      if (!tenantName.trim()) {
        tempErrors.tenantName = 'Nama penghuni wajib diisi!';
        isValid = false;
      }

      // VALIDATION 2: Phone Format Validation (numbers, 10-13 chars)
      const phoneDigitsOnly = tenantPhone.replace(/\D/g, '');
      if (!tenantPhone.trim()) {
        tempErrors.tenantPhone = 'Nomor telepon wajib diisi!';
        isValid = false;
      } else if (phoneDigitsOnly.length < 10 || phoneDigitsOnly.length > 13 || isNaN(Number(tenantPhone))) {
        tempErrors.tenantPhone = 'Nomor telepon harus berupa angka dengan panjang antara 10 hingga 13 karakter!';
        isValid = false;
      }

      if (!tenantOrigin.trim()) {
        tempErrors.tenantOrigin = 'Asal kota penghuni wajib diisi!';
        isValid = false;
      }
      if (!tenantOccupation.trim()) {
        tempErrors.tenantOccupation = 'Pekerjaan penghuni wajib diisi!';
        isValid = false;
      }

      // VALIDATION 3 (part 2): Date Validation (no future dates compared to currentDate)
      if (!checkInDate) {
        tempErrors.checkInDate = 'Tanggal masuk wajib diisi!';
        isValid = false;
      } else {
        const checkInTime = new Date(checkInDate).getTime();
        const systemTime = new Date(currentDate).getTime();
        if (checkInTime > systemTime) {
          tempErrors.checkInDate = 'Tanggal masuk tidak boleh memilih tanggal di masa depan!';
          isValid = false;
        }
      }

      // VALIDATION: Tanggal Jatuh Tempo Berikutnya
      if (!tenantNextDueDate) {
        tempErrors.tenantNextDueDate = 'Tanggal jatuh tempo berikutnya wajib diisi!';
        isValid = false;
      }
    }

    setErrors(tempErrors);
    return isValid;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const tenantData: Tenant | undefined = status === 'Terisi' ? {
      name: tenantName.trim(),
      phone: tenantPhone.trim(),
      origin: tenantOrigin.trim(),
      occupation: tenantOccupation.trim(),
      checkInDate: checkInDate,
      nextDueDate: tenantNextDueDate
    } : undefined;

    const roomPayload: Room = {
      id: editingRoom ? editingRoom.id : `room-${Date.now()}`,
      roomNumber: roomNumber.trim(),
      type: roomType,
      price: Number(price),
      status: status,
      tenant: tenantData
    };

    if (editingRoom) {
      onUpdateRoom(roomPayload);
    } else {
      onAddRoom(roomPayload);
    }

    setIsModalOpen(false);
    resetForm();
  };

  // Filtered Rooms
  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (room.tenant?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'Semua' || room.status === statusFilter;
    const matchesType = typeFilter === 'Semua' || room.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const totalPages = Math.ceil(filteredRooms.length / itemsPerPage) || 1;
  const paginatedRooms = filteredRooms.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6 pb-12">
      {/* Header and Add Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Kelola Kamar Kost</h1>
          <p className="text-slate-400 text-xs">Tambah, ubah, dan hapus data kamar beserta informasi penghuni.</p>
        </div>
        <button
          id="add-room-btn"
          onClick={handleOpenAddModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-semibold text-xs rounded-xl transition-all duration-150 cursor-pointer shadow-lg shadow-emerald-500/10"
        >
          <Plus className="w-4 h-4" />
          Tambah Kamar Baru
        </button>
      </div>

      {/* Control Panel: Filters, Search, Sort */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-md">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
            <Search className="w-4 h-4" />
          </div>
          <input
            id="room-search-input"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nomor kamar atau penghuni..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-950/40 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-white placeholder-slate-500 text-xs outline-none transition-all duration-200"
          />
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5 bg-slate-950/40 p-1 rounded-xl border border-slate-850">
            {(['Semua', 'Tersedia', 'Terisi'] as const).map((st) => (
              <button
                id={`status-filter-${st}`}
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer ${
                  statusFilter === st 
                    ? 'bg-slate-800 text-emerald-400' 
                    : 'text-slate-400 hover:text-slate-300'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 bg-slate-950/40 p-1 rounded-xl border border-slate-850">
            {(['Semua', 'AC', 'Non-AC'] as const).map((tp) => (
              <button
                id={`type-filter-${tp}`}
                key={tp}
                onClick={() => setTypeFilter(tp)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer ${
                  typeFilter === tp 
                    ? 'bg-slate-800 text-emerald-400' 
                    : 'text-slate-400 hover:text-slate-300'
                }`}
              >
                {tp}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of Room Cards */}
      {filteredRooms.length === 0 ? (
        <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-12 text-center space-y-3">
          <div className="p-3 bg-slate-800 text-slate-500 rounded-full w-max mx-auto">
            <BedDouble className="w-6 h-6" />
          </div>
          <p className="text-slate-400 font-medium text-sm">Tidak ada kamar yang sesuai filter pencarian.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {paginatedRooms.map((room) => (
                <motion.div
                  layout
                  id={`room-card-${room.roomNumber}`}
                  key={room.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 shadow-lg relative overflow-hidden flex flex-col justify-between hover:border-slate-750 transition-colors"
                >
                  {/* Status Decorator Line */}
                  <div className={`absolute top-0 left-0 right-0 h-1 ${room.status === 'Terisi' ? 'bg-blue-500' : 'bg-emerald-500'}`} />

                  {/* Top Info */}
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-white tracking-tight">Kamar {room.roomNumber}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            room.type === 'AC' 
                              ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' 
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            {room.type}
                          </span>
                        </div>
                        <p className="text-emerald-400 font-mono text-sm font-semibold mt-1">
                          {formatRupiah(room.price)}<span className="text-slate-500 text-[10px] font-normal font-sans">/Bulan</span>
                        </p>
                      </div>

                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        room.status === 'Terisi' 
                          ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20' 
                          : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {room.status}
                      </span>
                    </div>

                    {/* Tenant Details Box */}
                    {room.status === 'Terisi' && room.tenant ? (
                      <div className="bg-slate-950/40 border border-slate-850/60 rounded-xl p-3.5 space-y-2 text-xs">
                        <div className="flex justify-between items-baseline pb-1.5 border-b border-slate-850/40">
                          <span className="text-slate-400">Penghuni Aktif</span>
                          <span className="text-slate-500 text-[10px]">Kerja: {room.tenant.occupation}</span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-slate-400 font-medium">Nama:</span>
                            <span className="text-white font-semibold">{room.tenant.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Telp:</span>
                            <span className="text-slate-300 font-mono">{room.tenant.phone}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Asal:</span>
                            <span className="text-slate-300">{room.tenant.origin}</span>
                          </div>
                          <div className="flex justify-between pt-1 border-t border-slate-850/30">
                            <span className="text-slate-400 text-[10px]">Tgl Masuk:</span>
                            <span className="text-blue-400 font-semibold font-mono text-[10px]">{formatDateIndo(room.tenant.checkInDate)}</span>
                          </div>
                          <div className="flex justify-between pt-1">
                            <span className="text-emerald-400 font-medium text-[10px]">Jatuh Tempo:</span>
                            <span className="text-emerald-400 font-bold font-mono text-[10px]">{formatDateIndo(room.tenant.nextDueDate || addOneMonth(room.tenant.checkInDate))}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="border border-dashed border-slate-800 bg-slate-950/10 rounded-xl py-6 text-center text-xs text-slate-500">
                        Kamar siap dihuni oleh penyewa baru.
                      </div>
                    )}
                  </div>

                  {/* Actions Bottom Bar */}
                  <div className="flex items-center justify-end gap-2.5 pt-4 mt-5 border-t border-slate-850">
                    <button
                      id={`edit-room-btn-${room.roomNumber}`}
                      onClick={() => handleOpenEditModal(room)}
                      className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer border border-transparent hover:border-slate-700"
                      title="Edit Kamar"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      id={`delete-room-btn-${room.roomNumber}`}
                      onClick={() => {
                        if (confirm(`Apakah Anda yakin ingin menghapus Kamar ${room.roomNumber}?`)) {
                          onDeleteRoom(room.id);
                        }
                      }}
                      className="p-2 hover:bg-rose-500/10 rounded-lg text-slate-400 hover:text-rose-400 transition-all cursor-pointer border border-transparent hover:border-rose-500/15"
                      title="Hapus Kamar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/40 border border-slate-850 rounded-2xl p-4 mt-4 shadow-sm">
              <div className="text-xs text-slate-400">
                Menampilkan <span className="font-bold text-white">{((currentPage - 1) * itemsPerPage) + 1}</span> - <span className="font-bold text-white">{Math.min(currentPage * itemsPerPage, filteredRooms.length)}</span> dari <span className="font-bold text-emerald-400">{filteredRooms.length}</span> kamar
              </div>
              <div className="flex items-center gap-2">
                <button
                  id="prev-page-btn"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 bg-slate-850 hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-slate-850 text-slate-200 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition-all duration-150 border border-slate-800 cursor-pointer disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Sebelumnya
                </button>
                <div className="text-xs font-mono font-bold text-slate-300 px-3 py-1 bg-slate-950/40 border border-slate-850 rounded-lg">
                  {currentPage} / {totalPages}
                </div>
                <button
                  id="next-page-btn"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 bg-slate-850 hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-slate-850 text-slate-200 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition-all duration-150 border border-slate-800 cursor-pointer disabled:cursor-not-allowed"
                >
                  Berikutnya
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Multi-Purpose CRUD Modal Dialog */}
      <AnimatePresence>
        {isModalOpen && (
          <div id="crud-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden relative"
            >
              {/* Top Banner Line */}
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500" />
              
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-850">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  {editingRoom ? `Edit Kamar Kost: ${editingRoom.roomNumber}` : 'Tambah Kamar Kost Baru'}
                </h2>
                <button
                  id="close-modal-btn"
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSave} className="max-h-[calc(100vh-180px)] overflow-y-auto p-6 space-y-5">
                
                {/* ROOM FIELDS SECTION */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-emerald-400 tracking-wider uppercase">Spesifikasi Kamar</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {/* Room Number */}
                    <div className="space-y-1">
                      <label htmlFor="modal-room-number" className="text-xs text-slate-300">Nomor Kamar</label>
                      <input
                        id="modal-room-number"
                        type="text"
                        value={roomNumber}
                        onChange={(e) => setRoomNumber(e.target.value)}
                        placeholder="Contoh: 101, 203"
                        className={`w-full px-3 py-2 bg-slate-950/40 border ${errors.roomNumber ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-800 focus:border-emerald-500'} focus:ring-1 focus:ring-emerald-500 rounded-xl text-white placeholder-slate-600 text-xs outline-none transition-all`}
                      />
                      {errors.roomNumber && (
                        <span className="text-[10px] text-rose-400 flex items-center gap-1"><AlertCircle className="w-3 h-3 shrink-0" /> {errors.roomNumber}</span>
                      )}
                    </div>

                    {/* Room Type */}
                    <div className="space-y-1">
                      <label htmlFor="modal-room-type" className="text-xs text-slate-300">Tipe Kamar</label>
                      <select
                        id="modal-room-type"
                        value={roomType}
                        onChange={(e) => setRoomType(e.target.value as 'AC' | 'Non-AC')}
                        className="w-full px-3 py-2 bg-slate-950/40 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-white text-xs outline-none transition-all cursor-pointer"
                      >
                        <option value="AC" className="bg-slate-900 text-white">Fasilitas AC</option>
                        <option value="Non-AC" className="bg-slate-900 text-white">Non-AC (Kipas)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Rent Price */}
                    <div className="space-y-1">
                      <label htmlFor="modal-room-price" className="text-xs text-slate-300">Harga Sewa Bulanan (Rp)</label>
                      <input
                        id="modal-room-price"
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(Number(e.target.value))}
                        placeholder="Contoh: 1500000"
                        className={`w-full px-3 py-2 bg-slate-950/40 border ${errors.price ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-800 focus:border-emerald-500'} focus:ring-1 focus:ring-emerald-500 rounded-xl text-white placeholder-slate-600 text-xs font-mono outline-none transition-all`}
                      />
                      {errors.price && (
                        <span className="text-[10px] text-rose-400 flex items-center gap-1"><AlertCircle className="w-3 h-3 shrink-0" /> {errors.price}</span>
                      )}
                    </div>

                    {/* Status Kamar */}
                    <div className="space-y-1">
                      <label htmlFor="modal-room-status" className="text-xs text-slate-300">Status Hunian</label>
                      <select
                        id="modal-room-status"
                        value={status}
                        onChange={(e) => setStatus(e.target.value as 'Tersedia' | 'Terisi')}
                        className="w-full px-3 py-2 bg-slate-950/40 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-white text-xs outline-none transition-all cursor-pointer"
                      >
                        <option value="Tersedia" className="bg-slate-900 text-emerald-400 font-bold">Tersedia (Kosong)</option>
                        <option value="Terisi" className="bg-slate-900 text-blue-400 font-bold">Terisi (Penghuni)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* DYNAMIC TENANT FIELDS SECTION */}
                <AnimatePresence>
                  {status === 'Terisi' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4 pt-4 border-t border-slate-850 overflow-hidden"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-bold text-blue-400 tracking-wider uppercase">Data Identitas Penghuni Kost</span>
                        <span className="text-[9px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded font-bold">Wajib Diisi</span>
                      </div>

                      {/* Name */}
                      <div className="space-y-1">
                        <label htmlFor="modal-tenant-name" className="text-xs text-slate-300">Nama Penghuni</label>
                        <input
                          id="modal-tenant-name"
                          type="text"
                          value={tenantName}
                          onChange={(e) => setTenantName(e.target.value)}
                          placeholder="Masukkan nama lengkap penyewa"
                          className={`w-full px-3 py-2 bg-slate-950/40 border ${errors.tenantName ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-800 focus:border-emerald-500'} focus:ring-1 focus:ring-emerald-500 rounded-xl text-white placeholder-slate-600 text-xs outline-none transition-all`}
                        />
                        {errors.tenantName && (
                          <span className="text-[10px] text-rose-400 flex items-center gap-1"><AlertCircle className="w-3 h-3 shrink-0" /> {errors.tenantName}</span>
                        )}
                      </div>

                      {/* Phone Number */}
                      <div className="space-y-1">
                        <label htmlFor="modal-tenant-phone" className="text-xs text-slate-300">Nomor Telepon aktif</label>
                        <input
                          id="modal-tenant-phone"
                          type="text"
                          value={tenantPhone}
                          onChange={(e) => setTenantPhone(e.target.value)}
                          placeholder="Contoh: 081234567890 (10 - 13 angka)"
                          className={`w-full px-3 py-2 bg-slate-950/40 border ${errors.tenantPhone ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-800 focus:border-emerald-500'} focus:ring-1 focus:ring-emerald-500 rounded-xl text-white placeholder-slate-600 text-xs font-mono outline-none transition-all`}
                        />
                        {errors.tenantPhone && (
                          <span className="text-[10px] text-rose-400 flex items-center gap-1"><AlertCircle className="w-3 h-3 shrink-0" /> {errors.tenantPhone}</span>
                        )}
                      </div>

                      {/* Origin & Occupation */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label htmlFor="modal-tenant-origin" className="text-xs text-slate-300">Kota Asal</label>
                          <input
                            id="modal-tenant-origin"
                            type="text"
                            value={tenantOrigin}
                            onChange={(e) => setTenantOrigin(e.target.value)}
                            placeholder="Contoh: Surabaya"
                            className={`w-full px-3 py-2 bg-slate-950/40 border ${errors.tenantOrigin ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-800 focus:border-emerald-500'} focus:ring-1 focus:ring-emerald-500 rounded-xl text-white placeholder-slate-600 text-xs outline-none transition-all`}
                          />
                          {errors.tenantOrigin && (
                            <span className="text-[10px] text-rose-400 flex items-center gap-1"><AlertCircle className="w-3 h-3 shrink-0" /> {errors.tenantOrigin}</span>
                          )}
                        </div>

                        <div className="space-y-1">
                          <label htmlFor="modal-tenant-occupation" className="text-xs text-slate-300">Pekerjaan</label>
                          <input
                            id="modal-tenant-occupation"
                            type="text"
                            value={tenantOccupation}
                            onChange={(e) => setTenantOccupation(e.target.value)}
                            placeholder="Contoh: Mahasiswa, Karyawan"
                            className={`w-full px-3 py-2 bg-slate-950/40 border ${errors.tenantOccupation ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-800 focus:border-emerald-500'} focus:ring-1 focus:ring-emerald-500 rounded-xl text-white placeholder-slate-600 text-xs outline-none transition-all`}
                          />
                          {errors.tenantOccupation && (
                            <span className="text-[10px] text-rose-400 flex items-center gap-1"><AlertCircle className="w-3 h-3 shrink-0" /> {errors.tenantOccupation}</span>
                          )}
                        </div>
                      </div>

                      {/* Check-in Date & Next Due Date */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <div className="flex justify-between items-center">
                            <label htmlFor="modal-checkin-date" className="text-xs text-slate-300">Tanggal Masuk Kost</label>
                            <span className="text-[9px] text-slate-500">Maks: {currentDate}</span>
                          </div>
                          <input
                            id="modal-checkin-date"
                            type="date"
                            value={checkInDate}
                            onChange={(e) => {
                              setCheckInDate(e.target.value);
                              setTenantNextDueDate(addOneMonth(e.target.value));
                            }}
                            className={`w-full px-3 py-2 bg-slate-950/40 border ${errors.checkInDate ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-800 focus:border-emerald-500'} focus:ring-1 focus:ring-emerald-500 rounded-xl text-white text-xs font-mono outline-none transition-all cursor-pointer`}
                          />
                          {errors.checkInDate && (
                            <span className="text-[10px] text-rose-400 flex items-center gap-1"><AlertCircle className="w-3 h-3 shrink-0" /> {errors.checkInDate}</span>
                          )}
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between items-center">
                            <label htmlFor="modal-next-due-date" className="text-xs text-slate-300 font-semibold text-emerald-400">Jatuh Tempo Berikutnya</label>
                            <span className="text-[9px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded font-semibold">Wajib</span>
                          </div>
                          <input
                            id="modal-next-due-date"
                            type="date"
                            value={tenantNextDueDate}
                            onChange={(e) => setTenantNextDueDate(e.target.value)}
                            className={`w-full px-3 py-2 bg-slate-950/40 border ${errors.tenantNextDueDate ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-800 focus:border-emerald-500'} focus:ring-1 focus:ring-emerald-500 rounded-xl text-white text-xs font-mono outline-none transition-all cursor-pointer`}
                          />
                          {errors.tenantNextDueDate && (
                            <span className="text-[10px] text-rose-400 flex items-center gap-1"><AlertCircle className="w-3 h-3 shrink-0" /> {errors.tenantNextDueDate}</span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Footer Submit */}
                <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-850">
                  <button
                    id="cancel-form-btn"
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 hover:bg-slate-800 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer border border-transparent hover:border-slate-750"
                  >
                    Batal
                  </button>
                  <button
                    id="submit-form-btn"
                    type="submit"
                    className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-bold text-xs rounded-xl transition-all duration-150 cursor-pointer flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    Simpan Data
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
