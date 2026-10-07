import React, { useState, useEffect, useRef } from "react";
import {
    CategoryItem,
    CategoryTypeEnum,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    AddCategoryRequest
} from "../../services/categoryService";
import "../../../styles/Categories.css";

const CATEGORY_TYPES: CategoryTypeEnum[] = ["GENERAL", "INCOME", "EXPENSE", "PURCHASE", "CASHBOOK"];

const getInitials = (name: string): string => {
    if (!name) return "CAT";
    const words = name.trim().split(" ");
    if (words.length >= 2) {
        return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
};

export const Categories: React.FC = () => {
    const [categories, setCategories] = useState<CategoryItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [selectedTab, setSelectedTab] = useState<string>("ALL");

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [isEditMode, setIsEditMode] = useState<boolean>(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    // Form inputs state
    const [name, setName] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [categoryType, setCategoryType] = useState<CategoryTypeEnum>("GENERAL");
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>("");

    const isFetchedRef = useRef(false);

    useEffect(() => {
        if (isFetchedRef.current) return;
        isFetchedRef.current = true;
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const data = await fetchCategories();
        setCategories(data);
        setLoading(false);
    };

    const handleOpenAddModal = () => {
        setIsEditMode(false);
        setEditingId(null);
        setName("");
        setDescription("");
        setCategoryType("GENERAL");
        setErrorMessage("");
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (category: CategoryItem) => {
        setIsEditMode(true);
        setEditingId(category.id ?? null);
        setName(category.name);
        setDescription(category.description || "");
        setCategoryType(category.categoryType);
        setErrorMessage("");
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setErrorMessage("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            setErrorMessage("Category name is required.");
            return;
        }

        setSubmitting(true);
        setErrorMessage("");

        const payload: AddCategoryRequest = {
            name: name.trim(),
            description: description.trim(),
            categoryType,
        };

        let success = false;
        if (isEditMode && editingId) {
            success = await updateCategory(editingId, payload);
        } else {
            success = await createCategory(payload);
        }

        setSubmitting(false);

        if (success) {
            handleCloseModal();
            loadData();
        } else {
            setErrorMessage(isEditMode ? "Failed to update category." : "Failed to create category.");
        }
    };

    const handleDelete = async (id?: number) => {
        if (!id) return;
        if (window.confirm("Are you sure you want to delete this category?")) {
            const success = await deleteCategory(id);
            if (success) {
                loadData();
            } else {
                alert("Failed to delete category.");
            }
        }
    };

    const filteredCategories = selectedTab === "ALL"
        ? categories
        : categories.filter(c => c.categoryType === selectedTab);

    return (
        <div className="category-management-content">
            {/* Filter Tabs */}
            <div className="tab-container">
                <button
                    className={`tab-btn ${selectedTab === "ALL" ? "active" : ""}`}
                    onClick={() => setSelectedTab("ALL")}
                >
                    All Categories
                </button>
                {CATEGORY_TYPES.map(type => (
                    <button
                        key={type}
                        className={`tab-btn ${selectedTab === type ? "active" : ""}`}
                        onClick={() => setSelectedTab(type)}
                    >
                        {type}
                    </button>
                ))}
            </div>

            {/* List View */}
            <div className="category-card-list">
                {loading ? (
                    <div className="loading-container">Loading categories...</div>
                ) : filteredCategories.length === 0 ? (
                    <div className="empty-container">No categories found.</div>
                ) : (
                    filteredCategories.map((cat, index) => (
                        <div className="category-item-card" key={cat.id || index}>
                            <div className="category-card-left">
                                <div className={`category-avatar ${cat.categoryType?.toLowerCase()}`}>
                                    {getInitials(cat.name)}
                                </div>
                                <div className="category-info">
                                    <div className="category-title-row">
                                        <span className="category-name">{cat.name}</span>
                                        <span className="category-id">#{cat.id ?? (index + 1)}</span>
                                    </div>
                                    <div className="category-description">
                                        {cat.description ? `Description: ${cat.description}` : "No description provided"}
                                    </div>
                                </div>
                            </div>

                            <div className="category-card-right">
                            <span className={`badge-role badge-type-${cat.categoryType?.toLowerCase()}`}>
                                {cat.categoryType}
                            </span>
                                <div className="category-actions">
                                    <button
                                        className="btn-action btn-edit"
                                        onClick={() => handleOpenEditModal(cat)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="btn-action btn-delete"
                                        onClick={() => handleDelete(cat.id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Sticky Floating Add Category Button */}
            <button className="btn-add-category-sticky" onClick={handleOpenAddModal}>
                + Add Category
            </button>

            {/* Modal Dialog */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>{isEditMode ? "Edit Category" : "Add New Category"}</h3>
                            <button className="btn-close-modal" onClick={handleCloseModal}>&times;</button>
                        </div>
                        <form className="modal-form" onSubmit={handleSubmit}>
                            {errorMessage && <div className="form-error">{errorMessage}</div>}

                            <div className="form-group">
                                <label>Category Name <span className="required">*</span></label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="e.g. Raw Materials"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Category Type <span className="required">*</span></label>
                                <select
                                    className="form-control"
                                    value={categoryType}
                                    onChange={(e) => setCategoryType(e.target.value as CategoryTypeEnum)}
                                >
                                    {CATEGORY_TYPES.map((type) => (
                                        <option key={type} value={type}>
                                            {type}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    className="form-control form-textarea"
                                    placeholder="Add brief details about this category..."
                                    rows={3}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={handleCloseModal}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-submit" disabled={submitting}>
                                    {submitting ? "Saving..." : isEditMode ? "Update Category" : "Save Category"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};