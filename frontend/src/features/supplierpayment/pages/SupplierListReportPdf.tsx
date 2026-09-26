// "use client"
//
// import { useState, useEffect, useRef } from 'react';
// import { Sidebar } from '@/components/Sidebar';
// import { useNavigate } from 'react-router-dom';
// import { getSuppliers, GetSupplierResponse } from '@/features/services/supplierService';
// import { getPaymentList, GetPaymentResponse } from '@/features/services/paymentService';
// import jsPDF from 'jspdf';
// import html2canvas from 'html2canvas';
// import '../../../styles/CustomerListReportPdf.css';
// import logo from '../../../assets/logo.png';
//
// interface SupplierWithBalance extends GetPaymentResponse {
//     supplier: GetSupplierResponse
//     balance: number;
//     paymentHistory: GetPaymentResponse[];
// }
//
// interface OverallTotals {
//     given: number;
//     received: number;
//     online: number;
// }
//
// export const SupplierListReportPdf = () => {
//     const navigate = useNavigate();
//     // const location = useLocation();
//     const reportRef = useRef<HTMLDivElement>(null);
//     // const [printLogo, setPrintLogo] = useState(false);
//     const [suppliers, setSuppliers] = useState<SupplierWithBalance[]>([]);
//     const [overallTotals, setOverallTotals] = useState<OverallTotals>({ given: 0, received: 0, online: 0 });
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState<string | null>(null);
//     const [generatingPdf, setGeneratingPdf] = useState(false);
//     const companyName = localStorage.getItem('companyName') || 'Admin';
//
//     useEffect(() => {
//         const fetchSuppliers = async () => {
//             try {
//                 const data = await getSuppliers();
//                 const suppliersWithBalance = await Promise.all(
//                     data.map(async (supplier) => {
//                         try {
//                             const paymentHistory = await getPaymentList({
//                                 paymentParty: 'SUPPLIER',
//                                 partyId: supplier.id
//                             });
//                             const balance = paymentHistory.reduce((acc, payment) => {
//                                 if (payment.paymentCategory === 'RECEIVED') {
//                                     return acc + payment.amount;
//                                 } else {
//                                     return acc - payment.amount;
//                                 }
//                             }, 0);
//                             return { ...supplier, balance, paymentHistory };
//                         } catch (error) {
//                             console.error(`Error fetching payment history for supplier ${supplier.id}:`, error);
//                             return { ...supplier, balance: 0, paymentHistory: [] };
//                         }
//                     })
//                 );
//                 setSuppliers(suppliersWithBalance);
//
//                 // Calculate overall totals
//                 const totals = suppliersWithBalance.reduce((acc, supplier) => {
//                     const supplierTotals = supplier.paymentHistory.reduce((supplierAcc, payment) => {
//                         if (payment.paymentCategory === 'GIVEN') {
//                             supplierAcc.given += payment.amount;
//                         } else if (payment.paymentCategory === 'RECEIVED') {
//                             supplierAcc.received += payment.amount;
//                         }
//                         return supplierAcc;
//                     }, { given: 0, received: 0 });
//
//                     acc.given += supplierTotals.given;
//                     acc.received += supplierTotals.received;
//                     return acc;
//                 }, { given: 0, received: 0, online: 0 });
//
//                 setOverallTotals(totals);
//             } catch (error) {
//                 console.error('Error fetching suppliers:', error);
//                 setError('Failed to load suppliers data');
//             } finally {
//                 setLoading(false);
//             }
//         };
//
//         fetchSuppliers();
//     }, []);
//
//     const handleBack = () => {
//         navigate('/parties/suppliers');
//     };
//
//     const handleGeneratePdf = async () => {
//         if (!reportRef.current) return;
//
//         setGeneratingPdf(true);
//         try {
//             // Convert the report content to canvas
//             const canvas = await html2canvas(reportRef.current, {
//                 scale: 2,
//                 useCORS: true,
//                 allowTaint: true,
//                 backgroundColor: '#ffffff'
//             });
//
//             // Convert canvas to image data
//             const imgData = canvas.toDataURL('image/png');
//
//             // Create PDF
//             const pdf = new jsPDF('p', 'mm', 'a4');
//             const imgWidth = 210; // A4 width in mm
//             const pageHeight = 295; // A4 height in mm
//             const imgHeight = (canvas.height * imgWidth) / canvas.width;
//             let heightLeft = imgHeight;
//
//             let position = 0;
//
//             // Add first page
//             pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
//             heightLeft -= pageHeight;
//
//             // Add additional pages if content is longer than one page
//             while (heightLeft >= 0) {
//                 position = heightLeft - imgHeight;
//                 pdf.addPage();
//                 pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
//                 heightLeft -= pageHeight;
//             }
//
//             // Generate filename with current date
//             const currentDate = new Date().toISOString().split('T')[0];
//             const filename = `Supplier_Report_${companyName}_${currentDate}.pdf`;
//
//             // Download the PDF
//             pdf.save(filename);
//
//         } catch (error) {
//             console.error('Error generating PDF:', error);
//             alert('Error generating PDF. Please try again.');
//         } finally {
//             setGeneratingPdf(false);
//         }
//     };
//
//     // Calculate totals using the same logic as Customers page
//     const totalGave = overallTotals.given - overallTotals.received < 0 ? 0 : overallTotals.given - overallTotals.received;
//     const totalReceived = overallTotals.received - overallTotals.given < 0 ? 0 : overallTotals.received - overallTotals.given;
//     const netBalance = totalReceived - totalGave;
//
//     if (loading) {
//         return (
//             <div className="customer-report-container">
//                 <Sidebar />
//                 <main className="customer-report-main-content">
//                     <div className="customer-report-content-container">
//                         <div className="customer-report-loading">
//                             <i className="bi bi-arrow-clockwise spin"></i>
//                             Loading report data...
//                         </div>
//                     </div>
//                 </main>
//             </div>
//         );
//     }
//
//     if (error) {
//         return (
//             <div className="customer-report-container">
//                 <Sidebar />
//                 <main className="customer-report-main-content">
//                     <div className="customer-report-content-container">
//                         <div className="customer-report-error">
//                             <i className="bi bi-exclamation-triangle-fill"></i>
//                             {error}
//                         </div>
//                     </div>
//                 </main>
//             </div>
//         );
//     }
//
//     return (
//         <div className="customer-report-container">
//             <Sidebar />
//
//             <main className="customer-report-main-content">
//                 <div className="customer-report-content-container">
//                     <div className="customer-report-button-container">
//                         <button
//                             onClick={handleBack}
//                             className="customer-report-back-button"
//                         >
//                             <i className="bi bi-arrow-left"></i>
//                             Back
//                         </button>
//                         <button
//                             onClick={handleGeneratePdf}
//                             className="customer-report-generate-button"
//                             disabled={generatingPdf}
//                         >
//                             <i className={`bi ${generatingPdf ? 'bi-arrow-clockwise spin' : 'bi-file-earmark-pdf'}`}></i>
//                             {generatingPdf ? 'Generating...' : 'Generate PDF'}
//                         </button>
//                     </div>
//
//                     <div className="customer-report-logo-section">
//                         <div className="customer-report-logo-container">
//                             {/* <div className="customer-report-logo-image">
//                                 <i className="bi bi-building"></i>
//                             </div> */}
//                             <div className="customer-report-company-name">{companyName}</div>
//                         </div>
//                         <div className="customer-report-print-option">
//                             {/* <input
//                                 type="checkbox"
//                                 id="printLogo"
//                                 checked={printLogo}
//                                 onChange={() => setPrintLogo(!printLogo)}
//                             /> */}
//                             <label htmlFor="printLogo">
//                                 {/* <i className="bi bi-printer me-1"></i> */}
//                                 <img
//                                     src={logo}
//                                     alt="logo"
//                                     style={{
//                                         width: "110px",
//                                         height: "110px",
//                                         objectFit: "contain"
//                                     }}
//                                 />
//                             </label>
//                         </div>
//                     </div>
//
//                     <div ref={reportRef} className="customer-report-content">
//                         <h1 className="customer-report-title">
//                             <i className="bi bi-people-fill me-2"></i>
//                             Supplier List Report
//                         </h1>
//                     <p className="customer-report-date">
//                         <i className="bi bi-calendar-event me-1"></i>
//                         (generated: {new Date().toLocaleDateString()})
//                     </p>
//
//                     <div className="customer-report-summary-section">
//                         <div className="customer-report-summary-item">
//                             <p className="customer-report-summary-item-title">
//                                 <i className="bi bi-arrow-up-circle me-1"></i>
//                                 You Gave
//                             </p>
//                             <p className={`customer-report-summary-item-value customer-report-gave-value`}>
//                                 रू {totalGave.toLocaleString()}
//                             </p>
//                         </div>
//                         <div className="customer-report-summary-divider"></div>
//                         <div className="customer-report-summary-item">
//                             <p className="customer-report-summary-item-title">
//                                 <i className="bi bi-arrow-down-circle me-1"></i>
//                                 You Received
//                             </p>
//                             <p className={`customer-report-summary-item-value customer-report-received-value`}>
//                                 रू {totalReceived.toLocaleString()}
//                             </p>
//                         </div>
//                         <div className="customer-report-summary-divider"></div>
//                         <div className="customer-report-summary-item">
//                             <p className="customer-report-summary-item-title">
//                                 <i className="bi bi-calculator me-1"></i>
//                                 Net Balance
//                             </p>
//                             <p className={`customer-report-summary-item-value customer-report-net-value`}>
//                                 रू {netBalance.toLocaleString()}
//                             </p>
//                         </div>
//                     </div>
//
//                     <div className="customer-report-customer-count">
//                         <i className="bi bi-people me-1"></i>
//                         No of Supplier: {suppliers.length} (All)
//                     </div>
//
//                     <div className="customer-report-table-container">
//                         <table className="customer-report-table">
//                             <thead>
//                                 <tr>
//                                     <th className="customer-report-table-header">
//                                         <i className="bi bi-person me-1"></i>
//                                         Name
//                                     </th>
//                                     <th className="customer-report-table-header">
//                                         <i className="bi bi-telephone me-1"></i>
//                                         Phone
//                                     </th>
//                                     <th className="customer-report-table-header">
//                                         <i className="bi bi-arrow-up-circle me-1"></i>
//                                         You Gave
//                                     </th>
//                                     <th className="customer-report-table-header">
//                                         <i className="bi bi-arrow-down-circle me-1"></i>
//                                         You Received
//                                     </th>
//                                     <th className="customer-report-table-header">
//                                         <i className="bi bi-calculator me-1"></i>
//                                         Balance
//                                     </th>
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 {suppliers.map((supplier) => (
//                                     <tr key={supplier.id}>
//                                         <td className="customer-report-table-cell">{supplier.supplier.name}</td>
//                                         <td className="customer-report-table-cell">{supplier.supplier.name}</td>
//                                         <td className={`customer-report-table-cell customer-report-gave-cell`}>
//                                             {supplier.balance < 0 ? `रू ${Math.abs(supplier.balance).toLocaleString()}` : ""}
//                                         </td>
//                                         <td className={`customer-report-table-cell customer-report-received-cell`}>
//                                             {supplier.balance > 0 ? `रू ${supplier.balance.toLocaleString()}` : ""}
//                                         </td>
//                                         <td className="customer-report-table-cell">
//                                             {supplier.balance !== 0 ? `रू ${Math.abs(supplier.balance).toLocaleString()}` : "Settled"}
//                                         </td>
//                                     </tr>
//                                 ))}
//                             </tbody>
//                         </table>
//                     </div>
//
//                         <div className="customer-report-footer">
//                             <i className="bi bi-info-circle me-1"></i>
//                             Company Details and Helpline Number
//                         </div>
//                     </div>
//                 </div>
//             </main>
//         </div>
//     );
// };


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
                            onClick={handleBack}
                            className="customer-report-back-button"
                        >
                            <i className="bi bi-arrow-left"></i>
                            Back
                        </button>

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
                                    {totalGave.toLocaleString()}
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
                                    {totalReceived.toLocaleString()}
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
                                    {netBalance.toLocaleString()}
                                </p>
                            </div>

                        </div>

                        {/* Supplier Count */}
                        <div className="customer-report-customer-count">
                            <i className="bi bi-people me-1"></i>

                            No of Supplier:{" "}
                            {suppliers.length} (All)
                        </div>

                        {/* Supplier Table */}
                        <div className="customer-report-table-container">

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
                                                        ? `रू ${Math.abs(
    supplier.balance
).toLocaleString()}`
                                                        : ""}
                                                </td>

                                                {/* Received */}
                                                <td className="customer-report-table-cell customer-report-received-cell">
                                                    {supplier.balance >
                                                    0
                                                        ? `रू ${supplier.balance.toLocaleString()}`
                                                        : ""}
                                                </td>

                                                {/* Balance */}
                                                <td className="customer-report-table-cell">
                                                    {supplier.balance !==
                                                    0
                                                        ? `रू ${Math.abs(
    supplier.balance
).toLocaleString()}`
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