"use client";

import { useState, useEffect, useRef } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { useNavigate } from 'react-router-dom';
import { getCustomers, Customer } from '@/features/services/customerService';
import {
    getPaymentList,
    GetPaymentResponse
} from '@/features/services/paymentService';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import '../../../styles/CustomerListReportPdf.css';
import logo from '../../../assets/logo.png';
import { formatSystemNumber } from '@/features/services/appSettingService';

interface CustomerWithBalance extends Customer {
    balance: number;
    paymentHistory: GetPaymentResponse[];
}

interface OverallTotals {
    given: number;
    received: number;
    online: number;
}

export const CustomerListReportPdf = () => {
    const navigate = useNavigate();
    const reportRef = useRef<HTMLDivElement>(null);
    const [customers, setCustomers] = useState<CustomerWithBalance[]>([]);
    const [, setOverallTotals] = useState<OverallTotals>({ given: 0, received: 0, online: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [generatingPdf, setGeneratingPdf] = useState(false);
    const [mobileView, setMobileView] = useState<'cards' | 'table'>('cards');
    const companyName = localStorage.getItem('companyName') || 'Admin';

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const data = await getCustomers();
                const customersWithBalance = await Promise.all(
                    data.map(async (customer) => {
                        try {
                            const paymentHistory = await getPaymentList({
                                paymentParty: 'CUSTOMER',
                                partyId: Number(customer.customerId)
                            });

                            const balance = paymentHistory.reduce((acc, payment) => {
                                if (payment.paymentCategory === 'RECEIVED') {
                                    return acc + payment.amount;
                                } else {
                                    return acc - payment.amount;
                                }
                            }, 0);
                            return { ...customer, balance, paymentHistory };
                        } catch (err) {
                            console.error(`Failed to fetch payment history for customer ${customer.id}:`, err);
                            return { ...customer, balance: 0, paymentHistory: [] };
                        }
                    })
                );
                setCustomers(customersWithBalance);

                // Calculate overall totals
                const totals = customersWithBalance.reduce((acc, customer) => {
                    customer.paymentHistory.forEach(payment => {
                        if (payment.paymentCategory === 'GIVEN') {
                            acc.given += Math.abs((payment.oldBalance ?? 0) - payment.newBalance);
                        } else if (payment.paymentCategory === 'RECEIVED') {
                            acc.received += Math.abs((payment.oldBalance ?? 0) - payment.newBalance);
                        }
                    });
                    return acc;
                }, { given: 0, received: 0, online: 0 });

                setOverallTotals(totals);
                setLoading(false);
            } catch (err) {
                setError('Failed to load customers');
                setLoading(false);
            }
        };

        fetchCustomers();
    }, []);

    const handleBack = () => {
        navigate('/parties/customers');
    };

    const handleGeneratePdf = async () => {
        if (!reportRef.current) return;

        setGeneratingPdf(true);
        try {
            const canvas = await html2canvas(reportRef.current, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                windowWidth: 1200,
                onclone: (clonedDoc) => {
                    const toggle = clonedDoc.querySelector('.report-view-toggle-bar');
                    if (toggle) (toggle as HTMLElement).style.display = 'none';
                    const mobileCards = clonedDoc.querySelector('.customer-report-mobile-cards');
                    if (mobileCards) (mobileCards as HTMLElement).style.display = 'none';
                    const tableContainer = clonedDoc.querySelector('.customer-report-table-container');
                    if (tableContainer) {
                        (tableContainer as HTMLElement).style.display = 'block';
                        (tableContainer as HTMLElement).classList.remove('d-mobile-none');
                    }
                    const table = clonedDoc.querySelector('.customer-report-table');
                    if (table) {
                        (table as HTMLElement).style.minWidth = '750px';
                        (table as HTMLElement).style.width = '100%';
                    }
                }
            });

            const imgData = canvas.toDataURL('image/png');

            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgWidth = 210;
            const pageHeight = 295;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            const currentDate = new Date().toISOString().split('T')[0];
            const filename = `Customer_Report_${companyName}_${currentDate}.pdf`;

            pdf.save(filename);
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Error generating PDF. Please try again.');
        } finally {
            setGeneratingPdf(false);
        }
    };

    const tableTotals = customers.reduce(
        (acc, customer) => {
            if (customer.balance < 0) {
                acc.given += Math.abs(customer.balance);
            } else if (customer.balance > 0) {
                acc.received += customer.balance;
            }
            return acc;
        },
        { given: 0, received: 0 }
    );

    const totalGave = tableTotals.given;
    const totalReceived = tableTotals.received;
    const netBalance = totalReceived - totalGave;

    if (loading) {
        return (
            <div className="customer-report-container">
                <Sidebar />
                <main className="customer-report-main-content">
                    <div className="customer-report-content-container">
                        <div className="customer-report-loading">
                            <i className="bi bi-arrow-clockwise spin"></i>
                            Loading report data...
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    if (error) {
        return (
            <div className="customer-report-container">
                <Sidebar />
                <main className="customer-report-main-content">
                    <div className="customer-report-content-container">
                        <div className="customer-report-error">
                            <i className="bi bi-exclamation-triangle-fill"></i>
                            {error}
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="customer-report-container">
            <Sidebar />

            <main className="customer-report-main-content">
                <div className="customer-report-content-container">
                    <div className="customer-report-button-container">
                        <button
                            onClick={handleGeneratePdf}
                            className="customer-report-generate-button"
                            disabled={generatingPdf}
                        >
                            <i className={`bi ${generatingPdf ? 'bi-arrow-clockwise spin' : 'bi-file-earmark-pdf'}`}></i>
                            {generatingPdf ? 'Generating...' : 'Generate PDF'}
                        </button>
                        <button
                            type="button"
                            onClick={handleBack}
                            className="customer-report-close-button"
                            title="Close report"
                            aria-label="Close"
                        >
                            <i className="bi bi-x-lg"></i>
                        </button>
                    </div>

                    <div className="customer-report-logo-section">
                        <div className="customer-report-logo-container">
                            <div className="customer-report-company-name">{companyName}</div>
                        </div>
                        <div className="customer-report-print-option">
                            <label htmlFor="printLogo">
                                <img
                                    src={logo}
                                    alt="logo"
                                    style={{
                                        width: "110px",
                                        height: "110px",
                                        objectFit: "contain"
                                    }}
                                />
                            </label>
                        </div>
                    </div>

                    <div ref={reportRef} className="customer-report-content">
                        <h1 className="customer-report-title">
                            <i className="bi bi-people-fill me-2"></i>
                            Customer Ledger Report
                        </h1>
                        <p className="customer-report-date">
                            <i className="bi bi-calendar-event me-1"></i>
                            (Generated On: {new Date().toLocaleDateString()})
                        </p>

                        <div className="customer-report-summary-section">
                            <div className="customer-report-summary-item">
                                <p className="customer-report-summary-item-title-gave">
                                    <i className="bi bi-arrow-up-circle me-1"></i>
                                    You Gave
                                </p>
                                <p className={`customer-report-summary-item-value customer-report-gave-value`}>
                                    रू {formatSystemNumber(totalGave)}
                                </p>
                            </div>
                            <div className="customer-report-summary-divider"></div>
                            <div className="customer-report-summary-item">
                                <p className="customer-report-summary-item-title-received">
                                    <i className="bi bi-arrow-down-circle me-1"></i>
                                    You Received
                                </p>
                                <p className={`customer-report-summary-item-value customer-report-received-value`}>
                                    रू {formatSystemNumber(totalReceived)}
                                </p>
                            </div>
                            <div className="customer-report-summary-divider"></div>
                            <div className="customer-report-summary-item">
                                <p className="customer-report-summary-item-title">
                                    <i className="bi bi-calculator me-1"></i>
                                    Net Balance
                                </p>
                                <p className={`customer-report-summary-item-value customer-report-net-value`}>
                                    रू {formatSystemNumber(netBalance)}
                                </p>
                            </div>
                        </div>

                        <div className="customer-report-customer-count">
                            <i className="bi bi-people me-1"></i>
                            Total Customers: {customers.length}
                        </div>

                        {/* Mobile View Toggle Bar */}
                        <div className="report-view-toggle-bar">
                            <button
                                type="button"
                                className={`report-view-toggle-btn ${mobileView === 'cards' ? 'active' : ''}`}
                                onClick={() => setMobileView('cards')}
                            >
                                <i className="bi bi-grid me-1"></i> Cards View ({customers.length})
                            </button>
                            <button
                                type="button"
                                className={`report-view-toggle-btn ${mobileView === 'table' ? 'active' : ''}`}
                                onClick={() => setMobileView('table')}
                            >
                                <i className="bi bi-table me-1"></i> Table View
                            </button>
                        </div>

                        {/* Mobile Cards View (Zero horizontal scroll) */}
                        <div className={`customer-report-mobile-cards ${mobileView === 'cards' ? 'd-mobile-flex' : 'd-mobile-none'}`}>
                            {customers.map((customer) => (
                                <div className="customer-report-mobile-card" key={customer.id}>
                                    <div className="crmc-header">
                                        <div className="crmc-name-wrap">
                                            <span className="crmc-avatar">
                                                <i className="bi bi-person"></i>
                                            </span>
                                            <div className="crmc-name-details">
                                                <h4 className="crmc-name">{customer.name}</h4>
                                                {customer.phone && (
                                                    <a href={`tel:${customer.phone}`} className="crmc-phone">
                                                        <i className="bi bi-telephone-fill me-1"></i>
                                                        {customer.phone}
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                        {customer.paymentDateReminder && (
                                            <span className="crmc-reminder-badge" title="Reminder Date">
                                                <i className="bi bi-calendar-event me-1"></i>
                                                {customer.paymentDateReminder.split("T")[0]}
                                            </span>
                                        )}
                                    </div>

                                    <div className="crmc-financial-row">
                                        <div className="crmc-fin-box gave">
                                            <span className="crmc-fin-label">You Gave</span>
                                            <span className="crmc-fin-val text-danger">
                                                {customer.balance < 0 ? `रू ${formatSystemNumber(Math.abs(customer.balance))}` : "-"}
                                            </span>
                                        </div>
                                        <div className="crmc-fin-box received">
                                            <span className="crmc-fin-label">You Received</span>
                                            <span className="crmc-fin-val text-success">
                                                {customer.balance > 0 ? `रू ${formatSystemNumber(customer.balance)}` : "-"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className={`customer-report-table-container ${mobileView === 'cards' ? 'd-mobile-none' : 'd-mobile-block'}`}>
                            <table className="customer-report-table">
                                <thead>
                                <tr>
                                    <th className="customer-report-table-header-name">
                                        <i className="bi bi-person me-1"></i>
                                        Name
                                    </th>
                                    <th className="customer-report-table-header-phone">
                                        <i className="bi bi-telephone me-1"></i>
                                        Phone
                                    </th>
                                    <th className="customer-report-table-header-gave">
                                        <i className="bi bi-arrow-up-circle me-1"></i>
                                        You Gave
                                    </th>
                                    <th className="customer-report-table-header-received">
                                        <i className="bi bi-arrow-down-circle me-1"></i>
                                        You Received
                                    </th>
                                    <th className="customer-report-table-header-collection-date">
                                        <i className="bi bi-calculator me-1"></i>
                                        Collection Date
                                    </th>
                                </tr>
                                </thead>
                                <tbody>
                                {customers.map((customer) => (
                                    <tr key={customer.id}>
                                        <td className="customer-report-table-cell customer-report-name-cell">{customer.name}</td>
                                        <td className="customer-report-table-cell customer-report-phone-cell">{customer.phone}</td>
                                        <td className={`customer-report-table-cell customer-report-gave-cell`}>
                                            {customer.balance < 0 ? `रू ${formatSystemNumber(Math.abs(customer.balance))}` : ""}
                                        </td>
                                        <td className={`customer-report-table-cell customer-report-received-cell`}>
                                            {customer.balance > 0 ? `रू ${formatSystemNumber(customer.balance)}` : ""}
                                        </td>
                                        <td className="customer-report-table-cell customer-report-collection-cell">
                                            {customer.paymentDateReminder
                                                ? customer.paymentDateReminder.split("T")[0]
                                                : "-"}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                                <tfoot>
                                <tr className="customer-report-total-row">
                                    <td colSpan={2}>
                                        <strong>Grand Total</strong>
                                    </td>
                                    <td className="customer-report-gave-cell" style={{ paddingLeft: "12px" }}>
                                        <strong>रू {formatSystemNumber(tableTotals.given)}</strong>
                                    </td>
                                    <td className="customer-report-received-cell" style={{ paddingLeft: "12px" }}>
                                        <strong>रू {formatSystemNumber(tableTotals.received)}</strong>
                                    </td>
                                    <td className="customer-report-table-cell customer-report-collection-cell"></td>
                                </tr>
                                </tfoot>
                            </table>
                        </div>

                        <div className="customer-report-footer">
                            <i className="bi bi-info-circle me-1"></i>
                            Company Details and Helpline Number
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};
