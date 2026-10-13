import { InvoiceModalData } from '../components/InvoiceModal';
import { ReportModalData } from '../components/ReportPdfModal';

export const printHtmlContent = (htmlContent: string, title: string = 'Invoice') => {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.title = title;
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) return;

    doc.open();
    doc.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>${title}</title>
            <style>
                @page {
                    size: A4 portrait;
                    margin: 12mm 15mm;
                }
                * {
                    box-sizing: border-box;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }
                body {
                    margin: 0;
                    padding: 0;
                    background: #ffffff !important;
                    color: #1e293b;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                    font-size: 13px;
                }
                .invoice-paper-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    border-bottom: 2px solid #0f172a;
                    padding-bottom: 16px;
                    margin-bottom: 20px;
                }
                .invoice-brand h1 {
                    font-size: 22px;
                    font-weight: 800;
                    color: #0b192c;
                    margin: 0;
                }
                .invoice-brand p {
                    font-size: 12px;
                    color: #64748b;
                    margin: 3px 0 0 0;
                }
                .invoice-type-banner {
                    text-align: right;
                }
                .invoice-type-banner h2 {
                    font-size: 20px;
                    font-weight: 800;
                    color: #021861;
                    margin: 0;
                }
                .invoice-type-banner .num {
                    font-size: 13px;
                    font-weight: 700;
                    color: #255dce;
                    margin-top: 4px;
                }
                .invoice-meta-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 16px;
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 6px;
                    padding: 14px 18px;
                    margin-bottom: 20px;
                }
                .invoice-party-col h4 {
                    font-size: 11px;
                    font-weight: 700;
                    text-transform: uppercase;
                    color: #64748b;
                    margin: 0 0 6px 0;
                }
                .invoice-party-name {
                    font-size: 15px;
                    font-weight: 700;
                    color: #0f172a;
                    margin-bottom: 4px;
                }
                .invoice-party-detail {
                    font-size: 12px;
                    color: #475569;
                    margin: 2px 0;
                }
                .invoice-dates-col {
                    display: flex;
                    flex-direction: column;
                    gap: 5px;
                    text-align: right;
                }
                .invoice-info-row {
                    display: flex;
                    justify-content: flex-end;
                    gap: 10px;
                    font-size: 12px;
                }
                .invoice-info-label {
                    color: #64748b;
                }
                .invoice-info-val {
                    color: #0f172a;
                    font-weight: 700;
                }
                .badge-paid {
                    background: #dcfce7;
                    color: #15803d;
                    padding: 1px 6px;
                    border-radius: 4px;
                    font-size: 10px;
                    font-weight: 700;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 20px;
                }
                th {
                    background: #0f172a;
                    color: #ffffff;
                    font-size: 11px;
                    text-transform: uppercase;
                    padding: 9px 10px;
                    text-align: left;
                }
                td {
                    padding: 10px;
                    font-size: 12px;
                    border-bottom: 1px solid #e2e8f0;
                }
                tbody tr:nth-child(even) {
                    background: #f8fafc;
                }
                .text-end { text-align: right; }
                .text-center { text-align: center; }
                .fw-bold { font-weight: 700; }
                .invoice-bottom-grid {
                    display: grid;
                    grid-template-columns: 1.2fr 1fr;
                    gap: 20px;
                    margin-bottom: 24px;
                }
                .notes-box {
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 6px;
                    padding: 12px 14px;
                    font-size: 11px;
                    color: #475569;
                    line-height: 1.5;
                }
                .notes-box h5 {
                    margin: 0 0 4px 0;
                    font-size: 11px;
                    text-transform: uppercase;
                    color: #64748b;
                }
                .totals-box {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }
                .total-line {
                    display: flex;
                    justify-content: space-between;
                    font-size: 12px;
                    color: #475569;
                }
                .total-line.grand {
                    border-top: 2px solid #0f172a;
                    padding-top: 8px;
                    margin-top: 4px;
                    font-size: 16px;
                    font-weight: 800;
                    color: #0b192c;
                }
                .total-line.grand .val {
                    color: #255dce;
                }
                .signatures {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 35px;
                    padding-top: 12px;
                    border-top: 1px dashed #cbd5e1;
                }
                .sig-box {
                    text-align: center;
                    width: 160px;
                }
                .sig-line {
                    border-bottom: 1px solid #94a3b8;
                    height: 30px;
                    margin-bottom: 4px;
                }
                .sig-title {
                    font-size: 11px;
                    color: #64748b;
                    font-weight: 600;
                    text-transform: uppercase;
                }
                .report-kpis {
                    display: flex;
                    justify-content: space-between;
                    background: #f1f5f9;
                    border: 1px solid #e2e8f0;
                    border-radius: 6px;
                    padding: 12px 16px;
                    margin-bottom: 20px;
                }
                .report-kpi {
                    display: flex;
                    flex-direction: column;
                }
                .report-kpi span:first-child {
                    font-size: 10px;
                    font-weight: 700;
                    text-transform: uppercase;
                    color: #64748b;
                }
                .report-kpi span:last-child {
                    font-size: 15px;
                    font-weight: 800;
                    color: #0f172a;
                }
                .disclaimer {
                    text-align: center;
                    font-size: 10px;
                    color: #94a3b8;
                    margin-top: 20px;
                }
            </style>
        </head>
        <body>
            ${htmlContent}
        </body>
        </html>
    `);
    doc.close();

    setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        setTimeout(() => {
            if (document.body.contains(iframe)) {
                document.body.removeChild(iframe);
            }
        }, 2000);
    }, 250);
};

export const printInvoiceDirectly = (data: InvoiceModalData) => {
    const companyName =
        localStorage.getItem('organizationName') ||
        localStorage.getItem('companyName') ||
        'Point of Sale Store';

    const isPurchase = data.type === 'PURCHASE';
    const formattedDate = data.date
        ? new Date(data.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
          })
        : new Date().toLocaleDateString();

    const rowsHtml = data.items
        .map((item, idx) => {
            const hasTax = (item.taxPercentage || 0) > 0 || (item.vatPercentage || 0) > 0;
            const totalTax = (Number(item.taxPercentage) || 0) + (Number(item.vatPercentage) || 0);

            return `
                <tr>
                    <td class="text-center">${idx + 1}</td>
                    <td>
                        <div class="fw-bold">${item.name}</div>
                        <div style="font-size: 11px; color: #64748b;">${item.category || 'General'}</div>
                    </td>
                    <td class="text-center">${item.quantity}</td>
                    <td class="text-end">${(item.unitPrice || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td class="text-center">${hasTax ? totalTax + '%' : '-'}</td>
                    <td class="text-end fw-bold">${(item.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                </tr>
            `;
        })
        .join('');

    const html = `
        <div class="invoice-paper-header">
            <div class="invoice-brand">
                <h1>${companyName}</h1>
                <p>Point of Sale & Inventory Billing System</p>
            </div>
            <div class="invoice-type-banner">
                <h2>${isPurchase ? 'PURCHASE INVOICE' : 'TAX INVOICE'}</h2>
                <div class="num">#${data.invoiceNumber || 'N/A'}</div>
            </div>
        </div>

        <div class="invoice-meta-grid">
            <div class="invoice-party-col">
                <h4>${isPurchase ? 'Vendor / Supplier Information' : 'Customer Information'}</h4>
                <div class="invoice-party-name">${data.partyName || (isPurchase ? 'Standard Vendor' : 'Walk-in Customer')}</div>
                <div class="invoice-party-detail">Type: ${data.partyType || (isPurchase ? 'Vendor' : 'Direct Buyer')}</div>
                ${data.remarks ? `<div class="invoice-party-detail">Notes: ${data.remarks}</div>` : ''}
            </div>
            <div class="invoice-dates-col">
                <div class="invoice-info-row">
                    <span class="invoice-info-label">Invoice Date:</span>
                    <span class="invoice-info-val">${formattedDate}</span>
                </div>
                <div class="invoice-info-row">
                    <span class="invoice-info-label">Payment Mode:</span>
                    <span class="invoice-info-val" style="text-transform: uppercase;">${data.paymentMode || 'CASH'}</span>
                </div>
                <div class="invoice-info-row">
                    <span class="invoice-info-label">Payment Status:</span>
                    <span class="badge-paid">PAID / SETTLED</span>
                </div>
                ${data.createdBy ? `
                <div class="invoice-info-row">
                    <span class="invoice-info-label">Issued By:</span>
                    <span class="invoice-info-val">${data.createdBy}</span>
                </div>` : ''}
            </div>
        </div>

        <table>
            <thead>
                <tr>
                    <th style="width: 35px;" class="text-center">#</th>
                    <th>Description</th>
                    <th style="width: 60px;" class="text-center">Qty</th>
                    <th style="width: 100px;" class="text-end">Rate (Rs.)</th>
                    <th style="width: 70px;" class="text-center">Tax %</th>
                    <th style="width: 110px;" class="text-end">Amount (Rs.)</th>
                </tr>
            </thead>
            <tbody>
                ${rowsHtml}
            </tbody>
        </table>

        <div class="invoice-bottom-grid">
            <div class="notes-box">
                <h5>Terms & Conditions</h5>
                <div>1. Computer-generated invoice, valid without signature.</div>
                <div>2. Goods received/sold as per standards.</div>
                <div>3. Thank you for your business!</div>
            </div>
            <div class="totals-box">
                <div class="total-line">
                    <span>Subtotal:</span>
                    <span>Rs. ${(data.subtotal || data.grandTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                ${(data.taxTotal || 0) > 0 ? `
                <div class="total-line">
                    <span>Applicable Tax & VAT:</span>
                    <span>Rs. ${(data.taxTotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>` : ''}
                <div class="total-line grand">
                    <span>Grand Total:</span>
                    <span class="val">Rs. ${(data.grandTotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
            </div>
        </div>

        <div class="signatures">
            <div class="sig-box">
                <div class="sig-line"></div>
                <div class="sig-title">${isPurchase ? 'Vendor Signature' : 'Customer Signature'}</div>
            </div>
            <div class="sig-box">
                <div class="sig-line"></div>
                <div class="sig-title">Authorized Signatory</div>
            </div>
        </div>

        <div class="disclaimer">
            System Generated Document | POS & Accounting Core | Date: ${new Date().toLocaleDateString()}
        </div>
    `;

    printHtmlContent(html, `${isPurchase ? 'Purchase_Invoice' : 'Sales_Invoice'}_${data.invoiceNumber || 'bill'}`);
};

export const printReportDirectly = (data: ReportModalData) => {
    const companyName =
        localStorage.getItem('organizationName') ||
        localStorage.getItem('companyName') ||
        'Point of Sale Store';

    const isPurchase = data.reportType === 'PURCHASE';
    const avg = data.totalCount > 0 ? data.totalAmount / data.totalCount : 0;

    const rowsHtml = data.rows
        .map(
            (row, idx) => `
            <tr>
                <td class="text-center">${idx + 1}</td>
                <td class="fw-bold" style="color: #255dce;">${row.number}</td>
                <td>${row.date ? new Date(row.date).toLocaleDateString() : 'N/A'}</td>
                <td>${row.party}</td>
                <td>${row.itemsSummary}</td>
                <td>${row.paymentMode}</td>
                <td class="text-end fw-bold">Rs. ${row.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            </tr>
        `
        )
        .join('');

    const html = `
        <div class="invoice-paper-header">
            <div class="invoice-brand">
                <h1>${companyName}</h1>
                <p>Executive Financial & Inventory Statements</p>
            </div>
            <div class="invoice-type-banner">
                <h2>${data.title}</h2>
                <div class="num">Date: ${new Date().toLocaleDateString()}</div>
            </div>
        </div>

        <div class="report-kpis">
            <div class="report-kpi">
                <span>${isPurchase ? 'Total Purchase Spend' : 'Total Sales Revenue'}</span>
                <span style="color: #255dce;">Rs. ${data.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div class="report-kpi">
                <span>Total Transactions</span>
                <span>${data.totalCount} Bills</span>
            </div>
            <div class="report-kpi">
                <span>Average Bill Size</span>
                <span>Rs. ${avg.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
        </div>

        <table>
            <thead>
                <tr>
                    <th style="width: 35px;" class="text-center">#</th>
                    <th style="width: 130px;">Bill #</th>
                    <th style="width: 90px;">Date</th>
                    <th style="width: 140px;">${isPurchase ? 'Vendor' : 'Customer'}</th>
                    <th>Details / Items</th>
                    <th style="width: 90px;">Mode</th>
                    <th style="width: 120px;" class="text-end">Amount (Rs.)</th>
                </tr>
            </thead>
            <tbody>
                ${rowsHtml}
            </tbody>
        </table>

        <div class="total-line grand" style="background: #f8fafc; padding: 10px 14px; border-radius: 6px;">
            <span>Grand Total Summary:</span>
            <span class="val">Rs. ${data.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
        </div>

        <div class="disclaimer">
            Official Statement Report | Generated by ${companyName} POS Core | ${new Date().toLocaleString()}
        </div>
    `;

    printHtmlContent(html, `${isPurchase ? 'Purchase_Report' : 'Sales_Report'}_${new Date().toISOString().split('T')[0]}`);
};
