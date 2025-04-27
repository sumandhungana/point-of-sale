using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BillController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<BillController> _logger;

    public BillController(ApplicationDbContext context, ILogger<BillController> logger)
    {
        _context = context;
        _logger = logger;
    }

    // GET: api/Bill
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Bill>>> GetBills()
    {
        return await _context.Bills
            .Include(b => b.Customer)
            .OrderByDescending(b => b.CreatedAt)
            .ToListAsync();
    }

    // GET: api/Bill/5
    [HttpGet("{id}")]
    public async Task<ActionResult<Bill>> GetBill(int id)
    {
        var bill = await _context.Bills
            .Include(b => b.Customer)
            .OrderByDescending(b => b.CreatedAt)
            .FirstOrDefaultAsync(b => b.BillId == id);

        if (bill == null)
        {
            return NotFound();
        }

        return bill;
    }

    // POST: api/Bill
    [HttpPost]
    public async Task<ActionResult<Bill>> CreateBill(Bill bill)
    {
        bill.CreatedAt = DateTime.UtcNow;
        bill.UpdatedAt = DateTime.UtcNow;
        
        _context.Bills.Add(bill);
        
        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException ex)
        {
            _logger.LogError(ex, "Error creating bill");
            throw;
        }

        return CreatedAtAction(nameof(GetBill), new { id = bill.BillId }, bill);
    }

    // PUT: api/Bill/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateBill(int id, Bill bill)
    {
        if (id != bill.BillId)
        {
            return BadRequest();
        }

        bill.UpdatedAt = DateTime.UtcNow;
        _context.Entry(bill).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!BillExists(id))
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

    // DELETE: api/Bill/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteBill(int id)
    {
        var bill = await _context.Bills.FindAsync(id);
        if (bill == null)
        {
            return NotFound();
        }

        _context.Bills.Remove(bill);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool BillExists(int id)
    {
        return _context.Bills.Any(e => e.BillId == id);
    }
} 