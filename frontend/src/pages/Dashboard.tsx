import React from 'react';
import { Sidebar } from '../components/Sidebar';

interface MetricCard {
  title: string;
  value: string;
  icon: string;
  color: string;
}

const metricCards: MetricCard[] = [
  { title: 'Total Customer', value: '1,234', icon: '👥', color: '#4CAF50' },
  { title: 'Total Supplier', value: '567', icon: '🏢', color: '#2196F3' },
  { title: 'Total Branch', value: '12', icon: '🏪', color: '#9C27B0' },
  { title: 'Due Amount', value: 'रु45,678', icon: '💰', color: '#F44336' },
  { title: 'Paid Amount', value: 'रु89,012', icon: '💵', color: '#4CAF50' },
  { title: 'Purchase Amount', value: 'रु67,890', icon: '🛒', color: '#FF9800' },
  { title: 'Sales Amount', value: 'रु1,23,456', icon: '📈', color: '#4CAF50' },
  { title: 'Expense Amount', value: 'रु34,567', icon: '💸', color: '#F44336' },
  { title: 'Rent Items', value: '45', icon: '📦', color: '#9C27B0' },
  { title: 'App User', value: '89', icon: '👤', color: '#2196F3' },
  { title: 'Staff', value: '34', icon: '👨‍💼', color: '#FF9800' },
  { title: 'Bank Deposit', value: 'रु2,34,567', icon: '🏦', color: '#4CAF50' },
  { title: 'Customer Deposit', value: 'रु1,56,789', icon: '💳', color: '#2196F3' },
  { title: 'Suppliers Deposit', value: 'रु78,901', icon: '💳', color: '#9C27B0' },
];

const systemMetrics = [
  { title: 'Memory Usage', value: 75, color: '#4CAF50' },
  { title: 'CPU Usage', value: 60, color: '#2196F3' },
  { title: 'Disk Usage', value: 45, color: '#9C27B0' },
];

export const Dashboard = () => {
  const styles = {
    container: {
      minHeight: '100vh',
      background: '#f8f9fa',
    },
    mainContent: {
      padding: '2rem',
    },
    cardsContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '1.5rem',
      marginBottom: '2rem',
    },
    card: {
      background: 'white',
      borderRadius: '8px',
      padding: '1.5rem',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '0.5rem',
    },
    cardHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
    },
    cardIcon: {
      fontSize: '1.5rem',
    },
    cardTitle: {
      fontSize: '0.875rem',
      color: '#6c757d',
      margin: 0,
    },
    cardValue: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#212529',
      margin: 0,
    },
    metricsContainer: {
      background: 'white',
      borderRadius: '8px',
      padding: '1.5rem',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    metricsTitle: {
      fontSize: '1.25rem',
      fontWeight: 'bold',
      color: '#212529',
      marginBottom: '1.5rem',
    },
    metricsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '1.5rem',
    },
    metricItem: {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      gap: '0.5rem',
    },
    metricTitle: {
      fontSize: '0.875rem',
      color: '#6c757d',
      margin: 0,
    },
    meterContainer: {
      width: '100%',
      height: '8px',
      background: '#e9ecef',
      borderRadius: '4px',
      overflow: 'hidden',
    },
    meterFill: {
      height: '100%',
      borderRadius: '4px',
      transition: 'width 0.3s ease',
    },
    metricValue: {
      fontSize: '1rem',
      fontWeight: 'bold',
      color: '#212529',
      margin: 0,
    },
  };

  return (
    <div style={styles.container}>
      <Sidebar />
      <main style={styles.mainContent}>
        <div style={styles.cardsContainer}>
          {metricCards.map((card) => (
            <div key={card.title} style={styles.card}>
              <div style={styles.cardHeader}>
                <span style={{ ...styles.cardIcon, color: card.color }}>{card.icon}</span>
                <h3 style={styles.cardTitle}>{card.title}</h3>
              </div>
              <p style={styles.cardValue}>{card.value}</p>
            </div>
          ))}
        </div>

        <div style={styles.metricsContainer}>
          <h3 style={styles.metricsTitle}>System Metrics</h3>
          <div style={styles.metricsGrid}>
            {systemMetrics.map((metric) => (
              <div key={metric.title} style={styles.metricItem}>
                <h4 style={styles.metricTitle}>{metric.title}</h4>
                <div style={styles.meterContainer}>
                  <div
                    style={{
                      ...styles.meterFill,
                      width: `${metric.value}%`,
                      background: metric.color,
                    }}
                  />
                </div>
                <p style={styles.metricValue}>{metric.value}%</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}; 