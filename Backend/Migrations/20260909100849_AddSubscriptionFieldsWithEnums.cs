using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddSubscriptionFieldsWithEnums : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "HasUsedTrial",
                table: "Users",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsSubscriptionActive",
                table: "Users",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "SubscriptionEndDate",
                table: "Users",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "SubscriptionStartDate",
                table: "Users",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "SubscriptionStatus",
                table: "Users",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "SubscriptionType",
                table: "Users",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "TrialEndDate",
                table: "Users",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "TrialStartDate",
                table: "Users",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "HasUsedTrial", "IsSubscriptionActive", "SubscriptionEndDate", "SubscriptionStartDate", "SubscriptionStatus", "SubscriptionType", "TrialEndDate", "TrialStartDate", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 9, 9, 10, 8, 47, 912, DateTimeKind.Utc).AddTicks(6533), false, false, null, null, 0, 0, null, null, new DateTime(2026, 9, 9, 10, 8, 47, 912, DateTimeKind.Utc).AddTicks(6535) });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "HasUsedTrial",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "IsSubscriptionActive",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "SubscriptionEndDate",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "SubscriptionStartDate",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "SubscriptionStatus",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "SubscriptionType",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "TrialEndDate",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "TrialStartDate",
                table: "Users");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 9, 3, 1, 51, 4, 174, DateTimeKind.Utc).AddTicks(6878), new DateTime(2026, 9, 3, 1, 51, 4, 174, DateTimeKind.Utc).AddTicks(6879) });
        }
    }
}
