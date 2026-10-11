# Domain Knowledge: Parties & KhataBook Ledger

## 1. Core Ledger Concepts: "You Gave" vs "You Received"

The platform implements traditional Indian business double-entry Khata ledger accounting:

### Customer Ledger Rules:
- **You Gave (Red)**:
  - Goods sold to customer on credit, cash loaned, or advance returned to customer.
  - **Effect**: Increases the debt the customer owes to the business.
- **You Received (Green)**:
  - Cash/UPI/Card received from customer settling debt or advance deposit.
  - **Effect**: Decreases the debt the customer owes to the business.

### Supplier Ledger Rules:
- **You Gave (Red)**:
  - Payments made by business to vendor (advance payment, bill settlement).
  - **Effect**: Decreases the debt the business owes to the vendor.
- **You Received (Green)**:
  - Goods/materials received from vendor on credit.
  - **Effect**: Increases the debt the business owes to the vendor.

---

## 2. Separate Totals & Net Balance Model

The system separates transaction totals into three clear metrics on customer/supplier statements:

1. **Total "You Gave"**:
   $$\text{Total Gave} = \sum \text{Amount}_{\text{type} = \text{"Gave"}}$$
2. **Total "You Received"**:
   $$\text{Total Received} = \sum \text{Amount}_{\text{type} = \text{"Received"}}$$
3. **Net Balance**:
   $$\text{Net Balance} = |\text{Total Gave} - \text{Total Received}|$$
   - For Customers:
     - If $\text{Total Gave} > \text{Total Received}$: Status = **Customer Owes You** (Receivable)
     - If $\text{Total Received} > \text{Total Gave}$: Status = **You Owe Customer** (Advance Deposit)
   - For Suppliers:
     - If $\text{Total Received} > \text{Total Gave}$: Status = **You Owe Supplier** (Payable)
     - If $\text{Total Gave} > \text{Total Received}$: Status = **Supplier Owes You** (Advance Paid)

---

## 3. Cashbook & Income/Expense Ledger

- **Cashbook**: Records general office cash drawer entries (Cash In / Cash Out).
- **Income**: Revenue streams outside direct billing (services, scrap sales, interest).
- **Expense**: Operational expenditures (utilities, shop rent, logistics, repairs).
- **Payment Gateways**: Tracks integrations (e.g. UPI, QR, card machines) and settlement accounts.
