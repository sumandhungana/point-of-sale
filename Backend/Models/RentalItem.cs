using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models;

public class RentalItem
{
    public int Id { get; set; }
    
    // KhataBook Foreign Key for data isolation
    public int KhataBookId { get; set; }
    public virtual KhataBook? KhataBook { get; set; }
    
    [Required]
    [StringLength(255)]
    public string RentalItemName { get; set; } = string.Empty;
    
    [Required]
    [StringLength(20)]
    public string PhoneNumber { get; set; } = string.Empty;
    
    [Required]
    public string Address { get; set; } = string.Empty;
    
    [Required]
    [Column(TypeName = "decimal(10,2)")]
    public decimal RentalAmount { get; set; }
    
    [Required]
    [StringLength(20)]
    public string RentalPeriod { get; set; } = string.Empty;
    
    [Required]
    public DateTime StartDate { get; set; }
    
    [Required]
    public DateTime EndDate { get; set; }
    
    public string? Remarks { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

// DTO for creating rental items - excludes navigation properties
public class CreateRentalItemDto
{
    [Required]
    [StringLength(255)]
    public string RentalItemName { get; set; } = string.Empty;
    
    [Required]
    [StringLength(20)]
    public string PhoneNumber { get; set; } = string.Empty;
    
    [Required]
    public string Address { get; set; } = string.Empty;
    
    [Required]
    public decimal RentalAmount { get; set; }
    
    [Required]
    [StringLength(20)]
    public string RentalPeriod { get; set; } = string.Empty;
    
    [Required]
    public DateTime StartDate { get; set; }
    
    [Required]
    public DateTime EndDate { get; set; }
    
    public string? Remarks { get; set; }
}

// DTO for updating rental items - excludes navigation properties and system fields
public class UpdateRentalItemDto
{
    public string? RentalItemName { get; set; }
    public string? PhoneNumber { get; set; }
    public string? Address { get; set; }
    public decimal? RentalAmount { get; set; }
    public string? RentalPeriod { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string? Remarks { get; set; }
} 