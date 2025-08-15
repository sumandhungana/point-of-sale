using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class Add_KhataBookId_To_Batch1_ConfigTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "KhataBookId",
                table: "SmsGateways",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "KhataBookId",
                table: "PaymentGateways",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "KhataBookId",
                table: "InvoiceSettings",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 8, 15, 14, 15, 18, 167, DateTimeKind.Utc).AddTicks(8935), new DateTime(2025, 8, 15, 14, 15, 18, 167, DateTimeKind.Utc).AddTicks(8936) });

            migrationBuilder.CreateIndex(
                name: "IX_SmsGateways_KhataBookId",
                table: "SmsGateways",
                column: "KhataBookId");

            migrationBuilder.CreateIndex(
                name: "IX_PaymentGateways_KhataBookId",
                table: "PaymentGateways",
                column: "KhataBookId");

            migrationBuilder.CreateIndex(
                name: "IX_InvoiceSettings_KhataBookId",
                table: "InvoiceSettings",
                column: "KhataBookId");

            migrationBuilder.AddForeignKey(
                name: "FK_InvoiceSettings_KhataBooks_KhataBookId",
                table: "InvoiceSettings",
                column: "KhataBookId",
                principalTable: "KhataBooks",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_PaymentGateways_KhataBooks_KhataBookId",
                table: "PaymentGateways",
                column: "KhataBookId",
                principalTable: "KhataBooks",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_SmsGateways_KhataBooks_KhataBookId",
                table: "SmsGateways",
                column: "KhataBookId",
                principalTable: "KhataBooks",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_InvoiceSettings_KhataBooks_KhataBookId",
                table: "InvoiceSettings");

            migrationBuilder.DropForeignKey(
                name: "FK_PaymentGateways_KhataBooks_KhataBookId",
                table: "PaymentGateways");

            migrationBuilder.DropForeignKey(
                name: "FK_SmsGateways_KhataBooks_KhataBookId",
                table: "SmsGateways");

            migrationBuilder.DropIndex(
                name: "IX_SmsGateways_KhataBookId",
                table: "SmsGateways");

            migrationBuilder.DropIndex(
                name: "IX_PaymentGateways_KhataBookId",
                table: "PaymentGateways");

            migrationBuilder.DropIndex(
                name: "IX_InvoiceSettings_KhataBookId",
                table: "InvoiceSettings");

            migrationBuilder.DropColumn(
                name: "KhataBookId",
                table: "SmsGateways");

            migrationBuilder.DropColumn(
                name: "KhataBookId",
                table: "PaymentGateways");

            migrationBuilder.DropColumn(
                name: "KhataBookId",
                table: "InvoiceSettings");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 8, 15, 14, 13, 16, 72, DateTimeKind.Utc).AddTicks(234), new DateTime(2025, 8, 15, 14, 13, 16, 72, DateTimeKind.Utc).AddTicks(235) });
        }
    }
}
