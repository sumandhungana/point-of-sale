import { getProduct } from '@/features/services/productService';
import type { Loan } from '@/features/services/loanService';
import type { GetAllMember } from '@/features/services/organizationService';
import { formatSystemCurrency, formatSystemDate } from '@/features/services/appSettingService';

export interface AppNotification {
  id: string;
  type: 'LOW_STOCK' | 'LOAN_EMI' | 'NEW_ORGANIZATION';
  title: string;
  message: string;
  timestamp: string;
  link: string;
  severity: 'warning' | 'info' | 'danger';
  read: boolean;
  countLabel?: string;
}

const READ_NOTIFS_KEY = 'khatabook_read_notifications';

const getReadIds = (): Set<string> => {
  try {
    const raw = localStorage.getItem(READ_NOTIFS_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
};

const saveReadIds = (set: Set<string>): void => {
  try {
    localStorage.setItem(READ_NOTIFS_KEY, JSON.stringify(Array.from(set)));
  } catch (err) {
    console.error('Failed to save read notification IDs:', err);
  }
};

/**
 * Pure helper to compute loan EMI notifications from pre-fetched loans (used on loan page)
 */
export const getLoanNotifications = (loans: Loan[]): AppNotification[] => {
  const readIds = getReadIds();
  const notifications: AppNotification[] = [];
  if (!Array.isArray(loans)) return notifications;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  loans.forEach((loan: Loan) => {
    if (loan.status === 'ACTIVE' && Array.isArray(loan.schedule)) {
      loan.schedule.forEach((scheduleItem) => {
        if (scheduleItem.status === 'OVERDUE') {
          const id = `loan-overdue-${loan.id}-${scheduleItem.installmentNo}`;
          const formattedAmount = formatSystemCurrency(scheduleItem.emiAmount);
          const formattedDueDate = formatSystemDate(scheduleItem.dueDate);
          notifications.push({
            id,
            type: 'LOAN_EMI',
            title: `Overdue Loan EMI: ${loan.lenderName}`,
            message: `Installment #${scheduleItem.installmentNo} of ${formattedAmount} was due on ${formattedDueDate}.`,
            timestamp: scheduleItem.dueDate || new Date().toISOString(),
            link: '/others/loan',
            severity: 'danger',
            read: readIds.has(id),
            countLabel: formattedAmount,
          });
        } else if (scheduleItem.status === 'PENDING' && scheduleItem.dueDate) {
          const due = new Date(scheduleItem.dueDate);
          due.setHours(0, 0, 0, 0);
          const diffMs = due.getTime() - today.getTime();
          const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

          if (diffDays <= 7 && diffDays >= -1) {
            const id = `loan-due-${loan.id}-${scheduleItem.installmentNo}`;
            const formattedDueDate = formatSystemDate(scheduleItem.dueDate);
            const dueText =
              diffDays < 0
                ? 'is overdue'
                : diffDays === 0
                ? 'is due today!'
                : diffDays === 1
                ? 'is due tomorrow'
                : `is due in ${diffDays} days (${formattedDueDate})`;

            const formattedAmount = formatSystemCurrency(scheduleItem.emiAmount);
            notifications.push({
              id,
              type: 'LOAN_EMI',
              title: `Loan EMI Schedule: ${loan.lenderName}`,
              message: `Installment #${scheduleItem.installmentNo} of ${formattedAmount} ${dueText}.`,
              timestamp: scheduleItem.dueDate,
              link: '/others/loan',
              severity: diffDays <= 1 ? 'danger' : 'warning',
              read: readIds.has(id),
              countLabel: formattedAmount,
            });
          }
        }
      });
    }
  });

  return notifications;
};

/**
 * Pure helper to compute organization registration notifications from pre-fetched orgs (used on organization page)
 */
export const getOrganizationNotifications = (orgs: GetAllMember[]): AppNotification[] => {
  const readIds = getReadIds();
  const notifications: AppNotification[] = [];
  if (!Array.isArray(orgs)) return notifications;

  orgs.forEach((org: GetAllMember) => {
    if (org.isActive === false) {
      const id = `org-reg-${org.id}`;
      notifications.push({
        id,
        type: 'NEW_ORGANIZATION',
        title: `New Organization Registration`,
        message: `${org.organizationName} (${org.organizationType || 'Business'}) registered from login page is awaiting approval.`,
        timestamp: org.createdAt || new Date().toISOString(),
        link: '/organization',
        severity: 'info',
        read: readIds.has(id),
        countLabel: 'Pending Approval',
      });
    }
  });

  return notifications;
};

let cachedNotifications: { data: AppNotification[]; timestamp: number } | null = null;
const NOTIF_CACHE_TTL_MS = 60000; // 60 seconds

export const invalidateNotificationCache = (): void => {
  cachedNotifications = null;
};

/**
 * Global notifications fetch: Only fetches low stock alerts.
 * Strictly NEVER calls loan or organization APIs globally across dashboards.
 * Bypasses product check on rental routes to avoid unused All Products API requests.
 */
export const fetchAllAppNotifications = async (forceRefresh: boolean = false): Promise<AppNotification[]> => {
  const now = Date.now();
  if (!forceRefresh && cachedNotifications && now - cachedNotifications.timestamp < NOTIF_CACHE_TTL_MS) {
    return cachedNotifications.data;
  }

  const readIds = getReadIds();
  const notifications: AppNotification[] = [];

  // Rental items module does not use product inventory; skip All Products API call
  const isRentalRoute = typeof window !== 'undefined' && window.location.pathname.startsWith('/rental');

  // Low Stock Alerts only
  if (!isRentalRoute) {
    try {
      const items = await getProduct();
      const itemsList = Array.isArray(items)
        ? items
        : (items as any)?.itemsResponse || (items as any)?.items || [];

      if (Array.isArray(itemsList)) {
        itemsList.forEach((item: any) => {
          const count = Number(item.itemCount ?? item.stock ?? item.quantity ?? 0);
          const threshold = Number(item.lowStockAlert ?? item.minStock ?? 5);

          if (!isNaN(count) && count <= threshold) {
            const id = `stock-${item.id}`;
            const isOut = count <= 0;
            notifications.push({
              id,
              type: 'LOW_STOCK',
              title: isOut ? `Out of Stock: ${item.name}` : `Low Stock: ${item.name}`,
              message: isOut
                ? `${item.name} has 0 stock remaining. Immediate restock needed.`
                : `${item.name} only has ${count} ${item.unit || 'pcs'} left (threshold: ${threshold}).`,
              timestamp: item.updatedAt || item.createdAt || new Date().toISOString(),
              link: '/inventory/items',
              severity: isOut ? 'danger' : 'warning',
              read: readIds.has(id),
              countLabel: `${count} left`,
            });
          }
        });
      }
    } catch (err) {
      console.warn('Notification fetch: Low stock check failed:', err);
    }
  }

  // Sort newest first
  const sorted = notifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  cachedNotifications = { data: sorted, timestamp: Date.now() };
  return sorted;
};

export const markNotificationAsRead = (id: string): void => {
  const readIds = getReadIds();
  readIds.add(id);
  saveReadIds(readIds);
};

export const markAllNotificationsAsRead = (notifications: AppNotification[]): void => {
  const readIds = getReadIds();
  notifications.forEach((n) => readIds.add(n.id));
  saveReadIds(readIds);
};

export const clearAllNotifications = (): void => {
  try {
    localStorage.removeItem(READ_NOTIFS_KEY);
  } catch (err) {
    console.error('Failed to clear notifications:', err);
  }
};
