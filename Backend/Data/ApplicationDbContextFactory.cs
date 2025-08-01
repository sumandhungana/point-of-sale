using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Backend.Data;

public class ApplicationDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
{
    public ApplicationDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<ApplicationDbContext>();
        var connectionString = "Host=localhost;Database=khatabook;Username=postgres;Password=1234567890;SearchPath=initSchema;Include Error Detail=true";
        optionsBuilder.UseNpgsql(connectionString, 
            x => x.MigrationsHistoryTable("__EFMigrationsHistory", "initSchema"));

        return new ApplicationDbContext(optionsBuilder.Options)
        {
            ConnectionString = connectionString
        };
    }
} 