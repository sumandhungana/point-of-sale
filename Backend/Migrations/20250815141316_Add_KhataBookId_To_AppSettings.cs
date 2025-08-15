using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class Add_KhataBookId_To_AppSettings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "KhataBookId",
                table: "AppSettings",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 8, 15, 14, 13, 16, 72, DateTimeKind.Utc).AddTicks(234), new DateTime(2025, 8, 15, 14, 13, 16, 72, DateTimeKind.Utc).AddTicks(235) });

            migrationBuilder.CreateIndex(
                name: "IX_AppSettings_KhataBookId",
                table: "AppSettings",
                column: "KhataBookId");

            migrationBuilder.AddForeignKey(
                name: "FK_AppSettings_KhataBooks_KhataBookId",
                table: "AppSettings",
                column: "KhataBookId",
                principalTable: "KhataBooks",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AppSettings_KhataBooks_KhataBookId",
                table: "AppSettings");

            migrationBuilder.DropIndex(
                name: "IX_AppSettings_KhataBookId",
                table: "AppSettings");

            migrationBuilder.DropColumn(
                name: "KhataBookId",
                table: "AppSettings");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 8, 15, 13, 48, 32, 231, DateTimeKind.Utc).AddTicks(2325), new DateTime(2025, 8, 15, 13, 48, 32, 231, DateTimeKind.Utc).AddTicks(2326) });
        }
    }
}
