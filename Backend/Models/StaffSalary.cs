using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models;

public class StaffSalary
{
    [Key]
    public int Id { get; set; }
    
    [Required]
    public int StaffId { get; set; }
    
    [Range(0, 11)]
    public int Month { get; set; }
    
    public int Year { get; set; }
    
    public DateTime SelectedDate { get; set; }
    
    public bool IsSlideOn { get; set; } = false;
    
    [Required]
    public DateTime CalculationDate { get; set; }
    
    [Required]
    public string SalaryType { get; set; } = null!; // monthly, weekly, daily
    
    [Required]
    [Column(TypeName = "decimal(10,2)")]
    public decimal Amount { get; set; }
    
    [Required]
    public string Permission { get; set; } = null!; // full, limited, restricted
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation property
    [ForeignKey("StaffId")]
    public Staff Staff { get; set; } = null!;
} 