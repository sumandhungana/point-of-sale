# Domain Knowledge: System Architecture & Multi-Tenancy

## 1. Domain Concept Overview

The Point of Sale (KhataBook) system is an enterprise SaaS platform serving retail businesses, distributors, and rental service providers. It unifies:
1. **POS & Billing**: Point of sale registers, barcode/product lookup, invoice generation.
2. **KhataBook (Digital Ledger)**: Dual-ledger tracking for customer & supplier debts ("You Gave / You Received").
3. **Inventory & Warehouse**: Stock monitoring, unit measurements, low-stock alerts, category hierarchies.
4. **Rental Services**: Booking and renting items with time-based fee calculations.
5. **Human Resources & Attendance**: Staff profiles, check-in/out, and salary disbursement tracking.

---

## 2. Multi-Tenancy Model (`MemberEntity`)

- **Tenant Isolation**: Each business entity registering on the platform is represented as a `Member` (`member_id`).
- **Data Segregation**:
  - All functional records (users, products, bills, customers, suppliers, transactions, rentals) belong to a single `member_id`.
  - No tenant can read or mutate data belonging to another tenant.
  - The security interceptor extracts `memberId` from the verified JWT claim and injects it into `UseCaseContext`.
- **User Roles within Tenant**:
  - Multiple users (admins, cashiers, managers) can belong to the same `member_id`.
  - Permissions determine functional access within that tenant.

---

## 3. Core Modules Enum (`com.puff.tech.usermanagement.enums.Module`)

| Code | Display Name | Responsibility |
|---|---|---|
| `dashboard` | Dashboard Management | Overview KPIs, daily sales, outstanding receivables |
| `systemMetrics` | System Metrics Management | Performance, JVM metrics, system health |
| `user` | User Management | Tenant user accounts & credentials |
| `customer` | Customer Management | Customer registry, contact details, balance summaries |
| `supplier` | Supplier Management | Supplier registry, contact details, purchase debt |
| `rental` | Rental Management | Rental inventory, start/end dates, overdue returns |
| `ownKhataBook` | KhataBook Management | Financial ledger, payment logs, statements |
| `member` | Member Management | Organization/Tenant profile and subscription tier |
| `staffManagement` | Staff Management | Staff directories, salaries, attendance records |
| `organization` | Organization Management | Multi-branch or organization settings |
| `roleAndPermissions` | Role & Permissions | RBAC role definitions and permission toggles |
| `inventory` | Inventory Management | Stock quantities, restock operations |
| `category` | Category Management | Product hierarchy groupings |
| `product` | Product Management | SKU catalogs, pricing, VAT/tax parameters |
| `salesBill` | Sales Bill Management | Sales checkout, customer bills, payment methods |
| `purchaseBill` | Purchase Bill Management | Vendor invoices, purchase costs, inventory increments |
