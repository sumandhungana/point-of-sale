# KhataBook Data Isolation Implementation TODO

## 🎯 Objective
Implement KhataBook-based data isolation where each KhataBook has its own separate data across all business tables. When a user switches KhataBooks, they should only see data belonging to that specific KhataBook.

## 📊 Database Design Strategy

### **Global Tables (No KhataBookId needed)**
These tables are shared across all KhataBooks:
1. **Users** - Authentication/user management (global)
2. **KhataBooks** - Main entity (already exists)
3. **Permissions** - System permissions (global)
4. **Roles** - System roles (global) 
5. **RolePermissions** - Role-permission mapping (global)

### **Business Tables (Require KhataBookId FK)**
These tables need `KhataBookId` foreign key for data isolation:

## ✅ TODO: Add KhataBookId to Business Tables (24 Tables)

### **Batch 1: Core Configuration Tables** ✅ COMPLETED
- [x] 1. **AppSettings** - Add KhataBookId ✅ COMPLETED (Migration: 20250815141316)
- [x] 2. **InvoiceSettings** - Add KhataBookId ✅ COMPLETED (Migration: 20250815141519)
- [x] 3. **PaymentGateways** - Add KhataBookId ✅ COMPLETED (Migration: 20250815141519)
- [x] 4. **SmsGateways** - Add KhataBookId ✅ COMPLETED (Migration: 20250815141519)

### **Batch 2: Master Data Tables** ✅ COMPLETED
- [x] 5. **Categories** - Add KhataBookId ✅ COMPLETED (Migration: 20250815142744)
- [x] 6. **Items** - Add KhataBookId ✅ COMPLETED (Migration: 20250815142744)
- [x] 7. **Customers** - Add KhataBookId ✅ COMPLETED (Migration: 20250815142744)
- [x] 8. **Suppliers** - Add KhataBookId ✅ COMPLETED (Migration: 20250815142744)
- [x] 9. **Staff** - Add KhataBookId ✅ COMPLETED (Migration: 20250815142744)
- [x] 10. **Services** - Add KhataBookId ✅ COMPLETED (Migration: 20250815142744)

### **Batch 3: Transaction Tables** ✅ COMPLETED
- [x] 11. **SalesBills** - Add KhataBookId ✅ COMPLETED (Migration: 20250815143028)
- [x] 12. **SalesBillItems** - Add KhataBookId ✅ COMPLETED (Migration: 20250815143028)
- [x] 13. **Bills** - Add KhataBookId ✅ COMPLETED (Migration: 20250815143028)
- [x] 14. **Purchases** - Add KhataBookId ✅ COMPLETED (Migration: 20250815143028)
- [x] 15. **Expenses** - Add KhataBookId ✅ COMPLETED (Migration: 20250815143028)
- [x] 16. **Incomes** - Add KhataBookId ✅ COMPLETED (Migration: 20250815143028)
- [x] 17. **Cashbooks** - Add KhataBookId ✅ COMPLETED (Migration: 20250815143028)

### **Batch 4: Payment & Financial Tables** ✅ COMPLETED
- [x] 18. **PaymentsReceived** - Add KhataBookId ✅ COMPLETED (Migration: 20250815143332)
- [x] 19. **PaymentsGiven** - Add KhataBookId ✅ COMPLETED (Migration: 20250815143332)
- [x] 20. **Payments** - Add KhataBookId ✅ COMPLETED (Migration: 20250815143332)
- [x] 21. **Transactions** - Add KhataBookId ✅ COMPLETED (Migration: 20250815143332)

### **Batch 5: Staff Management Tables** ✅ COMPLETED
- [x] 22. **StaffAttendances** - Add KhataBookId ✅ COMPLETED (Migration: 20250815143332)
- [x] 23. **StaffSalaries** - Add KhataBookId ✅ COMPLETED (Migration: 20250815143332)

### **Batch 6: Rental Management** ✅ COMPLETED
- [x] 24. **RentalItems** - Add KhataBookId ✅ COMPLETED (Migration: 20250815143332)

