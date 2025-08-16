using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class MakeKhataBookNavigationOptional : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 8, 16, 17, 29, 52, 384, DateTimeKind.Utc).AddTicks(5418), new DateTime(2025, 8, 16, 17, 29, 52, 384, DateTimeKind.Utc).AddTicks(5419) });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 8, 15, 15, 11, 43, 248, DateTimeKind.Utc).AddTicks(8413), new DateTime(2025, 8, 15, 15, 11, 43, 248, DateTimeKind.Utc).AddTicks(8413) });
        }
    }
}
