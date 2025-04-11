using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models;

public class Payment
{
    [Key]
    public int Id { get; set; }
    
    [Required]
    [Column(TypeName = "decimal(10,2)")]
    public decimal Amount { get; set; }
    
    public string? Notes { get; set; }
    
    [Required]
    public DateTime PaymentDate { get; set; }
    
    [Required]
    public string PaymentMode { get; set; } = null!; // cash, online
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
} 