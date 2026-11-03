// Service for Dashboard Designer & Role-based Dashboard Configuration
import { apiService } from '@/infrastructure/utils/ApiService';
import { fetchRoles, Role } from './permissionService';

export interface DashboardWidgetDefinition {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  bgColor: string;
  category: 'core_pos' | 'finance' | 'inventory' | 'system';
  isCurrency?: boolean;
  defaultValue: string | number;
}

export interface DashboardRowConfig {
  id: string;
  widgets: string[]; // List of widget IDs in this row
}

export interface RoleDashboardSetting {
  id?: number;
  memberId?: number;
  roleId?: number;
  roleName: string;
  roleOrder?: number;
  enabled: boolean;
  dashboardType: 'custom' | 'admin' | 'cashier' | 'inventory' | 'finance';
  rows: DashboardRowConfig[];
  showSupplierChart: boolean;
  showCustomerChart: boolean;
  showInventoryChart: boolean;
  showSystemMonitor: boolean;
}

export interface ConfigurableRole {
  id?: number;
  name: string;
  description?: string;
  roleOrder: number;
  roleCategory: string;
}

interface BackendDashboardDto {
  id?: number;
  memberId?: number;
  roleId?: number;
  roleName: string;
  roleOrder?: number;
  dashboardType: string;
  enabled: boolean;
  rowsConfig?: string;
  showSupplierChart?: boolean;
  showCustomerChart?: boolean;
  showInventoryChart?: boolean;
  showSystemMonitor?: boolean;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface RestResponse<T> {
  code: number;
  message: string;
  data: T;
  error?: string;
}

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Master list of all 13 core required widgets plus system metrics
export const AVAILABLE_WIDGETS: DashboardWidgetDefinition[] = [
  // Core Required Metrics
  {
    id: 'total_customers',
    title: 'TOTAL CUSTOMER',
    subtitle: 'Active Client Accounts',
    icon: 'bi-people-fill',
    bgColor: '#1565c0', // Royal Blue
    category: 'core_pos',
    defaultValue: 0,
  },
  {
    id: 'total_suppliers',
    title: 'TOTAL SUPPLIER',
    subtitle: 'Vendors & Partners',
    icon: 'bi-shop',
    bgColor: '#00838f', // Deep Teal
    category: 'core_pos',
    defaultValue: 0,
  },
  {
    id: 'total_users',
    title: 'TOTAL USER',
    subtitle: 'Registered System Users',
    icon: 'bi-person-circle',
    bgColor: '#3f51b5', // Indigo
    category: 'core_pos',
    defaultValue: 0,
  },
  {
    id: 'total_organizations',
    title: 'TOTAL ORGANIZATION',
    subtitle: 'Registered Organizations',
    icon: 'bi-building',
    bgColor: '#4527a0', // Deep Violet
    category: 'core_pos',
    defaultValue: 0,
  },
  {
    id: 'total_roles',
    title: 'TOTAL ROLES',
    subtitle: 'Roles & Permissions',
    icon: 'bi-shield-lock-fill',
    bgColor: '#6a1b9a', // Deep Purple
    category: 'core_pos',
    defaultValue: 0,
  },
  {
    id: 'total_due',
    title: 'TOTAL DUE',
    subtitle: 'Accounts Receivable',
    icon: 'bi-arrow-up-circle',
    bgColor: '#d32f2f', // Bright Crimson
    category: 'finance',
    isCurrency: true,
    defaultValue: 0,
  },
  {
    id: 'total_sales',
    title: 'TOTAL SALES',
    subtitle: 'Sales Bills Completed',
    icon: 'bi-cash-coin',
    bgColor: '#2e7d32', // Rich Green
    category: 'finance',
    defaultValue: 0,
  },
  {
    id: 'total_purchase',
    title: 'TOTAL PURCHASE',
    subtitle: 'Purchase Bills Recorded',
    icon: 'bi-cart-check',
    bgColor: '#e65100', // Deep Orange
    category: 'finance',
    defaultValue: 0,
  },
  {
    id: 'total_staff',
    title: 'TOTAL STAFF',
    subtitle: 'Active Staff Members',
    icon: 'bi-person-badge',
    bgColor: '#00796b', // Ocean Teal
    category: 'core_pos',
    defaultValue: 0,
  },
  {
    id: 'total_expenses',
    title: 'TOTAL EXPENSES',
    subtitle: 'Operating Costs',
    icon: 'bi-box-seam',
    bgColor: '#c2185b', // Ruby Red
    category: 'finance',
    defaultValue: 0,
  },
  {
    id: 'total_income',
    title: 'TOTAL INCOME',
    subtitle: 'Other Revenue',
    icon: 'bi-wallet2',
    bgColor: '#1b5e20', // Forest Green
    category: 'finance',
    defaultValue: 0,
  },
  {
    id: 'total_cashbook',
    title: 'TOTAL CASHBOOK',
    subtitle: 'Ledger Entries',
    icon: 'bi-credit-card',
    bgColor: '#5c6bc0', // Soft Slate Indigo
    category: 'finance',
    defaultValue: 0,
  },
  {
    id: 'total_paid',
    title: 'TOTAL PAID',
    subtitle: 'Customer Settlements',
    icon: 'bi-arrow-down-circle',
    bgColor: '#388e3c', // Vibrant Green
    category: 'finance',
    isCurrency: true,
    defaultValue: 0,
  },

  // Inventory & System Extras
  {
    id: 'total_item',
    title: 'TOTAL ITEMS',
    subtitle: 'Product Catalogue',
    icon: 'bi-bag-check',
    bgColor: '#455a64',
    category: 'inventory',
    defaultValue: 0,
  },
  {
    id: 'system_uptime',
    title: 'SYSTEM UPTIME',
    subtitle: 'Server Availability',
    icon: 'bi-plug',
    bgColor: '#ab47bc',
    category: 'system',
    defaultValue: '0 days 12 hours 8 min',
  },

  {
    id: 'system_disk',
    title: 'SYSTEM DISK',
    subtitle: 'Used System Disk',
    icon: 'bi-hdd-network',
    bgColor: '#0288d1',
    category: 'system',
    defaultValue: '64%',
  },
];

const STORAGE_KEY = 'pos_role_dashboard_settings_v1';

// Default presets for different role categories
export const ROLE_PRESETS: Record<string, RoleDashboardSetting> = {
  // Admin Preset (Order 1 & 2)
  admin: {
    roleName: 'ADMIN',
    roleOrder: 2,
    enabled: true,
    dashboardType: 'admin',
    rows: [
      {
        id: 'row-1',
        widgets: ['total_organizations', 'total_users', 'total_roles', 'total_staff'],
      },
      {
        id: 'row-2',
        widgets: ['total_customers', 'total_suppliers', 'total_sales', 'total_purchase'],
      },
      {
        id: 'row-3',
        widgets: ['total_due', 'total_paid', 'total_income', 'total_expenses'],
      },
    ],
    showSupplierChart: true,
    showCustomerChart: true,
    showInventoryChart: true,
    showSystemMonitor: true,
  },

  // POS / Full Store Manager Preset (Order 3)
  manager: {
    roleName: 'MANAGER',
    roleOrder: 3,
    enabled: true,
    dashboardType: 'custom',
    rows: [
      {
        id: 'row-1',
        widgets: ['total_sales', 'total_purchase', 'total_income', 'total_expenses'],
      },
      {
        id: 'row-2',
        widgets: ['total_customers', 'total_suppliers', 'total_cashbook', 'total_staff'],
      },
      {
        id: 'row-3',
        widgets: ['total_paid', 'total_due'],
      },
    ],
    showSupplierChart: true,
    showCustomerChart: true,
    showInventoryChart: true,
    showSystemMonitor: false,
  },

  // Cashier Preset (Order 3 - Streamlined for counter sales & payments)
  cashier: {
    roleName: 'CASHIER',
    roleOrder: 3,
    enabled: true,
    dashboardType: 'cashier',
    rows: [
      {
        id: 'row-1',
        widgets: ['total_sales', 'total_paid', 'total_due', 'total_customers'],
      },
      {
        id: 'row-2',
        widgets: ['total_cashbook', 'total_item'],
      },
    ],
    showSupplierChart: false,
    showCustomerChart: true,
    showInventoryChart: false,
    showSystemMonitor: false,
  },

  // Inventory Staff Preset (Order 3)
  inventory: {
    roleName: 'INVENTORY',
    roleOrder: 3,
    enabled: true,
    dashboardType: 'inventory',
    rows: [
      {
        id: 'row-1',
        widgets: ['total_item', 'total_purchase', 'total_suppliers', 'total_expenses'],
      },
    ],
    showSupplierChart: true,
    showCustomerChart: false,
    showInventoryChart: true,
    showSystemMonitor: false,
  },

  // Staff Preset (Order 3)
  staff: {
    roleName: 'STAFF',
    roleOrder: 3,
    enabled: true,
    dashboardType: 'custom',
    rows: [
      {
        id: 'row-1',
        widgets: ['total_sales', 'total_customers', 'total_paid', 'total_cashbook'],
      },
    ],
    showSupplierChart: false,
    showCustomerChart: true,
    showInventoryChart: false,
    showSystemMonitor: false,
  },
};

export const DEFAULT_DASHBOARD_SETTING: RoleDashboardSetting = {
  roleName: 'DEFAULT',
  roleOrder: 3,
  enabled: true,
  dashboardType: 'admin',
  rows: [
    {
      id: 'row-1',
      widgets: ['total_organizations', 'total_users', 'total_roles', 'total_staff'],
    },
    {
      id: 'row-2',
      widgets: ['total_customers', 'total_suppliers', 'total_sales', 'total_purchase'],
    },
    {
      id: 'row-3',
      widgets: ['total_due', 'total_paid', 'total_income', 'total_expenses'],
    },
  ],
  showSupplierChart: true,
  showCustomerChart: true,
  showInventoryChart: true,
  showSystemMonitor: true,
};

// Retrieve all role dashboard settings from localStorage cache
export function getAllRoleDashboardSettings(): Record<string, RoleDashboardSetting> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to parse dashboard settings cache:', e);
  }
  return {};
}