## 🔧 Implementation Steps for Each Table

For each table, perform these steps:

### Step 1: Update Model
```csharp
// Add to each business model
public int KhataBookId { get; set; }
public virtual KhataBook KhataBook { get; set; } = null!;
```

### Step 2: Update ApplicationDbContext
```csharp
// Add foreign key relationship in OnModelCreating
modelBuilder.Entity<TableName>()
    .HasOne(e => e.KhataBook)
    .WithMany()
    .HasForeignKey(e => e.KhataBookId)
    .OnDelete(DeleteBehavior.Restrict); // Prevent accidental KhataBook deletion
```

### Step 3: Create Migration
```bash
dotnet ef migrations add Add_KhataBookId_To_[TableName]
```

### Step 4: Update Database
```bash
dotnet ef database update
```

### Step 5: Verify with PostgreSQL
```sql
\d "TableName" -- Check table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'TableName' AND column_name = 'KhataBookId';
```

## 🎯 Database Schema Changes Summary

### Before (Current State)
```
Tables: 30 total
- 5 Global tables (Users, KhataBooks, Permissions, Roles, RolePermissions)
- 24 Business tables (no KhataBookId)
- 1 System table (__EFMigrationsHistory)
```

### After (Target State)
```
Tables: 30 total
- 5 Global tables (unchanged)
- 24 Business tables (all with KhataBookId FK → KhataBooks)
- 1 System table (unchanged)
```

## 🔄 Controller Updates Required

After database changes, update controllers to:

1. **Filter by KhataBookId**: All queries must include `WHERE KhataBookId = currentKhataBookId`
2. **Set KhataBookId on Create**: All new records must have KhataBookId set
3. **Validate KhataBookId**: Ensure users can only access their KhataBook data
4. **Add KhataBook Context**: Add middleware/service to track current KhataBook

## 🎨 Frontend Updates Required

1. **KhataBook Selector**: Add dropdown/selector for switching KhataBooks
2. **Context Management**: Store current KhataBookId in React context
3. **API Calls**: Include KhataBookId in all API requests
4. **Data Refresh**: Refresh all data when KhataBook changes

## ⚠️ Important Considerations

1. **Data Migration**: Existing data needs KhataBookId assignment
2. **Default KhataBook**: Create a default KhataBook for existing data
3. **Cascading Deletes**: Prevent accidental KhataBook deletion
4. **Performance**: Add indexes on KhataBookId columns
5. **Validation**: Ensure users can only access their own KhataBook data

## 📝 Progress Tracking

### Completed Batches
- [x] Batch 1: Core Configuration Tables (4/4) ✅ COMPLETED
- [x] Batch 2: Master Data Tables (6/6) ✅ COMPLETED
- [x] Batch 3: Transaction Tables (7/7) ✅ COMPLETED
- [x] Batch 4: Payment & Financial Tables (4/4) ✅ COMPLETED
- [x] Batch 5: Staff Management Tables (2/2) ✅ COMPLETED
- [x] Batch 6: Rental Management (1/1) ✅ COMPLETED

### Overall Progress
- [x] Database Schema: 24/24 tables updated (100% COMPLETE) ✅
- [x] Migrations: 5/5 created and applied ✅
- [ ] Controllers: 0/24 updated (NEXT PHASE)
- [ ] Frontend: 0% updated (NEXT PHASE)

## 🎯 Success Criteria

✅ **Database Level**
- All 24 business tables have KhataBookId column
- All foreign key relationships properly configured
- Existing data migrated with default KhataBookId

✅ **Backend Level**  
- All controllers filter by KhataBookId
- All create operations set KhataBookId
- Proper validation prevents cross-KhataBook access

✅ **Frontend Level**
- KhataBook selector works properly
- Data refreshes when switching KhataBooks
- Users see only their KhataBook data

---

**Total Tables to Update**: 24 business tables
**Current Status**: Ready to start implementation
**Next Step**: Begin with Batch 1 (Core Configuration Tables)