import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useNavigate, useParams } from 'react-router-dom';
import { createCategory } from '../services/categoryService';
import '../styles/AddCategory.css';

export const AddCategory = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { pageName } = useParams();
  const categoryEnum = {
    income: 1,
    expenses: 2,
    purchase: 3,
    cashbook: 4,
  }
  const categoryType = categoryEnum[pageName as keyof typeof categoryEnum];

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryType: categoryType
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      await createCategory(formData);
      alert('Category created successfully!');
      navigate(-1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-category-page-wrapper">
      <Sidebar />
      <div className="add-category-container">
        <Navbar />
        <div className="add-category-card">
          <h1 className="add-category-title">
            <i className="bi bi-plus-circle"></i>
            Add Category
          </h1>
          {error && (
            <div className="add-category-error">
              <i className="bi bi-exclamation-triangle"></i>
              {error}
            </div>
          )}
          <form className="add-category-form" onSubmit={handleSubmit}>
            <div className="add-category-group">
              <label className="add-category-label">
                <i className="bi bi-tag"></i>
                Category Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="add-category-input"
                required
                placeholder="Enter category name"
              />
            </div>

            <div className="add-category-group">
              <label className="add-category-label">
                <i className="bi bi-chat-text"></i>
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="add-category-textarea"
                placeholder="Enter category description"
              />
            </div>

            <div className="add-category-button-container">
              <button
                type="button"
                className="add-category-cancel-button"
                onClick={() => navigate(-1)}
              >
                <i className="bi bi-x-circle"></i>
                Cancel
              </button>
              <button 
                type="submit" 
                className="add-category-submit-button"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="add-category-spinner"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle"></i>
                    Save Category
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