import React, { useState, useEffect, useMemo } from 'react';
import { Sidebar } from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import { toast } from 'react-toastify';
import {
  AVAILABLE_WIDGETS,
  RoleDashboardSetting,
  DashboardWidgetDefinition,
  ConfigurableRole,
  fetchConfigurableRoles,
  fetchRoleDashboardSettingApi,
  saveRoleDashboardSettingApi,
  resetRoleDashboardSettingApi,
  resolveRoleOrder,
} from '@/features/services/dashboardSettingService';
import { getCustomers } from '@/features/services/customerService';
import { getSuppliers } from '@/features/services/supplierService';
import { SystemMonitor } from '@/components/SystemMonitor';
import { getDashboardPaymentTotals } from '@/services/paymentService';
import { fetchStaff } from '@/features/services/staffService';
import { getAllSalesBill, GetAllSalesBillResponse } from '@/features/services/salesBillService';
import { fetchPurchases, GetAllPurchaseBillResponse } from '@/features/services/purchaseBillService';
import { fetchExpenses } from '@/services/expensesListService';
import { fetchIncomes } from '@/services/incomeService';
import { fetchCashbooks } from '@/services/cashbookService';
import { getProduct, Item } from '@/features/services/productService';
import { getAllOrganization } from '@/features/services/organizationService';
import { fetchRoles } from '@/features/services/permissionService';
import { fetchUsers } from '@/features/services/userService';
import { useAppSettings } from '@/context/AppSettingsContext';
import { useAuth } from '@/core/auth/AuthContext';
import '../styles/Dashboard.css';
import '../styles/DashboardSetting.css';

interface MonthlyBarPoint {
  monthKey: string;
  label: string;
  salesAmount: number;
  purchasesAmount: number;
  salesCount: number;
  purchasesCount: number;
}

