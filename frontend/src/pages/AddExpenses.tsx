import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { billsConfig } from '../config/bills';
import { fetchCategories, fetchItems, fetchLastExpenses, saveExpense } from '../services/expensesService';
import '../styles/AddExpenses.css';

interface Category {
  id: number;
  name: string;
}

interface Item {
  id: number;
  name: string;
}

interface Expense {
  id: number;
  expensesNo: string;
  date: string;
  amount: number;
  paymentMode: string;
  remarks: string | null;
  photoPath: string | null;
  category: Category;
  item: Item;
}

export const AddExpenses = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const initialData = location.state?.expense as Expense | undefined;
  const isEditMode = !!initialData;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [itemSearch, setItemSearch] = useState('');
  const [showItemDropdown, setShowItemDropdown] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [categorySearchQuery, setCategorySearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    expensesNo: '',
    date: '',
    categoryId: 0,
    itemId: '',
    paymentMode: '',
    amount: '',
    remarks: '',
    photo: null as File | null,
  });

  useEffect(() => {
    const fetchData = async () => {
      try { 
        const [categoriesData, itemsData, lastExpensesData] = await Promise.all([
          fetchCategories(),
          fetchItems(),
          fetchLastExpenses()
        ]);
        setCategories(categoriesData);
        setItems(itemsData.items);

        if (isEditMode) {
          setFormData(prev => ({
            ...prev,
            expensesNo: initialData.expensesNo,
            date: initialData.date,
            amount: initialData.amount.toString(),
            paymentMode: initialData.paymentMode,
            remarks: initialData.remarks || '',
          }));
          setSelectedCategory(initialData.category);
          setSelectedItem(initialData.item);
          setCategorySearchQuery(initialData.category.name);
          setItemSearch(initialData.item.name);
          if (initialData.photoPath) {
            setSelectedImage(initialData.photoPath);
          }
        } else {
          // Handle last expenses number
          const lastNumber = lastExpensesData.lastExpensesNo || '0';
          const nextNumber = parseInt(lastNumber.replace(billsConfig.expenses.prefix, '')) + 1;
          const paddedNumber = nextNumber.toString().padStart(billsConfig.expenses.padding, '0');
          const newExpensesNo = `${billsConfig.expenses.prefix}${paddedNumber}`;
          
          setFormData(prev => ({
            ...prev,
            expensesNo: newExpensesNo
          }));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred while fetching data');
      }
    };

    fetchData();
  }, [isEditMode, initialData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        photo: file
      }));
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('expensesNo', formData.expensesNo);
      formDataToSend.append('date', formData.date);
      formDataToSend.append('categoryId', formData.categoryId.toString());
      formDataToSend.append('itemId', formData.itemId);
      formDataToSend.append('paymentMode', formData.paymentMode);
      formDataToSend.append('amount', formData.amount);
      formDataToSend.append('remarks', formData.remarks);
      if (formData.photo) {
        formDataToSend.append('photo', formData.photo);
      }

      await saveExpense(formDataToSend, isEditMode, initialData?.id);
      navigate('/bills/expenses');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while saving expense');
    } finally {
      setLoading(false);
    }
  };

  const handleItemSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setItemSearch(value);
    setShowItemDropdown(true);
    setFormData(prev => ({
      ...prev,
      itemId: ''
    }));
    setSelectedItem(null);
  };

  const handleItemSelect = (item: Item) => {
    setSelectedItem(item);
    setItemSearch(item.name);
    setShowItemDropdown(false);
    setFormData(prev => ({
      ...prev,
      itemId: item.id.toString()
    }));
  };

  const handleCategorySearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCategorySearchQuery(value);
    setShowCategoryDropdown(true);
    setFormData(prev => ({
      ...prev,
      categoryId: 0
    }));
    setSelectedCategory(null);
  };

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
    setCategorySearchQuery(category.name);
    setShowCategoryDropdown(false);
    setFormData(prev => ({
      ...prev,
      categoryId: category.id
    }));
  };

  const handleCategoryBlur = () => {
    setTimeout(() => {
      setShowCategoryDropdown(false);
    }, 200);
  };

  const handleAddCategory = () => {
    setShowCategoryModal(true);
  };

  const handleAddItem = () => {
    setShowItemModal(true);
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(categorySearchQuery.toLowerCase())
  );

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(itemSearch.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div className="add-expenses-container">
        <Navbar />
        <div className="add-expenses-card">
          <h1 className="add-expenses-title">
            <i className="bi bi-plus-circle"></i>
            {isEditMode ? 'Edit Expense' : 'Add New Expense'}
          </h1>
          
          {error && (
            <div className="add-expenses-error">
              <i className="bi bi-exclamation-triangle"></i>
              {error}
            </div>
          )}

          <form className="add-expenses-form" onSubmit={handleSubmit}>
            <div className="add-expenses-row">
              <div className="add-expenses-group">
                <label className="add-expenses-label">
                  <i className="bi bi-hash"></i>
                  Expense No.
                </label>
                <input
                  type="text"
                  name="expensesNo"
                  value={formData.expensesNo}
                  onChange={handleInputChange}
                  className="add-expenses-input"
                  required
                  disabled
                />
              </div>
              <div className="add-expenses-group">
                <label className="add-expenses-label">
                  <i className="bi bi-calendar"></i>
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="add-expenses-input"
                  required
                />
              </div>
            </div>

            <div className="add-expenses-group">
              <label className="add-expenses-label">
                <i className="bi bi-tag"></i>
                Expense Category
              </label>
              <div className="add-expenses-dropdown">
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <input
                    type="text"
                    placeholder="Search category..."
                    value={categorySearchQuery}
                    onChange={handleCategorySearch}
                    onFocus={() => setShowCategoryDropdown(true)}
                    onBlur={handleCategoryBlur}
                    className="add-expenses-dropdown-input"
                  />
                  <button 
                    type="button" 
                    className="add-expenses-button add-expenses-secondary-button"
                    onClick={handleAddCategory}
                  >
                    <i className="bi bi-plus"></i>
                    Add Category
                  </button>
                </div>
                {showCategoryDropdown && categorySearchQuery && (
                  <div className="add-expenses-dropdown-list">
                    {filteredCategories.length > 0 ? (
                      filteredCategories.map(category => (
                        <div
                          key={category.id}
                          onClick={() => handleCategorySelect(category)}
                          className="add-expenses-dropdown-item"
                        >
                          {category.name}
                        </div>
                      ))
                    ) : (
                      <div style={{ padding: '0.75rem', color: '#6c757d' }}>
                        No categories found
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="add-expenses-group">
              <label className="add-expenses-label">
                <i className="bi bi-box"></i>
                Item Name
              </label>
              <div className="add-expenses-dropdown">
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <input
                    type="text"
                    placeholder="Search item..."
                    value={itemSearch}
                    onChange={handleItemSearch}
                    onFocus={() => setShowItemDropdown(true)}
                    onBlur={() => setTimeout(() => setShowItemDropdown(false), 200)}
                    className="add-expenses-dropdown-input"
                  />
                  <button 
                    type="button" 
                    className="add-expenses-button add-expenses-secondary-button"
                    onClick={handleAddItem}
                  >
                    <i className="bi bi-plus"></i>
                    Add Item
                  </button>
                </div>
                {showItemDropdown && itemSearch && (
                  <div className="add-expenses-dropdown-list">
                    {filteredItems.length > 0 ? (
                      filteredItems.map(item => (
                        <div
                          key={item.id}
                          onClick={() => handleItemSelect(item)}
                          className="add-expenses-dropdown-item"
                        >
                          {item.name}
                        </div>
                      ))
                    ) : (
                      <div style={{ padding: '0.75rem', color: '#6c757d' }}>
                        No items found
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="add-expenses-row">
              <div className="add-expenses-group">
                <label className="add-expenses-label">
                  <i className="bi bi-credit-card"></i>
                  Payment Mode
                </label>
                <select
                  name="paymentMode"
                  value={formData.paymentMode}
                  onChange={handleInputChange}
                  className="add-expenses-select"
                  required
                >
                  <option value="">Select Payment Mode</option>
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="upi">UPI</option>
                </select>
              </div>
              <div className="add-expenses-group">
                <label className="add-expenses-label">
                  <i className="bi bi-currency-rupee"></i>
                  Amount
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  className="add-expenses-input"
                  required
                  placeholder="Enter amount"
                />
              </div>
            </div>

            <div className="add-expenses-group">
              <label className="add-expenses-label">
                <i className="bi bi-chat-text"></i>
                Remarks
              </label>
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleInputChange}
                className="add-expenses-textarea"
                placeholder="Enter remarks..."
              />
            </div>

            <div className="add-expenses-group">
              <label className="add-expenses-label">
                <i className="bi bi-image"></i>
                Photo
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="add-expenses-file-input"
                id="photo-upload"
              />
              <label htmlFor="photo-upload" className="add-expenses-file-label">
                <i className="bi bi-cloud-upload"></i>
                Choose Photo
              </label>
              {selectedImage && (
                <img src={selectedImage} alt="Preview" className="add-expenses-image-preview" />
              )}
            </div>

            <div className="add-expenses-button-container">
              <button 
                type="button"
                className="add-expenses-cancel-button"
                onClick={() => navigate('/bills/expenses')}
              >
                <i className="bi bi-x-circle"></i>
                Cancel
              </button>
              <button 
                type="submit" 
                className="add-expenses-submit-button"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="add-expenses-spinner"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle"></i>
                    {isEditMode ? 'Update Expense' : 'Save Expense'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}; 