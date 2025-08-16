using System;
using System.ComponentModel.DataAnnotations;

namespace Backend.Models;

public class SmsGateway
{
    [Key]
    public int Id { get; set; }
    
    // KhataBook Foreign Key for data isolation
    public int KhataBookId { get; set; }
    public virtual KhataBook? KhataBook { get; set; }
    
    [Required]
    [StringLength(100)]
    public string PartnerName { get; set; } = null!;
    
    public bool Active { get; set; } = false;
    
    [Required]
    [StringLength(100)]
    public string Form { get; set; } = null!;
    
    [Required]
    [StringLength(255)]
    public string Token { get; set; } = null!;
    
    [Required]
    public string ApiUrl { get; set; } = null!;
    
    public string? TestSms { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

// DTO for creating SMS gateways - excludes navigation properties
public class CreateSmsGatewayDto
{
    [Required]
    [StringLength(100)]
    public string PartnerName { get; set; } = null!;
    
    public bool Active { get; set; } = false;
    
    [Required]
    [StringLength(100)]
    public string Form { get; set; } = null!;
    
    [Required]
    [StringLength(255)]
    public string Token { get; set; } = null!;
    
    [Required]
    public string ApiUrl { get; set; } = null!;
    
    public string? TestSms { get; set; }
}

// DTO for updating SMS gateways - excludes navigation properties and system fields
public class UpdateSmsGatewayDto
{
    public string? PartnerName { get; set; }
    public bool? Active { get; set; }
    public string? Form { get; set; }
    public string? Token { get; set; }
    public string? ApiUrl { get; set; }
    public string? TestSms { get; set; }
} 