// Retrieve setting for a specific role name from localStorage cache
export function getDashboardSettingForRole(roleName?: string | null): RoleDashboardSetting {
  const allSettings = getAllRoleDashboardSettings();
  const normalizedRole = (roleName || '').trim().toUpperCase();

  const foundSetting = (normalizedRole && allSettings[normalizedRole]) ||
    (roleName && allSettings[roleName.trim()]) ||
    ((normalizedRole.includes('SUPER') || normalizedRole === '1') && (allSettings['SUPER ADMIN'] || allSettings['Super Admin'] || allSettings['1'])) ||
    ((normalizedRole.includes('ADMIN') || normalizedRole === '2') && (allSettings['ADMIN'] || allSettings['Admin'] || allSettings['2']));

  if (foundSetting) {
    const s = { ...foundSetting };
    if (typeof s.rows === 'string') {
      try {
        let p = JSON.parse(s.rows);
        if (typeof p === 'string') p = JSON.parse(p);
        s.rows = Array.isArray(p) ? p : [];
      } catch {
        s.rows = [];
      }
    }
    return s;
  }

  // Check built-in presets by name
  if (normalizedRole === 'SUPERADMIN' || normalizedRole === 'SUPER ADMIN' || normalizedRole === '1') {
    return { ...ROLE_PRESETS.admin, roleName: 'Super Admin', roleOrder: 1 };
  }
  if (normalizedRole === 'ADMIN' || normalizedRole === '2') {
    return { ...ROLE_PRESETS.admin, roleName: 'Admin', roleOrder: 2 };
  }
  if (normalizedRole === 'MANAGER') {
    return { ...ROLE_PRESETS.manager, roleName: 'Manager', roleOrder: 3 };
  }
  if (normalizedRole === 'CASHIER') {
    return { ...ROLE_PRESETS.cashier, roleName: 'Cashier', roleOrder: 3 };
  }
  if (normalizedRole === 'STAFF') {
    return { ...ROLE_PRESETS.staff, roleName: 'Staff', roleOrder: 3 };
  }

  if (allSettings['DEFAULT']) {
    const def = { ...allSettings['DEFAULT'] };
    if (!Array.isArray(def.rows)) def.rows = DEFAULT_DASHBOARD_SETTING.rows;
    return def;
  }

  return { ...DEFAULT_DASHBOARD_SETTING, roleName: roleName || 'DEFAULT' };
}

