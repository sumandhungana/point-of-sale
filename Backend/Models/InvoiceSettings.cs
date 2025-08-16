using System;
using System.ComponentModel.DataAnnotations;

namespace Backend.Models;

public class InvoiceSettings
{
    public int Id { get; set; }
    
    // KhataBook Foreign Key for data isolation
    public int KhataBookId { get; set; }
    public virtual KhataBook? KhataBook { get; set; }
    
    public string? PremiumBill { get; set; }
    
    public string? ThermalBill { get; set; }
    
    public string? BasicBill { get; set; }
    
    public string? RegularPrinterField1 { get; set; }
    
    public string? RegularPrinterField2 { get; set; }
    
    public string? RegularPrinterField3 { get; set; }
    
    public string? ThermalPrinterField1 { get; set; }
    
    public string? ThermalPrinterField2 { get; set; }
    
    public string? ThermalPrinterField3 { get; set; }
    
    public bool ShowCompanyName { get; set; } = false;
    
    public bool ShowCompanyLogo { get; set; } = false;
    
    public bool ShowAddress { get; set; } = false;
    
    public bool ShowEmail { get; set; } = false;
    
    public bool ShowPhone { get; set; } = false;
    
    public bool ShowPanVat { get; set; } = false;
    
    public string? CompanyName { get; set; }
    
    public string? CompanyLogo { get; set; }
    
    public string? Address { get; set; }
    
    public string? Email { get; set; }
    
    public string? Phone { get; set; }
    
    public string? PanVat { get; set; }
    
    public bool ShowAuthorizedSignature { get; set; } = false;
    
    public string? AuthorizedSignatureText { get; set; }
    
    public string? ChangeSignature { get; set; }
    
    [StringLength(20)]
    public string? PaperSize { get; set; }
    
    [StringLength(20)]
    public string? Orientation { get; set; }
    
    [StringLength(20)]
    public string? CompanyNameTextSize { get; set; }
    
    [StringLength(20)]
    public string? InvoiceTaxSize { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

// DTO for creating invoice settings - excludes navigation properties
public class CreateInvoiceSettingsDto
{
    public string? PremiumBill { get; set; }
    
    public string? ThermalBill { get; set; }
    
    public string? BasicBill { get; set; }
    
    public string? RegularPrinterField1 { get; set; }
    
    public string? RegularPrinterField2 { get; set; }
    
    public string? RegularPrinterField3 { get; set; }
    
    public string? ThermalPrinterField1 { get; set; }
    
    public string? ThermalPrinterField2 { get; set; }
    
    public string? ThermalPrinterField3 { get; set; }
    
    public bool ShowCompanyName { get; set; } = false;
    
    public bool ShowCompanyLogo { get; set; } = false;
    
    public bool ShowAddress { get; set; } = false;
    
    public bool ShowEmail { get; set; } = false;
    
    public bool ShowPhone { get; set; } = false;
    
    public bool ShowPanVat { get; set; } = false;
    
    public string? CompanyName { get; set; }
    
    public string? CompanyLogo { get; set; }
    
    public string? Address { get; set; }
    
    public string? Email { get; set; }
    
    public string? Phone { get; set; }
    
    public string? PanVat { get; set; }
    
    public bool ShowAuthorizedSignature { get; set; } = false;
    
    public string? AuthorizedSignatureText { get; set; }
    
    public string? ChangeSignature { get; set; }
    
    [StringLength(20)]
    public string? PaperSize { get; set; }
    
    [StringLength(20)]
    public string? Orientation { get; set; }
    
    [StringLength(20)]
    public string? CompanyNameTextSize { get; set; }
    
    [StringLength(20)]
    public string? InvoiceTaxSize { get; set; }
}

// DTO for updating invoice settings - excludes navigation properties and system fields
public class UpdateInvoiceSettingsDto
{
    public string? PremiumBill { get; set; }
    
    public string? ThermalBill { get; set; }
    
    public string? BasicBill { get; set; }
    
    public string? RegularPrinterField1 { get; set; }
    
    public string? RegularPrinterField2 { get; set; }
    
    public string? RegularPrinterField3 { get; set; }
    
    public string? ThermalPrinterField1 { get; set; }
    
    public string? ThermalPrinterField2 { get; set; }
    
    public string? ThermalPrinterField3 { get; set; }
    
    public bool? ShowCompanyName { get; set; }
    
    public bool? ShowCompanyLogo { get; set; }
    
    public bool? ShowAddress { get; set; }
    
    public bool? ShowEmail { get; set; }
    
    public bool? ShowPhone { get; set; }
    
    public bool? ShowPanVat { get; set; }
    
    public string? CompanyName { get; set; }
    
    public string? CompanyLogo { get; set; }
    
    public string? Address { get; set; }
    
    public string? Email { get; set; }
    
    public string? Phone { get; set; }
    
    public string? PanVat { get; set; }
    
    public bool? ShowAuthorizedSignature { get; set; }
    
    public string? AuthorizedSignatureText { get; set; }
    
    public string? ChangeSignature { get; set; }
    
    public string? PaperSize { get; set; }
    
    public string? Orientation { get; set; }
    
    public string? CompanyNameTextSize { get; set; }
    
    public string? InvoiceTaxSize { get; set; }
} 