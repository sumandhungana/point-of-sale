using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;
using Backend.Services;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BillController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<BillController> _logger;
    private readonly IKhataBookContext _khataBookContext;

    public BillController(ApplicationDbContext context, ILogger<BillController> logger, IKhataBookContext khataBookContext)
    {
        _context = context;
        _logger = logger;
        _khataBookContext = khataBookContext;
    }

    // GET: api/Bill
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Bill>>> GetBills()
    {
        var currentKhataBookId = _khataBookContext.GetCurrentKhataBookId();
        return await _context.Bills
            .Include(b => b.Customer)
            .Where(b => b.KhataBookId == currentKhataBookId)
            .OrderByDescending(b => b.CreatedAt)
            .ToListAsync();
    }

    // GET: api/Bill/5
    [HttpGet("{id}")]
    public async Task<ActionResult<Bill>> GetBill(int id)
    {
        var currentKhataBookId = _khataBookContext.GetCurrentKhataBookId();
        var bill = await _context.Bills
            .Include(b => b.Customer)
            .FirstOrDefaultAsync(b => b.BillId == id && b.KhataBookId == currentKhataBookId);

        if (bill == null)
        {
            return NotFound();
        }

        return bill;
    }

    // POST: api/Bill
    [HttpPost]
    public async Task<ActionResult<Bill>> CreateBill(CreateBillDto billDto)
    {
        var bill = new Bill
        {
            KhataBookId = _khataBookContext.GetCurrentKhataBookId(),
            CustomerId = billDto.CustomerId,
            BillDate = billDto.BillDate,
            DueDate = billDto.DueDate,
            TotalAmount = billDto.TotalAmount,
            PaidAmount = billDto.PaidAmount,
            Status = billDto.Status,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        
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
        var currentKhataBookId = _khataBookContext.GetCurrentKhataBookId();
        var existingBill = await _context.Bills
            .FirstOrDefaultAsync(b => b.BillId == id && b.KhataBookId == currentKhataBookId);
        
        if (existingBill == null)
        {
            return NotFound();
        }

        existingBill.CustomerId = bill.CustomerId;
        existingBill.BillDate = bill.BillDate;
        existingBill.DueDate = bill.DueDate;
        existingBill.TotalAmount = bill.TotalAmount;
        existingBill.PaidAmount = bill.PaidAmount;
        existingBill.Status = bill.Status;
        existingBill.UpdatedAt = DateTime.UtcNow;

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
        var currentKhataBookId = _khataBookContext.GetCurrentKhataBookId();
        var bill = await _context.Bills
            .FirstOrDefaultAsync(b => b.BillId == id && b.KhataBookId == currentKhataBookId);
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
        var currentKhataBookId = _khataBookContext.GetCurrentKhataBookId();
        return _context.Bills.Any(e => e.BillId == id && e.KhataBookId == currentKhataBookId);
    }
} 