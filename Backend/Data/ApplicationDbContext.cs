using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Backend.Models;
using Backend.Data.Seeders;
using Backend.Services;
using System.Data;
using Npgsql;
using Microsoft.EntityFrameworkCore.Design;

namespace Backend.Data;

public class ApplicationDbContext : DbContext
{
    private readonly SchemaConfigurationService? _schemaConfig;
    private string? _currentSchema;

    public required string ConnectionString { get; set; }

    public ApplicationDbContext()
    {
        _currentSchema = "initSchema";
        _schemaConfig = null;
    }

    public ApplicationDbContext(
        DbContextOptions<ApplicationDbContext> options,
        SchemaConfigurationService? schemaConfig = null) 
        : base(options)
    {
        _schemaConfig = schemaConfig;
        _currentSchema = schemaConfig?.GetCurrentSchema() ?? "initSchema";
    }

    // Add constructor for design-time
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
        _currentSchema = "initSchema";
        _schemaConfig = null!;
    }

    public string? GetCurrentSchema() => _currentSchema;

    public DbSet<User> Users { get; set; } = null!;
    public DbSet<Customer> Customers { get; set; } = null!;
    public DbSet<Supplier> Suppliers { get; set; } = null!;
    public DbSet<Category> Categories { get; set; } = null!;
    public DbSet<Item> Items { get; set; } = null!;
    public DbSet<Bill> Bills { get; set; } = null!;
    public DbSet<RentalItem> RentalItems { get; set; } = null!;
    public DbSet<AppSettings> AppSettings { get; set; } = null!;
    public DbSet<InvoiceSettings> InvoiceSettings { get; set; } = null!;
    public DbSet<Transaction> Transactions { get; set; } = null!;
    public DbSet<SalesBill> SalesBills { get; set; } = null!;
    public DbSet<SalesBillItem> SalesBillItems { get; set; } = null!;
    public DbSet<PaymentGateway> PaymentGateways { get; set; } = null!;
    public DbSet<Payment> Payments { get; set; } = null!;
    public DbSet<Permission> Permissions { get; set; } = null!;
    public DbSet<Service> Services { get; set; } = null!;
    public DbSet<SmsGateway> SmsGateways { get; set; } = null!;
    public DbSet<StaffAttendance> StaffAttendances { get; set; } = null!;
    public DbSet<Staff> Staff { get; set; } = null!;
    public DbSet<Role> Roles { get; set; } = null!;
    public DbSet<RolePermission> RolePermissions { get; set; } = null!;
    public DbSet<StaffSalary> StaffSalaries { get; set; } = null!;
    public DbSet<Cashbook> Cashbooks { get; set; } = null!;
    public DbSet<Income> Incomes { get; set; } = null!;
    public DbSet<Expenses> Expenses { get; set; } = null!;
    public DbSet<Purchase> Purchases { get; set; } = null!;
    public DbSet<PaymentsReceived> PaymentsReceived { get; set; } = null!;
    public DbSet<PaymentsGiven> PaymentsGiven { get; set; } = null!;
    public DbSet<KhataBook> KhataBooks { get; set; } = null!;

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        if (!optionsBuilder.IsConfigured)
        {
            optionsBuilder.UseNpgsql(ConnectionString,
                x => x.MigrationsHistoryTable("__EFMigrationsHistory", "initSchema"));
        }

        optionsBuilder.ReplaceService<IModelCacheKeyFactory, CustomModelCacheKeyFactory>();
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        modelBuilder.HasDefaultSchema("initSchema");

        // Configure KhataBook properties
        
        modelBuilder.Entity<KhataBook>()
         .ToTable("KhataBook", "initSchema") 
            .Property(k => k.KYC)
            .HasColumnName("Kyc");

        PermissionSeeder.Seed(modelBuilder);
            
        // Configure User model
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Username)
            .IsUnique();
            
        // Configure Item model
        modelBuilder.Entity<Item>()
            .Property(i => i.SalesPrice)
            .HasPrecision(10, 2);
            
        modelBuilder.Entity<Item>()
            .Property(i => i.PurchasePrice)
            .HasPrecision(10, 2);
            
        modelBuilder.Entity<Item>()
            .Property(i => i.OpeningStock)
            .HasPrecision(10, 2);
            
        modelBuilder.Entity<Item>()
            .Property(i => i.LowStockAlert)
            .HasPrecision(10, 2);
            
        modelBuilder.Entity<Item>()
            .Property(i => i.VatPercentage)
            .HasPrecision(5, 2);
            
        modelBuilder.Entity<Item>()
            .Property(i => i.VatPercentageToday)
            .HasPrecision(5, 2);
            
        // Configure Bill model
        modelBuilder.Entity<Bill>()
            .Property(b => b.TotalAmount)
            .HasPrecision(10, 2);
            
        modelBuilder.Entity<Bill>()
            .Property(b => b.PaidAmount)
            .HasPrecision(10, 2);
            
        // Configure RentalItem model
        modelBuilder.Entity<RentalItem>()
            .Property(r => r.RentalAmount)
            .HasPrecision(10, 2);

        // Configure SalesBill model
        modelBuilder.Entity<SalesBill>()
            .Property(s => s.Amount)
            .HasPrecision(10, 2);

        modelBuilder.Entity<SalesBill>()
            .Property(s => s.PaymentMode)
            .HasColumnType("varchar(10)");

        modelBuilder.Entity<SalesBill>()
            .Property(s => s.BillNumber)
            .HasColumnType("varchar(10)");

        // Configure SalesBillItem model
        modelBuilder.Entity<SalesBillItem>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Quantity).HasPrecision(10, 2);
            entity.Property(e => e.UnitPrice).HasPrecision(10, 2);
            entity.Property(e => e.TotalPrice).HasPrecision(10, 2);
            entity.Property(e => e.Discount).HasPrecision(10, 2);
            entity.Property(e => e.Tax).HasPrecision(10, 2);
            entity.Property(e => e.FinalPrice).HasPrecision(10, 2);
            
            entity.HasOne(e => e.SalesBill)
                .WithMany()
                .HasForeignKey(e => e.SalesBillId)
                .OnDelete(DeleteBehavior.Cascade);
            
            entity.HasOne(e => e.Item)
                .WithMany()
                .HasForeignKey(e => e.ItemId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // Seed default admin user
        var adminSalt = "static_salt_123";
        var adminPassword = "admin123";
        var adminHash = Convert.ToBase64String(System.Security.Cryptography.SHA256.Create().ComputeHash(System.Text.Encoding.UTF8.GetBytes(adminPassword + adminSalt)));
        modelBuilder.Entity<User>().HasData(new User {
            Id = 1,
            Username = "admin",
            Password = "", // deprecated
            PasswordHash = adminHash,
            PasswordSalt = adminSalt,
            Permission = "admin",
            Enable = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        });
    }

    public async Task ReloadWithSchemaAsync(string schemaName)
    {
        _currentSchema = schemaName;
        await Database.CloseConnectionAsync();
        await Database.OpenConnectionAsync();
        await Database.ExecuteSqlRawAsync($"SET search_path TO {schemaName}");
        ChangeTracker.Clear();
    }

    public async Task EnsureMigrationsHistoryTableExistsAsync()
    {
        try
        {
            await Database.ExecuteSqlRawAsync($@"
                CREATE SCHEMA IF NOT EXISTS initSchema;
                CREATE TABLE IF NOT EXISTS initSchema.""__EFMigrationsHistory"" (
                    ""MigrationId"" character varying(150) NOT NULL,
                    ""ProductVersion"" character varying(32) NOT NULL,
                    CONSTRAINT ""PK___EFMigrationsHistory"" PRIMARY KEY (""MigrationId"")
                );");
        }
        catch (Exception ex)
        {
            // Log the error but don't throw - we want the application to continue
            Console.WriteLine($"Error ensuring migrations history table exists: {ex.Message}");
        }
    }

    public void SetCurrentSchema(string schema)
    {
        _currentSchema = schema;
        Database.SetConnectionString(Database.GetConnectionString());
    }
} 