import React, { useEffect, useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { getCustomers, getSuppliers } from '../services/customerService';
import { fetchStaff } from '../services/staffService';
import { fetchSalesBills } from '../services/salesBillService';
import { fetchPurchases } from '../services/purchaseListService';
import { fetchExpenses } from '../services/expensesListService';
import { fetchIncomes } from '../services/incomeService';
import { fetchCashbooks } from '../services/cashbookService';
import { fetchRentalItems } from '../services/rentalItemService';
import { fetchUsers } from '../services/userService';
import { fetchItems } from '../services/itemService';
import '../styles/Dashboard.css';

const hexToRgba = (hex: string, alpha: number): string => {
  const sanitized = hex.replace('#', '');
  const bigint = parseInt(sanitized.length === 3
    ? sanitized.split('').map(c => c + c).join('')
    : sanitized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const Dashboard: React.FC = () => {
  const [totalCustomers, setTotalCustomers] = useState<number>(0);
  const [totalSuppliers, setTotalSuppliers] = useState<number>(0);
  const [totalStaff, setTotalStaff] = useState<number>(0);
  const [totalSales, setTotalSales] = useState<number>(0);
  const [totalPurchase, setTotalPurchase] = useState<number>(0);
  const [totalExpenses, setTotalExpenses] = useState<number>(0);
  const [totalIncome, setTotalIncome] = useState<number>(0);
  const [totalCashbook, setTotalCashbook] = useState<number>(0);
  const [totalRentalItem, setTotalRentalItem] = useState<number>(0);
  const [totalBranch, setTotalBranch] = useState<number>(0);
  const [totalAppUser, setTotalAppUser] = useState<number>(0);
  const [totalItem, setTotalItem] = useState<number>(0);
  const [totalDue, setTotalDue] = useState<number>(0);
  const [totalPaid, setTotalPaid] = useState<number>(0);
  const [totalDeposit, setTotalDeposit] = useState<number>(0);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const customers = await getCustomers();
        setTotalCustomers(customers.length || 0);

        const suppliers = await getSuppliers();
        setTotalSuppliers(suppliers.length || 0);

        const staff = await fetchStaff();
        setTotalStaff(staff.length || 0);

        const salesBills = await fetchSalesBills();
        setTotalSales(salesBills.length || 0);
        console.log('Sales Bills:', salesBills.length);

        const purchases = await fetchPurchases();
        setTotalPurchase(purchases.length || 0);
        console.log('Purchases:', purchases.length);

        const expenses = await fetchExpenses();
        setTotalExpenses(expenses.length || 0);
        console.log('Expenses:', expenses.length);

        const incomes = await fetchIncomes();
        setTotalIncome(incomes.length || 0);
        console.log('Incomes:', incomes.length);

        const cashbooks = await fetchCashbooks();
        setTotalCashbook(cashbooks.length || 0);

        const rentalItems = await fetchRentalItems();
        setTotalRentalItem(rentalItems.length || 0);

        // Static/placeholder values
        setTotalBranch(1);

        const users = await fetchUsers();
        setTotalAppUser(users.length || 0);

        const items = await fetchItems();
        setTotalItem(items.length || 0);

        // Placeholder financial aggregates
        setTotalDue(0);
        setTotalPaid(0);
        setTotalDeposit(0);


      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchData();
  }, []);

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

  const metrics: Array<{
    title: string;
    value: number;
    icon: string;
    iconColor: string;
  }> = [
    { title: 'Total Customers', value: totalCustomers, icon: 'bi-people-fill', iconColor: '#4CAF50' },
    { title: 'Total Suppliers', value: totalSuppliers, icon: 'bi-shop', iconColor: '#2196F3' },
    { title: 'Total Staff', value: totalStaff, icon: 'bi-people', iconColor: '#FF9800' },
    { title: 'Total Sales', value: totalSales, icon: 'bi-cash-coin', iconColor: '#4CAF50' },
    { title: 'Total Purchase', value: totalPurchase, icon: 'bi-cart-check', iconColor: '#FF9800' },
    { title: 'Total Expenses', value: totalExpenses, icon: 'bi-box-seam', iconColor: '#F44336' },
    { title: 'Total Income', value: totalIncome, icon: 'bi-wallet2', iconColor: '#4CAF50' },
    { title: 'Total Cashbook', value: totalCashbook, icon: 'bi-credit-card', iconColor: '#2196F3' },
    { title: 'Total Rental Item', value: totalRentalItem, icon: 'bi-file-earmark', iconColor: '#9C27B0' },
    { title: 'Total Branch', value: totalBranch, icon: 'bi-building', iconColor: '#9C27B0' },
    { title: 'Total App User', value: totalAppUser, icon: 'bi-person-badge', iconColor: '#2196F3' },
    { title: 'Total Item', value: totalItem, icon: 'bi-bag-check', iconColor: '#FF9800' },
    { title: 'Total Due', value: totalDue, icon: 'bi-credit-card-2-back', iconColor: '#F44336' },
    { title: 'Total Paid', value: totalPaid, icon: 'bi-currency-exchange', iconColor: '#4CAF50' },
    { title: 'Total Deposit', value: totalDeposit, icon: 'bi-bank', iconColor: '#4CAF50' },
  ];

  return (
    <div className="dashboard-page-wrapper">
      <Sidebar />
      <main className="dashboard-container">
        <div className="dashboard-header">
          <h1 className="dashboard-title">
            <i className="bi bi-speedometer2"></i>
            Dashboard Overview
          </h1>
          <p className="dashboard-subtitle">Welcome back! Here's what's happening with your business today.</p>
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
                  <div className="dashboard-card-icon" style={{ backgroundColor: hexToRgba(m.iconColor, 0.1) }}>
                    <i className={`bi ${m.icon}`} style={{ color: m.iconColor }}></i>
                  </div>
                  <div className="dashboard-card-title">{m.title}</div>
                </div>
                <div className="dashboard-card-value">{(m.value || 0).toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>


      </main>
    </div>
  );
};

export default Dashboard; 