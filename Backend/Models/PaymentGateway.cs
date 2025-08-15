using System;
using System.ComponentModel.DataAnnotations;

namespace Backend.Models;

public class PaymentGateway
{
    [Key]
    public int Id { get; set; }
    
    // KhataBook Foreign Key for data isolation
    public int KhataBookId { get; set; }
    public virtual KhataBook KhataBook { get; set; } = null!;
    
    [Required]
    [StringLength(100)]
    public string Name { get; set; } = null!;
    
    [Required]
    public string PaymentMode { get; set; } = null!; // credit_card, debit_card, upi, net_banking
    
    public string? Description { get; set; }
    
    public bool IsActive { get; set; } = false;
    
    [StringLength(255)]
    public string? ImagePath { get; set; }
    
    [Required]
    public string VerificationUrl { get; set; } = null!;
    
    [Required]
    public string PublicKey { get; set; } = null!;
    
    [Required]
    public string SecretKey { get; set; } = null!;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

// DTO for creating payment gateways - excludes navigation properties
public class CreatePaymentGatewayDto
{
    [Required]
    [StringLength(100)]
    public string Name { get; set; } = null!;
    
    [Required]
    public string PaymentMode { get; set; } = null!; // credit_card, debit_card, upi, net_banking
    
    public string? Description { get; set; }
    
    public bool IsActive { get; set; } = false;
    
    [StringLength(255)]
    public string? ImagePath { get; set; }
    
    [Required]
    public string VerificationUrl { get; set; } = null!;
    
    [Required]
    public string PublicKey { get; set; } = null!;
    
    [Required]
    public string SecretKey { get; set; } = null!;
} 