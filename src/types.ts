export interface Tenant {
  name: string;
  phone: string;
  origin: string;
  occupation: string;
  checkInDate: string; // YYYY-MM-DD
  nextDueDate: string; // YYYY-MM-DD
}

export interface Room {
  id: string;
  roomNumber: string;
  type: 'AC' | 'Non-AC';
  price: number;
  status: 'Tersedia' | 'Terisi';
  tenant?: Tenant;
}

export interface Transaction {
  id: string;
  roomNumber: string;
  tenantName: string;
  amount: number;
  date: string; // YYYY-MM-DD
  month: string; // e.g. "Juni 2026"
  type: 'Sewa' | 'Lainnya';
}

export type ActiveTab = 'dashboard' | 'kelola-kamar' | 'data-penghuni' | 'laporan-keuangan' | 'pengaturan';

export interface DashboardMetrics {
  totalRooms: number;
  emptyRooms: number;
  occupiedRooms: number;
  dueSoonRooms: number;
}
