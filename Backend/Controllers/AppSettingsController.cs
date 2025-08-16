using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;
using Backend.Services;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AppSettingsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<AppSettingsController> _logger;
    private readonly IKhataBookContext _khataBookContext;

    public AppSettingsController(ApplicationDbContext context, ILogger<AppSettingsController> logger, IKhataBookContext khataBookContext)
    {
        _context = context;
        _logger = logger;
        _khataBookContext = khataBookContext;
    }

    // GET: api/AppSettings
    [HttpGet]
    public async Task<ActionResult<IEnumerable<AppSettings>>> GetAppSettings()
    {
        var currentKhataBookId = _khataBookContext.GetCurrentKhataBookId();
        return await _context.AppSettings
            .Where(a => a.KhataBookId == currentKhataBookId)
            .ToListAsync();
    }

    // GET: api/AppSettings/5
    [HttpGet("{id}")]
    public async Task<ActionResult<AppSettings>> GetAppSettings(int id)
    {
        var currentKhataBookId = _khataBookContext.GetCurrentKhataBookId();
        var appSettings = await _context.AppSettings
            .FirstOrDefaultAsync(a => a.Id == id && a.KhataBookId == currentKhataBookId);

        if (appSettings == null)
        {
            return NotFound();
        }

        return appSettings;
    }

    // POST: api/AppSettings
    [HttpPost]
    public async Task<ActionResult<AppSettings>> CreateAppSettings(CreateAppSettingsDto appSettingsDto)
    {
        var appSettings = new AppSettings
        {
            KhataBookId = _khataBookContext.GetCurrentKhataBookId(),
            SideMenuBgColor = appSettingsDto.SideMenuBgColor,
            SideMenuBgEndColor = appSettingsDto.SideMenuBgEndColor,
            SideMenuFontColor = appSettingsDto.SideMenuFontColor,
            SideMenuHoverFontColor = appSettingsDto.SideMenuHoverFontColor,
            SideMenuHoverBgColor = appSettingsDto.SideMenuHoverBgColor,
            TopMenuBgColor = appSettingsDto.TopMenuBgColor,
            TopMenuFontColor = appSettingsDto.TopMenuFontColor,
            AppBgColor = appSettingsDto.AppBgColor,
            AppForegroundColor = appSettingsDto.AppForegroundColor,
            LogoPath = appSettingsDto.LogoPath,
            FaviconPath = appSettingsDto.FaviconPath,
            LoginBgPath = appSettingsDto.LoginBgPath,
            Currency = appSettingsDto.Currency,
            CurrencyPosition = appSettingsDto.CurrencyPosition,
            DateFormat = appSettingsDto.DateFormat,
            TimeFormat = appSettingsDto.TimeFormat,
            NumberFormat = appSettingsDto.NumberFormat,
            Language = appSettingsDto.Language,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        
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
    public async Task<IActionResult> UpdateAppSettings(int id, UpdateAppSettingsDto updateDto)
    {
        var currentKhataBookId = _khataBookContext.GetCurrentKhataBookId();
        var existingAppSettings = await _context.AppSettings
            .FirstOrDefaultAsync(a => a.Id == id && a.KhataBookId == currentKhataBookId);
        
        if (existingAppSettings == null)
        {
            return NotFound();
        }

        // Update only the provided properties
        if (!string.IsNullOrEmpty(updateDto.SideMenuBgColor))
            existingAppSettings.SideMenuBgColor = updateDto.SideMenuBgColor;
        if (!string.IsNullOrEmpty(updateDto.SideMenuBgEndColor))
            existingAppSettings.SideMenuBgEndColor = updateDto.SideMenuBgEndColor;
        if (!string.IsNullOrEmpty(updateDto.SideMenuFontColor))
            existingAppSettings.SideMenuFontColor = updateDto.SideMenuFontColor;
        if (!string.IsNullOrEmpty(updateDto.SideMenuHoverFontColor))
            existingAppSettings.SideMenuHoverFontColor = updateDto.SideMenuHoverFontColor;
        if (!string.IsNullOrEmpty(updateDto.SideMenuHoverBgColor))
            existingAppSettings.SideMenuHoverBgColor = updateDto.SideMenuHoverBgColor;
        if (!string.IsNullOrEmpty(updateDto.TopMenuBgColor))
            existingAppSettings.TopMenuBgColor = updateDto.TopMenuBgColor;
        if (!string.IsNullOrEmpty(updateDto.TopMenuFontColor))
            existingAppSettings.TopMenuFontColor = updateDto.TopMenuFontColor;
        if (!string.IsNullOrEmpty(updateDto.AppBgColor))
            existingAppSettings.AppBgColor = updateDto.AppBgColor;
        if (!string.IsNullOrEmpty(updateDto.AppForegroundColor))
            existingAppSettings.AppForegroundColor = updateDto.AppForegroundColor;
        if (updateDto.LogoPath != null)
            existingAppSettings.LogoPath = updateDto.LogoPath;
        if (updateDto.FaviconPath != null)
            existingAppSettings.FaviconPath = updateDto.FaviconPath;
        if (updateDto.LoginBgPath != null)
            existingAppSettings.LoginBgPath = updateDto.LoginBgPath;
        if (!string.IsNullOrEmpty(updateDto.Currency))
            existingAppSettings.Currency = updateDto.Currency;
        if (!string.IsNullOrEmpty(updateDto.CurrencyPosition))
            existingAppSettings.CurrencyPosition = updateDto.CurrencyPosition;
        if (!string.IsNullOrEmpty(updateDto.DateFormat))
            existingAppSettings.DateFormat = updateDto.DateFormat;
        if (!string.IsNullOrEmpty(updateDto.TimeFormat))
            existingAppSettings.TimeFormat = updateDto.TimeFormat;
        if (!string.IsNullOrEmpty(updateDto.NumberFormat))
            existingAppSettings.NumberFormat = updateDto.NumberFormat;
        if (!string.IsNullOrEmpty(updateDto.Language))
            existingAppSettings.Language = updateDto.Language;
        
        existingAppSettings.UpdatedAt = DateTime.UtcNow;

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
        return Ok(new { message = "App settings updated successfully" });
    }

    // DELETE: api/AppSettings/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteAppSettings(int id)
    {
        var currentKhataBookId = _khataBookContext.GetCurrentKhataBookId();
        var appSettings = await _context.AppSettings
            .FirstOrDefaultAsync(a => a.Id == id && a.KhataBookId == currentKhataBookId);
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
        var currentKhataBookId = _khataBookContext.GetCurrentKhataBookId();
        return _context.AppSettings.Any(e => e.Id == id && e.KhataBookId == currentKhataBookId);
    }
} 