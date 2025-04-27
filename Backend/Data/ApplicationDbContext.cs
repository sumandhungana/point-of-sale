using Microsoft.EntityFrameworkCore;
using Backend.Models;
using Backend.Data.Seeders;

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
    public DbSet<Cashbook> Cashbooks { get; set; } = null!;
    public DbSet<Income> Incomes { get; set; } = null!;
    public DbSet<Expenses> Expenses { get; set; } = null!;
    public DbSet<Purchase> Purchases { get; set; } = null!;
    public DbSet<PaymentsReceived> PaymentsReceived { get; set; } = null!;
    public DbSet<PaymentsGiven> PaymentsGiven { get; set; } = null!;
    public DbSet<KhataBook> KhataBooks { get; set; }

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
    }
} 