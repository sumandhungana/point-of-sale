using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddImagePathToUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ImagePath",
                table: "Users",
                type: "text",
                nullable: true);

            migrationBuilder.AlterColumn<DateOnly>(
                name: "SalaryStartDate",
                table: "Staff",
                type: "date",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "ImagePath", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 9, 3, 1, 51, 4, 174, DateTimeKind.Utc).AddTicks(6878), null, new DateTime(2026, 9, 3, 1, 51, 4, 174, DateTimeKind.Utc).AddTicks(6879) });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ImagePath",
                table: "Users");

            migrationBuilder.AlterColumn<string>(
                name: "SalaryStartDate",
                table: "Staff",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(DateOnly),
                oldType: "date",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 8, 13, 15, 54, 12, 126, DateTimeKind.Utc).AddTicks(1242), new DateTime(2026, 8, 13, 15, 54, 12, 126, DateTimeKind.Utc).AddTicks(1243) });
        }
    }
}
