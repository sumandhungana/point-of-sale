// "use client"
//
// import { useState, useEffect, useRef } from 'react';
// import { Sidebar } from '@/components/Sidebar';
// import { useNavigate, useLocation } from 'react-router-dom';
// import { getCustomers, Customer } from '@/services/customerService';
// import {CustomerData, GetPaymentResponse} from '@/features/services/paymentService';
// import jsPDF from 'jspdf';
// import html2canvas from 'html2canvas';
// import '../../../styles/CustomerListReportPdf.css';
// import logo from '../../../assets/logo.png';
//
// interface CustomerWithBalance extends Customer {
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
// export const CustomerListReportPdf = () => {
//     const navigate = useNavigate();
//     const location = useLocation();
//     const reportRef = useRef<HTMLDivElement>(null);
//     const [printLogo, setPrintLogo] = useState(false);
//     const [customers, setCustomers] = useState<CustomerWithBalance[]>([]);
//     const [overallTotals, setOverallTotals] = useState<OverallTotals>({ given: 0, received: 0, online: 0 });
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState<string | null>(null);
//     const [generatingPdf, setGeneratingPdf] = useState(false);
//     const companyName = localStorage.getItem('companyName') || 'Admin';
//
//     useEffect(() => {
//         const fetchCustomers = async () => {
//             try {
//                 const data = await getCustomers();
//                 const customersWithBalance = await Promise.all(
//                     data.map(async (customer) => {
//                         try {
//                             const paymentHistory = await getPaymentHistory(customer.id);
//                             const balance = paymentHistory.reduce((acc, payment) => {
//                                 if (payment.type === 'Received') {
//                                     return acc + payment.amount;
//                                 } else {
//                                     return acc - payment.amount;
//                                 }
//                             }, 0);
//                             return { ...customer, balance, paymentHistory };
//                         } catch (err) {
//                             console.error(`Failed to fetch payment history for customer ${customer.id}:`, err);
//                             return { ...customer, balance: 0, paymentHistory: [] };
//                         }
//                     })
//                 );
//                 setCustomers(customersWithBalance);
//
//                 // Calculate overall totals using the same logic as Customers page
//                 const totals = customersWithBalance.reduce((acc, customer) => {
//                     customer.paymentHistory.forEach(payment => {
//                         if (payment.type === 'Given') {
//                             acc.given += Math.abs(payment.oldBalance - payment.newBalance);
//                         } else if (payment.type === 'Received') {
//                             acc.received += Math.abs(payment.oldBalance - payment.newBalance);
//                         }
//                     });
//                     return acc;
//                 }, { given: 0, received: 0, online: 0 });
//
//                 setOverallTotals(totals);
//                 setLoading(false);
//             } catch (err) {
//                 setError('Failed to load customers');
//                 setLoading(false);
//             }
//         };
//
//         fetchCustomers();
//     }, []);
//
//     const handleBack = () => {
//         navigate('/parties/customers');
//     };
//
//     const handleGeneratePdf = async () => {
//         if (!reportRef.current) return;
//
//         setGeneratingPdf(true);
//         try {
//             // Create canvas from the report content
//             const canvas = await html2canvas(reportRef.current, {
//                 scale: 2,
//                 useCORS: true,
//                 allowTaint: true,
//                 backgroundColor: '#ffffff'
//             });
//
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
//             const filename = `Customer_Report_${companyName}_${currentDate}.pdf`;
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
//     // const totalGave = overallTotals.given
//     // const totalReceived = overallTotals.received
//
//     // const totalGave = overallTotals.given - overallTotals.received < 0 ? 0 : overallTotals.given - overallTotals.received;
//     // const totalReceived = overallTotals.received - overallTotals.given < 0 ? 0 : overallTotals.received - overallTotals.given;
//     // const netBalance = totalReceived - totalGave;
//
//
//     const tableTotals = customers.reduce(
//         (acc, customer) => {
//             if (customer.balance < 0) {
//                 acc.given += Math.abs(customer.balance);
//             } else if (customer.balance > 0) {
//                 acc.received += customer.balance;
//             }
//             return acc;
//         },
//         { given: 0, received: 0 }
//     );
//
//     const tableNetBalance = tableTotals.received - tableTotals.given;
//     const totalGave = tableTotals.given;
//     const totalReceived = tableTotals.received;
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
//                             Customer Ledger Report
//                         </h1>
//                         <p className="customer-report-date">
//                             <i className="bi bi-calendar-event me-1"></i>
//                             (Generated On: {new Date().toLocaleDateString()})
//                         </p>
//
//                         <div className="customer-report-summary-section">
//                             <div className="customer-report-summary-item">
//                                 <p className="customer-report-summary-item-title-gave">
//                                     <i className="bi bi-arrow-up-circle me-1"></i>
//                                     You Gave
//                                 </p>
//                                 <p className={`customer-report-summary-item-value customer-report-gave-value`}>
//                                     रू {totalGave.toLocaleString()}
//                                 </p>
//                             </div>
//                             <div className="customer-report-summary-divider"></div>
//                             <div className="customer-report-summary-item">
//                                 <p className="customer-report-summary-item-title-received">
//                                     <i className="bi bi-arrow-down-circle me-1"></i>
//                                     You Received
//                                 </p>
//                                 <p className={`customer-report-summary-item-value customer-report-received-value`}>
//                                     रू {totalReceived.toLocaleString()}
//                                 </p>
//                             </div>
//                             <div className="customer-report-summary-divider"></div>
//                             <div className="customer-report-summary-item">
//                                 <p className="customer-report-summary-item-title">
//                                     <i className="bi bi-calculator me-1"></i>
//                                     Net Balance
//                                 </p>
//                                 <p className={`customer-report-summary-item-value customer-report-net-value`}>
//                                     रू {netBalance.toLocaleString()}
//                                 </p>
//                             </div>
//                         </div>
//
//                         <div className="customer-report-customer-count">
//                             <i className="bi bi-people me-1"></i>
//                             Total Customers: {customers.length}
//                         </div>
//
//
//                         <div className="customer-report-table-container">
//                             <table className="customer-report-table">
//                                 <thead>
//                                     <tr>
//                                         <th className="customer-report-table-header-name">
//                                             <i className="bi bi-person me-1"></i>
//                                             Name
//                                         </th>
//                                         <th className="customer-report-table-header-phone">
//                                             <i className="bi bi-telephone me-1"></i>
//                                             Phone
//                                         </th>
//                                         <th className="customer-report-table-header-gave">
//                                             <i className="bi bi-arrow-up-circle me-1"></i>
//                                             You Gave
//                                         </th>
//                                         <th className="customer-report-table-header-received">
//                                             <i className="bi bi-arrow-down-circle me-1"></i>
//                                             You Received
//                                         </th>
//                                         <th className="customer-report-table-header-collection-date">
//                                             <i className="bi bi-calculator me-1"></i>
//                                             Collection Date
//                                         </th>
//                                     </tr>
//                                 </thead>
//                                 <tbody>
//                                     {customers.map((customer) => (
//                                         <tr key={customer.id}>
//                                             <td className="customer-report-table-cell customer-report-name-cell">{customer.name}</td>
//                                             <td className="customer-report-table-cell customer-report-phone-cell">{customer.phone}</td>
//                                             <td className={`customer-report-table-cell customer-report-gave-cell`}>
//                                                 {customer.balance < 0 ? `रू ${Math.abs(customer.balance).toLocaleString()}` : ""}
//                                             </td>
//                                             <td className={`customer-report-table-cell customer-report-received-cell`}>
//                                                 {customer.balance > 0 ? `रू ${customer.balance.toLocaleString()}` : ""}
//                                             </td>
//                                             <td className="customer-report-table-cell customer-report-collection-cell">
//                                                 {customer.paymentDateReminder
//                                                     ? customer.paymentDateReminder.split("T")[0]
//                                                     : "-"}
//
//                                             </td>
//                                         </tr>
//
//                                     ))}
//
//                                 </tbody>
//                                 <tfoot>
//                                     <tr className="customer-report-total-row">
//                                         <td colSpan={2}>
//                                             <strong >Grand Total</strong>
//                                         </td>
//
//                                         <td className="customer-report-gave-cell" style={{ paddingLeft: "12px" }}>
//                                             <strong>रू {tableTotals.given.toLocaleString()}</strong>
//                                         </td>
//
//                                         <td className="customer-report-received-cell" style={{ paddingLeft: "12px" }}>
//                                             <strong>रू {tableTotals.received.toLocaleString()}</strong>
//                                         </td>
//
//                                         <td className="customer-report-table-cell customer-report-collection-cell">
//                                             {/* <strong>रू {tableNetBalance.toLocaleString()}</strong> */}
//                                         </td>
//                                     </tr>
//                                 </tfoot>
//                             </table>
//                         </div>
//
//
//                         <div className="customer-report-footer">
//                             <i className="bi bi-info-circle me-1"></i>
//                             Company Details and Helpline Number
//                         </div>
//
//                     </div>
//                 </div>
//             </main>
//         </div>
//     );
// };
//

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
                backgroundColor: '#ffffff'
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
                            <i className={`bi ${generatingPdf ? 'bi-arrow-clockwise spin' : 'bi-file-earmark-pdf'}`}></i>
                            {generatingPdf ? 'Generating...' : 'Generate PDF'}
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
                                    रू {totalGave.toLocaleString()}
                                </p>
                            </div>
                            <div className="customer-report-summary-divider"></div>
                            <div className="customer-report-summary-item">
                                <p className="customer-report-summary-item-title-received">
                                    <i className="bi bi-arrow-down-circle me-1"></i>
                                    You Received
                                </p>
                                <p className={`customer-report-summary-item-value customer-report-received-value`}>
                                    रू {totalReceived.toLocaleString()}
                                </p>
                            </div>
                            <div className="customer-report-summary-divider"></div>
                            <div className="customer-report-summary-item">
                                <p className="customer-report-summary-item-title">
                                    <i className="bi bi-calculator me-1"></i>
                                    Net Balance
                                </p>
                                <p className={`customer-report-summary-item-value customer-report-net-value`}>
                                    रू {netBalance.toLocaleString()}
                                </p>
                            </div>
                        </div>

                        <div className="customer-report-customer-count">
                            <i className="bi bi-people me-1"></i>
                            Total Customers: {customers.length}
                        </div>

                        <div className="customer-report-table-container">
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
                                            {customer.balance < 0 ? `रू ${Math.abs(customer.balance).toLocaleString()}` : ""}
                                        </td>
                                        <td className={`customer-report-table-cell customer-report-received-cell`}>
                                            {customer.balance > 0 ? `रू ${customer.balance.toLocaleString()}` : ""}
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
                                        <strong>रू {tableTotals.given.toLocaleString()}</strong>
                                    </td>
                                    <td className="customer-report-received-cell" style={{ paddingLeft: "12px" }}>
                                        <strong>रू {tableTotals.received.toLocaleString()}</strong>
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