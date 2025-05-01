using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Models;
using Backend.Data;
using Backend.Services;
using Backend.Helpers;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class KhataBookController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly SchemaManagementService _schemaService;
        private readonly ILogger<KhataBookController> _logger;
        private const string SCHEMA_PREFIX = "khata_";

        public KhataBookController(
            ApplicationDbContext context,
            SchemaManagementService schemaService,
            ILogger<KhataBookController> logger)
        {
            _context = context;
            _schemaService = schemaService;
            _logger = logger;
        }

        [HttpGet("changeSchema")]
        public async Task<IActionResult> ChangeSchema()
        {
            return await _schemaService.ChangeSchema();
        }

        [HttpGet("{id}/switch-schema")]
        public async Task<IActionResult> SwitchSchema(int id)
        {
            if (id == 0)
            {
                return await _schemaService.SwitchSchema("initSchema");
            }

            var khataBook = await _context.KhataBooks.FindAsync(id);
            if (khataBook == null)
            {
                return NotFound("KhataBook not found");
            }

            if (string.IsNullOrEmpty(khataBook.SchemaName))
            {
                return BadRequest("KhataBook does not have an associated schema");
            }

            return await _schemaService.SwitchSchema(khataBook.SchemaName);
        }

        [HttpGet("{id}/tables")]
        public async Task<ActionResult<IEnumerable<string>>> GetSchemaTables(int id)
        {
            var khataBook = await _context.KhataBooks.FindAsync(id);
            if (khataBook == null)
            {
                return NotFound("KhataBook not found");
            }

            if (string.IsNullOrEmpty(khataBook.SchemaName))
            {
                return BadRequest("KhataBook does not have an associated schema");
            }

            return await _schemaService.GetSchemaTables(khataBook.SchemaName);
        }

        [HttpGet("schemas")]
        public async Task<ActionResult<IEnumerable<string>>> GetAllSchemas()
        {
            return await _schemaService.GetAllSchemas();
        }

        [HttpPost("{id}/validate-schema")]
        public async Task<ActionResult<bool>> ValidateSchema(int id)
        {
            var khataBook = await _context.KhataBooks.FindAsync(id);
            if (khataBook == null)
            {
                return NotFound("KhataBook not found");
            }

            if (string.IsNullOrEmpty(khataBook.SchemaName))
            {
                return BadRequest("KhataBook does not have an associated schema");
            }

            return await _schemaService.ValidateSchema(khataBook.SchemaName);
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
        public async Task<ActionResult<KhataBook>> PostKhataBook([FromForm] KhataBookCreateDto khataBookDto, IFormFile? imageFile)
        {
            _logger.LogInformation("Starting KhataBook creation for {Name}", khataBookDto.Name);

            if (!_schemaService.ValidateSchemaName(khataBookDto.Name))
            {
                _logger.LogWarning("Invalid KhataBook name: {Name}", khataBookDto.Name);
                return BadRequest("Invalid KhataBook name. Name must start with a letter and contain only letters, numbers, and underscores.");
            }

            string? imagePath = null;
            if (imageFile != null && imageFile.Length > 0)
            {
                try
                {
                    _logger.LogInformation("Uploading image for KhataBook");
                    imagePath = await FileUploadHelper.UploadFileAsync(imageFile, _logger);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error uploading image for KhataBook");
                    return BadRequest("Error uploading image: " + ex.Message);
                }
            }

            var khataBook = new KhataBook
            {
                Name = khataBookDto.Name,
                Number = khataBookDto.Number,
                Address = khataBookDto.Address,
                Email = khataBookDto.Email,
                CompanyName = khataBookDto.CompanyName,
                CompanyNumber = khataBookDto.CompanyNumber,
                CompanyAddress = khataBookDto.CompanyAddress,
                CompanyEmail = khataBookDto.CompanyEmail,
                BusinessCategory = Enum.Parse<BusinessCategory>(khataBookDto.BusinessCategory),
                BusinessType = Enum.Parse<BusinessType>(khataBookDto.BusinessType),
                TaxVat = khataBookDto.TaxVat,
                BookAccount = khataBookDto.BookAccount,
                KYC = khataBookDto.KYC,
                ImagePath = imagePath
            };

            // First save the KhataBook to get its ID
            _logger.LogInformation("Saving KhataBook to database");
            _context.KhataBooks.Add(khataBook);
            await _context.SaveChangesAsync();

            // Create schema name based on KhataBook ID
            string schemaName = $"{SCHEMA_PREFIX}{khataBook.Id}";
            _logger.LogInformation("Creating schema {SchemaName} for KhataBook {Id}", schemaName, khataBook.Id);

            // Create the schema
            var (success, message, executedQueries) = await _schemaService.CreateSchema(schemaName);

            if (!success)
            {
                _logger.LogError("Failed to create schema: {Message}", message);
                _logger.LogError("Executed queries: {Queries}", string.Join("\n", executedQueries));

                // If schema creation fails, delete the KhataBook
                _context.KhataBooks.Remove(khataBook);
                await _context.SaveChangesAsync();

                return StatusCode(500, new { error = message, executedQueries });
            }

            _logger.LogInformation("Successfully created schema {SchemaName}", schemaName);

            // Update KhataBook with schema name
            khataBook.SchemaName = schemaName;
            await _context.SaveChangesAsync();

            _logger.LogInformation("Successfully created KhataBook with ID {Id}", khataBook.Id);

            return CreatedAtAction(nameof(GetKhataBook), new { id = khataBook.Id }, new
            {
                khataBook,
                executedQueries
            });
        }

        // PUT: api/KhataBook/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutKhataBook(int id, [FromForm] KhataBookUpdateDto khataBookDto, IFormFile? imageFile)
        {
            var khataBook = await _context.KhataBooks.FindAsync(id);
            if (khataBook == null)
            {
                return NotFound();
            }

            if (imageFile != null && imageFile.Length > 0)
            {
                try
                {
                    // Delete old image if exists
                    if (!string.IsNullOrEmpty(khataBook.ImagePath))
                    {
                        FileUploadHelper.DeleteFile(khataBook.ImagePath);
                    }

                    khataBook.ImagePath = await FileUploadHelper.UploadFileAsync(imageFile, _logger);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error uploading image for KhataBook");
                    return BadRequest("Error uploading image: " + ex.Message);
                }
            }

            khataBook.Name = khataBookDto.Name;
            khataBook.Number = khataBookDto.Number;
            khataBook.Address = khataBookDto.Address;
            khataBook.Email = khataBookDto.Email;
            khataBook.CompanyName = khataBookDto.CompanyName;
            khataBook.CompanyNumber = khataBookDto.CompanyNumber;
            khataBook.CompanyAddress = khataBookDto.CompanyAddress;
            khataBook.CompanyEmail = khataBookDto.CompanyEmail;
            khataBook.BusinessCategory = Enum.Parse<BusinessCategory>(khataBookDto.BusinessCategory);
            khataBook.BusinessType = Enum.Parse<BusinessType>(khataBookDto.BusinessType);
            khataBook.TaxVat = khataBookDto.TaxVat;
            khataBook.BookAccount = khataBookDto.BookAccount;
            khataBook.KYC = khataBookDto.KYC;

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

            // Delete associated image if exists
            if (!string.IsNullOrEmpty(khataBook.ImagePath))
            {
                FileUploadHelper.DeleteFile(khataBook.ImagePath);
            }

            _context.KhataBooks.Remove(khataBook);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool KhataBookExists(int id)
        {
            return _context.KhataBooks.Any(e => e.Id == id);
        }
    }

    public class KhataBookCreateDto
    {
        public string Name { get; set; } = string.Empty;
        public string Number { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string CompanyName { get; set; } = string.Empty;
        public string CompanyNumber { get; set; } = string.Empty;
        public string CompanyAddress { get; set; } = string.Empty;
        public string CompanyEmail { get; set; } = string.Empty;
        public string BusinessCategory { get; set; } = string.Empty;
        public string BusinessType { get; set; } = string.Empty;
        public bool TaxVat { get; set; }
        public bool BookAccount { get; set; }
        public bool KYC { get; set; }
    }

    public class KhataBookUpdateDto
    {
        public string Name { get; set; } = string.Empty;
        public string Number { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string CompanyName { get; set; } = string.Empty;
        public string CompanyNumber { get; set; } = string.Empty;
        public string CompanyAddress { get; set; } = string.Empty;
        public string CompanyEmail { get; set; } = string.Empty;
        public string BusinessCategory { get; set; } = string.Empty;
        public string BusinessType { get; set; } = string.Empty;
        public bool TaxVat { get; set; }
        public bool BookAccount { get; set; }
        public bool KYC { get; set; }
    }
} 