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
        setTotalCustomers(customers.length);

        const suppliers = await getSuppliers();
        setTotalSuppliers(suppliers.length);

        const staff = await fetchStaff();
        setTotalStaff(staff.length);

        const salesBills = await fetchSalesBills();
        setTotalSales(salesBills.length);

        const purchases = await fetchPurchases();
        setTotalPurchase(purchases.length);

        const expenses = await fetchExpenses();
        setTotalExpenses(expenses.length);

        const incomes = await fetchIncomes();
        setTotalIncome(incomes.length);

        const cashbooks = await fetchCashbooks();
        setTotalCashbook(cashbooks.length);

        const rentalItems = await fetchRentalItems();
        setTotalRentalItem(rentalItems.length);

        // Assuming branch data is fetched from a branch service or similar
        // For now, setting a static value
        setTotalBranch(1);

        const users = await fetchUsers();
        setTotalAppUser(users.length);

        const items = await fetchItems();
        setTotalItem(items.length);

        // Assuming due, paid, and deposit are calculated from payment history or similar
        // For now, setting static values
        setTotalDue(0);
        setTotalPaid(0);
        setTotalDeposit(0);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchData();
  }, []);

  const styles = {
    container: {
      display: 'flex',
      minHeight: '100vh',
    },
    mainContent: {
      flex: 1,
      padding: '2rem',
      backgroundColor: '#f5f5f5',
    },
    card: {
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '1.5rem',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    cardHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      marginBottom: '1rem',
    },
    cardTitle: {
      margin: 0,
      fontSize: '1rem',
      color: '#666',
    },
    cardValue: {
      margin: 0,
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#333',
    },
  };

  return (
    <div style={styles.container}>
      <Sidebar />
      <main style={styles.mainContent}>
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <span style={{ fontSize: '1.5rem', color: '#4CAF50' }}>👥</span>
              <h3 style={styles.cardTitle}>Total Customers</h3>
            </div>
            <p style={styles.cardValue}>{totalCustomers}</p>
          </div>
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <span style={{ fontSize: '1.5rem', color: '#2196F3' }}>🏪</span>
              <h3 style={styles.cardTitle}>Total Suppliers</h3>
            </div>
            <p style={styles.cardValue}>{totalSuppliers}</p>
          </div>
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <span style={{ fontSize: '1.5rem', color: '#FF9800' }}>👥</span>
              <h3 style={styles.cardTitle}>Total Staff</h3>
            </div>
            <p style={styles.cardValue}>{totalStaff}</p>
          </div>
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <span style={{ fontSize: '1.5rem', color: '#4CAF50' }}>💰</span>
              <h3 style={styles.cardTitle}>Total Sales</h3>
            </div>
            <p style={styles.cardValue}>{totalSales}</p>
          </div>
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <span style={{ fontSize: '1.5rem', color: '#FF9800' }}>🛒</span>
              <h3 style={styles.cardTitle}>Total Purchase</h3>
            </div>
            <p style={styles.cardValue}>{totalPurchase}</p>
          </div>
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <span style={{ fontSize: '1.5rem', color: '#F44336' }}>📦</span>
              <h3 style={styles.cardTitle}>Total Expenses</h3>
            </div>
            <p style={styles.cardValue}>{totalExpenses}</p>
          </div>
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <span style={{ fontSize: '1.5rem', color: '#4CAF50' }}>💰</span>
              <h3 style={styles.cardTitle}>Total Income</h3>
            </div>
            <p style={styles.cardValue}>{totalIncome}</p>
          </div>
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <span style={{ fontSize: '1.5rem', color: '#2196F3' }}>💳</span>
              <h3 style={styles.cardTitle}>Total Cashbook</h3>
            </div>
            <p style={styles.cardValue}>{totalCashbook}</p>
          </div>
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <span style={{ fontSize: '1.5rem', color: '#9C27B0' }}>📄</span>
              <h3 style={styles.cardTitle}>Total Rental Item</h3>
            </div>
            <p style={styles.cardValue}>{totalRentalItem}</p>
          </div>
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <span style={{ fontSize: '1.5rem', color: '#9C27B0' }}>🏪</span>
              <h3 style={styles.cardTitle}>Total Branch</h3>
            </div>
            <p style={styles.cardValue}>{totalBranch}</p>
          </div>
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <span style={{ fontSize: '1.5rem', color: '#2196F3' }}>👤</span>
              <h3 style={styles.cardTitle}>Total App User</h3>
            </div>
            <p style={styles.cardValue}>{totalAppUser}</p>
          </div>
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <span style={{ fontSize: '1.5rem', color: '#FF9800' }}>🛒</span>
              <h3 style={styles.cardTitle}>Total Item</h3>
            </div>
            <p style={styles.cardValue}>{totalItem}</p>
          </div>
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <span style={{ fontSize: '1.5rem', color: '#F44336' }}>💳</span>
              <h3 style={styles.cardTitle}>Total Due</h3>
            </div>
            <p style={styles.cardValue}>{totalDue}</p>
          </div>
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <span style={{ fontSize: '1.5rem', color: '#4CAF50' }}>💰</span>
              <h3 style={styles.cardTitle}>Total Paid</h3>
            </div>
            <p style={styles.cardValue}>{totalPaid}</p>
          </div>
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <span style={{ fontSize: '1.5rem', color: '#4CAF50' }}>🏦</span>
              <h3 style={styles.cardTitle}>Total Deposit</h3>
            </div>
            <p style={styles.cardValue}>{totalDeposit}</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard; 