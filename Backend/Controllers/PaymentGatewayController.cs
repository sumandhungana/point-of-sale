using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;
using Backend.Services;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PaymentGatewayController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IKhataBookContext _khataBookContext;

    public PaymentGatewayController(ApplicationDbContext context, IKhataBookContext khataBookContext)
    {
        _context = context;
        _khataBookContext = khataBookContext;
    }

    // GET: api/PaymentGateway
    [HttpGet]
    public async Task<ActionResult<IEnumerable<PaymentGateway>>> GetPaymentGateways()
    {
        var currentKhataBookId = _khataBookContext.GetCurrentKhataBookId();
        return await _context.PaymentGateways
            .Where(p => p.KhataBookId == currentKhataBookId)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();
    }

    // GET: api/PaymentGateway/5
    [HttpGet("{id}")]
    public async Task<ActionResult<PaymentGateway>> GetPaymentGateway(int id)
    {
        var currentKhataBookId = _khataBookContext.GetCurrentKhataBookId();
        var paymentGateway = await _context.PaymentGateways
            .FirstOrDefaultAsync(p => p.Id == id && p.KhataBookId == currentKhataBookId);

        if (paymentGateway == null)
        {
            return NotFound();
        }

        return paymentGateway;
    }

    // POST: api/PaymentGateway
    [HttpPost]
    public async Task<ActionResult<PaymentGateway>> CreatePaymentGateway(CreatePaymentGatewayDto paymentGatewayDto)
    {
        var paymentGateway = new PaymentGateway
        {
            KhataBookId = _khataBookContext.GetCurrentKhataBookId(),
            Name = paymentGatewayDto.Name,
            PaymentMode = paymentGatewayDto.PaymentMode,
            Description = paymentGatewayDto.Description,
            IsActive = paymentGatewayDto.IsActive,
            ImagePath = paymentGatewayDto.ImagePath,
            VerificationUrl = paymentGatewayDto.VerificationUrl,
            PublicKey = paymentGatewayDto.PublicKey,
            SecretKey = paymentGatewayDto.SecretKey,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        
        _context.PaymentGateways.Add(paymentGateway);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetPaymentGateway), new { id = paymentGateway.Id }, paymentGateway);
    }

    // PUT: api/PaymentGateway/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdatePaymentGateway(int id, PaymentGateway paymentGateway)
    {
        var currentKhataBookId = _khataBookContext.GetCurrentKhataBookId();
        var existingPaymentGateway = await _context.PaymentGateways
            .FirstOrDefaultAsync(p => p.Id == id && p.KhataBookId == currentKhataBookId);
        
        if (existingPaymentGateway == null)
        {
            return NotFound();
        }

        existingPaymentGateway.Name = paymentGateway.Name;
        existingPaymentGateway.PaymentMode = paymentGateway.PaymentMode;
        existingPaymentGateway.Description = paymentGateway.Description;
        existingPaymentGateway.IsActive = paymentGateway.IsActive;
        existingPaymentGateway.ImagePath = paymentGateway.ImagePath;
        existingPaymentGateway.VerificationUrl = paymentGateway.VerificationUrl;
        existingPaymentGateway.PublicKey = paymentGateway.PublicKey;
        existingPaymentGateway.SecretKey = paymentGateway.SecretKey;
        existingPaymentGateway.UpdatedAt = DateTime.UtcNow;

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
        var currentKhataBookId = _khataBookContext.GetCurrentKhataBookId();
        var paymentGateway = await _context.PaymentGateways
            .FirstOrDefaultAsync(p => p.Id == id && p.KhataBookId == currentKhataBookId);
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
        var currentKhataBookId = _khataBookContext.GetCurrentKhataBookId();
        return _context.PaymentGateways.Any(e => e.Id == id && e.KhataBookId == currentKhataBookId);
    }
} 