import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { useNavigate } from 'react-router-dom';
import { fetchCustomers, Customer } from '@/features/services/customerService';
import {getPaymentList, GetPaymentResponse} from "@/features/services/paymentService";
import { toast } from 'react-toastify';
import '../../../styles/Customers.css';

interface CustomerWithBalance extends Customer {
    balance: number;
    paymentHistory: GetPaymentResponse[];
}

interface OverallTotals {
    given: number;
    received: number;
    online: number;
}

/**
 * Detects whether a string is a valid image data URL.
 */
const isDataUrl = (s: string): boolean =>
    /^data:image\/[a-z0-9.+-]+;base64,/i.test(s);

/**
 * Safely base64-decode a string (UTF-8 aware).
 * Handles URL-safe base64 (with - and _) and returns null on failure.
 */
const safeAtob = (input: string): string | null => {
    try {
        // Normalize URL-safe base64
        let s = input.replace(/-/g, '+').replace(/_/g, '/');
        // Pad to multiple of 4
        while (s.length % 4) s += '=';
        // Decode as binary then reinterpret as UTF-8
        const binary = atob(s);
        try {
            const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
            return new TextDecoder('utf-8', { fatal: false }).decode(bytes);
        } catch {
            return binary;
        }
    } catch {
        return null;
    }
};

/**
 * Sniff image MIME from the first bytes of a base64 payload.
 */
const sniffMimeFromBase64 = (b64: string): string => {
    try {
        const head = b64.substring(0, 24);
        const padded = head + '='.repeat((4 - (head.length % 4)) % 4);
        const binary = atob(padded);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

        if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return 'image/png';
        if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg';
        if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38) return 'image/gif';
        if (
            bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
            bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50
        ) return 'image/webp';
        if (bytes[0] === 0x42 && bytes[1] === 0x4d) return 'image/bmp';
        const textHead = binary.substring(0, 5);
        if (textHead.startsWith('<svg') || textHead.startsWith('<?xml')) return 'image/svg+xml';
        if (bytes[0] === 0x00 && bytes[1] === 0x00 && bytes[2] === 0x01 && bytes[3] === 0x00) return 'image/x-icon';
    } catch {
        /* ignore */
    }
    return 'image/jpeg';
};

/**
 * Universal image source resolver.
 *
 * Handles the specific case seen in this project: the DB stores a
 * base64-encoded DATA URL, i.e. base64("data:image/png;base64,iVBOR...").
 * We decode it once so the browser gets a real renderable data URL.
 *
 * Also handles: raw base64, plain data URL, http(s) URLs, Node.js Buffers,
 * raw byte arrays, JSON-stringified strings, double-prefixed data URLs.
 */
const resolveImageSrc = (input: any): string => {
    if (input === undefined || input === null) return '';

    // ── Node.js Buffer: { type: 'Buffer', data: [137, 80, ...] }
    if (
        typeof input === 'object' &&
        !Array.isArray(input) &&
        (input.type === 'Buffer' || Array.isArray(input.data))
    ) {
        try {
            const bytes = new Uint8Array(input.data);
            let binary = '';
            const chunk = 0x8000;
            for (let i = 0; i < bytes.length; i += chunk) {
                binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunk)) as any);
            }
            const b64 = btoa(binary);
            return `data:${sniffMimeFromBase64(b64)};base64,${b64}`;
        } catch {
            return '';
        }
    }

    // ── Raw byte array
    if (Array.isArray(input) && input.length > 8 && input.every((n: any) => typeof n === 'number')) {
        try {
            const bytes = new Uint8Array(input);
            let binary = '';
            const chunk = 0x8000;
            for (let i = 0; i < bytes.length; i += chunk) {
                binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunk)) as any);
            }
            const b64 = btoa(binary);
            return `data:${sniffMimeFromBase64(b64)};base64,${b64}`;
        } catch {
            return '';
        }
    }

    // ── Object with a string `.data` field
    let value: any = input;
    if (typeof value === 'object' && typeof value.data === 'string') {
        value = value.data;
    }

    // ── Stringify and sanitize
    let s = String(value).trim();

    // Strip JSON-style surrounding quotes
    if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
        s = s.slice(1, -1);
    }

    // Remove whitespace/null bytes
    s = s.replace(/[\s\u0000-\u001F\u007F]/g, '');

    if (!s || s === 'null' || s === 'undefined') return '';

    // ── HTTP(S) / blob URLs
    if (s.startsWith('http://') || s.startsWith('https://') || s.startsWith('blob:')) {
        return s;
    }

    // ── Direct data URL
    if (isDataUrl(s)) {
        // Trust the declared MIME but correct it if it's wrong
        const commaIdx = s.indexOf(',');
        const meta = s.substring(0, commaIdx);
        const payload = s.substring(commaIdx + 1);
        const declared = meta.match(/data:([^;]+)/)?.[1] || 'image/jpeg';
        const actual = sniffMimeFromBase64(payload);
        if (declared !== actual && declared !== 'application/octet-stream') {
            return `data:${actual};base64,${payload}`;
        }
        return s;
    }

    // ── THE IMPORTANT CASE ──
    // The string is base64 of a data URL: base64("data:image/png;base64,...")
    // Decode it once. If the result is a data URL, use it directly.
    const decodedOnce = safeAtob(s);
    if (decodedOnce && isDataUrl(decodedOnce)) {
        return decodedOnce;
    }

    // Also handle the case where decoding once yields another base64 payload
    // (double-encoded base64 of raw bytes) — decode again if it looks right
    if (decodedOnce && /^[A-Za-z0-9+/=]+$/.test(decodedOnce) && decodedOnce.length > 32) {
        const decodedTwice = safeAtob(decodedOnce);
        if (decodedTwice && decodedTwice.length > 0) {
            // Try to sniff MIME from the twice-decoded payload
            const mime = sniffMimeFromBase64(decodedOnce);
            return `data:${mime};base64,${decodedOnce}`;
        }
    }

    // ── If it contains ",data:" the outer prefix was wrong — strip it
    if (s.includes(',data:')) {
        const inner = s.substring(s.indexOf(',data:') + 1);
        if (isDataUrl(inner)) return inner;
    }

    // ── Final fallback: treat as raw base64 image bytes
    return `data:${sniffMimeFromBase64(s)};base64,${s}`;
};

