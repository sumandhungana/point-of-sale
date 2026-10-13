import React, { useRef, useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import logo from '@/assets/logo.png';
import { printReportDirectly } from '../utils/printInvoice';
import '@/styles/InvoicePdf.css';

export interface ReportRow {
    id: number | string;
    number: string;
    date: string;
    party: string;
    itemsSummary: string;
    paymentMode: string;
    amount: number;
}

export interface ReportModalData {
    reportType: 'PURCHASE' | 'SALES';
    title: string;
    subtitle: string;
    totalAmount: number;
    totalCount: number;
    rows: ReportRow[];
}

interface ReportPdfModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: ReportModalData | null;
    autoDownload?: boolean;
}

export const ReportPdfModal: React.FC<ReportPdfModalProps> = ({
    isOpen,
    onClose,
    data,
    autoDownload = false,
}) => {
    const reportRef = useRef<HTMLDivElement>(null);
    const [generating, setGenerating] = useState(false);

    const companyName =
        localStorage.getItem('organizationName') ||
        localStorage.getItem('companyName') ||
        'Point of Sale Store';

    useEffect(() => {
        if (isOpen && autoDownload && data) {
            handleDownloadPdf();
        }
    }, [isOpen, autoDownload, data]);

    if (!isOpen || !data) return null;

    const handleDownloadPdf = async () => {
        if (!reportRef.current) return;
        setGenerating(true);

        try {
            const canvas = await html2canvas(reportRef.current, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                logging: false,
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
            const filename = `${data.reportType === 'PURCHASE' ? 'Purchase_Report' : 'Sales_Report'}_${currentDate}.pdf`;
            pdf.save(filename);
        } catch (err) {
            console.error('Failed to generate PDF report:', err);
            alert('Failed to generate PDF report. Please try again.');
        } finally {
            setGenerating(false);
        }
    };

    const handlePrint = () => {
        if (data) {
            printReportDirectly(data);
        } else {
            window.print();
        }
    };

    const isPurchase = data.reportType === 'PURCHASE';
    const averageValue = data.totalCount > 0 ? data.totalAmount / data.totalCount : 0;

    return (
        <div className="invoice-modal-backdrop" onClick={onClose}>
            <div
                className="invoice-modal-container"
                onClick={(e) => e.stopPropagation()}
                style={{ maxWidth: '900px' }}
            >
                {/* Header Actions */}
                <div className="invoice-modal-header">
                    <div className="invoice-modal-title">
                        <span
                            className={`invoice-modal-badge ${
                                isPurchase ? 'purchase' : 'sales'
                            }`}
                        >
                            {isPurchase ? 'Purchase Report' : 'Sales Report'}
                        </span>
                        <h3>{data.title}</h3>
                    </div>

                    <div className="invoice-modal-actions">
                        <button
                            type="button"
                            className="btn-invoice-download"
                            onClick={handleDownloadPdf}
                            disabled={generating}
                        >
                            <i
                                className={`bi ${
                                    generating
                                        ? 'bi-arrow-repeat fa-spin'
                                        : 'bi-file-earmark-arrow-down'
                                }`}
                            ></i>
                            {generating ? 'Generating PDF...' : 'Download Report PDF'}
                        </button>

                        <button
                            type="button"
                            className="btn-invoice-print"
                            onClick={handlePrint}
                        >
                            <i className="bi bi-printer"></i>
                            Print
                        </button>

                        <button
                            type="button"
                            className="btn-invoice-close"
                            onClick={onClose}
                            title="Close"
                        >
                            <i className="bi bi-x-lg"></i>
                        </button>
                    </div>
                </div>

                {/* Printable Paper Area */}
                <div className="invoice-modal-body">
                    <div
                        className="invoice-paper"
                        ref={reportRef}
                        id="printable-invoice-paper"
                    >
                        {/* 1. Header */}
                        <div className="invoice-paper-header">
                            <div className="invoice-brand">
                                <img
                                    src={logo}
                                    alt="Logo"
                                    className="invoice-logo-img"
                                    onError={(e) => {
                                        (e.target as HTMLElement).style.display = 'none';
                                    }}
                                />
                                <div>
                                    <h1 className="invoice-brand-title">{companyName}</h1>
                                    <p className="invoice-brand-subtitle">
                                        Executive Financial & Inventory Statements
                                    </p>
                                </div>
                            </div>

                            <div className="invoice-type-banner">
                                <h2 className="invoice-type-name">{data.title}</h2>
                                <div className="invoice-number-tag">
                                    Generated: {new Date().toLocaleDateString()}
                                </div>
                            </div>
                        </div>

                        {/* 2. Executive KPI Summary Box */}
                        <div className="report-summary-header-box">
                            <div className="report-kpi-item">
                                <span className="report-kpi-label">
                                    {isPurchase ? 'Total Purchase Spend' : 'Total Sales Revenue'}
                                </span>
                                <span className="report-kpi-val" style={{ color: '#255dce' }}>
                                    Rs. {data.totalAmount.toLocaleString('en-IN', {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    })}
                                </span>
                            </div>

                            <div className="report-kpi-item">
                                <span className="report-kpi-label">Total Transactions</span>
                                <span className="report-kpi-val">{data.totalCount} Bills</span>
                            </div>

                            <div className="report-kpi-item">
                                <span className="report-kpi-label">Average Bill Size</span>
                                <span className="report-kpi-val">
                                    Rs. {averageValue.toLocaleString('en-IN', {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    })}
                                </span>
                            </div>
                        </div>

                        {/* 3. Report Data Table */}
                        <div className="invoice-table-container">
                            <table className="invoice-paper-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: '35px' }} className="text-center">#</th>
                                        <th style={{ width: '130px' }}>Bill / Invoice #</th>
                                        <th style={{ width: '90px' }}>Date</th>
                                        <th style={{ width: '140px' }}>
                                            {isPurchase ? 'Vendor' : 'Customer'}
                                        </th>
                                        <th>Details / Items</th>
                                        <th style={{ width: '100px' }}>Mode</th>
                                        <th style={{ width: '120px' }} className="text-end">Amount (Rs.)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.rows.map((row, idx) => (
                                        <tr key={idx}>
                                            <td className="text-center">{idx + 1}</td>
                                            <td className="fw-bold" style={{ color: '#255dce' }}>
                                                {row.number}
                                            </td>
                                            <td>
                                                {row.date
                                                    ? new Date(row.date).toLocaleDateString()
                                                    : 'N/A'}
                                            </td>
                                            <td>
                                                <div className="fw-semibold">{row.party}</div>
                                            </td>
                                            <td>
                                                <div className="text-truncate" style={{ maxWidth: '180px' }}>
                                                    {row.itemsSummary}
                                                </div>
                                            </td>
                                            <td>
                                                <span className="badge-payment-mode">
                                                    {row.paymentMode}
                                                </span>
                                            </td>
                                            <td className="text-end fw-bold">
                                                Rs. {row.amount.toLocaleString('en-IN', {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2,
                                                })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* 4. Total Summary Line */}
                        <div style={{ marginTop: 'auto' }}>
                            <div className="total-summary-line grand" style={{ padding: '12px 14px', background: '#f8fafc', borderRadius: '8px' }}>
                                <span>Total Grand Summary:</span>
                                <span className="grand-amount-val">
                                    Rs. {data.totalAmount.toLocaleString('en-IN', {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    })}
                                </span>
                            </div>

                            <div className="invoice-disclaimer" style={{ marginTop: '20px' }}>
                                Official Statement Report | Generated by {companyName} POS Core | {new Date().toLocaleString()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
