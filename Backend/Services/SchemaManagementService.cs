using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Npgsql;
using System.Text.RegularExpressions;
using System.Text;

namespace Backend.Services
{
    public class SchemaManagementService
    {
        private readonly ApplicationDbContext _context;
        private readonly SchemaConfigurationService _schemaConfig;
        private const string SCHEMA_PREFIX = "khata_";
        private const string SOURCE_SCHEMA = "initSchema";
        private static readonly Regex SchemaNameRegex = new Regex(@"^[a-zA-Z][a-zA-Z0-9_]*$", RegexOptions.Compiled);

        public SchemaManagementService(ApplicationDbContext context, SchemaConfigurationService schemaConfig)
        {
            _context = context;
            _schemaConfig = schemaConfig;
        }

        public async Task<IActionResult> ChangeSchema()
        {
            // Set the schema in the configuration
            await _schemaConfig.SetCurrentSchemaAsync("initSchema");

            // Reload the DbContext with the new schema
            await _context.ReloadWithSchemaAsync("initSchema");

            // Verify the schema switch was successful
            using (var connection = new NpgsqlConnection(_context.Database.GetConnectionString()))
            {
                await connection.OpenAsync();
                using (var command = connection.CreateCommand())
                {
                    // Get list of tables in the schema
                    command.CommandText = @"
                        SELECT table_name 
                        FROM information_schema.tables 
                        WHERE table_schema = @schemaName 
                        AND table_type = 'BASE TABLE'
                        ORDER BY table_name";
                    command.Parameters.AddWithValue("@schemaName", "initSchema");

                    var tables = new List<string>();
                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            tables.Add(reader.GetString(0));
                        }
                    }

                    return new OkObjectResult(new
                    {
                        message = $"Successfully switched to schema: initSchema",
                        schema = "initSchema",
                        tables
                    });
                }
            }
        }

        public async Task<IActionResult> SwitchSchema(int id, string schemaName)
        {
            try
            {
                // First verify the schema exists
                using (var connection = new NpgsqlConnection(_context.Database.GetConnectionString()))
                {
                    await connection.OpenAsync();
                    using (var command = connection.CreateCommand())
                    {
                        command.CommandText = @"
                            SELECT EXISTS (
                                SELECT 1 
                                FROM information_schema.schemata 
                                WHERE schema_name = @schemaName
                            )";
                        command.Parameters.AddWithValue("@schemaName", schemaName);
                        var schemaExists = (bool)await command.ExecuteScalarAsync();

                        if (!schemaExists)
                        {
                            return new NotFoundObjectResult($"Schema {schemaName} does not exist");
                        }
                    }
                }

                // Set the schema in the configuration
                await _schemaConfig.SetCurrentSchemaAsync(schemaName);

                // Reload the DbContext with the new schema
                await _context.ReloadWithSchemaAsync(schemaName);

                // Verify the schema switch was successful
                using (var connection = new NpgsqlConnection(_context.Database.GetConnectionString()))
                {
                    await connection.OpenAsync();
                    using (var command = connection.CreateCommand())
                    {
                        // Get list of tables in the schema
                        command.CommandText = @"
                            SELECT table_name 
                            FROM information_schema.tables 
                            WHERE table_schema = @schemaName 
                            AND table_type = 'BASE TABLE'
                            ORDER BY table_name";
                        command.Parameters.AddWithValue("@schemaName", schemaName);

                        var tables = new List<string>();
                        using (var reader = await command.ExecuteReaderAsync())
                        {
                            while (await reader.ReadAsync())
                            {
                                tables.Add(reader.GetString(0));
                            }
                        }

                        return new OkObjectResult(new
                        {
                            message = $"Successfully switched to schema: {schemaName}",
                            schema = schemaName,
                            tables
                        });
                    }
                }
            }
            catch (Exception ex)
            {
                // Reset to default schema on error
                await _schemaConfig.ResetToDefaultSchemaAsync();
                await _context.ReloadWithSchemaAsync(SOURCE_SCHEMA);

                return new StatusCodeResult(500);
            }
        }

        public async Task<ActionResult<IEnumerable<string>>> GetSchemaTables(string schemaName)
        {
            var tables = new List<string>();
            try
            {
                using (var connection = new NpgsqlConnection(_context.Database.GetConnectionString()))
                {
                    await connection.OpenAsync();
                    using (var command = connection.CreateCommand())
                    {
                        command.CommandText = $@"
                            SELECT table_name 
                            FROM information_schema.tables 
                            WHERE table_schema = @schemaName 
                            AND table_type = 'BASE TABLE'";
                        command.Parameters.AddWithValue("@schemaName", schemaName);

                        using (var reader = await command.ExecuteReaderAsync())
                        {
                            while (await reader.ReadAsync())
                            {
                                tables.Add(reader.GetString(0));
                            }
                        }
                    }
                }
                return new OkObjectResult(tables);
            }
            catch (Exception ex)
            {
                return new StatusCodeResult(500);
            }
        }

        public async Task<ActionResult<IEnumerable<string>>> GetAllSchemas()
        {
            var schemas = new List<string>();
            try
            {
                using (var connection = new NpgsqlConnection(_context.Database.GetConnectionString()))
                {
                    await connection.OpenAsync();
                    using (var command = connection.CreateCommand())
                    {
                        command.CommandText = @"
                            SELECT schema_name 
                            FROM information_schema.schemata 
                            WHERE schema_name NOT LIKE 'pg_%' 
                            AND schema_name != 'information_schema'
                            AND schema_name LIKE @prefix";
                        command.Parameters.AddWithValue("@prefix", $"{SCHEMA_PREFIX}%");

                        using (var reader = await command.ExecuteReaderAsync())
                        {
                            while (await reader.ReadAsync())
                            {
                                schemas.Add(reader.GetString(0));
                            }
                        }
                    }
                }
                return new OkObjectResult(schemas);
            }
            catch (Exception ex)
            {
                return new StatusCodeResult(500);
            }
        }

        public async Task<ActionResult<bool>> ValidateSchema(string schemaName)
        {
            try
            {
                using (var connection = new NpgsqlConnection(_context.Database.GetConnectionString()))
                {
                    await connection.OpenAsync();
                    using (var command = connection.CreateCommand())
                    {
                        command.CommandText = $@"
                            SELECT EXISTS (
                                SELECT 1 
                                FROM information_schema.schemata 
                                WHERE schema_name = @schemaName
                            )";
                        command.Parameters.AddWithValue("@schemaName", schemaName);

                        var exists = (bool)await command.ExecuteScalarAsync();
                        return new OkObjectResult(exists);
                    }
                }
            }
            catch (Exception ex)
            {
                return new StatusCodeResult(500);
            }
        }

        public bool ValidateSchemaName(string name)
        {
            return SchemaNameRegex.IsMatch(name);
        }
    }
} 