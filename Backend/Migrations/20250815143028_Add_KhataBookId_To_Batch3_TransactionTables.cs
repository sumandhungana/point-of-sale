using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class Add_KhataBookId_To_Batch3_TransactionTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "KhataBookId",
                table: "SalesBills",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "KhataBookId",
                table: "SalesBillItems",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "KhataBookId",
                table: "Purchases",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "KhataBookId",
                table: "Incomes",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "KhataBookId",
                table: "Expenses",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "KhataBookId",
                table: "Cashbooks",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "KhataBookId",
                table: "Bills",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            // Update existing data to assign to first KhataBook (ID=1) before adding foreign key constraints
            migrationBuilder.Sql("UPDATE \"SalesBills\" SET \"KhataBookId\" = 1 WHERE \"KhataBookId\" = 0;");
            migrationBuilder.Sql("UPDATE \"SalesBillItems\" SET \"KhataBookId\" = 1 WHERE \"KhataBookId\" = 0;");
            migrationBuilder.Sql("UPDATE \"Bills\" SET \"KhataBookId\" = 1 WHERE \"KhataBookId\" = 0;");
            migrationBuilder.Sql("UPDATE \"Purchases\" SET \"KhataBookId\" = 1 WHERE \"KhataBookId\" = 0;");
            migrationBuilder.Sql("UPDATE \"Expenses\" SET \"KhataBookId\" = 1 WHERE \"KhataBookId\" = 0;");
            migrationBuilder.Sql("UPDATE \"Incomes\" SET \"KhataBookId\" = 1 WHERE \"KhataBookId\" = 0;");
            migrationBuilder.Sql("UPDATE \"Cashbooks\" SET \"KhataBookId\" = 1 WHERE \"KhataBookId\" = 0;");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 8, 15, 14, 30, 27, 164, DateTimeKind.Utc).AddTicks(1521), new DateTime(2025, 8, 15, 14, 30, 27, 164, DateTimeKind.Utc).AddTicks(1521) });

            migrationBuilder.CreateIndex(
                name: "IX_SalesBills_KhataBookId",
                table: "SalesBills",
                column: "KhataBookId");

            migrationBuilder.CreateIndex(
                name: "IX_SalesBillItems_KhataBookId",
                table: "SalesBillItems",
                column: "KhataBookId");

            migrationBuilder.CreateIndex(
                name: "IX_Purchases_KhataBookId",
                table: "Purchases",
                column: "KhataBookId");

            migrationBuilder.CreateIndex(
                name: "IX_Incomes_KhataBookId",
                table: "Incomes",
                column: "KhataBookId");

            migrationBuilder.CreateIndex(
                name: "IX_Expenses_KhataBookId",
                table: "Expenses",
                column: "KhataBookId");

            migrationBuilder.CreateIndex(
                name: "IX_Cashbooks_KhataBookId",
                table: "Cashbooks",
                column: "KhataBookId");

            migrationBuilder.CreateIndex(
                name: "IX_Bills_KhataBookId",
                table: "Bills",
                column: "KhataBookId");

            migrationBuilder.AddForeignKey(
                name: "FK_Bills_KhataBooks_KhataBookId",
                table: "Bills",
                column: "KhataBookId",
                principalTable: "KhataBooks",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Cashbooks_KhataBooks_KhataBookId",
                table: "Cashbooks",
                column: "KhataBookId",
                principalTable: "KhataBooks",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Expenses_KhataBooks_KhataBookId",
                table: "Expenses",
                column: "KhataBookId",
                principalTable: "KhataBooks",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Incomes_KhataBooks_KhataBookId",
                table: "Incomes",
                column: "KhataBookId",
                principalTable: "KhataBooks",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Purchases_KhataBooks_KhataBookId",
                table: "Purchases",
                column: "KhataBookId",
                principalTable: "KhataBooks",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_SalesBillItems_KhataBooks_KhataBookId",
                table: "SalesBillItems",
                column: "KhataBookId",
                principalTable: "KhataBooks",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_SalesBills_KhataBooks_KhataBookId",
                table: "SalesBills",
                column: "KhataBookId",
                principalTable: "KhataBooks",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Bills_KhataBooks_KhataBookId",
                table: "Bills");

            migrationBuilder.DropForeignKey(
                name: "FK_Cashbooks_KhataBooks_KhataBookId",
                table: "Cashbooks");

            migrationBuilder.DropForeignKey(
                name: "FK_Expenses_KhataBooks_KhataBookId",
                table: "Expenses");

            migrationBuilder.DropForeignKey(
                name: "FK_Incomes_KhataBooks_KhataBookId",
                table: "Incomes");

            migrationBuilder.DropForeignKey(
                name: "FK_Purchases_KhataBooks_KhataBookId",
                table: "Purchases");

            migrationBuilder.DropForeignKey(
                name: "FK_SalesBillItems_KhataBooks_KhataBookId",
                table: "SalesBillItems");

            migrationBuilder.DropForeignKey(
                name: "FK_SalesBills_KhataBooks_KhataBookId",
                table: "SalesBills");

            migrationBuilder.DropIndex(
                name: "IX_SalesBills_KhataBookId",
                table: "SalesBills");

            migrationBuilder.DropIndex(
                name: "IX_SalesBillItems_KhataBookId",
                table: "SalesBillItems");

            migrationBuilder.DropIndex(
                name: "IX_Purchases_KhataBookId",
                table: "Purchases");

            migrationBuilder.DropIndex(
                name: "IX_Incomes_KhataBookId",
                table: "Incomes");

            migrationBuilder.DropIndex(
                name: "IX_Expenses_KhataBookId",
                table: "Expenses");

            migrationBuilder.DropIndex(
                name: "IX_Cashbooks_KhataBookId",
                table: "Cashbooks");

            migrationBuilder.DropIndex(
                name: "IX_Bills_KhataBookId",
                table: "Bills");

            migrationBuilder.DropColumn(
                name: "KhataBookId",
                table: "SalesBills");

            migrationBuilder.DropColumn(
                name: "KhataBookId",
                table: "SalesBillItems");

            migrationBuilder.DropColumn(
                name: "KhataBookId",
                table: "Purchases");

            migrationBuilder.DropColumn(
                name: "KhataBookId",
                table: "Incomes");

            migrationBuilder.DropColumn(
                name: "KhataBookId",
                table: "Expenses");

            migrationBuilder.DropColumn(
                name: "KhataBookId",
                table: "Cashbooks");

            migrationBuilder.DropColumn(
                name: "KhataBookId",
                table: "Bills");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 8, 15, 14, 27, 43, 902, DateTimeKind.Utc).AddTicks(4485), new DateTime(2025, 8, 15, 14, 27, 43, 902, DateTimeKind.Utc).AddTicks(4485) });
        }
    }
}