// Helper: Parse backend DTO into RoleDashboardSetting
function parseBackendDto(dto: BackendDashboardDto): RoleDashboardSetting {
  let parsedRows: DashboardRowConfig[] = [];
  const rawRows = dto.rowsConfig as any;

  if (Array.isArray(rawRows)) {
    parsedRows = rawRows;
  } else if (typeof rawRows === 'string' && rawRows.trim().length > 0) {
    try {
      let parsed = JSON.parse(rawRows);
      // If it was double-stringified by JSON serialization, parse again
      if (typeof parsed === 'string') {
        parsed = JSON.parse(parsed);
      }
      if (Array.isArray(parsed)) {
        parsedRows = parsed;
      }
    } catch (e) {
      console.warn('Failed to parse rowsConfig:', rawRows, e);
      parsedRows = [];
    }
  }

  if (dto.rowsConfig === undefined || dto.rowsConfig === null) {
    const preset = getDashboardSettingForRole(dto.roleName);
    parsedRows = Array.isArray(preset.rows) ? preset.rows : [];
  }

  const resolvedOrder = dto.roleOrder ?? (dto.roleName?.toUpperCase().includes('SUPER') ? 1 : dto.roleName?.toUpperCase().includes('ADMIN') ? 2 : 3);
  const resolvedType = resolvedOrder === 1 ? 'Super Admin' : resolvedOrder === 2 ? 'Admin' : (dto.dashboardType || dto.roleName || 'Custom');

  return {
    id: dto.id,
    memberId: dto.memberId,
    roleId: dto.roleId,
    roleName: dto.roleName,
    roleOrder: resolvedOrder,
    enabled: dto.enabled,
    dashboardType: resolvedType as any,
    rows: Array.isArray(parsedRows) ? parsedRows : [],
    showSupplierChart: dto.showSupplierChart === true || (dto.showSupplierChart as any) === 'true',
    showCustomerChart: dto.showCustomerChart === true || (dto.showCustomerChart as any) === 'true',
    showInventoryChart: dto.showInventoryChart === true || (dto.showInventoryChart as any) === 'true',
    showSystemMonitor: dto.showSystemMonitor === true || (dto.showSystemMonitor as any) === 'true',
  };
}

