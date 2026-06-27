import { Room, Transaction } from './types';

// Arrays of real Indonesian names, origins, occupations for realistic tenants
const FIRST_NAMES = [
  'Ahmad', 'Budi', 'Joko', 'Andi', 'Rudi', 'Siti', 'Dewi', 'Rina', 'Agus', 'Hendra',
  'Sari', 'Eko', 'Rian', 'Putra', 'Aditya', 'Lestari', 'Kartika', 'Indah', 'Amalia', 'Fajar',
  'Taufik', 'Yusuf', 'Arif', 'Hasan', 'Rizky', 'Dwi', 'Sri', 'Mega', 'Wulan', 'Gita',
  'Anisa', 'Reza', 'Dimas', 'Eka', 'Yulia', 'Novi', 'Diana', 'Tri', 'Wahyu', 'Rahmat'
];

const LAST_NAMES = [
  'Pratama', 'Santoso', 'Hidayat', 'Kurniawan', 'Wibowo', 'Saputra', 'Lestari', 'Wijaya', 'Sari', 'Siregar',
  'Ginting', 'Nasution', 'Subagyo', 'Rahardjo', 'Sutrisno', 'Purnama', 'Setiawan', 'Budiman', 'Hadi', 'Fadilah',
  'Nugroho', 'Wulandari', 'Pratiwi', 'Saraswati', 'Kusuma', 'Utami', 'Fitriani', 'Permana', 'Darman', 'Tanjung'
];

const ORIGINS = [
  'Jakarta', 'Bandung', 'Surabaya', 'Yogyakarta', 'Semarang', 'Medan', 'Makassar', 'Palembang',
  'Denpasar', 'Malang', 'Solo', 'Bogor', 'Tangerang', 'Bekasi', 'Depok', 'Padang', 'Pontianak', 'Banjarmasin'
];

const OCCUPATIONS = [
  'Software Engineer', 'Dokter Muda', 'Mahasiswa', 'Desainer Grafis', 'Akuntan', 'Arsitek',
  'PNS', 'Karyawan Swasta', 'Content Creator', 'Data Analyst', 'Digital Marketer', 'Wiraswasta',
  'Chef', 'Perawat', 'Fotografer', 'Barista', 'Legal Consultant', 'HR Specialist'
];

// Reference date aligned with system settings
const BASE_DATE_STR = '2026-06-26';

function addDaysToDate(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function generateDefaultRooms(): Room[] {
  const rooms: Room[] = [];
  let occupiedCounter = 0;

  for (let rNum = 101; rNum <= 200; rNum++) {
    const isTersedia = (rNum % 5 === 0); // Exactly 20 vacant rooms out of 100
    const roomNumberStr = String(rNum);
    const type = rNum % 2 === 0 ? 'AC' : 'Non-AC';
    const price = type === 'AC' ? 1500000 : 850000;

    if (isTersedia) {
      rooms.push({
        id: `room-${roomNumberStr}`,
        roomNumber: roomNumberStr,
        type,
        price,
        status: 'Tersedia'
      });
    } else {
      occupiedCounter++;
      const index = occupiedCounter - 1;
      
      const firstName = FIRST_NAMES[index % FIRST_NAMES.length];
      const lastName = LAST_NAMES[index % LAST_NAMES.length];
      const name = `${firstName} ${lastName}`;
      const phone = `0812${String(10000000 + index).slice(1)}`;
      const origin = ORIGINS[index % ORIGINS.length];
      const occupation = OCCUPATIONS[index % OCCUPATIONS.length];

      let nextDueDate = '';
      if (occupiedCounter <= 5) {
        // Overdue rooms (5 units): nextDueDate is 2 to 5 days ago (relative to 2026-06-26)
        const overdueOffsets = [-2, -3, -4, -5, -3];
        nextDueDate = addDaysToDate(BASE_DATE_STR, overdueOffsets[occupiedCounter - 1]);
      } else if (occupiedCounter <= 13) {
        // Due soon rooms (8 units): nextDueDate is 2 to 4 days in future (relative to 2026-06-26)
        const dueSoonOffsets = [2, 3, 4, 2, 3, 4, 2, 3];
        nextDueDate = addDaysToDate(BASE_DATE_STR, dueSoonOffsets[occupiedCounter - 6]);
      } else {
        // Normal occupied rooms (67 units): nextDueDate is 15 to 25 days in future
        const offset = 15 + ((occupiedCounter - 14) % 11);
        nextDueDate = addDaysToDate(BASE_DATE_STR, offset);
      }

      // Check-in date is exactly 1 month prior to nextDueDate
      const checkInDate = addDaysToDate(nextDueDate, -30);

      rooms.push({
        id: `room-${roomNumberStr}`,
        roomNumber: roomNumberStr,
        type,
        price,
        status: 'Terisi',
        tenant: {
          name,
          phone,
          origin,
          occupation,
          checkInDate,
          nextDueDate
        }
      });
    }
  }

  return rooms;
}

export const DEFAULT_ROOMS: Room[] = generateDefaultRooms();

export const DEFAULT_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    roomNumber: '101',
    tenantName: 'Ahmad Pratama',
    amount: 1500000,
    date: '2026-06-01',
    month: 'Juni 2026',
    type: 'Sewa'
  },
  {
    id: 'tx-2',
    roomNumber: '102',
    tenantName: 'Budi Santoso',
    amount: 1500000,
    date: '2026-05-30',
    month: 'Mei 2026',
    type: 'Sewa'
  },
  {
    id: 'tx-3',
    roomNumber: '103', // Now occupied by Joko Hidayat (since 103 is occupied, 105 is vacant)
    tenantName: 'Joko Hidayat',
    amount: 850000,
    date: '2026-06-15',
    month: 'Juni 2026',
    type: 'Sewa'
  },
  {
    id: 'tx-4',
    roomNumber: '104',
    tenantName: 'Andi Kurniawan',
    amount: 1500000,
    date: '2026-06-15',
    month: 'Juni 2026',
    type: 'Sewa'
  },
  {
    id: 'tx-5',
    roomNumber: '199',
    tenantName: 'Sari Santoso',
    amount: 1500000,
    date: '2026-05-28',
    month: 'Mei 2026',
    type: 'Sewa'
  }
];
