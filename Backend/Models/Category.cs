using System;
using System.ComponentModel.DataAnnotations;

namespace Backend.Models;

public class Category
{
    public int Id { get; set; }
    
    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;
    
    public string? Description { get; set; }
    
    [Required]
    public int CategoryType { get; set; } = 0; // 0: General, 1: Income, 2: Expense, 3: Purchase, 4: Cashbook

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
} 