using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models;

public class Bill
{
    public int BillId { get; set; }
    
    // KhataBook Foreign Key for data isolation
    public int KhataBookId { get; set; }
    public virtual KhataBook KhataBook { get; set; } = null!;
    
    [Required]
    public int CustomerId { get; set; }
    
    [ForeignKey("CustomerId")]
    public Customer? Customer { get; set; }
    
    [Required]
    public DateTime BillDate { get; set; }
    
    public DateTime? DueDate { get; set; }
    
    [Required]
    [Column(TypeName = "decimal(10,2)")]
    public decimal TotalAmount { get; set; }
    
    [Column(TypeName = "decimal(10,2)")]
    public decimal PaidAmount { get; set; } = 0.00m;
    
    [StringLength(20)]
    public string Status { get; set; } = "unpaid";
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

// DTO for creating bills - excludes navigation properties
public class CreateBillDto
{
    [Required]
    public int CustomerId { get; set; }
    
    [Required]
    public DateTime BillDate { get; set; }
    
    public DateTime? DueDate { get; set; }
    
    [Required]
    public decimal TotalAmount { get; set; }
    
    public decimal PaidAmount { get; set; } = 0.00m;
    
    [StringLength(20)]
    public string Status { get; set; } = "unpaid";
} 