using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class InvoiceSettingsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<InvoiceSettingsController> _logger;

    public InvoiceSettingsController(ApplicationDbContext context, ILogger<InvoiceSettingsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    // GET: api/InvoiceSettings
    [HttpGet]
    public async Task<ActionResult<IEnumerable<InvoiceSettings>>> GetInvoiceSettings()
    {
        return await _context.InvoiceSettings.ToListAsync();
    }

    // GET: api/InvoiceSettings/5
    [HttpGet("{id}")]
    public async Task<ActionResult<InvoiceSettings>> GetInvoiceSettings(int id)
    {
        var invoiceSettings = await _context.InvoiceSettings.FindAsync(id);

        if (invoiceSettings == null)
        {
            return NotFound();
        }

        return invoiceSettings;
    }

    // POST: api/InvoiceSettings
    [HttpPost]
    public async Task<ActionResult<InvoiceSettings>> CreateInvoiceSettings(InvoiceSettings invoiceSettings)
    {
        invoiceSettings.CreatedAt = DateTime.UtcNow;
        invoiceSettings.UpdatedAt = DateTime.UtcNow;
        
        _context.InvoiceSettings.Add(invoiceSettings);
        
        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException ex)
        {
            _logger.LogError(ex, "Error creating invoice settings");
            throw;
        }

        return CreatedAtAction(nameof(GetInvoiceSettings), new { id = invoiceSettings.Id }, invoiceSettings);
    }

    // PUT: api/InvoiceSettings/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateInvoiceSettings(int id, InvoiceSettings invoiceSettings)
    {
        if (id != invoiceSettings.Id)
        {
            return BadRequest();
        }

        invoiceSettings.UpdatedAt = DateTime.UtcNow;
        _context.Entry(invoiceSettings).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!InvoiceSettingsExists(id))
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

    // DELETE: api/InvoiceSettings/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteInvoiceSettings(int id)
    {
        var invoiceSettings = await _context.InvoiceSettings.FindAsync(id);
        if (invoiceSettings == null)
        {
            return NotFound();
        }

        _context.InvoiceSettings.Remove(invoiceSettings);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool InvoiceSettingsExists(int id)
    {
        return _context.InvoiceSettings.Any(e => e.Id == id);
    }
} 