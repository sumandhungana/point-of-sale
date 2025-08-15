using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class Add_KhataBookId_To_Final_Batches_456 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "KhataBookId",
                table: "Transactions",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "KhataBookId",
                table: "StaffSalaries",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "KhataBookId",
                table: "StaffAttendances",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "KhataBookId",
                table: "RentalItems",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "KhataBookId",
                table: "PaymentsReceived",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "KhataBookId",
                table: "PaymentsGiven",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "KhataBookId",
                table: "Payments",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            // Update existing data to assign to first KhataBook (ID=1) before adding foreign key constraints
            migrationBuilder.Sql("UPDATE \"PaymentsReceived\" SET \"KhataBookId\" = 1 WHERE \"KhataBookId\" = 0;");
            migrationBuilder.Sql("UPDATE \"PaymentsGiven\" SET \"KhataBookId\" = 1 WHERE \"KhataBookId\" = 0;");
            migrationBuilder.Sql("UPDATE \"Payments\" SET \"KhataBookId\" = 1 WHERE \"KhataBookId\" = 0;");
            migrationBuilder.Sql("UPDATE \"Transactions\" SET \"KhataBookId\" = 1 WHERE \"KhataBookId\" = 0;");
            migrationBuilder.Sql("UPDATE \"StaffAttendances\" SET \"KhataBookId\" = 1 WHERE \"KhataBookId\" = 0;");
            migrationBuilder.Sql("UPDATE \"StaffSalaries\" SET \"KhataBookId\" = 1 WHERE \"KhataBookId\" = 0;");
            migrationBuilder.Sql("UPDATE \"RentalItems\" SET \"KhataBookId\" = 1 WHERE \"KhataBookId\" = 0;");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 8, 15, 14, 33, 31, 280, DateTimeKind.Utc).AddTicks(2041), new DateTime(2025, 8, 15, 14, 33, 31, 280, DateTimeKind.Utc).AddTicks(2051) });

            migrationBuilder.CreateIndex(
                name: "IX_Transactions_KhataBookId",
                table: "Transactions",
                column: "KhataBookId");

            migrationBuilder.CreateIndex(
                name: "IX_StaffSalaries_KhataBookId",
                table: "StaffSalaries",
                column: "KhataBookId");

            migrationBuilder.CreateIndex(
                name: "IX_StaffAttendances_KhataBookId",
                table: "StaffAttendances",
                column: "KhataBookId");

            migrationBuilder.CreateIndex(
                name: "IX_RentalItems_KhataBookId",
                table: "RentalItems",
                column: "KhataBookId");

            migrationBuilder.CreateIndex(
                name: "IX_PaymentsReceived_KhataBookId",
                table: "PaymentsReceived",
                column: "KhataBookId");

            migrationBuilder.CreateIndex(
                name: "IX_PaymentsGiven_KhataBookId",
                table: "PaymentsGiven",
                column: "KhataBookId");

            migrationBuilder.CreateIndex(
                name: "IX_Payments_KhataBookId",
                table: "Payments",
                column: "KhataBookId");

            migrationBuilder.AddForeignKey(
                name: "FK_Payments_KhataBooks_KhataBookId",
                table: "Payments",
                column: "KhataBookId",
                principalTable: "KhataBooks",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_PaymentsGiven_KhataBooks_KhataBookId",
                table: "PaymentsGiven",
                column: "KhataBookId",
                principalTable: "KhataBooks",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_PaymentsReceived_KhataBooks_KhataBookId",
                table: "PaymentsReceived",
                column: "KhataBookId",
                principalTable: "KhataBooks",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_RentalItems_KhataBooks_KhataBookId",
                table: "RentalItems",
                column: "KhataBookId",
                principalTable: "KhataBooks",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_StaffAttendances_KhataBooks_KhataBookId",
                table: "StaffAttendances",
                column: "KhataBookId",
                principalTable: "KhataBooks",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_StaffSalaries_KhataBooks_KhataBookId",
                table: "StaffSalaries",
                column: "KhataBookId",
                principalTable: "KhataBooks",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Transactions_KhataBooks_KhataBookId",
                table: "Transactions",
                column: "KhataBookId",
                principalTable: "KhataBooks",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Payments_KhataBooks_KhataBookId",
                table: "Payments");

            migrationBuilder.DropForeignKey(
                name: "FK_PaymentsGiven_KhataBooks_KhataBookId",
                table: "PaymentsGiven");

            migrationBuilder.DropForeignKey(
                name: "FK_PaymentsReceived_KhataBooks_KhataBookId",
                table: "PaymentsReceived");

            migrationBuilder.DropForeignKey(
                name: "FK_RentalItems_KhataBooks_KhataBookId",
                table: "RentalItems");

            migrationBuilder.DropForeignKey(
                name: "FK_StaffAttendances_KhataBooks_KhataBookId",
                table: "StaffAttendances");

            migrationBuilder.DropForeignKey(
                name: "FK_StaffSalaries_KhataBooks_KhataBookId",
                table: "StaffSalaries");

            migrationBuilder.DropForeignKey(
                name: "FK_Transactions_KhataBooks_KhataBookId",
                table: "Transactions");

            migrationBuilder.DropIndex(
                name: "IX_Transactions_KhataBookId",
                table: "Transactions");

            migrationBuilder.DropIndex(
                name: "IX_StaffSalaries_KhataBookId",
                table: "StaffSalaries");

            migrationBuilder.DropIndex(
                name: "IX_StaffAttendances_KhataBookId",
                table: "StaffAttendances");

            migrationBuilder.DropIndex(
                name: "IX_RentalItems_KhataBookId",
                table: "RentalItems");

            migrationBuilder.DropIndex(
                name: "IX_PaymentsReceived_KhataBookId",
                table: "PaymentsReceived");

            migrationBuilder.DropIndex(
                name: "IX_PaymentsGiven_KhataBookId",
                table: "PaymentsGiven");

            migrationBuilder.DropIndex(
                name: "IX_Payments_KhataBookId",
                table: "Payments");

            migrationBuilder.DropColumn(
                name: "KhataBookId",
                table: "Transactions");

            migrationBuilder.DropColumn(
                name: "KhataBookId",
                table: "StaffSalaries");

            migrationBuilder.DropColumn(
                name: "KhataBookId",
                table: "StaffAttendances");

            migrationBuilder.DropColumn(
                name: "KhataBookId",
                table: "RentalItems");

            migrationBuilder.DropColumn(
                name: "KhataBookId",
                table: "PaymentsReceived");

            migrationBuilder.DropColumn(
                name: "KhataBookId",
                table: "PaymentsGiven");

            migrationBuilder.DropColumn(
                name: "KhataBookId",
                table: "Payments");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 8, 15, 14, 30, 27, 164, DateTimeKind.Utc).AddTicks(1521), new DateTime(2025, 8, 15, 14, 30, 27, 164, DateTimeKind.Utc).AddTicks(1521) });
        }
    }
}
