import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { usePermission } from '@/core/rbac/usePermission';
import { getKhataBooks, switchKhataBook, getSelectedKhataBook, KhataBook } from '../services/khataBookService';
import dashboardIcon from '../assets/dashboard.png';
import '../styles/Sidebar.css';

interface NavItem {
	title: string;
	path: string;
	icon: string;
	module?: string;
	permission?: string;
	children?: NavItem[];
}

const navItems: NavItem[] = [
	{ title: 'DASHBOARD', path: '/dashboard', icon: '📊' },
	{
		title: 'PARTIES',
		path: '/parties',
		icon: '👥',
		children: [
			{ title: 'Customer', path: '/parties/customers', icon: '', module: 'customer' },
			{ title: 'Suppliers', path: '/parties/suppliers', icon: '', module: 'supplier' },
			{ title: 'Cash In Hand', path: '/parties/cash-bank/cash', icon: '' },
			{ title: 'Bank Deposit', path: '/parties/cash-bank/bank', icon: '' },
		],
	},
	{
		title: 'MGMT INVENTORY',
		path: '/inventory',
		icon: '📦',
		children: [
			{ title: 'PRODUCTS', path: '/inventory/items', icon: '📦' },
			{ title: 'SERVICES', path: '/service', icon: '🔧' },
			{ title: 'Sales', path: '/bills/sales', icon: '💰' },
			{ title: 'Purchase', path: '/bills/purchase', icon: '🛒' },
			{ title: 'Expenses', path: '/bills/expenses', icon: '💸' },
			{ title: 'Income', path: '/bills/income', icon: '💸' },
			{ title: 'Cashbook', path: '/bills/cashbook', icon: '📒' },
		],
	},
	{
		title: 'OTHERS',
		path: '/others',
		icon: '📦',
		children: [
			{ title: 'Staff MGMT', path: '/staff', icon: '👨‍💼', module: 'staff' },
			{ title: 'Rental Items', path: '/rental-items', icon: '📦', module: 'rental' },
			{ title: 'Note', path: '/others/note', icon: '📝' },
		],
	},
	{
		title: 'REPORTS',
		path: '/reports',
		icon: '📊',
		children: [
			{ title: 'Sales Report', path: '/reports/sales', icon: '💰' },
			{ title: 'Purchase Report', path: '/reports/purchase', icon: '🛒' },
			{ title: 'Total Sale Report', path: '/reports/total-sale', icon: '📈' },
		],
	},
	{
		title: 'SYSTEM',
		path: '/system',
		icon: '⚙️',
		children: [
			{ title: 'Multi User Login', path: '/system/multi-user', icon: '👥' },
			{ title: 'Reminder', path: '/system/reminder', icon: '⏰' },
			{ title: 'Import Data', path: '/system/import', icon: '📥' },
			{ title: 'Notis', path: '/system/notis', icon: '🔔' },
		],
	},
	{
		title: 'SETTINGS',
		path: '/settings',
		icon: '⚙️',
		children: [
			{ title: 'API', path: '/settings/api', icon: '💬' },
			{ title: 'Organization Management', path: '/user', icon: '🌐', module: 'organization'},
			{ title: 'Backup', path: '/settings/backup', icon: '💾' },
			{ title: 'Recycle Bin', path: '/settings/recycle-bin', icon: '🗑️' },
			{ title: 'Role & Permission', path: '/role', icon: '🔒' },
			{ title: 'App Setting', path: '/app-settings', icon: '⚙️' },
			{ title: 'Bills & Print Selling', path: '/bills-and-print-selling', icon: '📄' },
			{ title: 'Delete Khata', path: '/settings/delete-khata', icon: '❌' },
			{ title: 'Business Setting', path: '/settings/business', icon: '🏢' },
			{ title: 'Dashboard Setting', path: '/settings/dashboard', icon: '📊' },
		],
	},
	{
		title: 'ABOUTS',
		path: '/abouts',
		icon: 'ℹ️',
		children: [
			{ title: 'Name Of App', path: '/abouts/app-name', icon: '📱' },
			{ title: 'Backup Info', path: '/abouts/backup-info', icon: '💾' },
			{ title: 'Privacy Policy', path: '/abouts/privacy', icon: '🔒' },
			{ title: 'Terms & Conditions', path: '/abouts/terms', icon: '📜' },
			{ title: 'Version', path: '/abouts/version', icon: '🔄' },
		],
	},
];