// Shared avatar color generator
const getAvatarColor = (name?: string) => {
    const safeName = name || 'Customer';
    const colors = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#6C5CE7',
        '#F0932B', '#EB4D4B', '#22A6B3', '#BE2EDD', '#4834D4',
        '#0097E6', '#44BD32'
    ];
    let hash = 0;
    for (let i = 0; i < safeName.length; i++) {
        hash = safeName.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
};

/**
 * Avatar component — validates the image before rendering it.
 * Shows the fallback letter if the image is missing or fails to load.
 */
const CustomerAvatar = ({ name, imageSrc }: { name?: string; imageSrc: string }) => {
    const [status, setStatus] = useState<'loading' | 'ok' | 'failed'>(
        imageSrc ? 'loading' : 'failed'
    );

    useEffect(() => {
        if (!imageSrc) {
            setStatus('failed');
            return;
        }
        setStatus('loading');

        let cancelled = false;
        const probe = new Image();
        probe.onload = () => { if (!cancelled) setStatus('ok'); };
        probe.onerror = () => { if (!cancelled) setStatus('failed'); };
        probe.src = imageSrc;

        return () => {
            cancelled = true;
            probe.onload = null;
            probe.onerror = null;
        };
    }, [imageSrc]);

    if (status !== 'ok') {
        return (
            <div
                className="customers-profile-image"
                style={{
                    backgroundColor: getAvatarColor(name),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    color: '#ffffff',
                    fontWeight: 'bold',
                }}
            >
                {name ? name.charAt(0).toUpperCase() : '?'}
            </div>
        );
    }

    return (
        <img
            src={imageSrc}
            alt={name || 'Customer'}
            className="customers-profile-image"
            style={{ objectFit: 'cover', display: 'block' }}
        />
    );
};

