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
    public async Task<IActionResult> UpdateAppSettings(int id, AppSettings appSettings)
    {
        var currentKhataBookId = _khataBookContext.GetCurrentKhataBookId();
        var existingAppSettings = await _context.AppSettings
            .FirstOrDefaultAsync(a => a.Id == id && a.KhataBookId == currentKhataBookId);
        
        if (existingAppSettings == null)
        {
            return NotFound();
        }

        existingAppSettings.SideMenuBgColor = appSettings.SideMenuBgColor;
        existingAppSettings.SideMenuBgEndColor = appSettings.SideMenuBgEndColor;
        existingAppSettings.SideMenuFontColor = appSettings.SideMenuFontColor;
        existingAppSettings.SideMenuHoverFontColor = appSettings.SideMenuHoverFontColor;
        existingAppSettings.SideMenuHoverBgColor = appSettings.SideMenuHoverBgColor;
        existingAppSettings.TopMenuBgColor = appSettings.TopMenuBgColor;
        existingAppSettings.TopMenuFontColor = appSettings.TopMenuFontColor;
        existingAppSettings.AppBgColor = appSettings.AppBgColor;
        existingAppSettings.AppForegroundColor = appSettings.AppForegroundColor;
        existingAppSettings.LogoPath = appSettings.LogoPath;
        existingAppSettings.FaviconPath = appSettings.FaviconPath;
        existingAppSettings.LoginBgPath = appSettings.LoginBgPath;
        existingAppSettings.Currency = appSettings.Currency;
        existingAppSettings.CurrencyPosition = appSettings.CurrencyPosition;
        existingAppSettings.DateFormat = appSettings.DateFormat;
        existingAppSettings.TimeFormat = appSettings.TimeFormat;
        existingAppSettings.NumberFormat = appSettings.NumberFormat;
        existingAppSettings.Language = appSettings.Language;
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
        return CreatedAtAction(nameof(GetAppSettings), new { id = appSettings.Id }, appSettings);

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