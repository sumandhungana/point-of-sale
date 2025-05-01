using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "initSchema");

            migrationBuilder.CreateTable(
                name: "AppSettings",
                schema: "initSchema",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    SideMenuBgColor = table.Column<string>(type: "character varying(7)", maxLength: 7, nullable: false),
                    SideMenuBgEndColor = table.Column<string>(type: "character varying(7)", maxLength: 7, nullable: false),
                    SideMenuFontColor = table.Column<string>(type: "character varying(7)", maxLength: 7, nullable: false),
                    SideMenuHoverFontColor = table.Column<string>(type: "character varying(7)", maxLength: 7, nullable: false),
                    SideMenuHoverBgColor = table.Column<string>(type: "character varying(7)", maxLength: 7, nullable: false),
                    TopMenuBgColor = table.Column<string>(type: "character varying(7)", maxLength: 7, nullable: false),
                    TopMenuFontColor = table.Column<string>(type: "character varying(7)", maxLength: 7, nullable: false),
                    AppBgColor = table.Column<string>(type: "character varying(7)", maxLength: 7, nullable: false),
                    AppForegroundColor = table.Column<string>(type: "character varying(7)", maxLength: 7, nullable: false),
                    LogoPath = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    FaviconPath = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    LoginBgPath = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    Currency = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    CurrencyPosition = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    DateFormat = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    TimeFormat = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    NumberFormat = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Language = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppSettings", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Categories",
                schema: "initSchema",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    CategoryType = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Categories", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Customers",
                schema: "initSchema",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Phone = table.Column<string>(type: "text", nullable: true),
                    Email = table.Column<string>(type: "text", nullable: true),
                    Address = table.Column<string>(type: "text", nullable: true),
                    Company = table.Column<string>(type: "text", nullable: true),
                    Pan = table.Column<string>(type: "text", nullable: true),
                    ContactPerson = table.Column<string>(type: "text", nullable: true),
                    isSupplier = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    BankAccount = table.Column<string>(type: "text", nullable: true),
                    CashBalance = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    ProfileImage = table.Column<string>(type: "text", nullable: true),
                    CustomerSmsSetting = table.Column<bool>(type: "boolean", nullable: false),
                    SmsLanguage = table.Column<bool>(type: "boolean", nullable: false),
                    TransactionHistoryCheck = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Customers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "InvoiceSettings",
                schema: "initSchema",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PremiumBill = table.Column<string>(type: "text", nullable: true),
                    ThermalBill = table.Column<string>(type: "text", nullable: true),
                    BasicBill = table.Column<string>(type: "text", nullable: true),
                    RegularPrinterField1 = table.Column<string>(type: "text", nullable: true),
                    RegularPrinterField2 = table.Column<string>(type: "text", nullable: true),
                    RegularPrinterField3 = table.Column<string>(type: "text", nullable: true),
                    ThermalPrinterField1 = table.Column<string>(type: "text", nullable: true),
                    ThermalPrinterField2 = table.Column<string>(type: "text", nullable: true),
                    ThermalPrinterField3 = table.Column<string>(type: "text", nullable: true),
                    ShowCompanyName = table.Column<bool>(type: "boolean", nullable: false),
                    ShowCompanyLogo = table.Column<bool>(type: "boolean", nullable: false),
                    ShowAddress = table.Column<bool>(type: "boolean", nullable: false),
                    ShowEmail = table.Column<bool>(type: "boolean", nullable: false),
                    ShowPhone = table.Column<bool>(type: "boolean", nullable: false),
                    ShowPanVat = table.Column<bool>(type: "boolean", nullable: false),
                    CompanyName = table.Column<string>(type: "text", nullable: true),
                    CompanyLogo = table.Column<string>(type: "text", nullable: true),
                    Address = table.Column<string>(type: "text", nullable: true),
                    Email = table.Column<string>(type: "text", nullable: true),
                    Phone = table.Column<string>(type: "text", nullable: true),
                    PanVat = table.Column<string>(type: "text", nullable: true),
                    ShowAuthorizedSignature = table.Column<bool>(type: "boolean", nullable: false),
                    AuthorizedSignatureText = table.Column<string>(type: "text", nullable: true),
                    ChangeSignature = table.Column<string>(type: "text", nullable: true),
                    PaperSize = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    Orientation = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    CompanyNameTextSize = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    InvoiceTaxSize = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InvoiceSettings", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "KhataBook",
                schema: "initSchema",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Number = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Address = table.Column<string>(type: "text", nullable: false),
                    Email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    CompanyName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    CompanyNumber = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    CompanyAddress = table.Column<string>(type: "text", nullable: false),
                    CompanyEmail = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    SchemaName = table.Column<string>(type: "text", nullable: true),
                    BusinessCategory = table.Column<int>(type: "integer", nullable: false),
                    BusinessType = table.Column<int>(type: "integer", nullable: false),
                    TaxVat = table.Column<bool>(type: "boolean", nullable: false),
                    BookAccount = table.Column<bool>(type: "boolean", nullable: false),
                    Kyc = table.Column<bool>(type: "boolean", nullable: false),
                    ImagePath = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_KhataBook", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PaymentGateways",
                schema: "initSchema",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    PaymentMode = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    ImagePath = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    VerificationUrl = table.Column<string>(type: "text", nullable: false),
                    PublicKey = table.Column<string>(type: "text", nullable: false),
                    SecretKey = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PaymentGateways", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Payments",
                schema: "initSchema",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Amount = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    PaymentDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    PaymentMode = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Payments", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Permissions",
                schema: "initSchema",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false),
                    Module = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    PermissionName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Permissions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "RentalItems",
                schema: "initSchema",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    RentalItemName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    PhoneNumber = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Address = table.Column<string>(type: "text", nullable: false),
                    RentalAmount = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    RentalPeriod = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    StartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EndDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Remarks = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RentalItems", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Roles",
                schema: "initSchema",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Roles", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Services",
                schema: "initSchema",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ServiceName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Price = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    TaxIncluded = table.Column<bool>(type: "boolean", nullable: false),
                    TaxIncludedAmount = table.Column<decimal>(type: "numeric(10,2)", nullable: true),
                    Tax = table.Column<decimal>(type: "numeric(5,2)", nullable: true),
                    Vat = table.Column<decimal>(type: "numeric(5,2)", nullable: true),
                    ImagePath = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Services", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SmsGateways",
                schema: "initSchema",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PartnerName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Active = table.Column<bool>(type: "boolean", nullable: false),
                    Form = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Token = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    ApiUrl = table.Column<string>(type: "text", nullable: false),
                    TestSms = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SmsGateways", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Staff",
                schema: "initSchema",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Address = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    Phone = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    Email = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Remarks = table.Column<string>(type: "text", nullable: true),
                    ProfileImageUrl = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Staff", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Suppliers",
                schema: "initSchema",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Phone = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    Email = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Address = table.Column<string>(type: "text", nullable: true),
                    Company = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Pan = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    ContactPerson = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Suppliers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Transactions",
                schema: "initSchema",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Description = table.Column<string>(type: "text", nullable: false),
                    Amount = table.Column<decimal>(type: "numeric", nullable: false),
                    TransactionDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    TransactionType = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Transactions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                schema: "initSchema",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Username = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Password = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Enable = table.Column<bool>(type: "boolean", nullable: false),
                    Branch = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    Permission = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Parent = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Address = table.Column<string>(type: "text", nullable: true),
                    Company = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Email = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Phone = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    Pan = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    Remarks = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Items",
                schema: "initSchema",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    PrimaryUnit = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    SecondaryUnit = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    IsSecondaryUnitEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    CategoryId = table.Column<int>(type: "integer", nullable: true),
                    SalesPrice = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: true),
                    PurchasePrice = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: true),
                    TaxIncluded = table.Column<bool>(type: "boolean", nullable: false),
                    OpeningStock = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    LowStockAlert = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: true),
                    VatPercentage = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: true),
                    VatPercentageToday = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: true),
                    ImageUrl = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Items", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Items_Categories_CategoryId",
                        column: x => x.CategoryId,
                        principalSchema: "initSchema",
                        principalTable: "Categories",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Bills",
                schema: "initSchema",
                columns: table => new
                {
                    BillId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CustomerId = table.Column<int>(type: "integer", nullable: false),
                    BillDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DueDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    TotalAmount = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    PaidAmount = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Bills", x => x.BillId);
                    table.ForeignKey(
                        name: "FK_Bills_Customers_CustomerId",
                        column: x => x.CustomerId,
                        principalSchema: "initSchema",
                        principalTable: "Customers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PaymentsGiven",
                schema: "initSchema",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PartyId = table.Column<int>(type: "integer", nullable: false),
                    Amount = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    Remarks = table.Column<string>(type: "text", nullable: false),
                    Date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    BillPath = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PaymentsGiven", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PaymentsGiven_Customers_PartyId",
                        column: x => x.PartyId,
                        principalSchema: "initSchema",
                        principalTable: "Customers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PaymentsReceived",
                schema: "initSchema",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PartyId = table.Column<int>(type: "integer", nullable: false),
                    Amount = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    Remarks = table.Column<string>(type: "text", nullable: false),
                    Date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    BillPath = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PaymentsReceived", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PaymentsReceived_Customers_PartyId",
                        column: x => x.PartyId,
                        principalSchema: "initSchema",
                        principalTable: "Customers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SalesBills",
                schema: "initSchema",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    BillNumber = table.Column<string>(type: "varchar(10)", maxLength: 100, nullable: false),
                    BillDate = table.Column<DateTime>(type: "date", nullable: false),
                    CustomerId = table.Column<int>(type: "integer", nullable: false),
                    PaymentMode = table.Column<string>(type: "varchar(10)", nullable: false),
                    Amount = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    Remarks = table.Column<string>(type: "text", nullable: true),
                    PhotoPath = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SalesBills", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SalesBills_Customers_CustomerId",
                        column: x => x.CustomerId,
                        principalSchema: "initSchema",
                        principalTable: "Customers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RolePermissions",
                schema: "initSchema",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    RoleId = table.Column<int>(type: "integer", nullable: false),
                    PermissionId = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RolePermissions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RolePermissions_Permissions_PermissionId",
                        column: x => x.PermissionId,
                        principalSchema: "initSchema",
                        principalTable: "Permissions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RolePermissions_Roles_RoleId",
                        column: x => x.RoleId,
                        principalSchema: "initSchema",
                        principalTable: "Roles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "StaffAttendances",
                schema: "initSchema",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    StaffId = table.Column<int>(type: "integer", nullable: false),
                    Date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    Note = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StaffAttendances", x => x.Id);
                    table.ForeignKey(
                        name: "FK_StaffAttendances_Staff_StaffId",
                        column: x => x.StaffId,
                        principalSchema: "initSchema",
                        principalTable: "Staff",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "StaffSalaries",
                schema: "initSchema",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    StaffId = table.Column<int>(type: "integer", nullable: false),
                    Month = table.Column<int>(type: "integer", nullable: false),
                    Year = table.Column<int>(type: "integer", nullable: false),
                    SelectedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsSlideOn = table.Column<bool>(type: "boolean", nullable: false),
                    CalculationDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    SalaryType = table.Column<string>(type: "text", nullable: false),
                    Amount = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    Permission = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StaffSalaries", x => x.Id);
                    table.ForeignKey(
                        name: "FK_StaffSalaries_Staff_StaffId",
                        column: x => x.StaffId,
                        principalSchema: "initSchema",
                        principalTable: "Staff",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Cashbooks",
                schema: "initSchema",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CashbookNo = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Date = table.Column<DateTime>(type: "date", nullable: false),
                    CategoryId = table.Column<int>(type: "integer", nullable: false),
                    ItemId = table.Column<int>(type: "integer", nullable: false),
                    PaymentMode = table.Column<string>(type: "varchar(20)", nullable: false),
                    Amount = table.Column<decimal>(type: "numeric(12,2)", nullable: false),
                    Remarks = table.Column<string>(type: "text", nullable: true),
                    PhotoPath = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Cashbooks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Cashbooks_Categories_CategoryId",
                        column: x => x.CategoryId,
                        principalSchema: "initSchema",
                        principalTable: "Categories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Cashbooks_Items_ItemId",
                        column: x => x.ItemId,
                        principalSchema: "initSchema",
                        principalTable: "Items",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Expenses",
                schema: "initSchema",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ExpensesNo = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Date = table.Column<DateTime>(type: "date", nullable: false),
                    CategoryId = table.Column<int>(type: "integer", nullable: false),
                    ItemId = table.Column<int>(type: "integer", nullable: false),
                    PaymentMode = table.Column<string>(type: "varchar(20)", nullable: false),
                    Amount = table.Column<decimal>(type: "numeric(12,2)", nullable: false),
                    Remarks = table.Column<string>(type: "text", nullable: true),
                    PhotoPath = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Expenses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Expenses_Categories_CategoryId",
                        column: x => x.CategoryId,
                        principalSchema: "initSchema",
                        principalTable: "Categories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Expenses_Items_ItemId",
                        column: x => x.ItemId,
                        principalSchema: "initSchema",
                        principalTable: "Items",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Incomes",
                schema: "initSchema",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    IncomeNo = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Date = table.Column<DateTime>(type: "date", nullable: false),
                    CategoryId = table.Column<int>(type: "integer", nullable: false),
                    ItemId = table.Column<int>(type: "integer", nullable: false),
                    PaymentMode = table.Column<string>(type: "varchar(20)", nullable: false),
                    Amount = table.Column<decimal>(type: "numeric(12,2)", nullable: false),
                    Remarks = table.Column<string>(type: "text", nullable: true),
                    PhotoPath = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Incomes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Incomes_Categories_CategoryId",
                        column: x => x.CategoryId,
                        principalSchema: "initSchema",
                        principalTable: "Categories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Incomes_Items_ItemId",
                        column: x => x.ItemId,
                        principalSchema: "initSchema",
                        principalTable: "Items",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Purchases",
                schema: "initSchema",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PurchaseNo = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Date = table.Column<DateTime>(type: "date", nullable: false),
                    CategoryId = table.Column<int>(type: "integer", nullable: false),
                    ItemId = table.Column<int>(type: "integer", nullable: false),
                    PaymentMode = table.Column<string>(type: "varchar(20)", nullable: false),
                    Amount = table.Column<decimal>(type: "numeric(12,2)", nullable: false),
                    Remarks = table.Column<string>(type: "text", nullable: true),
                    PhotoPath = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Purchases", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Purchases_Categories_CategoryId",
                        column: x => x.CategoryId,
                        principalSchema: "initSchema",
                        principalTable: "Categories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Purchases_Items_ItemId",
                        column: x => x.ItemId,
                        principalSchema: "initSchema",
                        principalTable: "Items",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SalesBillItems",
                schema: "initSchema",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    SalesBillId = table.Column<int>(type: "integer", nullable: false),
                    ItemId = table.Column<int>(type: "integer", nullable: false),
                    Quantity = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    UnitPrice = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    TotalPrice = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    Discount = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: true),
                    Tax = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: true),
                    FinalPrice = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SalesBillItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SalesBillItems_Items_ItemId",
                        column: x => x.ItemId,
                        principalSchema: "initSchema",
                        principalTable: "Items",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_SalesBillItems_SalesBills_SalesBillId",
                        column: x => x.SalesBillId,
                        principalSchema: "initSchema",
                        principalTable: "SalesBills",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                schema: "initSchema",
                table: "Permissions",
                columns: new[] { "Id", "CreatedAt", "Module", "PermissionName", "UpdatedAt" },
                values: new object[,]
                {
                    { 1, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Organization", "View Organization", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 2, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Organization", "Create Organization", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 3, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Organization", "Edit Organization", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 4, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Organization", "Delete Organization", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 5, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Reseller", "View Reseller", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 6, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Reseller", "Create Reseller", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 7, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Reseller", "Edit Reseller", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 8, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Reseller", "Delete Reseller", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 9, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "User", "View User", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 10, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "User", "Create User", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 11, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "User", "Edit User", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 12, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "User", "Delete User", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 13, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Report", "View Report", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 14, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Report", "Generate Report", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 15, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Report", "Export Report", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 16, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Staff", "View Staff", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 17, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Staff", "Create Staff", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 18, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Staff", "Edit Staff", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 19, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Staff", "Delete Staff", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 20, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Notification", "View Notification", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 21, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Notification", "Create Notification", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 22, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Notification", "Edit Notification", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 23, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Notification", "Delete Notification", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 24, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Customer", "View Customer", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 25, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Customer", "Create Customer", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 26, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Customer", "Edit Customer", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 27, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Customer", "Delete Customer", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 28, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Suppliers", "View Supplier", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 29, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Suppliers", "Create Supplier", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 30, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Suppliers", "Edit Supplier", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 31, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Suppliers", "Delete Supplier", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 32, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Bill", "View Bill", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 33, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Bill", "Create Bill", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 34, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Bill", "Edit Bill", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 35, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Bill", "Delete Bill", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 36, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Inventory", "View Inventory", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 37, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Inventory", "Create Inventory", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 38, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Inventory", "Edit Inventory", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 39, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Inventory", "Delete Inventory", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Bills_CustomerId",
                schema: "initSchema",
                table: "Bills",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_Cashbooks_CategoryId",
                schema: "initSchema",
                table: "Cashbooks",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_Cashbooks_ItemId",
                schema: "initSchema",
                table: "Cashbooks",
                column: "ItemId");

            migrationBuilder.CreateIndex(
                name: "IX_Expenses_CategoryId",
                schema: "initSchema",
                table: "Expenses",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_Expenses_ItemId",
                schema: "initSchema",
                table: "Expenses",
                column: "ItemId");

            migrationBuilder.CreateIndex(
                name: "IX_Incomes_CategoryId",
                schema: "initSchema",
                table: "Incomes",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_Incomes_ItemId",
                schema: "initSchema",
                table: "Incomes",
                column: "ItemId");

            migrationBuilder.CreateIndex(
                name: "IX_Items_CategoryId",
                schema: "initSchema",
                table: "Items",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_PaymentsGiven_PartyId",
                schema: "initSchema",
                table: "PaymentsGiven",
                column: "PartyId");

            migrationBuilder.CreateIndex(
                name: "IX_PaymentsReceived_PartyId",
                schema: "initSchema",
                table: "PaymentsReceived",
                column: "PartyId");

            migrationBuilder.CreateIndex(
                name: "IX_Purchases_CategoryId",
                schema: "initSchema",
                table: "Purchases",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_Purchases_ItemId",
                schema: "initSchema",
                table: "Purchases",
                column: "ItemId");

            migrationBuilder.CreateIndex(
                name: "IX_RolePermissions_PermissionId",
                schema: "initSchema",
                table: "RolePermissions",
                column: "PermissionId");

            migrationBuilder.CreateIndex(
                name: "IX_RolePermissions_RoleId",
                schema: "initSchema",
                table: "RolePermissions",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "IX_SalesBillItems_ItemId",
                schema: "initSchema",
                table: "SalesBillItems",
                column: "ItemId");

            migrationBuilder.CreateIndex(
                name: "IX_SalesBillItems_SalesBillId",
                schema: "initSchema",
                table: "SalesBillItems",
                column: "SalesBillId");

            migrationBuilder.CreateIndex(
                name: "IX_SalesBills_CustomerId",
                schema: "initSchema",
                table: "SalesBills",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_StaffAttendances_StaffId",
                schema: "initSchema",
                table: "StaffAttendances",
                column: "StaffId");

            migrationBuilder.CreateIndex(
                name: "IX_StaffSalaries_StaffId",
                schema: "initSchema",
                table: "StaffSalaries",
                column: "StaffId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Username",
                schema: "initSchema",
                table: "Users",
                column: "Username",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AppSettings",
                schema: "initSchema");

            migrationBuilder.DropTable(
                name: "Bills",
                schema: "initSchema");

            migrationBuilder.DropTable(
                name: "Cashbooks",
                schema: "initSchema");

            migrationBuilder.DropTable(
                name: "Expenses",
                schema: "initSchema");

            migrationBuilder.DropTable(
                name: "Incomes",
                schema: "initSchema");

            migrationBuilder.DropTable(
                name: "InvoiceSettings",
                schema: "initSchema");

            migrationBuilder.DropTable(
                name: "KhataBook",
                schema: "initSchema");

            migrationBuilder.DropTable(
                name: "PaymentGateways",
                schema: "initSchema");

            migrationBuilder.DropTable(
                name: "Payments",
                schema: "initSchema");

            migrationBuilder.DropTable(
                name: "PaymentsGiven",
                schema: "initSchema");

            migrationBuilder.DropTable(
                name: "PaymentsReceived",
                schema: "initSchema");

            migrationBuilder.DropTable(
                name: "Purchases",
                schema: "initSchema");

            migrationBuilder.DropTable(
                name: "RentalItems",
                schema: "initSchema");

            migrationBuilder.DropTable(
                name: "RolePermissions",
                schema: "initSchema");

            migrationBuilder.DropTable(
                name: "SalesBillItems",
                schema: "initSchema");

            migrationBuilder.DropTable(
                name: "Services",
                schema: "initSchema");

            migrationBuilder.DropTable(
                name: "SmsGateways",
                schema: "initSchema");

            migrationBuilder.DropTable(
                name: "StaffAttendances",
                schema: "initSchema");

            migrationBuilder.DropTable(
                name: "StaffSalaries",
                schema: "initSchema");

            migrationBuilder.DropTable(
                name: "Suppliers",
                schema: "initSchema");

            migrationBuilder.DropTable(
                name: "Transactions",
                schema: "initSchema");

            migrationBuilder.DropTable(
                name: "Users",
                schema: "initSchema");

            migrationBuilder.DropTable(
                name: "Permissions",
                schema: "initSchema");

            migrationBuilder.DropTable(
                name: "Roles",
                schema: "initSchema");

            migrationBuilder.DropTable(
                name: "Items",
                schema: "initSchema");

            migrationBuilder.DropTable(
                name: "SalesBills",
                schema: "initSchema");

            migrationBuilder.DropTable(
                name: "Staff",
                schema: "initSchema");

            migrationBuilder.DropTable(
                name: "Categories",
                schema: "initSchema");

            migrationBuilder.DropTable(
                name: "Customers",
                schema: "initSchema");
        }
    }
}
