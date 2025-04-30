using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace Backend.Data
{
    public static class MigrationHelper
    {
        public static async Task MigrateAllSchemasAsync(ApplicationDbContext context)
        {
            // Get all schemas from the database
            var schemas = await GetSchemasAsync(context);
            
            // Migrate each schema
            foreach (var schema in schemas)
            {
                try
                {
                    // Set the current schema
                    await context.ReloadWithSchemaAsync(schema);
                    
                    // Apply migrations for this schema
                    await context.Database.MigrateAsync();
                }
                catch (Exception ex)
                {
                    // Log the error but continue with other schemas
                    Console.WriteLine($"Error migrating schema {schema}: {ex.Message}");
                }
            }
        }

        private static async Task<List<string>> GetSchemasAsync(ApplicationDbContext context)
        {
            var schemas = new List<string>();
            
            using (var connection = new NpgsqlConnection(context.Database.GetConnectionString()))
            {
                await connection.OpenAsync();
                
                using (var command = connection.CreateCommand())
                {
                    command.CommandText = @"
                        SELECT schema_name 
                        FROM information_schema.schemata 
                        WHERE schema_name NOT LIKE 'pg_%' 
                        AND schema_name != 'information_schema'
                        AND schema_name != 'public'";
                    
                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            schemas.Add(reader.GetString(0));
                        }
                    }
                }
            }
            
            return schemas;
        }
    }
} 