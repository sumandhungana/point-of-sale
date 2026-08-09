using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddPaymentDateReminderColumn : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
    migrationBuilder.Sql("""
        ALTER TABLE "Customers"
        ADD COLUMN "PaymentDateReminder" TIMESTAMP;
    """);
}

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
    migrationBuilder.Sql("""
        ALTER TABLE "Customers"
        DROP COLUMN "PaymentDateReminder";
    """);
}
    }
}
