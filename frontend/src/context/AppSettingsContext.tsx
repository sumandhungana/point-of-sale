import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import {
  AppSettings,
  defaultAppSettings,
  fetchAppSettings,
  saveAppSettings as apiSaveAppSettings,
  resetAppSettings as apiResetAppSettings,
} from '../features/services/appSettingService';

interface AppSettingsContextType {
  settings: AppSettings;
  loading: boolean;
  error: string | null;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  saveSettings: (newSettings: Partial<AppSettings>) => Promise<AppSettings>;
  resetSettings: () => Promise<AppSettings>;
  refreshSettings: () => Promise<void>;
  formatCurrency: (amount: number | string | null | undefined) => string;
  formatNumber: (value: number | string | null | undefined, decimals?: number) => string;
  formatDate: (date: Date | string | null | undefined) => string;
  formatTime: (time: Date | string | null | undefined) => string;
}

const AppSettingsContext = createContext<AppSettingsContextType | undefined>(undefined);

export const useAppSettings = () => {
  const context = useContext(AppSettingsContext);
  if (context === undefined) {
    throw new Error('useAppSettings must be used within an AppSettingsProvider');
  }
  return context;
};

interface AppSettingsProviderProps {
  children: ReactNode;
}

export const AppSettingsProvider: React.FC<AppSettingsProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(defaultAppSettings);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAppSettings();
      setSettings(data);
    } catch (err) {
      console.error('Error loading app settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Apply CSS custom properties to root
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--side-menu-bg-color', settings.sideMenuBgColor || '#010A2E');
    root.style.setProperty('--side-menu-bg-end-color', settings.sideMenuBgEndColor || '#06164A');
    root.style.setProperty('--side-menu-font-color', settings.sideMenuFontColor || '#ffffff');
    root.style.setProperty('--side-menu-hover-font-color', settings.sideMenuHoverFontColor || '#ffffff');
    root.style.setProperty('--side-menu-hover-bg-color', settings.sideMenuHoverBgColor || '#495057');
    root.style.setProperty('--top-menu-bg-color', settings.topMenuBgColor || '#010A2E');
    root.style.setProperty('--top-menu-font-color', settings.topMenuFontColor || '#ffffff');
    root.style.setProperty('--app-bg-color', settings.appBgColor || '#f8f9fa');
    root.style.setProperty('--app-foreground-color', settings.appForegroundColor || '#212529');

    // Update Favicon if provided
    if (settings.faviconPath) {
      let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
      if (!link) {
        link = document.createElement('link');
        link.type = 'image/x-icon';
        link.rel = 'shortcut icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = settings.faviconPath;
    }
  }, [settings]);

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => ({
      ...prev,
      ...newSettings,
    }));
  };

  const saveSettings = async (newSettings: Partial<AppSettings>): Promise<AppSettings> => {
    try {
      setLoading(true);
      const updated = await apiSaveAppSettings(newSettings);
      setSettings(updated);
      return updated;
    } finally {
      setLoading(false);
    }
  };

  const resetSettings = async (): Promise<AppSettings> => {
    try {
      setLoading(true);
      const reset = await apiResetAppSettings();
      setSettings(reset);
      return reset;
    } finally {
      setLoading(false);
    }
  };

  const refreshSettings = async () => {
    await loadSettings();
  };

  // Number formatting helper
  const formatNumber = useCallback(
    (value: number | string | null | undefined, decimals = 2): string => {
      if (value === null || value === undefined || value === '') return '0.00';
      const num = typeof value === 'number' ? value : parseFloat(String(value));
      if (isNaN(num)) return '0.00';

      const format = settings.numberFormat || '1,234.56';
      const fixed = num.toFixed(decimals);
      const [intPart, decPart] = fixed.split('.');

      if (format === '1.234,56') {
        const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        return decPart ? `${formattedInt},${decPart}` : formattedInt;
      } else if (format === '1234.56') {
        return fixed;
      } else {
        // Standard 1,234.56
        const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return decPart ? `${formattedInt}.${decPart}` : formattedInt;
      }
    },
    [settings.numberFormat]
  );

  // Currency formatting helper
  const formatCurrency = useCallback(
    (amount: number | string | null | undefined): string => {
      const formatted = formatNumber(amount);
      const curr = settings.currency || 'रु';
      const pos = settings.currencyPosition || 'before';

      return pos === 'after' ? `${formatted} ${curr}` : `${curr} ${formatted}`;
    },
    [formatNumber, settings.currency, settings.currencyPosition]
  );

  // Date formatting helper
  const formatDate = useCallback(
    (dateInput: Date | string | null | undefined): string => {
      if (!dateInput) return '';
      const d = new Date(dateInput);
      if (isNaN(d.getTime())) return String(dateInput);

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
    },
    [settings.dateFormat]
  );

  // Time formatting helper
  const formatTime = useCallback(
    (timeInput: Date | string | null | undefined): string => {
      if (!timeInput) return '';
      const d = typeof timeInput === 'string' && timeInput.includes(':') && !timeInput.includes('T')
        ? new Date(`1970-01-01T${timeInput}`)
        : new Date(timeInput);

      if (isNaN(d.getTime())) return String(timeInput);

      if (settings.timeFormat === 'hh:mm A') {
        let hours = d.getHours();
        const minutes = String(d.getMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // 0 becomes 12
        return `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
      }

      // Default 24-hour HH:mm
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      return `${hours}:${minutes}`;
    },
    [settings.timeFormat]
  );

  const value: AppSettingsContextType = {
    settings,
    loading,
    error,
    updateSettings,
    saveSettings,
    resetSettings,
    refreshSettings,
    formatCurrency,
    formatNumber,
    formatDate,
    formatTime,
  };

  return <AppSettingsContext.Provider value={value}>{children}</AppSettingsContext.Provider>;
};