// Fetch dashboard setting from backend API with localStorage fallback
export async function fetchRoleDashboardSettingApi(roleName: string): Promise<RoleDashboardSetting> {
  try {
    const res = await apiService.get<RestResponse<BackendDashboardDto>>('api/v1/dashboard-settings', {
      headers: getAuthHeaders()
    });

    if (res.success && res.response?.data) {
      const parsed = parseBackendDto(res.response.data);
      saveDashboardSettingForRole(roleName, parsed);
      return parsed;
    }
  } catch (err) {
    console.warn(`Backend fetch failed for role "${roleName}", using local cache fallback:`, err);
  }

  return getDashboardSettingForRole(roleName);
}

// Save dashboard setting to backend API and local storage
export async function saveRoleDashboardSettingApi(setting: RoleDashboardSetting): Promise<RoleDashboardSetting> {
  const resolvedType =
    setting.roleOrder === 1
      ? 'Super Admin'
      : setting.roleOrder === 2
      ? 'Admin'
      : setting.dashboardType || setting.roleName || 'Custom';

  const updatedSetting: RoleDashboardSetting = {
    ...setting,
    dashboardType: resolvedType as any,
  };

  saveDashboardSettingForRole(setting.roleName, updatedSetting);

  const payload: Partial<BackendDashboardDto> = {
    id: updatedSetting.id,
    roleId: updatedSetting.roleId,
    roleName: updatedSetting.roleName,
    roleOrder: updatedSetting.roleOrder,
    dashboardType: resolvedType,
    enabled: updatedSetting.enabled,
    rowsConfig: JSON.stringify(updatedSetting.rows),
    showSupplierChart: Boolean(updatedSetting.showSupplierChart),
    showCustomerChart: Boolean(updatedSetting.showCustomerChart),
    showInventoryChart: Boolean(updatedSetting.showInventoryChart),
    showSystemMonitor: Boolean(updatedSetting.showSystemMonitor),
  };

  try {
    const res = await apiService.put<RestResponse<BackendDashboardDto>>('api/v1/dashboard-settings', payload, {
      headers: getAuthHeaders(),
    });
    if(res?.response?.code != 0 || res?.response?.message != 'SUCCESS') {
      throw new Error(res?.response?.message)
    }

    if (res.failure && res.error) {
      throw new Error(res.error);
    }

    if (res.success && res.response?.data) {
      const updated = parseBackendDto(res.response.data);
      saveDashboardSettingForRole(setting.roleName, updated);
      return updated;
    }
  } catch (err: any) {
    console.warn('Backend save to /api/v1/dashboard-settings failed, cached locally:', err);
    throw new Error(err?.message || 'Failed to save dashboard setting');
  }

  return setting;
}

// Reset dashboard setting for a role via backend API
export async function resetRoleDashboardSettingApi(roleName: string): Promise<RoleDashboardSetting> {
  try {
    const res = await apiService.post<RestResponse<BackendDashboardDto>>(
      `api/v1/dashboard-settings/reset?roleName=${encodeURIComponent(roleName)}`,
      {},
      { headers: getAuthHeaders() }
    );

    if (res.success && res.response?.data) {
      const resetSetting = parseBackendDto(res.response.data);
      saveDashboardSettingForRole(roleName, resetSetting);
      return resetSetting;
    }
  } catch (err) {
    console.warn(`Backend reset failed for role "${roleName}", using local reset:`, err);
  }

  return resetDashboardSettingForRole(roleName);
}

