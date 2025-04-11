using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SmsGatewayController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public SmsGatewayController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/SmsGateway
    [HttpGet]
    public async Task<ActionResult<IEnumerable<SmsGateway>>> GetSmsGateways()
    {
        return await _context.SmsGateways.ToListAsync();
    }

    // GET: api/SmsGateway/5
    [HttpGet("{id}")]
    public async Task<ActionResult<SmsGateway>> GetSmsGateway(int id)
    {
        var smsGateway = await _context.SmsGateways.FindAsync(id);

        if (smsGateway == null)
        {
            return NotFound();
        }

        return smsGateway;
    }

    // POST: api/SmsGateway
    [HttpPost]
    public async Task<ActionResult<SmsGateway>> CreateSmsGateway(SmsGateway smsGateway)
    {
        _context.SmsGateways.Add(smsGateway);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetSmsGateway), new { id = smsGateway.Id }, smsGateway);
    }

    // PUT: api/SmsGateway/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateSmsGateway(int id, SmsGateway smsGateway)
    {
        if (id != smsGateway.Id)
        {
            return BadRequest();
        }

        _context.Entry(smsGateway).State = EntityState.Modified;

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
        var smsGateway = await _context.SmsGateways.FindAsync(id);
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
        return _context.SmsGateways.Any(e => e.Id == id);
    }
} 