export const Customers = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [filterBy] = useState('all');
    const [sortBy, setSortBy] = useState('mostRecent');
    const [customers, setCustomers] = useState<CustomerWithBalance[]>([]);
    const [overallTotals, setOverallTotals] = useState<OverallTotals>({ given: 0, received: 0, online: 0 });
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        let isMounted = true;

        const loadCustomers = async () => {
            try {
                setIsLoading(true);
                const data = await fetchCustomers();

                const customerArray = Array.isArray(data) ? data : [];

                const customersWithBalance = await Promise.all(
                    customerArray.map(async (customer: any) => {
                        const resolvedId = customer?.id ?? customer?.customerId ?? (customer as any)?.customerId;

                        if (!resolvedId) {
                            return { ...customer, id: 0, balance: 0, paymentHistory: [] };
                        }

                        try {
                            const paymentHistory = await getPaymentList({
                                paymentParty: 'CUSTOMER',
                                partyId: Number(resolvedId)
                            });
                            const historyList = Array.isArray(paymentHistory) ? paymentHistory : [];

                            const balance = historyList.reduce((acc, payment) => {
                                const amount = Number(payment?.amount) || 0;
                                const type = (payment?.paymentCategory || '').toLowerCase();
                                const isReceived = type === 'received' || type === 'payment_in' || type === 'you_received';
                                return isReceived ? acc + amount : acc - amount;
                            }, 0);

                            return { ...customer, id: Number(resolvedId), balance, paymentHistory: historyList };
                        } catch (err) {
                            console.error(`Failed to load payments for customer ${resolvedId}:`, err);
                            return { ...customer, id: Number(resolvedId), balance: 0, paymentHistory: [] };
                        }
                    })
                );

                if (!isMounted) return;

                // 🔍 TEMP DEBUG — verify the double-decode is working
                customersWithBalance.forEach((c: any) => {
                    if (c.profileImage) {
                        const raw = String(c.profileImage);
                        const resolved = resolveImageSrc(c.profileImage);
                        console.log(
                            `[Avatar] ${c.name}`,
                            '\n  raw (first 60):', raw.slice(0, 60),
                            '\n  raw length:', raw.length,
                            '\n  resolved (first 60):', resolved.slice(0, 60),
                            '\n  resolved length:', resolved.length,
                            '\n  starts with data:image?', resolved.startsWith('data:image/')
                        );
                    }
                });

                setCustomers(customersWithBalance);

                const totals = customersWithBalance.reduce(
                    (acc, customer) => {
                        const bal = Number(customer.balance) || 0;
                        if (bal > 0) acc.received += bal;
                        else if (bal < 0) acc.given += Math.abs(bal);
                        return acc;
                    },
                    { given: 0, received: 0, online: 0 }
                );

                setOverallTotals(totals);
            } catch (err: any) {
                console.error("Error loading customers:", err);
                if (isMounted) setError(err?.message || 'Failed to load customers');
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        loadCustomers();

        return () => { isMounted = false; };
    }, []);

    const handleAddCustomer = () => navigate('/parties/customers/add');

    const handleCustomerClick = (customer: CustomerWithBalance) => {
        const validId = customer.id || customer.customerId || (customer as any).customerId;
        if (!validId || validId === 'undefined' || Number(validId) === 0) {
            console.error('Invalid customer object clicked:', customer);
            toast.error('Customer ID missing from server');
            return;
        }
        try {
            navigate(`/parties/customers/statements/${validId}`, {
                state: {
                    customer: {
                        ...customer,
                        id: Number(validId),
                        phone: customer.phone || 'N/A',
                        contactPerson: customer.contactPerson || null,
                        bankAccount: customer.bankAccount || null,
                        cashBalance: customer.cashBalance ?? 0,
                    }
                }
            });
        } catch (error) {
            console.error('Error navigating to customer statements:', error);
            toast.error('Failed to open customer statements');
        }
    };

    const getRelativeTime = (date?: string) => {
        if (!date) return 'N/A';
        const d = new Date(date);
        if (isNaN(d.getTime())) return 'Recently';
        const diffMs = Date.now() - d.getTime();
        const seconds = Math.floor(diffMs / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        if (seconds < 60) return `${Math.max(0, seconds)} sec ago`;
        if (minutes < 60) return `${minutes} min ago`;
        if (hours < 24) return `${hours} hr ago`;
        if (days < 30) return `${days} day${days !== 1 ? 's' : ''} ago`;
        return d.toLocaleDateString();
    };

    const getLatestUpdatedAt = (customer: CustomerWithBalance) => {
        const dates: number[] = [];
        if (customer.updatedAt && !isNaN(new Date(customer.updatedAt).getTime())) {
            dates.push(new Date(customer.updatedAt).getTime());
        }
        if (Array.isArray(customer.paymentHistory)) {
            customer.paymentHistory.forEach(p => {
                if (p?.updatedAt && !isNaN(new Date(p.updatedAt).getTime())) {
                    dates.push(new Date(p.updatedAt).getTime());
                }
            });
        }
        return dates.length > 0 ? new Date(Math.max(...dates)).toISOString() : customer.createdAt || '';
    };

    const filteredAndSortedCustomers = customers
        .filter(customer => {
            const customerName = (customer?.name || '').toLowerCase();
            if (searchQuery && !customerName.includes(searchQuery.toLowerCase())) return false;
            const bal = Number(customer?.balance) || 0;
            switch (filterBy) {
                case 'toReceive': return bal > 0;
                case 'toGive': return bal < 0;
                case 'settled': return bal === 0;
                default: return true;
            }
        })
        .sort((a, b) => {
            const timeA = new Date(getLatestUpdatedAt(a) || 0).getTime();
            const timeB = new Date(getLatestUpdatedAt(b) || 0).getTime();
            switch (sortBy) {
                case 'mostRecent': return timeB - timeA;
                case 'highestAmount': return Math.abs(b.balance || 0) - Math.abs(a.balance || 0);
                case 'leastAmount': return Math.abs(a.balance || 0) - Math.abs(b.balance || 0);
                case 'byName': return (a.name || '').localeCompare(b.name || '');
                case 'oldest': return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
                default: return 0;
            }
        });

    return (
        <div style={{ minHeight: '100vh', background: '#f8f9fa', paddingTop: '40px' }}>
            <Sidebar />
            <main className="customers-main-content">
                <div className="customers-search-container">
                    <div className="customers-search-row">
                        <div className="customers-search-group">
                            <i className="bi bi-search customers-search-icon"></i>
                            <input
                                type="text"
                                placeholder="Search customers..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="customers-search-input"
                            />
                        </div>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="customers-filter-select"
                        >
                            <option value="mostRecent">Sort by Most Recent</option>
                            <option value="highestAmount">Sort by Highest Amount</option>
                            <option value="leastAmount">Sort by Least Amount</option>
                            <option value="byName">Sort by Name</option>
                            <option value="oldest">Sort by Oldest</option>
                        </select>
                        <div className="customers-action-buttons">
                            <button className="customers-action-button customers-primary-button" onClick={() => {}}>
                                <i className="bi bi-bell"></i>
                                Bulk Reminder
                            </button>
                            <button
                                className="customers-action-button customers-secondary-button"
                                onClick={() => navigate('/parties/customers/list-report-pdf')}
                            >
                                <i className="bi bi-file-earmark-text"></i>
                                List Report
                            </button>
                        </div>
                    </div>
                </div>

                <div className="customers-cards-container">
                    <div className="customers-card">
                        <div className="customers-card-icon customers-card-give-icon">
                            <i className="bi bi-arrow-up-circle"></i>
                        </div>
                        <div className="customers-card-header">You Gave</div>
                        <div className="customers-card-amount" style={{ color: '#cb1729' }}>
                            रु{overallTotals.given.toLocaleString()}
                        </div>
                    </div>
                    <div className="customers-card">
                        <div className="customers-card-icon customers-card-receive-icon">
                            <i className="bi bi-arrow-down-circle"></i>
                        </div>
                        <div className="customers-card-header">You Received</div>
                        <div className="customers-card-amount" style={{ color: '#1fc445' }}>
                            रु{overallTotals.received.toLocaleString()}
                        </div>
                    </div>
                    <div className="suppliers-stat-card">
                        <div className="suppliers-stat-icon suppliers-stat-online-icon">
                            <i className="bi bi-globe"></i>
                        </div>
                        <div className="suppliers-stat-label">Online Collection</div>
                        <div className="suppliers-stat-value">
                            रु{overallTotals.online.toLocaleString()}
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="customers-error" style={{ color: '#dc3545', margin: '1rem 0' }}>
                        <i className="bi bi-exclamation-triangle me-2"></i>
                        {error}
                    </div>
                )}

                {isLoading ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#6c757d' }}>
                        Loading customers...
                    </div>
                ) : filteredAndSortedCustomers.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#6c757d', background: '#fff', borderRadius: '8px', marginTop: '1rem' }}>
                        No customers found. Click below to add your first customer.
                    </div>
                ) : (
                    filteredAndSortedCustomers.map((customer) => {
                        const customerKey = customer.id || customer.customerId || Math.random();
                        const imageSrc = resolveImageSrc(customer.profileImage);

                        return (
                            <div
                                key={customerKey}
                                className="customers-customer-card"
                                onClick={() => handleCustomerClick(customer)}
                            >
                                <div className="customers-customer-info">
                                    <CustomerAvatar name={customer.name} imageSrc={imageSrc} />

                                    <div className="customers-customer-details">
                                        <h3 className="customers-customer-name">{customer.name || 'Unnamed Customer'}</h3>
                                        <p className="customers-working-hours">
                                            <i className="bi bi-telephone me-1"></i>
                                            {customer.phone || 'N/A'}
                                        </p>
                                        <p className="customers-working-hours">
                                            <i className="bi bi-clock me-1"></i>
                                            {getRelativeTime(getLatestUpdatedAt(customer))}
                                        </p>
                                    </div>
                                    <div className={`customers-customer-amount ${
                                        (customer.balance || 0) === 0 ? 'balance-zero' :
                                            (customer.balance || 0) > 0 ? 'balance-positive' : 'balance-negative'
                                    }`}>
                                        रु{Math.abs(customer.balance || 0).toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', position: 'fixed', bottom: '30px', left: '0', width: '98%', zIndex: 1000, pointerEvents: 'none' }}>
                    <button
                        className="customers-add-button"
                        style={{ pointerEvents: 'auto' }}
                        onClick={handleAddCustomer}
                    >
                        <i className="bi bi-plus-circle"></i>
                        Add Customer
                    </button>
                </div>
            </main>
        </div>
    );
};