using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models;

public class Service
{
    [Key]
    public int Id { get; set; }
    
    // KhataBook Foreign Key for data isolation
    public int KhataBookId { get; set; }
    public virtual KhataBook KhataBook { get; set; } = null!;
    
    [Required]
    [StringLength(255)]
    public string ServiceName { get; set; } = null!;
    
    [Required]
    [Column(TypeName = "decimal(10,2)")]
    public decimal Price { get; set; }
    
    public bool TaxIncluded { get; set; } = false;
    
    [Column(TypeName = "decimal(10,2)")]
    public decimal? TaxIncludedAmount { get; set; }
    
    [Column(TypeName = "decimal(5,2)")]
    public decimal? Tax { get; set; }
    
    [Column(TypeName = "decimal(5,2)")]
    public decimal? Vat { get; set; }
    
    [StringLength(255)]
    public string? ImagePath { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
} 