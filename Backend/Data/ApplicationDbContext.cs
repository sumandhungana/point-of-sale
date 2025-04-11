using Microsoft.EntityFrameworkCore;
using Backend.Models;

namespace Backend.Data;

public class ApplicationDbContext : DbContext
{
    public required string ConnectionString { get; set; }

    public ApplicationDbContext()
    {
        ConnectionString = "Host=localhost;Database=backend;Username=postgres;Password=postgres";
    }

    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
        ConnectionString = "Host=localhost;Database=backend;Username=postgres;Password=postgres";
    }

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

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        if (!optionsBuilder.IsConfigured)
        {
            optionsBuilder.UseNpgsql(ConnectionString);
        }
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
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
            .Property(s => s.TotalAmount)
            .HasPrecision(10, 2);

        modelBuilder.Entity<SalesBill>()
            .Property(s => s.Discount)
            .HasPrecision(10, 2);

        modelBuilder.Entity<SalesBill>()
            .Property(s => s.Tax)
            .HasPrecision(10, 2);

        modelBuilder.Entity<SalesBill>()
            .Property(s => s.GrandTotal)
            .HasPrecision(10, 2);

        // Configure SalesBillItem model
        modelBuilder.Entity<SalesBillItem>()
            .Property(s => s.Quantity)
            .HasPrecision(10, 2);

        modelBuilder.Entity<SalesBillItem>()
            .Property(s => s.UnitPrice)
            .HasPrecision(10, 2);

        modelBuilder.Entity<SalesBillItem>()
            .Property(s => s.TotalPrice)
            .HasPrecision(10, 2);

        modelBuilder.Entity<SalesBillItem>()
            .Property(s => s.Discount)
            .HasPrecision(10, 2);

        modelBuilder.Entity<SalesBillItem>()
            .Property(s => s.Tax)
            .HasPrecision(10, 2);

        modelBuilder.Entity<SalesBillItem>()
            .Property(s => s.FinalPrice)
            .HasPrecision(10, 2);
    }
} 