using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Models;
using Backend.Data;
using System.Collections.Generic;
using System.Threading.Tasks;
using Npgsql;
using Microsoft.EntityFrameworkCore.Migrations;
using System.Data;
using System.Text.RegularExpressions;
using System.Text;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class KhataBookController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;
        private const string SCHEMA_PREFIX = "khata_";
        private static readonly Regex SchemaNameRegex = new Regex(@"^[a-zA-Z][a-zA-Z0-9_]*$", RegexOptions.Compiled);

        public KhataBookController(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        // Schema Management Endpoints
        [HttpPost("{id}/switch-schema")]
        public async Task<IActionResult> SwitchSchema(int id)
        {
            var khataBook = await _context.KhataBooks.FindAsync(id);
            if (khataBook == null)
            {
                return NotFound("KhataBook not found");
            }

            try
            {
                using (var connection = new NpgsqlConnection(_context.Database.GetConnectionString()))
                {
                    await connection.OpenAsync();
                    using (var command = connection.CreateCommand())
                    {
                        command.CommandText = $"SET search_path TO {khataBook.SchemaName}";
                        await command.ExecuteNonQueryAsync();
                    }
                }
                return Ok($"Switched to schema: {khataBook.SchemaName}");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error switching schema: {ex.Message}");
            }
        }

        [HttpGet("{id}/tables")]
        public async Task<ActionResult<IEnumerable<string>>> GetSchemaTables(int id)
        {
            var khataBook = await _context.KhataBooks.FindAsync(id);
            if (khataBook == null)
            {
                return NotFound("KhataBook not found");
            }

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
                        command.Parameters.AddWithValue("@schemaName", khataBook.SchemaName);

                        using (var reader = await command.ExecuteReaderAsync())
                        {
                            while (await reader.ReadAsync())
                            {
                                tables.Add(reader.GetString(0));
                            }
                        }
                    }
                }
                return Ok(tables);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error getting tables: {ex.Message}");
            }
        }

        [HttpGet("schemas")]
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
                return Ok(schemas);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error getting schemas: {ex.Message}");
            }
        }

        [HttpPost("{id}/validate-schema")]
        public async Task<ActionResult<bool>> ValidateSchema(int id)
        {
            var khataBook = await _context.KhataBooks.FindAsync(id);
            if (khataBook == null)
            {
                return NotFound("KhataBook not found");
            }

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
                        command.Parameters.AddWithValue("@schemaName", khataBook.SchemaName);

                        var exists = (bool)await command.ExecuteScalarAsync();
                        return Ok(exists);
                    }
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error validating schema: {ex.Message}");
            }
        }

        // GET: api/KhataBook
        [HttpGet]
        public async Task<ActionResult<IEnumerable<KhataBook>>> GetKhataBooks()
        {
            return await _context.KhataBooks.ToListAsync();
        }

        // GET: api/KhataBook/5
        [HttpGet("{id}")]
        public async Task<ActionResult<KhataBook>> GetKhataBook(int id)
        {
            var khataBook = await _context.KhataBooks.FindAsync(id);

            if (khataBook == null)
            {
                return NotFound();
            }

            return khataBook;
        }

        // POST: api/KhataBook
        [HttpPost]
        public async Task<ActionResult<KhataBook>> PostKhataBook(KhataBook khataBook)
        {
            if (!ValidateSchemaName(khataBook.Name))
            {
                return BadRequest("Invalid KhataBook name. Name must start with a letter and contain only letters, numbers, and underscores.");
            }

            // First save the KhataBook to get its ID
            _context.KhataBooks.Add(khataBook);
            await _context.SaveChangesAsync();

            // Create schema name based on KhataBook ID
            string schemaName = $"{SCHEMA_PREFIX}{khataBook.Id}";
            var executedQueries = new List<string>();

            try
            {
                // Create the schema
                using (var connection = new NpgsqlConnection(_context.Database.GetConnectionString()))
                {
                    await connection.OpenAsync();

                    // Create schema
                    using (var command = connection.CreateCommand())
                    {
                        var createSchemaSql = $"CREATE SCHEMA IF NOT EXISTS {schemaName}";
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
                            WHERE table_schema = 'initSchema' 
                            AND table_type = 'BASE TABLE'";
                        
                        using (var reader = await command.ExecuteReaderAsync())
                        {
                            while (await reader.ReadAsync())
                            {
                                tableNames.Add(reader.GetString(0));
                            }
                        }
                    }

                    // For each table, get its structure and create it in the new schema
                    foreach (var tableName in tableNames)
                    {
                        // Get table structure
                        var columns = new List<string>();
                        using (var command = connection.CreateCommand())
                        {
                            command.CommandText = $@"
                                SELECT 
                                    column_name,
                                    data_type,
                                    character_maximum_length,
                                    is_nullable,
                                    column_default,
                                    is_identity
                                FROM information_schema.columns 
                                WHERE table_schema = 'initSchema'
                                AND table_name = @tableName
                                ORDER BY ordinal_position";
                            command.Parameters.AddWithValue("@tableName", tableName);

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

                                    var columnDef = new StringBuilder($"{columnName} {dataType}");
                                    
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
                                WHERE table_schema = 'initSchema'
                                AND table_name = @tableName
                                AND constraint_name IN (
                                    SELECT constraint_name
                                    FROM information_schema.table_constraints
                                    WHERE constraint_type = 'PRIMARY KEY'
                                    AND table_schema = 'initSchema'
                                    AND table_name = @tableName
                                )";
                            command.Parameters.AddWithValue("@tableName", tableName);

                            using (var reader = await command.ExecuteReaderAsync())
                            {
                                while (await reader.ReadAsync())
                                {
                                    primaryKeys.Add(reader.GetString(0));
                                }
                            }
                        }

                        // Create table
                        using (var command = connection.CreateCommand())
                        {
                            var createTableSql = new StringBuilder();
                            createTableSql.Append($"CREATE TABLE {schemaName}.{tableName} (");
                            createTableSql.Append(string.Join(", ", columns));

                            if (primaryKeys.Any())
                            {
                                createTableSql.Append($", PRIMARY KEY ({string.Join(", ", primaryKeys)})");
                            }

                            createTableSql.Append(")");

                            executedQueries.Add(createTableSql.ToString());
                            command.CommandText = createTableSql.ToString();
                            await command.ExecuteNonQueryAsync();
                        }
                    }

                    // Add foreign key constraints
                    foreach (var tableName in tableNames)
                    {
                        var foreignKeys = new List<(string ColumnName, string ForeignTable, string ForeignColumn, string ConstraintName)>();
                        using (var command = connection.CreateCommand())
                        {
                            command.CommandText = @"
                                SELECT 
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
                                AND kcu.table_schema = 'initSchema'
                                AND kcu.table_name = @tableName";
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
                                var addFkSql = $"ALTER TABLE {schemaName}.{tableName} ADD CONSTRAINT {constraintName} FOREIGN KEY ({columnName}) REFERENCES {schemaName}.{foreignTable} ({foreignColumn})";
                                executedQueries.Add(addFkSql);
                                command.CommandText = addFkSql;
                                await command.ExecuteNonQueryAsync();
                            }
                        }
                    }
                }

                // Update KhataBook with schema name
                khataBook.SchemaName = schemaName;
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetKhataBook), new { id = khataBook.Id }, new
                {
                    khataBook,
                    executedQueries
                });
            }
            catch (Exception ex)
            {
                // If something goes wrong, clean up
                try
                {
                    _context.KhataBooks.Remove(khataBook);
                    await _context.SaveChangesAsync();

                    using (var connection = new NpgsqlConnection(_context.Database.GetConnectionString()))
                    {
                        await connection.OpenAsync();
                        using (var command = connection.CreateCommand())
                        {
                            var dropSchemaSql = $"DROP SCHEMA IF EXISTS {schemaName} CASCADE";
                            executedQueries.Add(dropSchemaSql);
                            command.CommandText = dropSchemaSql;
                            await command.ExecuteNonQueryAsync();
                        }
                    }
                }
                catch (Exception cleanupEx)
                {
                    executedQueries.Add($"Cleanup error: {cleanupEx.Message}");
                }

                return StatusCode(500, new
                {
                    error = $"Error creating KhataBook schema: {ex.Message}",
                    executedQueries
                });
            }
        }

        // PUT: api/KhataBook/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutKhataBook(int id, KhataBook khataBook)
        {
            if (id != khataBook.Id)
            {
                return BadRequest();
            }

            _context.Entry(khataBook).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!KhataBookExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // DELETE: api/KhataBook/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteKhataBook(int id)
        {
            var khataBook = await _context.KhataBooks.FindAsync(id);
            if (khataBook == null)
            {
                return NotFound();
            }

            try
            {
                // Drop the schema and all its tables
                using (var connection = new NpgsqlConnection(_context.Database.GetConnectionString()))
                {
                    await connection.OpenAsync();
                    using (var command = connection.CreateCommand())
                    {
                        command.CommandText = $"DROP SCHEMA IF EXISTS {khataBook.SchemaName} CASCADE";
                        await command.ExecuteNonQueryAsync();
                    }
                }

                _context.KhataBooks.Remove(khataBook);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error deleting KhataBook schema: {ex.Message}");
            }
        }

        private bool KhataBookExists(int id)
        {
            return _context.KhataBooks.Any(e => e.Id == id);
        }

        // Helper method for schema name validation
        private bool ValidateSchemaName(string name)
        {
            return SchemaNameRegex.IsMatch(name);
        }
    }
} 