// Save dashboard setting for a specific role in local storage
export function saveDashboardSettingForRole(roleName: string, setting: RoleDashboardSetting): void {
  const allSettings = getAllRoleDashboardSettings();
  const normalizedRole = (roleName || 'DEFAULT').trim().toUpperCase();
  allSettings[normalizedRole] = {
    ...setting,
    roleName: roleName || normalizedRole,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(allSettings));
}

// Reset setting for a role to factory default in local storage
export function resetDashboardSettingForRole(roleName: string): RoleDashboardSetting {
  const normalizedRole = (roleName || 'DEFAULT').trim().toUpperCase();
  const allSettings = getAllRoleDashboardSettings();
  delete allSettings[normalizedRole];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(allSettings));
  return getDashboardSettingForRole(normalizedRole);
}

// Resolve role order from role name or user info

export function resolveRoleName(roleIdentifier?: string | number | null): string {
  if (roleIdentifier === undefined || roleIdentifier === null) return 'Admin';
  const str = String(roleIdentifier).trim();
  const lower = str.toLowerCase();
  if (lower === '1' || lower === 'superadmin' || lower === 'super_admin' || lower.includes('super')) {
    return 'Super Admin';
  }
  if (lower === '2' || lower === 'admin') {
    return 'Admin';
  }
  return str;
}

export function resolveRoleOrder(roleName?: string | null): number {
  if (!roleName) return 3;
  const normalized = roleName.trim().toUpperCase();
  if (normalized === 'SUPERADMIN' || normalized === 'SUPER ADMIN') {
    return 1;
  }
  if (normalized === 'ADMIN') {
    return 2;
  }
  return 3;
}

/**
 * Fetch roles according to role order hierarchy:
 * - Order 1 (Super Admin): Allowed dropdown of Order 1 and Order 2 roles
 * - Order 2 (Admin): Allowed dropdown of Order 3 roles (less than Admin)
 * - Order 3: None / restricted
 */
export async function fetchConfigurableRoles(callerRoleName?: string | null): Promise<ConfigurableRole[]> {
  const callerOrder = resolveRoleOrder(callerRoleName);

  // 1. Attempt backend API first
  try {
    const res = await apiService.get<RestResponse<ConfigurableRole[]>>('api/v1/dashboard-settings/roles', {
      headers: getAuthHeaders(),
    });
    const responseData = res?.response?.data;
    if (res.success && Array.isArray(responseData) && responseData.length > 0) {
      return responseData; // TypeScript now knows for sure this is a non-empty array
    }
  } catch (err) {
    console.warn('Backend API /api/v1/dashboard-settings/roles unreachable, applying frontend order filter:', err);
  }

  // 2. Fallback: Query system roles and filter according to caller role order
  const allowedTargetOrders = callerOrder === 1 ? [1, 2] : callerOrder === 2 ? [3] : [];

  const defaultPresets: ConfigurableRole[] = [
    { id: 1, name: 'Super Admin', description: 'Super Administrator', roleOrder: 1, roleCategory: 'Order 1: Super Admin' },
    { id: 2, name: 'Admin', description: 'Administrator', roleOrder: 2, roleCategory: 'Order 2: Admin' },
    { id: 3, name: 'Manager', description: 'Store / Inventory Manager', roleOrder: 3, roleCategory: 'Order 3: Less than Admin' },
    { id: 4, name: 'Cashier', description: 'Sales Cashier', roleOrder: 3, roleCategory: 'Order 3: Less than Admin' },
    { id: 5, name: 'Staff', description: 'Store Staff', roleOrder: 3, roleCategory: 'Order 3: Less than Admin' },
  ];

  try {
    const apiRoles: Role[] = await fetchRoles();
    if (Array.isArray(apiRoles) && apiRoles.length > 0) {
      const result: ConfigurableRole[] = [];

      apiRoles.forEach((r) => {
        const order = r.roleOrder ?? resolveRoleOrder(r.name);
        if (allowedTargetOrders.includes(order)) {
          result.push({
            id: r.id,
            name: r.name,
            description: r.description,
            roleOrder: order,
            roleCategory: order === 1 ? 'Order 1: Super Admin' : order === 2 ? 'Order 2: Admin' : 'Order 3: Less than Admin',
          });
        }
      });

      if (result.length > 0) {
        return result.sort((a, b) => a.roleOrder - b.roleOrder);
      }
    }
  } catch (e) {
    console.warn('Could not fetch roles from role service, using preset list:', e);
  }

  return defaultPresets.filter((p) => allowedTargetOrders.includes(p.roleOrder));
}
