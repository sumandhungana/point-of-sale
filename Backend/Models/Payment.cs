using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models;

public class Payment
{
    [Key]
    public int Id { get; set; }
    
    // KhataBook Foreign Key for data isolation
    public int KhataBookId { get; set; }
    public virtual KhataBook? KhataBook { get; set; }
    
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

// DTO for creating payments - excludes navigation properties
public class CreatePaymentDto
{
    [Required]
    public decimal Amount { get; set; }
    
    public string? Notes { get; set; }
    
    [Required]
    public DateTime PaymentDate { get; set; }
    
    [Required]
    public string PaymentMode { get; set; } = null!; // cash, online
}

// DTO for updating payments - excludes navigation properties and system fields
public class UpdatePaymentDto
{
    public decimal? Amount { get; set; }
    public string? Notes { get; set; }
    public DateTime? PaymentDate { get; set; }
    public string? PaymentMode { get; set; }
} 