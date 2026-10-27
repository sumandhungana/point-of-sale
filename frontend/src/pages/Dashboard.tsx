import React, { useEffect, useState, useMemo } from 'react';
import { Sidebar } from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
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
import { useAppSettings } from '@/context/AppSettingsContext';
import '../styles/Dashboard.css';

interface MonthlyBarPoint {
  monthKey: string;
  label: string;
  salesAmount: number;
  purchasesAmount: number;
  salesCount: number;
  purchasesCount: number;
}

const hexToRgba = (hex: string, alpha: number): string => {
  const sanitized = hex.replace('#', '');
  const bigint = parseInt(
    sanitized.length === 3
      ? sanitized.split('').map((c) => c + c).join('')
      : sanitized,
    16
  );
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const Dashboard: React.FC = () => {
  const { settings, formatCurrency, formatNumber, formatDate } = useAppSettings();

  // Real Data States from Backend Only
  const [salesBills, setSalesBills] = useState<GetAllSalesBillResponse[]>([]);
  const [purchases, setPurchases] = useState<GetAllPurchaseBillResponse[]>([]);
  const [inventoryItems, setInventoryItems] = useState<Item[]>([]);
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

  const [, setLoading] = useState<boolean>(true);

  const organizationName = useMemo(() => {
    return (
      localStorage.getItem('companyName') ||
      localStorage.getItem('organizationName') ||
      'Organization'
    );
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
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
        const purchList = Array.isArray(purchasesData.value) ? purchasesData.value : [];
        setPurchases(purchList);
        setTotalPurchase(purchList.length);
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

      // Raw payment totals from backend
      try {
        const totals = await getDashboardPaymentTotals();
        setTotalDue(Number(totals?.totalGiven) || 0);
        setTotalPaid(Number(totals?.totalReceived) || 0);
      } catch (err) {
        console.error('Failed to fetch dashboard payment totals:', err);
        setTotalDue(0);
        setTotalPaid(0);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatCount = (count: number): string => {
    const safe = Number.isFinite(count) ? Math.trunc(count) : 0;
    if (safe === 0) return '0';
    if (safe > 0 && safe < 10) return `0${safe}`;
    return formatNumber(safe, 0);
  };

  // Card Mouse Move Glow Effects
  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty('--mouse-x', `${x}px`);
    e.currentTarget.style.setProperty('--mouse-y', `${y}px`);
  };

  const handleCardMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.setProperty('--mouse-x', '50%');
    e.currentTarget.style.setProperty('--mouse-y', '0%');
  };

  // Calculations for Charts using Real Backend Data Only
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

  // Donut Arc calculation for Paid vs Due
  const donutRadius = 60;
  const donutCircumference = 2 * Math.PI * donutRadius;
  const paidArc = totalFinancial > 0 ? (totalPaid / totalFinancial) * donutCircumference : 0;
  const dueArc = totalFinancial > 0 ? (totalDue / totalFinancial) * donutCircumference : 0;

  // Real Monthly Aggregation from Recorded Bills for Supplier Payment Chart
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

  // Top 4 categories based on large stock and high sales data (strictly limited to 4)
  const top4Categories = useMemo(() => {
    // Map productId & productName to category name
    const productCategoryMap = new Map<number, string>();
    const productNameCategoryMap = new Map<string, string>();
    inventoryItems.forEach((it) => {
      const cat = it.category?.name || 'General';
      if (it.id) productCategoryMap.set(it.id, cat);
      if (it.name) productNameCategoryMap.set(it.name.toLowerCase().trim(), cat);
    });

    // Aggregate sales amount by category
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

    // Aggregate stock units by category
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
        { label: 'Standard', stockUnits: totalItem || 0, salesAmount: totalSalesRevenue || 0, color: '#6366f1' },
      ];
    }

    const ranked = Array.from(allCatNames).map((label) => {
      const stockUnits = categoryStockMap.get(label) || 0;
      const salesAmount = categorySalesMap.get(label) || 0;
      // Score prioritizes large stock and high sales data
      const score = salesAmount + (stockUnits * 10);
      return {
        label,
        stockUnits,
        salesAmount,
        score,
      };
    });

    ranked.sort((a, b) => b.score - a.score);

    // Strictly limit to 4 categories
    return ranked.slice(0, 4).map((item, idx) => ({
      ...item,
      color: colors[idx % colors.length],
    }));
  }, [inventoryItems, salesBills, totalItem, totalSalesRevenue]);

  const inventoryArcs = useMemo(() => {
    const totalScore = top4Categories.reduce((sum, c) => sum + (c.stockUnits || 1), 0) || 1;
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

  // Core System Metrics in Modern Cards
  const metrics: Array<{
    title: string;
    value: number;
    icon: string;
    iconColor: string;
    isCurrency?: boolean;
  }> = [
    { title: 'Total Customers', value: totalCustomers, icon: 'bi-people-fill', iconColor: '#4CAF50' },
    { title: 'Total Suppliers', value: totalSuppliers, icon: 'bi-shop', iconColor: '#2196F3' },
    { title: 'Total Staff', value: totalStaff, icon: 'bi-people', iconColor: '#FF9800' },
    { title: 'Total Sales', value: totalSales, icon: 'bi-cash-coin', iconColor: '#4CAF50' },
    { title: 'Total Purchase', value: totalPurchase, icon: 'bi-cart-check', iconColor: '#FF9800' },
    { title: 'Total Expenses', value: totalExpenses, icon: 'bi-box-seam', iconColor: '#F44336' },
    { title: 'Total Income', value: totalIncome, icon: 'bi-wallet2', iconColor: '#4CAF50' },
    { title: 'Total Cashbook', value: totalCashbook, icon: 'bi-credit-card', iconColor: '#2196F3' },
    { title: 'Total Item', value: totalItem, icon: 'bi-bag-check', iconColor: '#FF9800' },
    { title: 'Total Due', value: totalDue, icon: 'bi-arrow-up-circle', iconColor: '#F44336', isCurrency: true },
    { title: 'Total Paid', value: totalPaid, icon: 'bi-arrow-down-circle', iconColor: '#4CAF50', isCurrency: true },
  ];

  return (
    <div className="dashboard-page-wrapper">
      <Sidebar />
      <Navbar />
      <main className="dashboard-container">
        {/* Organization Name Header (Replaces top box and All System Metrics) */}
        <div className="dashboard-org-header">
          <h1 className="dashboard-org-title">
            <i className="bi bi-building-fill" />
            <span>{organizationName}</span>
          </h1>
        </div>

        {/* Section 1: All Metric Data Boxes */}
        <div className="dashboard-grid">
          {metrics.map((m) => (
            <div key={m.title} className="dashboard-card-wrapper">
              <div
                className="dashboard-card"
                style={{
                  ['--glow' as any]: hexToRgba(m.iconColor, 0.28),
                  ['--glow-strong' as any]: hexToRgba(m.iconColor, 0.45),
                } as React.CSSProperties}
                onMouseMove={handleCardMouseMove}
                onMouseLeave={handleCardMouseLeave}
              >
                <div className="dashboard-card-header">
                  <div
                    className="dashboard-card-icon"
                    style={{ backgroundColor: hexToRgba(m.iconColor, 0.12) }}
                  >
                    <i className={`bi ${m.icon}`} style={{ color: m.iconColor }} />
                  </div>
                  <div className="dashboard-card-title">{m.title}</div>
                </div>
                <div className="dashboard-card-value">
                  {m.isCurrency ? formatCurrency(m.value || 0) : formatCount(m.value || 0)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Section 2: 3 Dedicated Charts (Supplier Payment, Customer Payment, Inventory) */}
        <div className="dashboard-charts-layout">
          {/* Chart 1: Supplier Payment */}
          <div className="dashboard-chart-card">
            <div className="chart-card-header">
              <div>
                <h3 className="chart-card-title">
                  <i className="bi bi-truck" style={{ color: '#f59e0b' }} />
                  Supplier Payment
                </h3>
                <p className="chart-card-sub">Monthly purchase payouts & settlements</p>
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

            {/* Supplier Financial Summary Cards */}
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

          {/* Chart 2: Customer Payment */}
          <div className="dashboard-chart-card">
            <div className="chart-card-header">
              <div>
                <h3 className="chart-card-title">
                  <i className="bi bi-wallet2" style={{ color: '#10b981' }} />
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

            {/* Customer Financial Summary Cards */}
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

          {/* Chart 3: Inventory */}
          <div className="dashboard-chart-card">
            <div className="chart-card-header">
              <div>
                <h3 className="chart-card-title">
                  <i className="bi bi-box-seam" style={{ color: '#6366f1' }} />
                  Inventory
                </h3>
                <p className="chart-card-sub">Top 4 stock & sales categories</p>
              </div>
              <span className="chart-card-tag">Inventory</span>
            </div>

            {/* Premium Category Distribution Donut */}
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

            {/* Top 4 Categories with Large Stock & High Sales (Strictly 4, Fixed Height) */}
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

            {/* Inventory Metrics Footer */}
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
        </div>

        {/* Section 3: System Performance Monitor */}
        <div className="system-monitor-section">
          <div className="system-monitor-header">
            <h2 className="system-monitor-title">
              <i className="bi bi-pc-display-horizontal" />
              System Performance Monitor
            </h2>
            <p className="system-monitor-subtitle">
              Real-time server metrics, resource telemetry, and health
            </p>
          </div>
          <SystemMonitor />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;