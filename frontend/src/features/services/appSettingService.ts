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
  topMenuLogoColor?: string | null;
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
  topMenuBgColor: '#ffffff',
  topMenuFontColor: '#000000',
  topMenuLogoColor: 'default',
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

export function getCachedAppSettings(): AppSettings {
  try {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (cached) {
      return { ...defaultAppSettings, ...JSON.parse(cached) };
    }
  } catch {}
  return defaultAppSettings;
}

export function getSystemCurrencySymbol(): string {
  return getCachedAppSettings().currency || 'Rs.';
}

export function getSystemCurrencyPosition(): 'before' | 'after' {
  return getCachedAppSettings().currencyPosition || 'before';
}

export function formatSystemNumber(value: number | string | null | undefined, decimals = 2): string {
  if (value === null || value === undefined || value === '') return '0';
  let num = typeof value === 'number' ? value : parseFloat(String(value));
  if (isNaN(num)) return '0';
  if (Math.abs(num) < 1e-9) num = 0;

  const settings = getCachedAppSettings();
  const format = settings.numberFormat || '1,234.56';
  const fixed = num.toFixed(decimals);
  const [intPart, decPart] = fixed.split('.');
  const trimmedDec = decPart ? decPart.replace(/0+$/, '') : '';

  if (format === '1.234,56') {
    const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return trimmedDec ? `${formattedInt},${trimmedDec}` : formattedInt;
  } else if (format === '1234.56') {
    return trimmedDec ? `${intPart}.${trimmedDec}` : intPart;
  } else {
    const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return trimmedDec ? `${formattedInt}.${trimmedDec}` : formattedInt;
  }
}

export function formatSystemCurrency(amount: number | string | null | undefined, decimals = 2): string {
  const settings = getCachedAppSettings();
  const formatted = formatSystemNumber(amount, decimals);
  const curr = settings.currency || 'रु';
  const pos = settings.currencyPosition || 'before';
  return pos === 'after' ? `${formatted} ${curr}` : `${curr} ${formatted}`;
}

export function formatSystemDate(dateInput: Date | string | null | undefined): string {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return String(dateInput);

  const settings = getCachedAppSettings();
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();

  switch (settings.dateFormat) {
    case 'MM/DD/YYYY':
      return `${month}/${day}/${year}`;
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`;
    case 'DD/MM/YYYY':
    default:
      return `${day}/${month}/${year}`;
  }
}

export function formatSystemTime(timeInput: Date | string | null | undefined): string {
  if (!timeInput) return '';
  const d = typeof timeInput === 'string' && timeInput.includes(':') && !timeInput.includes('T')
    ? new Date(`1970-01-01T${timeInput}`)
    : new Date(timeInput);

  if (isNaN(d.getTime())) return String(timeInput);
  const settings = getCachedAppSettings();

  if (settings.timeFormat === 'hh:mm A') {
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
  }

  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

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