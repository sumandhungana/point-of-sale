import React, { useState } from "react";
import { Products } from "./Products";
import { Categories } from "./Categories";
import "../../../styles/InventoryModule.css";

type TabType = "products" | "categories";

export const InventoryModule: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabType>("products");

    return (
        <div className="inventory-module-wrapper">
            {/* Top Navigation / Tab Bar */}
            <div className="module-tab-header">
                <div className="tab-buttons-container">
                    <button
                        type="button"
                        className={`module-tab-btn ${activeTab === "products" ? "active" : ""}`}
                        onClick={() => setActiveTab("products")}
                    >
                        <i className="bi bi-box-seam me-2"></i>
                        Products & Inventory
                    </button>
                    <button
                        type="button"
                        className={`module-tab-btn ${activeTab === "categories" ? "active" : ""}`}
                        onClick={() => setActiveTab("categories")}
                    >
                        <i className="bi bi-tags me-2"></i>
                        Categories
                    </button>
                </div>
            </div>

            {/* Render Tab Content */}
            <div className="module-tab-content">
                {activeTab === "products" ? <Products /> : <Categories />}
            </div>
        </div>
    );
};

export default InventoryModule;