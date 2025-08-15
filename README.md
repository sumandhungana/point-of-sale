# Point of Sale (KhataBook) System

A comprehensive Point of Sale and business management system built with .NET 8.0 backend and React frontend.

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Database Schema](#database-schema)
- [Setup Instructions](#setup-instructions)
- [API Documentation](#api-documentation)
- [Frontend Features](#frontend-features)
- [Recent Changes](#recent-changes)
- [Development Guide](#development-guide)

## 🎯 Overview

This is a multi-tenant Point of Sale system that allows businesses to manage:
- Customer and supplier relationships
- Inventory and product management
- Sales and purchase transactions
- Staff management and attendance
- Financial tracking (income, expenses, cashbook)
- Invoice generation and settings
- Payment processing
- Rental item management

## 🏗️ Architecture

### Backend (.NET 8.0)
- **Framework**: ASP.NET Core 8.0
- **Database**: PostgreSQL with Entity Framework Core
- **Authentication**: JWT-based authentication
- **Architecture**: Clean architecture with controllers, services, and data layers

### Frontend (React)
- **Framework**: React with TypeScript
- **Build Tool**: Vite
- **Styling**: CSS-in-JS with inline styles
- **State Management**: React Context API

### Database
- **Engine**: PostgreSQL
- **Schema**: Single public schema (simplified architecture)
- **Migrations**: Entity Framework Core migrations
- **Connection**: `postgres://postgres:1234567890@localhost:5432/khatabook`

## 🗄️ Database Schema

### Core Business Tables (30 Total)

#### 1. **AppSettings**
Application UI and theme configuration
```sql
- Id (PK, Identity)
- SideMenuBgColor, SideMenuBgEndColor, SideMenuFontColor
- TopMenuBgColor, TopMenuFontColor
- AppBgColor, AppForegroundColor
- LogoPath, FaviconPath, LoginBgPath
- Currency, CurrencyPosition, DateFormat, TimeFormat
- Language, CreatedAt, UpdatedAt
```

#### 2. **Users** (Authentication)
User management and authentication
```sql
- Id (PK, Identity)
- Username (Unique), Password, PasswordHash, PasswordSalt
- Enable, Permission, Branch, Parent
- Name, Address, Company, Email, Phone, Pan
- Remarks, CreatedAt, UpdatedAt
```

#### 3. **KhataBooks** (Main Entity)
Business/company records - **NO SCHEMA SWITCHING**
```sql
- Id (PK, Identity)
- Name, Number, Address, Email
- CompanyName, CompanyNumber, CompanyAddress, CompanyEmail
- BusinessCategory (enum), BusinessType (enum)
- TaxVat, BookAccount, Kyc
- ImagePath, CreatedAt, UpdatedAt
```

#### 4. **Customers**
Customer and supplier management
```sql
- Id (PK, Identity)
- Name, Phone, Email, Address, Company, Pan
- ContactPerson, isSupplier, BankAccount, CashBalance
- ProfileImage, CustomerSmsSetting, SmsLanguage
- TransactionHistoryCheck, CreatedAt, UpdatedAt
```

#### 5. **Categories**
Product/service categorization
```sql
- Id (PK, Identity)
- Name, Description, CategoryType (enum)
- CreatedAt, UpdatedAt
```

#### 6. **Items**
Product and service inventory
```sql
- Id (PK, Identity)
- Name, PrimaryUnit, SecondaryUnit, IsSecondaryUnitEnabled
- CategoryId (FK → Categories)
- SalesPrice, PurchasePrice, TaxIncluded
- OpeningStock, LowStockAlert
- VatPercentage, VatPercentageToday, VatDate
- ImageUrl, CreatedAt, UpdatedAt
```

#### 7. **SalesBills**
Sales invoice headers
```sql
- Id (PK, Identity)
- BillNumber, BillDate, CustomerId (FK → Customers)
- PaymentMode, Amount, Remarks, PhotoPath
- CreatedAt, UpdatedAt
```

#### 8. **SalesBillItems**
Sales invoice line items
```sql
- Id (PK, Identity)
- SalesBillId (FK → SalesBills), ItemId (FK → Items)
- Quantity, UnitPrice, TotalPrice
- Discount, Tax, FinalPrice
- CreatedAt, UpdatedAt
```

#### 9. **Bills**
Customer billing records
```sql
- BillId (PK, Identity)
- CustomerId (FK → Customers)
- BillDate, DueDate, TotalAmount, PaidAmount
- Status, CreatedAt, UpdatedAt
```

#### 10. **Purchases**
Purchase transaction records
```sql
- Id (PK, Identity)
- PurchaseNo, Date, CategoryId (FK → Categories)
- ItemId (FK → Items), PaymentMode, Amount
- Remarks, PhotoPath, CreatedAt
```

#### 11. **Expenses**
Expense tracking
```sql
- Id (PK, Identity)
- ExpensesNo, Date, CategoryId (FK → Categories)
- ItemId (FK → Items), PaymentMode, Amount
- Remarks, PhotoPath, CreatedAt
```

#### 12. **Incomes**
Income tracking
```sql
- Id (PK, Identity)
- IncomeNo, Date, CategoryId (FK → Categories)
- ItemId (FK → Items), PaymentMode, Amount
- Remarks, PhotoPath, CreatedAt
```

#### 13. **Cashbooks**
Cash transaction records
```sql
- Id (PK, Identity)
- CashbookNo, Date, CategoryId (FK → Categories)
- ItemId (FK → Items), PaymentMode, Amount
- Remarks, PhotoPath, CreatedAt
```

#### 14. **PaymentsReceived**
Incoming payment tracking
```sql
- Id (PK, Identity)
- PartyId (FK → Customers), Amount, Remarks
- Date, BillPath, CreatedAt, UpdatedAt
```

#### 15. **PaymentsGiven**
Outgoing payment tracking
```sql
- Id (PK, Identity)
- PartyId (FK → Customers), Amount, Remarks
- Date, BillPath, CreatedAt, UpdatedAt
```

#### 16. **Staff**
Staff management
```sql
- Id (PK, Identity)
- Name, Address, Phone, Email
- Remarks, ProfileImageUrl
- CreatedAt, UpdatedAt
```

#### 17. **StaffAttendances**
Staff attendance tracking
```sql
- Id (PK, Identity)
- StaffId (FK → Staff), Date, Status, Note
- CreatedAt, UpdatedAt
```

#### 18. **StaffSalaries**
Staff salary management
```sql
- Id (PK, Identity)
- StaffId (FK → Staff), Month, Year
- SelectedDate, IsSlideOn, CalculationDate
- SalaryType, Amount, Permission
- CreatedAt, UpdatedAt
```

#### 19. **Roles & Permissions**
Role-based access control
```sql
-- Roles
- Id (PK), Name, Status, Description, CreatedAt, UpdatedAt

-- Permissions  
- Id (PK), Module, PermissionName, CreatedAt, UpdatedAt

-- RolePermissions (Junction)
- Id (PK), RoleId (FK → Roles), PermissionId (FK → Permissions)
```

#### 20. **Additional Tables**
- **Suppliers**: Supplier management
- **Services**: Service offerings with pricing
- **RentalItems**: Rental item management
- **Transactions**: General transaction log
- **Payments**: General payment records
- **PaymentGateways**: Payment gateway configuration
- **SmsGateways**: SMS gateway configuration
- **InvoiceSettings**: Invoice template configuration

### Key Relationships

```
Customers ←→ Bills, SalesBills, PaymentsGiven, PaymentsReceived
Categories ←→ Items, Cashbooks, Expenses, Incomes, Purchases
Items ←→ Cashbooks, Expenses, Incomes, Purchases, SalesBillItems
Staff ←→ StaffAttendances, StaffSalaries
SalesBills ←→ SalesBillItems
Roles ←→ RolePermissions ←→ Permissions
```

## 🚀 Setup Instructions

### Prerequisites
- PostgreSQL 12+
- .NET 8.0 SDK
- Node.js 18+
- npm or yarn

### Database Setup

1. **Create Database**
```bash
# Connect to PostgreSQL
psql -h localhost -U postgres

# Create database
CREATE DATABASE khatabook;
```

2. **Configure Connection**
Update connection strings in:
- `Backend/appsettings.json`
- `appsettings.json` (root)
- `Backend/Data/ApplicationDbContextFactory.cs`

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=khatabook;Username=postgres;Password=1234567890;Include Error Detail=true"
  }
}
```

3. **Run Migrations**
```bash
cd Backend
dotnet ef database update
```

### Backend Setup

1. **Install Dependencies**
```bash
cd Backend
dotnet restore
```

2. **Build Project**
```bash
dotnet build
```

3. **Run Backend**
```bash
dotnet run --urls "http://localhost:5000"
```

### Frontend Setup

1. **Install Dependencies**
```bash
cd frontend
npm install --legacy-peer-deps
```

2. **Start Development Server**
```bash
npm start
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Swagger UI**: http://localhost:5000/swagger

## 🔐 Authentication

### Default Admin User
- **Username**: `admin`
- **Password**: `admin123` (hashed with salt)
- **Permission**: `admin`

### API Authentication
All API endpoints (except login) require JWT token in Authorization header:
```
Authorization: Bearer <jwt_token>
```

## 📡 API Documentation

### Authentication Endpoints
```
POST /api/User/login
POST /api/User/logout
```

### Core Business Endpoints
```
GET/POST/PUT/DELETE /api/Customer
GET/POST/PUT/DELETE /api/KhataBook
GET/POST/PUT/DELETE /api/Item
GET/POST/PUT/DELETE /api/Category
GET/POST/PUT/DELETE /api/SalesBill
GET/POST/PUT/DELETE /api/Purchase
GET/POST/PUT/DELETE /api/Expenses
GET/POST/PUT/DELETE /api/Income
GET/POST/PUT/DELETE /api/Cashbook
GET/POST/PUT/DELETE /api/Staff
```

### Management Endpoints
```
GET/POST/PUT/DELETE /api/Role
GET/POST/PUT/DELETE /api/Permission
GET/POST/PUT/DELETE /api/PaymentGateway
GET/POST/PUT/DELETE /api/SmsGateway
GET/POST/PUT/DELETE /api/AppSettings
GET/POST/PUT/DELETE /api/InvoiceSettings
```

## 🎨 Frontend Features

### Core Modules
- **Dashboard**: Business overview with key metrics
- **Customer Management**: Customer/supplier CRUD operations
- **Inventory Management**: Product/service management
- **Sales Management**: Invoice creation and management
- **Purchase Management**: Purchase order tracking
- **Financial Management**: Income, expenses, cashbook
- **Staff Management**: Employee management and attendance
- **Reports**: Various business reports
- **Settings**: Application and invoice configuration

### Key Components
- **Sidebar Navigation**: Dynamic menu with role-based access
- **Alert System**: Toast notifications for user feedback
- **PDF Generation**: Invoice and report PDF generation
- **File Upload**: Image and document upload functionality
- **Responsive Design**: Mobile-friendly interface

## 🔄 Recent Changes

### Schema Simplification (Latest Update)
- ✅ **Removed Multi-Schema Architecture**: Eliminated complex schema switching
- ✅ **Single Public Schema**: All data now in `public` schema
- ✅ **Removed SchemaName Column**: Cleaned KhataBooks table
- ✅ **Simplified Backend**: Removed schema management services
- ✅ **Updated Frontend**: Simplified KhataBook selection (no backend switching)
- ✅ **Fresh Database**: Dropped old databases and created clean structure
- ✅ **Updated Connection Strings**: Using postgres credentials

### Database Migration History
```
20250815134832_InitialCreate - Current clean migration
```

### Removed Components
- `SchemaConfigurationService.cs`
- `SchemaManagementService.cs`
- `SchemaMiddleware.cs`
- `MigrationHelper.cs`
- `CustomModelCacheKeyFactory.cs`

## 📋 Controller-Database Mapping & Phase 2 Implementation

### Complete Controller-Table Mapping (29 Controllers → 29 Tables)

#### **Business Controllers (Require KhataBookId Filtering) - 24 Controllers**

| Controller | Database Table | KhataBookId Required | Status |
|------------|----------------|---------------------|--------|
| AppSettingsController | AppSettings | ✅ YES | ✅ COMPLETED |
| BillController | Bills | ✅ YES | ✅ COMPLETED |
| CashbookController | Cashbooks | ✅ YES | ✅ COMPLETED |
| CategoryController | Categories | ✅ YES | ✅ COMPLETED |
| CustomerController | Customers | ✅ YES | ✅ COMPLETED |
| ExpensesController | Expenses | ✅ YES | ✅ COMPLETED |
| IncomeController | Incomes | ✅ YES | ✅ COMPLETED |
| InvoiceSettingsController | InvoiceSettings | ✅ YES | ✅ COMPLETED |
| ItemController | Items | ✅ YES | ✅ COMPLETED |
| PaymentController | Payments | ✅ YES | ✅ COMPLETED |
| PaymentGatewayController | PaymentGateways | ✅ YES | ✅ COMPLETED |
| PaymentsGivenController | PaymentsGiven | ✅ YES | ✅ COMPLETED |
| PaymentsReceivedController | PaymentsReceived | ✅ YES | ✅ COMPLETED |
| PurchaseController | Purchases | ✅ YES | ✅ COMPLETED |
| RentalItemController | RentalItems | ✅ YES | ✅ COMPLETED |
| SalesBillController | SalesBills | ✅ YES | ✅ COMPLETED |
| SalesBillItemController | SalesBillItems | ✅ YES | ✅ COMPLETED |
| ServiceController | Services | ✅ YES | ✅ COMPLETED |
| SmsGatewayController | SmsGateways | ✅ YES | ✅ COMPLETED |
| StaffController | Staff | ✅ YES | ✅ COMPLETED |
| StaffAttendanceController | StaffAttendances | ✅ YES | ✅ COMPLETED |
| StaffSalaryController | StaffSalaries | ✅ YES | ✅ COMPLETED |
| SupplierController | Suppliers | ✅ YES | ✅ COMPLETED |
| TransactionController | Transactions | ✅ YES | ✅ COMPLETED |

#### **Global Controllers (No KhataBookId Required) - 5 Controllers**

| Controller | Database Table | KhataBookId Required | Status |
|------------|----------------|---------------------|--------|
| UserController | Users | ❌ NO (Global) | ✅ No Changes Needed |
| KhataBookController | KhataBooks | ❌ NO (Main Entity) | ✅ No Changes Needed |
| PermissionController | Permissions | ❌ NO (Global) | ✅ No Changes Needed |
| RoleController | Roles | ❌ NO (Global) | ✅ No Changes Needed |
| RoleController | RolePermissions | ❌ NO (Global) | ✅ No Changes Needed |

### Phase 2 Implementation Plan

#### **Required Changes for Each Business Controller**

For all 24 business controllers, implement the following changes:

1. **Add KhataBook Context Dependency**
```csharp
private readonly IKhataBookContext _khataBookContext;

public ControllerName(ApplicationDbContext context, IKhataBookContext khataBookContext)
{
    _context = context;
    _khataBookContext = khataBookContext;
}
```

2. **Filter All GET Operations**
```csharp
// OLD: return await _context.TableName.ToListAsync();
// NEW: 
var currentKhataBookId = _khataBookContext.GetCurrentKhataBookId();
return await _context.TableName
    .Where(x => x.KhataBookId == currentKhataBookId)
    .ToListAsync();
```

3. **Set KhataBookId on CREATE Operations**
```csharp
// In POST methods:
entity.KhataBookId = _khataBookContext.GetCurrentKhataBookId();
_context.TableName.Add(entity);
```

4. **Validate KhataBookId on UPDATE/DELETE Operations**
```csharp
// In PUT/DELETE methods:
var currentKhataBookId = _khataBookContext.GetCurrentKhataBookId();
var entity = await _context.TableName
    .FirstOrDefaultAsync(x => x.Id == id && x.KhataBookId == currentKhataBookId);
    
if (entity == null)
{
    return NotFound(); // Entity doesn't exist or doesn't belong to current KhataBook
}
```

#### **New Service: KhataBookContext**

Create `IKhataBookContext` service to manage current KhataBook:

```csharp
public interface IKhataBookContext
{
    int GetCurrentKhataBookId();
    void SetCurrentKhataBookId(int khataBookId);
    Task<bool> ValidateKhataBookAccess(int khataBookId);
}

public class KhataBookContext : IKhataBookContext
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    
    public int GetCurrentKhataBookId()
    {
        // Get from session, header, or default to 1
        return _httpContextAccessor.HttpContext?.Session.GetInt32("CurrentKhataBookId") ?? 1;
    }
    
    public void SetCurrentKhataBookId(int khataBookId)
    {
        _httpContextAccessor.HttpContext?.Session.SetInt32("CurrentKhataBookId", khataBookId);
    }
}
```

#### **Implementation Progress Tracking**

- **Phase 1**: ✅ Database Schema (24/24 tables with KhataBookId)
- **Phase 2**: ✅ Controller Updates (24/24 completed) ✅ COMPLETED
  - **Batch A**: Core Controllers (6 controllers) ✅ COMPLETED
  - **Batch B**: Transaction Controllers (8 controllers) ✅ COMPLETED
  - **Batch C**: Management Controllers (6 controllers) ✅ COMPLETED
  - **Batch D**: Configuration Controllers (4 controllers) ✅ COMPLETED
- **Phase 3**: ✅ Automatic KhataBook ID Usage (24/24 controllers completed)
  - **Batch A**: Core Controllers (6 controllers) ✅ COMPLETED
  - **Batch B**: Transaction Controllers (8 controllers) ✅ COMPLETED
  - **Batch C**: Management Controllers (6 controllers) ✅ COMPLETED
  - **Batch D**: Configuration Controllers (4 controllers) ✅ COMPLETED
- **Phase 4**: ⏳ Frontend Updates (KhataBook selector, context)

## 🎉 **PHASE 3 COMPLETION SUMMARY**

### ✅ **ALL 24 BUSINESS CONTROLLERS SUCCESSFULLY UPDATED!**

**Phase 3: Automatic KhataBook ID Usage** has been **100% COMPLETED**! 

All 24 business controllers now automatically:
1. **Filter data** by the currently selected KhataBook ID in all GET operations
2. **Set KhataBookId** automatically in all POST operations  
3. **Validate ownership** in all PUT/DELETE operations
4. **Use the current KhataBook** from the database without requiring frontend to pass the ID

### **Key Achievements:**
- ✅ **24/24 Controllers** updated with automatic KhataBook ID usage
- ✅ **100% Data Isolation** - Each KhataBook's data is completely isolated
- ✅ **Zero Frontend Changes Required** - Backend automatically handles KhataBook selection
- ✅ **Robust Security** - Users can only access/modify data from their current KhataBook
- ✅ **Seamless Switching** - Users can switch between KhataBooks without data leakage

### **System Status:**
- 🟢 **Database Schema**: ✅ Complete (24 tables with KhataBookId)
- 🟢 **Backend Controllers**: ✅ Complete (24 controllers with automatic filtering)
- 🟢 **KhataBook Management**: ✅ Complete (IsUsed flag, switching endpoints)
- 🟡 **Frontend Integration**: ⏳ Pending (Phase 4)

**The backend is now fully ready for multi-KhataBook data isolation!** 🚀

## 🎯 **Phase 3: Automatic KhataBook ID Usage Implementation**

### **Objective:**
Update all business controllers to automatically use the currently selected KhataBook ID instead of requiring the frontend to pass it.

### **Current Architecture:**
- Controllers currently use `_khataBookContext.GetCurrentKhataBookId()` to get the current KhataBook ID
- This works correctly but requires the frontend to manage KhataBook selection

### **New Architecture:**
- Controllers will automatically use the currently selected KhataBook (where `isUsed = true`)
- No frontend changes needed - backend handles everything automatically
- Uses the new `GET /api/KhataBook/selected` endpoint internally

### **Controllers Requiring Updates (24 Total):**

#### **Batch A: Core Business Controllers (6 controllers)**
- [x] **CustomerController** - Customer management ✅ COMPLETED
- [x] **CategoryController** - Category management ✅ COMPLETED
- [x] **ItemController** - Item/Product management ✅ COMPLETED
- [x] **SupplierController** - Supplier management ✅ COMPLETED
- [x] **StaffController** - Staff management ✅ COMPLETED
- [x] **ServiceController** - Service management ✅ COMPLETED

#### **Batch B: Transaction Controllers (8 controllers)**
- [x] **SalesBillController** - Sales bill management ✅ COMPLETED
- [x] **SalesBillItemController** - Sales bill items ✅ COMPLETED
- [x] **BillController** - Bill management ✅ COMPLETED
- [x] **PurchaseController** - Purchase management ✅ COMPLETED
- [x] **ExpensesController** - Expense management ✅ COMPLETED
- [x] **IncomeController** - Income management ✅ COMPLETED
- [x] **CashbookController** - Cashbook management ✅ COMPLETED
- [x] **PaymentController** - Payment management ✅ COMPLETED

#### **Batch C: Management Controllers (6 controllers)**
- [x] **PaymentGatewayController** - Payment gateway settings ✅ COMPLETED
- [x] **PaymentsGivenController** - Payments given management ✅ COMPLETED
- [x] **PaymentsReceivedController** - Payments received management ✅ COMPLETED
- [x] **StaffAttendanceController** - Staff attendance ✅ COMPLETED
- [x] **StaffSalaryController** - Staff salary management ✅ COMPLETED
- [x] **RentalItemController** - Rental item management ✅ COMPLETED

#### **Batch D: Configuration Controllers (4 controllers)**
- [x] **AppSettingsController** - Application settings ✅ COMPLETED
- [x] **InvoiceSettingsController** - Invoice settings ✅ COMPLETED
- [x] **SmsGatewayController** - SMS gateway settings ✅ COMPLETED
- [x] **TransactionController** - Transaction management ✅ COMPLETED

### **Implementation Strategy:**
1. **Update KhataBookContext Service** - Modify to use the selected KhataBook endpoint
2. **Update All Controllers** - Ensure they use the current KhataBook ID automatically
3. **Test Each Controller** - Verify CRUD operations work with automatic KhataBook selection
4. **Verify Database Isolation** - Ensure data is properly isolated per KhataBook

### **Benefits:**
- ✅ **Simplified Frontend** - No need to manage KhataBook selection in frontend
- ✅ **Automatic Data Isolation** - Backend handles everything transparently
- ✅ **Consistent Behavior** - All operations use the same selected KhataBook
- ✅ **Reduced Complexity** - Frontend only needs to call switch endpoint when needed

## 🛠️ Development Guide

### Project Structure
```
point_of_sale/
├── Backend/                 # .NET 8.0 API
│   ├── Controllers/         # API controllers
│   ├── Models/             # Entity models
│   ├── Data/               # DbContext and migrations
│   ├── Middleware/         # Custom middleware
│   ├── Helpers/            # Utility helpers
│   └── wwwroot/uploads/    # File uploads
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service calls
│   │   ├── context/        # React context
│   │   └── types/          # TypeScript types
│   └── public/             # Static assets
└── README.md              # This file
```

### Adding New Features

1. **Backend**
   - Create model in `Models/`
   - Add DbSet to `ApplicationDbContext`
   - Create controller in `Controllers/`
   - Add migration: `dotnet ef migrations add <MigrationName>`
   - Update database: `dotnet ef database update`

2. **Frontend**
   - Create service in `services/`
   - Create page component in `pages/`
   - Add route to navigation
   - Update sidebar menu

### Database Commands
```bash
# Create migration
dotnet ef migrations add <MigrationName>

# Update database
dotnet ef database update

# Remove last migration
dotnet ef migrations remove

# List migrations
dotnet ef migrations list

# Generate SQL script
dotnet ef migrations script
```

### Environment Configuration

#### Development
- Database: Local PostgreSQL
- Backend: http://localhost:5000
- Frontend: http://localhost:3000

#### Production
- Update connection strings
- Configure CORS for production domains
- Set up SSL certificates
- Configure file upload paths

## 🔒 Security Considerations

- JWT token authentication
- Password hashing with salt
- SQL injection prevention via EF Core
- CORS configuration
- File upload validation
- Role-based access control

## 📝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the API documentation at `/swagger`
- Review the database schema above
- Check application logs for errors
- Ensure all dependencies are installed

---

**Last Updated**: August 15, 2025
**Database Version**: `20250815134832_InitialCreate`
**Architecture**: Simplified Single-Schema Design