"use client";

import { useState, useEffect, useRef } from "react";
import { Sidebar } from "@/components/Sidebar";
import { useNavigate } from "react-router-dom";
import {
    getSuppliers,
    GetSupplierResponse,
} from "@/features/services/supplierService";
import {
    getPaymentList,
    GetPaymentResponse,
} from "@/features/services/paymentService";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "../../../styles/CustomerListReportPdf.css";
import logo from "../../../assets/logo.png";
import { formatSystemNumber } from "@/features/services/appSettingService";

interface SupplierWithBalance {
    supplier: GetSupplierResponse;
    balance: number;
    paymentHistory: GetPaymentResponse[];
}

interface OverallTotals {
    given: number;
    received: number;
    online: number;
}

export const SupplierListReportPdf = () => {
    const navigate = useNavigate();
    const reportRef = useRef<HTMLDivElement>(null);

    const [suppliers, setSuppliers] = useState<SupplierWithBalance[]>([]);
    const [overallTotals, setOverallTotals] = useState<OverallTotals>({
        given: 0,
        received: 0,
        online: 0,
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [generatingPdf, setGeneratingPdf] = useState(false);
    const [mobileView, setMobileView] = useState<'cards' | 'table'>('cards');

    const companyName =
        localStorage.getItem("companyName") || "Admin";

    useEffect(() => {
        const fetchSuppliers = async () => {
            try {
                setLoading(true);
                setError(null);

                const data = await getSuppliers();

                const suppliersWithBalance = await Promise.all(
                    data.map(async (supplier): Promise<SupplierWithBalance> => {
                        try {
                            const paymentHistory =
                                await getPaymentList({
                                    paymentParty: "SUPPLIER",
                                    partyId: supplier.id,
                                });

                            const balance = paymentHistory.reduce(
                                (acc, payment) => {
                                    if (
                                        payment.paymentCategory ===
                                        "RECEIVED"
                                    ) {
                                        return acc + payment.amount;
                                    }

                                    if (
                                        payment.paymentCategory ===
                                        "GIVEN"
                                    ) {
                                        return acc - payment.amount;
                                    }

                                    return acc;
                                },
                                0
                            );

                            return {
                                supplier,
                                balance,
                                paymentHistory,
                            };
                        } catch (error) {
                            console.error(
                                `Error fetching payment history for supplier ${supplier.id}:`,
                                error
                            );

                            return {
                                supplier,
                                balance: 0,
                                paymentHistory: [],
                            };
                        }
                    })
                );

                setSuppliers(suppliersWithBalance);

                /*
                 * Calculate overall totals
                 */
                const totals = suppliersWithBalance.reduce(
                    (acc, supplier) => {
                        supplier.paymentHistory.forEach((payment) => {
                            if (
                                payment.paymentCategory ===
                                "GIVEN"
                            ) {
                                acc.given += payment.amount;
                            } else if (
                                payment.paymentCategory ===
                                "RECEIVED"
                            ) {
                                acc.received += payment.amount;
                            }
                        });

                        return acc;
                    },
                    {
                        given: 0,
                        received: 0,
                        online: 0,
                    }
                );

                setOverallTotals(totals);
            } catch (error) {
                console.error(
                    "Error fetching suppliers:",
                    error
                );

                setError(
                    "Failed to load suppliers data"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchSuppliers();
    }, []);

    const handleBack = () => {
        navigate("/parties/suppliers");
    };

    const handleGeneratePdf = async () => {
        if (!reportRef.current) {
            return;
        }

        setGeneratingPdf(true);

        try {
            const canvas = await html2canvas(
                reportRef.current,
                {
                    scale: 2,
                    useCORS: true,
                    allowTaint: true,
                    backgroundColor: "#ffffff",
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
                    },
                }
            );

            const imgData =
                canvas.toDataURL("image/png");

            const pdf = new jsPDF(
                "p",
                "mm",
                "a4"
            );

            const imgWidth = 210;
            const pageHeight = 295;

            const imgHeight =
                (canvas.height * imgWidth) /
                canvas.width;

            let heightLeft = imgHeight;
            let position = 0;

            /*
             * First page
             */
            pdf.addImage(
                imgData,
                "PNG",
                0,
                position,
                imgWidth,
                imgHeight
            );

            heightLeft -= pageHeight;

            /*
             * Additional pages
             */
            while (heightLeft > 0) {
                position =
                    heightLeft - imgHeight;

                pdf.addPage();

                pdf.addImage(
                    imgData,
                    "PNG",
                    0,
                    position,
                    imgWidth,
                    imgHeight
                );

                heightLeft -= pageHeight;
            }

            const currentDate =
                new Date()
                    .toISOString()
                    .split("T")[0];

            const filename =
                `Supplier_Report_${companyName}_${currentDate}.pdf`;

            pdf.save(filename);
        } catch (error) {
            console.error(
                "Error generating PDF:",
                error
            );

            alert(
                "Error generating PDF. Please try again."
            );
        } finally {
            setGeneratingPdf(false);
        }
    };

    /*
     * Calculate summary values
     */
    const totalGave =
        overallTotals.given -
            overallTotals.received <
        0
            ? 0
            : overallTotals.given -
              overallTotals.received;

    const totalReceived =
        overallTotals.received -
            overallTotals.given <
        0
            ? 0
            : overallTotals.received -
              overallTotals.given;

    const netBalance =
        totalReceived - totalGave;

    /*
     * Loading
     */
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

    /*
     * Error
     */
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

    /*
     * Main report
     */
    return (
        <div className="customer-report-container">
            <Sidebar />

            <main className="customer-report-main-content">
                <div className="customer-report-content-container">

                    {/* Buttons */}
                    <div className="customer-report-button-container">
                        <button
                            onClick={handleGeneratePdf}
                            className="customer-report-generate-button"
                            disabled={generatingPdf}
                        >
                            <i
                                className={`bi ${
    generatingPdf
        ? "bi-arrow-clockwise spin"
        : "bi-file-earmark-pdf"
}`}
                            ></i>

                            {generatingPdf
                                ? "Generating..."
                                : "Generate PDF"}
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

                    {/* Company Header */}
                    <div className="customer-report-logo-section">

                        <div className="customer-report-logo-container">
                            <div className="customer-report-company-name">
                                {companyName}
                            </div>
                        </div>

                        <div className="customer-report-print-option">
                            <label htmlFor="printLogo">
                                <img
                                    src={logo}
                                    alt="logo"
                                    style={{
                                        width: "110px",
                                        height: "110px",
                                        objectFit: "contain",
                                    }}
                                />
                            </label>
                        </div>

                    </div>

                    {/* Report */}
                    <div
                        ref={reportRef}
                        className="customer-report-content"
                    >

                        {/* Title */}
                        <h1 className="customer-report-title">
                            <i className="bi bi-people-fill me-2"></i>
                            Supplier List Report
                        </h1>

                        {/* Date */}
                        <p className="customer-report-date">
                            <i className="bi bi-calendar-event me-1"></i>
                            (generated:{" "}
                            {new Date().toLocaleDateString()}
                            )
                        </p>

                        {/* Summary */}
                        <div className="customer-report-summary-section">

                            {/* Given */}
                            <div className="customer-report-summary-item">
                                <p className="customer-report-summary-item-title">
                                    <i className="bi bi-arrow-up-circle me-1"></i>
                                    You Gave
                                </p>

                                <p className="customer-report-summary-item-value customer-report-gave-value">
                                    रू{" "}
                                    {formatSystemNumber(totalGave)}
                                </p>
                            </div>

                            <div className="customer-report-summary-divider"></div>

                            {/* Received */}
                            <div className="customer-report-summary-item">
                                <p className="customer-report-summary-item-title">
                                    <i className="bi bi-arrow-down-circle me-1"></i>
                                    You Received
                                </p>

                                <p className="customer-report-summary-item-value customer-report-received-value">
                                    रू{" "}
                                    {formatSystemNumber(totalReceived)}
                                </p>
                            </div>

                            <div className="customer-report-summary-divider"></div>

                            {/* Net Balance */}
                            <div className="customer-report-summary-item">
                                <p className="customer-report-summary-item-title">
                                    <i className="bi bi-calculator me-1"></i>
                                    Net Balance
                                </p>

                                <p className="customer-report-summary-item-value customer-report-net-value">
                                    रू{" "}
                                    {formatSystemNumber(netBalance)}
                                </p>
                            </div>

                        </div>

                        {/* Supplier Count */}
                        <div className="customer-report-customer-count">
                            <i className="bi bi-people me-1"></i>

                            No of Supplier:{" "}
                            {suppliers.length} (All)
                        </div>

                        {/* Mobile View Toggle Bar */}
                        <div className="report-view-toggle-bar">
                            <button
                                type="button"
                                className={`report-view-toggle-btn ${mobileView === 'cards' ? 'active' : ''}`}
                                onClick={() => setMobileView('cards')}
                            >
                                <i className="bi bi-grid me-1"></i> Cards View ({suppliers.length})
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
                            {suppliers.map((supplier) => (
                                <div className="customer-report-mobile-card" key={supplier.supplier.id}>
                                    <div className="crmc-header">
                                        <div className="crmc-name-wrap">
                                            <span className="crmc-avatar">
                                                <i className="bi bi-truck"></i>
                                            </span>
                                            <div className="crmc-name-details">
                                                <h4 className="crmc-name">{supplier.supplier.name}</h4>
                                                {supplier.supplier.phone && (
                                                    <a href={`tel:${supplier.supplier.phone}`} className="crmc-phone">
                                                        <i className="bi bi-telephone-fill me-1"></i>
                                                        {supplier.supplier.phone}
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                        <span className={`crmc-balance-badge ${supplier.balance < 0 ? 'gave' : supplier.balance > 0 ? 'received' : 'settled'}`}>
                                            {supplier.balance !== 0 ? `Bal: रू ${formatSystemNumber(Math.abs(supplier.balance))}` : 'Settled'}
                                        </span>
                                    </div>

                                    <div className="crmc-financial-row">
                                        <div className="crmc-fin-box gave">
                                            <span className="crmc-fin-label">You Gave</span>
                                            <span className="crmc-fin-val text-danger">
                                                {supplier.balance < 0 ? `रू ${formatSystemNumber(Math.abs(supplier.balance))}` : '-'}
                                            </span>
                                        </div>
                                        <div className="crmc-fin-box received">
                                            <span className="crmc-fin-label">You Received</span>
                                            <span className="crmc-fin-val text-success">
                                                {supplier.balance > 0 ? `रू ${formatSystemNumber(supplier.balance)}` : '-'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Supplier Table */}
                        <div className={`customer-report-table-container ${mobileView === 'cards' ? 'd-mobile-none' : 'd-mobile-block'}`}>

                            <table className="customer-report-table">

                                <thead>
                                    <tr>

                                        <th className="customer-report-table-header">
                                            <i className="bi bi-person me-1"></i>
                                            Name
                                        </th>

                                        <th className="customer-report-table-header">
                                            <i className="bi bi-telephone me-1"></i>
                                            Phone
                                        </th>

                                        <th className="customer-report-table-header">
                                            <i className="bi bi-arrow-up-circle me-1"></i>
                                            You Gave
                                        </th>

                                        <th className="customer-report-table-header">
                                            <i className="bi bi-arrow-down-circle me-1"></i>
                                            You Received
                                        </th>

                                        <th className="customer-report-table-header">
                                            <i className="bi bi-calculator me-1"></i>
                                            Balance
                                        </th>

                                    </tr>
                                </thead>

                                <tbody>

                                    {suppliers.map(
                                        (supplier) => (
                                            <tr
                                                key={
                                                    supplier.supplier.id
                                                }
                                            >

                                                {/* Name */}
                                                <td className="customer-report-table-cell">
                                                    {
                                                        supplier
                                                            .supplier
                                                            .name
                                                    }
                                                </td>

                                                {/* Phone */}
                                                <td className="customer-report-table-cell">
                                                    {
                                                        supplier
                                                            .supplier
                                                            .phone ??
                                                        ""
                                                    }
                                                </td>

                                                {/* Given */}
                                                <td className="customer-report-table-cell customer-report-gave-cell">
                                                    {supplier.balance <
                                                    0
                                                        ? `रू ${formatSystemNumber(Math.abs(
                                                              supplier.balance
                                                          ))}`
                                                        : ""}
                                                </td>

                                                {/* Received */}
                                                <td className="customer-report-table-cell customer-report-received-cell">
                                                    {supplier.balance >
                                                    0
                                                        ? `रू ${formatSystemNumber(supplier.balance)}`
                                                        : ""}
                                                </td>

                                                {/* Balance */}
                                                <td className="customer-report-table-cell">
                                                    {supplier.balance !==
                                                    0
                                                        ? `रू ${formatSystemNumber(Math.abs(
                                                              supplier.balance
                                                          ))}`
                                                        : "Settled"}
                                                </td>

                                            </tr>
                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                        {/* Footer */}
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
