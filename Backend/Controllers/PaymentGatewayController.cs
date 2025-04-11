using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PaymentGatewayController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public PaymentGatewayController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/PaymentGateway
    [HttpGet]
    public async Task<ActionResult<IEnumerable<PaymentGateway>>> GetPaymentGateways()
    {
        return await _context.PaymentGateways.ToListAsync();
    }

    // GET: api/PaymentGateway/5
    [HttpGet("{id}")]
    public async Task<ActionResult<PaymentGateway>> GetPaymentGateway(int id)
    {
        var paymentGateway = await _context.PaymentGateways.FindAsync(id);

        if (paymentGateway == null)
        {
            return NotFound();
        }

        return paymentGateway;
    }

    // POST: api/PaymentGateway
    [HttpPost]
    public async Task<ActionResult<PaymentGateway>> CreatePaymentGateway(PaymentGateway paymentGateway)
    {
        _context.PaymentGateways.Add(paymentGateway);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetPaymentGateway), new { id = paymentGateway.Id }, paymentGateway);
    }

    // PUT: api/PaymentGateway/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdatePaymentGateway(int id, PaymentGateway paymentGateway)
    {
        if (id != paymentGateway.Id)
        {
            return BadRequest();
        }

        _context.Entry(paymentGateway).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!PaymentGatewayExists(id))
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

    // DELETE: api/PaymentGateway/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePaymentGateway(int id)
    {
        var paymentGateway = await _context.PaymentGateways.FindAsync(id);
        if (paymentGateway == null)
        {
            return NotFound();
        }

        _context.PaymentGateways.Remove(paymentGateway);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool PaymentGatewayExists(int id)
    {
        return _context.PaymentGateways.Any(e => e.Id == id);
    }
} 