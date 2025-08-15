using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;
using Backend.Services;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TransactionController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<TransactionController> _logger;
    private readonly IKhataBookContext _khataBookContext;

    public TransactionController(ApplicationDbContext context, ILogger<TransactionController> logger, IKhataBookContext khataBookContext)
    {
        _context = context;
        _logger = logger;
        _khataBookContext = khataBookContext;
    }

    // GET: api/Transaction
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Transaction>>> GetTransactions()
    {
        var currentKhataBookId = _khataBookContext.GetCurrentKhataBookId();
        return await _context.Transactions
            .Where(t => t.KhataBookId == currentKhataBookId)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();
    }

    // GET: api/Transaction/5
    [HttpGet("{id}")]
    public async Task<ActionResult<Transaction>> GetTransaction(int id)
    {
        var currentKhataBookId = _khataBookContext.GetCurrentKhataBookId();
        var transaction = await _context.Transactions
            .FirstOrDefaultAsync(t => t.Id == id && t.KhataBookId == currentKhataBookId);

        if (transaction == null)
        {
            return NotFound();
        }

        return transaction;
    }

    // POST: api/Transaction
    [HttpPost]
    public async Task<ActionResult<Transaction>> CreateTransaction(CreateTransactionDto transactionDto)
    {
        var transaction = new Transaction
        {
            KhataBookId = _khataBookContext.GetCurrentKhataBookId(),
            Description = transactionDto.Description,
            Amount = transactionDto.Amount,
            TransactionDate = transactionDto.TransactionDate,
            TransactionType = transactionDto.TransactionType,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        
        _context.Transactions.Add(transaction);
        
        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException ex)
        {
            _logger.LogError(ex, "Error creating transaction");
            throw;
        }

        return CreatedAtAction(nameof(GetTransaction), new { id = transaction.Id }, transaction);
    }

    // PUT: api/Transaction/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateTransaction(int id, Transaction transaction)
    {
        var currentKhataBookId = _khataBookContext.GetCurrentKhataBookId();
        var existingTransaction = await _context.Transactions
            .FirstOrDefaultAsync(t => t.Id == id && t.KhataBookId == currentKhataBookId);
        
        if (existingTransaction == null)
        {
            return NotFound();
        }

        existingTransaction.TransactionType = transaction.TransactionType;
        existingTransaction.Amount = transaction.Amount;
        existingTransaction.Description = transaction.Description;
        existingTransaction.UpdatedAt = DateTime.UtcNow;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!TransactionExists(id))
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

    // DELETE: api/Transaction/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTransaction(int id)
    {
        var currentKhataBookId = _khataBookContext.GetCurrentKhataBookId();
        var transaction = await _context.Transactions
            .FirstOrDefaultAsync(t => t.Id == id && t.KhataBookId == currentKhataBookId);
        if (transaction == null)
        {
            return NotFound();
        }

        _context.Transactions.Remove(transaction);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool TransactionExists(int id)
    {
        var currentKhataBookId = _khataBookContext.GetCurrentKhataBookId();
        return _context.Transactions.Any(e => e.Id == id && e.KhataBookId == currentKhataBookId);
    }
} 