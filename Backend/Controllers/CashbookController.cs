using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;
using Backend.Services;
using Backend.Helpers;
using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CashbookController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<CashbookController> _logger;
    private readonly IKhataBookContext _khataBookContext;

    public CashbookController(ApplicationDbContext context, ILogger<CashbookController> logger, IKhataBookContext khataBookContext)
    {
        _context = context;
        _logger = logger;
        _khataBookContext = khataBookContext;
    }

    // GET: api/Cashbook
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Cashbook>>> GetCashbooks()
    {
        var currentKhataBookId = _khataBookContext.GetCurrentKhataBookId();
        return await _context.Cashbooks
            .Include(c => c.Category)
            .Include(c => c.Item)
            .Where(c => c.KhataBookId == currentKhataBookId)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();
    }

    // GET: api/Cashbook/5
    [HttpGet("{id}")]
    public async Task<ActionResult<Cashbook>> GetCashbook(int id)
    {
        var currentKhataBookId = _khataBookContext.GetCurrentKhataBookId();
        var cashbook = await _context.Cashbooks
            .Include(c => c.Category)
            .Include(c => c.Item)
            .FirstOrDefaultAsync(c => c.Id == id && c.KhataBookId == currentKhataBookId);

        if (cashbook == null)
        {
            return NotFound();
        }

        return cashbook;
    }

    // POST: api/Cashbook
    [HttpPost]
    public async Task<ActionResult<Cashbook>> CreateCashbook([FromForm] CashbookCreateDto cashbookDto)
    {
        try
        {
            // Validate that the Item exists
            var item = await _context.Items.FindAsync(cashbookDto.ItemId);
            if (item == null)
            {
                return BadRequest($"Item with ID {cashbookDto.ItemId} does not exist");
            }

            // Validate that the Category exists
            var category = await _context.Categories.FindAsync(cashbookDto.CategoryId);
            if (category == null)
            {
                return BadRequest($"Category with ID {cashbookDto.CategoryId} does not exist");
            }

            var cashbook = new Cashbook
            {
                KhataBookId = _khataBookContext.GetCurrentKhataBookId(),
                CashbookNo = cashbookDto.CashbookNo,
                Date = cashbookDto.Date.ToUniversalTime(),
                CategoryId = cashbookDto.CategoryId,
                ItemId = cashbookDto.ItemId,
                PaymentMode = cashbookDto.PaymentMode,
                Amount = cashbookDto.Amount,
                Remarks = cashbookDto.Remarks,
                CreatedAt = DateTime.UtcNow
            };

            if (cashbookDto.Photo != null)
            {
                cashbook.PhotoPath = await FileUploadHelper.UploadFileAsync(cashbookDto.Photo, _logger);
            }

            _context.Cashbooks.Add(cashbook);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetCashbook), new { id = cashbook.Id }, cashbook);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating cashbook entry");
            return BadRequest(ex.Message);
        }
    }

    // PUT: api/Cashbook/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateCashbook(int id, [FromForm] CashbookUpdateDto cashbookDto)
    {
        try
        {
            var currentKhataBookId = _khataBookContext.GetCurrentKhataBookId();
            var cashbook = await _context.Cashbooks
                .FirstOrDefaultAsync(c => c.Id == id && c.KhataBookId == currentKhataBookId);
            if (cashbook == null)
            {
                return NotFound();
            }

            cashbook.CashbookNo = cashbookDto.CashbookNo;
            cashbook.Date = cashbookDto.Date.ToUniversalTime();
            cashbook.CategoryId = cashbookDto.CategoryId;
            cashbook.ItemId = cashbookDto.ItemId;
            cashbook.PaymentMode = cashbookDto.PaymentMode;
            cashbook.Amount = cashbookDto.Amount;
            cashbook.Remarks = cashbookDto.Remarks;

            if (cashbookDto.Photo != null)
            {
                // Delete old photo if exists
                if (!string.IsNullOrEmpty(cashbook.PhotoPath))
                {
                    FileUploadHelper.DeleteFile(cashbook.PhotoPath);
                }
                // Upload new photo
                cashbook.PhotoPath = await FileUploadHelper.UploadFileAsync(cashbookDto.Photo, _logger);
            }

            _context.Entry(cashbook).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating cashbook entry");
            return BadRequest(ex.Message);
        }
    }

    // DELETE: api/Cashbook/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCashbook(int id)
    {
        var currentKhataBookId = _khataBookContext.GetCurrentKhataBookId();
        var cashbook = await _context.Cashbooks
            .FirstOrDefaultAsync(c => c.Id == id && c.KhataBookId == currentKhataBookId);
        if (cashbook == null)
        {
            return NotFound();
        }

        // Delete associated photo if exists
        if (!string.IsNullOrEmpty(cashbook.PhotoPath))
        {
            FileUploadHelper.DeleteFile(cashbook.PhotoPath);
        }

        _context.Cashbooks.Remove(cashbook);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool CashbookExists(int id)
    {
        var currentKhataBookId = _khataBookContext.GetCurrentKhataBookId();
        return _context.Cashbooks.Any(e => e.Id == id && e.KhataBookId == currentKhataBookId);
    }
}

public class CashbookCreateDto
{
    [Required]
    public string CashbookNo { get; set; } = null!;
    
    [Required]
    public DateTime Date { get; set; }
    
    [Required]
    public int CategoryId { get; set; }
    
    [Required]
    public int ItemId { get; set; }
    
    [Required]
    public string PaymentMode { get; set; } = null!;
    
    [Required]
    public decimal Amount { get; set; }
    
    public string? Remarks { get; set; }
    
    public IFormFile? Photo { get; set; }
}

public class CashbookUpdateDto
{
    [Required]
    public string CashbookNo { get; set; } = null!;
    
    [Required]
    public DateTime Date { get; set; }
    
    [Required]
    public int CategoryId { get; set; }
    
    [Required]
    public int ItemId { get; set; }
    
    [Required]
    public string PaymentMode { get; set; } = null!;
    
    [Required]
    public decimal Amount { get; set; }
    
    public string? Remarks { get; set; }
    
    public IFormFile? Photo { get; set; }
} 