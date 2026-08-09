using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddIsUsedToKhataBookAndEnsureDefault : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsUsed",
                table: "KhataBooks",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            // Ensure a default KhataBook exists
            // migrationBuilder.Sql(@"
            //     INSERT INTO ""KhataBooks"" (""Name"", ""CompanyName"", ""BusinessCategory"", ""BusinessType"", ""IsUsed"", ""CreatedAt"", ""UpdatedAt"")
            //     SELECT 'Default User', 'Default Company', 0, 0, true, NOW(), NOW()
            //     WHERE NOT EXISTS (SELECT 1 FROM ""KhataBooks"");
            // ");

            migrationBuilder.Sql(@"
INSERT INTO ""KhataBooks""
(
    ""Name"",
    ""Number"",
    ""Address"",
    ""Email"",
    ""CompanyName"",
    ""CompanyNumber"",
    ""CompanyAddress"",
    ""CompanyEmail"",
    ""BusinessCategory"",
    ""BusinessType"",
    ""TaxVat"",
    ""BookAccount"",
    ""Kyc"",
    ""IsUsed"",
    ""CreatedAt"",
    ""UpdatedAt""
)
SELECT
    'Default User',
    '',
    '',
    '',
    'Default Company',
    '',
    '',
    '',
    0,
    0,
    false,
    false,
    false,
    true,
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM ""KhataBooks"");
");

            // If KhataBooks exist but none are marked as used, set the first one as used
            migrationBuilder.Sql(@"
                UPDATE ""KhataBooks"" 
                SET ""IsUsed"" = true, ""UpdatedAt"" = NOW()
                WHERE ""Id"" = (SELECT MIN(""Id"") FROM ""KhataBooks"")
                AND NOT EXISTS (SELECT 1 FROM ""KhataBooks"" WHERE ""IsUsed"" = true);
            ");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 8, 15, 15, 11, 43, 248, DateTimeKind.Utc).AddTicks(8413), new DateTime(2025, 8, 15, 15, 11, 43, 248, DateTimeKind.Utc).AddTicks(8413) });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsUsed",
                table: "KhataBooks");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2025, 8, 15, 14, 33, 31, 280, DateTimeKind.Utc).AddTicks(2041), new DateTime(2025, 8, 15, 14, 33, 31, 280, DateTimeKind.Utc).AddTicks(2051) });
        }
    }
}
