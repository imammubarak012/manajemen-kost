import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, Users, ShieldAlert, Phone, MapPin, Briefcase, Calendar, ExternalLink, BedDouble, ChevronLeft, ChevronRight } from 'lucide-react';
import { Room } from '../types';
import { formatDateIndo } from '../utils';

interface DataPenghuniViewProps {
  rooms: Room[];
  onNavigateToManage: () => void;
}

export default function DataPenghuniView({ rooms, onNavigateToManage }: DataPenghuniViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Extract all active tenants with room associations
  const activeTenants = rooms
    .filter(r => r.status === 'Terisi' && r.tenant)
    .map(r => ({
      roomNumber: r.roomNumber,
      roomType: r.type,
      roomId: r.id,
      ...r.tenant!
    }));

  // Perform filtering based on Tenant Name or Room Number
  const filteredTenants = activeTenants.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.roomNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredTenants.length / itemsPerPage) || 1;
  const paginatedTenants = filteredTenants.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Statistics summaries
  const totalActiveTenants = activeTenants.length;
  
  // Find top occupations and origins for mini insights
  const occupationsMap = activeTenants.reduce((acc, t) => {
    acc[t.occupation] = (acc[t.occupation] || 0) + 1;
    return acc;
  }, {} as { [key: string]: number });

  const topOccupation = Object.entries(occupationsMap).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';

  const originsMap = activeTenants.reduce((acc, t) => {
    acc[t.origin] = (acc[t.origin] || 0) + 1;
    return acc;
  }, {} as { [key: string]: number });

  const topOrigin = Object.entries(originsMap).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Data Penghuni Kost</h1>
          <p className="text-slate-400 text-xs">
            Daftar lengkap seluruh penghuni aktif yang menyewa kamar kost. Data di halaman ini bersifat <span className="text-emerald-400 font-semibold">Hanya Lihat (Read-Only)</span>.
          </p>
        </div>
        
        {/* Quick Read-only warning badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 text-xs font-semibold">
          <ShieldAlert className="w-4 h-4 text-emerald-400" />
          <span>Edit via Menu Kelola Kamar</span>
        </div>
      </div>

      {/* Mini Insight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-4 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-slate-500 text-[10px] font-bold tracking-wider uppercase">Total Penghuni Aktif</span>
            <div className="text-2xl font-extrabold text-white font-mono">{totalActiveTenants}</div>
          </div>
          <div className="p-2.5 bg-slate-800 rounded-lg text-blue-400">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-4 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-slate-500 text-[10px] font-bold tracking-wider uppercase">Pekerjaan Terbanyak</span>
            <div className="text-lg font-bold text-slate-200 truncate max-w-[150px]">{topOccupation}</div>
          </div>
          <div className="p-2.5 bg-slate-800 rounded-lg text-emerald-400">
            <Briefcase className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-4 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-slate-500 text-[10px] font-bold tracking-wider uppercase">Kota Asal Terbanyak</span>
            <div className="text-lg font-bold text-slate-200 truncate max-w-[150px]">{topOrigin}</div>
          </div>
          <div className="p-2.5 bg-slate-800 rounded-lg text-amber-400">
            <MapPin className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Control Search Bar */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center gap-4 shadow-md">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
            <Search className="w-4 h-4" />
          </div>
          <input
            id="tenant-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari penghuni berdasarkan Nama Penghuni atau Nomor Kamar secara real-time..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-950/40 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-white placeholder-slate-500 text-xs outline-none transition-all duration-200"
          />
        </div>
      </div>

      {/* Data Table Container */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        {filteredTenants.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="p-3 bg-slate-800 text-slate-500 rounded-full w-max mx-auto">
              <Users className="w-6 h-6" />
            </div>
            <p className="text-slate-400 font-medium text-sm">Tidak ditemukan data penghuni aktif.</p>
            {activeTenants.length === 0 && (
              <button
                id="empty-tenant-manage-btn"
                onClick={onNavigateToManage}
                className="mt-2 text-xs text-emerald-400 hover:underline flex items-center gap-1 mx-auto cursor-pointer"
              >
                Isi Kamar Kost Baru <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ) : (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/30 text-xs text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="px-6 py-4">Kamar</th>
                    <th className="px-6 py-4">Nama Penghuni</th>
                    <th className="px-6 py-4">Nomor Telepon</th>
                    <th className="px-6 py-4">Asal Kota</th>
                    <th className="px-6 py-4">Pekerjaan</th>
                    <th className="px-6 py-4">Tanggal Masuk</th>
                    <th className="px-6 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850/60 text-xs text-slate-300">
                  {paginatedTenants.map((tenant) => (
                    <tr 
                      id={`tenant-row-${tenant.roomNumber}`}
                      key={tenant.roomId}
                      className="hover:bg-slate-850/30 transition-colors"
                    >
                      {/* Room Info */}
                      <td className="px-6 py-4 font-mono font-bold">
                        <div className="flex items-center gap-1.5">
                          <span className="bg-slate-800 px-2 py-1 rounded text-white text-xs border border-slate-750">
                            {tenant.roomNumber}
                          </span>
                          <span className="text-[10px] text-slate-500">{tenant.roomType}</span>
                        </div>
                      </td>

                      {/* Tenant Name */}
                      <td className="px-6 py-4">
                        <span className="font-semibold text-white text-sm">{tenant.name}</span>
                      </td>

                      {/* Phone number */}
                      <td className="px-6 py-4 font-mono text-slate-300">
                        <div className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-slate-500" />
                          <span>{tenant.phone}</span>
                        </div>
                      </td>

                      {/* Origin */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-500" />
                          <span>{tenant.origin}</span>
                        </div>
                      </td>

                      {/* Occupation */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <Briefcase className="w-3.5 h-3.5 text-slate-500" />
                          <span>{tenant.occupation}</span>
                        </div>
                      </td>

                      {/* CheckIn Date */}
                      <td className="px-6 py-4 font-mono">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          <span>{formatDateIndo(tenant.checkInDate)}</span>
                        </div>
                      </td>

                      {/* Actions link to edit room */}
                      <td className="px-6 py-4 text-right">
                        <button
                          id={`go-to-edit-${tenant.roomNumber}`}
                          onClick={onNavigateToManage}
                          className="p-1.5 bg-slate-800 hover:bg-slate-750 rounded-lg text-emerald-400 hover:text-emerald-300 transition-colors inline-flex items-center gap-1 cursor-pointer border border-slate-700"
                          title="Edit data di Kelola Kamar"
                        >
                          <BedDouble className="w-3.5 h-3.5" />
                          <span className="text-[10px]">Kelola</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-950/20 border-t border-slate-850 p-4">
                <div className="text-xs text-slate-400">
                  Menampilkan <span className="font-bold text-white">{((currentPage - 1) * itemsPerPage) + 1}</span> - <span className="font-bold text-white">{Math.min(currentPage * itemsPerPage, filteredTenants.length)}</span> dari <span className="font-bold text-emerald-400">{filteredTenants.length}</span> penghuni aktif
                </div>
                <div className="flex items-center gap-2">
                  <button
                    id="prev-tenant-page-btn"
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
                    id="next-tenant-page-btn"
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
      </div>

    </div>
  );
}
