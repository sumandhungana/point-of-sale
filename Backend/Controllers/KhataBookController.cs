using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Models;
using Backend.Data;
using Backend.Helpers;
using Microsoft.Extensions.Logging;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class KhataBookController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<KhataBookController> _logger;

        public KhataBookController(
            ApplicationDbContext context,
            ILogger<KhataBookController> logger)
        {
            _context = context;
            _logger = logger;
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

            // Parse business category and type safely
            BusinessCategory businessCategory;
            BusinessType businessType;
            
            if (!Enum.TryParse<BusinessCategory>(khataBookDto.BusinessCategory, out businessCategory))
            {
                return BadRequest($"Invalid business category: {khataBookDto.BusinessCategory}");
            }
            
            if (!Enum.TryParse<BusinessType>(khataBookDto.BusinessType, out businessType))
            {
                return BadRequest($"Invalid business type: {khataBookDto.BusinessType}");
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
                BusinessCategory = businessCategory,
                BusinessType = businessType,
                TaxVat = khataBookDto.TaxVat,
                BookAccount = khataBookDto.BookAccount,
                KYC = khataBookDto.KYC,
                ImagePath = imagePath
            };

            _logger.LogInformation("Saving KhataBook to database");
            _context.KhataBooks.Add(khataBook);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Successfully created KhataBook with ID {Id}", khataBook.Id);

            return CreatedAtAction(nameof(GetKhataBook), new { id = khataBook.Id }, khataBook);
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

            // Parse business category and type safely
            BusinessCategory businessCategory;
            BusinessType businessType;
            
            if (!Enum.TryParse<BusinessCategory>(khataBookDto.BusinessCategory, out businessCategory))
            {
                return BadRequest($"Invalid business category: {khataBookDto.BusinessCategory}");
            }
            
            if (!Enum.TryParse<BusinessType>(khataBookDto.BusinessType, out businessType))
            {
                return BadRequest($"Invalid business type: {khataBookDto.BusinessType}");
            }

            khataBook.Name = khataBookDto.Name;
            khataBook.Number = khataBookDto.Number;
            khataBook.Address = khataBookDto.Address;
            khataBook.Email = khataBookDto.Email;
            khataBook.CompanyName = khataBookDto.CompanyName;
            khataBook.CompanyNumber = khataBookDto.CompanyNumber;
            khataBook.CompanyAddress = khataBookDto.CompanyAddress;
            khataBook.CompanyEmail = khataBookDto.CompanyEmail;
            khataBook.BusinessCategory = businessCategory;
            khataBook.BusinessType = businessType;
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