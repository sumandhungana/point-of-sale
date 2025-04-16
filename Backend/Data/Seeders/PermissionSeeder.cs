using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Data.Seeders
{
    public static class PermissionSeeder
    {
        public static void Seed(ModelBuilder modelBuilder)
        {
            var seedTime = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc);

            modelBuilder.Entity<Permission>().HasData(
                // Organization Module
                new Permission { Id = 1, Module = "Organization", PermissionName = "View Organization", CreatedAt = seedTime, UpdatedAt = seedTime },
                new Permission { Id = 2, Module = "Organization", PermissionName = "Create Organization", CreatedAt = seedTime, UpdatedAt = seedTime },
                new Permission { Id = 3, Module = "Organization", PermissionName = "Edit Organization", CreatedAt = seedTime, UpdatedAt = seedTime },
                new Permission { Id = 4, Module = "Organization", PermissionName = "Delete Organization", CreatedAt = seedTime, UpdatedAt = seedTime },

                // Reseller Module
                new Permission { Id = 5, Module = "Reseller", PermissionName = "View Reseller", CreatedAt = seedTime, UpdatedAt = seedTime },
                new Permission { Id = 6, Module = "Reseller", PermissionName = "Create Reseller", CreatedAt = seedTime, UpdatedAt = seedTime },
                new Permission { Id = 7, Module = "Reseller", PermissionName = "Edit Reseller", CreatedAt = seedTime, UpdatedAt = seedTime },
                new Permission { Id = 8, Module = "Reseller", PermissionName = "Delete Reseller", CreatedAt = seedTime, UpdatedAt = seedTime },

                // User Module
                new Permission { Id = 9, Module = "User", PermissionName = "View User", CreatedAt = seedTime, UpdatedAt = seedTime },
                new Permission { Id = 10, Module = "User", PermissionName = "Create User", CreatedAt = seedTime, UpdatedAt = seedTime },
                new Permission { Id = 11, Module = "User", PermissionName = "Edit User", CreatedAt = seedTime, UpdatedAt = seedTime },
                new Permission { Id = 12, Module = "User", PermissionName = "Delete User", CreatedAt = seedTime, UpdatedAt = seedTime },

                // Report Module
                new Permission { Id = 13, Module = "Report", PermissionName = "View Report", CreatedAt = seedTime, UpdatedAt = seedTime },
                new Permission { Id = 14, Module = "Report", PermissionName = "Generate Report", CreatedAt = seedTime, UpdatedAt = seedTime },
                new Permission { Id = 15, Module = "Report", PermissionName = "Export Report", CreatedAt = seedTime, UpdatedAt = seedTime },

                // Staff Module
                new Permission { Id = 16, Module = "Staff", PermissionName = "View Staff", CreatedAt = seedTime, UpdatedAt = seedTime },
                new Permission { Id = 17, Module = "Staff", PermissionName = "Create Staff", CreatedAt = seedTime, UpdatedAt = seedTime },
                new Permission { Id = 18, Module = "Staff", PermissionName = "Edit Staff", CreatedAt = seedTime, UpdatedAt = seedTime },
                new Permission { Id = 19, Module = "Staff", PermissionName = "Delete Staff", CreatedAt = seedTime, UpdatedAt = seedTime },

                // Notification Module
                new Permission { Id = 20, Module = "Notification", PermissionName = "View Notification", CreatedAt = seedTime, UpdatedAt = seedTime },
                new Permission { Id = 21, Module = "Notification", PermissionName = "Create Notification", CreatedAt = seedTime, UpdatedAt = seedTime },
                new Permission { Id = 22, Module = "Notification", PermissionName = "Edit Notification", CreatedAt = seedTime, UpdatedAt = seedTime },
                new Permission { Id = 23, Module = "Notification", PermissionName = "Delete Notification", CreatedAt = seedTime, UpdatedAt = seedTime },

                // Customer Module
                new Permission { Id = 24, Module = "Customer", PermissionName = "View Customer", CreatedAt = seedTime, UpdatedAt = seedTime },
                new Permission { Id = 25, Module = "Customer", PermissionName = "Create Customer", CreatedAt = seedTime, UpdatedAt = seedTime },
                new Permission { Id = 26, Module = "Customer", PermissionName = "Edit Customer", CreatedAt = seedTime, UpdatedAt = seedTime },
                new Permission { Id = 27, Module = "Customer", PermissionName = "Delete Customer", CreatedAt = seedTime, UpdatedAt = seedTime },

                // Suppliers Module
                new Permission { Id = 28, Module = "Suppliers", PermissionName = "View Supplier", CreatedAt = seedTime, UpdatedAt = seedTime },
                new Permission { Id = 29, Module = "Suppliers", PermissionName = "Create Supplier", CreatedAt = seedTime, UpdatedAt = seedTime },
                new Permission { Id = 30, Module = "Suppliers", PermissionName = "Edit Supplier", CreatedAt = seedTime, UpdatedAt = seedTime },
                new Permission { Id = 31, Module = "Suppliers", PermissionName = "Delete Supplier", CreatedAt = seedTime, UpdatedAt = seedTime },

                // Bill Module
                new Permission { Id = 32, Module = "Bill", PermissionName = "View Bill", CreatedAt = seedTime, UpdatedAt = seedTime },
                new Permission { Id = 33, Module = "Bill", PermissionName = "Create Bill", CreatedAt = seedTime, UpdatedAt = seedTime },
                new Permission { Id = 34, Module = "Bill", PermissionName = "Edit Bill", CreatedAt = seedTime, UpdatedAt = seedTime },
                new Permission { Id = 35, Module = "Bill", PermissionName = "Delete Bill", CreatedAt = seedTime, UpdatedAt = seedTime },

                // Inventory Module
                new Permission { Id = 36, Module = "Inventory", PermissionName = "View Inventory", CreatedAt = seedTime, UpdatedAt = seedTime },
                new Permission { Id = 37, Module = "Inventory", PermissionName = "Create Inventory", CreatedAt = seedTime, UpdatedAt = seedTime },
                new Permission { Id = 38, Module = "Inventory", PermissionName = "Edit Inventory", CreatedAt = seedTime, UpdatedAt = seedTime },
                new Permission { Id = 39, Module = "Inventory", PermissionName = "Delete Inventory", CreatedAt = seedTime, UpdatedAt = seedTime }
            );
        }
    }
} 