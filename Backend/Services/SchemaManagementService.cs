using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Npgsql;
using System.Text.RegularExpressions;
using System.Text;
using Microsoft.Extensions.Logging;

namespace Backend.Services
{
    public class SchemaManagementService
    {
        private readonly ApplicationDbContext _context;
        private readonly SchemaConfigurationService _schemaConfig;
        private const string SCHEMA_PREFIX = "khata_";
        private const string SOURCE_SCHEMA = "initSchema";
        private static readonly Regex SchemaNameRegex = new Regex(@"^[a-zA-Z][a-zA-Z0-9_]*$", RegexOptions.Compiled);
        private readonly ILogger<SchemaManagementService> _logger;

        public SchemaManagementService(ApplicationDbContext context, SchemaConfigurationService schemaConfig, ILogger<SchemaManagementService> logger)
        {
            _context = context;
            _schemaConfig = schemaConfig;
            _logger = logger;
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

        public async Task<IActionResult> SwitchSchema(string schemaName)
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
                _logger.LogInformation("Switched to schema: {SchemaName}", schemaName);

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

        public async Task<(bool Success, string Message, List<string> ExecutedQueries)> CreateSchema(string schemaName)
        {
            var executedQueries = new List<string>();
            var logger = LoggerFactory.Create(builder => builder.AddConsole()).CreateLogger<SchemaManagementService>();

            try
            {

                using (var connection = new NpgsqlConnection(_context.Database.GetConnectionString()))
                {
                    logger.LogInformation("Opening database connection");
                    await connection.OpenAsync();

                    // Create schema
                    using (var command = connection.CreateCommand())
                    {
                        var createSchemaSql = $"CREATE SCHEMA IF NOT EXISTS \"{schemaName}\"";

                        executedQueries.Add(createSchemaSql);
                        command.CommandText = createSchemaSql;
                        await command.ExecuteNonQueryAsync();
                    }

                    // Get all tables from initSchema
                    var tableNames = new List<string>();
                    using (var command = connection.CreateCommand())
                    {
                        command.CommandText = @"
                            SELECT table_name 
                            FROM information_schema.tables 
                            WHERE table_schema = @sourceSchema 
                            AND table_type = 'BASE TABLE'
                            ORDER BY table_name";
                        command.Parameters.AddWithValue("@sourceSchema", SOURCE_SCHEMA);
                        
                        logger.LogInformation("Getting tables from {SourceSchema}", SOURCE_SCHEMA);
                        using (var reader = await command.ExecuteReaderAsync())
                        {
                            while (await reader.ReadAsync())
                            {
                                tableNames.Add(reader.GetString(0));
                            }
                        }
                        logger.LogInformation("Found {Count} tables to replicate", tableNames.Count);
                    }

                    // For each table, get its structure and create it in the new schema
                    foreach (var tableName in tableNames)
                    {
                        logger.LogInformation("Processing table {TableName}", tableName);

                        // Get table structure
                        var columns = new List<string>();
                        using (var command = connection.CreateCommand())
                        {
                            command.CommandText = @"
                                SELECT 
                                    column_name,
                                    data_type,
                                    character_maximum_length,
                                    is_nullable,
                                    column_default,
                                    is_identity,
                                    udt_name
                                FROM information_schema.columns 
                                WHERE table_schema = @sourceSchema
                                AND table_name = @tableName
                                ORDER BY ordinal_position";
                            command.Parameters.AddWithValue("@sourceSchema", SOURCE_SCHEMA);
                            command.Parameters.AddWithValue("@tableName", tableName);

                            logger.LogInformation("Getting column definitions for {TableName}", tableName);
                            using (var reader = await command.ExecuteReaderAsync())
                            {
                                while (await reader.ReadAsync())
                                {
                                    string columnName = reader.GetString(0);
                                    string dataType = reader.GetString(1);
                                    int? maxLength = reader.IsDBNull(2) ? (int?)null : reader.GetInt32(2);
                                    string isNullable = reader.GetString(3);
                                    string defaultValue = reader.IsDBNull(4) ? null : reader.GetString(4);
                                    string isIdentity = reader.GetString(5);
                                    string udtName = reader.GetString(6);

                                    var columnDef = new StringBuilder($"\"{columnName}\" {udtName}");
                                    
                                    if (maxLength.HasValue)
                                        columnDef.Append($"({maxLength})");
                                    
                                    if (isNullable == "NO")
                                        columnDef.Append(" NOT NULL");
                                    
                                    if (!string.IsNullOrEmpty(defaultValue))
                                        columnDef.Append($" DEFAULT {defaultValue}");
                                    
                                    if (isIdentity == "YES")
                                        columnDef.Append(" GENERATED BY DEFAULT AS IDENTITY");

                                    columns.Add(columnDef.ToString());
                                }
                            }
                        }

                        // Get primary keys
                        var primaryKeys = new List<string>();
                        using (var command = connection.CreateCommand())
                        {
                            command.CommandText = @"
                                SELECT column_name
                                FROM information_schema.key_column_usage
                                WHERE table_schema = @sourceSchema
                                AND table_name = @tableName
                                AND constraint_name IN (
                                    SELECT constraint_name
                                    FROM information_schema.table_constraints
                                    WHERE constraint_type = 'PRIMARY KEY'
                                    AND table_schema = @sourceSchema
                                    AND table_name = @tableName
                                )";
                            command.Parameters.AddWithValue("@sourceSchema", SOURCE_SCHEMA);
                            command.Parameters.AddWithValue("@tableName", tableName);

                            logger.LogInformation("Getting primary keys for {TableName}", tableName);
                            using (var reader = await command.ExecuteReaderAsync())
                            {
                                while (await reader.ReadAsync())
                                {
                                    primaryKeys.Add($"\"{reader.GetString(0)}\"");
                                }
                            }
                        }

                        // Create table
                        using (var command = connection.CreateCommand())
                        {
                            var createTableSql = new StringBuilder();
                            createTableSql.Append($"CREATE TABLE \"{schemaName}\".\"{tableName}\" (");
                            createTableSql.Append(string.Join(", ", columns));

                            if (primaryKeys.Any())
                            {
                                createTableSql.Append($", PRIMARY KEY ({string.Join(", ", primaryKeys)})");
                            }

                            createTableSql.Append(")");

                            executedQueries.Add(createTableSql.ToString());
                            command.CommandText = createTableSql.ToString();
                            logger.LogInformation("Creating table {TableName} in schema {SchemaName}", tableName, schemaName);
                            await command.ExecuteNonQueryAsync();
                        }
                    }

                    // Add foreign key constraints
                    foreach (var tableName in tableNames)
                    {
                        logger.LogInformation("Processing foreign keys for {TableName}", tableName);
                        var foreignKeys = new List<(string ColumnName, string ForeignTable, string ForeignColumn, string ConstraintName)>();
                        using (var command = connection.CreateCommand())
                        {
                            command.CommandText = @"
                                SELECT DISTINCT
                                    kcu.column_name,
                                    ccu.table_name AS foreign_table_name,
                                    ccu.column_name AS foreign_column_name,
                                    tc.constraint_name
                                FROM information_schema.key_column_usage kcu
                                JOIN information_schema.table_constraints tc
                                    ON tc.constraint_name = kcu.constraint_name
                                JOIN information_schema.constraint_column_usage ccu
                                    ON ccu.constraint_name = tc.constraint_name
                                WHERE tc.constraint_type = 'FOREIGN KEY'
                                AND kcu.table_schema = @sourceSchema
                                AND kcu.table_name = @tableName";
                            command.Parameters.AddWithValue("@sourceSchema", SOURCE_SCHEMA);
                            command.Parameters.AddWithValue("@tableName", tableName);

                            using (var reader = await command.ExecuteReaderAsync())
                            {
                                while (await reader.ReadAsync())
                                {
                                    foreignKeys.Add((
                                        reader.GetString(0),
                                        reader.GetString(1),
                                        reader.GetString(2),
                                        reader.GetString(3)
                                    ));
                                }
                            }
                        }

                        // Add foreign key constraints
                        foreach (var (columnName, foreignTable, foreignColumn, constraintName) in foreignKeys)
                        {
                            using (var command = connection.CreateCommand())
                            {
                                // Generate a unique constraint name for the new schema
                                var newConstraintName = $"{constraintName}_{schemaName}";
                                var addFkSql = $@"ALTER TABLE ""{schemaName}"".""{tableName}"" 
                                    ADD CONSTRAINT ""{newConstraintName}"" 
                                    FOREIGN KEY (""{columnName}"") 
                                    REFERENCES ""{schemaName}"".""{foreignTable}"" (""{foreignColumn}"")";
                                executedQueries.Add(addFkSql);
                                command.CommandText = addFkSql;
                                await command.ExecuteNonQueryAsync();
                            }
                        }
                    }

                    // Copy data from initSchema to new schema
                    foreach (var tableName in tableNames)
                    {
                        using (var command = connection.CreateCommand())
                        {
                            var copyDataSql = $@"INSERT INTO ""{schemaName}"".""{tableName}"" 
                                SELECT * FROM ""{SOURCE_SCHEMA}"".""{tableName}""";
                            executedQueries.Add(copyDataSql);
                            command.CommandText = copyDataSql;
                            await command.ExecuteNonQueryAsync();
                        }
                    }

                    return (true, $"Successfully created schema {schemaName} with all tables, constraints, and data", executedQueries);
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error creating schema {SchemaName}", schemaName);
                // If something goes wrong, clean up
                try
                {
                    using (var connection = new NpgsqlConnection(_context.Database.GetConnectionString()))
                    {
                        await connection.OpenAsync();
                        using (var command = connection.CreateCommand())
                        {
                            var dropSchemaSql = $"DROP SCHEMA IF EXISTS \"{schemaName}\" CASCADE";
                            executedQueries.Add(dropSchemaSql);
                            command.CommandText = dropSchemaSql;
                            await command.ExecuteNonQueryAsync();
                        }
                    }
                }
                catch (Exception cleanupEx)
                {
                    logger.LogError(cleanupEx, "Error during cleanup for schema {SchemaName}", schemaName);
                    executedQueries.Add($"Cleanup error: {cleanupEx.Message}");
                }

                return (false, $"Error creating schema: {ex.Message}", executedQueries);
            }
        }
    }
} 