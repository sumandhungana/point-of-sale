using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models;

public class SalesBill
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }
    
    // KhataBook Foreign Key for data isolation
    public int KhataBookId { get; set; }
    public virtual KhataBook? KhataBook { get; set; }
    
    [Required]
    [StringLength(100)]
    public string BillNumber { get; set; } = null!;
    
    [Required]
    [Column(TypeName = "date")]
    public DateTime BillDate { get; set; }
    
    [Required]
    [ForeignKey("Customer")]
    public int CustomerId { get; set; }
    
    [Required]
    [Column(TypeName = "varchar(10)")]
    public string PaymentMode { get; set; } = null!; // cash, card, upi, bank
    
    [Required]
    [Column(TypeName = "decimal(10,2)")]
    public decimal Amount { get; set; }
    
    public string? Remarks { get; set; }
    
    [StringLength(255)]
    public string? PhotoPath { get; set; }
    
    [Column(TypeName = "timestamp with time zone")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    [Column(TypeName = "timestamp with time zone")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation property
    public virtual Customer? Customer { get; set; }
} 