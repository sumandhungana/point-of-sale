import { fetchItems } from './itemService';
import { fetchAllLoans, Loan } from '@/features/services/loanService';
import { getAllOrganization, GetAllMember } from '@/features/services/organizationService';

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

export const fetchAllAppNotifications = async (): Promise<AppNotification[]> => {
  const readIds = getReadIds();
  const notifications: AppNotification[] = [];

  // 1. Fetch Items for Low Stock Alerts
  try {
    const items = await fetchItems();
    if (Array.isArray(items)) {
      items.forEach((item: any) => {
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
            link: '/items',
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

  // 2. Fetch Loans for EMI Repayment Schedule Alerts
  try {
    const loans = await fetchAllLoans();
    if (Array.isArray(loans)) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      loans.forEach((loan: Loan) => {
        if (loan.status === 'ACTIVE' && Array.isArray(loan.schedule)) {
          loan.schedule.forEach((scheduleItem) => {
            if (scheduleItem.status === 'OVERDUE') {
              const id = `loan-overdue-${loan.id}-${scheduleItem.installmentNo}`;
              notifications.push({
                id,
                type: 'LOAN_EMI',
                title: `Overdue Loan EMI: ${loan.lenderName}`,
                message: `Installment #${scheduleItem.installmentNo} of रु ${scheduleItem.emiAmount?.toLocaleString()} was due on ${scheduleItem.dueDate}.`,
                timestamp: scheduleItem.dueDate || new Date().toISOString(),
                link: '/loans',
                severity: 'danger',
                read: readIds.has(id),
                countLabel: `रु ${scheduleItem.emiAmount?.toLocaleString()}`,
              });
            } else if (scheduleItem.status === 'PENDING' && scheduleItem.dueDate) {
              const due = new Date(scheduleItem.dueDate);
              due.setHours(0, 0, 0, 0);
              const diffMs = due.getTime() - today.getTime();
              const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

              // If due within next 7 days or due today/yesterday
              if (diffDays <= 7 && diffDays >= -1) {
                const id = `loan-due-${loan.id}-${scheduleItem.installmentNo}`;
                const dueText =
                  diffDays < 0
                    ? 'is overdue'
                    : diffDays === 0
                    ? 'is due today!'
                    : diffDays === 1
                    ? 'is due tomorrow'
                    : `is due in ${diffDays} days (${scheduleItem.dueDate})`;

                notifications.push({
                  id,
                  type: 'LOAN_EMI',
                  title: `Loan EMI Schedule: ${loan.lenderName}`,
                  message: `Installment #${scheduleItem.installmentNo} of रु ${scheduleItem.emiAmount?.toLocaleString()} ${dueText}.`,
                  timestamp: scheduleItem.dueDate,
                  link: '/loans',
                  severity: diffDays <= 1 ? 'danger' : 'warning',
                  read: readIds.has(id),
                  countLabel: `रु ${scheduleItem.emiAmount?.toLocaleString()}`,
                });
              }
            }
          });
        }
      });
    }
  } catch (err) {
    console.warn('Notification fetch: Loan schedule check failed:', err);
  }

  // 3. Fetch Organizations for New Organization Registration Alerts from Login
  try {
    const orgs = await getAllOrganization();
    if (Array.isArray(orgs)) {
      orgs.forEach((org: GetAllMember) => {
        // Pending approval (isActive is false) or newly registered
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
    }
  } catch (err) {
    console.warn('Notification fetch: Organization registration check failed:', err);
  }

  // Sort newest first
  return notifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
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
