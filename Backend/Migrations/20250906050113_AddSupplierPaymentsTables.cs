using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddSupplierPaymentsTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Remarks",
                table: "PaymentsReceived",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "BillPath",
                table: "PaymentsReceived",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "Remarks",
                table: "PaymentsGiven",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.CreateTable(
                name: "SupplierPaymentsGiven",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    KhataBookId = table.Column<int>(type: "integer", nullable: false),
                    PartyId = table.Column<int>(type: "integer", nullable: false),
                    Amount = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    Remarks = table.Column<string>(type: "text", nullable: true),
                    Date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    BillPath = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SupplierPaymentsGiven", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SupplierPaymentsGiven_KhataBooks_KhataBookId",
                        column: x => x.KhataBookId,
                        principalTable: "KhataBooks",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_SupplierPaymentsGiven_Suppliers_PartyId",
                        column: x => x.PartyId,
                        principalTable: "Suppliers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SupplierPaymentsReceived",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    KhataBookId = table.Column<int>(type: "integer", nullable: false),
                    PartyId = table.Column<int>(type: "integer", nullable: false),
                    Amount = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    Remarks = table.Column<string>(type: "text", nullable: true),
                    Date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    BillPath = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SupplierPaymentsReceived", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SupplierPaymentsReceived_KhataBooks_KhataBookId",
                        column: x => x.KhataBookId,
                        principalTable: "KhataBooks",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_SupplierPaymentsReceived_Suppliers_PartyId",
                        column: x => x.PartyId,
                        principalTable: "Suppliers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 9, 6, 5, 1, 12, 964, DateTimeKind.Utc).AddTicks(7688), new DateTime(2025, 9, 6, 5, 1, 12, 964, DateTimeKind.Utc).AddTicks(7703) });

            migrationBuilder.CreateIndex(
                name: "IX_SupplierPaymentsGiven_KhataBookId",
                table: "SupplierPaymentsGiven",
                column: "KhataBookId");

            migrationBuilder.CreateIndex(
                name: "IX_SupplierPaymentsGiven_PartyId",
                table: "SupplierPaymentsGiven",
                column: "PartyId");

            migrationBuilder.CreateIndex(
                name: "IX_SupplierPaymentsReceived_KhataBookId",
                table: "SupplierPaymentsReceived",
                column: "KhataBookId");

            migrationBuilder.CreateIndex(
                name: "IX_SupplierPaymentsReceived_PartyId",
                table: "SupplierPaymentsReceived",
                column: "PartyId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SupplierPaymentsGiven");

            migrationBuilder.DropTable(
                name: "SupplierPaymentsReceived");

            migrationBuilder.AlterColumn<string>(
                name: "Remarks",
                table: "PaymentsReceived",
                type: "text",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "BillPath",
                table: "PaymentsReceived",
                type: "text",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Remarks",
                table: "PaymentsGiven",
                type: "text",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 8, 16, 18, 24, 0, 340, DateTimeKind.Utc).AddTicks(4869), new DateTime(2025, 8, 16, 18, 24, 0, 340, DateTimeKind.Utc).AddTicks(4870) });
        }
    }
}
