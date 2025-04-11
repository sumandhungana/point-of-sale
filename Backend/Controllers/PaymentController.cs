using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PaymentController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public PaymentController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/Payment
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Payment>>> GetPayments()
    {
        return await _context.Payments
            .OrderByDescending(p => p.PaymentDate)
            .ToListAsync();
    }

    // GET: api/Payment/5
    [HttpGet("{id}")]
    public async Task<ActionResult<Payment>> GetPayment(int id)
    {
        var payment = await _context.Payments.FindAsync(id);

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
        return await _context.Payments
            .Where(p => p.PaymentDate.Date == date.Date)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();
    }

    // GET: api/Payment/DateRange
    [HttpGet("DateRange")]
    public async Task<ActionResult<IEnumerable<Payment>>> GetPaymentsByDateRange(
        [FromQuery] DateTime startDate,
        [FromQuery] DateTime endDate)
    {
        return await _context.Payments
            .Where(p => p.PaymentDate.Date >= startDate.Date && p.PaymentDate.Date <= endDate.Date)
            .OrderByDescending(p => p.PaymentDate)
            .ToListAsync();
    }

    // POST: api/Payment
    [HttpPost]
    public async Task<ActionResult<Payment>> CreatePayment(Payment payment)
    {
        _context.Payments.Add(payment);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetPayment), new { id = payment.Id }, payment);
    }

    // PUT: api/Payment/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdatePayment(int id, Payment payment)
    {
        if (id != payment.Id)
        {
            return BadRequest();
        }

        _context.Entry(payment).State = EntityState.Modified;

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
        var payment = await _context.Payments.FindAsync(id);
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
        return _context.Payments.Any(e => e.Id == id);
    }
} 