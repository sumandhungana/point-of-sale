using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;
using Backend.Services;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PaymentController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IKhataBookContext _khataBookContext;

    public PaymentController(ApplicationDbContext context, IKhataBookContext khataBookContext)
    {
        _context = context;
        _khataBookContext = khataBookContext;
    }

    // GET: api/Payment
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Payment>>> GetPayments()
    {
        var currentKhataBookId = _khataBookContext.GetCurrentKhataBookId();
        return await _context.Payments
            .Where(p => p.KhataBookId == currentKhataBookId)
            .OrderByDescending(p => p.PaymentDate)
            .ToListAsync();
    }

    // GET: api/Payment/5
    [HttpGet("{id}")]
    public async Task<ActionResult<Payment>> GetPayment(int id)
    {
        var currentKhataBookId = _khataBookContext.GetCurrentKhataBookId();
        var payment = await _context.Payments
            .FirstOrDefaultAsync(p => p.Id == id && p.KhataBookId == currentKhataBookId);

        if (payment == null)
        {
            return NotFound();
        }

        return payment;
    }

    // GET: api/Payment/Date/2024-04-11
    [HttpGet("Date/{date}")]
    public async Task<ActionResult<IEnumerable<Payment>>> GetPaymentsByDate(DateTime date)
    {
        var currentKhataBookId = _khataBookContext.GetCurrentKhataBookId();
        return await _context.Payments
            .Where(p => p.PaymentDate.Date == date.Date && p.KhataBookId == currentKhataBookId)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();
    }

    // GET: api/Payment/DateRange
    [HttpGet("DateRange")]
    public async Task<ActionResult<IEnumerable<Payment>>> GetPaymentsByDateRange(
        [FromQuery] DateTime startDate,
        [FromQuery] DateTime endDate)
    {
        var currentKhataBookId = _khataBookContext.GetCurrentKhataBookId();
        return await _context.Payments
            .Where(p => p.PaymentDate.Date >= startDate.Date && p.PaymentDate.Date <= endDate.Date && p.KhataBookId == currentKhataBookId)
            .OrderByDescending(p => p.PaymentDate)
            .ToListAsync();
    }

    // POST: api/Payment
    [HttpPost]
    public async Task<ActionResult<Payment>> CreatePayment(CreatePaymentDto paymentDto)
    {
        var payment = new Payment
        {
            KhataBookId = _khataBookContext.GetCurrentKhataBookId(),
            Amount = paymentDto.Amount,
            Notes = paymentDto.Notes,
            PaymentDate = paymentDto.PaymentDate,
            PaymentMode = paymentDto.PaymentMode,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        
        _context.Payments.Add(payment);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetPayment), new { id = payment.Id }, payment);
    }

    // PUT: api/Payment/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdatePayment(int id, Payment payment)
    {
        var currentKhataBookId = _khataBookContext.GetCurrentKhataBookId();
        var existingPayment = await _context.Payments
            .FirstOrDefaultAsync(p => p.Id == id && p.KhataBookId == currentKhataBookId);
        
        if (existingPayment == null)
        {
            return NotFound();
        }

        existingPayment.PaymentDate = payment.PaymentDate;
        existingPayment.Amount = payment.Amount;
        existingPayment.PaymentMode = payment.PaymentMode;
        existingPayment.Notes = payment.Notes;
        existingPayment.UpdatedAt = DateTime.UtcNow;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!PaymentExists(id))
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

    // DELETE: api/Payment/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePayment(int id)
    {
        var currentKhataBookId = _khataBookContext.GetCurrentKhataBookId();
        var payment = await _context.Payments
            .FirstOrDefaultAsync(p => p.Id == id && p.KhataBookId == currentKhataBookId);
        if (payment == null)
        {
            return NotFound();
        }

        _context.Payments.Remove(payment);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool PaymentExists(int id)
    {
        var currentKhataBookId = _khataBookContext.GetCurrentKhataBookId();
        return _context.Payments.Any(e => e.Id == id && e.KhataBookId == currentKhataBookId);
    }
} 