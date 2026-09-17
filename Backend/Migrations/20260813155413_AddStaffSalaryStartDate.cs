using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddStaffSalaryStartDate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                                     ALTER TABLE "Staff"
                                     ADD COLUMN "SalaryStartDate" TIMESTAMP;
                                 """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                                     ALTER TABLE "Staff"
                                     DROP COLUMN "SalaryStartDate";
                                 """);
        }
    }
}
