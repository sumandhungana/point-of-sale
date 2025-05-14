using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class SeedAdminUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                schema: "initSchema",
                table: "Users",
                columns: new[] { "Id", "Address", "Branch", "Company", "CreatedAt", "Email", "Enable", "Name", "Pan", "Parent", "Password", "PasswordHash", "PasswordSalt", "Permission", "Phone", "Remarks", "UpdatedAt", "Username" },
                values: new object[] { 1, null, null, null, new DateTime(2025, 5, 14, 15, 20, 43, 354, DateTimeKind.Utc).AddTicks(9433), null, true, null, null, null, "", "wphRXnzVzKYnlQxYSHWH8zlzV8CIxoPUoRyCv2pwCYs=", "static_salt_123", "admin", null, null, new DateTime(2025, 5, 14, 15, 20, 43, 354, DateTimeKind.Utc).AddTicks(9434), "admin" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                schema: "initSchema",
                table: "Users",
                keyColumn: "Id",
                keyValue: 1);
        }
    }
}
