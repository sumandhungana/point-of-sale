using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models;

public class Bill
{
    public int BillId { get; set; }
    
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