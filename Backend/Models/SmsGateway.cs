using System;
using System.ComponentModel.DataAnnotations;

namespace Backend.Models;

public class SmsGateway
{
    [Key]
    public int Id { get; set; }
    
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