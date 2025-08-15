using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;
using Backend.Services;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class InvoiceSettingsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<InvoiceSettingsController> _logger;
    private readonly IKhataBookContext _khataBookContext;

    public InvoiceSettingsController(ApplicationDbContext context, ILogger<InvoiceSettingsController> logger, IKhataBookContext khataBookContext)
    {
        _context = context;
        _logger = logger;
        _khataBookContext = khataBookContext;
    }

    // GET: api/InvoiceSettings
    [HttpGet]
    public async Task<ActionResult<IEnumerable<InvoiceSettings>>> GetInvoiceSettings()
    {
        var currentKhataBookId = _khataBookContext.GetCurrentKhataBookId();
        return await _context.InvoiceSettings
            .Where(i => i.KhataBookId == currentKhataBookId)
            .OrderByDescending(i => i.CreatedAt)
            .ToListAsync();
    }

    // GET: api/InvoiceSettings/5
    [HttpGet("{id}")]
    public async Task<ActionResult<InvoiceSettings>> GetInvoiceSettings(int id)
    {
        var currentKhataBookId = _khataBookContext.GetCurrentKhataBookId();
        var invoiceSettings = await _context.InvoiceSettings
            .FirstOrDefaultAsync(i => i.Id == id && i.KhataBookId == currentKhataBookId);

        if (invoiceSettings == null)
        {
            return NotFound();
        }

        return invoiceSettings;
    }

    // POST: api/InvoiceSettings
    [HttpPost]
    public async Task<ActionResult<InvoiceSettings>> CreateInvoiceSettings(CreateInvoiceSettingsDto invoiceSettingsDto)
    {
        var invoiceSettings = new InvoiceSettings
        {
            KhataBookId = _khataBookContext.GetCurrentKhataBookId(),
            PremiumBill = invoiceSettingsDto.PremiumBill,
            ThermalBill = invoiceSettingsDto.ThermalBill,
            BasicBill = invoiceSettingsDto.BasicBill,
            RegularPrinterField1 = invoiceSettingsDto.RegularPrinterField1,
            RegularPrinterField2 = invoiceSettingsDto.RegularPrinterField2,
            RegularPrinterField3 = invoiceSettingsDto.RegularPrinterField3,
            ThermalPrinterField1 = invoiceSettingsDto.ThermalPrinterField1,
            ThermalPrinterField2 = invoiceSettingsDto.ThermalPrinterField2,
            ThermalPrinterField3 = invoiceSettingsDto.ThermalPrinterField3,
            ShowCompanyName = invoiceSettingsDto.ShowCompanyName,
            ShowCompanyLogo = invoiceSettingsDto.ShowCompanyLogo,
            ShowAddress = invoiceSettingsDto.ShowAddress,
            ShowEmail = invoiceSettingsDto.ShowEmail,
            ShowPhone = invoiceSettingsDto.ShowPhone,
            ShowPanVat = invoiceSettingsDto.ShowPanVat,
            CompanyName = invoiceSettingsDto.CompanyName,
            CompanyLogo = invoiceSettingsDto.CompanyLogo,
            Address = invoiceSettingsDto.Address,
            Email = invoiceSettingsDto.Email,
            Phone = invoiceSettingsDto.Phone,
            PanVat = invoiceSettingsDto.PanVat,
            ShowAuthorizedSignature = invoiceSettingsDto.ShowAuthorizedSignature,
            AuthorizedSignatureText = invoiceSettingsDto.AuthorizedSignatureText,
            ChangeSignature = invoiceSettingsDto.ChangeSignature,
            PaperSize = invoiceSettingsDto.PaperSize,
            Orientation = invoiceSettingsDto.Orientation,
            CompanyNameTextSize = invoiceSettingsDto.CompanyNameTextSize,
            InvoiceTaxSize = invoiceSettingsDto.InvoiceTaxSize,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        
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
        var currentKhataBookId = _khataBookContext.GetCurrentKhataBookId();
        var existingInvoiceSettings = await _context.InvoiceSettings
            .FirstOrDefaultAsync(i => i.Id == id && i.KhataBookId == currentKhataBookId);
        
        if (existingInvoiceSettings == null)
        {
            return NotFound();
        }

        existingInvoiceSettings.PremiumBill = invoiceSettings.PremiumBill;
        existingInvoiceSettings.ThermalBill = invoiceSettings.ThermalBill;
        existingInvoiceSettings.BasicBill = invoiceSettings.BasicBill;
        existingInvoiceSettings.RegularPrinterField1 = invoiceSettings.RegularPrinterField1;
        existingInvoiceSettings.RegularPrinterField2 = invoiceSettings.RegularPrinterField2;
        existingInvoiceSettings.RegularPrinterField3 = invoiceSettings.RegularPrinterField3;
        existingInvoiceSettings.ThermalPrinterField1 = invoiceSettings.ThermalPrinterField1;
        existingInvoiceSettings.ThermalPrinterField2 = invoiceSettings.ThermalPrinterField2;
        existingInvoiceSettings.ThermalPrinterField3 = invoiceSettings.ThermalPrinterField3;
        existingInvoiceSettings.ShowCompanyName = invoiceSettings.ShowCompanyName;
        existingInvoiceSettings.ShowCompanyLogo = invoiceSettings.ShowCompanyLogo;
        existingInvoiceSettings.ShowAddress = invoiceSettings.ShowAddress;
        existingInvoiceSettings.ShowEmail = invoiceSettings.ShowEmail;
        existingInvoiceSettings.ShowPhone = invoiceSettings.ShowPhone;
        existingInvoiceSettings.ShowPanVat = invoiceSettings.ShowPanVat;
        existingInvoiceSettings.CompanyName = invoiceSettings.CompanyName;
        existingInvoiceSettings.CompanyLogo = invoiceSettings.CompanyLogo;
        existingInvoiceSettings.Address = invoiceSettings.Address;
        existingInvoiceSettings.Email = invoiceSettings.Email;
        existingInvoiceSettings.Phone = invoiceSettings.Phone;
        existingInvoiceSettings.PanVat = invoiceSettings.PanVat;
        existingInvoiceSettings.ShowAuthorizedSignature = invoiceSettings.ShowAuthorizedSignature;
        existingInvoiceSettings.AuthorizedSignatureText = invoiceSettings.AuthorizedSignatureText;
        existingInvoiceSettings.ChangeSignature = invoiceSettings.ChangeSignature;
        existingInvoiceSettings.PaperSize = invoiceSettings.PaperSize;
        existingInvoiceSettings.Orientation = invoiceSettings.Orientation;
        existingInvoiceSettings.CompanyNameTextSize = invoiceSettings.CompanyNameTextSize;
        existingInvoiceSettings.InvoiceTaxSize = invoiceSettings.InvoiceTaxSize;
        existingInvoiceSettings.UpdatedAt = DateTime.UtcNow;

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
        var currentKhataBookId = _khataBookContext.GetCurrentKhataBookId();
        var invoiceSettings = await _context.InvoiceSettings
            .FirstOrDefaultAsync(i => i.Id == id && i.KhataBookId == currentKhataBookId);
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
        var currentKhataBookId = _khataBookContext.GetCurrentKhataBookId();
        return _context.InvoiceSettings.Any(e => e.Id == id && e.KhataBookId == currentKhataBookId);
    }
} 