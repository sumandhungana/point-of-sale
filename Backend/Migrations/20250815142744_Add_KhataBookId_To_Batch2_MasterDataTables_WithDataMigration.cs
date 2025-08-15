using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class Add_KhataBookId_To_Batch2_MasterDataTables_WithDataMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "KhataBookId",
                table: "Suppliers",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "KhataBookId",
                table: "Staff",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "KhataBookId",
                table: "Services",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "KhataBookId",
                table: "Items",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "KhataBookId",
                table: "Customers",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "KhataBookId",
                table: "Categories",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            // Update existing data to assign to first KhataBook (ID=1) before adding foreign key constraints
            migrationBuilder.Sql("UPDATE \"Customers\" SET \"KhataBookId\" = 1 WHERE \"KhataBookId\" = 0;");
            migrationBuilder.Sql("UPDATE \"Categories\" SET \"KhataBookId\" = 1 WHERE \"KhataBookId\" = 0;");
            migrationBuilder.Sql("UPDATE \"Items\" SET \"KhataBookId\" = 1 WHERE \"KhataBookId\" = 0;");
            migrationBuilder.Sql("UPDATE \"Suppliers\" SET \"KhataBookId\" = 1 WHERE \"KhataBookId\" = 0;");
            migrationBuilder.Sql("UPDATE \"Staff\" SET \"KhataBookId\" = 1 WHERE \"KhataBookId\" = 0;");
            migrationBuilder.Sql("UPDATE \"Services\" SET \"KhataBookId\" = 1 WHERE \"KhataBookId\" = 0;");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 8, 15, 14, 27, 43, 902, DateTimeKind.Utc).AddTicks(4485), new DateTime(2025, 8, 15, 14, 27, 43, 902, DateTimeKind.Utc).AddTicks(4485) });

            migrationBuilder.CreateIndex(
                name: "IX_Suppliers_KhataBookId",
                table: "Suppliers",
                column: "KhataBookId");

            migrationBuilder.CreateIndex(
                name: "IX_Staff_KhataBookId",
                table: "Staff",
                column: "KhataBookId");

            migrationBuilder.CreateIndex(
                name: "IX_Services_KhataBookId",
                table: "Services",
                column: "KhataBookId");

            migrationBuilder.CreateIndex(
                name: "IX_Items_KhataBookId",
                table: "Items",
                column: "KhataBookId");

            migrationBuilder.CreateIndex(
                name: "IX_Customers_KhataBookId",
                table: "Customers",
                column: "KhataBookId");

            migrationBuilder.CreateIndex(
                name: "IX_Categories_KhataBookId",
                table: "Categories",
                column: "KhataBookId");

            migrationBuilder.AddForeignKey(
                name: "FK_Categories_KhataBooks_KhataBookId",
                table: "Categories",
                column: "KhataBookId",
                principalTable: "KhataBooks",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Customers_KhataBooks_KhataBookId",
                table: "Customers",
                column: "KhataBookId",
                principalTable: "KhataBooks",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Items_KhataBooks_KhataBookId",
                table: "Items",
                column: "KhataBookId",
                principalTable: "KhataBooks",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Services_KhataBooks_KhataBookId",
                table: "Services",
                column: "KhataBookId",
                principalTable: "KhataBooks",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Staff_KhataBooks_KhataBookId",
                table: "Staff",
                column: "KhataBookId",
                principalTable: "KhataBooks",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Suppliers_KhataBooks_KhataBookId",
                table: "Suppliers",
                column: "KhataBookId",
                principalTable: "KhataBooks",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Categories_KhataBooks_KhataBookId",
                table: "Categories");

            migrationBuilder.DropForeignKey(
                name: "FK_Customers_KhataBooks_KhataBookId",
                table: "Customers");

            migrationBuilder.DropForeignKey(
                name: "FK_Items_KhataBooks_KhataBookId",
                table: "Items");

            migrationBuilder.DropForeignKey(
                name: "FK_Services_KhataBooks_KhataBookId",
                table: "Services");

            migrationBuilder.DropForeignKey(
                name: "FK_Staff_KhataBooks_KhataBookId",
                table: "Staff");

            migrationBuilder.DropForeignKey(
                name: "FK_Suppliers_KhataBooks_KhataBookId",
                table: "Suppliers");

            migrationBuilder.DropIndex(
                name: "IX_Suppliers_KhataBookId",
                table: "Suppliers");

            migrationBuilder.DropIndex(
                name: "IX_Staff_KhataBookId",
                table: "Staff");

            migrationBuilder.DropIndex(
                name: "IX_Services_KhataBookId",
                table: "Services");

            migrationBuilder.DropIndex(
                name: "IX_Items_KhataBookId",
                table: "Items");

            migrationBuilder.DropIndex(
                name: "IX_Customers_KhataBookId",
                table: "Customers");

            migrationBuilder.DropIndex(
                name: "IX_Categories_KhataBookId",
                table: "Categories");

            migrationBuilder.DropColumn(
                name: "KhataBookId",
                table: "Suppliers");

            migrationBuilder.DropColumn(
                name: "KhataBookId",
                table: "Staff");

            migrationBuilder.DropColumn(
                name: "KhataBookId",
                table: "Services");

            migrationBuilder.DropColumn(
                name: "KhataBookId",
                table: "Items");

            migrationBuilder.DropColumn(
                name: "KhataBookId",
                table: "Customers");

            migrationBuilder.DropColumn(
                name: "KhataBookId",
                table: "Categories");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 8, 15, 14, 15, 18, 167, DateTimeKind.Utc).AddTicks(8935), new DateTime(2025, 8, 15, 14, 15, 18, 167, DateTimeKind.Utc).AddTicks(8936) });
        }
    }
}
