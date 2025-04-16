import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import Navbar from '../components/Navbar';

interface Category {
  id: number;
  name: string;
}

export const AddItem = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    primaryUnit: '',
    secondaryUnit: '',
    isSecondaryUnitEnabled: false,
    categoryId: '',
    salesPrice: '',
    purchasePrice: '',
    taxIncluded: false,
    openingStock: '',
    lowStockAlert: '',
    vatPercentage: '',
    vatPercentageToday: '',
    imageUrl: '',
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/Category');
        const data = await response.json();
        setCategories(data);
      } catch (err) {
        setError('Failed to fetch categories');
        console.error('Error fetching categories:', err);
      }
    };

    fetchCategories();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/Item', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
        ...formData,
        categoryId: parseInt(formData.categoryId),
        salesPrice: parseFloat(formData.salesPrice),
        purchasePrice: parseFloat(formData.purchasePrice),
        openingStock: parseFloat(formData.openingStock),
        lowStockAlert: parseFloat(formData.lowStockAlert),
        vatPercentage: parseFloat(formData.vatPercentage),
        vatPercentageToday: parseFloat(formData.vatPercentage),
      }),
    });

      if (response.status === 200 || response.status === 201) {
        // Reset form after successful submission
        setFormData({
          name: '',
          primaryUnit: '',
          secondaryUnit: '',
          isSecondaryUnitEnabled: false,
          categoryId: '',
          salesPrice: '',
          purchasePrice: '',
          taxIncluded: false,
          openingStock: '',
          lowStockAlert: '',
          vatPercentage: '',
          vatPercentageToday: '',
          imageUrl: '',
        });
        alert('Item created successfully!');
      }
    } catch (err) {
      setError('Failed to create item');
      console.error('Error creating item:', err);
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: {
      width: '100%',
      padding: '2rem',
    },
    card: {
      background: 'white',
      borderRadius: '8px',
      padding: '2rem',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      display: 'flex',
      gap: '2rem',
      alignItems: 'flex-start',
      marginBottom: '2rem',
    },
    section: {
      background: 'white',
      borderRadius: '8px',
      padding: '2rem',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      marginBottom: '2rem',
    },
    sectionTitle: {
      fontSize: '1.25rem',
      fontWeight: 'bold',
      color: '#212529',
      marginBottom: '1.5rem',
    },
    photoSection: {
      width: '200px',
      height: '200px',
      border: '2px dashed #dee2e6',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      position: 'relative' as const,
    },
    photoPlaceholder: {
      textAlign: 'center' as const,
      color: '#6c757d',
    },
    photoIcon: {
      fontSize: '3rem',
      marginBottom: '0.5rem',
    },
    formSection: {
      flex: 1,
    },
    formGroup: {
      marginBottom: '1.5rem',
    },
    label: {
      display: 'block',
      marginBottom: '0.5rem',
      color: '#495057',
      fontSize: '0.9rem',
    },
    input: {
      width: '100%',
      padding: '0.75rem',
      border: '1px solid #dee2e6',
      borderRadius: '4px',
      fontSize: '1rem',
    },
    unitsContainer: {
      display: 'flex',
      marginBottom: '1.5rem',
      alignItems: 'center',
    },
    primaryUnitContainer: {
      flex: 2,
      marginRight: '1rem',
    },
    secondaryUnitContainer: {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
    },
    unitInput: {
      width: '100%',
      padding: '0.75rem',
      border: '1px solid #dee2e6',
      borderRadius: '4px',
      fontSize: '1rem',
    },
    select: {
      width: '100%',
      padding: '0.75rem',
      border: '1px solid #dee2e6',
      borderRadius: '4px',
      fontSize: '1rem',
      background: 'white',
    },
    slideContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
    },
    slideButton: {
      width: '60px',
      height: '30px',
      background: '#6c757d',
      borderRadius: '15px',
      position: 'relative' as const,
      cursor: 'pointer',
    },
    slideCircle: {
      width: '26px',
      height: '26px',
      background: 'white',
      borderRadius: '50%',
      position: 'absolute' as const,
      top: '2px',
      left: '2px',
      transition: 'transform 0.3s ease',
    },
    secondaryUnitSlideButton: {
      width: '60px',
      height: '30px',
      background: formData.isSecondaryUnitEnabled ? '#28a745' : '#6c757d',
      borderRadius: '15px',
      position: 'relative' as const,
      cursor: 'pointer',
    },
    secondaryUnitSlideCircle: {
      width: '26px',
      height: '26px',
      background: 'white',
      borderRadius: '50%',
      position: 'absolute' as const,
      top: '2px',
      left: formData.isSecondaryUnitEnabled ? '32px' : '2px',
      transition: 'transform 0.3s ease',
    },
    taxSlideButton: {
      width: '60px',
      height: '30px',
      background: formData.taxIncluded ? '#28a745' : '#6c757d',
      borderRadius: '15px',
      position: 'relative' as const,
      cursor: 'pointer',
    },
    taxSlideCircle: {
      width: '26px',
      height: '26px',
      background: 'white',
      borderRadius: '50%',
      position: 'absolute' as const,
      top: '2px',
      left: formData.taxIncluded ? '32px' : '2px',
      transition: 'transform 0.3s ease',
    },
    vatSlideButton: {
      width: '60px',
      height: '30px',
      background: formData.vatPercentage ? '#28a745' : '#6c757d',
      borderRadius: '15px',
      position: 'relative' as const,
      cursor: 'pointer',
    },
    vatSlideCircle: {
      width: '26px',
      height: '26px',
      background: 'white',
      borderRadius: '50%',
      position: 'absolute' as const,
      top: '2px',
      left: formData.vatPercentage ? '32px' : '2px',
      transition: 'transform 0.3s ease',
    },
    priceContainer: {
      display: 'flex',
      gap: '1rem',
    },
    priceField: {
      flex: 1,
    },
    taxContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1.5rem',
    },
    taxLabel: {
      fontSize: '1rem',
      color: '#495057',
      fontWeight: 'bold',
    },
    stockContainer: {
      display: 'flex',
      gap: '1rem',
    },
    stockField: {
      flex: 1,
    },
    vatContainer: {
      display: 'flex',
      gap: '1rem',
      marginBottom: '1.5rem',
    },
    vatField: {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    vatLabel: {
      fontSize: '1rem',
      color: '#495057',
      fontWeight: 'bold',
      marginBottom: '0.5rem',
    },
    saveButton: {
      width: '100%',
      padding: '1rem',
      background: '#28a745',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      fontSize: '1rem',
      fontWeight: 'bold',
      cursor: 'pointer',
      marginTop: '2rem',
    },
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ 
        flex: 1, 
        paddingTop: '60px',
        minHeight: '100vh',
        background: '#f8f9fa',
      }}>
        <Navbar />
        <div style={styles.container}>
          <form onSubmit={handleSubmit}>
            <div style={styles.card}>
              <div style={styles.photoSection}>
                <div style={styles.photoPlaceholder}>
                  <div style={styles.photoIcon}>📷</div>
                  <div>Add Item Photo</div>
                </div>
              </div>
              <div style={styles.formSection}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Item Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    style={styles.input}
                    placeholder="Enter item name"
                    required
                  />
                </div>
                <div style={styles.unitsContainer}>
                  <div style={styles.primaryUnitContainer}>
                    <label style={styles.label}>Primary Unit</label>
                    <input
                      type="text"
                      name="primaryUnit"
                      value={formData.primaryUnit}
                      onChange={handleInputChange}
                      style={styles.unitInput}
                      placeholder="e.g., kg"
                      required
                    />
                  </div>
                  <div style={styles.secondaryUnitContainer}>
                    <div style={{ flex: 1 }}>
                      <label style={styles.label}>Secondary Unit</label>
                      <select
                        name="secondaryUnit"
                        value={formData.secondaryUnit}
                        onChange={handleInputChange}
                        style={styles.select}
                        disabled={!formData.isSecondaryUnitEnabled}
                      >
                        <option value="">Select unit</option>
                        <option value="g">g</option>
                        <option value="mg">mg</option>
                        <option value="ml">ml</option>
                        <option value="l">l</option>
                        <option value="piece">piece</option>
                        <option value="dozen">dozen</option>
                      </select>
                    </div>
                    <div 
                      style={styles.secondaryUnitSlideButton}
                      onClick={() => setFormData(prev => ({ ...prev, isSecondaryUnitEnabled: !prev.isSecondaryUnitEnabled }))}
                    >
                      <div style={styles.secondaryUnitSlideCircle} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Select Items Category</h2>
              <div style={styles.formGroup}>
                <label style={styles.label}>Category</label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleInputChange}
                  style={styles.select}
                  required
                >
                  <option value="">Select category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div style={styles.priceContainer}>
                <div style={styles.priceField}>
                  <label style={styles.label}>Sales Price</label>
                  <input
                    type="number"
                    name="salesPrice"
                    value={formData.salesPrice}
                    onChange={handleInputChange}
                    style={styles.input}
                    placeholder="Enter sales price"
                    required
                    step="0.01"
                  />
                </div>
                <div style={styles.priceField}>
                  <label style={styles.label}>Purchase Price</label>
                  <input
                    type="number"
                    name="purchasePrice"
                    value={formData.purchasePrice}
                    onChange={handleInputChange}
                    style={styles.input}
                    placeholder="Enter purchase price"
                    required
                    step="0.01"
                  />
                </div>
              </div>
            </div>

            <div style={styles.section}>
              <div style={styles.taxContainer}>
                <h2 style={styles.taxLabel}>Tax Included</h2>
                <div 
                  style={styles.taxSlideButton}
                  onClick={() => setFormData(prev => ({ ...prev, taxIncluded: !prev.taxIncluded }))}
                >
                  <div style={styles.taxSlideCircle} />
                </div>
              </div>
              <div style={styles.stockContainer}>
                <div style={styles.stockField}>
                  <label style={styles.label}>Opening Stock</label>
                  <input
                    type="number"
                    name="openingStock"
                    value={formData.openingStock}
                    onChange={handleInputChange}
                    style={styles.input}
                    placeholder="Enter count"
                    required
                    step="0.01"
                  />
                </div>
                <div style={styles.stockField}>
                  <label style={styles.label}>Low Stock Alert</label>
                  <input
                    type="number"
                    name="lowStockAlert"
                    value={formData.lowStockAlert}
                    onChange={handleInputChange}
                    style={styles.input}
                    placeholder="Enter count"
                    required
                    step="0.01"
                  />
                </div>
              </div>
            </div>

            <div style={styles.section}>
              <div style={styles.vatContainer}>
                <div style={styles.vatField}>
                  <div style={{ flex: 1 }}>
                    <label style={styles.vatLabel}>VAT Percentage</label>
                    <input
                      type="number"
                      name="vatPercentage"
                      value={formData.vatPercentage}
                      onChange={handleInputChange}
                      style={styles.input}
                      placeholder="VAT %"
                      required
                      step="0.01"
                    />
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={styles.vatLabel}>Image URL</label>
                  <input
                    type="text"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleInputChange}
                    style={styles.input}
                    placeholder="Enter image URL"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div style={{ color: 'red', marginBottom: '1rem' }}>
                {error}
              </div>
            )}

            <button 
              type="submit" 
              style={styles.saveButton}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Item'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}; 