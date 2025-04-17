using Microsoft.EntityFrameworkCore.Migrations;

namespace Backend.Migrations
{
    public partial class UpdateSalesBillSchema : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Drop existing table if it exists
            migrationBuilder.DropTable(name: "SalesBills");

            // Create new table with updated schema
            migrationBuilder.CreateTable(
                name: "SalesBills",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", "IdentityByDefaultColumn"),
                    BillNumber = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    BillDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CustomerId = table.Column<int>(type: "integer", nullable: false),
                    PaymentMode = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    Amount = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    Remarks = table.Column<string>(type: "text", nullable: true),
                    PhotoPath = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SalesBills", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SalesBills_Customers_CustomerId",
                        column: x => x.CustomerId,
                        principalTable: "Customers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_SalesBills_BillNumber",
                table: "SalesBills",
                column: "BillNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SalesBills_CustomerId",
                table: "SalesBills",
                column: "CustomerId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "SalesBills");
        }
    }
} 