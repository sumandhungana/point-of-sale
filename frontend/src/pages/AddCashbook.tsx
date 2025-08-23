import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { fetchCategories, fetchItems, createCashbookEntry } from '../services/cashbookService';
import '../styles/AddCashbook.css';

interface Category {
  id: number;
  name: string;
}

interface Item {
  id: number;
  name: string;
}

export const AddCashbook = () => {
  const navigate = useNavigate();
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
    cashbookNo: '',
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
        const [categoriesData, itemsData] = await Promise.all([
          fetchCategories(),
          fetchItems()
        ]);
        setCategories(categoriesData);
        setItems(itemsData.items);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred while fetching data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
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
      formDataToSend.append('cashbookNo', formData.cashbookNo);
      formDataToSend.append('date', formData.date);
      formDataToSend.append('categoryId', selectedCategory?.id.toString() || '');
      formDataToSend.append('itemId', selectedItem?.id.toString() || '');
      formDataToSend.append('paymentMode', formData.paymentMode);
      formDataToSend.append('amount', formData.amount.toString());
      formDataToSend.append('remarks', formData.remarks || '');
      
      if (formData.photo) {
        formDataToSend.append('photo', formData.photo);
      }

      await createCashbookEntry(formDataToSend);
      alert('Cashbook entry created successfully!');
      navigate('/bills/cashbook');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = () => {
    navigate(`/category/add/cashbook`);
  };

  const handleAddItem = () => {
    setShowItemModal(true);
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

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(itemSearch.toLowerCase())
  );

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(categorySearchQuery.toLowerCase())
  );

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

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div className="add-cashbook-container">
        <Navbar />
        <div className="add-cashbook-card">
          <h1 className="add-cashbook-title">
            <i className="bi bi-plus-circle"></i>
            Add New Cashbook
          </h1>
          {error && (
            <div className="add-cashbook-error">
              <i className="bi bi-exclamation-triangle"></i>
              {error}
            </div>
          )}
          <form className="add-cashbook-form" onSubmit={handleSubmit}>
            <div className="add-cashbook-row">
              <div className="add-cashbook-group">
                <label className="add-cashbook-label">
                  <i className="bi bi-hash"></i>
                  Cashbook No.
                </label>
                <input
                  type="text"
                  name="cashbookNo"
                  value={formData.cashbookNo}
                  onChange={handleInputChange}
                  className="add-cashbook-input"
                  required
                />
              </div>
              <div className="add-cashbook-group">
                <label className="add-cashbook-label">
                  <i className="bi bi-calendar"></i>
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="add-cashbook-input"
                  required
                />
              </div>
            </div>

            <div className="add-cashbook-group">
              <label className="add-cashbook-label">
                <i className="bi bi-tag"></i>
                Cashbook Category
              </label>
              <div className="add-cashbook-dropdown">
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <input
                    type="text"
                    placeholder="Search category..."
                    value={categorySearchQuery}
                    onChange={handleCategorySearch}
                    onFocus={() => setShowCategoryDropdown(true)}
                    onBlur={handleCategoryBlur}
                    className="add-cashbook-dropdown-input"
                  />
                  <button
                    type="button"
                    className="add-cashbook-button add-cashbook-secondary-button"
                    onClick={handleAddCategory}
                  >
                    <i className="bi bi-plus"></i>
                    Add Category
                  </button>
                </div>
                {showCategoryDropdown && categorySearchQuery && (
                  <div className="add-cashbook-dropdown-list">
                    {filteredCategories.length > 0 ? (
                      filteredCategories.map(category => (
                        <div
                          key={category.id}
                          onClick={() => handleCategorySelect(category)}
                          className="add-cashbook-dropdown-item"
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

            <div className="add-cashbook-group">
              <label className="add-cashbook-label">
                <i className="bi bi-box"></i>
                Item Name
              </label>
              <div className="add-cashbook-dropdown">
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <input
                    type="text"
                    placeholder="Search item..."
                    value={itemSearch}
                    onChange={handleItemSearch}
                    onFocus={() => setShowItemDropdown(true)}
                    onBlur={() => setTimeout(() => setShowItemDropdown(false), 200)}
                    className="add-cashbook-dropdown-input"
                  />
                  <button
                    type="button"
                    className="add-cashbook-button add-cashbook-secondary-button"
                    onClick={handleAddItem}
                  >
                    <i className="bi bi-plus"></i>
                    Add Item
                  </button>
                </div>
                {showItemDropdown && itemSearch && (
                  <div className="add-cashbook-dropdown-list">
                    {filteredItems.length > 0 ? (
                      filteredItems.map(item => (
                        <div
                          key={item.id}
                          onClick={() => handleItemSelect(item)}
                          className="add-cashbook-dropdown-item"
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

            <div className="add-cashbook-row">
              <div className="add-cashbook-group">
                <label className="add-cashbook-label">
                  <i className="bi bi-credit-card"></i>
                  Payment Mode
                </label>
                <select
                  name="paymentMode"
                  value={formData.paymentMode}
                  onChange={handleInputChange}
                  className="add-cashbook-select"
                  required
                >
                  <option value="">Select Payment Mode</option>
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="upi">UPI</option>
                </select>
              </div>
              <div className="add-cashbook-group">
                <label className="add-cashbook-label">
                  <i className="bi bi-currency-rupee"></i>
                  Amount
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  className="add-cashbook-input"
                  required
                  placeholder="Enter amount"
                />
              </div>
            </div>

            <div className="add-cashbook-group">
              <label className="add-cashbook-label">
                <i className="bi bi-chat-text"></i>
                Remarks
              </label>
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleInputChange}
                className="add-cashbook-textarea"
                placeholder="Enter remarks..."
              />
            </div>

            <div className="add-cashbook-group">
              <label className="add-cashbook-label">
                <i className="bi bi-image"></i>
                Photo
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="add-cashbook-file-input"
                id="photo-upload"
              />
              <label htmlFor="photo-upload" className="add-cashbook-file-label">
                <i className="bi bi-cloud-upload"></i>
                Choose Photo
              </label>
              {selectedImage && (
                <img src={selectedImage} alt="Preview" className="add-cashbook-image-preview" />
              )}
            </div>

            <div className="add-cashbook-button-container">
              <button
                type="button"
                className="add-cashbook-cancel-button"
                onClick={() => navigate('/bills/cashbook')}
              >
                <i className="bi bi-x-circle"></i>
                Cancel
              </button>
              <button
                type="submit"
                className="add-cashbook-submit-button"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="add-cashbook-spinner"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle"></i>
                    Save Cashbook
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