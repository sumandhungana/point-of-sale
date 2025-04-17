using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class UpdateSalesBillAndItemModels : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_SalesBillItems_Product_ProductId",
                table: "SalesBillItems");

            migrationBuilder.DropTable(
                name: "Product");

            migrationBuilder.DropColumn(
                name: "Discount",
                table: "SalesBills");

            migrationBuilder.DropColumn(
                name: "GrandTotal",
                table: "SalesBills");

            migrationBuilder.DropColumn(
                name: "Notes",
                table: "SalesBills");

            migrationBuilder.DropColumn(
                name: "PaymentStatus",
                table: "SalesBills");

            migrationBuilder.DropColumn(
                name: "Tax",
                table: "SalesBills");

            migrationBuilder.DropColumn(
                name: "Notes",
                table: "SalesBillItems");

            migrationBuilder.RenameColumn(
                name: "TotalAmount",
                table: "SalesBills",
                newName: "Amount");

            migrationBuilder.RenameColumn(
                name: "ProductId",
                table: "SalesBillItems",
                newName: "ItemId");

            migrationBuilder.RenameIndex(
                name: "IX_SalesBillItems_ProductId",
                table: "SalesBillItems",
                newName: "IX_SalesBillItems_ItemId");

            migrationBuilder.AlterColumn<string>(
                name: "BillNumber",
                table: "SalesBills",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(50)",
                oldMaxLength: 50);

            migrationBuilder.AddColumn<int>(
                name: "CustomerId",
                table: "SalesBills",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "PaymentMode",
                table: "SalesBills",
                type: "character varying(10)",
                maxLength: 10,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "PhotoPath",
                table: "SalesBills",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Remarks",
                table: "SalesBills",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "SalesBillItems",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "SalesBillItems",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.CreateIndex(
                name: "IX_SalesBills_CustomerId",
                table: "SalesBills",
                column: "CustomerId");

            migrationBuilder.AddForeignKey(
                name: "FK_SalesBillItems_Items_ItemId",
                table: "SalesBillItems",
                column: "ItemId",
                principalTable: "Items",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_SalesBills_Customers_CustomerId",
                table: "SalesBills",
                column: "CustomerId",
                principalTable: "Customers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_SalesBillItems_Items_ItemId",
                table: "SalesBillItems");

            migrationBuilder.DropForeignKey(
                name: "FK_SalesBills_Customers_CustomerId",
                table: "SalesBills");

            migrationBuilder.DropIndex(
                name: "IX_SalesBills_CustomerId",
                table: "SalesBills");

            migrationBuilder.DropColumn(
                name: "CustomerId",
                table: "SalesBills");

            migrationBuilder.DropColumn(
                name: "PaymentMode",
                table: "SalesBills");

            migrationBuilder.DropColumn(
                name: "PhotoPath",
                table: "SalesBills");

            migrationBuilder.DropColumn(
                name: "Remarks",
                table: "SalesBills");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "SalesBillItems");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "SalesBillItems");

            migrationBuilder.RenameColumn(
                name: "Amount",
                table: "SalesBills",
                newName: "TotalAmount");

            migrationBuilder.RenameColumn(
                name: "ItemId",
                table: "SalesBillItems",
                newName: "ProductId");

            migrationBuilder.RenameIndex(
                name: "IX_SalesBillItems_ItemId",
                table: "SalesBillItems",
                newName: "IX_SalesBillItems_ProductId");

            migrationBuilder.AlterColumn<string>(
                name: "BillNumber",
                table: "SalesBills",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100);

            migrationBuilder.AddColumn<decimal>(
                name: "Discount",
                table: "SalesBills",
                type: "numeric(10,2)",
                precision: 10,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "GrandTotal",
                table: "SalesBills",
                type: "numeric(10,2)",
                precision: 10,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "Notes",
                table: "SalesBills",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PaymentStatus",
                table: "SalesBills",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<decimal>(
                name: "Tax",
                table: "SalesBills",
                type: "numeric(10,2)",
                precision: 10,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Notes",
                table: "SalesBillItems",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Product",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Discount = table.Column<decimal>(type: "numeric(10,2)", nullable: true),
                    ImagePath = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    Name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Price = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    StockQuantity = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    Tax = table.Column<decimal>(type: "numeric(5,2)", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Product", x => x.Id);
                });

            migrationBuilder.AddForeignKey(
                name: "FK_SalesBillItems_Product_ProductId",
                table: "SalesBillItems",
                column: "ProductId",
                principalTable: "Product",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
