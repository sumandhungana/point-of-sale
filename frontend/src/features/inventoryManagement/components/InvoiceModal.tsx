import React, { useRef, useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import logo from '@/assets/logo.png';
import { printInvoiceDirectly } from '../utils/printInvoice';
import { useAppSettings } from '@/context/AppSettingsContext';
import '@/styles/InvoicePdf.css';

export interface InvoiceItem {
    id?: number | string;
    name: string;
    category?: string;
    quantity: number;
    unitPrice: number;
    taxPercentage?: number;
    vatPercentage?: number;
    taxAmount?: number;
    vatAmount?: number;
    totalAmount: number;
}

export interface InvoiceModalData {
    type: 'PURCHASE' | 'SALES';
    invoiceNumber: string;
    date: string;
    partyName: string; // Vendor name for purchase, Customer name for sales
    partyType?: string;
    paymentMode: string;
    remarks?: string;
    createdBy?: string;
    items: InvoiceItem[];
    subtotal: number;
    taxTotal?: number;
    grandTotal: number;
}

interface InvoiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: InvoiceModalData | null;
    autoDownload?: boolean;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
    isOpen,
    onClose,
    data,
    autoDownload = false,
}) => {
    const reportRef = useRef<HTMLDivElement>(null);
    const [generating, setGenerating] = useState(false);
    const { formatCurrency, formatNumber, formatDate, currencySymbol } = useAppSettings();

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

            const cleanNo = (data.invoiceNumber || 'bill').replace(/[^a-zA-Z0-9_-]/g, '_');
            const filename = `${data.type === 'PURCHASE' ? 'Purchase_Invoice' : 'Sales_Invoice'}_${cleanNo}.pdf`;
            pdf.save(filename);
        } catch (err) {
            console.error('Failed to generate PDF:', err);
            alert('Failed to generate PDF invoice. Please try again.');
        } finally {
            setGenerating(false);
        }
    };

    const handlePrint = () => {
        if (data) {
            printInvoiceDirectly(data);
        } else {
            window.print();
        }
    };

    const isPurchase = data.type === 'PURCHASE';
    const formattedDate = data.date ? formatDate(data.date) : formatDate(new Date());

    return (
        <div className="invoice-modal-backdrop" onClick={onClose}>
            <div
                className="invoice-modal-container"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Modal Action Bar */}
                <div className="invoice-modal-header">
                    <div className="invoice-modal-title">
                        <span
                            className={`invoice-modal-badge ${
                                isPurchase ? 'purchase' : 'sales'
                            }`}
                        >
                            {isPurchase ? 'Purchase Invoice' : 'Sales Invoice'}
                        </span>
                        <h3>{data.invoiceNumber || 'N/A'}</h3>
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
                            {generating ? 'Generating PDF...' : 'Download PDF'}
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
                            title="Close preview"
                        >
                            <i className="bi bi-x-lg"></i>
                        </button>
                    </div>
                </div>

                {/* Printable Invoice Container */}
                <div className="invoice-modal-body">
                    <div
                        className="invoice-paper"
                        ref={reportRef}
                        id="printable-invoice-paper"
                    >
                        {/* 1. Header & Branding */}
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
                                        Point of Sale & Inventory Billing System
                                    </p>
                                </div>
                            </div>

                            <div className="invoice-type-banner">
                                <h2 className="invoice-type-name">
                                    {isPurchase ? 'PURCHASE INVOICE' : 'TAX INVOICE'}
                                </h2>
                                <div className="invoice-number-tag">
                                    #{data.invoiceNumber}
                                </div>
                            </div>
                        </div>

                        {/* 2. Metadata & Parties Grid */}
                        <div className="invoice-meta-grid">
                            <div className="invoice-party-col">
                                <h4>
                                    {isPurchase
                                        ? 'Vendor / Supplier Information'
                                        : 'Customer Information'}
                                </h4>
                                <div className="invoice-party-name">
                                    {data.partyName || (isPurchase ? 'Standard Vendor' : 'Walk-in Customer')}
                                </div>
                                <p className="invoice-party-detail">
                                    Type: {data.partyType || (isPurchase ? 'Vendor' : 'Direct Buyer')}
                                </p>
                                {data.remarks && (
                                    <p className="invoice-party-detail">
                                        Notes: {data.remarks}
                                    </p>
                                )}
                            </div>

                            <div className="invoice-dates-col">
                                <div className="invoice-info-row">
                                    <span className="invoice-info-label">Invoice Date:</span>
                                    <span className="invoice-info-val">{formattedDate}</span>
                                </div>
                                <div className="invoice-info-row">
                                    <span className="invoice-info-label">Payment Mode:</span>
                                    <span className="invoice-info-val" style={{ textTransform: 'uppercase' }}>
                                        {data.paymentMode || 'CASH'}
                                    </span>
                                </div>
                                <div className="invoice-info-row">
                                    <span className="invoice-info-label">Payment Status:</span>
                                    <span className="badge-paid-status">PAID / SETTLED</span>
                                </div>
                                {data.createdBy && (
                                    <div className="invoice-info-row">
                                        <span className="invoice-info-label">Issued By:</span>
                                        <span className="invoice-info-val">{data.createdBy}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 3. Items Table */}
                        <div className="invoice-table-container">
                            <table className="invoice-paper-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: '40px' }} className="text-center">#</th>
                                        <th>Description</th>
                                        <th style={{ width: '130px' }}>Category</th>
                                        <th style={{ width: '70px' }} className="text-center">Qty</th>
                                        <th style={{ width: '110px' }} className="text-end">Rate ({currencySymbol})</th>
                                        {data.items.some(i => (i.taxPercentage || 0) > 0 || (i.vatPercentage || 0) > 0) && (
                                            <th style={{ width: '90px' }} className="text-center">Tax %</th>
                                        )}
                                        <th style={{ width: '120px' }} className="text-end">Amount ({currencySymbol})</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.items.map((item, idx) => {
                                        const hasTax = (item.taxPercentage || 0) > 0 || (item.vatPercentage || 0) > 0;
                                        const totalTax = (Number(item.taxPercentage) || 0) + (Number(item.vatPercentage) || 0);

                                        return (
                                            <tr key={idx}>
                                                <td className="text-center">{idx + 1}</td>
                                                <td>
                                                    <div className="item-name-cell">{item.name}</div>
                                                </td>
                                                <td>
                                                    <span className="item-category-sub">
                                                        {item.category || 'General'}
                                                    </span>
                                                </td>
                                                <td className="text-center">{item.quantity}</td>
                                                <td className="text-end">
                                                    {formatNumber(item.unitPrice || 0, 2)}
                                                </td>
                                                {data.items.some(i => (i.taxPercentage || 0) > 0 || (i.vatPercentage || 0) > 0) && (
                                                    <td className="text-center">
                                                        {hasTax ? `${totalTax}%` : '-'}
                                                    </td>
                                                )}
                                                <td className="text-end fw-bold">
                                                    {formatNumber(item.totalAmount || 0, 2)}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* 4. Financial Summary & Notes */}
                        <div className="invoice-bottom-grid">
                            <div className="invoice-notes-box">
                                <h5>Terms & Conditions</h5>
                                <p>
                                    1. This is a computer-generated tax document and is legally binding.
                                    <br />
                                    2. Goods received/sold as per quality standards.
                                    <br />
                                    3. Thank you for your business!
                                </p>
                            </div>

                            <div className="invoice-totals-box">
                                <div className="total-summary-line">
                                    <span>Subtotal:</span>
                                    <span>
                                        {formatCurrency(data.subtotal || data.grandTotal)}
                                    </span>
                                </div>

                                {(data.taxTotal || 0) > 0 && (
                                    <div className="total-summary-line">
                                        <span>Applicable Tax & VAT:</span>
                                        <span>
                                            {formatCurrency(data.taxTotal || 0)}
                                        </span>
                                    </div>
                                )}

                                <div className="total-summary-line grand">
                                    <span>Grand Total:</span>
                                    <span className="grand-amount-val">
                                        {formatCurrency(data.grandTotal || 0)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* 5. Signatures & Footer */}
                        <div>
                            <div className="invoice-signatures">
                                <div className="sig-box">
                                    <div className="sig-line"></div>
                                    <div className="sig-title">
                                        {isPurchase ? 'Vendor Signature' : 'Customer Signature'}
                                    </div>
                                </div>

                                <div className="sig-box">
                                    <div className="sig-line"></div>
                                    <div className="sig-title">Authorized Signatory</div>
                                </div>
                            </div>

                            <div className="invoice-disclaimer">
                                System Generated Document | POS & Accounting Core | Date: {new Date().toLocaleDateString()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
