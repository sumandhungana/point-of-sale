# Domain Knowledge: Sales & Inventory Management

## 1. Product & Catalog Architecture

### Entity: `ProductEntity` (`products` table)
Key Fields:
- `name`: Product name.
- `categoryId`: Reference to `categories(id)`.
- `supplierId`: Primary supplier reference.
- `itemCount`: Available stock quantity (`DOUBLE PRECISION`).
- `unit`: Unit of measure (e.g., `PCS`, `KG`, `LTR`, `BOX`).
- `perUnitPurchasePrice`: Cost per individual item (`NUMERIC(19,4)`).
- `grossPurchasePrice`: Total purchase cost (`NUMERIC(19,4)`).
- `fixedSellingPrice`: Default selling price (`NUMERIC(19,4)`).
- `isTaxIncluded`: Boolean flag specifying if selling price includes VAT/Tax.
- `lowStockAlert`: Quantity threshold triggering warning alerts in the UI.
- `vatPercentage` & `taxPercentage`: Applicable tax rates.

---

## 2. Sales Billing (`sales_bill` table)

### Checkout Flow:
1. User adds items to the cart in `POS.tsx` or `AddSalesBill`.
2. Quantity, unit price, discounts, and VAT are calculated:
   $$\text{Subtotal} = \text{Quantity} \times \text{UnitPrice}$$
   $$\text{Tax Amount} = \text{Subtotal} \times \left(\frac{\text{Tax Rate}}{100}\right)$$
   $$\text{Total Bill} = \text{Subtotal} + \text{Tax Amount} - \text{Discount}$$
3. Payment Mode selected: `CASH`, `CARD`, `UPI`, `CREDIT` (KhataBook debit).
4. **Inventory Reduction**: Stock `item_count` is decremented in `products`.
5. If `CREDIT`: A KhataBook transaction of type `Gave` (goods given on credit) is created for the customer.

---

## 3. Purchase Billing (`purchase_bill` table)

### Restocking Flow:
1. Vendor invoice recorded in `AddPurchase.tsx` / `purchase_bill`.
2. Supplier selected, items entered with purchase prices and quantities.
3. **Inventory Increment**: Stock `item_count` in `products` is incremented.
4. If payment is unpaid/partial: KhataBook entry recorded under Supplier ledger as `Received` (goods received on credit, increasing debt owed to supplier).
