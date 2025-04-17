using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;
using Backend.Helpers;
using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class IncomeController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<IncomeController> _logger;

    public IncomeController(ApplicationDbContext context, ILogger<IncomeController> logger)
    {
        _context = context;
        _logger = logger;
    }

    // GET: api/Income
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Income>>> GetIncomes()
    {
        return await _context.Incomes
            .Include(i => i.Category)
            .Include(i => i.Item)
            .OrderByDescending(i => i.CreatedAt)
            .ToListAsync();
    }

    // GET: api/Income/5
    [HttpGet("{id}")]
    public async Task<ActionResult<Income>> GetIncome(int id)
    {
        var income = await _context.Incomes
            .Include(i => i.Category)
            .Include(i => i.Item)
            .FirstOrDefaultAsync(i => i.Id == id);

        if (income == null)
        {
            return NotFound();
        }

        return income;
    }

    // POST: api/Income
    [HttpPost]
    public async Task<ActionResult<Income>> CreateIncome([FromForm] IncomeCreateDto incomeDto)
    {
        try
        {   
            // Validate that the Item exists
            var item = await _context.Items.FindAsync(incomeDto.ItemId);
            if (item == null)
            {
                return BadRequest($"Item with ID {incomeDto.ItemId} does not exist");
            }

            // Validate that the Category exists
            var category = await _context.Categories.FindAsync(incomeDto.CategoryId);
            if (category == null)
            {
                return BadRequest($"Category with ID {incomeDto.CategoryId} does not exist");
            }

            var income = new Income
            {
                IncomeNo = incomeDto.IncomeNo,
                Date = incomeDto.Date.ToUniversalTime(),
                CategoryId = incomeDto.CategoryId,
                ItemId = incomeDto.ItemId,
                PaymentMode = incomeDto.PaymentMode,
                Amount = incomeDto.Amount,
                Remarks = incomeDto.Remarks,
                CreatedAt = DateTime.UtcNow
            };

            if (incomeDto.Photo != null)
            {
                income.PhotoPath = await FileUploadHelper.UploadFileAsync(incomeDto.Photo, _logger);
            }

            _context.Incomes.Add(income);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetIncome), new { id = income.Id }, income);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating income entry");
            return BadRequest(ex.Message);
        }
    }

    // PUT: api/Income/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateIncome(int id, [FromForm] IncomeUpdateDto incomeDto)
    {
        try
        {
            var income = await _context.Incomes.FindAsync(id);
            if (income == null)
            {
                return NotFound();
            }

            income.IncomeNo = incomeDto.IncomeNo;
            income.Date = incomeDto.Date.ToUniversalTime();
            income.CategoryId = incomeDto.CategoryId;
            income.ItemId = incomeDto.ItemId;
            income.PaymentMode = incomeDto.PaymentMode;
            income.Amount = incomeDto.Amount;
            income.Remarks = incomeDto.Remarks;

            if (incomeDto.Photo != null)
            {
                // Delete old photo if exists
                if (!string.IsNullOrEmpty(income.PhotoPath))
                {
                    FileUploadHelper.DeleteFile(income.PhotoPath);
                }
                // Upload new photo
                income.PhotoPath = await FileUploadHelper.UploadFileAsync(incomeDto.Photo, _logger);
            }

            _context.Entry(income).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating income entry");
            return BadRequest(ex.Message);
        }
    }

    // DELETE: api/Income/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteIncome(int id)
    {
        var income = await _context.Incomes.FindAsync(id);
        if (income == null)
        {
            return NotFound();
        }

        // Delete associated photo if exists
        if (!string.IsNullOrEmpty(income.PhotoPath))
        {
            FileUploadHelper.DeleteFile(income.PhotoPath);
        }

        _context.Incomes.Remove(income);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool IncomeExists(int id)
    {
        return _context.Incomes.Any(e => e.Id == id);
    }
}

public class IncomeCreateDto
{
    [Required]
    public string IncomeNo { get; set; } = null!;
    
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

public class IncomeUpdateDto
{
    [Required]
    public string IncomeNo { get; set; } = null!;
    
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