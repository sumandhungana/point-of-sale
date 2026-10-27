import React, {useEffect, useMemo, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {Sidebar} from '@/components/Sidebar';
import Navbar from '../../../components/Navbar';
import {AddPurchaseBillRequest, fetchPurchaseBillNumber, savePurchase} from '../../services/purchaseBillService'
import {getSuppliers} from '@/features/services/supplierService';
import '../../../styles/AddPurchase.css';
import '../../../styles/AddSalesBill.css';
import {getProduct, Item} from '../../services/productService';
import { useAppSettings } from '@/context/AppSettingsContext';

interface Supplier {
    id: number;
    name: string;
    phone?: string;
}

interface PurchaseLineItem {
    itemId: number;
    name: string;
    categoryName: string;
    unit?: string;
    stockUnit?: string;
    availableStock?: number;
    sku?: string;
    quantity: number | string;
    enteredAmount: number | string;
    unitPrice: number;
    taxAmount: number;
    vatAmount: number;
    totalPrice: number;
}

const QUANTITY_UNITS = [
    { value: 'pcs', label: 'Pcs (Pieces)' },
    { value: 'kg', label: 'kg (Kilograms)' },
    { value: 'g', label: 'g (Grams)' },
    { value: 'l', label: 'L (Liters)' },
    { value: 'ml', label: 'ml (Milliliters)' },
    { value: 'box', label: 'Box' },
    { value: 'packet', label: 'Packet' },
    { value: 'dozen', label: 'Dozen' },
    { value: 'meter', label: 'Meter' },
    { value: 'bag', label: 'Bag' },
    { value: 'bundle', label: 'Bundle' },
    { value: 'carton', label: 'Carton' },
    { value: 'roll', label: 'Roll' },
    { value: 'set', label: 'Set' },
    { value: 'pair', label: 'Pair' },
    { value: 'sq.ft', label: 'Sq. Ft' },
    { value: 'other', label: 'Other...' },
];


export const AddPurchase: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { formatCurrency, formatNumber, settings } = useAppSettings();
    const currencySymbol = settings.currency || 'Rs. ';
    const initialData = location.state?.purchase;
    const isEditMode = !!initialData;

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Master Data
    const [items, setItems] = useState<Item[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);

    // Form State
    const [purchaseNo, setPurchaseNo] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [paymentMode, setPaymentMode] = useState('cash');
    const [remarks, setRemarks] = useState('');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    // Global Calculation Settings (Applies to New Products)
    const [showGuideModal, setShowGuideModal] = useState(false);
    const [pricingMode, setPricingMode] = useState<'unit' | 'gross'>('unit');
    const [isTaxInclusive, setIsTaxInclusive] = useState(false);
    const [enableTax, setEnableTax] = useState(false);
    const [taxPercentage, setTaxPercentage] = useState<number | ''>('');
    const [enableVat, setEnableVat] = useState(true);
    const [vatPercentage, setVatPercentage] = useState<number | ''>(13);

    // Supplier Search Dropdown
    const [supplierSearch, setSupplierSearch] = useState('');
    const [showSupplierDropdown, setShowSupplierDropdown] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

    // Item Search & Purchase Basket
    const [itemSearch, setItemSearch] = useState('');
    const [showItemDropdown, setShowItemDropdown] = useState(false);
    const [lineItems, setLineItems] = useState<PurchaseLineItem[]>([]);
    const [showPdfModal, setShowPdfModal] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [itemsData, suppliersData] = await Promise.all([
                    getProduct(),
                    getSuppliers().catch(() => []),
                ]);

                setItems(itemsData?.items || []);
                setSuppliers(suppliersData || []);

                if (isEditMode && initialData) {
                    setPurchaseNo(initialData.purchaseNo);
                    setDate(initialData.date || initialData.billDate || new Date().toISOString().split('T')[0]);
                    setPaymentMode(initialData.paymentMode || 'cash');
                    setRemarks(initialData.remarks || '');
                    if (initialData.supplier) {
                        setSelectedSupplier(initialData.supplier);
                        setSupplierSearch(initialData.supplier.name);
                    }
                    if (initialData.items) {
                        setLineItems(
                            initialData.items.map((i: any) => ({
                                ...i,
                                unit: i.unit || 'pcs',
                                stockUnit: i.unit || 'pcs',
                                availableStock: i.availableStock ?? 0,
                                quantity: i.quantity ?? 1,
                                enteredAmount: i.enteredAmount ?? '',
                            }))
                        );
                    }
                    if (initialData.photoPath) {
                        setSelectedImage(initialData.photoPath);
                    }
                } else {
                    const billData = await fetchPurchaseBillNumber();
                    const lastNo = billData?.purchaseNo ?? '0';

                    setPurchaseNo(lastNo);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to initialize purchase form');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [isEditMode, initialData]);

    // Core Pricing & Tax Calculation Logic
    const computeLineItem = (quantity: number | string, enteredAmount: number | string) => {
        const numQty = typeof quantity === 'number' ? quantity : parseFloat(quantity);
        const qty = isNaN(numQty) || numQty <= 0 ? 0 : numQty;
        const numAmt = typeof enteredAmount === 'number' ? enteredAmount : parseFloat(enteredAmount);
        const amt = isNaN(numAmt) || numAmt < 0 ? 0 : numAmt;

        const activeTaxPct = enableTax && typeof taxPercentage === 'number' ? Math.max(0, taxPercentage) : 0;
        const activeVatPct = enableVat && typeof vatPercentage === 'number' ? Math.max(0, vatPercentage) : 0;
        const combinedRate = (activeTaxPct + activeVatPct) / 100;

        let subtotal = 0;
        let taxAmount = 0;
        let vatAmount = 0;
        let totalPrice = 0;
        let baseUnitPrice = 0;

        if (enteredAmount === '' || enteredAmount === undefined) {
            return {unitPrice: 0, taxAmount: 0, vatAmount: 0, totalPrice: 0};
        }

        const safeQty = qty > 0 ? qty : 1;

        if (pricingMode === 'gross') {
            if (isTaxInclusive) {
                totalPrice = amt;
                const baseGross = amt / (1 + combinedRate);
                taxAmount = baseGross * (activeTaxPct / 100);
                vatAmount = baseGross * (activeVatPct / 100);
                subtotal = baseGross;
            } else {
                subtotal = amt;
                taxAmount = subtotal * (activeTaxPct / 100);
                vatAmount = (subtotal + taxAmount) * (activeVatPct / 100);
                totalPrice = subtotal + taxAmount + vatAmount;
            }
            baseUnitPrice = subtotal / safeQty;
        } else {
            if (isTaxInclusive) {
                const unitBase = amt / (1 + combinedRate);
                baseUnitPrice = unitBase;
                subtotal = unitBase * qty;
                taxAmount = subtotal * (activeTaxPct / 100);
                vatAmount = subtotal * (activeVatPct / 100);
                totalPrice = amt * qty;
            } else {
                baseUnitPrice = amt;
                subtotal = amt * qty;
                taxAmount = subtotal * (activeTaxPct / 100);
                vatAmount = (subtotal + taxAmount) * (activeVatPct / 100);
                totalPrice = subtotal + taxAmount + vatAmount;
            }
        }

        return {
            unitPrice: Number(baseUnitPrice.toFixed(4)),
            taxAmount: Number(taxAmount.toFixed(2)),
            vatAmount: Number(vatAmount.toFixed(2)),
            totalPrice: Number(totalPrice.toFixed(2)),
        };
    };

    const handleSelectItem = (item: Item) => {
        setShowItemDropdown(false);
        setItemSearch('');

        const existingIndex = lineItems.findIndex((li) => li.itemId === item.id);
        if (existingIndex > -1) return;

        const defaultPrice = item.perUnitPurchasePrice || '';
        const computed = computeLineItem(1, defaultPrice);

        const newItem: PurchaseLineItem = {
            itemId: item.id,
            name: item.name,
            categoryName: item.category?.name || 'General',
            unit: item.unit || 'pcs',
            stockUnit: item.unit || 'pcs',
            availableStock: item.itemCount || 0,
            sku: (item as any).sku,
            quantity: 1,
            enteredAmount: defaultPrice,
            ...computed,
        };

        setLineItems((prev) => [...prev, newItem]);
    };

    // Quantity change with single-digit deletion support
    const handleQuantityChange = (idx: number, val: string) => {
        const sanitized = val.replace(/[^0-9.]/g, '');
        const parts = sanitized.split('.');
        const cleanVal = parts.length > 2 ? `${parts[0]}.${parts.slice(1).join('')}` : sanitized;

        setLineItems((prev) => {
            const updated = [...prev];
            const item = {...updated[idx], quantity: cleanVal};
            const computed = computeLineItem(cleanVal, item.enteredAmount);
            updated[idx] = {...item, ...computed};
            return updated;
        });
    };

    const handleQuantityBlur = (idx: number) => {
        setLineItems((prev) => {
            const updated = [...prev];
            const item = updated[idx];
            const num = parseFloat(String(item.quantity));
            const finalQty = isNaN(num) || num <= 0 ? 1 : num;
            const computed = computeLineItem(finalQty, item.enteredAmount);
            updated[idx] = {...item, quantity: finalQty, ...computed};
            return updated;
        });
    };

    const handleStepQty = (idx: number, delta: number) => {
        setLineItems((prev) => {
            const updated = [...prev];
            const item = updated[idx];
            const current = parseFloat(String(item.quantity)) || 0;
            const next = Math.max(1, Math.round((current + delta) * 100) / 100);
            const computed = computeLineItem(next, item.enteredAmount);
            updated[idx] = {...item, quantity: next, ...computed};
            return updated;
        });
    };

    const handleAmountChange = (idx: number, val: string) => {
        const sanitized = val.replace(/[^0-9.]/g, '');
        const parts = sanitized.split('.');
        const cleanVal = parts.length > 2 ? `${parts[0]}.${parts.slice(1).join('')}` : sanitized;

        setLineItems((prev) => {
            const updated = [...prev];
            const item = {...updated[idx], enteredAmount: cleanVal};
            const computed = computeLineItem(item.quantity, cleanVal);
            updated[idx] = {...item, ...computed};
            return updated;
        });
    };

    const handleAmountBlur = (idx: number) => {
        setLineItems((prev) => {
            const updated = [...prev];
            const item = updated[idx];
            const num = parseFloat(String(item.enteredAmount));
            const finalAmt = isNaN(num) ? 0 : num;
            const computed = computeLineItem(item.quantity, finalAmt);
            updated[idx] = {...item, enteredAmount: finalAmt, ...computed};
            return updated;
        });
    };

    const handleUnitChange = (idx: number, val: string) => {
        if (val === 'other') {
            const custom = window.prompt('Enter custom quantity unit (e.g. tin, sack, drum):');
            if (custom && custom.trim()) {
                setLineItems((prev) => {
                    const updated = [...prev];
                    updated[idx] = {...updated[idx], unit: custom.trim()};
                    return updated;
                });
            }
            return;
        }
        setLineItems((prev) => {
            const updated = [...prev];
            updated[idx] = {...updated[idx], unit: val};
            return updated;
        });
    };

    // Whenever global calculation settings change, re-compute all table rows
    useEffect(() => {
        setLineItems((prev) =>
            prev.map((item) => ({
                ...item,
                ...computeLineItem(item.quantity, item.enteredAmount),
            }))
        );
    }, [pricingMode, isTaxInclusive, enableTax, taxPercentage, enableVat, vatPercentage]);

    const handleRemoveLineItem = (index: number) => {
        setLineItems((prev) => prev.filter((_, i) => i !== index));
    };

    const grandTotal = useMemo(() => {
        return lineItems.reduce((sum, item) => sum + item.totalPrice, 0);
    }, [lineItems]);

    const totalsSummary = useMemo(() => {
        let subtotal = 0;
        let tax = 0;
        let vat = 0;
        lineItems.forEach((li) => {
            const qty = typeof li.quantity === 'number' ? li.quantity : 0;
            subtotal += (li.unitPrice || 0) * qty;
            tax += li.taxAmount || 0;
            vat += li.vatAmount || 0;
        });
        return { subtotal, tax, vat };
    }, [lineItems]);

    const previewText = useMemo(() => {
        const isGross = pricingMode === 'gross';
        const activeVat = enableVat ? (typeof vatPercentage === 'number' ? vatPercentage : 0) : 0;
        const activeTax = enableTax ? (typeof taxPercentage === 'number' ? taxPercentage : 0) : 0;
        const totalTaxPct = activeVat + activeTax;

        if (!isGross) {
            if (isTaxInclusive) {
                return `Prices entered in the table are per unit and already include tax. (e.g. 10 items @ Rs 100/unit = Rs 1,000 total bill amount, including ${totalTaxPct}% tax/VAT).`;
            } else {
                const sampleTax = (1000 * totalTaxPct) / 100;
                return `Prices entered are base rate per unit. (e.g. 10 items @ Rs 100/unit = Rs 1,000 base + Rs ${formatNumber(sampleTax)} tax/VAT [${totalTaxPct}%] = Rs ${formatNumber(1000 + sampleTax)} total).`;
            }
        } else {
            if (isTaxInclusive) {
                return `Price entered is the final lump-sum total for the line item. (e.g. Entering Rs 1,000 gross for 10 items = Rs 1,000 total bill amount; unit base rate is auto-calculated).`;
            } else {
                const sampleTax = (1000 * totalTaxPct) / 100;
                return `Price entered is the base lump-sum total. (e.g. Entering Rs 1,000 gross for 10 items + Rs ${formatNumber(sampleTax)} tax/VAT [${totalTaxPct}%] = Rs ${formatNumber(1000 + sampleTax)} total).`;
            }
        }
    }, [pricingMode, isTaxInclusive, enableTax, taxPercentage, enableVat, vatPercentage]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => setSelectedImage(event.target?.result as string);
            reader.readAsDataURL(file);
        }
    };
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (lineItems.length === 0) {
            setError('Please add at least one item to save the purchase bill.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Map all line items to the request payload structure
            const payload: AddPurchaseBillRequest = {
                purchaseNo: purchaseNo,
                purchaseDate: date,
                paymentMode: paymentMode,
                supplierId: selectedSupplier?.id,
                remarks: remarks,
                photoPath: selectedImage || undefined,
                items: lineItems.map((item) => ({
                    productId: item.itemId,
                    itemCount: parseFloat(String(item.quantity)) || 1,
                    perUnitPurchasePrice: item.unitPrice,
                })),
            };

            await savePurchase(payload, isEditMode, initialData?.id);
            navigate('/bills/purchase');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred while saving the purchase bill.');
        } finally {
            setLoading(false);
        }
    };

    const filteredItems = items.filter((item) =>
        item.name.toLowerCase().includes(itemSearch.toLowerCase())
    );

    const filteredSuppliers = suppliers.filter((sup) =>
        sup.name.toLowerCase().includes(supplierSearch.toLowerCase())
    );

    return (
        <div className="invoice-layout-root">
            <Sidebar/>
            <div className="invoice-page-wrapper">
                <div className="purchase-navbar-spacer">
                    <Navbar/>
                </div>

                <div className="invoice-container">
                    {/* Header Banner - Clean Professional AddCustomer Style */}
                    <div className="form-card-header mb-3">
                        <div className="form-card-header-left">
                            <div className="form-header-icon-wrap">
                                <i className="bi bi-cart-check-fill" />
                            </div>
                            <div>
                                <h1 className="form-header-title">{isEditMode ? 'Edit Purchase Bill' : 'Add Purchase Bill'}</h1>
                                <p className="form-header-subtitle">Record supplier purchases, inventory stock entries, and tax breakdowns</p>
                            </div>
                        </div>

                        {/* Top Right Cross Button */}
                        <button
                            type="button"
                            className="form-close-btn"
                            onClick={() => navigate('/bills/purchase')}
                            aria-label="Close"
                            title="Close"
                        >
                            <i className="bi bi-x-lg" />
                        </button>
                    </div>

                    {error && (
                        <div className="purchase-alert-danger d-flex align-items-center mb-3">
                            <i className="bi bi-exclamation-triangle-fill me-2"></i>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="purchase-grid-main">
                        {/* Left Column: Form Info, Global Tax/Mode Settings, Product Search & Table */}
                        <div className="purchase-column-left">
                            {/* Invoice Info Card */}
                            <div className="purchase-card mb-3">
                                <h3 className="purchase-card-title">
                                    <i className="bi bi-receipt"></i> Invoice Information
                                </h3>
                                <div className="purchase-form-grid">
                                    <div className="input-field-group">
                                        <label>Purchase No.</label>
                                        <div className="input-with-icon">
                                            <i className="bi bi-hash"></i>
                                            <input type="text" className="read-only-input" value={purchaseNo} readOnly
                                                   disabled/>
                                        </div>
                                    </div>

                                    <div className="input-field-group">
                                        <label>Purchase Date</label>
                                        <div className="input-with-icon">
                                            <i className="bi bi-calendar3"></i>
                                            <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                                                   required/>
                                        </div>
                                    </div>

                                    <div className="input-field-group">
                                        <label>Supplier / Vendor</label>
                                        <div className="autocomplete-wrapper">
                                            <div className="input-with-icon">
                                                <i className="bi bi-truck"></i>
                                                <input
                                                    type="text"
                                                    placeholder="Search supplier..."
                                                    value={supplierSearch}
                                                    onChange={(e) => {
                                                        setSupplierSearch(e.target.value);
                                                        setShowSupplierDropdown(true);
                                                        setSelectedSupplier(null);
                                                    }}
                                                    onFocus={() => setShowSupplierDropdown(true)}
                                                />
                                            </div>
                                            {showSupplierDropdown && supplierSearch && (
                                                <div className="autocomplete-dropdown">
                                                    {filteredSuppliers.length > 0 ? (
                                                        filteredSuppliers.map((sup) => (
                                                            <div
                                                                key={sup.id}
                                                                className="autocomplete-item"
                                                                onClick={() => {
                                                                    setSelectedSupplier(sup);
                                                                    setSupplierSearch(sup.name);
                                                                    setShowSupplierDropdown(false);
                                                                }}
                                                            >
                                                                <span className="item-title">{sup.name}</span>
                                                                {sup.phone &&
                                                                    <span className="item-badge">{sup.phone}</span>}
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="autocomplete-empty">
                                                            No supplier found.{' '}
                                                            <span
                                                                style={{
                                                                    color: '#255dce',
                                                                    cursor: 'pointer',
                                                                    textDecoration: 'underline'
                                                                }}
                                                                onClick={() => navigate('/suppliers/add')}
                                                            >
                                Add new
                              </span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Designer-Grade Tax & Pricing Setup Bar */}
                            <div className="price-settings-bar">
                                <div className="price-settings-top">
                                    <h3 className="price-settings-title">
                                        <i className="bi bi-sliders"></i> Tax & Pricing Setup
                                    </h3>
                                    <button
                                        type="button"
                                        className="price-settings-guide-btn"
                                        onClick={() => setShowGuideModal(true)}
                                    >
                                        <i className="bi bi-question-circle"></i> How calculations work
                                    </button>
                                </div>

                                <div className="price-settings-grid">
                                    {/* 1. Pricing Entry Mode */}
                                    <div className="price-settings-col">
                                        <span className="col-label">
                                            <i className="bi bi-tag"></i> Pricing Mode
                                        </span>
                                        <div className="segmented-control">
                                            <button
                                                type="button"
                                                className={`segmented-btn ${pricingMode === 'unit' ? 'active' : ''}`}
                                                onClick={() => setPricingMode('unit')}
                                            >
                                                <i className="bi bi-box-seam"></i> Per Unit
                                            </button>
                                            <button
                                                type="button"
                                                className={`segmented-btn ${pricingMode === 'gross' ? 'active' : ''}`}
                                                onClick={() => setPricingMode('gross')}
                                            >
                                                <i className="bi bi-collection"></i> Gross Total
                                            </button>
                                        </div>
                                        <p className="col-hint">
                                            {pricingMode === 'unit' ? 'Enter rate per piece (Rate × Qty)' : 'Enter lump-sum total for line'}
                                        </p>
                                    </div>

                                    {/* 2. Tax Application Mode */}
                                    <div className="price-settings-col">
                                        <span className="col-label">
                                            <i className="bi bi-receipt"></i> Tax Application
                                        </span>
                                        <div className="segmented-control">
                                            <button
                                                type="button"
                                                className={`segmented-btn ${!isTaxInclusive ? 'active' : ''}`}
                                                onClick={() => setIsTaxInclusive(false)}
                                            >
                                                <i className="bi bi-plus-circle"></i> + Tax Extra
                                            </button>
                                            <button
                                                type="button"
                                                className={`segmented-btn ${isTaxInclusive ? 'active' : ''}`}
                                                onClick={() => setIsTaxInclusive(true)}
                                            >
                                                <i className="bi bi-check2-circle"></i> Tax Included
                                            </button>
                                        </div>
                                        <p className="col-hint">
                                            {!isTaxInclusive ? 'Tax is added on top of item price' : 'Entered price already includes tax'}
                                        </p>
                                    </div>

                                    {/* 3. Tax Rates & Surcharges */}
                                    <div className="price-settings-col taxes-col">
                                        <span className="col-label">
                                            <i className="bi bi-percent"></i> Applicable Taxes & Surcharges
                                        </span>
                                        <div className="taxes-control-wrapper">
                                            <div className={`tax-chip ${enableVat ? 'active' : ''}`}>
                                                <label className="tax-chip-toggle">
                                                    <input
                                                        type="checkbox"
                                                        checked={enableVat}
                                                        onChange={(e) => setEnableVat(e.target.checked)}
                                                    />
                                                    <span className="tax-chip-title">VAT</span>
                                                </label>
                                                {enableVat && (
                                                    <div className="tax-chip-input-wrap">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            step="0.5"
                                                            value={vatPercentage === '' ? '' : vatPercentage}
                                                            onChange={(e) =>
                                                                setVatPercentage(
                                                                    e.target.value === '' ? '' : parseFloat(e.target.value) || 0
                                                                )
                                                            }
                                                        />
                                                        <span className="tax-unit">%</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className={`tax-chip ${enableTax ? 'active' : ''}`}>
                                                <label className="tax-chip-toggle">
                                                    <input
                                                        type="checkbox"
                                                        checked={enableTax}
                                                        onChange={(e) => setEnableTax(e.target.checked)}
                                                    />
                                                    <span className="tax-chip-title">Additional Tax</span>
                                                </label>
                                                {enableTax && (
                                                    <div className="tax-chip-input-wrap">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            step="0.5"
                                                            value={taxPercentage === '' ? '' : taxPercentage}
                                                            onChange={(e) =>
                                                                setTaxPercentage(
                                                                    e.target.value === '' ? '' : parseFloat(e.target.value) || 0
                                                                )
                                                            }
                                                        />
                                                        <span className="tax-unit">%</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className={`tax-summary-pill ${enableVat || enableTax ? 'active' : ''}`}>
                                                <i className={`bi ${enableVat || enableTax ? 'bi-check-circle-fill' : 'bi-dash-circle'}`}></i>
                                                <span>
                                                    {enableVat && enableTax
                                                        ? `Total ${(Number(vatPercentage) || 0) + (Number(taxPercentage) || 0)}% Tax Applied`
                                                        : enableVat
                                                        ? `${vatPercentage || 0}% VAT Applied`
                                                        : enableTax
                                                        ? `${taxPercentage || 0}% Tax Applied`
                                                        : 'Tax Exempt (0% Applied)'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Product Search Card */}
                            <div className="purchase-card mb-3">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <h3 className="purchase-card-title mb-0">
                                        <i className="bi bi-box-seam"></i> Select Products
                                    </h3>
                                    <button
                                        type="button"
                                        className="btn-outline-primary btn-sm"
                                        onClick={() => navigate('/inventory/products/add')}
                                    >
                                        <i className="bi bi-plus-lg"></i> New Product
                                    </button>
                                </div>

                                <div className="autocomplete-wrapper">
                                    <div className="input-with-icon">
                                        <i className="bi bi-search"></i>
                                        <input
                                            type="text"
                                            placeholder="Search product by name or SKU..."
                                            value={itemSearch}
                                            onChange={(e) => {
                                                setItemSearch(e.target.value);
                                                setShowItemDropdown(true);
                                            }}
                                            onFocus={() => setShowItemDropdown(true)}
                                        />
                                    </div>
                                    {showItemDropdown && itemSearch && (
                                        <div className="autocomplete-dropdown">
                                            {filteredItems.length > 0 ? (
                                                filteredItems.map((item) => (
                                                    <div
                                                        key={item.id}
                                                        className="autocomplete-item-row"
                                                        onClick={() => handleSelectItem(item)}
                                                    >
                                                        <div>
                                                            <span className="item-title">{item.name}</span>
                                                            <span className="item-badge ms-2">{item.category?.name || 'General'}</span>
                                                            <div className="small text-muted">Stock: {item.itemCount ?? 0} {item.unit || 'pcs'}</div>
                                                        </div>
                                                        <span className="item-price">{formatCurrency(item.perUnitPurchasePrice || 0)}</span>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="autocomplete-empty">No product matches query.</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Line Items Table */}
                            <div className="purchase-card no-padding">
                                <div className="responsive-table-wrapper">
                                    <table className="purchase-table modern-sales-table">
                                        <thead>
                                        <tr>
                                            <th className="th-product-info">Product & Stock</th>
                                            <th className="th-qty-unit">Quantity & Unit</th>
                                            <th className="th-price-tax">{pricingMode === 'unit' ? 'Unit Price' : 'Gross Total'} & Tax</th>
                                            <th className="th-total-action text-end">Total</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {lineItems.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="table-empty-state">
                                                    <i className="bi bi-cart-dash fs-4 d-block mb-1"></i>
                                                    No items added yet. Search products above to populate line items.
                                                </td>
                                            </tr>
                                        ) : (
                                            lineItems.map((item, idx) => (
                                                <tr key={item.itemId} className="sales-item-row">
                                                    <td className="td-product-info">
                                                        <div className="table-item-name">{item.name}</div>
                                                        <div className="sales-item-meta">
                                                            {item.categoryName && (
                                                                <span className="stock-pill">{item.categoryName}</span>
                                                            )}
                                                            {typeof item.availableStock === 'number' && (
                                                                <span
                                                                    className={`stock-pill ${
                                                                        item.availableStock <= 0
                                                                            ? 'stock-pill-danger'
                                                                            : item.availableStock <= 5
                                                                            ? 'stock-pill-warning'
                                                                            : 'stock-pill-success'
                                                                    }`}
                                                                    title={`Available in stock: ${item.availableStock} ${item.stockUnit || item.unit || 'pcs'}`}
                                                                >
                                                                    <i className="bi bi-box-seam me-1"></i>
                                                                    Stock: {item.availableStock} {item.stockUnit || item.unit || 'pcs'}
                                                                </span>
                                                            )}
                                                            {item.sku && (
                                                                <span className="stock-pill sku-pill">
                                                                    SKU: {item.sku}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>

                                                    <td className="td-qty-unit">
                                                        <div className="sales-qty-unit-cluster">
                                                            <div className="sales-stepper">
                                                                <button
                                                                    type="button"
                                                                    className="sales-step-btn"
                                                                    onClick={() => handleStepQty(idx, -1)}
                                                                    title="Decrease quantity"
                                                                    aria-label="Decrease quantity"
                                                                >
                                                                    <i className="bi bi-dash"></i>
                                                                </button>
                                                                <input
                                                                    type="text"
                                                                    inputMode="decimal"
                                                                    className="sales-qty-input"
                                                                    value={item.quantity}
                                                                    onFocus={(e) => e.target.select()}
                                                                    onChange={(e) => handleQuantityChange(idx, e.target.value)}
                                                                    onBlur={() => handleQuantityBlur(idx)}
                                                                    placeholder="1"
                                                                    title="Quantity"
                                                                />
                                                                <button
                                                                    type="button"
                                                                    className="sales-step-btn"
                                                                    onClick={() => handleStepQty(idx, 1)}
                                                                    title="Increase quantity"
                                                                    aria-label="Increase quantity"
                                                                >
                                                                    <i className="bi bi-plus"></i>
                                                                </button>
                                                            </div>
                                                            <select
                                                                className="sales-unit-select"
                                                                value={item.unit || 'pcs'}
                                                                onChange={(e) => handleUnitChange(idx, e.target.value)}
                                                                title="Quantity unit (pcs, kg, etc.)"
                                                            >
                                                                {!QUANTITY_UNITS.some(
                                                                    (u) => u.value.toLowerCase() === (item.unit || '').toLowerCase()
                                                                ) && item.unit && (
                                                                    <option value={item.unit}>{item.unit}</option>
                                                                )}
                                                                {QUANTITY_UNITS.map((u) => (
                                                                    <option key={u.value} value={u.value}>
                                                                        {u.label}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    </td>

                                                    <td className="td-price-tax">
                                                        <div className="sales-price-wrap">
                                                            <div className="sales-price-input-box">
                                                                <span className="sales-price-prefix">{currencySymbol}</span>
                                                                <input
                                                                    type="text"
                                                                    inputMode="decimal"
                                                                    className="sales-price-input"
                                                                    placeholder={pricingMode === 'unit' ? 'Unit Price' : 'Gross Total'}
                                                                    value={item.enteredAmount}
                                                                    onFocus={(e) => e.target.select()}
                                                                    onChange={(e) => handleAmountChange(idx, e.target.value)}
                                                                    onBlur={() => handleAmountBlur(idx)}
                                                                    title={pricingMode === 'unit' ? 'Unit Price' : 'Gross Total'}
                                                                />
                                                            </div>
                                                            <div className="sales-tax-badge-row">
                                                                <span className="tax-tag tax-tag-gray">
                                                                    {pricingMode === 'unit' ? 'Rate/Unit' : 'Gross Total'}
                                                                </span>
                                                                {enableVat && (vatPercentage || 0) > 0 && (
                                                                    <span className="tax-tag tax-tag-green">VAT {vatPercentage}%</span>
                                                                )}
                                                                {enableTax && (taxPercentage || 0) > 0 && (
                                                                    <span className="tax-tag tax-tag-blue">Tax {taxPercentage}%</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="td-total-action text-end">
                                                        <div className="sales-total-action-box">
                                                            <span className="sales-total-amount">
                                                                {formatCurrency(item.totalPrice)}
                                                            </span>
                                                            <button
                                                                type="button"
                                                                className="btn-icon-danger sales-del-btn"
                                                                onClick={() => handleRemoveLineItem(idx)}
                                                                title="Remove line item"
                                                                aria-label="Remove item"
                                                            >
                                                                <i className="bi bi-trash3"></i>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Sticky Summary & Payment Details */}
                        <div className="purchase-column-right"
                             style={{position: 'sticky', top: '20px', alignSelf: 'flex-start'}}>
                            <div className="purchase-card summary-card mb-3">
                                <div className="summary-label">Total Amount Payable</div>
                                <div className="summary-price-display">
                                    {formatCurrency(grandTotal)}
                                </div>
                                <div className="summary-breakdown">
                                    <div className="breakdown-row">
                                        <span>Items Subtotal</span>
                                        <span>{formatCurrency(totalsSummary.subtotal)}</span>
                                    </div>
                                    {enableVat && (
                                        <div className="breakdown-row">
                                            <span>VAT ({vatPercentage || 0}%)</span>
                                            <span>{formatCurrency(totalsSummary.vat)}</span>
                                        </div>
                                    )}
                                    {enableTax && (
                                        <div className="breakdown-row">
                                            <span>Additional Tax ({taxPercentage || 0}%)</span>
                                            <span>{formatCurrency(totalsSummary.tax)}</span>
                                        </div>
                                    )}
                                    <div className="breakdown-row">
                                        <span>Line Items Count</span>
                                        <span>{lineItems.length}</span>
                                    </div>
                                    <div className="breakdown-row">
                                        <span>Currency</span>
                                        <span>{currencySymbol}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="purchase-card">
                                <h3 className="purchase-card-title">
                                    <i className="bi bi-credit-card"></i> Payment Details
                                </h3>

                                <div className="input-field-group mb-3">
                                    <label>Payment Mode</label>
                                    <div className="input-with-icon">
                                        <i className="bi bi-wallet2"></i>
                                        <select value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)}>
                                            <option value="cash">Cash</option>
                                            <option value="card">Card / POS</option>
                                            <option value="bank_transfer">Bank Transfer</option>
                                            <option value="upi">Digital Wallet / UPI</option>
                                            <option value="credit">Credit / Payable</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="input-field-group mb-3">
                                    <label>Remarks / Notes</label>
                                    <textarea
                                        rows={3}
                                        className="purchase-textarea"
                                        placeholder="Context or bill notes..."
                                        value={remarks}
                                        onChange={(e) => setRemarks(e.target.value)}
                                    ></textarea>
                                </div>

                                <div className="input-field-group mb-3">
                                    <label>Bill Attachment</label>
                                    <input type="file" accept="image/*" className="table-input"
                                           onChange={handleFileChange}/>
                                    {selectedImage && (
                                        <img
                                            src={selectedImage}
                                            alt="Bill Document Preview"
                                            style={{
                                                maxHeight: '100px',
                                                objectFit: 'contain',
                                                marginTop: '8px',
                                                borderRadius: '6px'
                                            }}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Footer Below Form */}
                        <div className="form-action-footer">
                            <button
                                type="button"
                                className="btn-form-cancel"
                                onClick={() => navigate('/bills/purchase')}
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <div className="d-flex align-items-center gap-2">
                                <button
                                    type="button"
                                    className="btn-form-preview"
                                    onClick={() => setShowPdfModal(true)}
                                    disabled={lineItems.length === 0}
                                >
                                    <i className="bi bi-file-earmark-pdf me-1" />
                                    Preview PDF
                                </button>
                                <button
                                    type="submit"
                                    className="btn-form-submit"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-printer me-1" />
                                            Save and Print
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>

                    {/* Printable PDF Modal Preview */}
                    {showPdfModal && (
                        <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                            <div className="modal-dialog modal-lg modal-dialog-centered">
                                <div className="modal-content">
                                    <div className="modal-header border-bottom">
                                        <h5 className="modal-title text-navy fw-bold">
                                            <i className="bi bi-file-earmark-pdf me-2"></i>Purchase Bill Preview
                                        </h5>
                                        <button
                                            type="button"
                                            className="form-close-btn"
                                            onClick={() => setShowPdfModal(false)}
                                            title="Close"
                                            aria-label="Close"
                                        >
                                            <i className="bi bi-x-lg" />
                                        </button>
                                    </div>

                                    <div className="modal-body p-4" id="printable-purchase">
                                        <div className="d-flex justify-content-between pb-3 mb-3 border-bottom">
                                            <div>
                                                <h3 className="text-navy fw-bold mb-1">PURCHASE BILL</h3>
                                                <div className="small text-muted">Bill #: <strong>{purchaseNo || 'N/A'}</strong></div>
                                                <div className="small text-muted">Date: {date}</div>
                                            </div>
                                            <div className="text-end">
                                                <h6 className="fw-bold mb-1">Supplier Details</h6>
                                                <div className="small">{selectedSupplier?.name || supplierSearch || 'Standard Supplier'}</div>
                                                {selectedSupplier?.phone && <div className="small text-muted">Phone: {selectedSupplier.phone}</div>}
                                                <div className="small text-muted text-uppercase">Payment: {paymentMode}</div>
                                            </div>
                                        </div>

                                        <table className="table table-bordered align-middle">
                                            <thead className="table-light">
                                            <tr>
                                                <th>Product</th>
                                                <th className="text-center">Qty</th>
                                                <th className="text-end">Unit Price</th>
                                                <th className="text-end">Tax/VAT</th>
                                                <th className="text-end">Total</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {lineItems.map((item, idx) => (
                                                <tr key={item.itemId || idx}>
                                                    <td>
                                                        <div className="fw-semibold">{item.name}</div>
                                                        {item.categoryName && <div className="small text-muted">{item.categoryName}</div>}
                                                    </td>
                                                    <td className="text-center">{item.quantity} {item.unit || 'pcs'}</td>
                                                    <td className="text-end">Rs. {formatNumber(item.unitPrice || 0)}</td>
                                                    <td className="text-end">Rs. {formatNumber(Number(item.taxAmount || 0) + Number(item.vatAmount || 0))}</td>
                                                    <td className="text-end fw-semibold">Rs. {formatNumber(item.totalPrice || 0)}</td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>

                                        <div className="d-flex justify-content-between pt-3 border-top">
                                            <div className="small text-muted">
                                                {remarks && <div><strong>Remarks:</strong> {remarks}</div>}
                                            </div>
                                            <div className="text-end fw-bold text-navy fs-5">
                                                Grand Total: Rs. {formatNumber(grandTotal)}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="modal-footer border-top">
                                        <button type="button" className="btn-form-cancel" onClick={() => setShowPdfModal(false)}>
                                            Close
                                        </button>
                                        <button type="button" className="btn-form-submit" onClick={() => window.print()}>
                                            <i className="bi bi-printer me-1"></i> Print Bill
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Calculation Guide Modal */}
                    {showGuideModal && (
                        <div className="modal-backdrop-custom" onClick={() => setShowGuideModal(false)}>
                            <div className="price-guide-modal" onClick={(e) => e.stopPropagation()}>
                                <div className="price-guide-modal-header">
                                    <div className="guide-modal-title">
                                        <div className="guide-icon-badge">
                                            <i className="bi bi-lightbulb"></i>
                                        </div>
                                        <div>
                                            <h4>Tax & Pricing Calculation Guide</h4>
                                            <p>How item rates, taxes, and bill totals are calculated</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        className="guide-modal-close"
                                        onClick={() => setShowGuideModal(false)}
                                        aria-label="Close"
                                    >
                                        <i className="bi bi-x-lg"></i>
                                    </button>
                                </div>

                                <div className="price-guide-modal-body">
                                    <div className="guide-cards-grid">
                                        <div className="guide-info-card">
                                            <h5>1. Per Unit vs. Gross Total Pricing</h5>
                                            <p>
                                                <strong>Per Unit:</strong> Enter the price for one single product unit (e.g. Rs. 100/pc). The row total is computed as <code>Rate × Quantity</code>.
                                            </p>
                                            <p>
                                                <strong>Gross Total:</strong> Enter the combined purchase cost for the whole quantity (e.g. Rs. 1,000 for 10 pcs). The unit cost is auto-calculated as <code>Gross Amount ÷ Quantity</code>.
                                            </p>
                                        </div>

                                        <div className="guide-info-card">
                                            <h5>2. + Tax Extra (Exclusive) vs. Tax Included (Inclusive)</h5>
                                            <p>
                                                <strong>+ Tax Extra (Exclusive):</strong> The rate entered is the bare base price. Applicable VAT and Tax are added on top of the subtotal.
                                            </p>
                                            <p>
                                                <strong>Tax Included (Inclusive):</strong> The rate entered is the final customer price. The system extracts the tax portions without increasing your line total.
                                            </p>
                                        </div>

                                        <div className="guide-info-card">
                                            <h5>3. Applicable Taxes (VAT & Additional Tax)</h5>
                                            <p>
                                                Under standard Nepal regulations, VAT is 13%. You can toggle VAT on or off, or change the percentage if items are exempt or carry different rates.
                                            </p>
                                            <div className="guide-formula-box">
                                                <strong>Active Formula:</strong> {previewText}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="price-guide-modal-footer">
                                    <button
                                        type="button"
                                        className="btn-guide-confirm"
                                        onClick={() => setShowGuideModal(false)}
                                    >
                                        Got it
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};