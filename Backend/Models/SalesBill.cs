using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models;

public class SalesBill
{
    [Key]
    public int Id { get; set; }
    
    [Required]
    [StringLength(50)]
    public string BillNumber { get; set; } = null!;
    
    [Required]
    public DateTime BillDate { get; set; }
    
    [Required]
    [Column(TypeName = "decimal(10,2)")]
    public decimal TotalAmount { get; set; }
    
    [Column(TypeName = "decimal(10,2)")]
    public decimal? Discount { get; set; }
    
    [Column(TypeName = "decimal(10,2)")]
    public decimal? Tax { get; set; }
    
    [Required]
    [Column(TypeName = "decimal(10,2)")]
    public decimal GrandTotal { get; set; }
    
    [StringLength(500)]
    public string? Notes { get; set; }
    
    [Required]
    public string PaymentStatus { get; set; } = "pending"; // pending, paid, partially_paid
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    public ICollection<SalesBillItem> SalesBillItems { get; set; } = new List<SalesBillItem>();
} 