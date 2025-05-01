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
            
            // Always include initSchema
            if (!schemas.Contains("initSchema"))
            {
                schemas.Add("initSchema");
            }
            
            // Migrate each schema
            foreach (var schema in schemas)
            {
                try
                {
                    // Create schema if it doesn't exist
                    await CreateSchemaIfNotExistsAsync(context, schema);
                    
                    // Set the current schema
                    await context.ReloadWithSchemaAsync(schema);
                    
                    // Ensure migrations history table exists for this schema
                    await EnsureMigrationsHistoryTableExistsAsync(context, schema);
                    
                    // Apply migrations for this schema
                    await context.Database.MigrateAsync();
                    
                    Console.WriteLine($"Successfully migrated schema: {schema}");
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
                        WHERE schema_name NOT IN ('pg_catalog', 'information_schema', 'public')";
                    
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

        private static async Task CreateSchemaIfNotExistsAsync(ApplicationDbContext context, string schema)
        {
            using (var connection = new NpgsqlConnection(context.Database.GetConnectionString()))
            {
                await connection.OpenAsync();
                using (var command = connection.CreateCommand())
                {
                    command.CommandText = $"CREATE SCHEMA IF NOT EXISTS {schema}";
                    await command.ExecuteNonQueryAsync();
                }
            }
        }

        private static async Task EnsureMigrationsHistoryTableExistsAsync(ApplicationDbContext context, string schema)
        {
            try
            {
                using (var connection = new NpgsqlConnection(context.Database.GetConnectionString()))
                {
                    await connection.OpenAsync();
                    using (var command = connection.CreateCommand())
                    {
                        command.CommandText = $@"
                            CREATE TABLE IF NOT EXISTS {schema}.__EFMigrationsHistory (
                                MigrationId character varying(150) NOT NULL,
                                ProductVersion character varying(32) NOT NULL,
                                CONSTRAINT PK_{schema}___EFMigrationsHistory PRIMARY KEY (MigrationId)
                            );";
                        await command.ExecuteNonQueryAsync();
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error ensuring migrations history table exists in schema {schema}: {ex.Message}");
                throw;
            }
        }
    }
} 