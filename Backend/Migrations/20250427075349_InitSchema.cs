using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class InitSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "initSchema");

            migrationBuilder.RenameTable(
                name: "Users",
                newName: "Users",
                newSchema: "initSchema");

            migrationBuilder.RenameTable(
                name: "Transactions",
                newName: "Transactions",
                newSchema: "initSchema");

            migrationBuilder.RenameTable(
                name: "Suppliers",
                newName: "Suppliers",
                newSchema: "initSchema");

            migrationBuilder.RenameTable(
                name: "StaffSalaries",
                newName: "StaffSalaries",
                newSchema: "initSchema");

            migrationBuilder.RenameTable(
                name: "StaffAttendances",
                newName: "StaffAttendances",
                newSchema: "initSchema");

            migrationBuilder.RenameTable(
                name: "Staff",
                newName: "Staff",
                newSchema: "initSchema");

            migrationBuilder.RenameTable(
                name: "SmsGateways",
                newName: "SmsGateways",
                newSchema: "initSchema");

            migrationBuilder.RenameTable(
                name: "Services",
                newName: "Services",
                newSchema: "initSchema");

            migrationBuilder.RenameTable(
                name: "SalesBills",
                newName: "SalesBills",
                newSchema: "initSchema");

            migrationBuilder.RenameTable(
                name: "SalesBillItems",
                newName: "SalesBillItems",
                newSchema: "initSchema");

            migrationBuilder.RenameTable(
                name: "Roles",
                newName: "Roles",
                newSchema: "initSchema");

            migrationBuilder.RenameTable(
                name: "RolePermissions",
                newName: "RolePermissions",
                newSchema: "initSchema");

            migrationBuilder.RenameTable(
                name: "RentalItems",
                newName: "RentalItems",
                newSchema: "initSchema");

            migrationBuilder.RenameTable(
                name: "Purchases",
                newName: "Purchases",
                newSchema: "initSchema");

            migrationBuilder.RenameTable(
                name: "Permissions",
                newName: "Permissions",
                newSchema: "initSchema");

            migrationBuilder.RenameTable(
                name: "PaymentsReceived",
                newName: "PaymentsReceived",
                newSchema: "initSchema");

            migrationBuilder.RenameTable(
                name: "PaymentsGiven",
                newName: "PaymentsGiven",
                newSchema: "initSchema");

            migrationBuilder.RenameTable(
                name: "Payments",
                newName: "Payments",
                newSchema: "initSchema");

            migrationBuilder.RenameTable(
                name: "PaymentGateways",
                newName: "PaymentGateways",
                newSchema: "initSchema");

            migrationBuilder.RenameTable(
                name: "KhataBooks",
                newName: "KhataBooks",
                newSchema: "initSchema");

            migrationBuilder.RenameTable(
                name: "Items",
                newName: "Items",
                newSchema: "initSchema");

            migrationBuilder.RenameTable(
                name: "InvoiceSettings",
                newName: "InvoiceSettings",
                newSchema: "initSchema");

            migrationBuilder.RenameTable(
                name: "Incomes",
                newName: "Incomes",
                newSchema: "initSchema");

            migrationBuilder.RenameTable(
                name: "Expenses",
                newName: "Expenses",
                newSchema: "initSchema");

            migrationBuilder.RenameTable(
                name: "Customers",
                newName: "Customers",
                newSchema: "initSchema");

            migrationBuilder.RenameTable(
                name: "Categories",
                newName: "Categories",
                newSchema: "initSchema");

            migrationBuilder.RenameTable(
                name: "Cashbooks",
                newName: "Cashbooks",
                newSchema: "initSchema");

            migrationBuilder.RenameTable(
                name: "Bills",
                newName: "Bills",
                newSchema: "initSchema");

            migrationBuilder.RenameTable(
                name: "AppSettings",
                newName: "AppSettings",
                newSchema: "initSchema");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameTable(
                name: "Users",
                schema: "initSchema",
                newName: "Users");

            migrationBuilder.RenameTable(
                name: "Transactions",
                schema: "initSchema",
                newName: "Transactions");

            migrationBuilder.RenameTable(
                name: "Suppliers",
                schema: "initSchema",
                newName: "Suppliers");

            migrationBuilder.RenameTable(
                name: "StaffSalaries",
                schema: "initSchema",
                newName: "StaffSalaries");

            migrationBuilder.RenameTable(
                name: "StaffAttendances",
                schema: "initSchema",
                newName: "StaffAttendances");

            migrationBuilder.RenameTable(
                name: "Staff",
                schema: "initSchema",
                newName: "Staff");

            migrationBuilder.RenameTable(
                name: "SmsGateways",
                schema: "initSchema",
                newName: "SmsGateways");

            migrationBuilder.RenameTable(
                name: "Services",
                schema: "initSchema",
                newName: "Services");

            migrationBuilder.RenameTable(
                name: "SalesBills",
                schema: "initSchema",
                newName: "SalesBills");

            migrationBuilder.RenameTable(
                name: "SalesBillItems",
                schema: "initSchema",
                newName: "SalesBillItems");

            migrationBuilder.RenameTable(
                name: "Roles",
                schema: "initSchema",
                newName: "Roles");

            migrationBuilder.RenameTable(
                name: "RolePermissions",
                schema: "initSchema",
                newName: "RolePermissions");

            migrationBuilder.RenameTable(
                name: "RentalItems",
                schema: "initSchema",
                newName: "RentalItems");

            migrationBuilder.RenameTable(
                name: "Purchases",
                schema: "initSchema",
                newName: "Purchases");

            migrationBuilder.RenameTable(
                name: "Permissions",
                schema: "initSchema",
                newName: "Permissions");

            migrationBuilder.RenameTable(
                name: "PaymentsReceived",
                schema: "initSchema",
                newName: "PaymentsReceived");

            migrationBuilder.RenameTable(
                name: "PaymentsGiven",
                schema: "initSchema",
                newName: "PaymentsGiven");

            migrationBuilder.RenameTable(
                name: "Payments",
                schema: "initSchema",
                newName: "Payments");

            migrationBuilder.RenameTable(
                name: "PaymentGateways",
                schema: "initSchema",
                newName: "PaymentGateways");

            migrationBuilder.RenameTable(
                name: "KhataBooks",
                schema: "initSchema",
                newName: "KhataBooks");

            migrationBuilder.RenameTable(
                name: "Items",
                schema: "initSchema",
                newName: "Items");

            migrationBuilder.RenameTable(
                name: "InvoiceSettings",
                schema: "initSchema",
                newName: "InvoiceSettings");

            migrationBuilder.RenameTable(
                name: "Incomes",
                schema: "initSchema",
                newName: "Incomes");

            migrationBuilder.RenameTable(
                name: "Expenses",
                schema: "initSchema",
                newName: "Expenses");

            migrationBuilder.RenameTable(
                name: "Customers",
                schema: "initSchema",
                newName: "Customers");

            migrationBuilder.RenameTable(
                name: "Categories",
                schema: "initSchema",
                newName: "Categories");

            migrationBuilder.RenameTable(
                name: "Cashbooks",
                schema: "initSchema",
                newName: "Cashbooks");

            migrationBuilder.RenameTable(
                name: "Bills",
                schema: "initSchema",
                newName: "Bills");

            migrationBuilder.RenameTable(
                name: "AppSettings",
                schema: "initSchema",
                newName: "AppSettings");
        }
    }
}
