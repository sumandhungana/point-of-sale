using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;
using Backend.Services;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SmsGatewayController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IKhataBookContext _khataBookContext;

    public SmsGatewayController(ApplicationDbContext context, IKhataBookContext khataBookContext)
    {
        _context = context;
        _khataBookContext = khataBookContext;
    }

    // GET: api/SmsGateway
    [HttpGet]
    public async Task<ActionResult<IEnumerable<SmsGateway>>> GetSmsGateways()
    {
        var currentKhataBookId = _khataBookContext.GetCurrentKhataBookId();
        return await _context.SmsGateways
            .Where(s => s.KhataBookId == currentKhataBookId)
            .OrderByDescending(s => s.CreatedAt)
            .ToListAsync();
    }

    // GET: api/SmsGateway/5
    [HttpGet("{id}")]
    public async Task<ActionResult<SmsGateway>> GetSmsGateway(int id)
    {
        var currentKhataBookId = _khataBookContext.GetCurrentKhataBookId();
        var smsGateway = await _context.SmsGateways
            .FirstOrDefaultAsync(s => s.Id == id && s.KhataBookId == currentKhataBookId);

        if (smsGateway == null)
        {
            return NotFound();
        }

        return smsGateway;
    }

    // POST: api/SmsGateway
    [HttpPost]
    public async Task<ActionResult<SmsGateway>> CreateSmsGateway(CreateSmsGatewayDto smsGatewayDto)
    {
        var smsGateway = new SmsGateway
        {
            KhataBookId = _khataBookContext.GetCurrentKhataBookId(),
            PartnerName = smsGatewayDto.PartnerName,
            Active = smsGatewayDto.Active,
            Form = smsGatewayDto.Form,
            Token = smsGatewayDto.Token,
            ApiUrl = smsGatewayDto.ApiUrl,
            TestSms = smsGatewayDto.TestSms,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        
        _context.SmsGateways.Add(smsGateway);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetSmsGateway), new { id = smsGateway.Id }, smsGateway);
    }

    // PUT: api/SmsGateway/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateSmsGateway(int id, SmsGateway smsGateway)
    {
        var currentKhataBookId = _khataBookContext.GetCurrentKhataBookId();
        var existingSmsGateway = await _context.SmsGateways
            .FirstOrDefaultAsync(s => s.Id == id && s.KhataBookId == currentKhataBookId);
        
        if (existingSmsGateway == null)
        {
            return NotFound();
        }

        existingSmsGateway.PartnerName = smsGateway.PartnerName;
        existingSmsGateway.Active = smsGateway.Active;
        existingSmsGateway.Form = smsGateway.Form;
        existingSmsGateway.Token = smsGateway.Token;
        existingSmsGateway.ApiUrl = smsGateway.ApiUrl;
        existingSmsGateway.TestSms = smsGateway.TestSms;
        existingSmsGateway.UpdatedAt = DateTime.UtcNow;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!SmsGatewayExists(id))
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

    // DELETE: api/SmsGateway/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteSmsGateway(int id)
    {
        var currentKhataBookId = _khataBookContext.GetCurrentKhataBookId();
        var smsGateway = await _context.SmsGateways
            .FirstOrDefaultAsync(s => s.Id == id && s.KhataBookId == currentKhataBookId);
        if (smsGateway == null)
        {
            return NotFound();
        }

        _context.SmsGateways.Remove(smsGateway);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool SmsGatewayExists(int id)
    {
        var currentKhataBookId = _khataBookContext.GetCurrentKhataBookId();
        return _context.SmsGateways.Any(e => e.Id == id && e.KhataBookId == currentKhataBookId);
    }
} 