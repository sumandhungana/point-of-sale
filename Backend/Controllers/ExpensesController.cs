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
public class ExpensesController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<ExpensesController> _logger;

    public ExpensesController(ApplicationDbContext context, ILogger<ExpensesController> logger)
    {
        _context = context;
        _logger = logger;
    }

    // GET: api/Expenses
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Expenses>>> GetExpenses()
    {
        return await _context.Expenses
            .Include(e => e.Category)
            .Include(e => e.Item)
            .OrderByDescending(e => e.CreatedAt)
            .ToListAsync();
    }

    // GET: api/Expenses/5
    [HttpGet("{id}")]
    public async Task<ActionResult<Expenses>> GetExpense(int id)
    {
        var expense = await _context.Expenses
            .Include(e => e.Category)
            .Include(e => e.Item)
            .FirstOrDefaultAsync(e => e.Id == id);

        if (expense == null)
        {
            return NotFound();
        }

        return expense;
    }

    // GET: api/Expenses/last
    [HttpGet("last")]
    public async Task<ActionResult<LastExpensesNoResponse>> GetLastExpensesNo()
    {
        try
        {
            var lastExpense = await _context.Expenses
                .OrderByDescending(e => e.CreatedAt)
                .FirstOrDefaultAsync();

            var lastExpensesNo = lastExpense?.ExpensesNo ?? "0";
            
            return Ok(new LastExpensesNoResponse
            {
                lastExpensesNo = lastExpensesNo
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching last expenses number");
            return BadRequest(ex.Message);
        }
    }

    // POST: api/Expenses
    [HttpPost]
    public async Task<ActionResult<Expenses>> CreateExpense([FromForm] ExpensesCreateDto expenseDto)
    {
        try
        {
            string photoPath = null;
            if (expenseDto.Photo != null)
            {
                photoPath = await FileUploadHelper.UploadFileAsync(expenseDto.Photo, _logger);
            }

            var expense = new Expenses
            {
                ExpensesNo = expenseDto.ExpensesNo,
                Date = expenseDto.Date.ToUniversalTime(),
                CategoryId = expenseDto.CategoryId,
                ItemId = expenseDto.ItemId,
                PaymentMode = expenseDto.PaymentMode,
                Amount = expenseDto.Amount,
                Remarks = expenseDto.Remarks,
                PhotoPath = photoPath,
                CreatedAt = DateTime.UtcNow
            };

            _context.Expenses.Add(expense);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetExpense), new { id = expense.Id }, expense);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating expense entry");
            return BadRequest(ex.Message);
        }
    }

    // PUT: api/Expenses/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateExpense(int id, [FromForm] ExpensesUpdateDto expenseDto)
    {
        try
        {
            var expense = await _context.Expenses.FindAsync(id);
            if (expense == null)
            {
                return NotFound();
            }

            expense.ExpensesNo = expenseDto.ExpensesNo;
            expense.Date = expenseDto.Date.ToUniversalTime();
            expense.CategoryId = expenseDto.CategoryId;
            expense.ItemId = expenseDto.ItemId;
            expense.PaymentMode = expenseDto.PaymentMode;
            expense.Amount = expenseDto.Amount;
            expense.Remarks = expenseDto.Remarks;

            if (expenseDto.Photo != null)
            {
                // Delete old photo if exists
                if (!string.IsNullOrEmpty(expense.PhotoPath))
                {
                    FileUploadHelper.DeleteFile(expense.PhotoPath);
                }
                // Upload new photo
                expense.PhotoPath = await FileUploadHelper.UploadFileAsync(expenseDto.Photo, _logger);
            }

            _context.Entry(expense).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return Ok(expense);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating expense entry");
            return BadRequest(ex.Message);
        }
    }

    // DELETE: api/Expenses/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteExpense(int id)
    {
        var expense = await _context.Expenses.FindAsync(id);
        if (expense == null)
        {
            return NotFound();
        }

        // Delete associated photo if exists
        if (!string.IsNullOrEmpty(expense.PhotoPath))
        {
            FileUploadHelper.DeleteFile(expense.PhotoPath);
        }

        _context.Expenses.Remove(expense);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool ExpenseExists(int id)
    {
        return _context.Expenses.Any(e => e.Id == id);
    }
}

public class ExpensesCreateDto
{
    [Required]
    public string ExpensesNo { get; set; } = null!;
    
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

public class ExpensesUpdateDto
{
    [Required]
    public string ExpensesNo { get; set; } = null!;
    
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

public class LastExpensesNoResponse
{
    public string lastExpensesNo { get; set; } = null!;
} 