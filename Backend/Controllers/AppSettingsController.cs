using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AppSettingsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<AppSettingsController> _logger;

    public AppSettingsController(ApplicationDbContext context, ILogger<AppSettingsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    // GET: api/AppSettings
    [HttpGet]
    public async Task<ActionResult<IEnumerable<AppSettings>>> GetAppSettings()
    {
        return await _context.AppSettings.ToListAsync();
    }

    // GET: api/AppSettings/5
    [HttpGet("{id}")]
    public async Task<ActionResult<AppSettings>> GetAppSettings(int id)
    {
        var appSettings = await _context.AppSettings.FindAsync(id);

        if (appSettings == null)
        {
            return NotFound();
        }

        return appSettings;
    }

    // POST: api/AppSettings
    [HttpPost]
    public async Task<ActionResult<AppSettings>> CreateAppSettings(AppSettings appSettings)
    {
        appSettings.CreatedAt = DateTime.UtcNow;
        appSettings.UpdatedAt = DateTime.UtcNow;
        
        _context.AppSettings.Add(appSettings);
        
        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException ex)
        {
            _logger.LogError(ex, "Error creating app settings");
            throw;
        }

        return CreatedAtAction(nameof(GetAppSettings), new { id = appSettings.Id }, appSettings);
    }

    // PUT: api/AppSettings/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateAppSettings(int id, AppSettings appSettings)
    {
        if (id != appSettings.Id)
        {
            return BadRequest();
        }

        appSettings.UpdatedAt = DateTime.UtcNow;
        _context.Entry(appSettings).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!AppSettingsExists(id))
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

    // DELETE: api/AppSettings/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteAppSettings(int id)
    {
        var appSettings = await _context.AppSettings.FindAsync(id);
        if (appSettings == null)
        {
            return NotFound();
        }

        _context.AppSettings.Remove(appSettings);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool AppSettingsExists(int id)
    {
        return _context.AppSettings.Any(e => e.Id == id);
    }
} 