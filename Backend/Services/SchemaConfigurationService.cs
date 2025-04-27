using System.Text.Json;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services
{
    public class SchemaConfigurationService
    {
        private const string CONFIG_FILE = "schema_config.json";
        private readonly IWebHostEnvironment _environment;
        private string _currentSchema = "initSchema";
        private DateTime _lastUpdated = DateTime.UtcNow;
        private readonly object _lock = new object();

        public SchemaConfigurationService(IWebHostEnvironment environment)
        {
            _environment = environment;
            // Load initial schema from file if it exists
            LoadSchemaFromFile().GetAwaiter().GetResult();
        }

        private string GetConfigPath()
        {
            return Path.Combine(_environment.ContentRootPath, CONFIG_FILE);
        }

        private async Task LoadSchemaFromFile()
        {
            var path = GetConfigPath();
            if (File.Exists(path))
            {
                var json = await File.ReadAllTextAsync(path);
                var config = JsonSerializer.Deserialize<SchemaConfig>(json);
                if (config != null)
                {
                    lock (_lock)
                    {
                        _currentSchema = config.CurrentSchema;
                        _lastUpdated = config.LastUpdated;
                    }
                }
            }
        }

        public async Task SetCurrentSchemaAsync(string schemaName)
        {
            lock (_lock)
            {
                _currentSchema = schemaName;
                _lastUpdated = DateTime.UtcNow;
            }

            var config = new SchemaConfig
            {
                CurrentSchema = schemaName,
                LastUpdated = _lastUpdated
            };

            var json = JsonSerializer.Serialize(config);
            await File.WriteAllTextAsync(GetConfigPath(), json);
        }

        public async Task<string?> GetCurrentSchemaAsync()
        {
            // Reload from file to ensure we have the latest schema
            await LoadSchemaFromFile();
            return _currentSchema;
        }

        public async Task ResetToDefaultSchemaAsync()
        {
            lock (_lock)
            {
                _currentSchema = "initSchema";
                _lastUpdated = DateTime.UtcNow;
            }

            var config = new SchemaConfig
            {
                CurrentSchema = "initSchema",
                LastUpdated = _lastUpdated
            };

            var json = JsonSerializer.Serialize(config);
            await File.WriteAllTextAsync(GetConfigPath(), json);
        }

        public string GetCurrentSchema()
        {
            lock (_lock)
            {
                return _currentSchema;
            }
        }
    }

    public class SchemaConfig
    {
        public string CurrentSchema { get; set; } = "initSchema";
        public DateTime LastUpdated { get; set; }
    }
} 