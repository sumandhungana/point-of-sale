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

export interface CategoriesRef {
    openAddModal: () => void;
}

export interface CategoriesProps {
    showHeader?: boolean;
}

export const Categories = React.forwardRef<CategoriesRef, CategoriesProps>(({ showHeader = false }, ref) => {
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

    React.useImperativeHandle(ref, () => ({
        openAddModal: handleOpenAddModal
    }));

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

    const [searchQuery, setSearchQuery] = useState<string>("");

    const filteredCategories = categories.filter((c) => {
        const matchesTab = selectedTab === "ALL" || c.categoryType === selectedTab;
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch =
            !q ||
            c.name.toLowerCase().includes(q) ||
            (c.description && c.description.toLowerCase().includes(q));
        return matchesTab && matchesSearch;
    });

    return (
        <div className="category-management-content">
            {showHeader && (
                <div className="inventory-page-header">
                    <div className="inventory-header-info">
                        <div className="inventory-header-icon">
                            <i className="bi bi-tags-fill" />
                        </div>
                        <div>
                            <h1 className="inventory-header-title">Category List</h1>
                        </div>
                    </div>

                    <div className="inventory-header-actions">
                        <button
                            type="button"
                            className="btn btn-primary btn-sm d-inline-flex align-items-center gap-1"
                            onClick={handleOpenAddModal}
                        >
                            <i className="bi bi-plus-lg" />
                            <span>Add Category</span>
                        </button>
                    </div>
                </div>
            )}
            {/* Stat Cards Summary (Synced with Products page layout) */}
            <div className="stat-card-grid">
                <div className="stat-card">
                    <div className="stat-icon-box navy">
                        <i className="bi bi-tags"></i>
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Total Categories</div>
                        <div className="stat-value">{categories.length} Categories</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon-box blue">
                        <i className="bi bi-check2-circle"></i>
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">In Current View</div>
                        <div className="stat-value">{filteredCategories.length} Active</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon-box navy">
                        <i className="bi bi-grid-3x3-gap"></i>
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Category Types</div>
                        <div className="stat-value">{CATEGORY_TYPES.length} Types</div>
                    </div>
                </div>
            </div>

            {/* Search & Filter Controls (Synced with Products page layout) */}
            <div className="filter-controls-card">
                <div className="filter-controls-grid">
                    <div className="search-input-wrapper">
                        <i className="bi bi-search search-icon"></i>
                        <input
                            type="text"
                            placeholder="Search category name or description..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="form-control search-input"
                        />
                    </div>

                    <div className="form-group-inline">
                        <label>Type:</label>
                        <select
                            value={selectedTab}
                            onChange={(e) => setSelectedTab(e.target.value)}
                            className="form-control"
                        >
                            <option value="ALL">All Categories ({categories.length})</option>
                            {CATEGORY_TYPES.map((t) => {
                                const count = categories.filter((c) => c.categoryType === t).length;
                                return (
                                    <option key={t} value={t}>
                                        {t} ({count})
                                    </option>
                                );
                            })}
                        </select>
                    </div>

                    {(selectedTab !== "ALL" || searchQuery) && (
                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => {
                                setSelectedTab("ALL");
                                setSearchQuery("");
                            }}
                        >
                            <i className="bi bi-arrow-counterclockwise me-1"></i> Reset
                        </button>
                    )}

                    <button
                        type="button"
                        className="btn-primary d-inline-flex align-items-center gap-1"
                        onClick={handleOpenAddModal}
                    >
                        <i className="bi bi-plus-lg"></i>
                        <span>Add Category</span>
                    </button>
                </div>
            </div>

            {/* Filter Tabs Pills */}
            <div className="tab-container">
                <button
                    className={`tab-btn ${selectedTab === "ALL" ? "active" : ""}`}
                    onClick={() => setSelectedTab("ALL")}
                >
                    All Categories ({categories.length})
                </button>
                {CATEGORY_TYPES.map((type) => {
                    const count = categories.filter((c) => c.categoryType === type).length;
                    return (
                        <button
                            key={type}
                            className={`tab-btn ${selectedTab === type ? "active" : ""}`}
                            onClick={() => setSelectedTab(type)}
                        >
                            {type} ({count})
                        </button>
                    );
                })}
            </div>

            {/* List View */}
            <div className="category-card-list">
                {loading ? (
                    <div className="loading-container py-4 text-center">
                        <i className="bi bi-arrow-repeat spin me-2"></i> Loading categories...
                    </div>
                ) : filteredCategories.length === 0 ? (
                    <div className="empty-container py-4 text-center text-muted">
                        <i className="bi bi-inbox me-2"></i> No categories match the filter criteria.
                    </div>
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
                                        <span className="category-id">#{cat.id ?? index + 1}</span>
                                    </div>
                                    <div className="category-description">
                                        {cat.description ? cat.description : "No description provided"}
                                    </div>
                                </div>
                            </div>

                            <div className="category-card-right">
                                <span className={`badge-role badge-type-${cat.categoryType?.toLowerCase()}`}>
                                    {cat.categoryType}
                                </span>
                                <div className="category-actions">
                                    <button
                                        type="button"
                                        className="btn-action btn-edit"
                                        onClick={() => handleOpenEditModal(cat)}
                                        title="Edit Category"
                                    >
                                        <i className="bi bi-pencil-square me-1"></i> Edit
                                    </button>
                                    <button
                                        type="button"
                                        className="btn-action btn-delete"
                                        onClick={() => handleDelete(cat.id)}
                                        title="Delete Category"
                                    >
                                        <i className="bi bi-trash3 me-1"></i> Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Sticky Floating Add Category Button (Synced identically with Products Add Item button) */}
            <button
                type="button"
                className="sticky-add-btn"
                onClick={handleOpenAddModal}
                title="Add New Category"
            >
                <i className="bi bi-plus-lg me-2"></i>
                Add Category
            </button>

            {/* Modal Dialog */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>{isEditMode ? "Edit Category" : "Add New Category"}</h3>
                            <button
                                type="button"
                                className="form-close-btn"
                                onClick={handleCloseModal}
                                aria-label="Close"
                                title="Close"
                            >
                                <i className="bi bi-x-lg" />
                            </button>
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
});
