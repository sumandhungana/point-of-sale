using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models;

public class Purchase
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }
    
    // KhataBook Foreign Key for data isolation
    public int KhataBookId { get; set; }
    public virtual KhataBook? KhataBook { get; set; }
    
    [Required]
    [StringLength(50)]
    public string PurchaseNo { get; set; } = null!;
    
    [Required]
    [Column(TypeName = "date")]
    public DateTime Date { get; set; }
    
    [Required]
    public int CategoryId { get; set; }
    
    [Required]
    public int ItemId { get; set; }
    
    [Required]
    [Column(TypeName = "varchar(20)")]
    public string PaymentMode { get; set; } = null!; // cash, card, bank_transfer, upi
    
    [Required]
    [Column(TypeName = "decimal(12,2)")]
    public decimal Amount { get; set; }
    
    public string? Remarks { get; set; }
    
    [StringLength(255)]
    public string? PhotoPath { get; set; }
    
    [Column(TypeName = "timestamp with time zone")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public Category? Category { get; set; }
    public Item? Item { get; set; }
} 