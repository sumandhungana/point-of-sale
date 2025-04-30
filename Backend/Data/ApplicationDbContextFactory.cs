using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Backend.Data;

public class ApplicationDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
{
    public ApplicationDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<ApplicationDbContext>();
        optionsBuilder.UseNpgsql("Host=localhost;Database=backend;Username=postgres;Password=postgres");

        return new ApplicationDbContext(optionsBuilder.Options)
        {
            ConnectionString = "Host=localhost;Database=backend;Username=postgres;Password=postgres"
        };
    }
} 