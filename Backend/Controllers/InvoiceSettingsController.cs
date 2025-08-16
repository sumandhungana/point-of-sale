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
    public async Task<IActionResult> UpdateInvoiceSettings(int id, UpdateInvoiceSettingsDto updateDto)
    {
        var currentKhataBookId = _khataBookContext.GetCurrentKhataBookId();
        var existingInvoiceSettings = await _context.InvoiceSettings
            .FirstOrDefaultAsync(i => i.Id == id && i.KhataBookId == currentKhataBookId);
        
        if (existingInvoiceSettings == null)
        {
            return NotFound();
        }

        // Update only the provided properties
        if (updateDto.PremiumBill != null)
            existingInvoiceSettings.PremiumBill = updateDto.PremiumBill;
        if (updateDto.ThermalBill != null)
            existingInvoiceSettings.ThermalBill = updateDto.ThermalBill;
        if (updateDto.BasicBill != null)
            existingInvoiceSettings.BasicBill = updateDto.BasicBill;
        if (updateDto.RegularPrinterField1 != null)
            existingInvoiceSettings.RegularPrinterField1 = updateDto.RegularPrinterField1;
        if (updateDto.RegularPrinterField2 != null)
            existingInvoiceSettings.RegularPrinterField2 = updateDto.RegularPrinterField2;
        if (updateDto.RegularPrinterField3 != null)
            existingInvoiceSettings.RegularPrinterField3 = updateDto.RegularPrinterField3;
        if (updateDto.ThermalPrinterField1 != null)
            existingInvoiceSettings.ThermalPrinterField1 = updateDto.ThermalPrinterField1;
        if (updateDto.ThermalPrinterField2 != null)
            existingInvoiceSettings.ThermalPrinterField2 = updateDto.ThermalPrinterField2;
        if (updateDto.ThermalPrinterField3 != null)
            existingInvoiceSettings.ThermalPrinterField3 = updateDto.ThermalPrinterField3;
        if (updateDto.ShowCompanyName.HasValue)
            existingInvoiceSettings.ShowCompanyName = updateDto.ShowCompanyName.Value;
        if (updateDto.ShowCompanyLogo.HasValue)
            existingInvoiceSettings.ShowCompanyLogo = updateDto.ShowCompanyLogo.Value;
        if (updateDto.ShowAddress.HasValue)
            existingInvoiceSettings.ShowAddress = updateDto.ShowAddress.Value;
        if (updateDto.ShowEmail.HasValue)
            existingInvoiceSettings.ShowEmail = updateDto.ShowEmail.Value;
        if (updateDto.ShowPhone.HasValue)
            existingInvoiceSettings.ShowPhone = updateDto.ShowPhone.Value;
        if (updateDto.ShowPanVat.HasValue)
            existingInvoiceSettings.ShowPanVat = updateDto.ShowPanVat.Value;
        if (updateDto.CompanyName != null)
            existingInvoiceSettings.CompanyName = updateDto.CompanyName;
        if (updateDto.CompanyLogo != null)
            existingInvoiceSettings.CompanyLogo = updateDto.CompanyLogo;
        if (updateDto.Address != null)
            existingInvoiceSettings.Address = updateDto.Address;
        if (updateDto.Email != null)
            existingInvoiceSettings.Email = updateDto.Email;
        if (updateDto.Phone != null)
            existingInvoiceSettings.Phone = updateDto.Phone;
        if (updateDto.PanVat != null)
            existingInvoiceSettings.PanVat = updateDto.PanVat;
        if (updateDto.ShowAuthorizedSignature.HasValue)
            existingInvoiceSettings.ShowAuthorizedSignature = updateDto.ShowAuthorizedSignature.Value;
        if (updateDto.AuthorizedSignatureText != null)
            existingInvoiceSettings.AuthorizedSignatureText = updateDto.AuthorizedSignatureText;
        if (updateDto.ChangeSignature != null)
            existingInvoiceSettings.ChangeSignature = updateDto.ChangeSignature;
        if (updateDto.PaperSize != null)
            existingInvoiceSettings.PaperSize = updateDto.PaperSize;
        if (updateDto.Orientation != null)
            existingInvoiceSettings.Orientation = updateDto.Orientation;
        if (updateDto.CompanyNameTextSize != null)
            existingInvoiceSettings.CompanyNameTextSize = updateDto.CompanyNameTextSize;
        if (updateDto.InvoiceTaxSize != null)
            existingInvoiceSettings.InvoiceTaxSize = updateDto.InvoiceTaxSize;
        
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

        return Ok(new { message = "Invoice settings updated successfully" });
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