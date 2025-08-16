using System;
using System.ComponentModel.DataAnnotations;

namespace Backend.Models;

public class Category
{
    public int Id { get; set; }
    
    // KhataBook Foreign Key for data isolation
    public int KhataBookId { get; set; }
    public virtual KhataBook? KhataBook { get; set; }
    
    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;
    
    public string? Description { get; set; }
    
    [Required]
    public int CategoryType { get; set; } = 0; // 0: General, 1: Income, 2: Expense, 3: Purchase, 4: Cashbook

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

// DTO for creating categories - excludes navigation properties
public class CreateCategoryDto
{
    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;
    
    public string? Description { get; set; }
    
    [Required]
    public int CategoryType { get; set; } = 0; // 0: General, 1: Income, 2: Expense, 3: Purchase, 4: Cashbook
}

// DTO for updating categories - excludes navigation properties and system fields
public class UpdateCategoryDto
{
    public string? Name { get; set; }
    
    public string? Description { get; set; }
    
    public int? CategoryType { get; set; }
} 