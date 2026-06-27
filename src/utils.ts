import { Transaction } from './types';

/**
 * Format number to Indonesian Rupiah currency format
 */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Format YYYY-MM-DD date to Indonesian date format
 */
export function formatDateIndo(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

/**
 * Get next due date based on check-in date and current reference date.
 * Due date occurs on the same day of the month as the check-in date.
 */
export function getNextDueDate(checkInDateStr: string, currentDateStr: string): string {
  if (!checkInDateStr) return '';
  
  const checkIn = new Date(checkInDateStr);
  const current = new Date(currentDateStr);
  
  if (isNaN(checkIn.getTime()) || isNaN(current.getTime())) return '';
  
  const dueDay = checkIn.getDate();
  let targetYear = current.getFullYear();
  let targetMonth = current.getMonth(); // 0-indexed
  
  // Create a due date for the current month of the reference date
  let dueDate = new Date(targetYear, targetMonth, dueDay);
  
  // Handle month length overflow (e.g. check-in on 31st, but current month only has 30 days)
  // If javascript rolled it over to the next month, correct it to the last day of the current month
  if (dueDate.getMonth() !== targetMonth) {
    dueDate = new Date(targetYear, targetMonth + 1, 0); // last day of current month
  }
  
  // Set time of due date to end of day to make comparisons cleaner
  dueDate.setHours(23, 59, 59, 999);
  
  // If the due date for this month is already in the past, the next due date is in the next month
  if (dueDate.getTime() < current.getTime()) {
    targetMonth += 1;
    dueDate = new Date(targetYear, targetMonth, dueDay);
    if (dueDate.getMonth() !== (targetMonth % 12)) {
      dueDate = new Date(targetYear, targetMonth + 1, 0);
    }
  }
  
  dueDate.setHours(0, 0, 0, 0);
  
  const yyyy = dueDate.getFullYear();
  const mm = String(dueDate.getMonth() + 1).padStart(2, '0');
  const dd = String(dueDate.getDate()).padStart(2, '0');
  
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Calculate the number of days until the next due date
 */
export function getDaysUntilDue(checkInDateStr: string, currentDateStr: string): number {
  if (!checkInDateStr) return 999;
  
  const nextDueStr = getNextDueDate(checkInDateStr, currentDateStr);
  const nextDue = new Date(nextDueStr);
  const current = new Date(currentDateStr);
  
  // Clear time components for pure day comparison
  nextDue.setHours(0, 0, 0, 0);
  current.setHours(0, 0, 0, 0);
  
  const diffTime = nextDue.getTime() - current.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

/**
 * Checks if a room is due soon (H-5)
 * Returns true if next due date is within 5 days (0 to 5 days remaining)
 */
export function isDueSoon(checkInDateStr: string, currentDateStr: string): boolean {
  if (!checkInDateStr) return false;
  const daysRemaining = getDaysUntilDue(checkInDateStr, currentDateStr);
  return daysRemaining >= 0 && daysRemaining <= 5;
}

/**
 * Calculate the due date status for a tenant.
 */
export function getTenantDueStatus(
  checkInDateStr: string,
  currentDateStr: string,
  transactions: Transaction[],
  tenantNextDueDate?: string
) {
  const nextDueDate = tenantNextDueDate || checkInDateStr;
  if (!nextDueDate || !currentDateStr) {
    return { nextDueStr: '', daysRemaining: 999, isOverdue: false, statusText: 'Safe' as const, dueMonthName: '' };
  }

  const due = new Date(nextDueDate);
  const current = new Date(currentDateStr);
  
  if (isNaN(due.getTime()) || isNaN(current.getTime())) {
    return { nextDueStr: '', daysRemaining: 999, isOverdue: false, statusText: 'Safe' as const, dueMonthName: '' };
  }

  const dueMidnight = new Date(due);
  dueMidnight.setHours(0, 0, 0, 0);

  const currentMidnight = new Date(current);
  currentMidnight.setHours(0, 0, 0, 0);

  // Calculate days difference
  const diffTime = dueMidnight.getTime() - currentMidnight.getTime();
  const daysRemaining = Math.round(diffTime / (1000 * 60 * 60 * 24));
  const isOverdue = daysRemaining < 0;

  const yyyy = dueMidnight.getFullYear();
  const mm = String(dueMidnight.getMonth() + 1).padStart(2, '0');
  const dd = String(dueMidnight.getDate()).padStart(2, '0');
  const nextDueStr = `${yyyy}-${mm}-${dd}`;

  let statusText: 'Overdue' | 'Due Soon' | 'Safe' = 'Safe';
  if (isOverdue) {
    statusText = 'Overdue';
  } else if (daysRemaining >= 0 && daysRemaining <= 5) {
    statusText = 'Due Soon';
  }

  return {
    nextDueStr,
    daysRemaining,
    isOverdue,
    statusText,
    dueMonthName: dueMidnight.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
  };
}

/**
 * Adds exactly 1 month to a YYYY-MM-DD date string.
 */
export function addOneMonth(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  
  // Set to next month
  const currentMonth = date.getMonth();
  date.setMonth(currentMonth + 1);
  
  // Format back to YYYY-MM-DD
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}
