using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models;

public class Product
{
    [Key]
    public int Id { get; set; }
    
    [Required]
    [StringLength(255)]
    public string Name { get; set; } = null!;
    
    [StringLength(500)]
    public string? Description { get; set; }
    
    [Required]
    [Column(TypeName = "decimal(10,2)")]
    public decimal Price { get; set; }
    
    [Column(TypeName = "decimal(10,2)")]
    public decimal? Discount { get; set; }
    
    [Column(TypeName = "decimal(5,2)")]
    public decimal? Tax { get; set; }
    
    [Required]
    [Column(TypeName = "decimal(10,2)")]
    public decimal StockQuantity { get; set; }
    
    [StringLength(255)]
    public string? ImagePath { get; set; }
    
    public bool IsActive { get; set; } = true;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
} 