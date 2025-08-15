using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models;

public class SalesBillItem
{
    [Key]
    public int Id { get; set; }
    
    // KhataBook Foreign Key for data isolation
    public int KhataBookId { get; set; }
    public virtual KhataBook KhataBook { get; set; } = null!;
    
    [Required]
    public int SalesBillId { get; set; }
    
    [Required]
    public int ItemId { get; set; }
    
    [Required]
    [Column(TypeName = "decimal(10,2)")]
    public decimal Quantity { get; set; }
    
    [Required]
    [Column(TypeName = "decimal(10,2)")]
    public decimal UnitPrice { get; set; }
    
    [Required]
    [Column(TypeName = "decimal(10,2)")]
    public decimal TotalPrice { get; set; }
    
    [Column(TypeName = "decimal(10,2)")]
    public decimal? Discount { get; set; }
    
    [Column(TypeName = "decimal(10,2)")]
    public decimal? Tax { get; set; }
    
    [Required]
    [Column(TypeName = "decimal(10,2)")]
    public decimal FinalPrice { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public SalesBill? SalesBill { get; set; }
    public Item? Item { get; set; }
} 