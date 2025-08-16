using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddUpdateDtosForControllers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 8, 16, 17, 47, 18, 2, DateTimeKind.Utc).AddTicks(1750), new DateTime(2025, 8, 16, 17, 47, 18, 2, DateTimeKind.Utc).AddTicks(1750) });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 8, 16, 17, 35, 10, 3, DateTimeKind.Utc).AddTicks(8065), new DateTime(2025, 8, 16, 17, 35, 10, 3, DateTimeKind.Utc).AddTicks(8069) });
        }
    }
}
