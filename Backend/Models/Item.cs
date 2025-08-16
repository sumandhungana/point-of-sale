using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models;

public class Item
{
    public int Id { get; set; }
    
    // KhataBook Foreign Key for data isolation
    public int KhataBookId { get; set; }
    public virtual KhataBook? KhataBook { get; set; }
    
    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;
    
    [Required]
    [StringLength(20)]
    public string PrimaryUnit { get; set; } = string.Empty;
    
    [StringLength(20)]
    public string? SecondaryUnit { get; set; }
    
    public bool IsSecondaryUnitEnabled { get; set; } = false;
    
    public int? CategoryId { get; set; }
    
    [ForeignKey("CategoryId")]
    public Category? Category { get; set; }
    
    [Column(TypeName = "decimal(10,2)")]
    public decimal? SalesPrice { get; set; }
    
    [Column(TypeName = "decimal(10,2)")]
    public decimal? PurchasePrice { get; set; }
    
    public bool TaxIncluded { get; set; } = false;
    
    [Column(TypeName = "decimal(10,2)")]
    public decimal OpeningStock { get; set; } = 0;
    
    [Column(TypeName = "decimal(10,2)")]
    public decimal? LowStockAlert { get; set; }
    
    [Column(TypeName = "decimal(5,2)")]
    public decimal? VatPercentage { get; set; }
    
    [Column(TypeName = "decimal(5,2)")]
    public decimal? VatPercentageToday { get; set; }
    
    public DateTime? VatDate { get; set; }
    
    public string? ImageUrl { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
} 