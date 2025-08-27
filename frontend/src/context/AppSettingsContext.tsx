import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { fetchAppSettings } from '../services/appSettingService';

interface AppSettings {
  id?: number;
  sideMenuBgColor: string;
  sideMenuBgEndColor: string;
  sideMenuFontColor: string;
  sideMenuHoverFontColor: string;
  sideMenuHoverBgColor: string;
  topMenuBgColor: string;
  topMenuFontColor: string;
  appBgColor: string;
  appForegroundColor: string;
  currency: string;
  currencyPosition: string;
  dateFormat: string;
  timeFormat: string;
  numberFormat: string;
  language: string;
}

interface AppSettingsContextType {
  settings: AppSettings;
  loading: boolean;
  error: string | null;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  refreshSettings: () => Promise<void>;
}

const defaultSettings: AppSettings = {
  sideMenuBgColor: '#2c3e50',
  sideMenuBgEndColor: '#34495e',
  sideMenuFontColor: '#ffffff',
  sideMenuHoverFontColor: '#ffffff',
  sideMenuHoverBgColor: '#495057',
  topMenuBgColor: '#ffffff',
  topMenuFontColor: '#212529',
  appBgColor: '#f8f9fa',
  appForegroundColor: '#212529',
  currency: 'रु',
  currencyPosition: 'before',
  dateFormat: 'DD/MM/YYYY',
  timeFormat: 'HH:mm',
  numberFormat: '1,234.56',
  language: 'English',
};

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
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('authToken');
      if (!token) {
        setLoading(false);
        return;
      }

      const data = await fetchAppSettings();
      if (data && data.length > 0) {
        const firstSetting = data[0];
        setSettings(prev => ({
          ...prev,
          ...firstSetting
        }));
      }
    } catch (err) {
      console.error('Error loading app settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({
      ...prev,
      ...newSettings
    }));
  };

  const refreshSettings = async () => {
    await loadSettings();
  };

  useEffect(() => {
    loadSettings();
  }, []);

  // Apply settings to CSS custom properties
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--side-menu-bg-color', settings.sideMenuBgColor);
    root.style.setProperty('--side-menu-bg-end-color', settings.sideMenuBgEndColor);
    root.style.setProperty('--side-menu-font-color', settings.sideMenuFontColor);
    root.style.setProperty('--side-menu-hover-font-color', settings.sideMenuHoverFontColor);
    root.style.setProperty('--side-menu-hover-bg-color', settings.sideMenuHoverBgColor);
    root.style.setProperty('--top-menu-bg-color', settings.topMenuBgColor);
    root.style.setProperty('--top-menu-font-color', settings.topMenuFontColor);
    root.style.setProperty('--app-bg-color', settings.appBgColor);
    root.style.setProperty('--app-foreground-color', settings.appForegroundColor);
  }, [settings]);

  const value: AppSettingsContextType = {
    settings,
    loading,
    error,
    updateSettings,
    refreshSettings,
  };

  return (
    <AppSettingsContext.Provider value={value}>
      {children}
    </AppSettingsContext.Provider>
  );
}; 