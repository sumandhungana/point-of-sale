import React, { useEffect, useState, useMemo } from 'react';
import { Sidebar } from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import { getCustomers } from '@/features/services/customerService';
import { getSuppliers } from '@/features/services/supplierService';
import { SystemMonitor } from '@/components/SystemMonitor';
import { getDashboardPaymentTotals } from '@/services/paymentService';
import { fetchStaff } from '@/services/staffService';
import { getAllSalesBill, GetAllSalesBillResponse } from '@/features/services/salesBillService';
import { fetchPurchases, GetAllPurchaseBillResponse } from '@/features/services/purchaseBillService';
import { fetchExpenses } from '@/services/expensesListService';
import { fetchIncomes } from '@/services/incomeService';
import { fetchCashbooks } from '@/services/cashbookService';
import { getProduct } from '@/features/services/productService';
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
  const { formatCurrency, formatDate } = useAppSettings();
  // Real Data States from Backend Only
  const [salesBills, setSalesBills] = useState<GetAllSalesBillResponse[]>([]);
  const [purchases, setPurchases] = useState<GetAllPurchaseBillResponse[]>([]);
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

  const [loading, setLoading] = useState<boolean>(true);
  const [activeBarHover, setActiveBarHover] = useState<number | null>(null);

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
        setTotalItem(Array.isArray(itemsData.value) ? itemsData.value.length : 0);
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
    return safe.toLocaleString();
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
  const totalSalesRevenue = useMemo(() => {
    return salesBills.reduce((acc, b) => acc + (Number(b.amount) || 0), 0);
  }, [salesBills]);

  const totalPurchaseAmount = useMemo(() => {
    return purchases.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
  }, [purchases]);

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

  // Real Monthly Aggregation from Recorded Bills for Vertical Bar Chart
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

  const maxMonthlyVal = useMemo(() => {
    const max = Math.max(
      ...monthlyData.map((m) => Math.max(m.salesAmount, m.purchasesAmount)),
      1000
    );
    return max;
  }, [monthlyData]);

  // Real data for Activity Vertical Column Bar Chart
  const activityData = useMemo(() => [
    { label: 'Sales', count: totalSales, color: '#4f46e5' },
    { label: 'Purchases', count: totalPurchase, color: '#f59e0b' },
    { label: 'Incomes', count: totalIncome, color: '#10b981' },
    { label: 'Expenses', count: totalExpenses, color: '#ef4444' },
    { label: 'Cashbook', count: totalCashbook, color: '#06b6d4' },
  ], [totalSales, totalPurchase, totalIncome, totalExpenses, totalCashbook]);

  const maxActivityCount = useMemo(() => {
    return Math.max(...activityData.map((d) => d.count), 1);
  }, [activityData]);

  // Real data for Entity Comparison Chart
  const entityData = useMemo(() => [
    { label: 'Customers', count: totalCustomers, color: '#4CAF50' },
    { label: 'Suppliers', count: totalSuppliers, color: '#2196F3' },
    { label: 'Staff', count: totalStaff, color: '#FF9800' },
    { label: 'Items', count: totalItem, color: '#9C27B0' },
  ], [totalCustomers, totalSuppliers, totalStaff, totalItem]);

  const maxEntityCount = useMemo(() => {
    return Math.max(...entityData.map((d) => d.count), 1);
  }, [entityData]);

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

  // Greeting and Current Date based on real-time
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return { text: 'Good morning', icon: 'bi-sun-fill', color: '#f59e0b' };
    } else if (hour >= 12 && hour < 17) {
      return { text: 'Good afternoon', icon: 'bi-brightness-high-fill', color: '#f97316' };
    } else if (hour >= 17 && hour < 21) {
      return { text: 'Good evening', icon: 'bi-sunset-fill', color: '#8b5cf6' };
    } else {
      return { text: 'Good evening', icon: 'bi-moon-stars-fill', color: '#6366f1' };
    }
  }, []);

  const formattedDate = useMemo(() => {
    return formatDate(new Date());
  }, [formatDate]);

  return (
    <div className="dashboard-page-wrapper">
      <Sidebar />
      <Navbar />
      <main className="dashboard-container">
        {/* Header with Greeting and Company Name on same line, Date and Sync Button */}
        <div className="dashboard-top-header">
          <div className="header-text-block">
            <h1 className="dashboard-title">
              <span className="dashboard-greeting-inline">
                <i className={`bi ${greeting.icon}`} style={{ color: greeting.color }} />
                <span>{greeting.text},</span>
              </span>{' '}
              {localStorage.getItem('companyName') || 'Company Name'}
            </h1>
          </div>

          <div className="header-actions-block">
            <div className="header-date-badge">
              <i className="bi bi-calendar-check" />
              <span>{formattedDate}</span>
            </div>
            <button
              type="button"
              className="dashboard-sync-btn"
              onClick={fetchData}
              disabled={loading}
              title="Sync latest data from server"
            >
              <i className={`bi bi-arrow-clockwise ${loading ? 'spinning' : ''}`} />
              <span>{loading ? 'Refreshing...' : 'Sync Data'}</span>
            </button>
          </div>
        </div>

        {/* Section 1: All 15 Backend Metric Data Boxes (Original Data in Modern Cards) */}
        <div className="section-heading-wrap">
          <h2 className="section-subheading">
            <i className="bi bi-grid-fill" /> All System Metrics
          </h2>
        </div>

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

        {/* Section 2: Charts and Graphs (Placed below all system metrics) */}
        <div className="section-heading-wrap">
          <h2 className="section-subheading">
            <i className="bi bi-graph-up-arrow" />  Visual Charts
          </h2>
        </div>

        <div className="dashboard-charts-layout">
          {/* Row 1: Large Dual-Bar Monthly Flow Chart + Settlement Donut */}
          <div className="charts-top-split">
            {/* Monthly Sales & Purchase Flow Vertical Bar Chart */}
            <div className="dashboard-chart-card monthly-barchart-card">
              <div className="chart-card-header">
                <div>
                  <h3 className="chart-card-title">
                    <i className="bi bi-bar-chart-fill" style={{ color: '#6366f1' }} />
                    Monthly Sales & Purchases Bar Chart
                  </h3>
                  <p className="chart-card-sub">
                    Real monthly timeline comparison from recorded bills
                  </p>
                </div>
                <div className="chart-legend-wrap">
                  <span className="legend-item">
                    <span className="legend-dot sales-dot" />
                    Sales: <strong>{formatCurrency(totalSalesRevenue)}</strong>
                  </span>
                  <span className="legend-item">
                    <span className="legend-dot purchase-dot" />
                    Purchases: <strong>{formatCurrency(totalPurchaseAmount)}</strong>
                  </span>
                </div>
              </div>

              <div className="monthly-chart-canvas-wrap">
                <svg viewBox="0 0 650 200" className="monthly-svg-chart">
                  {/* Grid Lines */}
                  <line x1="45" y1="25" x2="635" y2="25" stroke="#f1f5f9" strokeDasharray="4 4" />
                  <line x1="45" y1="85" x2="635" y2="85" stroke="#f1f5f9" strokeDasharray="4 4" />
                  <line x1="45" y1="145" x2="635" y2="145" stroke="#f1f5f9" strokeDasharray="4 4" />
                  <line x1="45" y1="168" x2="635" y2="168" stroke="#cbd5e1" strokeWidth="1.5" />

                  {/* Y Axis Labels */}
                  <text x="38" y="29" className="chart-axis-text" textAnchor="end">
                    {formatCurrency(maxMonthlyVal).replace('रु ', '')}
                  </text>
                  <text x="38" y="89" className="chart-axis-text" textAnchor="end">
                    {formatCurrency(Math.round(maxMonthlyVal / 2)).replace('रु ', '')}
                  </text>
                  <text x="38" y="172" className="chart-axis-text" textAnchor="end">
                    0
                  </text>

                  {/* Monthly Bar Columns */}
                  {monthlyData.map((m, idx) => {
                    const groupW = 585 / monthlyData.length;
                    const groupX = 48 + idx * groupW;
                    const barW = Math.min(20, (groupW - 20) / 2);

                    const sH = (m.salesAmount / maxMonthlyVal) * 138;
                    const pH = (m.purchasesAmount / maxMonthlyVal) * 138;

                    const sY = 168 - Math.max(sH, 4);
                    const pY = 168 - Math.max(pH, 4);

                    const isHovered = activeBarHover === idx;

                    return (
                      <g
                        key={m.monthKey}
                        className="chart-svg-group"
                        onMouseEnter={() => setActiveBarHover(idx)}
                        onMouseLeave={() => setActiveBarHover(null)}
                      >
                        {/* Hover Column Background */}
                        <rect
                          x={groupX}
                          y="15"
                          width={groupW - 8}
                          height="153"
                          fill={isHovered ? 'rgba(99, 102, 241, 0.05)' : 'transparent'}
                          rx="6"
                        />

                        {/* Sales Bar */}
                        <rect
                          x={groupX + (groupW - 8) / 2 - barW - 2}
                          y={sY}
                          width={barW}
                          height={Math.max(sH, 4)}
                          fill={isHovered ? '#4338ca' : '#6366f1'}
                          rx="4"
                          className="chart-column-rect"
                        />

                        {/* Purchases Bar */}
                        <rect
                          x={groupX + (groupW - 8) / 2 + 2}
                          y={pY}
                          width={barW}
                          height={Math.max(pH, 4)}
                          fill={isHovered ? '#d97706' : '#f59e0b'}
                          rx="4"
                          className="chart-column-rect"
                        />

                        {/* Month Label */}
                        <text
                          x={groupX + (groupW - 8) / 2}
                          y="188"
                          textAnchor="middle"
                          className={`chart-month-lbl ${isHovered ? 'active' : ''}`}
                        >
                          {m.label}
                        </text>
                      </g>
                    );
                  })}
                </svg>

                {/* Floating Tooltip */}
                {activeBarHover !== null && monthlyData[activeBarHover] && (
                  <div className="monthly-chart-tooltip">
                    <div className="tooltip-month-title">
                      {monthlyData[activeBarHover].label} Overview
                    </div>
                    <div className="tooltip-line sales">
                      <span>Sales:</span>
                      <strong>{formatCurrency(monthlyData[activeBarHover].salesAmount)}</strong>
                      <span>({monthlyData[activeBarHover].salesCount} bills)</span>
                    </div>
                    <div className="tooltip-line purchase">
                      <span>Purchases:</span>
                      <strong>{formatCurrency(monthlyData[activeBarHover].purchasesAmount)}</strong>
                      <span>({monthlyData[activeBarHover].purchasesCount} bills)</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Financial Settlement Donut Chart (Paid vs Due) */}
            <div className="dashboard-chart-card donut-chart-card">
              <div className="chart-card-header">
                <div>
                  <h3 className="chart-card-title">
                    <i className="bi bi-pie-chart-fill" style={{ color: '#10b981' }} />
                    Cash Settlement Ratio
                  </h3>
                  <p className="chart-card-sub">Paid vs Due customer balance</p>
                </div>
                <span className="chart-card-tag">Payments</span>
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

              <div className="chart-legends-container">
                <div className="legend-row">
                  <div className="legend-label">
                    <span className="legend-color-dot" style={{ backgroundColor: '#10b981' }} />
                    <span>Total Paid (Received)</span>
                  </div>
                  <span className="legend-value">{formatCurrency(totalPaid)}</span>
                </div>
                <div className="legend-row">
                  <div className="legend-label">
                    <span className="legend-color-dot" style={{ backgroundColor: '#ef4444' }} />
                    <span>Total Due (Receivable)</span>
                  </div>
                  <span className="legend-value">{formatCurrency(totalDue)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Vertical Column Bar Chart for Ledgers + Entity Distribution */}
          <div className="charts-bottom-split">
            {/* Vertical Column Bar Chart: Ledger Records Activity */}
            <div className="dashboard-chart-card">
              <div className="chart-card-header">
                <div>
                  <h3 className="chart-card-title">
                    <i className="bi bi-bar-chart-line-fill" style={{ color: '#4f46e5' }} />
                    Ledger Activity Column Bar Chart
                  </h3>
                  <p className="chart-card-sub">Recorded entries across accounting ledgers</p>
                </div>
                <span className="chart-card-tag">Records</span>
              </div>

              <div className="vertical-barchart-container">
                {activityData.map((item) => {
                  const pct = Math.max(10, Math.round((item.count / maxActivityCount) * 100));
                  return (
                    <div key={item.label} className="vertical-bar-col">
                      <span className="vertical-bar-val">{formatCount(item.count)}</span>
                      <div className="vertical-bar-track">
                        <div
                          className="vertical-bar-fill"
                          style={{
                            height: `${pct}%`,
                            backgroundColor: item.color,
                          }}
                        />
                      </div>
                      <span className="vertical-bar-label">{item.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Entity Network Distribution Chart */}
            <div className="dashboard-chart-card">
              <div className="chart-card-header">
                <div>
                  <h3 className="chart-card-title">
                    <i className="bi bi-people-fill" style={{ color: '#255DCE' }} />
                    Entity Distribution Scale
                  </h3>
                  <p className="chart-card-sub">Registered parties & inventory items</p>
                </div>
                <span className="chart-card-tag">Network</span>
              </div>

              <div className="barchart-container">
                {entityData.map((item) => {
                  const fillPercent = Math.max(8, Math.round((item.count / maxEntityCount) * 100));
                  return (
                    <div key={item.label} className="bar-row">
                      <span className="bar-label-name">{item.label}</span>
                      <div className="bar-track">
                        <div
                          className="bar-fill"
                          style={{
                            width: `${fillPercent}%`,
                            backgroundColor: item.color,
                          }}
                        />
                      </div>
                      <span className="bar-value-number">{formatCount(item.count)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: System Performance Monitor with Original Telemetry Graph and Gauges */}
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