export const DashboardSetting: React.FC = () => {
  const { formatCurrency, formatNumber } = useAppSettings();
  const { user } = useAuth();

  const callerRole = user?.role || 'Admin';
  const callerOrder = resolveRoleOrder(callerRole);

  const [configurableRoles, setConfigurableRoles] = useState<ConfigurableRole[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [setting, setSetting] = useState<RoleDashboardSetting>({
    roleName: '',
    enabled: true,
    dashboardType: 'admin',
    rows: [],
    showSupplierChart: true,
    showCustomerChart: true,
    showInventoryChart: true,
    showSystemMonitor: true,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [activeRowIdx, setActiveRowIdx] = useState<number>(0);
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [previewMode, setPreviewMode] = useState<boolean>(false);
  const [draggedWidgetId, setDraggedWidgetId] = useState<string | null>(null);

  // Live Metric Datasets for Real Figures in Dashboard Settings
  const [totalCustomers, setTotalCustomers] = useState<number>(0);
  const [totalSuppliers, setTotalSuppliers] = useState<number>(0);
  const [totalStaff, setTotalStaff] = useState<number>(0);
  const [totalSales, setTotalSales] = useState<number>(0);
  const [totalPurchase, setTotalPurchase] = useState<number>(0);
  const [totalExpenses, setTotalExpenses] = useState<number>(0);
  const [totalIncome, setTotalIncome] = useState<number>(0);
  const [totalCashbook, setTotalCashbook] = useState<number>(0);
  const [totalItem, setTotalItem] = useState<number>(0);
  const [totalDue, setTotalDue] = useState<number>(0);
  const [totalPaid, setTotalPaid] = useState<number>(0);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [totalOrganizations, setTotalOrganizations] = useState<number>(0);
  const [totalRoles, setTotalRoles] = useState<number>(0);
  const [purchases, setPurchases] = useState<GetAllPurchaseBillResponse[]>([]);
  const [salesBills, setSalesBills] = useState<GetAllSalesBillResponse[]>([]);
  const [inventoryItems, setInventoryItems] = useState<Item[]>([]);

  // Fetch live metrics and datasets
  useEffect(() => {
    async function fetchLiveData() {
      try {
        const [
          customersData,
          suppliersData,
          staffData,
          salesBillsData,
          purchasesData,
          expensesData,
          incomesData,
          cashbooksData,
          itemsData,
          usersData,
          orgsData,
          rolesData,
        ] = await Promise.allSettled([
          getCustomers(),
          getSuppliers(),
          fetchStaff(),
          getAllSalesBill(),
          fetchPurchases(),
          fetchExpenses(),
          fetchIncomes(),
          fetchCashbooks(),
          getProduct(),
          fetchUsers(),
          getAllOrganization(),
          fetchRoles(),
        ]);

        if (customersData.status === 'fulfilled') {
          setTotalCustomers(Array.isArray(customersData.value) ? customersData.value.length : 0);
        }
        if (suppliersData.status === 'fulfilled') {
          setTotalSuppliers(Array.isArray(suppliersData.value) ? suppliersData.value.length : 0);
        }
        if (staffData.status === 'fulfilled') {
          setTotalStaff(Array.isArray(staffData.value) ? staffData.value.length : 0);
        }
        if (salesBillsData.status === 'fulfilled') {
          const bills = Array.isArray(salesBillsData.value) ? salesBillsData.value : [];
          setSalesBills(bills);
          setTotalSales(bills.length);
        }
        if (purchasesData.status === 'fulfilled') {
          const purchaseList = Array.isArray(purchasesData.value) ? purchasesData.value : [];
          setPurchases(purchaseList);
          setTotalPurchase(purchaseList.length);
        }
        if (expensesData.status === 'fulfilled') {
          setTotalExpenses(Array.isArray(expensesData.value) ? expensesData.value.length : 0);
        }
        if (incomesData.status === 'fulfilled') {
          setTotalIncome(Array.isArray(incomesData.value) ? incomesData.value.length : 0);
        }
        if (cashbooksData.status === 'fulfilled') {
          setTotalCashbook(Array.isArray(cashbooksData.value) ? cashbooksData.value.length : 0);
        }
        if (itemsData.status === 'fulfilled') {
          const pData = itemsData.value;
          const itemList: Item[] = Array.isArray(pData) ? pData : (pData?.items || []);
          setInventoryItems(itemList);
          setTotalItem(itemList.length || pData?.totalItems || 0);
        }
        if (usersData.status === 'fulfilled' && Array.isArray(usersData.value)) {
          setTotalUsers(usersData.value.length);
        }
        if (orgsData.status === 'fulfilled' && Array.isArray(orgsData.value)) {
          setTotalOrganizations(orgsData.value.length);
        }
        if (rolesData.status === 'fulfilled' && Array.isArray(rolesData.value)) {
          setTotalRoles(rolesData.value.length);
        }

        try {
          const totals = await getDashboardPaymentTotals();
          setTotalDue(Number(totals?.totalGiven) || 0);
          setTotalPaid(Number(totals?.totalReceived) || 0);
        } catch {
          setTotalDue(0);
          setTotalPaid(0);
        }
      } catch (err) {
        console.error('Error fetching live metrics in dashboard settings:', err);
      }
    }
    void fetchLiveData();
  }, []);

  // Load roles available to configure according to role order
  useEffect(() => {
    async function loadRoles() {
      setLoading(true);
      try {
        const roles = await fetchConfigurableRoles(callerRole);
        setConfigurableRoles(roles);

        if (roles.length > 0) {
          const initialRoleObj = roles[0];
          const initialRole = initialRoleObj.name;
          setSelectedRole(initialRole);
          const initialSetting = await fetchRoleDashboardSettingApi(initialRole);
          const roleId = initialRoleObj?.id ? initialRoleObj.id : (initialSetting.roleId ?? 0);
          setSetting({
            ...initialSetting,
            rows: Array.isArray(initialSetting.rows) ? initialSetting.rows : [],
            roleId,
          });
        }
      } catch (err) {
        console.error('Error loading configurable roles:', err);
        toast.error('Failed to load configurable roles');
      } finally {
        setLoading(false);
      }
    }
    void loadRoles();
  }, [callerRole]);

  // When selected role changes in dropdown, fetch its setting from backend API
  const handleRoleChange = async (newRoleName: string) => {
    setSelectedRole(newRoleName);
    setActiveRowIdx(0);
    try {
      const targetRoleObj = configurableRoles.find((r) => r.name === newRoleName);
      const loaded = await fetchRoleDashboardSettingApi(newRoleName);
      const roleId = targetRoleObj?.id ? targetRoleObj.id : (loaded.roleId ?? 0);
      setSetting({
        ...loaded,
        rows: Array.isArray(loaded.rows) ? loaded.rows : [],
        roleId,
      });
    } catch (err) {
      console.error('Error fetching role setting:', err);
    }
  };

  // Map widget ID to widget definition
  const widgetMap = useMemo(() => {
    const map = new Map<string, DashboardWidgetDefinition>();
    AVAILABLE_WIDGETS.forEach((w) => map.set(w.id, w));
    return map;
  }, []);

  // Filter available widgets
  const filteredWidgets = useMemo(() => {
    if (!searchFilter.trim()) return AVAILABLE_WIDGETS;
    const q = searchFilter.toLowerCase();
    return AVAILABLE_WIDGETS.filter(
      (w) =>
        w.title.toLowerCase().includes(q) ||
        w.subtitle.toLowerCase().includes(q) ||
        w.category.toLowerCase().includes(q)
    );
  }, [searchFilter]);

  // Safe normalized rows array
  const rows = useMemo(() => {
    const raw = setting?.rows;
    if (Array.isArray(raw)) return raw;
    if (typeof raw === 'string' && (raw as string).trim().length > 0) {
      try {
        let p = JSON.parse(raw);
        if (typeof p === 'string') p = JSON.parse(p);
        if (Array.isArray(p)) return p;
      } catch {
        // ignore
      }
    }
    return [];
  }, [setting?.rows]);

  // Total times each widget is currently placed
  const widgetUsageCount = useMemo(() => {
    const counts = new Map<string, number>();
    rows.forEach((row) => {
      const widgetList = Array.isArray(row?.widgets) ? row.widgets : [];
      widgetList.forEach((id: string) => {
        counts.set(id, (counts.get(id) || 0) + 1);
      });
    });
    return counts;
  }, [rows]);

  const formatCount = (count: number): string => {
    const safe = Number.isFinite(count) ? Math.trunc(count) : 0;
    if (safe === 0) return '0';
    if (safe > 0 && safe < 10) return `0${safe}`;
    return formatNumber(safe, 0);
  };

  // Calculations for Charts using Real Backend Data
  const totalPurchaseAmount = useMemo(() => {
    return purchases.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
  }, [purchases]);

  const totalSalesRevenue = useMemo(() => {
    return salesBills.reduce((acc, b) => acc + (Number(b.amount) || 0), 0);
  }, [salesBills]);

  const totalFinancial = useMemo(() => {
    return (totalPaid || 0) + (totalDue || 0);
  }, [totalPaid, totalDue]);

  const recoveryRate = useMemo(() => {
    if (totalFinancial <= 0) return 0;
    return Math.min(100, Math.max(0, Math.round((totalPaid / totalFinancial) * 100)));
  }, [totalPaid, totalFinancial]);

  const donutRadius = 60;
  const donutCircumference = 2 * Math.PI * donutRadius;
  const paidArc = totalFinancial > 0 ? (totalPaid / totalFinancial) * donutCircumference : 0;
  const dueArc = totalFinancial > 0 ? (totalDue / totalFinancial) * donutCircumference : 0;

  // Monthly Aggregation for Supplier Payment Chart
  const monthlyData: MonthlyBarPoint[] = useMemo(() => {
    const months: MonthlyBarPoint[] = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = d.getMonth();
      const monthStr = (month + 1).toString().padStart(2, '0');
      const monthKey = `${year}-${monthStr}`;
      const label = d.toLocaleDateString('en-US', { month: 'short' });

      months.push({
        monthKey,
        label,
        salesAmount: 0,
        purchasesAmount: 0,
        salesCount: 0,
        purchasesCount: 0,
      });
    }

    salesBills.forEach((bill) => {
      const dateStr = bill.billDate || bill.createdAt;
      if (!dateStr) return;
      const bDate = new Date(dateStr);
      if (isNaN(bDate.getTime())) return;
      const y = bDate.getFullYear();
      const m = (bDate.getMonth() + 1).toString().padStart(2, '0');
      const key = `${y}-${m}`;
      const target = months.find((p) => p.monthKey === key);
      if (target) {
        target.salesAmount += Number(bill.amount) || 0;
        target.salesCount += 1;
      }
    });

    purchases.forEach((p) => {
      const dateStr = p.date || (p as any).createdAt;
      if (!dateStr) return;
      const pDate = new Date(dateStr);
      if (isNaN(pDate.getTime())) return;
      const y = pDate.getFullYear();
      const m = (pDate.getMonth() + 1).toString().padStart(2, '0');
      const key = `${y}-${m}`;
      const target = months.find((point) => point.monthKey === key);
      if (target) {
        target.purchasesAmount += Number(p.amount) || 0;
        target.purchasesCount += 1;
      }
    });

    return months;
  }, [salesBills, purchases]);

  const maxMonthlyPurchase = useMemo(() => {
    return Math.max(...monthlyData.map((m) => m.purchasesAmount), 1);
  }, [monthlyData]);

  // Inventory Totals & Category Breakdown
  const totalStockUnits = useMemo(() => {
    return inventoryItems.reduce((sum, item) => sum + (Number(item.itemCount) || 0), 0);
  }, [inventoryItems]);

  const lowStockCount = useMemo(() => {
    return inventoryItems.filter(
      (item) => (Number(item.itemCount) || 0) <= (Number(item.lowStockAlert) || 5)
    ).length;
  }, [inventoryItems]);

  const top4Categories: Array<{ label: string; stockUnits: number; salesAmount: number; score?: number; color: string; }> = useMemo(() => {
    const productCategoryMap = new Map<number, string>();
    const productNameCategoryMap = new Map<string, string>();
    inventoryItems.forEach((it) => {
      const cat = it.category?.name || 'General';
      if (it.id) productCategoryMap.set(it.id, cat);
      if (it.name) productNameCategoryMap.set(it.name.toLowerCase().trim(), cat);
    });

    const categorySalesMap = new Map<string, number>();
    salesBills.forEach((bill) => {
      let cat = 'General';
      if (bill.productId && productCategoryMap.has(bill.productId)) {
        cat = productCategoryMap.get(bill.productId)!;
      } else if (bill.productName && productNameCategoryMap.has(bill.productName.toLowerCase().trim())) {
        cat = productNameCategoryMap.get(bill.productName.toLowerCase().trim())!;
      }
      categorySalesMap.set(cat, (categorySalesMap.get(cat) || 0) + (Number(bill.amount) || 0));
    });

    const categoryStockMap = new Map<string, number>();
    inventoryItems.forEach((it) => {
      const cat = it.category?.name || 'General';
      categoryStockMap.set(cat, (categoryStockMap.get(cat) || 0) + (Number(it.itemCount) || 0));
    });

    const allCatNames = new Set<string>([
      ...Array.from(categoryStockMap.keys()),
      ...Array.from(categorySalesMap.keys()),
    ]);

    const colors = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b'];

    if (allCatNames.size === 0) {
      return [
        { label: 'Standard', stockUnits: totalItem || 0, salesAmount: totalSalesRevenue || 0, score: 0, color: '#6366f1' },
      ];
    }

    const ranked = Array.from(allCatNames).map((label) => {
      const stockUnits = categoryStockMap.get(label) || 0;
      const salesAmount = categorySalesMap.get(label) || 0;
      const score = salesAmount + stockUnits * 10;
      return { label, stockUnits, salesAmount, score };
    });

    ranked.sort((a, b) => b.score - a.score);

    return ranked.slice(0, 4).map((item, idx) => ({
      ...item,
      color: colors[idx % colors.length],
    }));
  }, [inventoryItems, salesBills, totalItem, totalSalesRevenue]);

  const inventoryArcs = useMemo(() => {
    const totalScore = top4Categories.reduce((sum: number, c) => sum + (c.stockUnits || 1), 0) || 1;
    let currentOffset = 0;
    return top4Categories.map((cat) => {
      const arcLength = ((cat.stockUnits || 1) / totalScore) * donutCircumference;
      const offset = currentOffset;
      currentOffset += arcLength;
      return {
        ...cat,
        arcLength,
        offset,
      };
    });
  }, [top4Categories, donutCircumference]);

  // Live value mapping for all 13 core metrics and extras
  const getWidgetLiveValue = (widgetId: string): string => {
    switch (widgetId) {
      case 'total_customers':
        return formatCount(totalCustomers);
      case 'total_suppliers':
        return formatCount(totalSuppliers);
      case 'total_staff':
        return formatCount(totalStaff);
      case 'total_sales':
        return formatCount(totalSales);
      case 'total_purchase':
        return formatCount(totalPurchase);
      case 'total_expenses':
        return formatCount(totalExpenses);
      case 'total_income':
        return formatCount(totalIncome);
      case 'total_cashbook':
        return formatCount(totalCashbook);
      case 'total_item':
        return formatCount(totalItem);
      case 'total_due':
        return formatCurrency(totalDue);
      case 'total_paid':
        return formatCurrency(totalPaid);
      case 'total_users':
        return formatCount(totalUsers);
      case 'total_organizations':
        return formatCount(totalOrganizations);
      case 'total_roles':
        return formatCount(totalRoles);
      case 'online_users':
        return '1';
      case 'active_users':
        return formatCount(totalStaff || 1);
      case 'expired_users':
        return '0';
      case 'about_to_expire':
        return formatCount(lowStockCount);
      case 'managers':
        return formatCount(Math.max(1, Math.floor(totalStaff / 3)));
      case 'balance':
        return formatCurrency(totalPaid - totalDue);
      case 'system_uptime':
        return '0 days 12 hours 8 min';
      case 'system_version':
        return '4.57.2';
      case 'system_memory':
        return '15%';
      case 'system_disk':
        return '64%';
      case 'network':
        return '0% packet loss, 150 ms';
      default: {
        const def = widgetMap.get(widgetId);
        if (!def) return '0';
        return def.isCurrency
          ? formatCurrency(Number(def.defaultValue) || 0)
          : String(def.defaultValue);
      }
    }
  };

  // Handlers for rows & widgets
  const handleAddWidget = (widgetId: string, targetRowIdx?: number) => {
    const rIdx = targetRowIdx !== undefined ? targetRowIdx : activeRowIdx;
    setSetting((prev) => {
      const currentRows = Array.isArray(prev.rows) ? prev.rows : [];
      const newRows = [...currentRows];
      if (newRows.length === 0) {
        newRows.push({
          id: `row-${Date.now()}`,
          widgets: [widgetId],
        });
      } else {
        const safeIdx = Math.min(Math.max(0, rIdx), newRows.length - 1);
        const targetWidgets = Array.isArray(newRows[safeIdx].widgets) ? newRows[safeIdx].widgets : [];
        newRows[safeIdx] = {
          ...newRows[safeIdx],
          widgets: [...targetWidgets, widgetId],
        };
      }
      return { ...prev, rows: newRows };
    });
    toast.info(`Added widget to Row ${(targetRowIdx !== undefined ? targetRowIdx : activeRowIdx) + 1}`);
  };

  const handleRemoveWidget = (rowIdx: number, widgetIdx: number) => {
    setSetting((prev) => {
      const currentRows = Array.isArray(prev.rows) ? prev.rows : [];
      const newRows = [...currentRows];
      if (newRows[rowIdx]) {
        const targetRow = { ...newRows[rowIdx] };
        const updatedWidgets = Array.isArray(targetRow.widgets) ? [...targetRow.widgets] : [];
        updatedWidgets.splice(widgetIdx, 1);
        targetRow.widgets = updatedWidgets;
        newRows[rowIdx] = targetRow;
      }
      return { ...prev, rows: newRows };
    });
  };

  const handleMoveWidget = (
    rowIdx: number,
    widgetIdx: number,
    direction: 'left' | 'right' | 'up' | 'down'
  ) => {
    setSetting((prev) => {
      const currentRows = Array.isArray(prev.rows) ? prev.rows : [];
      const newRows = currentRows.map((r) => ({
        ...r,
        widgets: Array.isArray(r.widgets) ? [...r.widgets] : [],
      }));
      const currentRow = newRows[rowIdx];
      if (!currentRow || !currentRow.widgets) return prev;
      const widgetId = currentRow.widgets[widgetIdx];

      if (direction === 'left' && widgetIdx > 0) {
        currentRow.widgets.splice(widgetIdx, 1);
        currentRow.widgets.splice(widgetIdx - 1, 0, widgetId);
      } else if (direction === 'right' && widgetIdx < currentRow.widgets.length - 1) {
        currentRow.widgets.splice(widgetIdx, 1);
        currentRow.widgets.splice(widgetIdx + 1, 0, widgetId);
      } else if (direction === 'up' && rowIdx > 0) {
        currentRow.widgets.splice(widgetIdx, 1);
        newRows[rowIdx - 1].widgets.push(widgetId);
      } else if (direction === 'down' && rowIdx < newRows.length - 1) {
        currentRow.widgets.splice(widgetIdx, 1);
        newRows[rowIdx + 1].widgets.push(widgetId);
      }

      return { ...prev, rows: newRows };
    });
  };

  const handleAddRow = () => {
    setSetting((prev) => {
      const currentRows = Array.isArray(prev.rows) ? prev.rows : [];
      const newRowId = `row-${Date.now()}`;
      return {
        ...prev,
        rows: [...currentRows, { id: newRowId, widgets: [] }],
      };
    });
    setActiveRowIdx(rows.length);
    toast.success('New row added to designer!');
  };

  const handleRemoveRow = (rowIdx: number) => {
    if (rows.length <= 1) {
      toast.warning('At least one row must be kept in the layout');
      return;
    }
    setSetting((prev) => {
      const currentRows = Array.isArray(prev.rows) ? prev.rows : [];
      const newRows = [...currentRows];
      newRows.splice(rowIdx, 1);
      return { ...prev, rows: newRows };
    });
    setActiveRowIdx(0);
    toast.info(`Removed Row ${rowIdx + 1}`);
  };

  // Save current role settings to Backend API
  const handleSave = async () => {
    if (!selectedRole) {
      toast.warning('Please select a role to configure');
      return;
    }

    setSaving(true);
    try {
      const targetRoleObj = configurableRoles.find((r) => r.name === selectedRole);
      const roleOrder = targetRoleObj ? targetRoleObj.roleOrder : resolveRoleOrder(selectedRole);
      // Pass roleId from SelectedRoles in first time insert/update. Otherwise, set old roleId
      const roleId = targetRoleObj && targetRoleObj.id ? targetRoleObj.id : (setting.roleId || 0);
      const dashboardType = roleOrder === 1 ? 'Super Admin' : roleOrder === 2 ? 'Admin' : selectedRole;

      const saved = await saveRoleDashboardSettingApi({
        ...setting,
        roleId: roleId,
        roleName: selectedRole,
        roleOrder: roleOrder,
        dashboardType: dashboardType as any,
      });
      if (saved) {
        setSetting(saved);
      }
      toast.success(`Dashboard settings for role "${selectedRole}" saved successfully!`);
    } catch (err: any) {
      console.error('Error saving dashboard setting:', err);
      toast.error(err?.message || 'Failed to save dashboard setting');
    } finally {
      setSaving(false);
    }
  };

  // Reset current role settings to factory default
  const handleReset = async () => {
    if (!selectedRole) return;
    if (window.confirm(`Reset dashboard settings for role "${selectedRole}" to defaults?`)) {
      try {
        const resetData = await resetRoleDashboardSettingApi(selectedRole);
        setSetting(resetData);
        toast.info(`Reset to default settings for "${selectedRole}"`);
      } catch (err) {
        console.error('Error resetting dashboard setting:', err);
      }
    }
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, widgetId: string) => {
    e.dataTransfer.setData('text/plain', widgetId);
    setDraggedWidgetId(widgetId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropOnRow = (e: React.DragEvent, rowIdx: number) => {
    e.preventDefault();
    const widgetId = e.dataTransfer.getData('text/plain') || draggedWidgetId;
    if (widgetId) {
      handleAddWidget(widgetId, rowIdx);
    }
    setDraggedWidgetId(null);
  };

  // Check role order permission for configuration view
  const canConfigure = callerOrder === 1 || callerOrder === 2;

  return (
    <div className="dashboard-setting-page">
      <Sidebar />
      <Navbar />
      <main className="dashboard-setting-container">
        {/* Top Breadcrumb Bar matching screenshot "tools / dashboard manager" */}
        <div className="designer-breadcrumb-bar">
          <div className="breadcrumb-path">
            <span>tools</span>
            <span>/</span>
            <span className="current">dashboard manager</span>
          </div>
          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-primary text-white">
              <i className="bi bi-person-badge me-1" />
            </span>
            {selectedRole && (
              <span className="badge bg-light text-dark border">
                Configuring: <strong className="text-primary">{selectedRole}</strong>
              </span>
            )}
          </div>
        </div>

        {/* Notice if logged-in user is Order 3 (Less than Admin) */}
        {!canConfigure && (
          <div className="alert alert-warning d-flex align-items-center gap-3 mb-4" role="alert">
            <i className="bi bi-exclamation-triangle-fill fs-3" />
            <div>
              <strong>Configuration Access Restricted:</strong>
              <div style={{ fontSize: '0.9rem', color: '#856404' }}>
                Your current role is <strong>{callerRole} (Order {callerOrder})</strong>.
                Only <strong>Super Admin (Order 1)</strong> can configure Order 1 &amp; 2 roles, and <strong>Admin (Order 2)</strong> can configure Order 3 roles.
              </div>
            </div>
          </div>
        )}

        {/* Control Toolbar */}
        <div className="designer-control-panel">
          <div className="control-panel-row">
            {/* Role Selector according to Role Order */}
            <div className="role-select-group">
              <label htmlFor="roleSelect">
                <i className="bi bi-shield-lock-fill text-primary" />
                Configure Role:
              </label>

              {loading ? (
                <span className="text-muted" style={{ fontSize: '0.85rem' }}>
                  <i className="spinner-border spinner-border-sm me-1" /> Loading roles...
                </span>
              ) : configurableRoles.length === 0 ? (
                <span className="badge bg-secondary">No configurable roles for your role order</span>
              ) : (
                <select
                  id="roleSelect"
                  className="role-select"
                  value={selectedRole}
                  onChange={(e) => handleRoleChange(e.target.value)}
                  disabled={!canConfigure}
                >
                  {configurableRoles.map((r) => (
                    <option key={r.name} value={r.name}>
                      {r.name}
                    </option>
                  ))}
                </select>
              )}

              {/* Status Toggle for this role */}
              <button
                type="button"
                className={`status-toggle-btn ${setting.enabled ? 'enabled' : 'disabled'}`}
                onClick={() => setSetting((prev) => ({ ...prev, enabled: !prev.enabled }))}
                title="Toggle whether dashboard is visible for this role"
                disabled={!canConfigure}
              >
                <i className={`bi ${setting.enabled ? 'bi-check-circle-fill' : 'bi-slash-circle-fill'}`} />
                {setting.enabled ? 'Dashboard Enabled' : 'Dashboard Disabled'}
              </button>
            </div>

            {/* Actions */}
            <div className="control-panel-actions">
              <button
                type="button"
                className="designer-btn designer-btn-preview"
                onClick={() => setPreviewMode(!previewMode)}
              >
                <i className={`bi ${previewMode ? 'bi-pencil-square' : 'bi-eye-fill'}`} />
                {previewMode ? 'Exit Preview' : 'Preview Live Layout'}
              </button>

              <button
                type="button"
                className="designer-btn designer-btn-outline"
                onClick={handleReset}
                disabled={!canConfigure}
              >
                <i className="bi bi-arrow-counterclockwise" />
                Reset Layout
              </button>
            </div>
          </div>

          {/* Section & Chart Toggles */}
          <div className="sections-toggle-bar">
            <span style={{ fontWeight: 700, color: '#1e293b' }}>
              <i className="bi bi-toggles me-1 text-primary" />
              Attached Sections:
            </span>

            <label className="section-checkbox-label">
              <input
                type="checkbox"
                checked={setting.showSupplierChart}
                onChange={(e) =>
                  setSetting((prev) => ({ ...prev, showSupplierChart: e.target.checked }))
                }
                disabled={!canConfigure}
              />
              <span>Supplier Payment Chart</span>
            </label>

            <label className="section-checkbox-label">
              <input
                type="checkbox"
                checked={setting.showCustomerChart}
                onChange={(e) =>
                  setSetting((prev) => ({ ...prev, showCustomerChart: e.target.checked }))
                }
                disabled={!canConfigure}
              />
              <span>Customer Payment (Donut)</span>
            </label>

            <label className="section-checkbox-label">
              <input
                type="checkbox"
                checked={setting.showInventoryChart}
                onChange={(e) =>
                  setSetting((prev) => ({ ...prev, showInventoryChart: e.target.checked }))
                }
                disabled={!canConfigure}
              />
              <span>Inventory Analysis Donut</span>
            </label>

            <label className="section-checkbox-label">
              <input
                type="checkbox"
                checked={setting.showSystemMonitor}
                onChange={(e) =>
                  setSetting((prev) => ({ ...prev, showSystemMonitor: e.target.checked }))
                }
                disabled={!canConfigure}
              />
              <span>System Performance Monitor</span>
            </label>
          </div>
        </div>

        {/* Preview Mode Banner */}
        {previewMode && (
          <div className="preview-mode-banner">
            <div>
              <i className="bi bi-info-circle-fill me-2" />
              <strong>Preview Mode Active:</strong> Showing how the dashboard widgets will render for role{' '}
              <strong>"{selectedRole}"</strong>.
            </div>
            <button
              type="button"
              className="btn btn-sm btn-outline-success"
              onClick={() => setPreviewMode(false)}
            >
              Back to Designer
            </button>
          </div>
        )}

        {/* Main Two-Column Workspace: Left Designer, Right Palette */}
        <div className="designer-workspace-layout">
          {/* Left Canvas: Main Dashboard Designer */}
          <div className="designer-card">
            <div className="designer-card-header">
              <h2 className="designer-card-title">
                <i className="bi bi-eye-fill" />
                Dashboard Designer
              </h2>
              <span style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>
                Rows: {rows.length} | Total Active Widgets:{' '}
                {rows.reduce((sum, r) => sum + (Array.isArray(r.widgets) ? r.widgets.length : 0), 0)}
              </span>
            </div>

            <div className="designer-canvas-body">
              {/* Rows */}
              {rows.map((row, rIdx) => (
                <div
                  key={row.id}
                  className={`designer-canvas-row ${activeRowIdx === rIdx ? 'is-active' : ''}`}
                  onClick={() => setActiveRowIdx(rIdx)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDropOnRow(e, rIdx)}
                >
                  <div className="row-header-bar">
                    <span className="row-label">
                      <i className="bi bi-grid-3x3-gap-fill" />
                      Row {rIdx + 1} ({(Array.isArray(row.widgets) ? row.widgets : []).length} Widgets)
                      {activeRowIdx === rIdx && (
                        <span className="badge bg-success ms-2 text-white" style={{ fontSize: '0.65rem' }}>
                          Active Target
                        </span>
                      )}
                    </span>
                    <div className="row-actions">
                      <button
                        type="button"
                        className="row-action-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveRow(rIdx);
                        }}
                        title="Delete this row"
                        disabled={!canConfigure}
                      >
                        <i className="bi bi-trash" /> Remove Row
                      </button>
                    </div>
                  </div>

                  {/* Widgets in this row (up to 4 columns) */}
                  <div className="row-widgets-grid">
                    {(Array.isArray(row.widgets) ? row.widgets : []).length === 0 ? (
                      <div className="empty-row-placeholder">
                        <i className="bi bi-plus-circle-dotted" style={{ fontSize: '1.5rem' }} />
                        <span>Row {rIdx + 1} is empty.</span>
                        <span style={{ fontSize: '0.75rem', color: '#16a34a' }}>
                          Click any widget on the right palette or drag and drop it here.
                        </span>
                      </div>
                    ) : (
                      (Array.isArray(row.widgets) ? row.widgets : []).map((widgetId: string, wIdx: number) => {
                        const widget = widgetMap.get(widgetId);
                        if (!widget) return null;

                        const displayVal = getWidgetLiveValue(widget.id);

                        return (
                          <div
                            key={`${widgetId}-${wIdx}`}
                            className="designer-widget-card"
                            style={{ backgroundColor: widget.bgColor }}
                          >
                            {/* Two-Tone Header Stripe */}
                            <div className="widget-card-top-stripe">
                              <div className="widget-card-headings">
                                <div className="widget-card-title">{widget.title}</div>
                                <div className="widget-card-sub">{widget.subtitle}</div>
                              </div>
                              {!previewMode && canConfigure && (
                                <div className="widget-controls-menu">
                                  {wIdx > 0 && (
                                    <button
                                      type="button"
                                      className="widget-control-btn"
                                      onClick={() => handleMoveWidget(rIdx, wIdx, 'left')}
                                      title="Move Left"
                                    >
                                      ←
                                    </button>
                                  )}
                                  {wIdx < row.widgets.length - 1 && (
                                    <button
                                      type="button"
                                      className="widget-control-btn"
                                      onClick={() => handleMoveWidget(rIdx, wIdx, 'right')}
                                      title="Move Right"
                                    >
                                      →
                                    </button>
                                  )}
                                  {rIdx > 0 && (
                                    <button
                                      type="button"
                                      className="widget-control-btn"
                                      onClick={() => handleMoveWidget(rIdx, wIdx, 'up')}
                                      title="Move to Row Above"
                                    >
                                      ↑
                                    </button>
                                  )}
                                  {rIdx < rows.length - 1 && (
                                    <button
                                      type="button"
                                      className="widget-control-btn"
                                      onClick={() => handleMoveWidget(rIdx, wIdx, 'down')}
                                      title="Move to Row Below"
                                    >
                                      ↓
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    className="widget-control-btn remove"
                                    onClick={() => handleRemoveWidget(rIdx, wIdx)}
                                    title="Remove Widget"
                                  >
                                    ✕
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Card Body */}
                            <div className="widget-card-body">
                              <div className="widget-card-value">{displayVal}</div>
                              <i className={`bi ${widget.icon} widget-card-watermark`} />
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              ))}

              {/* Add Row Button - Exact match to screenshot */}
              <div className="add-row-container">
                <button
                  type="button"
                  className="add-row-btn"
                  onClick={handleAddRow}
                  disabled={!canConfigure}
                >
                  <i className="bi bi-plus-circle-fill" />
                  Add Row
                </button>
              </div>
            </div>
          </div>

          {/* Right Sidebar: Available Widgets Palette */}
          <div className="widgets-palette-panel">
            <div className="palette-header">
              <span>
                <i className="bi bi-grid-fill me-2" />
                Available Widgets
              </span>
              <span className="badge bg-primary" style={{ fontSize: '0.72rem' }}>
                {AVAILABLE_WIDGETS.length}
              </span>
            </div>

            <div className="palette-search-wrap">
              <input
                type="text"
                className="palette-search-input"
                placeholder="Search widgets..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
              />
            </div>

            <div className="palette-widgets-list">
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontStyle: 'italic' }}>
                Click to add to <strong>Row {activeRowIdx + 1}</strong> or drag onto any row.
              </span>

              {filteredWidgets.map((widget) => {
                const count = widgetUsageCount.get(widget.id) || 0;
                return (
                  <button
                    key={widget.id}
                    type="button"
                    className="palette-widget-item"
                    style={{ backgroundColor: widget.bgColor }}
                    draggable={canConfigure}
                    onDragStart={(e) => handleDragStart(e, widget.id)}
                    onClick={() => canConfigure && handleAddWidget(widget.id)}
                    title={canConfigure ? `Click to add ${widget.title} to Row ${activeRowIdx + 1}` : 'Configuration disabled'}
                  >
                    <i className={`bi ${widget.icon}`} />
                    <span className="palette-widget-title">{widget.title}</span>
                    {count > 0 && (
                      <span className="palette-widget-badge" title="Number of times placed in layout">
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Visual Sections (Like Dashboard) configured per role */}
        <div className="attached-sections-container">
          <div className="attached-sections-header">
            <div>
              <h3 className="attached-sections-title">
                <i className="bi bi-graph-up-arrow text-primary" />
                Dashboard Visual Sections (Live Preview for "{selectedRole}")
              </h3>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                Configured sections below display live for role <strong>{selectedRole}</strong> on their dashboard.
              </p>
            </div>
            <div className="attached-section-badge-group">
              <button
                type="button"
                className={`attached-section-pill ${setting.showSupplierChart ? 'active' : 'inactive'}`}
                onClick={() => canConfigure && setSetting((prev) => ({ ...prev, showSupplierChart: !prev.showSupplierChart }))}
                disabled={!canConfigure}
                title="Toggle Supplier Payment Chart"
              >
                <i className={`bi ${setting.showSupplierChart ? 'bi-check2-circle' : 'bi-circle'}`} />
                Supplier Chart: {setting.showSupplierChart ? 'Enabled' : 'Disabled'}
              </button>

              <button
                type="button"
                className={`attached-section-pill ${setting.showCustomerChart ? 'active' : 'inactive'}`}
                onClick={() => canConfigure && setSetting((prev) => ({ ...prev, showCustomerChart: !prev.showCustomerChart }))}
                disabled={!canConfigure}
                title="Toggle Customer Payment PieChart"
              >
                <i className={`bi ${setting.showCustomerChart ? 'bi-check2-circle' : 'bi-circle'}`} />
                Customer PieChart: {setting.showCustomerChart ? 'Enabled' : 'Disabled'}
              </button>

              <button
                type="button"
                className={`attached-section-pill ${setting.showInventoryChart ? 'active' : 'inactive'}`}
                onClick={() => canConfigure && setSetting((prev) => ({ ...prev, showInventoryChart: !prev.showInventoryChart }))}
                disabled={!canConfigure}
                title="Toggle Inventory Donut Chart"
              >
                <i className={`bi ${setting.showInventoryChart ? 'bi-check2-circle' : 'bi-circle'}`} />
                Inventory Chart: {setting.showInventoryChart ? 'Enabled' : 'Disabled'}
              </button>

              <button
                type="button"
                className={`attached-section-pill ${setting.showSystemMonitor ? 'active' : 'inactive'}`}
                onClick={() => canConfigure && setSetting((prev) => ({ ...prev, showSystemMonitor: !prev.showSystemMonitor }))}
                disabled={!canConfigure}
                title="Toggle System Performance Monitor"
              >
                <i className={`bi ${setting.showSystemMonitor ? 'bi-check2-circle' : 'bi-circle'}`} />
                System Monitor: {setting.showSystemMonitor ? 'Enabled' : 'Disabled'}
              </button>
            </div>
          </div>

          {/* Charts Layout - Like Dashboard */}
          {(setting.showSupplierChart || setting.showCustomerChart || setting.showInventoryChart) && (
            <div className="dashboard-charts-layout mb-4">
              {/* 1. Supplier Payment bar graph */}
              {setting.showSupplierChart && (
                <div className="dashboard-chart-card">
                  <div className="chart-card-header">
                    <div>
                      <h3 className="chart-card-title">
                        <i className="bi bi-truck" style={{ color: '#f59e0b' }} />
                        Supplier Payment
                      </h3>
                      <p className="chart-card-sub">Monthly purchase payouts &amp; settlements</p>
                    </div>
                    <span className="chart-card-tag">Suppliers</span>
                  </div>

                  <div className="vertical-barchart-container">
                    {monthlyData.map((m) => {
                      const pct = Math.max(12, Math.round((m.purchasesAmount / maxMonthlyPurchase) * 100));
                      return (
                        <div key={m.monthKey} className="vertical-bar-col">
                          <span className="vertical-bar-val">
                            {m.purchasesAmount > 0 ? formatNumber(m.purchasesAmount, 0) : '0'}
                          </span>
                          <div className="vertical-bar-track">
                            <div
                              className="vertical-bar-fill"
                              style={{
                                height: `${pct}%`,
                                backgroundColor: '#f59e0b',
                              }}
                            />
                          </div>
                          <span className="vertical-bar-label">{m.label}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="financial-summary-cards">
                    <div className="financial-mini-card supplier-card">
                      <div className="mini-card-header">
                        <div className="mini-card-title-wrap">
                          <span className="mini-card-dot" style={{ backgroundColor: '#f59e0b' }} />
                          <span className="mini-card-label">Total Supplier Payout</span>
                        </div>
                        <span className="mini-card-pct-badge supplier-badge">Payout</span>
                      </div>
                      <div className="mini-card-amount" style={{ color: '#b45309' }}>
                        {formatCurrency(totalPurchaseAmount)}
                      </div>
                    </div>

                    <div className="financial-mini-card bills-card">
                      <div className="mini-card-header">
                        <div className="mini-card-title-wrap">
                          <span className="mini-card-dot" style={{ backgroundColor: '#d97706' }} />
                          <span className="mini-card-label">Total Purchase Bills</span>
                        </div>
                        <span className="mini-card-pct-badge bills-badge">Bills</span>
                      </div>
                      <div className="mini-card-amount" style={{ color: '#1e293b' }}>
                        {formatCount(totalPurchase)} bills
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. Customer Payment PieChart */}
              {setting.showCustomerChart && (
                <div className="dashboard-chart-card">
                  <div className="chart-card-header">
                    <div>
                      <h3 className="chart-card-title">
                        <i className="bi bi-pie-chart-fill" style={{ color: '#10b981' }} />
                        Customer Payment
                      </h3>
                      <p className="chart-card-sub">Paid vs Due customer balance</p>
                    </div>
                    <span className="chart-card-tag">Customers</span>
                  </div>

                  <div className="donut-chart-wrapper">
                    <svg viewBox="0 0 160 160" className="donut-svg">
                      <circle
                        cx="80"
                        cy="80"
                        r={donutRadius}
                        fill="transparent"
                        stroke="#e2e8f0"
                        strokeWidth="16"
                      />
                      {totalFinancial > 0 && (
                        <circle
                          cx="80"
                          cy="80"
                          r={donutRadius}
                          fill="transparent"
                          stroke="#10b981"
                          strokeWidth="16"
                          strokeDasharray={`${paidArc} ${donutCircumference}`}
                          strokeDashoffset="0"
                          strokeLinecap="round"
                          transform="rotate(-90 80 80)"
                        />
                      )}
                      {totalFinancial > 0 && totalDue > 0 && (
                        <circle
                          cx="80"
                          cy="80"
                          r={donutRadius}
                          fill="transparent"
                          stroke="#ef4444"
                          strokeWidth="16"
                          strokeDasharray={`${dueArc} ${donutCircumference}`}
                          strokeDashoffset={`-${paidArc}`}
                          strokeLinecap="round"
                          transform="rotate(-90 80 80)"
                        />
                      )}
                    </svg>
                    <div className="donut-center-stat">
                      <span className="donut-pct">{recoveryRate}%</span>
                      <span className="donut-label">Recovered</span>
                    </div>
                  </div>

                  <div className="financial-summary-cards">
                    <div className="financial-mini-card paid-card">
                      <div className="mini-card-header">
                        <div className="mini-card-title-wrap">
                          <span className="mini-card-dot" style={{ backgroundColor: '#10b981' }} />
                          <span className="mini-card-label">Total Paid (Received)</span>
                        </div>
                        <span className="mini-card-pct-badge">{recoveryRate}%</span>
                      </div>
                      <div className="mini-card-amount" style={{ color: '#047857' }}>
                        {formatCurrency(totalPaid)}
                      </div>
                    </div>

                    <div className="financial-mini-card due-card">
                      <div className="mini-card-header">
                        <div className="mini-card-title-wrap">
                          <span className="mini-card-dot" style={{ backgroundColor: '#ef4444' }} />
                          <span className="mini-card-label">Total Due (Receivable)</span>
                        </div>
                        <span className="mini-card-pct-badge due-badge">
                          {totalFinancial > 0 ? 100 - recoveryRate : 0}%
                        </span>
                      </div>
                      <div className="mini-card-amount" style={{ color: '#b91c1c' }}>
                        {formatCurrency(totalDue)}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. Inventory Chart */}
              {setting.showInventoryChart && (
                <div className="dashboard-chart-card">
                  <div className="chart-card-header">
                    <div>
                      <h3 className="chart-card-title">
                        <i className="bi bi-box-seam" style={{ color: '#6366f1' }} />
                        Inventory Chart
                      </h3>
                      <p className="chart-card-sub">Top 4 stock &amp; sales categories</p>
                    </div>
                    <span className="chart-card-tag">Inventory</span>
                  </div>

                  <div className="donut-chart-wrapper">
                    <svg viewBox="0 0 160 160" className="donut-svg">
                      <circle
                        cx="80"
                        cy="80"
                        r={donutRadius}
                        fill="transparent"
                        stroke="#f1f5f9"
                        strokeWidth="16"
                      />
                      {inventoryArcs.map((arc) => (
                        <circle
                          key={arc.label}
                          cx="80"
                          cy="80"
                          r={donutRadius}
                          fill="transparent"
                          stroke={arc.color}
                          strokeWidth="16"
                          strokeDasharray={`${arc.arcLength} ${donutCircumference}`}
                          strokeDashoffset={`-${arc.offset}`}
                          strokeLinecap="round"
                          transform="rotate(-90 80 80)"
                        />
                      ))}
                    </svg>
                    <div className="donut-center-stat">
                      <span className="donut-pct">{formatCount(totalStockUnits)}</span>
                      <span className="donut-label">Total Units</span>
                    </div>
                  </div>

                  <div className="top-categories-grid">
                    {top4Categories.map((cat) => (
                      <div key={cat.label} className="top-category-card">
                        <div className="top-cat-header">
                          <span className="category-dot" style={{ backgroundColor: cat.color }} />
                          <span className="top-cat-name" title={cat.label}>{cat.label}</span>
                        </div>
                        <div className="top-cat-stat-line">
                          <span className="stat-muted">Stock:</span>
                          <span className="stat-bold">{formatCount(cat.stockUnits)}</span>
                        </div>
                        <div className="top-cat-stat-line">
                          <span className="stat-muted">Sales:</span>
                          <span className="stat-bold sales-val" title={formatCurrency(cat.salesAmount)}>
                            {formatCurrency(cat.salesAmount)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="chart-legends-container">
                    <div className="legend-row">
                      <div className="legend-label">
                        <span className="legend-color-dot" style={{ backgroundColor: '#6366f1' }} />
                        <span>Total Products</span>
                      </div>
                      <span className="legend-value">{formatCount(totalItem)} items</span>
                    </div>
                    <div className="legend-row">
                      <div className="legend-label">
                        <span className="legend-color-dot" style={{ backgroundColor: lowStockCount > 0 ? '#ef4444' : '#10b981' }} />
                        <span>Stock Health</span>
                      </div>
                      {lowStockCount > 0 ? (
                        <span className="inventory-status-badge badge-warning">
                          <i className="bi bi-exclamation-triangle-fill" /> {lowStockCount} Low Stock
                        </span>
                      ) : (
                        <span className="inventory-status-badge badge-success">
                          <i className="bi bi-check-circle-fill" /> Optimal Stock
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 4. System Performance Monitor (CPU, MEMORY, DISC) */}
          {setting.showSystemMonitor && (
            <div className="system-monitor-section mt-4">
              <div className="system-monitor-header">
                <h2 className="system-monitor-title">
                  <i className="bi bi-pc-display-horizontal" />
                  System Performance Monitor (CPU, MEMORY, DISC)
                </h2>
                <p className="system-monitor-subtitle">
                  Real-time server metrics, resource telemetry, and health
                </p>
              </div>
              <SystemMonitor />
            </div>
          )}
        </div>

        {/* Sticky Bottom-Right Save Dashboard Button */}
        <button
          type="button"
          className="dashboard-setting-sticky-save-btn"
          onClick={handleSave}
          disabled={saving || !canConfigure}
          title="Save Dashboard Settings"
        >
          <i className={`bi ${saving ? 'spinner-border spinner-border-sm' : 'bi-check2-circle'}`} />
          <span>{saving ? 'Saving...' : 'Save Dashboard'}</span>
        </button>
      </main>
    </div>
  );
};

export default DashboardSetting;