export const Sidebar = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const { hasModule, hasPermission } = usePermission();

	const [isPopupOpen, setIsPopupOpen] = useState(false);
	const popupRef = useRef<HTMLDivElement>(null);
	const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({
		'/parties': true,
	});
	const [khataBooks, setKhataBooks] = useState<KhataBook[]>([]);
	const [currentKhataBook, setCurrentKhataBook] = useState<KhataBook | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const cachedCompanyName = (typeof window !== 'undefined' && localStorage.getItem('companyName')) || '';

	const findParentPaths = (items: NavItem[], currentPath: string): string[] => {
		const parentPaths: string[] = [];

		const findParents = (items: NavItem[], path: string): boolean => {
			for (const item of items) {
				if (item.children) {
					if (
						item.children.some(
							(child) => child.path === path || (child.children && findParents([child], path))
						)
					) {
						parentPaths.push(item.path);
						return true;
					}
				}
			}
			return false;
		};

		findParents(items, currentPath);
		return parentPaths;
	};

	useEffect(() => {
		const parentPaths = findParentPaths(navItems, location.pathname);
		setExpandedItems((prev) => {
			const newExpanded = { ...prev };
			parentPaths.forEach((path) => {
				newExpanded[path] = true;
			});
			newExpanded['/parties'] = true;
			return newExpanded;
		});
	}, [location.pathname]);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
				setIsPopupOpen(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	useEffect(() => {
		const fetchKhataBooks = async () => {
			if (isPopupOpen) {
				setLoading(true);
				setError(null);
				try {
					const data = await getKhataBooks();
					setKhataBooks(data);
				} catch (err) {
					setError('Failed to load KhataBooks');
					console.error(err);
				} finally {
					setLoading(false);
				}
			}
		};

		fetchKhataBooks();
	}, [isPopupOpen]);

	useEffect(() => {
		const fetchCurrentKhataBook = async () => {
			try {
				const selectedKhataBook = await getSelectedKhataBook();
				setCurrentKhataBook(selectedKhataBook);
			} catch (err) {
				console.error('Failed to fetch current KhataBook:', err);
			}
		};

		fetchCurrentKhataBook();
	}, []);

	const isActive = (path: string, item: NavItem) => {
		if (path === '/') return false;

		if (path === '/parties/suppliers' && location.pathname.startsWith('/parties/supplier')) {
			return true;
		}

		const isPathActive = location.pathname.startsWith(path);

		if (item.children) {
			const hasActiveChild = item.children.some((child) => {
				if (child.children) {
					return child.children.some(
						(nestedChild) =>
							location.pathname === nestedChild.path || location.pathname.startsWith(nestedChild.path)
					);
				}
				const childAliasActive =
					child.path === '/parties/suppliers' && location.pathname.startsWith('/parties/supplier');
				return childAliasActive || location.pathname === child.path || location.pathname.startsWith(child.path);
			});
			return hasActiveChild;
		}

		return isPathActive;
	};

	const toggleItem = (path: string) => {
		if (path === '/parties') return;
		setExpandedItems((prev) => ({
			...prev,
			[path]: !prev[path],
		}));
	};

	/**
	 * Recursive filter to check module/permission authorization for navigation items
	 */
	const filterAuthorizedNavItems = (items: NavItem[]): NavItem[] => {
		return items
			.filter((item) => {
				// Module check
				if (item.module && !hasModule(item.module)) {
					return false;
				}
				// Permission check
				if (item.permission && !hasPermission(item.permission)) {
					return false;
				}
				return true;
			})
			.map((item) => {
				if (item.children) {
					return {
						...item,
						children: filterAuthorizedNavItems(item.children),
					};
				}
				return item;
			})
			.filter((item) => !item.children || item.children.length > 0);
	};

	const renderNavItems = (items: NavItem[], level = 0) => {
		return items.map((item) => {
			const hasChildren = !!item.children?.length;
			const isExpanded = expandedItems[item.path];
			const active = isActive(item.path, item);

			const hideIconForPartiesChildren = level > 0 && item.path.startsWith('/parties/');
			const showIcon = !hideIconForPartiesChildren;

			return (
				<li key={item.path} className={`${level > 0 ? 'nested-nav-item' : 'nav-item'} mb-2`}>
					<div
						onClick={() => (hasChildren ? toggleItem(item.path) : navigate(item.path))}
						className={`${level > 0 ? 'nested-nav-link' : 'nav-link'} ${
							active ? 'active' : ''
						} d-flex align-items-center py-2 px-3 rounded`}
						style={{ paddingLeft: `${0.75 + level * 0.5}rem` }}
					>
						{showIcon && (
							<span className={`${level > 0 ? 'nested-nav-icon' : 'nav-icon'} me-2`}>
                {item.title === 'DASHBOARD' ? (
					<img src={dashboardIcon} alt="Dashboard" style={{ width: '28px', height: '28px' }} />
				) : (
					item.icon
				)}
              </span>
						)}
						<span className={`${level > 0 ? 'nested-nav-text' : 'nav-text'} flex-grow-1`}>
              {item.title}
            </span>
						{hasChildren && item.path !== '/parties' && (
							<span className="expand-icon ms-auto">{isExpanded ? '▾' : '▸'}</span>
						)}
					</div>

					{hasChildren && isExpanded && (
						<ul className="nested-nav-items list-unstyled ms-3 mt-2">
							{renderNavItems(item.children!, level + 1)}
						</ul>
					)}
				</li>
			);
		});
	};

	const handleAddKhatabook = () => {
		setIsPopupOpen(false);
		navigate('/add-khatabook');
	};

	const handleKhataBookClick = async (khataBook: KhataBook) => {
		try {
			await switchKhataBook(khataBook.id);
			setCurrentKhataBook(khataBook);
			localStorage.setItem('companyName', khataBook.companyName);
			localStorage.setItem('selectedKhataBookId', khataBook.id.toString());
			window.location.reload();
		} catch (error) {
			console.error('Error switching KhataBook:', error);
			alert('Failed to switch KhataBook. Please try again.');
		}
		setIsPopupOpen(false);
	};

	const authorizedNavItems = filterAuthorizedNavItems(navItems);

	return (
		<div className="sidebar">
			<div className="user-section" onClick={() => setIsPopupOpen(true)}>
				<div className="user-profile" style={{ display: 'flex', flexDirection: 'column' }}>
					<div
						className="avatar"
						style={{
							backgroundImage: currentKhataBook?.imagePath
								? `url(http://localhost:5000${currentKhataBook.imagePath})`
								: 'linear-gradient(135deg, #3498db, #2980b9)',
							backgroundSize: 'cover',
							backgroundPosition: 'center',
							backgroundRepeat: 'no-repeat',
						}}
					>
						{!currentKhataBook?.imagePath && '👤'}
					</div>
					<div className="user-info">
						<p className="user-role">
							{currentKhataBook?.companyName || cachedCompanyName || 'No KhataBook Selected'}
						</p>
					</div>
				</div>
			</div>

			{isPopupOpen && (
				<div className="popup-container">
					<div className="popup-content" ref={popupRef}>
						<div className="popup-header">
							<h2 className="popup-title">KhataBooks</h2>
							<button className="close-button" onClick={() => setIsPopupOpen(false)}>
								×
							</button>
						</div>
						<div className="user-cards-container">
							{loading ? (
								<p className="loading-text">Loading KhataBooks...</p>
							) : error ? (
								<p className="error-text">{error}</p>
							) : khataBooks.length === 0 ? (
								<p className="loading-text">No KhataBooks found</p>
							) : (
								khataBooks.map((khataBook) => (
									<div
										key={khataBook.id}
										className="user-card"
										onClick={() => handleKhataBookClick(khataBook)}
									>
										<div className="user-image">
											{khataBook.imagePath ? (
												<img src={khataBook.imagePath} alt={khataBook.name} className="user-image-img" />
											) : (
												'👤'
											)}
										</div>
										<div className="user-details">
											<h3 className="company-name">{khataBook.companyName}</h3>
											<p className="user-info-text">{khataBook.companyNumber}</p>
											<p className="user-info-text">{khataBook.name}</p>
										</div>
									</div>
								))
							)}
						</div>
						<button className="add-button" onClick={handleAddKhatabook}>
							Add New Khatabook
						</button>
					</div>
				</div>
			)}

			<div className="nav-section">
				<ul className="nav-items list-unstyled">{renderNavItems(authorizedNavItems)}</ul>
			</div>
		</div>
	);
};