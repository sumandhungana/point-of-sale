import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { billsConfig } from '../config/bills';
import { fetchCategories, fetchItems, fetchLastIncome } from '../services/incomeService';

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
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isEditMode, initialData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData(prev => ({
        ...prev,
        photo: file
      }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
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
      formDataToSend.append('IncomeNo', formData.incomeNo);
      formDataToSend.append('Date', formData.date);
      formDataToSend.append('CategoryId', selectedCategory?.id.toString() || '');
      formDataToSend.append('ItemId', selectedItem?.id.toString() || '');
      formDataToSend.append('PaymentMode', formData.paymentMode);
      formDataToSend.append('Amount', formData.amount.toString());
      formDataToSend.append('Remarks', formData.remarks || '');
      
      if (formData.photo) {
        formDataToSend.append('Photo', formData.photo);
      }
      if(isEditMode){
        formDataToSend.append('Id', initialData.id.toString());
      }
      const url = isEditMode ? `/api/Income/${initialData.id}` : '/api/Income';
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        body: formDataToSend,
      });

      if (response.status === 200 || response.status === 201) {
        alert(`Income entry ${isEditMode ? 'updated' : 'created'} successfully!`);
        navigate('/bills/income');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${isEditMode ? 'update' : 'create'} income entry`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = () => {
    navigate(`/category/add/income`);
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

  const styles = {
    container: {
      padding: '2rem',
      maxWidth: 'calc(100% - 500px)',
      marginRight: '500px',
      width: '100%',
    },
    card: {
      background: 'white',
      borderRadius: '8px',
      padding: '2rem',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    heading: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#495057',
      marginBottom: '2rem',
    },
    form: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '1.5rem',
    },
    row: {
      display: 'flex',
      gap: '2rem',
    },
    inputGroup: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '0.5rem',
    },
    label: {
      fontSize: '0.9rem',
      color: '#495057',
      fontWeight: '500',
    },
    input: {
      padding: '0.75rem',
      border: '1px solid #dee2e6',
      borderRadius: '4px',
      fontSize: '1rem',
    },
    select: {
      padding: '0.75rem',
      border: '1px solid #dee2e6',
      borderRadius: '4px',
      fontSize: '1rem',
      background: 'white',
    },
    textarea: {
      padding: '0.75rem',
      border: '1px solid #dee2e6',
      borderRadius: '4px',
      fontSize: '1rem',
      minHeight: '100px',
      resize: 'vertical' as const,
    },
    imagePreview: {
      width: '200px',
      height: '200px',
      objectFit: 'cover' as const,
      borderRadius: '4px',
      border: '1px solid #dee2e6',
    },
    searchContainer: {
      position: 'relative' as const,
      display: 'flex',
      gap: '0.5rem',
      marginBottom: '0.5rem',
    },
    dropdownContainer: {
      position: 'relative' as const,
      width: '100%',
    },
    dropdown: {
      position: 'absolute' as const,
      top: '100%',
      left: 0,
      right: 0,
      background: 'white',
      border: '1px solid #dee2e6',
      borderRadius: '4px',
      maxHeight: '200px',
      overflowY: 'auto' as const,
      zIndex: 1,
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    dropdownItem: {
      padding: '0.75rem',
      cursor: 'pointer',
      borderBottom: '1px solid #dee2e6',
      backgroundColor: 'white',
    },
    searchInput: {
      flex: 1,
      padding: '0.75rem',
      border: '1px solid #dee2e6',
      borderRadius: '4px',
      fontSize: '1rem',
    },
    addButton: {
      padding: '0.75rem 1rem',
      background: '#28a745',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '0.875rem',
      fontWeight: '500',
    },
    buttonGroup: {
      display: 'flex',
      justifyContent: 'flex-end',
      marginTop: '2rem',
    },
    saveButton: {
      padding: '0.75rem 1.5rem',
      background: '#28a745',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      fontSize: '1rem',
      fontWeight: '500',
      cursor: 'pointer',
    },
    errorMessage: {
      color: 'red',
      marginBottom: '1rem',
    },
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ 
        flex: 1, 
        paddingTop: '40px', 
        marginLeft: '50px',
        
        minHeight: '100vh',
        background: '#f8f9fa',
      }}>
        <Navbar />
        <div style={styles.container}>
          <div style={styles.card}>
            <h1 style={styles.heading}>{isEditMode ? 'Edit Income' : 'Add New Income'}</h1>
            <form style={styles.form} onSubmit={handleSubmit}>
              <div style={styles.row}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Income No.</label>
                  <input
                    type="text"
                    name="incomeNo"
                    value={formData.incomeNo}
                    onChange={handleInputChange}
                    style={styles.input}
                    required
                    disabled
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Date</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    style={styles.input}
                    required
                  />
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Income Category</label>
                <div style={styles.dropdownContainer}>
                  <div style={styles.searchContainer}>
                    <input
                      type="text"
                      placeholder="Search category..."
                      value={categorySearchQuery}
                      onChange={handleCategorySearch}
                      onFocus={() => setShowCategoryDropdown(true)}
                      onBlur={handleCategoryBlur}
                      style={styles.searchInput}
                    />
                    <button type="button" style={styles.addButton} onClick={handleAddCategory}>
                      Add Category
                    </button>
                  </div>
                  {showCategoryDropdown && categorySearchQuery && (
                    <div style={styles.dropdown}>
                      {filteredCategories.length > 0 ? (
                        filteredCategories.map(category => (
                          <div
                            key={category.id}
                            onClick={() => handleCategorySelect(category)}
                            style={styles.dropdownItem}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#f8f9fa';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'white';
                            }}
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

              <div style={styles.inputGroup}>
                <label style={styles.label}>Item Name</label>
                <div style={styles.dropdownContainer}>
                  <div style={styles.searchContainer}>
                    <input
                      type="text"
                      placeholder="Search item..."
                      value={itemSearch}
                      onChange={handleItemSearch}
                      onFocus={() => setShowItemDropdown(true)}
                      onBlur={() => setTimeout(() => setShowItemDropdown(false), 200)}
                      style={styles.searchInput}
                    />
                    <button type="button" style={styles.addButton} onClick={handleAddItem}>
                      Add Item
                    </button>
                  </div>
                  {showItemDropdown && itemSearch && (
                    <div style={styles.dropdown}>
                      {filteredItems.length > 0 ? (
                        filteredItems.map(item => (
                          <div
                            key={item.id}
                            onClick={() => handleItemSelect(item)}
                            style={styles.dropdownItem}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#f8f9fa';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'white';
                            }}
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

              <div style={styles.inputGroup}>
                <label style={styles.label}>Payment Mode</label>
                <select
                  name="paymentMode"
                  value={formData.paymentMode}
                  onChange={handleInputChange}
                  style={styles.select}
                  required
                >
                  <option value="">Select Payment Mode</option>
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="upi">UPI</option>
                </select>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Amount</label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Remarks</label>
                <textarea
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleInputChange}
                  style={styles.textarea}
                  placeholder="Enter remarks..."
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={styles.input}
                />
                {selectedImage && (
                  <img src={selectedImage} alt="Preview" style={styles.imagePreview} />
                )}
              </div>

              {error && (
                <div style={styles.errorMessage}>
                  {error}
                </div>
              )}

              <div style={styles.buttonGroup}>
                <button 
                  type="submit" 
                  style={styles.saveButton}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : isEditMode ? 'Edit Income' : 'Save Income'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}; 