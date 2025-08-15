using System;
using System.ComponentModel.DataAnnotations;

namespace Backend.Models;

public class AppSettings
{
    public int Id { get; set; }
    
    // KhataBook Foreign Key for data isolation
    public int KhataBookId { get; set; }
    public virtual KhataBook KhataBook { get; set; } = null!;
    
    [Required]
    [StringLength(7)]
    public string SideMenuBgColor { get; set; } = "#343a40";
    
    [Required]
    [StringLength(7)]
    public string SideMenuBgEndColor { get; set; } = "#212529";
    
    [Required]
    [StringLength(7)]
    public string SideMenuFontColor { get; set; } = "#ffffff";
    
    [Required]
    [StringLength(7)]
    public string SideMenuHoverFontColor { get; set; } = "#ffffff";
    
    [Required]
    [StringLength(7)]
    public string SideMenuHoverBgColor { get; set; } = "#495057";
    
    [Required]
    [StringLength(7)]
    public string TopMenuBgColor { get; set; } = "#ffffff";
    
    [Required]
    [StringLength(7)]
    public string TopMenuFontColor { get; set; } = "#212529";
    
    [Required]
    [StringLength(7)]
    public string AppBgColor { get; set; } = "#f8f9fa";
    
    [Required]
    [StringLength(7)]
    public string AppForegroundColor { get; set; } = "#212529";
    
    [StringLength(255)]
    public string? LogoPath { get; set; }
    
    [StringLength(255)]
    public string? FaviconPath { get; set; }
    
    [StringLength(255)]
    public string? LoginBgPath { get; set; }
    
    [Required]
    [StringLength(10)]
    public string Currency { get; set; } = "रु";
    
    [Required]
    [StringLength(10)]
    public string CurrencyPosition { get; set; } = "before";
    
    [Required]
    [StringLength(20)]
    public string DateFormat { get; set; } = "DD/MM/YYYY";
    
    [Required]
    [StringLength(20)]
    public string TimeFormat { get; set; } = "HH:mm";
    
    [Required]
    [StringLength(20)]
    public string NumberFormat { get; set; } = "1,234.56";
    
    [Required]
    [StringLength(50)]
    public string Language { get; set; } = "English";
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

// DTO for creating app settings - excludes navigation properties
public class CreateAppSettingsDto
{
    [Required]
    [StringLength(7)]
    public string SideMenuBgColor { get; set; } = "#343a40";
    
    [Required]
    [StringLength(7)]
    public string SideMenuBgEndColor { get; set; } = "#212529";
    
    [Required]
    [StringLength(7)]
    public string SideMenuFontColor { get; set; } = "#ffffff";
    
    [Required]
    [StringLength(7)]
    public string SideMenuHoverFontColor { get; set; } = "#ffffff";
    
    [Required]
    [StringLength(7)]
    public string SideMenuHoverBgColor { get; set; } = "#495057";
    
    [Required]
    [StringLength(7)]
    public string TopMenuBgColor { get; set; } = "#ffffff";
    
    [Required]
    [StringLength(7)]
    public string TopMenuFontColor { get; set; } = "#212529";
    
    [Required]
    [StringLength(7)]
    public string AppBgColor { get; set; } = "#f8f9fa";
    
    [Required]
    [StringLength(7)]
    public string AppForegroundColor { get; set; } = "#212529";
    
    [StringLength(255)]
    public string? LogoPath { get; set; }
    
    [StringLength(255)]
    public string? FaviconPath { get; set; }
    
    [StringLength(255)]
    public string? LoginBgPath { get; set; }
    
    [Required]
    [StringLength(10)]
    public string Currency { get; set; } = "रु";
    
    [Required]
    [StringLength(10)]
    public string CurrencyPosition { get; set; } = "before";
    
    [Required]
    [StringLength(20)]
    public string DateFormat { get; set; } = "DD/MM/YYYY";
    
    [Required]
    [StringLength(20)]
    public string TimeFormat { get; set; } = "HH:mm";
    
    [Required]
    [StringLength(20)]
    public string NumberFormat { get; set; } = "1,234.56";
    
    [Required]
    [StringLength(50)]
    public string Language { get; set; } = "English";
} 