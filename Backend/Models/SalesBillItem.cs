using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models;

public class SalesBillItem
{
    [Key]
    public int Id { get; set; }
    
    [Required]
    public int SalesBillId { get; set; }
    
    [Required]
    public int ProductId { get; set; }
    
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
    
    [StringLength(500)]
    public string? Notes { get; set; }
    
    [ForeignKey("SalesBillId")]
    public SalesBill SalesBill { get; set; } = null!;
    
    [ForeignKey("ProductId")]
    public Product Product { get; set; } = null!;
} 