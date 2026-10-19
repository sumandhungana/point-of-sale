import { apiService } from '@/infrastructure/utils/ApiService';

export interface AppSettings {
  id?: number;
  memberId?: number;
  khataBookId?: number;
  sideMenuBgColor: string;
  sideMenuBgEndColor: string;
  sideMenuFontColor: string;
  sideMenuHoverFontColor: string;
  sideMenuHoverBgColor: string;
  topMenuBgColor: string;
  topMenuFontColor: string;
  appBgColor: string;
  appForegroundColor: string;
  logoPath?: string | null;
  faviconPath?: string | null;
  loginBgPath?: string | null;
  currency: string;
  currencyPosition: 'before' | 'after';
  dateFormat: string;
  timeFormat: string;
  numberFormat: string;
  language: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const defaultAppSettings: AppSettings = {
  sideMenuBgColor: '#010A2E',
  sideMenuBgEndColor: '#06164A',
  sideMenuFontColor: '#ffffff',
  sideMenuHoverFontColor: '#ffffff',
  sideMenuHoverBgColor: '#495057',
  topMenuBgColor: '#010A2E',
  topMenuFontColor: '#06164A',
  appBgColor: '#f8f9fa',
  appForegroundColor: '#212529',
  logoPath: null,
  faviconPath: null,
  loginBgPath: null,
  currency: 'रु',
  currencyPosition: 'before',
  dateFormat: 'DD/MM/YYYY',
  timeFormat: 'HH:mm',
  numberFormat: '1,234.56',
  language: 'English',
};

const LOCAL_STORAGE_KEY = 'khatabook_app_settings_cache';

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('authToken');
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

export async function fetchAppSettings(): Promise<AppSettings> {
  try {
    const res = await apiService.get<{ code: number; message: string; data: AppSettings }>('api/v1/app-settings', {
      headers: getAuthHeaders(),
    });

    if (res.success && res.response?.data) {
      const data = res.response.data;
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
      return { ...defaultAppSettings, ...data };
    }
  } catch (err) {
    console.warn('Backend API /api/v1/app-settings unreachable, attempting fallback:', err);
  }

  // Fallback 2: Cached in localStorage
  try {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (cached) {
      return { ...defaultAppSettings, ...JSON.parse(cached) };
    }
  } catch {
    // Ignore JSON parse failure
  }

  return defaultAppSettings;
}

export async function saveAppSettings(formData: Partial<AppSettings>): Promise<AppSettings> {
  try {
    const res = await apiService.put<{ code: number; message: string; data: AppSettings }>('api/v1/app-settings', formData, {
      headers: getAuthHeaders(),
    });

    if (res.success && res.response?.data) {
      const data = res.response.data;
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
      return { ...defaultAppSettings, ...data };
    }
    if (res.failure && res.error) {
      throw new Error(res.error);
    }
  } catch (err: any) {
    console.warn('Backend save failed, attempting legacy endpoint fallback:', err);

    throw new Error(err?.message || 'Failed to save settings');
  }

  return { ...defaultAppSettings, ...formData };
}

export async function resetAppSettings(): Promise<AppSettings> {
  const res = await apiService.post<{ code: number; message: string; data: AppSettings }>('api/v1/app-settings/reset', {}, {
    headers: getAuthHeaders(),
  });

  if (res.success && res.response?.data) {
    const data = res.response.data;
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    return { ...defaultAppSettings, ...data };
  }

  localStorage.removeItem(LOCAL_STORAGE_KEY);
  return defaultAppSettings;
}

// Invoice Settings APIs (Preserved for compatibility)
export async function fetchInvoiceSettings() {
  const response = await fetch('/api/InvoiceSettings', { headers: getAuthHeaders() });
  if (!response.ok) throw new Error('Failed to fetch invoice settings');
  return response.json();
}

export async function saveInvoiceSettings(data: any, isUpdate: boolean, id?: number) {
  const url = isUpdate && id ? `/api/InvoiceSettings/${id}` : '/api/InvoiceSettings';
  const method = isUpdate ? 'PUT' : 'POST';
  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to save settings');
  }
  return response.json();
}