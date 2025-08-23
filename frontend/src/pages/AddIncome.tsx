import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { billsConfig } from '../config/bills';
import { fetchCategories, fetchItems, fetchLastIncome, saveIncome } from '../services/incomeService';
import '../styles/AddIncome.css';

interface Category {
  id: number;
  name: string;
}

interface Item {
  id: number;
  name: string;
}

interface Income {
  id: number;
  incomeNo: string;
  date: string;
  amount: number;
  paymentMode: string;
  remarks: string | null;
  photoPath: string | null;
  category: Category;
  item: Item;
}

export const AddIncome = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const initialData = location.state?.income as Income | undefined;
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
    incomeNo: '',
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
        const [categoriesData, itemsData, lastIncomeData] = await Promise.all([
          fetchCategories(),
          fetchItems(),
          fetchLastIncome()
        ]);
        setCategories(categoriesData);
        setItems(itemsData.items);

        if (isEditMode) {
          setFormData(prev => ({
            ...prev,
            incomeNo: initialData.incomeNo,
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
          // Handle last income number
          const lastNumber = lastIncomeData.lastIncomeNo || '0';
          const nextNumber = parseInt(lastNumber.replace(billsConfig.income.prefix, '')) + 1;
          const paddedNumber = nextNumber.toString().padStart(billsConfig.income.padding, '0');
          const newIncomeNo = `${billsConfig.income.prefix}${paddedNumber}`;
          
          setFormData(prev => ({
            ...prev,
            incomeNo: newIncomeNo
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
      formDataToSend.append('incomeNo', formData.incomeNo);
      formDataToSend.append('date', formData.date);
      formDataToSend.append('categoryId', formData.categoryId.toString());
      formDataToSend.append('itemId', formData.itemId);
      formDataToSend.append('paymentMode', formData.paymentMode);
      formDataToSend.append('amount', formData.amount);
      formDataToSend.append('remarks', formData.remarks);
      if (formData.photo) {
        formDataToSend.append('photo', formData.photo);
      }

      await saveIncome(formDataToSend, isEditMode, initialData?.id);
      navigate('/bills/income');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while saving income');
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
      <div className="add-income-container">
        <Navbar />
        <div className="add-income-card">
          <h1 className="add-income-title">
            <i className="bi bi-plus-circle"></i>
            {isEditMode ? 'Edit Income' : 'Add New Income'}
          </h1>
          
          {error && (
            <div className="add-income-error">
              <i className="bi bi-exclamation-triangle"></i>
              {error}
            </div>
          )}

          <form className="add-income-form" onSubmit={handleSubmit}>
            <div className="add-income-row">
              <div className="add-income-group">
                <label className="add-income-label">
                  <i className="bi bi-hash"></i>
                  Income No.
                </label>
                <input
                  type="text"
                  name="incomeNo"
                  value={formData.incomeNo}
                  onChange={handleInputChange}
                  className="add-income-input"
                  required
                  disabled
                />
              </div>
              <div className="add-income-group">
                <label className="add-income-label">
                  <i className="bi bi-calendar"></i>
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="add-income-input"
                  required
                />
              </div>
            </div>

            <div className="add-income-group">
              <label className="add-income-label">
                <i className="bi bi-tag"></i>
                Income Category
              </label>
              <div className="add-income-dropdown">
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <input
                    type="text"
                    placeholder="Search category..."
                    value={categorySearchQuery}
                    onChange={handleCategorySearch}
                    onFocus={() => setShowCategoryDropdown(true)}
                    onBlur={handleCategoryBlur}
                    className="add-income-dropdown-input"
                  />
                  <button 
                    type="button" 
                    className="add-income-button add-income-secondary-button"
                    onClick={handleAddCategory}
                  >
                    <i className="bi bi-plus"></i>
                    Add Category
                  </button>
                </div>
                {showCategoryDropdown && categorySearchQuery && (
                  <div className="add-income-dropdown-list">
                    {filteredCategories.length > 0 ? (
                      filteredCategories.map(category => (
                        <div
                          key={category.id}
                          onClick={() => handleCategorySelect(category)}
                          className="add-income-dropdown-item"
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

            <div className="add-income-group">
              <label className="add-income-label">
                <i className="bi bi-box"></i>
                Item Name
              </label>
              <div className="add-income-dropdown">
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <input
                    type="text"
                    placeholder="Search item..."
                    value={itemSearch}
                    onChange={handleItemSearch}
                    onFocus={() => setShowItemDropdown(true)}
                    onBlur={() => setTimeout(() => setShowItemDropdown(false), 200)}
                    className="add-income-dropdown-input"
                  />
                  <button 
                    type="button" 
                    className="add-income-button add-income-secondary-button"
                    onClick={handleAddItem}
                  >
                    <i className="bi bi-plus"></i>
                    Add Item
                  </button>
                </div>
                {showItemDropdown && itemSearch && (
                  <div className="add-income-dropdown-list">
                    {filteredItems.length > 0 ? (
                      filteredItems.map(item => (
                        <div
                          key={item.id}
                          onClick={() => handleItemSelect(item)}
                          className="add-income-dropdown-item"
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

            <div className="add-income-row">
              <div className="add-income-group">
                <label className="add-income-label">
                  <i className="bi bi-credit-card"></i>
                  Payment Mode
                </label>
                <select
                  name="paymentMode"
                  value={formData.paymentMode}
                  onChange={handleInputChange}
                  className="add-income-select"
                  required
                >
                  <option value="">Select Payment Mode</option>
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="upi">UPI</option>
                </select>
              </div>
              <div className="add-income-group">
                <label className="add-income-label">
                  <i className="bi bi-currency-rupee"></i>
                  Amount
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  className="add-income-input"
                  required
                  placeholder="Enter amount"
                />
              </div>
            </div>

            <div className="add-income-group">
              <label className="add-income-label">
                <i className="bi bi-chat-text"></i>
                Remarks
              </label>
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleInputChange}
                className="add-income-textarea"
                placeholder="Enter remarks..."
              />
            </div>

            <div className="add-income-group">
              <label className="add-income-label">
                <i className="bi bi-image"></i>
                Photo
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="add-income-file-input"
                id="photo-upload"
              />
              <label htmlFor="photo-upload" className="add-income-file-label">
                <i className="bi bi-cloud-upload"></i>
                Choose Photo
              </label>
              {selectedImage && (
                <img src={selectedImage} alt="Preview" className="add-income-image-preview" />
              )}
            </div>

            <div className="add-income-button-container">
              <button 
                type="button"
                className="add-income-cancel-button"
                onClick={() => navigate('/bills/income')}
              >
                <i className="bi bi-x-circle"></i>
                Cancel
              </button>
              <button 
                type="submit" 
                className="add-income-submit-button"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="add-income-spinner"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle"></i>
                    {isEditMode ? 'Update Income' : 'Save Income'}
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